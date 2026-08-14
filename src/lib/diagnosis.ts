import { FACIAL_ZONES, getTcmQuestions, type ElementType, type FacialZone, type Question } from './tcm-data';

/** Version stored with every completed assessment so that old readings remain auditable. */
export const DIAGNOSIS_ALGORITHM_VERSION = 'diagnosis-v2';

/** This order is part of the algorithm contract; never rely on object key order. */
export const ELEMENT_ORDER = ['Madeira', 'Fogo', 'Terra', 'Metal', 'Água'] as const satisfies readonly ElementType[];

export type DiagnosisKind = 'single' | 'tie' | 'combined' | 'insufficient';
export type MainDiagnosisKind = Extract<DiagnosisKind, 'single' | 'tie' | 'insufficient'>;
export type ResolutionMethod = 'main_questions' | 'contextual_tiebreak' | 'comparative_choice' | 'combined_acknowledged';
export type FacialConvergence = 'no_facial_data' | 'convergent' | 'partially_convergent' | 'divergent';
export type ComparativeChoice = ElementType | 'none';

export type ElementScores = Record<ElementType, number>;
export type MainAnswers = Readonly<Record<string, boolean | undefined>>;
export type ContextualAnswers = Readonly<Partial<Record<ElementType, number>>>;

export interface MainDiagnosis {
  kind: MainDiagnosisKind;
  scores: ElementScores;
  maxScore: number;
  elements: ElementType[];
  resolutionMethod: 'main_questions';
}

export interface FacialDiagnosis {
  kind: MainDiagnosisKind;
  scores: ElementScores;
  maxScore: number;
  elements: ElementType[];
  selectedZoneIds: string[];
  unknownZoneIds: string[];
}

export interface TiebreakQuestion {
  id: string;
  element: ElementType;
  text: string;
  scale: readonly [0, 1, 2, 3];
}

export interface TiebreakResult {
  kind: Extract<DiagnosisKind, 'single' | 'tie' | 'combined'>;
  scores: ElementScores;
  maxScore: number;
  elements: ElementType[];
  needsComparison: boolean;
  resolutionMethod: Exclude<ResolutionMethod, 'main_questions'>;
}

const emptyScores = (): ElementScores =>
  Object.fromEntries(ELEMENT_ORDER.map((element) => [element, 0])) as ElementScores;

const orderedElementsAtScore = (scores: ElementScores, score: number): ElementType[] =>
  ELEMENT_ORDER.filter((element) => scores[element] === score);

const toDiagnosisKind = (elements: readonly ElementType[], maxScore: number): MainDiagnosisKind => {
  if (maxScore <= 0) return 'insufficient';
  return elements.length === 1 ? 'single' : 'tie';
};

/**
 * Calculates the primary reading. Only an explicit `true` answer scores a point;
 * missing/negative answers are intentionally neutral rather than a forced winner.
 */
export function calculateMainDiagnosis(
  answers: MainAnswers,
  questions: readonly Question[] = getTcmQuestions(),
): MainDiagnosis {
  const scores = emptyScores();

  for (const question of questions) {
    if (answers[question.id] === true) scores[question.element] += 1;
  }

  const maxScore = Math.max(...ELEMENT_ORDER.map((element) => scores[element]));
  const elements = maxScore > 0 ? orderedElementsAtScore(scores, maxScore) : [];

  return {
    kind: toDiagnosisKind(elements, maxScore),
    scores,
    maxScore,
    elements,
    resolutionMethod: 'main_questions',
  };
}

/**
 * Counts selected facial zones using the canonical zone list. Selection order and
 * repeated IDs cannot change the result; unknown IDs are reported but contribute no points.
 */
export function calculateFacialScores(
  selectedZoneIds: readonly string[],
  zones: readonly FacialZone[] = FACIAL_ZONES,
): FacialDiagnosis {
  const selected = new Set(selectedZoneIds);
  const knownIds = new Set(zones.map((zone) => zone.id));
  const unknownZoneIds = [...new Set(selectedZoneIds.filter((id) => !knownIds.has(id)))];
  const selectedZones = zones.filter((zone) => selected.has(zone.id));
  const scores = emptyScores();

  for (const zone of selectedZones) scores[zone.element] += 1;

  const maxScore = Math.max(...ELEMENT_ORDER.map((element) => scores[element]));
  const elements = maxScore > 0 ? orderedElementsAtScore(scores, maxScore) : [];

  return {
    kind: toDiagnosisKind(elements, maxScore),
    scores,
    maxScore,
    elements,
    selectedZoneIds: selectedZones.map((zone) => zone.id),
    unknownZoneIds,
  };
}

