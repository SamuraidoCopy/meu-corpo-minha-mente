'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ElementType } from '@/lib/tcm-data'

export type UpdateProfileData = {
  full_name?: string
  age?: number | string
  dominant_element?: ElementType | null
  onboarding_completed?: boolean
  role?: 'user' | 'admin'
}

export async function updateProfile(userId: string, data: UpdateProfileData) {
  const supabase = await createClient()

  // Validate admin permission
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUserProfile?.role !== 'admin') {
    return { error: 'Sem permissão de administrador' }
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: 'Falha ao atualizar o perfil' }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteProfile(userId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUserProfile?.role !== 'admin') {
    return { error: 'Sem permissão de administrador' }
  }

  // Soft delete / Archiving by nullifying elements would be safe.
  // Full deletion from auth requires service role key. 
  // Let's assume we delete from profiles. If table has cascade delete on auth, then wait.
  // Actually, standard Supabase profiles table cannot delete auth user without Service Key.
  // But we can check if service role key is available in env.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
     return { error: 'Chave de serviço Supabase não configurada para deleção. Operação cancelada.' }
  }

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error('Error deleting user auth:', error)
    return { error: 'Falha ao excluir o usuário no sistema de autenticação' }
  }

  revalidatePath('/admin')
  return { success: true }
}
