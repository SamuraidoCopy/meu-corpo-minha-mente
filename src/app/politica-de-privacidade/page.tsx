import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Meu Corpo Minha Mente",
  description: "Como o Meu Corpo Minha Mente trata os dados informados no quiz e no app.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-wellness-cream px-5 py-14 text-slate-800">
      <div className="mx-auto max-w-3xl space-y-10 rounded-[2rem] bg-white p-7 shadow-xl md:p-12">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-wellness-sage">
            Meu Corpo Minha Mente
          </p>
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">
            Política de Privacidade
          </h1>
          <p className="text-slate-600">
            Esta página resume como tratamos os dados fornecidos no quiz público e nas
            experiências digitais do Meu Corpo Minha Mente.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl">Dados coletados</h2>
          <p className="leading-relaxed text-slate-600">
            No quiz, coletamos nome, e-mail, respostas, elemento dominante e parâmetros de
            origem da visita quando presentes na URL. Esses dados são usados para entregar o
            resultado, entender a origem dos leads e enviar comunicações relacionadas ao Meu
            Corpo Minha Mente.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl">Base de uso</h2>
          <p className="leading-relaxed text-slate-600">
            O envio do resultado e das comunicações acontece mediante consentimento informado
            no formulário. O consentimento pode ser retirado a qualquer momento pelos links de
            descadastro presentes nos e-mails.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl">Proteção e finalidade</h2>
          <p className="leading-relaxed text-slate-600">
            As informações são armazenadas em sistemas protegidos e usadas apenas para as
            finalidades declaradas. O conteúdo é educativo e não substitui acompanhamento
            médico ou psicológico.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl">Contato</h2>
          <p className="leading-relaxed text-slate-600">
            Para solicitar atualização, remoção ou informações sobre seus dados, responda a
            qualquer e-mail recebido pelo Meu Corpo Minha Mente ou utilize o canal de contato
            oficial da marca.
          </p>
        </section>
      </div>
    </main>
  );
}
