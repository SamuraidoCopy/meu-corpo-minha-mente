
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

async function createAdminUser() {
    const email = 'admin@teste.com'
    const password = 'senha-segura-123'

    console.log(`\n👑 Agente Data-Engineer: Orquestrando perfil administrador: ${email}`)

    // 1. Check if user already exists
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
        console.error('❌ Erro ao listar usuários:', listError.message)
        return
    }

    const existingUser = usersData?.users.find(u => u.email === email)

    if (existingUser) {
        console.log(`ℹ️ Usuário ${email} já existe no Auth. UUID: ${existingUser.id}`)
        await setAdminRole(existingUser.id)
    } else {
        // 2. Create User in Supabase Auth
        console.log(`- Criando novo usuário ${email}...`)
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: 'Administrador Sistema',
            }
        })

        if (createError) {
            console.error('❌ Erro ao criar usuário:', createError.message)
            return
        }

        if (userData?.user) {
            console.log('✅ Usuário criado com sucesso no Auth.')
            await setAdminRole(userData.user.id)
        }
    }
}

async function setAdminRole(userId: string) {
    console.log(`- Garantindo role 'admin' para o UUID: ${userId}...`)
    
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)

    if (updateError) {
        console.error('  ❌ Erro ao definir role de admin:', updateError.message)
    } else {
        console.log('  ✅ Perfil promovido a Administrador com sucesso.')
    }

    console.log('\n--- CREDENCIAIS ---')
    console.log(`Email: admin@teste.com`)
    console.log(`Senha: senha-segura-123`)
    console.log('-------------------\n')
}

createAdminUser()
