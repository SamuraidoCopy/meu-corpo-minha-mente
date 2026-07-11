"use server";

import { headers } from "next/headers";

import { addLeadToBrevo, sendQuizResultEmail } from "@/lib/brevo";
import { checkQuizSubmissionRateLimit } from "@/lib/quiz-rate-limit";
import { parseQuizSubmission } from "@/lib/quiz-submission";
import { getSupabaseAdmin } from "@/lib/supabase/admin-access";

type SaveQuizLeadResult =
  | {
      ok: true;
      leadId?: string;
      brevoSynced: boolean;
      resultEmailSent: boolean;
      ignored?: boolean;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

type ExistingLead = {
  id: string;
  brevo_synced_at: string | null;
  result_email_sent_at: string | null;
};

function getClientIp(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown"
  );
}

function buildResultUrl(headersList: Headers): string | undefined {
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  if (!host) return undefined;

  const protocol = headersList.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}/quiz`;
}

export async function saveQuizLead(input: unknown): Promise<SaveQuizLeadResult> {
  const parsed = parseQuizSubmission(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revise os dados do formulário.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  if (data.website.trim()) {
    return {
      ok: true,
      brevoSynced: false,
      resultEmailSent: false,
      ignored: true,
    };
  }

  let headersList: Headers;
  let admin: ReturnType<typeof getSupabaseAdmin>;

  try {
    headersList = await headers();
    admin = getSupabaseAdmin();
    const allowed = await checkQuizSubmissionRateLimit(admin, {
      ip: getClientIp(headersList),
      email: data.email,
    });

    if (!allowed) {
      return {
        ok: false,
        error: "Muitas tentativas em sequência. Aguarde alguns minutos e tente novamente.",
      };
    }
  } catch {
    return {
      ok: false,
      error: "Muitas tentativas em sequência. Aguarde alguns minutos e tente novamente.",
    };
  }

  const now = new Date().toISOString();

  try {
    const { data: insertedLead, error: insertError } = await admin
      .from("quiz_leads")
      .insert({
        submission_id: data.submissionId,
        email: data.email,
        name: data.name,
        element: data.element,
        answers: data.answers,
        utm_source: data.tracking.utm_source || null,
        utm_medium: data.tracking.utm_medium || null,
        utm_campaign: data.tracking.utm_campaign || null,
        utm_content: data.tracking.utm_content || null,
        utm_term: data.tracking.utm_term || null,
        src: data.tracking.src || null,
        consented_at: now,
        created_at: now,
      })
      .select("id")
      .single();

    if (insertError?.code === "23505") {
      const { data: existingLead, error: existingError } = await admin
        .from("quiz_leads")
        .select("id, brevo_synced_at, result_email_sent_at")
        .eq("submission_id", data.submissionId)
        .single<ExistingLead>();

      if (existingError || !existingLead) {
        return {
          ok: false,
          error: "Não conseguimos salvar seu e-mail agora, mas seu resultado já está disponível.",
        };
      }

      return {
        ok: true,
        leadId: existingLead.id,
        brevoSynced: Boolean(existingLead.brevo_synced_at),
        resultEmailSent: Boolean(existingLead.result_email_sent_at),
      };
    }

    if (insertError) {
      return {
        ok: false,
        error: "Não conseguimos salvar seu e-mail agora, mas seu resultado já está disponível.",
      };
    }

    const leadId = insertedLead?.id as string | undefined;
    const [brevoResult, emailResult] = await Promise.allSettled([
      addLeadToBrevo(
        data.email,
        data.name,
        data.element,
        data.tracking.src || data.tracking.utm_source || "quiz"
      ),
      sendQuizResultEmail(
        data.email,
        data.name,
        data.element,
        buildResultUrl(headersList)
      ),
    ]);
    const brevoSynced = brevoResult.status === "fulfilled" && brevoResult.value;
    const resultEmailSent = emailResult.status === "fulfilled" && emailResult.value;

    const updatePayload: Record<string, string> = {};
    if (brevoSynced) updatePayload.brevo_synced_at = new Date().toISOString();
    if (resultEmailSent) updatePayload.result_email_sent_at = new Date().toISOString();

    if (leadId && Object.keys(updatePayload).length > 0) {
      await admin.from("quiz_leads").update(updatePayload).eq("id", leadId);
    }

    return {
      ok: true,
      leadId,
      brevoSynced,
      resultEmailSent,
    };
  } catch {
    return {
      ok: false,
      error: "Seu resultado está disponível, mas o envio por e-mail ficou pendente.",
    };
  }
}
