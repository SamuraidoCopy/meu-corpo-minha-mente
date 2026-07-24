"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import StackFeatureSection from "@/components/ui/stack-feature-section";
import { QUIZ_COPY, QUIZ_RESULT_COPY } from "@/lib/quiz-copy";
import { useUTM } from "@/lib/useUTM";
import { ELEMENTS, ElementType } from "@/lib/tcm-data";
import { calculateDominantElement, getQuizQuestions, QuizAnswer } from "@/lib/quiz-data";

import { saveQuizLead } from "./actions";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type QuizStage = "intro" | "questions" | "gate" | "result";
type LeadStatus = "idle" | "pending" | "saved" | "deferred";

const ELEMENT_ASSETS: Record<ElementType, string> = {
  Madeira: "/assets/icons/element-wood.svg",
  Fogo: "/assets/icons/element-fire.svg",
  Terra: "/assets/icons/element-earth.svg",
  Metal: "/assets/icons/element-metal.svg",
  Água: "/assets/icons/element-water.svg",
};

function trackDataLayer(event: string, payload?: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function collectTrackingParams() {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src"];
  const params = new URLSearchParams(window.location.search);

  return keys.reduce<Record<string, string>>((tracking, key) => {
    const value = sessionStorage.getItem(key) || params.get(key);
    if (value) tracking[key] = value;
    return tracking;
  }, {});
}

export function QuizClient() {
  const questions = useMemo(() => getQuizQuestions(), []);
  const { getTrackedCheckoutUrl } = useUTM();
  const [submissionId] = useState(() => crypto.randomUUID());
  const [stage, setStage] = useState<QuizStage>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [resultElement, setResultElement] = useState<ElementType | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [formError, setFormError] = useState("");
  const [leadStatus, setLeadStatus] = useState<LeadStatus>("idle");
  const [isPending, startTransition] = useTransition();

  const progress = stage === "questions" ? (currentQuestion / questions.length) * 100 : 100;
  const question = questions[currentQuestion];
  const result = resultElement ? ELEMENTS[resultElement] : null;
  const resultCopy = resultElement ? QUIZ_RESULT_COPY[resultElement] : null;

  useEffect(() => {
    window.fbq?.("track", "ViewContent", {
      content_name: "quiz_o_que_domina_seu_corpo",
    });
    trackDataLayer("quiz_view", { content_name: "quiz_o_que_domina_seu_corpo" });
  }, []);

  const handleStart = () => {
    setStage("questions");
  };

  const handleAnswer = (answer: boolean) => {
    const nextAnswers = [...answers, { questionId: question.id, answer }];

    if (currentQuestion === 0) {
      trackDataLayer("quiz_start", { content_name: "quiz_o_que_domina_seu_corpo" });
    }

    setAnswers(nextAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((step) => step + 1);
      return;
    }

    const dominant = calculateDominantElement(nextAnswers);
    setResultElement(dominant);
    setStage("gate");
    trackDataLayer("quiz_complete", { element: dominant });
  };

  const handleGateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!name.trim() || !email.trim()) {
      setFormError("Informe seu nome e e-mail para receber o resultado.");
      return;
    }

    if (!consent) {
      setFormError("Confirme o consentimento para receber seu resultado.");
      return;
    }

    if (!resultElement) {
      setFormError("Não foi possível encontrar seu resultado. Recarregue o quiz e tente novamente.");
      return;
    }

    setLeadStatus("pending");
    setStage("result");

    startTransition(async () => {
      try {
        const response = await saveQuizLead({
          submissionId,
          name,
          email,
          consent,
          element: resultElement,
          answers,
          tracking: collectTrackingParams(),
          website,
        });

        if (response.ok) {
          if (!response.ignored) {
            window.fbq?.("track", "Lead", {
              content_name: "quiz_o_que_domina_seu_corpo",
              element: resultElement,
            });
            trackDataLayer("quiz_lead", {
              element: resultElement,
              brevo_synced: response.brevoSynced,
              result_email_sent: response.resultEmailSent,
            });
          }

          setLeadStatus("saved");
          return;
        }

        console.warn("[Quiz] Gate pendente:", response.error);
        setLeadStatus("deferred");
      } catch (error) {
        console.error("[Quiz] Falha ao enviar lead:", error);
        setLeadStatus("deferred");
      }
    });
  };

  const handleCtaClick = () => {
    if (resultElement) {
      trackDataLayer("quiz_cta_click", { element: resultElement });
    }

    window.location.href = getTrackedCheckoutUrl("/o-mapa-da-raiz-pva");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-wellness-cream text-slate-900">
      <div className="fixed inset-0 mesh-gradient opacity-70" />
      {result?.theme.pageBgClass ? (
        <div className={`fixed inset-0 opacity-40 transition-opacity ${result.theme.pageBgClass}`} />
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-5 md:px-8 md:py-8">
        <header className="flex items-center justify-between">
          <div className="relative h-9 w-36 md:h-10 md:w-40">
            <Image
              src="/images/logo-mapa-raiz.png"
              alt="O Mapa da Raiz"
              fill
              sizes="160px"
              className="object-contain opacity-85"
              priority
            />
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm ring-1 ring-white/70 sm:flex">
            <Clock3 className="h-4 w-4 text-wellness-sage" />
            10 perguntas · cerca de 90 segundos
          </div>
        </header>

        <section className="flex flex-1 items-center py-8 md:py-12">
          {stage === "intro" ? <StackFeatureSection onStart={handleStart} /> : null}
          {stage === "questions" ? (
            <div className="mx-auto w-full max-w-2xl space-y-8">
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Pergunta {currentQuestion + 1} de {questions.length}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-400">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/70" />
              </div>

              <div
                key={question.id}
                className="rounded-[2rem] bg-white/85 p-8 shadow-2xl ring-1 ring-white/70 animate-in fade-in slide-in-from-bottom-4 duration-500 md:p-12"
              >
                <div className="space-y-10 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-wellness-sage/10">
                    <Image
                      src={ELEMENT_ASSETS[question.element]}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 object-contain"
                    />
                  </div>

                  <h2 className="font-serif text-3xl italic leading-tight text-slate-900 md:text-4xl">
                    &quot;{question.text}&quot;
                  </h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAnswer(false)}
                      className="h-16 rounded-2xl border-2 border-slate-200 bg-white text-sm font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-50 md:text-base"
                    >
                      Não se aplica
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleAnswer(true)}
                      className="h-16 rounded-2xl bg-wellness-sage text-sm font-bold uppercase tracking-wide text-white shadow-xl shadow-wellness-sage/20 transition-all hover:scale-[1.02] hover:bg-wellness-sage/90 active:scale-95 md:text-base"
                    >
                      Faz sentido
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {stage === "gate" && result ? (
            <div className="mx-auto grid w-full max-w-4xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-wellness-sage px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  {QUIZ_COPY.gate.badge}
                </div>
                <div className="space-y-4">
                  <h2 className="font-serif text-4xl leading-tight text-slate-900 md:text-6xl">
                    {QUIZ_COPY.gate.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-slate-700">
                    {QUIZ_COPY.gate.description}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleGateSubmit}
                className="space-y-5 rounded-[2rem] bg-white/90 p-6 shadow-2xl ring-1 ring-white/70 md:p-8"
              >
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="space-y-2">
                  <Label htmlFor="quiz-name">Primeiro nome</Label>
                  <Input
                    id="quiz-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Seu primeiro nome"
                    autoComplete="given-name"
                    className="h-[52px] rounded-2xl border-slate-200 bg-white px-4 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quiz-email">E-mail</Label>
                  <Input
                    id="quiz-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@email.com"
                    autoComplete="email"
                    className="h-[52px] rounded-2xl border-slate-200 bg-white px-4 text-base"
                    required
                  />
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-wellness-cream p-4 text-sm leading-relaxed text-slate-600">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-wellness-sage focus:ring-wellness-sage"
                    required
                  />
                  <span>
                    Autorizo receber meu resultado e comunicações do Meu Corpo Minha Mente. Posso
                    cancelar quando quiser e li a{" "}
                    <a className="font-bold text-wellness-sage underline" href="/politica-de-privacidade">
                      política de privacidade
                    </a>
                    .
                  </span>
                </label>

                {formError ? (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {formError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="h-16 w-full rounded-full bg-wellness-gold text-base font-bold uppercase tracking-wide text-white shadow-xl shadow-wellness-gold/25 transition-all hover:scale-[1.01] hover:bg-wellness-gold/90 active:scale-95 md:text-lg"
                >
                  {QUIZ_COPY.gate.cta}
                  <Mail className="h-5 w-5" />
                </Button>
              </form>
            </div>
          ) : null}

          {stage === "result" && result && resultElement && resultCopy ? (
            <div className="mx-auto w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid items-center gap-8 rounded-[2rem] bg-white/90 p-7 shadow-2xl ring-1 ring-white/70 md:grid-cols-[0.86fr_1.14fr] md:p-10">
                <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-full bg-wellness-cream shadow-inner">
                  <Image
                    src={ELEMENT_ASSETS[resultElement]}
                    alt={`Elemento ${resultElement}`}
                    width={190}
                    height={190}
                    className="h-44 w-44 object-contain"
                    priority
                  />
                </div>

                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                    {QUIZ_COPY.result.label}
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-5xl leading-none text-slate-900 md:text-7xl">
                      {resultElement}
                    </h2>
                    <p className="font-serif text-2xl italic text-wellness-sage">
                      {result.emotion}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-wellness-cream p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Órgãos-chave
                      </p>
                      <p className="mt-1 font-serif text-lg text-slate-800">{result.organ}</p>
                    </div>
                    <div className="rounded-2xl bg-wellness-cream p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Leitura inicial
                      </p>
                      <p className="mt-1 font-serif text-lg text-slate-800">
                        {result.emotion.split("/")[0]}
                      </p>
                    </div>
                  </div>

                  <p className="text-base leading-relaxed text-slate-700">{resultCopy.description}</p>
                </div>
              </div>

              <div className="grid gap-6 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl md:grid-cols-[1fr_0.72fr] md:p-10">
                <div className="space-y-5">
                  <h3 className="font-serif text-3xl leading-tight md:text-4xl">
                    {QUIZ_COPY.result.headline}
                  </h3>
                  <div className="space-y-4 text-base leading-relaxed text-white/80">
                    {resultCopy.bridge.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-white/45">
                    Conteúdo educativo baseado na tradição da MTC; não substitui acompanhamento
                    médico ou psicológico.
                  </p>
                </div>

                <div className="flex flex-col justify-between gap-5 rounded-[1.5rem] bg-white p-5 text-slate-900">
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-wellness-sage">
                      Próximo passo
                    </p>
                    <p className="font-serif text-2xl leading-tight">
                      {QUIZ_COPY.result.nextStep}
                    </p>
                    {leadStatus === "pending" || isPending ? (
                      <p className="text-sm text-slate-500">Enviando seu resultado para o e-mail...</p>
                    ) : null}
                    {leadStatus === "saved" ? (
                      <p className="flex items-center gap-2 text-sm font-medium text-wellness-sage">
                        <CheckCircle2 className="h-4 w-4" />
                        Resultado registrado para envio.
                      </p>
                    ) : null}
                    {leadStatus === "deferred" ? (
                      <p className="text-sm text-slate-500">
                        Se o e-mail demorar, sua leitura continua disponível aqui.
                      </p>
                    ) : null}
                  </div>

                  <Button
                    onClick={handleCtaClick}
                    className="h-16 rounded-full bg-wellness-gold text-sm font-bold uppercase tracking-wide text-white shadow-xl shadow-wellness-gold/25 transition-all hover:scale-[1.02] hover:bg-wellness-gold/90 active:scale-95 md:text-base"
                  >
                    {QUIZ_COPY.result.cta}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
