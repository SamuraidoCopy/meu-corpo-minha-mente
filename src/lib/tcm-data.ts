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

export const FACIAL_ZONES: FacialZone[] = [
    {
        id: 'testa_centro',
        name: 'Centro da Testa (Intestino Delgado)',
        element: 'Fogo',
        svgPath: 'M 110,50 L 190,50 L 175,100 L 150,120 L 125,100 Z',
        description: 'Conectada ao Intestino Delgado e Coração. Vermelhidão ou acne aqui podem indicar calor emocional, ansiedade ou problemas digestivos de absorção.',
    },
    {
        id: 'testa_laterais',
        name: 'Laterais da Testa (Bexiga)',
        element: 'Água',
        svgPath: 'M 60,70 L 110,50 L 125,100 L 80,110 Z M 240,70 L 190,50 L 175,100 L 220,110 Z',
        description: 'Relacionada à Bexiga e vias urinárias. O Meridiano da Bexiga afeta o sistema nervoso. Tensão aponta para estresse crônico.',
    },
    {
        id: 'sobrancelhas',
        name: 'Arcos das Sobrancelhas (Coração)',
        element: 'Fogo',
        svgPath: 'M 70,125 Q 105,105 135,120 Q 105,135 70,125 Z M 230,125 Q 195,105 165,120 Q 195,135 230,125 Z',
        description: 'Sinaliza palpitações, insônia ou forte oscilação emocional ligada ao Shen (Mente) e ao Coração.',
    },
    {
        id: 'ponto_figado',
        name: 'Entre Sobrancelhas (Fígado)',
        element: 'Madeira',
        svgPath: 'M 140, 120 A 10,10 0 1,1 140,140 A 10,10 0 1,1 140,120', // Literal centered circle
        description: 'Conhecido como o assento da mente. Linhas verticais aqui (ruga do leão) indicam raiva retida, frustração excessiva ou fígado sobrecarregado.',
    },
    {
        id: 'temporas',
        name: 'Laterais dos Olhos (Vesícula Biliar)',
        element: 'Madeira',
        svgPath: 'M 35, 125 A 10,10 0 1,1 35,145 A 10,10 0 1,1 35,125 M 245, 125 A 10,10 0 1,1 245,145 A 10,10 0 1,1 245,125', // Two prominent dots
        description: 'Ligadas à Vesícula Biliar (decisão e coragem). Dor de cabeça temporal reflete estagnação do Qi do Fígado/Vesícula.',
    },
    {
        id: 'olheiras',
        name: 'Abaixo dos Olhos (Rins)',
        element: 'Água',
        svgPath: 'M 50,150 C 80,185 130,185 145,150 C 130,195 80,195 50,150 Z M 250,150 C 220,185 170,185 155,150 C 170,195 220,195 250,150 Z M 65,150 Q 100,170 120,150 Q 100,180 65,150 Z M 235,150 Q 200,170 180,150 Q 200,180 235,150 Z',
        description: 'Os Rins guardam a energia vital. Escurecimento profundo (olheiras) indica exaustão celular, falta de sono reparador ou grande medo.',
    },
    {
        id: 'bochechas_superiores',
        name: 'Bochechas Superiores (Estômago)',
        element: 'Terra',
        svgPath: 'M 75,185 Q 100,200 125,185 L 125,230 Q 95,230 75,210 Z M 225,185 Q 200,200 175,185 L 175,230 Q 205,230 225,210 Z', // Smaller, closer to nose 
        description: 'Reflete como "digerimos" os alimentos e pensamentos. Espinhas ou vermelhidão excessiva aqui mostram Calor (inflamação) no Estômago.',
    },
    {
        id: 'bochechas_inferiores',
        name: 'Bochechas Inferiores (Pulmão)',
        element: 'Metal',
        svgPath: 'M 55,210 Q 80,240 118,245 L 115,310 Q 60,290 55,210 Z M 245,210 Q 220,240 182,245 L 185,310 Q 240,290 245,210 Z',
        description: 'Ligado aos Pulmões, à imunidade, tristeza profunda e melancolia. Marcas persistentes podem indicar baixa defesa energética.',
    },
    {
        id: 'hormonal',
        name: 'Nariz a Queixo (Problemas Hormonais)',
        element: 'Fogo',
        svgPath: 'M 135,170 L 165,170 L 185,320 Q 150,360 115,320 Z',
        description: 'Área governada pelo fogo sexual e eixo endócrino. Cravos e acne cíclica evidenciam desequilíbrios hormonais, SOP, estresse reprodutivo.',
    },
    {
        id: 'pescoco',
        name: 'Linha do Pescoço (Intestino Grosso)',
        element: 'Metal',
        svgPath: 'M 100,340 Q 100,390 150,400 Q 200,390 200,340 C 190,370 150,380 110,340 Z',
        description: 'Reflete a retenção de toxinas e o Intestino Grosso (dificuldade de desapegar). A congestão linfática evidencia o bloqueio no fluxo.',
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

