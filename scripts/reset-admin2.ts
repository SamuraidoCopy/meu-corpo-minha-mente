
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables (URL or SERVICE_ROLE_KEY)')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Default to admin2@teste.com if no email provided as CLI argument
const EMAIL_TO_RESET = process.argv[2] || 'admin2@teste.com'

async function resetUser() {
    console.log(`\n👑 Agente Data-Engineer: Iniciando reset total para o perfil: ${EMAIL_TO_RESET}`)

    // 1. Get User ID from auth.users
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
        console.error('❌ Erro ao listar usuários:', userError.message)
        return
    }

    const targetUser = users.users.find(u => u.email === EMAIL_TO_RESET)

    if (!targetUser) {
        console.error(`❌ Usuário ${EMAIL_TO_RESET} não encontrado.`)
        return
    }

    const userId = targetUser.id
    console.log(`✅ UUID identificado: ${userId}`)

    // 2. Delete data from associated tables
    const tablesToDelete = [
        'diary_entries',
        'facial_expressions',
        'deep_reflections'
    ]

    for (const table of tablesToDelete) {
        console.log(`- Limpando tabela ${table}...`)
        const { count, error } = await supabase
            .from(table)
            .delete({ count: 'exact' })
            .eq('user_id', userId)

        if (error) {
            console.error(`  ❌ Erro ao limpar ${table}:`, error.message)
        } else {
            console.log(`  ✅ Registros removidos: ${count ?? 0}`)
        }
    }

    // 3. Reset profile table
    console.log('- Resetando campos da tabela profiles...')
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            onboarding_completed: false,
            age: null,
            history: null,
            reflection_answers: null,
            dominant_element: null, // Adicionado para garantir reset total
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)

    if (profileError) {
        console.error('  ❌ Erro ao resetar perfil:', profileError.message)
    } else {
        console.log('  ✅ Perfil resetado com sucesso para estado "Novo Usuário".')
    }

    console.log(`\n🎯 Reset concluído para ${EMAIL_TO_RESET}. Pronta para novo onboarding.`)
    console.log('— Orion, orquestrando o sistema 🎯')
}

resetUser()
