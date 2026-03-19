"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Play,
    CheckCircle2,
    ArrowRight,
    Smartphone,
    Brain,
    Activity,
    ShieldCheck,
    HelpCircle,
    Menu,
    X
} from "lucide-react";

export default function SalesPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-wellness-cream text-slate-900 selection:bg-wellness-sage/20 font-sans">
            {/* Background Mesh */}
            <div className="fixed inset-0 mesh-gradient pointer-events-none opacity-40 z-0" />

            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/70 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"
                    }`}
            >
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="relative h-8 md:h-10 w-32 md:w-40 opacity-90">
                        <Image
                            src="/images/logo-mapa-raiz.png"
                            alt="O Mapa da Raiz"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
                        <a href="#metodo" className="hover:text-wellness-sage transition-colors">O Método</a>
                        <a href="#autores" className="hover:text-wellness-sage transition-colors">As Autoras</a>
                        <a href="#faqs" className="hover:text-wellness-sage transition-colors">Dúvidas</a>
                        <Button className="bg-wellness-sage hover:bg-wellness-sage/90 text-white rounded-full px-8">
                            Acessar Agora
                        </Button>
                    </div>

                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-wellness-cream flex flex-col items-center justify-center gap-8 md:hidden">
                    <a href="#metodo" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">O Método</a>
                    <a href="#autores" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">As Autoras</a>
                    <a href="#faqs" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif">Dúvidas</a>
                    <Button className="bg-wellness-sage text-white rounded-full px-12 py-6 text-xl">
                        Acessar Agora
                    </Button>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden">
                <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-8">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-wellness-gold text-white text-xs md:text-sm font-bold tracking-widest uppercase animate-fade-in-up">
                        ATENÇÃO: PARA QUEM BUSCA DAR UM PONTO FINAL NA TERAPIA &quot;SEM FIM&quot;
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] text-slate-800 animate-fade-in-up [animation-delay:200ms]">
                        Descubra o Idioma Secreto do <br />
                        <span className="italic text-wellness-sage">seu corpo</span> que nenhuma terapia nunca te ensinou.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
                        Em 5 minutos olhando no espelho, você pode identificar a <strong>&quot;Raiz do Problema&quot;</strong> emocional que está causando o seu colapso — e como estancar isso.
                    </p>

                    <div className="animate-fade-in-up [animation-delay:600ms] flex flex-col items-center gap-6">
                        <div className="relative group max-w-4xl w-full aspect-video rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl glass border-white/50">
                            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-all flex items-center justify-center z-20">
                                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-wellness-gold/90 text-white flex items-center justify-center shadow-2xl animate-breathe cursor-pointer">
                                    <Play size={40} className="fill-current ml-2" />
                                </div>
                            </div>
                            <Image
                                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
                                alt="Thumbnail VSL"
                                fill
                                className="object-cover"
                            />
                            {/* Bottom bar overlay */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white text-sm font-medium z-10">
                                Por Que a Terapia Falhou Com Você?
                            </div>
                        </div>

                        <Button className="h-16 md:h-20 px-10 md:px-14 rounded-full text-lg md:text-xl bg-wellness-gold hover:bg-wellness-gold/90 text-white shadow-xl shadow-wellness-gold/20 transition-all hover:scale-105 active:scale-95 group">
                            <span className="md:hidden">QUERO DESCOBRIR A RAIZ</span>
                            <span className="hidden md:inline">SIM, QUERO DESCOBRIR A RAIZ DO MEU PROBLEMA AGORA</span>
                            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <p className="text-sm text-slate-500 italic">
                            17 comprimidos diários não pararam a minha depressão, mas sim o que descobri com a Terapia Integrativa.
                        </p>
                    </div>
                </div>
            </section>

            {/* Seção 1: O Que Você Leva */}
            <section id="metodo" className="py-24 bg-white/30 backdrop-blur-sm relative border-y border-wellness-sage/10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-serif text-slate-800">O Que Você Vai Receber no &quot;Mapa da Raiz&quot;</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Se você só tenta curar os sintomas (as folhas), elas sempre voltarão a secar. <br className="hidden md:block" />
                            Chegou a hora de tratar a Raiz e resolver o problema.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="glass rounded-[2.5rem] p-8 border-none hover:shadow-2xl transition-all group">
                            <div className="w-14 h-14 rounded-2xl bg-wellness-sage/10 text-wellness-sage flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Brain size={28} />
                            </div>
                            <h3 className="text-xl font-serif mb-4">A Anatomia da Sua Dor</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Entenda os 5 Elementos da Terapia Integrativa e qual órgão do seu corpo está sofrendo por emoções guardadas.
                            </p>
                        </Card>

                        <Card className="glass rounded-[2.5rem] p-8 border-none hover:shadow-2xl transition-all group lg:mt-8">
                            <div className="w-14 h-14 rounded-2xl bg-wellness-earth/10 text-wellness-earth flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Activity size={28} />
                            </div>
                            <h3 className="text-xl font-serif mb-4">Diagnóstico Especializado</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Aprenda a fazer a leitura do seu próprio rosto sem precisar de sessões caríssimas de terapia tradicional.
                            </p>
                        </Card>

                        <Card className="glass rounded-[2.5rem] p-8 border-wellness-gold/20 bg-wellness-gold/5 hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-wellness-gold text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">
                                Super Bônus
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-wellness-gold/10 text-wellness-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Smartphone size={28} />
                            </div>
                            <h3 className="text-xl font-serif mb-4">App para o Diagnóstico Facial</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Nosso app exclusivo cruza a informação das marcas do seu rosto com os 5 elementos para um diagnóstico instantâneo.
                            </p>
                        </Card>
                    </div>

                    {/* App Screenshots Carousel */}
                    <div className="mt-16 w-full relative">
                        {/* Fade edges para induzir o scroll */}
                        <div className="absolute top-0 bottom-0 left-0 w-8 md:w-24 bg-gradient-to-r from-white/30 to-transparent z-10 pointer-events-none rounded-l-[2rem]" />
                        <div className="absolute top-0 bottom-0 right-0 w-8 md:w-24 bg-gradient-to-l from-white/30 to-transparent z-10 pointer-events-none rounded-r-[2rem]" />
                        
                        <div className="flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-8 md:px-24 py-4 items-center">
                            {[1, 2, 3, 4].map((num) => (
                                <div key={num} className="snap-center shrink-0 w-[240px] md:w-[300px] relative animate-fade-in-right">
                                    {/* Phone Hardware Frame */}
                                    <div className="relative aspect-[9/19] bg-slate-900 rounded-[3.5rem] p-3 shadow-2xl border-x-[4px] border-slate-800 group hover:scale-[1.03] transition-transform duration-700">
                                        {/* Side Buttons (Vol/Power) */}
                                        <div className="absolute -left-[3px] top-24 w-[3px] h-12 bg-slate-700 rounded-l-full" />
                                        <div className="absolute -left-[3px] top-40 w-[3px] h-12 bg-slate-700 rounded-l-full" />
                                        <div className="absolute -right-[3px] top-32 w-[3px] h-16 bg-slate-700 rounded-r-full" />
                                        
                                        {/* The Screen Layer */}
                                        <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-white relative">
                                            <Image
                                                src={`/images/app-screen-${num}.jpg`}
                                                alt={`Tela do Aplicativo ${num}`}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                            
                                            {/* Bottom Home Indicator */}
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-900/5 rounded-full z-20" />
                                            
                                            {/* Screen Reflection Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-30 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <Button className="bg-wellness-sage text-white rounded-full px-10 h-14 text-lg">
                            <span className="md:hidden">QUERO ACESSAR</span>
                            <span className="hidden md:inline">QUERO ACESSAR O APP E O CURSO AGORA!</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Seção 2: Autoridades */}
            <section id="autores" className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 relative w-full h-[400px] md:h-[500px]">
                            <div className="absolute inset-0 bg-wellness-sage/20 rounded-full blur-[100px] -z-10" />
                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="relative rounded-[3rem] shadow-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                    <Image
                                        src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600"
                                        alt="Dra. Ranieli"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                <div className="relative rounded-[3rem] shadow-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 mt-8 md:mt-12">
                                    <Image
                                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600"
                                        alt="Cleucia Venancio"
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-3xl md:text-5xl font-serif text-slate-800 leading-tight">
                                Quem vai te ajudar a recuperar as cores do seu mundo?
                            </h2>

                            <p className="text-lg text-slate-600 leading-relaxed">
                                Somos a <strong>Dra. Ranieli</strong> e a <strong>Esp. Cleucia Venancio</strong>, fundadoras da clínica <em>Meu Corpo, Minha Mente</em> e criadoras do Método &quot;Cortando o Mal pela Raiz™&quot;.
                            </p>

                            <div className="space-y-6">
                                <div className="p-6 glass rounded-2xl border-none">
                                    <p className="italic text-slate-700">
                                        &quot;A Cleucia passou 9 anos tomando mais de 17 comprimidos por dia por conta de depressão grave... Até usar em si mesma o método de leitura facial do Mapa da Raiz, o qual salvou sua vida. Esse método está acessível aqui por um preço inacreditavél.&quot;
                                    </p>
                                </div>

                                <ul className="space-y-4">
                                    {[
                                        "Ambas experimentaram o método na própria vida",
                                        "Método validado em centenas de sessões",
                                        "Baseado em Terapia Integrativa",
                                        "Foco em Saúde Física, Mental e Espiritual"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <CheckCircle2 className="text-wellness-sage" size={20} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção 3: Preço e Garantia */}
            <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden text-center rounded-t-[3rem] md:rounded-t-[5rem]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full mesh-gradient opacity-10 pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10 space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-serif">A Melhor Decisão que <br /> Você Tomará Hoje</h2>
                        <p className="text-white/80">Compare os caminhos e escolha a sua liberdade.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-80">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-white/40 mb-2">Psicólogo Tradicional</div>
                            <div className="text-red-400 font-bold">~R$ 2.000 /ano</div>
                            <div className="text-xs text-white/40 mt-1">Anos e anos rodando em círculos, de terapia em terapia.</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="text-white/40 mb-2">Remédios Psiquiátricos</div>
                            <div className="text-red-400 font-bold">R$ 150 - 300 /mês</div>
                            <div className="text-xs text-white/40 mt-1">+ Efeitos colaterais.</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-white/70">
                            <div className="text-white/70 mb-2">Tempo Perdido</div>
                            <div className="text-red-400 font-bold">10 anos</div>
                            <div className="text-xs text-white/70 mt-1">Preso no modo sobrevivência.</div>
                        </div>
                    </div>

                    <div className="p-10 md:p-16 rounded-[3rem] bg-white text-slate-900 shadow-2xl space-y-8 relative">
                        <div className="absolute top-0 right-10 -translate-y-1/2 bg-wellness-gold text-white px-6 py-2 rounded-full font-bold shadow-lg">
                            OFERTA LIMITADA
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">Acesso Completo:</p>
                            <div className="flex items-baseline justify-center gap-2 font-serif text-slate-800">
                                <span className="text-2xl md:text-4xl lg:text-5xl opacity-70">R$</span>
                                <span className="text-7xl md:text-9xl font-bold tracking-tighter leading-none">97</span>
                            </div>
                            <p className="text-slate-500 font-medium">ou 12x de ~R$ 9,70</p>
                        </div>

                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto py-8 border-y border-slate-100">
                            <li className="flex items-center gap-3 text-slate-600">
                                <CheckCircle2 className="text-wellness-gold" size={18} />
                                Treinamento O Mapa da Raiz
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <CheckCircle2 className="text-wellness-gold" size={18} />
                                App para o Diagnóstico Facial
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <CheckCircle2 className="text-wellness-gold" size={18} />
                                Protocolos de 3 minutos
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <CheckCircle2 className="text-wellness-gold" size={18} />
                                Check-in Diário Inteligente
                            </li>
                        </ul>

                        <Button className="w-full h-18 md:h-24 rounded-full text-xl md:text-2xl bg-wellness-gold hover:bg-wellness-gold/90 text-white shadow-2xl shadow-wellness-gold/20 transform hover:-translate-y-1 transition-all">
                            <span className="md:hidden">QUERO O DESCONTO</span>
                            <span className="hidden md:inline">LIBERAR MEU ACESSO COM DESCONTO AGORA</span>
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-12">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full border-2 border-wellness-gold/30 flex items-center justify-center relative">
                                <ShieldCheck size={48} className="text-wellness-gold" />
                                <div className="absolute -bottom-2 bg-wellness-gold text-[10px] font-bold px-2 py-0.5 rounded text-slate-900">7 DIAS</div>
                            </div>
                            <div>
                                <h4 className="font-bold">Garantia Incondicional</h4>
                                <p className="text-sm text-white/50 tracking-tight">&quot;Seu Rosto Não Mente&quot;</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/80 max-w-sm text-left">
                            Se em 7 dias você não achar que esse método te mostrou o caminho da autocura, nós devolvemos cada centavo investido, sem perguntas. Envie apenas um e-mail.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faqs" className="py-24 px-6 bg-wellness-cream">
                <div className="container mx-auto max-w-3xl">
                    <div className="text-center mb-16 space-y-4">
                        <HelpCircle size={48} className="mx-auto text-wellness-sage opacity-20" />
                        <h2 className="text-3xl md:text-5xl font-serif">Dúvidas Frequentes</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Isso substitui meu psicólogo e meu psiquiatra?",
                                a: "Não. É um sistema complementar de autodiagnóstico. Nunca pare medicações sem ordem médica. O Mapa serve para dar profundidade ao seu caso, não serve como emergência."
                            },
                            {
                                q: "Vou ter um aplicativo só meu?",
                                a: "Isso mesmo. Você terá o seu próprio login e usará os seus dados de forma assertiva para gerenciar sua saúde emocional. Sua privacidade estará protegida, nenhum dado sserá exposto sem o seu consentimento"
                            },
                            {
                                q: "E se eu não me adaptar ao método?",
                                a: "Você tem 7 dias de garantia total. Se você não achar que esse método te mostrou o caminho da autocura, devolvemos seu dinheiro sem perguntas. Envie apenas um e-mail."
                            }
                        ].map((faq, i) => (
                            <details key={i} className="group glass rounded-3xl overflow-hidden border-none cursor-pointer">
                                <summary className="p-8 font-bold text-lg list-none flex justify-between items-center">
                                    {faq.q}
                                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-open:rotate-180 transition-transform">
                                        <CheckCircle2 size={16} className="text-slate-300" />
                                    </div>
                                </summary>
                                <div className="px-8 pb-8 text-slate-600 leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>

                    <div className="mt-20 text-center space-y-6">
                        <p className="text-slate-600 font-medium">Ainda indeciso?</p>
                        <Button className="rounded-full px-12 h-16 bg-wellness-sage hover:bg-wellness-sage/90 text-white shadow-lg shadow-wellness-sage/20 transition-all hover:scale-105">
                            <span className="md:hidden">QUERO A AUTOCURA</span>
                            <span className="hidden md:inline">SIM, QUERO A MINHA AUTOCURA AGORA</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-100 text-center">
                <div className="container mx-auto space-y-6">
                    <div className="relative h-8 w-32 mx-auto">
                        <Image
                            src="/images/logo-mapa-raiz.png"
                            alt="Logo"
                            fill
                            className="object-contain opacity-30 grayscale"
                        />
                    </div>
                    <p className="text-xs text-slate-500 max-w-2xl mx-auto">
                        © 2026 Meu Corpo Minha Mente. Todos os direitos reservados. <br />
                        Este site não faz parte do Facebook ou Google Inc. Além disso, não é endossado pelo Facebook ou Google em qualquer aspecto.
                    </p>
                </div>
            </footer>
        </div>
    );
}