/**
 * Compares the explanatory facial signal with the already calculated main result.
 * This function never changes the main result or selects a dominant element.
 */
export function classifyFacialConvergence(
  mainElements: readonly ElementType[],
  facial: Pick<FacialDiagnosis, 'elements'>,
): FacialConvergence {
  if (facial.elements.length === 0) return 'no_facial_data';
  if (mainElements.length === 0) return 'divergent';

  const mainSet = new Set(mainElements);
  const facialSet = new Set(facial.elements);
  const intersectionSize = [...facialSet].filter((element) => mainSet.has(element)).length;

  if (intersectionSize === 0) return 'divergent';
  if (intersectionSize === mainSet.size && intersectionSize === facialSet.size) return 'convergent';
  return 'partially_convergent';
}

/** Contextual questions are deliberately distinct from the main screening questions. */
export const TIEBREAK_QUESTIONS: Record<ElementType, TiebreakQuestion> = {
  Madeira: {
    id: 'desempate_madeira',
    element: 'Madeira',
    text: 'Nos últimos 30 dias, com que frequência você sentiu irritação ou tensão quando seus planos foram interrompidos?',
    scale: [0, 1, 2, 3],
  },
  Fogo: {
    id: 'desempate_fogo',
    element: 'Fogo',
    text: 'Nos últimos 30 dias, com que frequência sua mente ficou acelerada justamente quando precisava desacelerar?',
    scale: [0, 1, 2, 3],
  },
  Terra: {
    id: 'desempate_terra',
    element: 'Terra',
    text: 'Nos últimos 30 dias, com que frequência preocupações ou pensamentos repetitivos sobrecarregaram você?',
    scale: [0, 1, 2, 3],
  },
  Metal: {
    id: 'desempate_metal',
    element: 'Metal',
    text: 'Nos últimos 30 dias, com que frequência tristeza, dificuldade com limites ou desapego pesaram sobre você?',
    scale: [0, 1, 2, 3],
  },
  Água: {
    id: 'desempate_agua',
    element: 'Água',
    text: 'Nos últimos 30 dias, com que frequência medo, insegurança ou exaustão limitaram suas decisões?',
    scale: [0, 1, 2, 3],
  },
};

const normalizeTiedElements = (elements: readonly ElementType[]): ElementType[] => {
  const requested = new Set(elements);
  return ELEMENT_ORDER.filter((element) => requested.has(element));
};

const validateContextualScore = (score: number, element: ElementType): number => {
  if (!Number.isInteger(score) || score < 0 || score > 3) {
    throw new RangeError(`A pontuação de desempate de ${element} deve estar entre 0 e 3.`);
  }
  return score;
};

/**
 * Resolves only a primary tie. Non-tied answers are ignored, preventing an
 * accidental third element from influencing the decision. If contextual scores
 * remain tied, pass a comparative choice (`ElementType` or `'none'`) to finish.
 */
export function calculateTiebreak(
  tiedElements: readonly ElementType[],
  answers: ContextualAnswers,
  comparativeChoice?: ComparativeChoice,
): TiebreakResult {
  const elements = normalizeTiedElements(tiedElements);
  if (elements.length < 2) {
    throw new RangeError('O desempate precisa receber pelo menos dois elementos empatados.');
  }

  const scores = emptyScores();
  for (const element of elements) {
    const answer = answers[element] ?? 0;
    scores[element] = validateContextualScore(answer, element);
  }

  const maxScore = Math.max(...elements.map((element) => scores[element]));
  const winners = elements.filter((element) => scores[element] === maxScore);

  if (winners.length === 1) {
    return {
      kind: 'single',
      scores,
      maxScore,
      elements: winners,
      needsComparison: false,
      resolutionMethod: 'contextual_tiebreak',
    };
  }

  if (comparativeChoice !== undefined) {
    if (comparativeChoice === 'none') {
      return {
        kind: 'combined',
        scores,
        maxScore,
        elements: winners,
        needsComparison: false,
        resolutionMethod: 'combined_acknowledged',
      };
    }
    if (!winners.includes(comparativeChoice)) {
      throw new RangeError('A escolha comparativa deve estar entre os elementos ainda empatados.');
    }
    return {
      kind: 'single',
      scores,
      maxScore,
      elements: [comparativeChoice],
      needsComparison: false,
      resolutionMethod: 'comparative_choice',
    };
  }

  return {
    kind: 'tie',
    scores,
    maxScore,
    elements: winners,
    needsComparison: true,
    resolutionMethod: 'contextual_tiebreak',
  };
}

/** Semantic alias for callers that describe this operation as resolution. */
export const resolveTiebreak = calculateTiebreak;
