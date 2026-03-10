"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Menu,
    X,
    Lock
} from "lucide-react";

export default function SalesPageVersionB() {
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

            {/* Top Warning Bar */}
            <div className="bg-slate-900 text-white text-center py-3 px-4 text-xs md:text-sm font-medium tracking-wide relative z-50">
                LEIA COM ATENÇÃO: Se você faz terapia ou toma medicação há meses e ainda sente aquele peso no peito...
            </div>

            {/* Navigation */}
            <nav
                className={`fixed top-10 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-4"
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
                        <Button className="bg-wellness-sage hover:bg-wellness-sage/90 text-white rounded-full px-8">
                            Acessar Agora
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden">
                <div className="container mx-auto max-w-4xl relative z-10 text-center space-y-8 mt-10">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] text-slate-900">
                        Como 5 Minutos Olhando no Espelho Podem Revelar a <span className="italic text-wellness-sage">&quot;Raiz do Problema&quot;</span> Que a Terapia Comum Nunca Encontrou.
                    </h1>

                    <h2 className="text-xl md:text-2xl text-slate-700 font-serif leading-snug max-w-3xl mx-auto">
                        O novo Mapa da Raiz (Apoiado pela poderosa Medicina Tradicional Chinesa e pela Leitura Corporal) que quebrou de vez o ciclo de 17 remédios diários e tratamentos sem fim da Terapeuta Cleucia Venancio.
                    </h2>

                    <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed pt-4">
                        Não importa quanto tempo e dinheiro você já gastou pulando de psicólogo em psicólogo. Se a terapia só trata os sintomas (os galhos), a doença nunca vai embora. Descubra agora de forma prática qual é o idioma secreto do seu corpo e entenda, enfim, qual órgão está carregando a dor que você guarda há 1, 5 ou até 10 anos.
                    </p>

                    <div className="pt-8">
                        <Button className="h-auto py-4 px-8 md:px-12 flex flex-col items-center justify-center rounded-full bg-wellness-gold hover:bg-wellness-gold/90 text-white shadow-xl shadow-wellness-gold/20 transition-all hover:scale-105 active:scale-95 group mx-auto">
                            <span className="font-bold text-base md:text-lg flex items-center">
                                SIM, QUERO APRENDER A LER MEU ROSTO E ENCONTRAR MINHA RAIZ
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <span className="text-xs md:text-sm font-normal opacity-90 mt-1 uppercase tracking-wider">Apenas R$ 97 Hoje</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Seção 1: Carta de Vendas - Dor e Identificação */}
            <section className="py-20 px-6 bg-white relative">
                <div className="container mx-auto max-w-3xl space-y-8 text-lg md:text-xl text-slate-700 leading-relaxed font-serif">
                    <div className="p-8 bg-wellness-cream rounded-2xl border border-wellness-sage/20 mb-12 shadow-sm">
                        <p className="font-bold mb-2">De: Esp. Cleucia Venancio e Dra. Raniele</p>
                        <p className="font-bold">Para: Você que não aguenta mais lutar contra o próprio corpo e mente.</p>
                    </div>

                    <p>Pode ser difícil ler o que eu vou te dizer.<br />Mas eu preciso abrir o jogo com você.</p>

                    <p>Se você já foi ao psicólogo por anos a fio, tentou fazer aulas de yoga, comprou livros de autoajuda... e mesmo <strong>tomando seus remédios certinho todos os dias</strong>, você ainda acaba voltando para o quarto escuro da tristeza profunda ou da ansiedade que aperta o peito.</p>

                    <p>Tem algo de muito errado por aí, e o sistema tradicional de saúde nunca te contou.<br />E eu posso falar isso de boca cheia, porque eu passei exatamente 9 anos sendo refém da <strong>&quot;Terapia Sem Fim&quot;</strong>.</p>

                    <div className="py-8 my-10 border-y border-slate-200">
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                            Por nove longos anos, os médicos olhavam para mim em seus consultórios e apenas me davam mais uma receita de farmácia. Chegou ao cúmulo de eu ter que engolir <span className="text-red-700">17 COMPRIMIDOS DIFERENTES POR DIA.</span>
                        </p>
                    </div>

                    <p>Dezessete remédios... todos os dias. Só para conseguir levantar da cama e funcionar.</p>

                    <p>Eu fingia que estava tudo bem. Sorria para as amigas e ia trabalhar. Mas, por dentro, parecia que a vida tinha perdido a cor. Estava tudo cinza, sem graça.</p>

                    <p>Até que a Dra. Raniele, minha filha, trouxe o conhecimento profundo da Medicina Tradicional Chinesa para a nossa clínica... e nós finalmente entendemos a peça do quebra-cabeça que nenhuma conversa no psicólogo tinha enxergado.</p>

                    <blockquote className="border-l-4 border-wellness-sage pl-6 italic text-xl md:text-2xl text-slate-800 font-medium my-12 py-2">
                        &quot;Eles passavam o tempo todo podando as folhas de uma árvore doente... e esqueceram de tratar a verdadeira raiz.&quot;
                    </blockquote>

                    <p>Na verdade, a <strong>Tristeza</strong> enfraquece diretamente o seu Pulmão. O <strong>Medo que nunca passa</strong> não é coisa da sua cabeça; ele estressa os seus Rins (e o seu corpo costuma avisar isso através de fortes olheiras ou problemas na pele em questão de horas).</p>
                </div>
            </section>

            {/* Seção 2: A Solução */}
            <section className="py-24 px-6 bg-wellness-sage/5 relative">
                <div className="container mx-auto max-w-3xl space-y-8 text-lg md:text-xl text-slate-700 leading-relaxed font-serif">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 text-center leading-tight">Quando unimos a leitura prática do nosso Corpo Físico com a sabedoria milenar da Medicina Oriental, tudo fez sentido.</h2>

                    <p className="text-center text-xl md:text-2xl font-bold text-wellness-sage">Nós desvendamos o mapa.</p>

                    <div className="w-full h-[400px] md:h-[500px] relative rounded-[3rem] overflow-hidden my-16 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700">
                        <Image
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200"
                            alt="Especialistas"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <p>Hoje, quando um paciente vem até a nossa clínica presencial para fazer um raio-x emocional da sua vida, nós não ficamos apenas numa conversa de 50 minutos semana após semana.</p>

                    <p>Nós aplicamos O MÉTODO EXECUTIVO: <strong>&quot;Cortando o Mal pela Raiz™&quot;</strong></p>

                    <p>Isso funciona absurdamente bem porque as tensões do nosso rosto e as marcas de expressão gritam o que a nossa cabeça tenta esconder. Sabe qual era a minha raiz? Estava travada em uma decisão que tomei sem perceber quando tinha apenas 9 anos de idade!</p>

                    <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100 my-16">
                        <p className="text-2xl font-bold text-slate-900 mb-6 leading-tight">Quando achamos isso, foi como tirar um piano das costas. O ar voltou a entrar nos pulmões com alívio.</p>
                        <p><strong>Já faz quase 6 anos que eu durmo bem, com a mente leve e o corpo saudável... Sem tomar UM remédio sequer.</strong> E sem aquele medo constante de ter recaídas. Foi a cura profunda do órgão que mudou a minha vida.</p>
                    </div>

                    <p>A Medicina Chinesa é clara nisso há milhares de anos: as 5 grandes emoções (Raiva, Ansiedade, Preocupação Exagerada, Tristeza Profunda e Aquela Sensação de Medo/Cansaço Existencial) adoecem pouco a pouco os seus 5 órgãos principais. Você não adianta nada se tentar cobrir o sol com a peneira.</p>

                    <div className="p-10 bg-red-50 text-red-900 rounded-[2rem] border border-red-100 mt-16 shadow-inner">
                        <p className="font-bold text-2xl mb-6">Aí esbarramos em um grande problema:</p>
                        <p>Nesta nossa clínica, nós cobramos exatamente <strong>R$ 697,00 por UMA ÚNICA SESSÃO</strong> dessas... e simplesmente não temos mais espaço na agenda da Dra. Raniele.</p>
                        <p className="mt-4">Mas, diante de um país onde quase todo mundo sofre hoje de ansiedade e depressão, nós achamos injusto guardar isso só para quem pode pagar caro.</p>
                    </div>
                </div>
            </section>

            {/* Seção 3: O Produto */}
            <section className="py-24 px-6 bg-white">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-16 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight max-w-3xl mx-auto">Por isso, nós empacotamos todo o nosso método e conhecimento em algo que você possa acessar de casa:</h2>
                        <h3 className="text-xl md:text-2xl font-bold text-wellness-sage uppercase tracking-widest mt-8">APRESENTAMOS O TREINAMENTO E O APLICATIVO &quot;O MAPA DA RAIZ&quot;</h3>
                    </div>

                    <p className="text-center text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-20 font-serif">
                        O Mapa da Raiz <strong>não é mais um &quot;cursinho online&quot; para ficar na estante</strong>. É uma ferramenta prática dividida em duas partes muito fortes.
                    </p>

                    <div className="space-y-16">
                        {/* Parte 1 */}
                        <div className="p-8 md:p-14 bg-slate-50 rounded-[3rem] border border-slate-100 relative shadow-xl">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm shadow-xl">
                                Parte 1: O Curso
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 mt-4 font-serif text-slate-900">O MÉTODO EXPRESS PARA SEU ALÍVIO RÁPIDO 🧰</h3>
                            <p className="text-center text-slate-600 mb-10 text-lg">Os nossos Módulos Secretos. Simples, rápidos e direto ao ponto.</p>
                            <ul className="space-y-8">
                                <li className="flex gap-4">
                                    <CheckCircle2 className="text-wellness-sage shrink-0 mt-1" size={28} />
                                    <div>
                                        <p className="font-bold text-slate-900 text-xl mb-1">Módulo 1:</p>
                                        <p className="text-slate-600 text-lg">Entenda de uma vez por todas por que seus tratamentos anteriores não te curaram.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle2 className="text-wellness-sage shrink-0 mt-1" size={28} />
                                    <div>
                                        <p className="font-bold text-slate-900 text-xl mb-1">Módulos 2 e 3 (Os 5 Elementos):</p>
                                        <p className="text-slate-600 text-lg">Entenda a verdadeira causa daquela dor de cabeça que não passa (vem da Raiva!) ou da gastrite que queima no estômago (o palco da Preocupação).</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <CheckCircle2 className="text-wellness-sage shrink-0 mt-1" size={28} />
                                    <div>
                                        <p className="font-bold text-slate-900 text-xl mb-1">O Kit de Primeiros Socorros:</p>
                                        <p className="text-slate-600 text-lg">Exercícios práticos e rápidos (de 3 a 5 minutos) focados em acalmar seu sistema nervoso e desligar as crises de ansiedade na mesma hora. Você vai aprender a usar a respiração e pequenos ajustes no seu dia para frear o desespero antes de dormir.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Parte 2 */}
                        <div className="p-8 md:p-14 bg-wellness-gold/5 rounded-[3rem] border border-wellness-gold/20 relative shadow-xl">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-wellness-gold text-white px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm shadow-xl flex items-center gap-2">
                                <Lock size={16} /> Liberado no 8º Dia
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 mt-4 font-serif text-wellness-gold">PARTE 2: O APLICATIVO INTERATIVO 📲</h3>
                            <p className="text-lg md:text-xl text-center text-slate-700 leading-relaxed font-serif">
                                Como um grande presente para os alunos focados... no seu <strong>oitavo dia</strong> com a gente, nós vamos liberar para você o seu acesso ao &quot;Mapa Facial Interativo&quot;.<br /><br />
                                É um aplicativo onde, pelo seu próprio celular, de frente para o espelho, você clica e aponta onde tem marcas no seu corpo e rosto (ex: olheiras escuras, vermelhidões e rugas). O app vai cruzar essas informações com a Medicina Chinesa e te devolver NA HORA a resposta: qual órgão de fato está em pane e precisa de atenção para te arrancar dessa tristeza.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Seção 4: O Preço (Crossroads) */}
            <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden rounded-t-[3rem] md:rounded-t-[5rem]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full mesh-gradient opacity-10 pointer-events-none" />

                <div className="container mx-auto max-w-3xl relative z-10 space-y-12 font-serif text-lg md:text-xl leading-relaxed text-white/90">
                    <p>Se a gente fosse fazer as contas, se você sentasse cara a cara com a gente hoje... <strong>essa consulta não sairia por menos de R$ 697,00 (fora custos de viagem).</strong></p>

                    <p>Ou, pior, a grana que as pessoas passam uma vida inteira gastando na farmácia com remédios todo mês (que, dependendo da receita, passa fácil dos R$ 250 mensais).</p>

                    <p>Mas nós criamos O Mapa da Raiz focando em VOCÊ, para ser simples, caseiro e acessível.</p>

                    <p>E se nós cortássemos nossa consulta para metade do valor? <strong>Daria cerca de R$ 348.</strong> Honestamente, já valeria cada centavo para se livrar do sofrimento.</p>

                    <p>Mas você não vai precisar pagar nem perto disso. A gente quer que o preço seja a última das suas preocupações agora.</p>

                    <div className="p-10 md:p-16 mt-16 rounded-[3rem] bg-white text-slate-900 shadow-2xl relative text-center">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-wellness-gold text-white px-8 py-3 rounded-full font-bold shadow-xl tracking-wider uppercase text-sm w-max">
                            Apenas para quem fechar hoje
                        </div>

                        <div className="space-y-4 pt-4 mb-10">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Tudo isso por um valor quase simbólico:</p>
                            <p className="text-xl text-slate-400 line-through decoration-red-500 decoration-2">De R$ 697,00</p>
                            <div className="flex justify-center items-baseline gap-2 font-sans">
                                <span className="text-3xl text-slate-600">Por: 12x de</span>
                                <span className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter">9,70</span>
                            </div>
                            <p className="text-slate-500 font-medium">(Ou pagamento único de R$ 97,00 à vista)</p>
                        </div>

                        <ul className="text-left max-w-md mx-auto space-y-4 mb-12 font-sans text-base">
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle2 className="text-wellness-gold shrink-0" size={20} />
                                <strong>Treinamento O Mapa da Raiz</strong> (Módulos Rápidos)
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle2 className="text-wellness-gold shrink-0" size={20} />
                                <strong>App Interativo de Leitura Facial</strong> (No 8º Dia)
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle2 className="text-wellness-gold shrink-0" size={20} />
                                <strong>Acesso imediato e vitalício.</strong>
                            </li>
                        </ul>

                        <Button className="w-full h-auto py-5 flex-col rounded-full bg-wellness-gold hover:bg-wellness-gold/90 text-white shadow-2xl shadow-wellness-gold/20 transform hover:-translate-y-1 transition-all">
                            <span className="font-bold text-lg md:text-xl">QUERO ACESSAR O MEU MAPA AGORA</span>
                            <span className="text-xs font-normal opacity-90 mt-1 uppercase tracking-widest">E destruir a dor pela raiz (Por R$ 97)</span>
                        </Button>
                    </div>

                    <p className="text-center text-base text-white/50 pt-8 font-sans">
                        Um mês desses tratamentos convencionais cheios de remédio, que não consertam a base, sai muito mais caro que isso. O Mapa Da Raiz resolve a causa por um investimento menor que R$ 10 ao mês.
                    </p>
                </div>
            </section>

            {/* Garantia */}
            <section className="py-24 px-6 bg-wellness-sage text-white text-center">
                <div className="container mx-auto max-w-3xl space-y-8">
                    <ShieldCheck size={64} className="mx-auto text-wellness-cream opacity-80" />
                    <h2 className="text-3xl md:text-5xl font-serif font-bold">A Regra dos "7 Dias no Espelho"</h2>
                    <p className="text-xl md:text-2xl font-serif text-wellness-cream">Ou a gente te mostra uma luz de verdade, ou não ficamos com 1 centavo seu.</p>

                    <div className="text-left font-serif text-lg leading-relaxed space-y-6 pt-8 text-white/90">
                        <p>Entre agora. Assista às aulas de imediato, e comece seu tratamento com os Exercícios de Primeiros Socorros. Faça isso por até 7 dias corridos.</p>
                        <p>Se essa imersão não lhe trouxer <strong>a maior verdadeira e inegável clareza sobre o corpo e a mente humana que já te ensinaram até hoje</strong>, nós devolvemos o seu dinheiro.</p>
                        <p>Basta nos enviar um simples e-mail para a equipe (cleucia@clinicaMCMM.com.br). Nós vamos reembolsar tudo o que você pagou, direto no seu cartão ou PIX. Sem burocracia, sem perguntas chatas. E a gente continua amigos.</p>
                    </div>

                    <div className="pt-12">
                        <Button className="h-20 px-10 md:px-14 rounded-full text-xl bg-white text-wellness-sage hover:bg-wellness-cream shadow-2xl shadow-black/20 transition-all hover:scale-105 active:scale-95">
                            QUERO MERGULHAR NA RAIZ AGORA »
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-slate-900 border-t border-white/10 text-center">
                <div className="container mx-auto space-y-6">
                    <div className="relative h-8 w-32 mx-auto">
                        <Image
                            src="/images/logo-mapa-raiz.png"
                            alt="Logo"
                            fill
                            className="object-contain opacity-50 grayscale"
                        />
                    </div>
                    <p className="text-xs text-white/40 max-w-2xl mx-auto">
                        © 2026 Meu Corpo Minha Mente. Todos os direitos reservados. <br />
                        Este site não faz parte do Facebook ou Google Inc. Além disso, não é endossado pelo Facebook ou Google em qualquer aspecto. Os resultados podem variar de pessoa para pessoa. Nenhuma informação substitui o acompanhamento médico.
                    </p>
                </div>
            </footer>
        </div>
    );
}
