
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
const NEW_PASSWORD = process.argv[3] || 'senha-segura-123'

async function updatePassword() {
    console.log(`\n🔐 Orion: Iniciando reset de senha para ${EMAIL}`)

    // 1. Get User ID
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
        console.error('❌ Erro ao listar usuários:', listError.message)
        return
    }

    const user = usersData?.users.find(u => u.email === EMAIL)

    if (!user) {
        console.error(`❌ Usuário ${EMAIL} não encontrado no Supabase.`)
        return
    }

    // 2. Update Password
    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: NEW_PASSWORD }
    )

    if (error) {
        console.error('❌ Erro ao atualizar senha:', error.message)
    } else {
        console.log(`✅ Senha para ${EMAIL} atualizada com sucesso!`)
        console.log(`Nova senha: ${NEW_PASSWORD}`)
    }
}

updatePassword()
