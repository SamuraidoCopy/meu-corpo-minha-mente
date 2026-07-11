/**
 * Biblioteca Utilitária para Integração com a API do Brevo (v3)
 */

import { ELEMENTS, ElementType } from "@/lib/tcm-data";

const BREVO_API_URL = "https://api.brevo.com/v3";

interface BrevoContactPayload {
  email: string;
  attributes?: Record<string, string | number>;
  listIds?: number[];
  updateEnabled?: boolean;
}

const QUIZ_ELEMENT_ATTRIBUTE_VALUE: Record<ElementType, number> = {
  Água: 1,
  Fogo: 2,
  Madeira: 3,
  Terra: 4,
  Metal: 5,
};

const QUIZ_TEMPLATE_ENV_BY_ELEMENT: Record<ElementType, string> = {
  Madeira: "BREVO_TEMPLATE_QUIZ_MADEIRA_ID",
  Fogo: "BREVO_TEMPLATE_QUIZ_FOGO_ID",
  Terra: "BREVO_TEMPLATE_QUIZ_TERRA_ID",
  Metal: "BREVO_TEMPLATE_QUIZ_METAL_ID",
  Água: "BREVO_TEMPLATE_QUIZ_AGUA_ID",
};

/**
 * Retorna as configurações do Brevo em runtime
 */
function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const listIdStr = process.env.BREVO_LIST_ALUNOS_ID;
  const listId = listIdStr ? parseInt(listIdStr, 10) : 7;

  return { apiKey, listId };
}

function getBrevoQuizConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const listIdStr = process.env.BREVO_LIST_LEADS_ID;
  const listId = parsePositiveInteger(listIdStr);

  return { apiKey, listId };
}

function parsePositiveInteger(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
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
 * Adiciona ou atualiza um lead público do quiz na lista "Leads Quiz".
 */
export async function addLeadToBrevo(
  email: string,
  name: string,
  element: ElementType,
  origem?: string | null
): Promise<boolean> {
  const { apiKey, listId } = getBrevoQuizConfig();

  if (!apiKey) {
    console.error("[Brevo Quiz] BREVO_API_KEY não está definida nas variáveis de ambiente.");
    return false;
  }

  if (!listId) {
    console.error("[Brevo Quiz] BREVO_LIST_LEADS_ID não está definida nas variáveis de ambiente.");
    return false;
  }

  const firstName = name.trim().split(/\s+/)[0] || name.trim();
  const attributes: Record<string, string | number> = {
    NOME: firstName,
    ELEMENTO: QUIZ_ELEMENT_ATTRIBUTE_VALUE[element],
  };

  if (origem) {
    attributes.ORIGEM = origem;
  }

  const payload: BrevoContactPayload = {
    email,
    listIds: [listId],
    updateEnabled: true,
    attributes,
  };

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Brevo Quiz] Erro ao sincronizar lead (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Brevo Quiz] Falha na requisição para sincronizar lead:", error);
    return false;
  }
}

/**
 * Envia o e-mail transacional imediato com o resultado do quiz.
 */
export async function sendQuizResultEmail(
  email: string,
  name: string,
  element: ElementType,
  resultUrl?: string
): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const templateEnv = QUIZ_TEMPLATE_ENV_BY_ELEMENT[element];
  const templateIdStr = process.env[templateEnv];
  const templateId = parsePositiveInteger(templateIdStr);
  const info = ELEMENTS[element];

  if (!apiKey) {
    console.error("[Brevo Quiz] BREVO_API_KEY não está definida nas variáveis de ambiente.");
    return false;
  }

  if (!templateId) {
    console.error(`[Brevo Quiz] ${templateEnv} não está definida nas variáveis de ambiente.`);
    return false;
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        to: [{ email, name }],
        templateId,
        params: {
          NOME: name.trim().split(/\s+/)[0] || name.trim(),
          ELEMENTO: element,
          EMOCAO: info.emotion,
          ORGAO: info.organ,
          RESULTADO_URL: resultUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Brevo Quiz] Erro ao enviar resultado (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Brevo Quiz] Falha na requisição para enviar resultado:", error);
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
