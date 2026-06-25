import { NextRequest, NextResponse } from "next/server";
import { addContactToBrevo, removeContactFromBrevo } from "@/lib/brevo";
import {
  getSupabaseAdmin,
  findAuthUserByEmail,
  provisionAccess,
} from "@/lib/supabase/admin-access";

/**
 * Endpoint de Webhook para integração com a Hotmart.
 * Documentação Hotmart: https://developers.hotmart.com/docs/en/v1/webhook/introduction
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Nas versões mais recentes, o token de segurança ("hottok") vem no corpo da requisição (body.hottok)
    const hotmartToken = req.headers.get("h-hotmart-token") || body.hottok;

    // Validação básica de segurança via Token da Hotmart
    // IMPORTANTE: Configurar HOTMART_WEBHOOK_TOKEN no .env.local e nas envs da Vercel
    if (process.env.HOTMART_WEBHOOK_TOKEN && hotmartToken !== process.env.HOTMART_WEBHOOK_TOKEN) {
      console.warn("[Hotmart Webhook] Token de segurança inválido.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { event, data } = body;

    console.log(`[Hotmart Webhook] Recebido evento: ${event}`);

    switch (event) {
      case "PURCHASE_APPROVED":
        return await handlePurchaseApproved(data);

      case "PURCHASE_REFUNDED":
      case "PURCHASE_CHARGEBACK":
      case "PURCHASE_CANCELED":
        return await handlePurchaseRevoked(data);

      default:
        console.log(`[Hotmart Webhook] Evento ignorado: ${event}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error("[Hotmart Webhook] Erro ao processar webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Libera o acesso do usuário IMEDIATAMENTE após a compra aprovada:
 * cria o login no Auth (e-mail já confirmado) + profile, registra a compra
 * com access_granted = true e sincroniza com o Brevo.
 */
async function handlePurchaseApproved(data: Record<string, unknown>) {
  const buyer = data.buyer as { email?: string; name?: string } | undefined;
  const email = buyer?.email?.trim().toLowerCase();
  const fullName = buyer?.name;
  const transactionCode = data.transaction as string | undefined;

  if (!email) {
    return NextResponse.json({ error: "Email não encontrado no payload" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Liberar acesso imediato: cria usuário no Auth + profile (idempotente).
  try {
    await provisionAccess(supabaseAdmin, { email, fullName });
  } catch (provisionError) {
    console.error("[Hotmart Webhook] Erro ao liberar acesso imediato:", provisionError);
    throw provisionError;
  }

  // 2. Registrar a compra com acesso já concedido.
  const { error: purchaseError } = await supabaseAdmin
    .from("purchases")
    .upsert({
      email,
      full_name: fullName,
      hotmart_transaction_code: transactionCode,
      purchase_date: new Date().toISOString(),
      access_granted: true,
    }, { onConflict: "email" });

  if (purchaseError) {
    console.error("[Hotmart Webhook] Erro ao registrar compra:", purchaseError);
    throw purchaseError;
  }

  // 3. Sincronizar com o Brevo (Adiciona/Atualiza na lista de Alunos).
  try {
    await addContactToBrevo(email, fullName);
  } catch (brevoError) {
    console.error("[Hotmart Webhook] Erro ao sincronizar contato com Brevo:", brevoError);
  }

  console.log(`[Hotmart Webhook] Acesso liberado imediatamente para: ${email}`);

  return NextResponse.json({
    success: true,
    message: "Compra registrada e acesso liberado imediatamente.",
  });
}

/**
 * Bloqueia o acesso do usuário automaticamente em caso de
 * reembolso, chargeback ou cancelamento.
 */
async function handlePurchaseRevoked(data: Record<string, unknown>) {
  const buyer = data.buyer as { email?: string } | undefined;
  const email = buyer?.email?.trim().toLowerCase();

  if (!email) return NextResponse.json({ received: true });

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Revogar a permissão na tabela purchases.
  await supabaseAdmin
    .from("purchases")
    .update({ access_granted: false })
    .eq("email", email);

  // 2. Remover da lista de Alunos no Brevo.
  try {
    await removeContactFromBrevo(email);
  } catch (brevoError) {
    console.error("[Hotmart Webhook] Erro ao remover contato da lista do Brevo:", brevoError);
  }

  // 3. Banir o usuário no Auth: bloqueia novos logins e invalida a
  //    renovação da sessão (lookup paginado, confiável em qualquer base).
  const user = await findAuthUserByEmail(supabaseAdmin, email);

  if (user) {
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      ban_duration: "infinite",
    });

    await supabaseAdmin
      .from("profiles")
      .update({ onboarding_completed: false })
      .eq("id", user.id);

    console.log(`[Hotmart Webhook] Acesso bloqueado para: ${email}`);
  } else {
    console.warn(`[Hotmart Webhook] Reembolso recebido mas usuário não encontrado no Auth: ${email}`);
  }

  return NextResponse.json({ success: true });
}
