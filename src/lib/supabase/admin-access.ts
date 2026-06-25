import { createClient, SupabaseClient, type User } from "@supabase/supabase-js";

/**
 * Cliente admin (service role) com lazy init: criado apenas em runtime,
 * nunca durante o build. Evita o erro "supabaseKey is required" na Vercel.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias em runtime."
    );
  }

  return createClient(url, key);
}

/**
 * Busca um usuário do Supabase Auth por e-mail, paginando a lista completa.
 *
 * O `admin.listUsers()` retorna no máximo `perPage` usuários por página
 * (default 50). Sem paginar, bases com mais usuários podem "não encontrar"
 * um e-mail existente — falha silenciosa que quebra tanto a liberação quanto
 * o bloqueio de acesso.
 */
export async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string
): Promise<User | null> {
  const target = email.trim().toLowerCase();
  const perPage = 1000;

  // Limite de segurança para nunca entrar em loop infinito.
  for (let page = 1; page <= 1000; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found;

    // Última página alcançada.
    if (data.users.length < perPage) return null;
  }

  return null;
}

/**
 * Garante acesso imediato para um e-mail de compra. Idempotente:
 *  - cria o usuário no Auth se ainda não existir (e-mail já confirmado);
 *  - remove um ban anterior caso seja uma recompra após reembolso;
 *  - cria/atualiza o registro em `profiles`.
 *
 * Retorna o `userId` provisionado.
 */
export async function provisionAccess(
  admin: SupabaseClient,
  params: { email: string; fullName?: string | null }
): Promise<string> {
  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName ?? undefined;

  let user = await findAuthUserByEmail(admin, email);

  if (!user) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      // Corrida: outro processo (ex.: cron + webhook) pode ter criado
      // o usuário entre a busca e o create. Relê em vez de falhar.
      if (/already|exist/i.test(createError.message)) {
        user = await findAuthUserByEmail(admin, email);
      } else {
        throw createError;
      }
    } else {
      user = created.user;
    }
  } else {
    // Recompra após reembolso: remove qualquer ban anterior.
    const bannedUntil = (user as { banned_until?: string | null }).banned_until;
    if (bannedUntil) {
      await admin.auth.admin.updateUserById(user.id, { ban_duration: "none" });
    }
  }

  if (!user) {
    throw new Error(`Não foi possível criar ou localizar o usuário para ${email}`);
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    updated_at: new Date().toISOString(),
  });
  if (profileError) throw profileError;

  return user.id;
}
