import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente do Supabase com a Service Role Key para operações administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

/**
 * Endpoint de Webhook para integração com a Hotmart.
 * Documentação Hotmart: https://developers.hotmart.com/docs/en/v1/webhook/introduction
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const hotmartToken = req.headers.get("h-hotmart-token");

    // Validação básica de segurança via Token da Hotmart
    // IMPORTANTE: Configurar HOTMART_WEBHOOK_TOKEN no .env.local
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
 * Cria ou ativa o acesso do usuário no App após a compra.
 */
async function handlePurchaseApproved(data: any) {
  const email = data.buyer?.email;
  const fullName = data.buyer?.name;

  if (!email) {
    return NextResponse.json({ error: "Email não encontrado no payload" }, { status: 400 });
  }

  // 1. Verificar se o usuário já existe no Auth
  const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
  const user = existingUser.users.find(u => u.email === email);

  let userId: string;

  if (!user) {
    // 2. Criar novo usuário no Auth (sem senha inicial, usará Magic Link ou Reset)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      console.error("[Hotmart Webhook] Erro ao criar usuário:", createError);
      throw createError;
    }
    userId = newUser.user.id;
    console.log(`[Hotmart Webhook] Novo usuário criado: ${userId}`);
  } else {
    userId = user.id;
    console.log(`[Hotmart Webhook] Usuário já existente: ${userId}`);
  }

  // 3. Upsert no perfil público (tabela profiles)
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      full_name: fullName,
      updated_at: new Date().toISOString(),
      // Outros campos podem ser inicializados aqui
    });

  if (profileError) {
    console.error("[Hotmart Webhook] Erro ao atualizar perfil:", profileError);
    throw profileError;
  }

  return NextResponse.json({ success: true, userId });
}

/**
 * Remove ou bloqueia o acesso do usuário em caso de reembolso/cancelamento.
 */
async function handlePurchaseRevoked(data: any) {
  const email = data.buyer?.email;

  if (!email) return NextResponse.json({ received: true });

  // Buscar o ID do usuário pelo email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);

  if (user) {
    // Opção A: Desativar o usuário (bloqueia login)
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      ban_duration: "infinite" // Ou uma flag customizada no profile
    });

    // Opção B: Atualizar perfil com flag de acesso
    await supabaseAdmin
      .from("profiles")
      .update({ onboarding_completed: false }) // Ou uma flag 'has_access'
      .eq("id", user.id);
    
    console.log(`[Hotmart Webhook] Acesso revogado para: ${email}`);
  }

  return NextResponse.json({ success: true });
}
