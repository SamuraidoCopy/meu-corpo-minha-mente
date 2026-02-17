'use client'

import { signOut } from '@/app/login/actions'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
    return (
        <Button
            variant="ghost"
            className="text-foreground/60 hover:text-foreground hover:bg-transparent text-xs uppercase tracking-widest"
            onClick={() => signOut()}
        >
            Sair
        </Button>
    )
}
