
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: Variáveis do Supabase ausentes no .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const EMAIL = process.argv[2] || 'admin2@teste.com'
const ROLE = process.argv[3] || 'admin'

async function promoteUser() {
    console.log(`\n👑 Squad AIOS: Promovendo usuário ${EMAIL} para role: ${ROLE}`)

    // 1. Get User ID from Auth
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
        console.error('❌ Erro ao listar usuários:', listError.message)
        return
    }

    const user = usersData?.users.find(u => u.email === EMAIL)

    if (!user) {
        console.error(`❌ Usuário ${EMAIL} não encontrado no Supabase Auth.`)
        return
    }

    const userId = user.id
    console.log(`✅ UUID identificado: ${userId}`)

    // 2. Update Profile Table
    console.log(`- Atualizando role na tabela 'profiles'...`)
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
            role: ROLE,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)

    if (updateError) {
        console.error('  ❌ Erro ao atualizar perfil:', updateError.message)
    } else {
        console.log(`  ✅ Usuário ${EMAIL} promovido a ${ROLE} com sucesso.`)
        console.log(`  🚀 "Navegação Free" (ValidationHub) habilitada para este perfil.`)
    }
}

promoteUser()
