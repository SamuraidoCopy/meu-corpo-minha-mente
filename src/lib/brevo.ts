/**
 * Biblioteca Utilitária para Integração com a API do Brevo (v3)
 */

const BREVO_API_URL = "https://api.brevo.com/v3";

interface BrevoContactPayload {
  email: string;
  attributes?: Record<string, string>;
  listIds?: number[];
  updateEnabled?: boolean;
}

/**
 * Retorna as configurações do Brevo em runtime
 */
function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const listIdStr = process.env.BREVO_LIST_ALUNOS_ID;
  const listId = listIdStr ? parseInt(listIdStr, 10) : 7;

  return { apiKey, listId };
}

/**
 * Adiciona ou atualiza um contato no Brevo e o associa à lista de alunos
 */
export async function addContactToBrevo(email: string, fullName?: string): Promise<boolean> {
  const { apiKey, listId } = getBrevoConfig();

  if (!apiKey) {
    console.error("[Brevo Integration] BREVO_API_KEY não está definida nas variáveis de ambiente.");
    return false;
  }

  console.log(`[Brevo Integration] Adicionando/Atualizando contato: ${email} na lista ${listId}`);

  // Split de nome completo para FIRSTNAME e LASTNAME
  const attributes: Record<string, string> = {};
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";

    attributes["FIRSTNAME"] = firstName;
    if (lastName) {
      attributes["LASTNAME"] = lastName;
    }
  }

  const payload: BrevoContactPayload = {
    email,
    listIds: [listId],
    updateEnabled: true,
  };

  if (Object.keys(attributes).length > 0) {
    payload.attributes = attributes;
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Brevo Integration] Erro ao adicionar contato (${response.status}):`, errorText);
      return false;
    }

    console.log(`[Brevo Integration] Contato ${email} sincronizado com sucesso no Brevo.`);
    return true;
  } catch (error) {
    console.error("[Brevo Integration] Falha na requisição para adicionar contato:", error);
    return false;
  }
}

/**
 * Remove um contato da lista de alunos no Brevo (ex: em caso de reembolso ou cancelamento)
 */
export async function removeContactFromBrevo(email: string): Promise<boolean> {
  const { apiKey, listId } = getBrevoConfig();

  if (!apiKey) {
    console.error("[Brevo Integration] BREVO_API_KEY não está definida nas variáveis de ambiente.");
    return false;
  }

  console.log(`[Brevo Integration] Removendo contato: ${email} da lista ${listId}`);

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts/lists/${listId}/contacts/remove`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        emails: [email],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Brevo Integration] Erro ao remover contato (${response.status}):`, errorText);
      return false;
    }

    console.log(`[Brevo Integration] Contato ${email} removido da lista ${listId} no Brevo.`);
    return true;
  } catch (error) {
    console.error("[Brevo Integration] Falha na requisição para remover contato:", error);
    return false;
  }
}
