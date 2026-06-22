import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMINS = ['admin@teste.com', 'admin2@teste.com']

async function fixAdminProfiles() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError.message)
    process.exit(1)
  }

  for (const email of ADMINS) {
    const user = users.users.find(u => u.email === email)
    if (!user) {
      console.log(`⚠️  ${email} — não encontrado no Auth. Pulando.`)
      continue
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (existing) {
      if (existing.role === 'admin') {
        console.log(`✅ ${email} — perfil já existe com role=admin.`)
        continue
      }
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) console.error(`❌ Update falhou para ${email}:`, error.message)
      else console.log(`✅ ${email} — role atualizado para admin.`)
    } else {
      // Perfil não existe — cria com UPSERT
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: 'Administrador',
        role: 'admin',
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      })
      if (error) console.error(`❌ Upsert falhou para ${email}:`, error.message)
      else console.log(`✅ ${email} — perfil criado com role=admin.`)
    }
  }
}

fixAdminProfiles()
