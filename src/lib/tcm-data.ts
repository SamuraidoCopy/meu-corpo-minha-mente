export type ElementType = 'Madeira' | 'Fogo' | 'Terra' | 'Metal' | 'Água';

export interface ElementInfo {
    name: ElementType;
    color: string;
    organ: string;
    emotion: string;
    description: string;
}

export const ELEMENTS: Record<ElementType, ElementInfo> = {
    Madeira: {
        name: 'Madeira',
        color: 'bg-green-500',
        organ: 'Fígado/Vesícula',
        emotion: 'Raiva/Frustração',
        description: 'Associada ao crescimento, planejamento e visão. Em desequilíbrio, gera estagnação, irritabilidade e tensão muscular.',
    },
    Fogo: {
        name: 'Fogo',
        color: 'bg-red-500',
        organ: 'Coração/Intestino Delgado',
        emotion: 'Ansiedade/Euforia',
        description: 'Rege a mente (Shen) e a circulação. Em desequilíbrio, causa insônia, agitação e palpitações.',
    },
    Terra: {
        name: 'Terra',
        color: 'bg-yellow-500',
        organ: 'Baço/Estômago',
        emotion: 'Preocupação/Pensamento Excessivo',
        description: 'Responsável pela digestão física e mental. O desequilíbrio traz cansaço, obsessão e problemas digestivos.',
    },
    Metal: {
        name: 'Metal',
        color: 'bg-gray-400',
        organ: 'Pulmão/Intestino Grosso',
        emotion: 'Tristeza/Apego',
        description: 'Ligado à defesa (imunidade) e ao deixar ir. Desequilíbrios geram baixa imunidade, tristeza profunda e problemas de pele.',
    },
    Água: {
        name: 'Água',
        color: 'bg-blue-600',
        organ: 'Rins/Bexiga',
        emotion: 'Medo/Insegurança',
        description: 'A reserva de energia vital ("bateria"). O desequilíbrio afeta a disposição, a libido e gera medos paralisantes.',
    },
};

export interface FacialZone {
    id: string;
    name: string;
    element: ElementType;
    svgPath: string; // Placeholder for SVG path d attribute
    description: string;
}

// Mapeamento Simplificado para MVP (ViewBox 0 0 300 400)
export const FACIAL_ZONES: FacialZone[] = [
    {
        id: 'testa',
        name: 'Testa (Coração/Shen)',
        element: 'Fogo',
        // Top area of face
        svgPath: 'M 50,110 C 50,60 100,30 150,30 C 200,30 250,60 250,110 Z',
        description: 'A testa reflete o estado do Coração e da mente (Shen). Marcas aqui indicam excesso de atividade mental ou ansiedade.',
    },
    {
        id: 'sobrancelhas',
        name: 'Entre Sobrancelhas (Fígado)',
        element: 'Madeira',
        // Small area between eyebrows
        svgPath: 'M 130,130 L 170,130 L 170,160 L 130,160 Z',
        description: 'A "sede do governo". Linhas verticais aqui (ruga do leão) indicam frustração acumulada ou fígado sobrecarregado.',
    },
    {
        id: 'olhos_esq',
        name: 'Olho Esquerdo',
        element: 'Madeira',
        svgPath: 'M 60,160 Q 90,140 120,160 Q 90,180 60,160 Z',
        description: 'O Fígado "abre-se nos olhos". Olheiras e bolsas também se relacionam aos Rins.',
    },
    {
        id: 'olhos_dir',
        name: 'Olho Direito',
        element: 'Madeira',
        svgPath: 'M 180,160 Q 210,140 240,160 Q 210,180 180,160 Z',
        description: 'O Fígado "abre-se nos olhos". Olheiras e bolsas também se relacionam aos Rins.',
    },
    {
        id: 'nariz',
        name: 'Nariz (Baço/Estômago)',
        element: 'Terra',
        // Central nose area
        svgPath: 'M 130,160 L 170,160 L 180,240 L 120,240 Z',
        description: 'Reflete o Baço e Estômago. Vermelhidão ou espinhas aqui podem indicar calor no estômago.',
    },
    {
        id: 'bochecha_esq',
        name: 'Bochecha Esquerda (Fígado)',
        element: 'Madeira',
        // Left cheek (visual left)
        svgPath: 'M 50,180 L 110,180 L 100,260 L 50,240 Z',
        description: 'Ligada ao Fígado. Manchas ou acne aqui podem indicar estagnação de Qi.',
    },
    {
        id: 'bochecha_dir',
        name: 'Bochecha Direita (Pulmão)',
        element: 'Metal',
        // Right cheek
        svgPath: 'M 190,180 L 250,180 L 250,240 L 200,260 Z',
        description: 'Ligada ao Pulmão. Problemas aqui podem indicar tristeza ou baixa imunidade.',
    },
    {
        id: 'boca',
        name: 'Boca e Queixo (Rins)',
        element: 'Água',
        // Bottom area including mouth
        svgPath: 'M 110,280 L 190,280 L 180,350 Q 150,380 120,350 Z',
        description: 'Reflete o sistema Reprodutor e Rins (Hormonal). Acne hormonal é comum aqui.',
    },
];

export interface Question {
    id: string;
    text: string;
    element: ElementType;
}

export const TCM_QUESTIONS: Question[] = [
    // FOGO (Coração)
    { id: 'fogo_1', text: 'Você tem dificuldade para dormir ou tem muitos sonhos agitados?', element: 'Fogo' },
    { id: 'fogo_2', text: 'Sente palpitações ou aperto no peito quando está ansiosa?', element: 'Fogo' },
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
    { id: 'madeira_2', text: 'Tem TPM forte, cólicas ou ciclos irregulares?', element: 'Madeira' },
    { id: 'madeira_3', text: 'Sente tensão nos ombros e pescoço?', element: 'Madeira' },
];

