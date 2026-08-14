'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin-access'
import {
    buildDiagnosticRecord,
    DIAGNOSIS_ALGORITHM_VERSION,
    parseDiagnosisProgress,
    parseFacialZoneSelection,
    parseDiagnosticSubmission,
} from '@/lib/diagnosis-submission'
import { calculateMainDiagnosis, ELEMENT_ORDER } from '@/lib/diagnosis'

export async function completeDiagnosis(payload: unknown) {
    const rawAssessmentId = payload && typeof payload === 'object' && 'assessmentId' in payload
        ? (payload as { assessmentId?: unknown }).assessmentId
        : undefined
    if (rawAssessmentId !== undefined && (typeof rawAssessmentId !== 'string' || !/^[0-9a-f-]{36}$/i.test(rawAssessmentId))) {
        return { error: 'Avaliação inválida.' }
    }
    const assessmentId = typeof rawAssessmentId === 'string' && /^[0-9a-f-]{36}$/i.test(rawAssessmentId)
        ? rawAssessmentId
        : null
    let parsed
    try {
        parsed = parseDiagnosticSubmission(payload)
        if (parsed.final.kind === 'tie') {
            return { error: 'Responda à comparação final para concluir esta leitura.' }
        }
    } catch (error) {
        console.error('Invalid diagnosis submission:', error)
        return { error: 'Não foi possível validar suas respostas. Revise a leitura e tente novamente.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado.' }
    }

    const admin = getSupabaseAdmin()
    const record = buildDiagnosticRecord(parsed)
    const resultElements = parsed.final.elements
    const { data: completedAssessmentId, error: assessmentError } = await admin
        .rpc('complete_diagnostic_assessment', {
            p_user_id: user.id,
            p_record: record,
            p_assessment_id: assessmentId,
        })

    if (assessmentError || !completedAssessmentId) {
        console.error('Error saving diagnostic assessment atomically:', assessmentError)
        return { error: 'Não foi possível salvar sua leitura. Tente novamente.' }
    }

    revalidatePath('/o-mapa-da-raiz')
    revalidatePath('/mapa/v2')
    revalidatePath('/admin')

    return {
        success: true,
        assessmentId: completedAssessmentId,
        resultKind: parsed.final.kind,
        resultElements,
        facialConvergence: record.facial_convergence,
    }
}

export async function startDiagnosisAssessment(payload: unknown) {
    let parsed
    try {
        parsed = parseFacialZoneSelection(payload)
    } catch (error) {
        console.error('Invalid diagnosis draft:', error)
        return { error: 'Não foi possível iniciar esta leitura.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    const admin = getSupabaseAdmin()
    const { data: existing } = await admin
        .from('diagnostic_assessments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (existing?.id) return { success: true, assessmentId: existing.id }

    const { data: assessment, error } = await admin
        .from('diagnostic_assessments')
        .insert({
            user_id: user.id,
            status: 'in_progress',
            facial_zone_ids: parsed.facial.selectedZoneIds,
            facial_scores: parsed.facial.scores,
            question_answers: {},
            question_scores: {},
            tiebreak_answers: {},
            tiebreak_scores: {},
            result_elements: [],
            algorithm_version: DIAGNOSIS_ALGORITHM_VERSION,
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error creating diagnosis draft:', error)
        return { error: 'Não foi possível iniciar esta leitura.' }
    }

    return { success: true, assessmentId: assessment?.id }
}

export async function saveDiagnosisProgress(payload: unknown) {
    const input = payload as { assessmentId?: unknown }
    if (typeof input.assessmentId !== 'string' || !/^[0-9a-f-]{36}$/i.test(input.assessmentId)) {
        return { error: 'Avaliação inválida.' }
    }

    let progress
    try {
        progress = parseDiagnosisProgress(payload)
    } catch (error) {
        console.error('Invalid diagnosis progress:', error)
        return { error: 'Não foi possível salvar o progresso desta leitura.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado.' }

    const questionAnswers = progress.questionAnswers
    const main = calculateMainDiagnosis(questionAnswers)
    const tiebreakAnswers = progress.tiebreakAnswers
    const allowedTiebreak = new Set(ELEMENT_ORDER)
    if (Object.keys(tiebreakAnswers).some((element) => !allowedTiebreak.has(element as typeof ELEMENT_ORDER[number]))) {
        return { error: 'Desempate inválido.' }
    }
    if (main.kind !== 'tie' && Object.keys(tiebreakAnswers).length > 0) {
        return { error: 'O desempate só pode ser salvo após um empate.' }
    }
    if (main.kind === 'tie' && Object.keys(tiebreakAnswers).some((element) => !main.elements.includes(element as typeof ELEMENT_ORDER[number]))) {
        return { error: 'O desempate contém um elemento que não está empatado.' }
    }

    const admin = getSupabaseAdmin()
    const { error: updateError } = await admin.rpc('merge_diagnostic_progress', {
        p_user_id: user.id,
        p_assessment_id: input.assessmentId,
        p_question_answers: questionAnswers,
        p_tiebreak_answers: tiebreakAnswers,
        p_reflection_answers: progress.reflectionAnswers,
    })

    if (updateError) {
        console.error('Error saving diagnosis progress:', updateError)
        return { error: 'Não foi possível salvar o progresso desta leitura.' }
    }

    return { success: true }
}
