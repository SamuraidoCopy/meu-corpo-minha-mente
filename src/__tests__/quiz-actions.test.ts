// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  getSupabaseAdmin: vi.fn(),
  checkQuizSubmissionRateLimit: vi.fn(),
  addLeadToBrevo: vi.fn(),
  sendQuizResultEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/lib/supabase/admin-access", () => ({
  getSupabaseAdmin: mocks.getSupabaseAdmin,
}));
vi.mock("@/lib/quiz-rate-limit", () => ({
  checkQuizSubmissionRateLimit: mocks.checkQuizSubmissionRateLimit,
}));
vi.mock("@/lib/brevo", () => ({
  addLeadToBrevo: mocks.addLeadToBrevo,
  sendQuizResultEmail: mocks.sendQuizResultEmail,
}));

import { saveQuizLead } from "@/app/quiz/actions";
import { getQuizQuestions } from "@/lib/quiz-data";

const SUBMISSION_ID = "123e4567-e89b-42d3-a456-426614174000";

function buildSubmission(overrides: Record<string, unknown> = {}) {
  return {
    submissionId: SUBMISSION_ID,
    name: "Maria da Silva",
    email: "maria@example.com",
    consent: true,
    element: "Fogo",
    answers: getQuizQuestions().map((question) => ({
      questionId: question.id,
      answer: false,
    })),
    tracking: { utm_source: "instagram" },
    website: "",
    ...overrides,
  };
}

function createAdmin(options: {
  insertError?: { code: string } | null;
  existingError?: { code: string } | null;
} = {}) {
  const insertSingle = vi.fn().mockResolvedValue({
    data: options.insertError ? null : { id: "lead-new" },
    error: options.insertError ?? null,
  });
  const insertSelect = vi.fn(() => ({ single: insertSingle }));
  const insert = vi.fn(() => ({ select: insertSelect }));

  const existingSingle = vi.fn().mockResolvedValue({
    data: options.existingError
      ? null
      : {
          id: "lead-existing",
          brevo_synced_at: "2026-07-10T10:00:00.000Z",
          result_email_sent_at: "2026-07-10T10:00:01.000Z",
        },
    error: options.existingError ?? null,
  });
  const selectEq = vi.fn(() => ({ single: existingSingle }));
  const select = vi.fn(() => ({ eq: selectEq }));

  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq: updateEq }));

  const from = vi.fn(() => ({ insert, select, update }));
  return {
    admin: { from, rpc: vi.fn() },
    spies: { from, insert, insertSelect, select, selectEq, update },
  };
}

function expectNoBrevoEffects() {
  expect(mocks.addLeadToBrevo).not.toHaveBeenCalled();
  expect(mocks.sendQuizResultEmail).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.headers.mockResolvedValue(
    new Headers({
      "x-forwarded-for": "203.0.113.10, 198.51.100.2",
      "x-forwarded-host": "example.com",
      "x-forwarded-proto": "https",
    })
  );
  mocks.checkQuizSubmissionRateLimit.mockResolvedValue(true);
  mocks.addLeadToBrevo.mockResolvedValue(true);
  mocks.sendQuizResultEmail.mockResolvedValue(true);
});

describe("saveQuizLead", () => {
  it("rejeita payload invalido sem acessar dependencias", async () => {
    const result = await saveQuizLead({ submissionId: "invalido" });

    expect(result.ok).toBe(false);
    expect(mocks.headers).not.toHaveBeenCalled();
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
    expect(mocks.checkQuizSubmissionRateLimit).not.toHaveBeenCalled();
    expectNoBrevoEffects();
  });

  it("ignora honeypot sem acessar dependencias", async () => {
    const result = await saveQuizLead(buildSubmission({ website: "bot.example" }));

    expect(result).toEqual({
      ok: true,
      brevoSynced: false,
      resultEmailSent: false,
      ignored: true,
    });
    expect(mocks.headers).not.toHaveBeenCalled();
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
    expect(mocks.checkQuizSubmissionRateLimit).not.toHaveBeenCalled();
    expectNoBrevoEffects();
  });

  it("bloqueia antes da insercao quando o limite e excedido", async () => {
    const { admin, spies } = createAdmin();
    mocks.getSupabaseAdmin.mockReturnValue(admin);
    mocks.checkQuizSubmissionRateLimit.mockResolvedValue(false);

    const result = await saveQuizLead(buildSubmission());

    expect(result.ok).toBe(false);
    expect(mocks.checkQuizSubmissionRateLimit).toHaveBeenCalledWith(admin, {
      ip: "203.0.113.10",
      email: "maria@example.com",
    });
    expect(spies.from).not.toHaveBeenCalled();
    expectNoBrevoEffects();
  });

  it("falha fechado quando a verificacao do limite lanca erro", async () => {
    const { admin, spies } = createAdmin();
    mocks.getSupabaseAdmin.mockReturnValue(admin);
    mocks.checkQuizSubmissionRateLimit.mockRejectedValue(new Error("rpc indisponivel"));

    const result = await saveQuizLead(buildSubmission());

    expect(result.ok).toBe(false);
    expect(spies.from).not.toHaveBeenCalled();
    expectNoBrevoEffects();
  });

  it("insere o elemento autoritativo e dispara cada efeito Brevo uma vez", async () => {
    const { admin, spies } = createAdmin();
    mocks.getSupabaseAdmin.mockReturnValue(admin);

    const result = await saveQuizLead(buildSubmission());

    expect(result).toEqual({
      ok: true,
      leadId: "lead-new",
      brevoSynced: true,
      resultEmailSent: true,
    });
    expect(spies.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        submission_id: SUBMISSION_ID,
        element: "Terra",
      })
    );
    expect(mocks.addLeadToBrevo).toHaveBeenCalledOnce();
    expect(mocks.addLeadToBrevo).toHaveBeenCalledWith(
      "maria@example.com",
      "Maria da Silva",
      "Terra",
      "instagram"
    );
    expect(mocks.sendQuizResultEmail).toHaveBeenCalledOnce();
  });

  it("trata 23505 como retry idempotente sem reenviar ao Brevo", async () => {
    const { admin, spies } = createAdmin({ insertError: { code: "23505" } });
    mocks.getSupabaseAdmin.mockReturnValue(admin);

    const result = await saveQuizLead(buildSubmission());

    expect(spies.select).toHaveBeenCalledWith(
      "id, brevo_synced_at, result_email_sent_at"
    );
    expect(spies.selectEq).toHaveBeenCalledWith("submission_id", SUBMISSION_ID);
    expect(result).toEqual({
      ok: true,
      leadId: "lead-existing",
      brevoSynced: true,
      resultEmailSent: true,
    });
    expectNoBrevoEffects();
  });

  it("mantem sucesso da insercao quando o Brevo falha", async () => {
    const { admin } = createAdmin();
    mocks.getSupabaseAdmin.mockReturnValue(admin);
    mocks.addLeadToBrevo.mockResolvedValue(false);
    mocks.sendQuizResultEmail.mockRejectedValue(new Error("brevo indisponivel"));

    const result = await saveQuizLead(buildSubmission());

    expect(result).toEqual({
      ok: true,
      leadId: "lead-new",
      brevoSynced: false,
      resultEmailSent: false,
    });
    expect(mocks.addLeadToBrevo).toHaveBeenCalledOnce();
    expect(mocks.sendQuizResultEmail).toHaveBeenCalledOnce();
  });
});
