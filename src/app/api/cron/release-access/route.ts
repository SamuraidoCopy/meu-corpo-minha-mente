import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, provisionAccess } from "@/lib/supabase/admin-access";

/**
 * Cron de reconciliação (rede de segurança).
 *
 * Com o acesso sendo liberado imediatamente pelo webhook de compra
 * (PURCHASE_APPROVED), este job deixa de ser a regra D+8 e passa a ser um
 * backup: libera QUALQUER compra que ainda esteja sem acesso — útil caso um
 * webhook tenha falhado ou chegado fora de ordem.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Validar autorização (CRON_SECRET).
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isDevelopment = process.env.NODE_ENV === "development";

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isDevelopment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 2. Buscar todas as compras ainda sem acesso liberado.
    const { data: pendingPurchases, error: fetchError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("access_granted", false);

    if (fetchError) {
      console.error("[Cron Release] Erro ao buscar compras pendentes:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingPurchases || pendingPurchases.length === 0) {
      return NextResponse.json({ success: true, message: "Nenhum acesso pendente para liberar." });
    }

    console.log(`[Cron Release] Reconciliando ${pendingPurchases.length} acesso(s) pendente(s)...`);
    const results: Array<Record<string, unknown>> = [];

    for (const purchase of pendingPurchases) {
      try {
        // Cria usuário no Auth + profile (idempotente e com lookup paginado).
        const userId = await provisionAccess(supabaseAdmin, {
          email: purchase.email,
          fullName: purchase.full_name,
        });

        // Marcar a compra como liberada.
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
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        console.error(`[Cron Release] Falha geral no processamento de ${purchase.email}:`, err);
        results.push({ email: purchase.email, status: "error", error: message });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[Cron Release] Erro interno:", error);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
