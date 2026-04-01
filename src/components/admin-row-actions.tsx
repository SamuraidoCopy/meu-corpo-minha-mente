'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Edit, Trash2, Link as Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminRowActionsProps {
  user: any
  onEdit: (user: any) => void
  onDelete: (user: any) => void
}

export function AdminRowActions({ user, onEdit, onDelete }: AdminRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-foreground/50 hover:text-foreground hover:bg-white/50 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white/95 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <button 
             onClick={() => { setIsOpen(false); onEdit(user) }}
             className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 font-medium"
          >
            <Edit className="h-4 w-4" /> Editar Perfil
          </button>
          
          <button
            onClick={() => { setIsOpen(false); onDelete(user) }}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium border-t border-foreground/5 mt-1 pt-3"
          >
            <Trash2 className="h-4 w-4" /> Excluir Registro
          </button>
        </div>
      )}
    </div>
  )
}
