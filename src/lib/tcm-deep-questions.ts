import { ElementType } from './tcm-data'

export interface FacialMark {
    id: string;
    name: string;
    meaning: string;
    elementHint?: string;
    location: string;
}

export const FACIAL_MARKS: FacialMark[] = [
    { id: 'm1', name: 'Marcas Retilíneas Nítidas', meaning: 'Caráter estável, autocontrole. Se houver quebra na linha, indica rompante de raiva.', location: 'Geral' },
    { id: 'm2', name: 'Marca Convexa', meaning: 'Tendência a ter autoestima elevada, orgulho próprio, prepotência.', location: 'Geral' },
    { id: 'm3', name: 'Marcas Verticais na Testa', meaning: 'Pessoa altamente reflexiva, grande poder de concentração.', location: 'Testa' },
    { id: 'm4', name: 'Marca Encurvada Côncava', meaning: 'Enfrenta as situações com foco em resolução, franca.', location: 'Geral' },
    { id: 'm5', name: 'Marca Curta e Segmentada', meaning: 'Tendência a ser volátil, instável.', location: 'Geral' },
    { id: 'm6', name: 'Marca Canto Interno do Olho', meaning: 'Boa expressividade e comunicação emocional.', location: 'Olhos' },
    { id: 'm7', name: 'Rugas de Vênus (Volume no Seio da Face)', meaning: 'Pessoa saudável, libidinosa.', location: 'Bochechas' },
    { id: 'm8', name: 'Músculo Superciliar Tencionado', meaning: 'Concentrado, rápido entusiasmo, perplexidade.', location: 'Sobrancelha' },
    { id: 'm9', name: 'Marca Horizontal Acima do Nariz', meaning: 'Raiva contida, não externalizada. Submetida à pressão, mas motivada a melhorar.', location: 'Nariz' },
    { id: 'm10', name: 'Bigode Chinês Profundo', meaning: 'Poder de comunicação, tende a falar muito.', location: 'Lábios' },
    { id: 'm11', name: 'Canto da Boca para Baixo (Geral)', meaning: 'Exigente, passou por experiências tristes marcantes.', location: 'Lábios' },
    { id: 'm12', name: 'Canto Direito da Boca para Baixo', meaning: 'Analítica, ansiosa, materialista. Sofre por antecipação.', location: 'Lábios' },
    { id: 'm13', name: 'Canto Esquerdo da Boca para Baixo', meaning: 'Passional, emocional. Houve perda e sofrimento real.', location: 'Lábios' },
    { id: 'm14', name: 'Marcas Acima do Lábio Superior', meaning: 'Tendência a ser severa, austera e/ou histórico de tabagismo.', location: 'Lábios' },
    { id: 'm15', name: 'Marca do General (Vertical no Canto da Face)', meaning: 'Firmeza nas decisões, autoridade.', location: 'Face Lateral' },
    { id: 'm16', name: 'Marcas Verticais na Bochecha', meaning: 'Sem rompantes emocionais. Pessoas serenas.', location: 'Bochechas' },
    { id: 'm17', name: 'Marca entre Sobrancelhas Iguais', meaning: 'Equilíbrio entre emocional e racional.', location: 'Sobrancelha' },
    { id: 'm18', name: 'Três Marcas entre as Sobrancelhas', meaning: 'Extremamente ansiosa, sofre pesado por antecipação.', location: 'Sobrancelha' },
    { id: 'm19', name: 'Músculo de Amuo do Queixo', meaning: 'Teimoso, obstinado e persistente.', location: 'Queixo' },
]

export const DEEP_QUESTIONS: Record<ElementType, string[]> = {
    Madeira: [
        "Onde você sente que perdeu o controle ao tentar abraçar o mundo inteiro, forçando o seu fígado a tentar purificar toda a toxina dos outros?",
        "Quantas vezes você deixou de agir por medo do confronto ou de decepcionar?",
        "O que você está segurando com tanta força, tentando ter a razão, que na verdade o(a) atrapalha de simplesmente avançar?"
    ],
    Fogo: [
        "Para onde você está correndo tão rápido que se esquece de viver o agora e permite que seu coração acelere sem destino?",
        "O que silencia a sua paixão de forma a te deixar apático(a) e sem conseguir expressar sua verdadeira alegria?",
        "Que vazio é esse que você tenta calar com pressa, ansiedade e palavras que não param?"
    ],
    Terra: [
        "De quem você está cuidando o tempo todo enquanto negligencia a si mesmo(a)?",
        "Que pensamentos e preocupações obsessivos estão sugando a energia central do seu baço e estômago, tirando a sua vitalidade física?",
        "Por que se sentir útil e suportar os pesos das outras pessoas tornou-se mais atrativo do que nutrir o próprio ventre e os próprios sonhos?"
    ],
    Metal: [
        "Qual apego ao passado ou luto silenciado está impedindo os seus pulmões de absorverem profundamente o ar novo?",
        "Quanta energia você gasta tentando disfarçar uma mágoa antiga que ainda dói escondida atrás da exata precisão e da tristeza?",
        "O que aconteceria se você soltasse essa necessidade de controle, deixasse ir quem partiu, e apenas inspirasse um ciclo leve?"
    ],
    Água: [
        "Qual medo invisível está congelando o seu futuro, assustando os seus rins e roubando sua vitalidade primordial?",
        "Até que ponto essa necessidade por segurança abafa a sua verdadeira essência fluida e corajosa?",
        "O que a sua intuição, vinda lá do osso, tem sussurrado enquanto o seu consciente entra em pânico e tenta analisar todos os riscos exaustivamente?"
    ]
}
