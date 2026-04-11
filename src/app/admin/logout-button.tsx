'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '../login/actions'
import { useState } from 'react'

export function LogoutButton() {
    const [isPending, setIsPending] = useState(false)

    const handleLogout = async () => {
        setIsPending(true)
        try {
            await signOut()
            // The signOut action doesn't redirect automatically if called this way, 
            // or we might want to force a refresh/redirect here.
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 text-foreground/60 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl"
        >
            <LogOut className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-bold">Sair</span>
        </Button>
    )
}
