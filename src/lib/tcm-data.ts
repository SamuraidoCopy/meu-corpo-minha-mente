export type ElementType = 'Madeira' | 'Fogo' | 'Terra' | 'Metal' | 'Água';

export interface ElementTheme {
    cardBg: string;
    pageBgClass: string;
    cssVars: Record<string, string>;
    badgeBg: string;
    badgeText: string;
    titleColor: string;
    iconBg: string;
    iconColor: string;
    gradientBorder: string;
}

export interface ElementInfo {
    name: ElementType;
    theme: ElementTheme;
    icon: 'Flame' | 'Mountain' | 'Wind' | 'Droplets' | 'TreePine';
    organ: string;
    emotion: string;
    description: string;
    reflectionQuestions: string[];
}

export const ELEMENTS: Record<ElementType, ElementInfo> = {
    Madeira: {
        name: 'Madeira',
        icon: 'TreePine',
        theme: {
            cardBg: 'bg-gradient-to-br from-emerald-50/80 to-teal-100/30',
            pageBgClass: 'mesh-madeira',
            cssVars: {
                '--primary': '155 80% 40%', /* Emerald */
                '--secondary': '170 70% 45%' /* Teal */
            },
            badgeBg: 'bg-emerald-600/10',
            badgeText: 'text-emerald-700',
            titleColor: 'text-emerald-900',
            iconBg: 'bg-emerald-400',
            iconColor: 'bg-teal-500',
            gradientBorder: 'border-emerald-200/50'
        },
        organ: 'Fígado/Vesícula',
        emotion: 'Raiva/Frustração',
        description: 'Associada ao crescimento, planejamento e visão. Em desequilíbrio, gera estagnação, irritabilidade e tensão muscular.',
        reflectionQuestions: [
            'Pense nas situações que recentemente serviram de gatilho para sua raiva ou frustração. Há um padrão?',
            'Como você lida com imprevistos? O excesso de controle tem gerado tensão no seu corpo?'
        ],
    },
    Fogo: {
        name: 'Fogo',
        icon: 'Flame',
        theme: {
            cardBg: 'bg-gradient-to-br from-red-50/80 to-orange-100/30',
            pageBgClass: 'mesh-fogo',
            cssVars: {
                '--primary': '0 80% 55%', /* Red */
                '--secondary': '35 90% 55%' /* Orange */
            },
            badgeBg: 'bg-red-500/10',
            badgeText: 'text-red-700',
            titleColor: 'text-red-900',
            iconBg: 'bg-amber-400',
            iconColor: 'bg-red-500',
            gradientBorder: 'border-red-200/50'
        },
        organ: 'Coração/Intestino Delgado',
        emotion: 'Ansiedade/Euforia',
        description: 'Rege a mente (Shen) e a circulação. Em desequilíbrio, causa insônia, agitação e palpitações.',
        reflectionQuestions: [
            'Quais ambientes ou situações disparam sua ansiedade e aceleram seu coração?',
            'A que ritmo sua mente está trabalhando? A agitação excessiva tem atrapalhado seu repouso?'
        ],
    },
    Terra: {
        name: 'Terra',
        icon: 'Mountain',
        theme: {
            cardBg: 'bg-gradient-to-br from-amber-50/80 to-green-100/20',
            pageBgClass: 'mesh-terra',
            cssVars: {
                '--primary': '35 80% 45%', /* Amber/Brown */
                '--secondary': '100 40% 40%' /* Deep earthy green */
            },
            badgeBg: 'bg-amber-700/10',
            badgeText: 'text-amber-800',
            titleColor: 'text-amber-900',
            iconBg: 'bg-amber-500',
            iconColor: 'bg-green-600',
            gradientBorder: 'border-amber-200/50'
        },
        organ: 'Baço/Estômago',
        emotion: 'Preocupação/Pensamento Excessivo',
        description: 'Responsável pela digestão física e mental. O desequilíbrio traz cansaço, obsessão e problemas digestivos.',
        reflectionQuestions: [
            'Você tem remoído problemas do passado ou preocupações do futuro repetidamente?',
            'Qual situação atual está difícil de "digerir" e tem sugado a sua energia mental?'
        ],
    },
    Metal: {
        name: 'Metal',
        icon: 'Wind',
        theme: {
            cardBg: 'bg-gradient-to-br from-slate-100/80 to-slate-200/30',
            pageBgClass: 'mesh-metal',
            cssVars: {
                '--primary': '215 20% 45%', /* Slate */
                '--secondary': '210 10% 60%' /* Silver */
            },
            badgeBg: 'bg-slate-500/10',
            badgeText: 'text-slate-700',
            titleColor: 'text-slate-900',
            iconBg: 'bg-slate-400',
            iconColor: 'bg-slate-500',
            gradientBorder: 'border-slate-300/50'
        },
        organ: 'Pulmão/Intestino Grosso',
        emotion: 'Tristeza/Apego',
        description: 'Ligado à defesa (imunidade) e ao deixar ir. Desequilíbrios geram baixa imunidade, tristeza profunda e problemas de pele.',
        reflectionQuestions: [
            'Há alguma situação, pessoa ou sentimento que você está tendo grande dificuldade em deixar ir?',
            'Você tem sentido dificuldade em estabelecer limites de proteção e dizer "não"?'
        ],
    },
    Água: {
        name: 'Água',
        icon: 'Droplets',
        theme: {
            cardBg: 'bg-gradient-to-br from-blue-50/80 to-cyan-100/30',
            pageBgClass: 'mesh-agua',
            cssVars: {
                '--primary': '220 80% 50%', /* Deep Blue */
                '--secondary': '190 90% 45%' /* Cyan */
            },
            badgeBg: 'bg-blue-600/10',
            badgeText: 'text-blue-800',
            titleColor: 'text-blue-900',
            iconBg: 'bg-blue-400',
            iconColor: 'bg-cyan-600',
            gradientBorder: 'border-blue-200/50'
        },
        organ: 'Rins/Bexiga',
        emotion: 'Medo/Insegurança',
        description: 'A reserva de energia vital ("bateria"). O desequilíbrio afeta a disposição, a libido e gera medos paralisantes.',
        reflectionQuestions: [
            'Quais medos profundos ou inseguranças estão limitando as suas decisões neste momento?',
            'Você sente que exigiu além da conta da sua "bateria vital" sem recarregá-la adequadamente?'
        ],
    },
};

