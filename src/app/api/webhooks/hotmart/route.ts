import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { addContactToBrevo, removeContactFromBrevo } from "@/lib/brevo";

// ⚠️ LAZY INIT: O cliente é criado apenas em tempo de execução (runtime),
// nunca durante o build. Isso evita o erro "supabaseKey is required" na Vercel.
function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "[Hotmart Webhook] Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias em runtime."
    );
  }

  return createClient(url, key);
}

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
 * Cria ou ativa o acesso do usuário no App após a compra (Regra D+8: registra compra para liberação posterior).
 */
async function handlePurchaseApproved(data: Record<string, unknown>) {
  const buyer = data.buyer as { email?: string; name?: string } | undefined;
  const email = buyer?.email;
  const fullName = buyer?.name;
  const transactionCode = data.transaction as string | undefined;

  if (!email) {
    return NextResponse.json({ error: "Email não encontrado no payload" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Registrar a compra na tabela purchases com access_granted = false
  const { error: purchaseError } = await supabaseAdmin
    .from("purchases")
    .upsert({
      email,
      full_name: fullName,
      hotmart_transaction_code: transactionCode,
      purchase_date: new Date().toISOString(),
      access_granted: false,
    }, { onConflict: "email" });

  if (purchaseError) {
    console.error("[Hotmart Webhook] Erro ao registrar compra:", purchaseError);
    throw purchaseError;
  }

  // Sincronizar com o Brevo (Adiciona/Atualiza na lista de Alunos)
  try {
    await addContactToBrevo(email, fullName);
  } catch (brevoError) {
    console.error("[Hotmart Webhook] Erro ao sincronizar contato com Brevo:", brevoError);
  }

  console.log(`[Hotmart Webhook] Compra registrada para: ${email} (Aguardando liberação D+8)`);

  return NextResponse.json({ success: true, message: "Compra registrada com sucesso. Acesso será liberado em 8 dias." });
}

/**
 * Remove ou bloqueia o acesso do usuário em caso de reembolso/cancelamento.
 */
async function handlePurchaseRevoked(data: Record<string, unknown>) {
  const buyer = data.buyer as { email?: string } | undefined;
  const email = buyer?.email;

  if (!email) return NextResponse.json({ received: true });

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Atualizar tabela purchases para remover permissão de acesso
  await supabaseAdmin
    .from("purchases")
    .update({ access_granted: false })
    .eq("email", email);

  // Sincronizar com o Brevo (Remove da lista de Alunos)
  try {
    await removeContactFromBrevo(email);
  } catch (brevoError) {
    console.error("[Hotmart Webhook] Erro ao remover contato da lista do Brevo:", brevoError);
  }

  // 2. Buscar o ID do usuário pelo email no Auth
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = users.users.find((u) => u.email === email);

  if (user) {
    // Desativar o usuário (bloqueia login)
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      ban_duration: "infinite",
    });

    // Atualizar perfil com flag de acesso
    await supabaseAdmin
      .from("profiles")
      .update({ onboarding_completed: false })
      .eq("id", user.id);

    console.log(`[Hotmart Webhook] Acesso revogado para: ${email}`);
  }

  return NextResponse.json({ success: true });
}

