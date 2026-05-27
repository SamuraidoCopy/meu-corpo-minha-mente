import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.");
  }

  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  try {
    // 1. Validar autorização (CRON_SECRET)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isDevelopment = process.env.NODE_ENV === "development";

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Calcular a data de corte (8 dias atrás)
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    const cutoffDate = eightDaysAgo.toISOString();

    // 3. Buscar compras pendentes qualificadas (purchase_date <= D-8 e access_granted = false)
    const { data: pendingPurchases, error: fetchError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .lte("purchase_date", cutoffDate)
      .eq("access_granted", false);

    if (fetchError) {
      console.error("[Cron Release] Erro ao buscar compras pendentes:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingPurchases || pendingPurchases.length === 0) {
      return NextResponse.json({ success: true, message: "Nenhum acesso para liberar hoje." });
    }

    console.log(`[Cron Release] Iniciando liberação de ${pendingPurchases.length} acessos...`);
    const results = [];

    // Obter lista atual de usuários no Auth para evitar duplicações
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const usersList = existingUsers?.users || [];

    for (const purchase of pendingPurchases) {
      try {
        let userId: string;
        const user = usersList.find((u) => u.email === purchase.email);

        if (!user) {
          // Criar novo usuário no Supabase Auth
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: purchase.email,
            email_confirm: true,
            user_metadata: { full_name: purchase.full_name },
          });

          if (createError) {
            console.error(`[Cron Release] Erro ao criar usuário ${purchase.email}:`, createError);
            results.push({ email: purchase.email, status: "error", error: createError.message });
            continue;
          }
          userId = newUser.user.id;
          console.log(`[Cron Release] Criado usuário no Auth para: ${purchase.email}`);
        } else {
          userId = user.id;
          console.log(`[Cron Release] Usuário já existia no Auth para: ${purchase.email}`);
        }

        // Criar/atualizar perfil público na tabela profiles
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert({
            id: userId,
            full_name: purchase.full_name,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error(`[Cron Release] Erro ao criar perfil para ${purchase.email}:`, profileError);
          results.push({ email: purchase.email, status: "error", error: profileError.message });
          continue;
        }

        // Marcar compra como liberada
        const { error: updateError } = await supabaseAdmin
          .from("purchases")
          .update({ access_granted: true })
          .eq("id", purchase.id);

        if (updateError) {
          console.error(`[Cron Release] Erro ao atualizar status da compra de ${purchase.email}:`, updateError);
          results.push({ email: purchase.email, status: "error", error: updateError.message });
          continue;
        }

        results.push({ email: purchase.email, status: "released", userId });
      } catch (err: any) {
        console.error(`[Cron Release] Falha geral no processamento de ${purchase.email}:`, err);
        results.push({ email: purchase.email, status: "error", error: err.message });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("[Cron Release] Erro interno:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