export interface FacialZone {
    id: string;
    name: string;
    element: ElementType;
    svgPath: string; // Placeholder for SVG path d attribute
    description: string;
}

// Topology matched to the smooth, organic reference image
export const FACIAL_ZONES: FacialZone[] = [
    {
        id: 'testa_centro',
        name: 'Centro da Testa (Intestino Delgado)',
        element: 'Fogo',
        svgPath: 'M 120,50 L 180,50 L 165,85 L 135,85 Z',
        description: 'Conectada ao Intestino Delgado e Coração. Vermelhidão ou acne aqui podem indicar calor emocional.',
    },
    {
        id: 'testa_laterais',
        name: 'Laterais da Testa (Bexiga)',
        element: 'Água',
        svgPath: 'M 80,80 L 115,50 L 130,85 L 95,90 Z M 220,80 L 185,50 L 170,85 L 205,90 Z',
        description: 'Relacionada à Bexiga e vias urinárias. Tensão aponta para estresse crônico.',
    },
    {
        id: 'sobrancelhas',
        name: 'Arcos das Sobrancelhas (Coração)',
        element: 'Fogo',
        svgPath: 'M 70,115 C 90,105 110,105 130,115 C 110,125 90,125 70,115 Z M 230,115 C 210,105 190,105 170,115 C 190,125 210,125 230,115 Z',
        description: 'Sinaliza palpitações, insônia ou forte oscilação emocional ligada ao Shen (Mente).',
    },
    {
        id: 'ponto_figado',
        name: 'Entre Sobrancelhas (Fígado)',
        element: 'Madeira',
        svgPath: 'M 150,113 A 12,12 0 1,1 150,137 A 12,12 0 1,1 150,113 Z',
        description: 'Conhecido como o assento da mente. Linhas verticais aqui indicam raiva retida.',
    },
    {
        id: 'temporas',
        name: 'Laterais dos Olhos (Vesícula Biliar)',
        element: 'Madeira',
        svgPath: 'M 50,115 A 12,12 0 1,1 50,139 A 12,12 0 1,1 50,115 Z M 250,115 A 12,12 0 1,1 250,139 A 12,12 0 1,1 250,115 Z',
        description: 'Ligadas à Vesícula Biliar (decisão e coragem). Dor de cabeça temporal reflete estagnação.',
    },
    {
        id: 'olheiras',
        name: 'Abaixo dos Olhos (Rins)',
        element: 'Água',
        svgPath: 'M 75,145 C 95,165 115,165 135,145 C 115,175 95,175 75,145 Z M 225,145 C 205,165 185,165 165,145 C 185,175 205,175 225,145 Z',
        description: 'Os Rins guardam a energia vital. Escurecimento profundo (olheiras) indica exaustão celular.',
    },
    {
        id: 'bochechas_superiores',
        name: 'Bochechas Superiores e Metade do Nariz (Estômago)',
        element: 'Terra',
        svgPath: 'M 60,180 Q 90,175 120,180 Q 150,195 180,180 Q 210,175 240,180 L 235,220 Q 205,225 180,220 Q 150,210 120,220 Q 95,225 65,220 Z',
        description: 'Reflete como "digerimos" os alimentos e pensamentos. Passa pela metade do nariz conectando as bochechas.',
    },
    {
        id: 'hormonal',
        name: 'Ponta do Nariz ao Queixo (Hormonal)',
        element: 'Fogo',
        svgPath: 'M 145,210 L 175,240 L 180,310 Q 150,330 120,310 L 125,240 Z',
        description: 'Área governada pelo fogo sexual e eixo endócrino. Cravos e acne cíclica evidenciam desequilíbrios.',
    },
    {
        id: 'bochechas_inferiores',
        name: 'Bochechas Inferiores (Pulmão)',
        element: 'Metal',
        svgPath: 'M 65,230 L 115,230 L 105,300 L 70,280 Z M 235,230 L 185,230 L 195,300 L 230,280 Z',
        description: 'Ligado aos Pulmões, à imunidade e melancolia. Marcas persistentes podem indicar baixa defesa energética.',
    },
    {
        id: 'pescoco',
        name: 'Linha do Pescoço (Intestino Grosso)',
        element: 'Metal',
        svgPath: 'M 120,340 C 140,360 160,360 180,340 L 170,370 C 155,380 145,380 130,370 Z',
        description: 'Reflete a retenção de toxinas e o Intestino Grosso (dificuldade de desapegar).',
    },
];

