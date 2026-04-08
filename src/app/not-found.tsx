import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-background text-foreground antialiased">
            <h2 className="text-4xl font-serif">404 - Página Não Encontrada</h2>
            <p className="opacity-60">A página que você procura não existe.</p>
            <Link href="/o-mapa-da-raiz" className="px-6 py-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                Voltar ao Início
            </Link>
        </div>
    )
}

