'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminRowActions } from '@/components/admin-row-actions'
import { updateProfile, deleteProfile } from './actions'
import { Search, Loader2, Trash2 } from 'lucide-react'
import { ElementType, ELEMENTS } from '@/lib/tcm-data'

export function AdminDashboard({ users }: { users: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  // Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [deletingUser, setDeletingUser] = useState<any | null>(null)

  const filteredUsers = users.filter((u) => {
    return (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Handlers
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingUser) return
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const data = {
        full_name: formData.get('full_name') as string,
        dominant_element: formData.get('dominant_element') as ElementType | null || null,
        onboarding_completed: formData.get('onboarding_completed') === 'true',
        role: formData.get('role') as 'user' | 'admin'
      }
      
      const res = await updateProfile(editingUser.id, data)
      if (res.error) alert(res.error)
      setEditingUser(null)
      router.refresh()
    })
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    startTransition(async () => {
      const res = await deleteProfile(deletingUser.id)
      if (res.error) alert(res.error)
      setDeletingUser(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Procurar aluna por nome..." 
            className="w-full h-12 pl-12 pr-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border-white/20 shadow-2xl relative">
        {isPending && (
           <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-sm font-bold text-foreground/50 animate-pulse">Sincronizando...</span>
             </div>
           </div>
        )}
        <div className="p-8 border-b border-foreground/5 bg-white/10 flex justify-between items-center">
            <h2 className="text-2xl font-serif">Alunas Cadastradas ({filteredUsers.length})</h2>
        </div>
        <div className="p-4 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-foreground/5 hover:bg-transparent">
                        <TableHead className="uppercase tracking-widest text-[10px] font-bold py-6">Nome</TableHead>
                        <TableHead className="uppercase tracking-widest text-[10px] font-bold">Elemento</TableHead>
                        <TableHead className="uppercase tracking-widest text-[10px] font-bold">Status</TableHead>
                        <TableHead className="uppercase tracking-widest text-[10px] font-bold">Role</TableHead>
                        <TableHead className="text-right uppercase tracking-[0.2em] text-[10px] font-bold min-w-16">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-12 text-center text-foreground/40 italic">Nenhuma aluna encontrada.</TableCell>
                        </TableRow>
                    ) : filteredUsers.map((u) => (
                        <TableRow key={u.id} className="border-foreground/5 hover:bg-white/40 transition-colors group">
                            <TableCell className="py-6 font-medium text-foreground/90">{u.full_name || 'Anônima'}</TableCell>
                            <TableCell>
                                {u.dominant_element ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-wellness-sage/10 text-wellness-sage">
                                        {u.dominant_element}
                                    </span>
                                ) : (
                                    <span className="text-foreground/30 italic text-sm">Pendente</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {u.onboarding_completed ?
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-wellness-sage">
                                        <span className="w-1.5 h-1.5 rounded-full bg-wellness-sage animate-pulse" /> Ativo
                                    </span> :
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-wellness-gold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-wellness-gold" /> Pendente
                                    </span>
                                }
                            </TableCell>
                            <TableCell className="text-foreground/60 text-sm">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-foreground/5'}`}>
                                    {u.role}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <AdminRowActions 
                                  user={u} 
                                  onEdit={() => setEditingUser(u)} 
                                  onDelete={() => setDeletingUser(u)} 
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* Edit Modal (Tailwind Native to bypass Dialog missing pkg) */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] border border-foreground/5 p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 overflow-hidden relative">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-wellness-sage" />
             <h3 className="text-2xl font-serif mb-6 text-foreground/90">Editar Perfil</h3>
             
             <form onSubmit={handleEdit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-foreground/50">Nome Completo</label>
                  <input name="full_name" defaultValue={editingUser.full_name} className="w-full rounded-xl border-foreground/10 bg-white/50 px-4 py-3 h-12 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-foreground/50">Diagnóstico (Elemento)</label>
                  <select name="dominant_element" defaultValue={editingUser.dominant_element || ''} className="w-full rounded-xl border-foreground/10 bg-white/50 px-4 h-12 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none cursor-pointer">
                    <option value="">Não diagnosticado</option>
                    {Object.keys(ELEMENTS).map(el => (
                       <option key={el} value={el}>{el}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-foreground/50">Status</label>
                    <select name="onboarding_completed" defaultValue={editingUser.onboarding_completed ? 'true' : 'false'} className="w-full rounded-xl border-foreground/10 bg-white/50 px-4 h-12 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                      <option value="true">Ativo</option>
                      <option value="false">Pendente</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-foreground/50">Permissão</label>
                    <select name="role" defaultValue={editingUser.role || 'user'} className="w-full rounded-xl border-foreground/10 bg-white/50 px-4 h-12 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold">
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 text-sm font-bold uppercase tracking-widest text-foreground/40 hover:bg-foreground/5 rounded-xl transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isPending} className="flex-1 py-3 bg-primary text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
                    Salvar
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-red-50 rounded-[2rem] border border-red-100 p-8 max-w-sm w-full shadow-2xl text-center">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={24} />
             </div>
             <h3 className="text-xl font-serif mb-2 text-red-900">Excluir Aluna?</h3>
             <p className="text-sm text-red-800/70 mb-8 leading-relaxed">
               Você está prestes a apagar o perfil de <strong>{deletingUser.full_name || 'Anônima'}</strong> permanentemente. O app irá tentar remover do banco e auth se o Service Role estiver ativo.
             </p>
             <div className="flex flex-col gap-2">
               <button onClick={handleDelete} disabled={isPending} className="w-full py-3.5 bg-red-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors disabled:opacity-50">
                 {isPending ? 'Excluindo...' : 'CONFIRMAR EXCLUSÃO'}
               </button>
               <button onClick={() => setDeletingUser(null)} className="w-full py-3.5 text-red-900/60 text-sm font-bold uppercase tracking-widest hover:bg-red-100/50 rounded-xl transition-colors">
                 Cancelar Operação
               </button>
             </div>
          </div>
        </div>
      )}
    </>
  )
}