export interface Question {
    id: string;
    text: string;
    element: ElementType;
}

export const getTcmQuestions = (gender: string = 'Feminino'): Question[] => [
    // FOGO (Coração)
    { id: 'fogo_1', text: 'Você tem dificuldade para dormir ou tem muitos sonhos agitados?', element: 'Fogo' },
    { id: 'fogo_2', text: `Sente palpitações ou aperto no peito quando está ansios${gender === 'Masculino' ? 'o' : 'a'}?`, element: 'Fogo' },
    { id: 'fogo_3', text: 'Sente que sua mente não para (pensamento acelerado)?', element: 'Fogo' },

    // TERRA (Baço)
    { id: 'terra_1', text: 'Sente muito cansaço físico ou peso no corpo após comer?', element: 'Terra' },
    { id: 'terra_2', text: 'Tem preocupações excessivas ou fica remoendo pensamentos?', element: 'Terra' },
    { id: 'terra_3', text: 'Tem desejo incontrolável por doces?', element: 'Terra' },

    // METAL (Pulmão)
    { id: 'metal_1', text: 'Sente tristeza profunda ou vontade de chorar sem motivo?', element: 'Metal' },
    { id: 'metal_2', text: 'Tem pele seca, alergias ou problemas respiratórios frequentes?', element: 'Metal' },
    { id: 'metal_3', text: 'Tem dificuldade em estabelecer limites ou dizer não?', element: 'Metal' },

    // ÁGUA (Rins)
    { id: 'agua_1', text: 'Sente dores na lombar ou nos joelhos?', element: 'Água' },
    { id: 'agua_2', text: 'Tem muitos medos ou inseguranças que te paralisam?', element: 'Água' },
    { id: 'agua_3', text: 'Sente muito frio nas mãos e pés?', element: 'Água' },

    // MADEIRA (Fígado)
    { id: 'madeira_1', text: 'Sente muita irritabilidade ou impaciência?', element: 'Madeira' },
    { id: 'madeira_2', text: gender === 'Masculino' ? 'Sente frustração constante ou ataques de fúria repentinos?' : 'Tem TPM forte, cólicas ou ciclos irregulares?', element: 'Madeira' },
    { id: 'madeira_3', text: 'Sente tensão nos ombros e pescoço?', element: 'Madeira' },
];

