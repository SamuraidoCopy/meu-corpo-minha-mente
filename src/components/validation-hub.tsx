'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { 
  Settings, 
  Map as MapIcon, 
  UserCircle, 
  LayoutDashboard, 
  ClipboardCheck, 
  Eye,
  ChevronRight,
  ChevronLeft,
  X,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ElementType } from '@/lib/tcm-data'

const ROUTES = [
  { name: 'Home/Dashboard', path: '/o-mapa-da-raiz?inspect=true', icon: LayoutDashboard },
  { name: 'Onboarding', path: '/onboarding?inspect=true', icon: UserCircle },
  { name: 'Investigação (Mapa)', path: '/mapa?inspect=true', icon: MapIcon },
  { name: 'Diagnóstico', path: '/diagnostico?inspect=true', icon: ClipboardCheck },
  { name: 'Safe Space Preview', path: '/preview-safe-space?inspect=true', icon: Eye },
  { name: 'Painel Admin', path: '/admin', icon: Settings },
]

const ELEMENTS_LIST: { name: string; key: ElementType; color: string }[] = [
  { name: 'Madeira', key: 'Madeira', color: 'bg-emerald-600' },
  { name: 'Fogo', key: 'Fogo', color: 'bg-orange-600' },
  { name: 'Terra', key: 'Terra', color: 'bg-amber-600' },
  { name: 'Metal', key: 'Metal', color: 'bg-slate-400' },
  { name: 'Água', key: 'Água', color: 'bg-sky-700' },
]

interface ValidationHubProps {
  isAdmin: boolean
}

export function ValidationHub({ isAdmin }: ValidationHubProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  if (!isAdmin) return null

  const setElement = (element: ElementType) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('element', element)
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearElement = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('element')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] transition-all duration-300 flex flex-col items-end gap-3`}>
      {/* Expanded Panel */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-xl border border-foreground/10 rounded-3xl shadow-2xl p-6 w-72 animate-in slide-in-from-bottom-5 duration-300 space-y-6">
          <div className="flex items-center justify-between border-b border-foreground/5 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">Controle AIOS</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-foreground/40 hover:text-foreground/80 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/30 ml-1 mb-3">Navegação Direta</p>
            <div className="grid grid-cols-1 gap-1">
              {ROUTES.map((route) => {
                const Icon = route.icon
                // Compare path without query params for active state
                const routePathname = route.path.split('?')[0]
                const isActive = pathname === routePathname
                
                return (
                  <Link 
                    key={route.path} 
                    href={route.path}
                    prefetch={false}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                        : 'hover:bg-foreground/5 text-foreground/60'
                    }`}
                  >
                    <Icon size={16} />
                    {route.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Element Inspector */}
          <div className="space-y-4 pt-2 border-t border-foreground/5">
              <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/30 ml-1 flex items-center gap-2">
                <Palette size={12} /> Inspetor de Elementos
              </p>
              <div className="grid grid-cols-5 gap-2">
                {ELEMENTS_LIST.map((el) => (
                  <button
                    key={el.key}
                    onClick={() => setElement(el.key)}
                    title={el.name}
                    className={`w-10 h-10 rounded-full ${el.color} shadow-sm border-2 transition-transform hover:scale-110 active:scale-95 ${
                      searchParams.get('element') === el.key ? 'border-foreground shadow-lg' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
              <button 
                onClick={clearElement}
                className="w-full py-1.5 text-[10px] uppercase font-bold text-foreground/40 hover:text-red-500 transition-colors border border-dashed border-foreground/10 rounded-lg"
              >
                Limpar Override
              </button>
          </div>
          
          <div className="pt-4 border-t border-foreground/5 text-center">
            <p className="text-[10px] text-foreground/40 font-medium">Modo Developer: Ativo</p>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-2xl transition-all ${isOpen ? 'bg-foreground text-white rotate-90' : 'bg-primary text-white hover:scale-105'}`}
      >
        {isOpen ? <X /> : <Settings className="animate-spin-slow" />}
      </Button>
    </div>
  )
}
