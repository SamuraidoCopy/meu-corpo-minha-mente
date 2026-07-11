// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { addLeadToBrevo, sendQuizResultEmail } from "@/lib/brevo";

const originalEnv = { ...process.env };

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});

function mockBrevoResponse() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messageId: "test-message" }),
      text: async () => "",
    })
  );
  process.env.BREVO_API_KEY = "test-api-key";
  process.env.BREVO_LIST_LEADS_ID = "8";
  process.env.BREVO_TEMPLATE_QUIZ_AGUA_ID = "21";
}

describe("Brevo quiz integration", () => {
  it("envia o ID numerico da categoria ELEMENTO e somente atributos existentes", async () => {
    mockBrevoResponse();

    await expect(addLeadToBrevo("maria@example.com", "Maria da Silva", "Água", "instagram")).resolves.toBe(true);

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://api.brevo.com/v3/contacts");
    expect(JSON.parse(String(init?.body))).toMatchObject({
      email: "maria@example.com",
      listIds: [8],
      attributes: {
        NOME: "Maria",
        ELEMENTO: 1,
        ORIGEM: "instagram",
      },
    });
    expect(JSON.parse(String(init?.body)).attributes).not.toHaveProperty("FIRSTNAME");
  });

  it.each([
    ["Água", 1],
    ["Fogo", 2],
    ["Madeira", 3],
    ["Terra", 4],
    ["Metal", 5],
  ] as const)("mapeia %s para a enumeração Brevo %s", async (element, expectedValue) => {
    mockBrevoResponse();
    delete process.env.BREVO_TEMPLATE_QUIZ_AGUA_ID;
    process.env.BREVO_LIST_LEADS_ID = "8";

    await addLeadToBrevo("maria@example.com", "Maria", element, "quiz");

    const payload = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(payload.attributes.ELEMENTO).toBe(expectedValue);
  });

  it("envia o nome humano nos params do template, separado do atributo numerico", async () => {
    mockBrevoResponse();

    await expect(
      sendQuizResultEmail(
        "maria@example.com",
        "Maria da Silva",
        "Água",
        "https://example.com/quiz"
      )
    ).resolves.toBe(true);

    const payload = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(payload).toMatchObject({
      templateId: 21,
      params: {
        NOME: "Maria",
        ELEMENTO: "Água",
        RESULTADO_URL: "https://example.com/quiz",
      },
    });
  });

  it("rejeita IDs de lista e template que nao sejam inteiros positivos", async () => {
    mockBrevoResponse();
    process.env.BREVO_LIST_LEADS_ID = "8abc";
    process.env.BREVO_TEMPLATE_QUIZ_AGUA_ID = "21abc";

    await expect(addLeadToBrevo("maria@example.com", "Maria", "Água")).resolves.toBe(false);
    await expect(sendQuizResultEmail("maria@example.com", "Maria", "Água")).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
