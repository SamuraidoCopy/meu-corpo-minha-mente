import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLoginForm } from './admin-login-form'

export default async function AdminLoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') redirect('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/40 font-medium">Área Restrita</p>
          <h1 className="text-3xl font-serif text-foreground/90">Acesso Administrativo</h1>
        </div>

        <div className="glass rounded-3xl p-8 border-white/20">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
