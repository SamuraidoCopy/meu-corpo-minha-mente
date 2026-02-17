
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

// Create client with Service Role Key for Admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createVerifiedUser() {
    const email = `aluna_auto_${Date.now()}@exemplo.com`
    const password = 'senha-segura-123'

    console.log(`Criando usuária confirmada: ${email}`)

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
            full_name: 'Aluna Verificada',
        }
    })

    if (error) {
        console.error('Erro ao criar usuário:', error.message)
        return
    }

    console.log('--- USUÁRIA VERIFICADA CRIADA ---')
    console.log(`Email: ${email}`)
    console.log(`Senha: ${password}`)
    console.log('---------------------------------')
    console.log('Esta usuária já está com email confirmado e pronta para logar.')
}

createVerifiedUser()
