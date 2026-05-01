import React from 'react';
import Link from 'next/link';
import { CheckCircle2, MailOpen, Lock, MonitorPlay } from 'lucide-react';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ObrigadoPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const isFromHotmart = searchParams.transaction || searchParams.prod || searchParams.off;

  // Se não houver nenhum parâmetro da Hotmart, redireciona para a home
  if (!isFromHotmart) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-wellness-cream text-neutral-900 flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-wellness-sage/20 relative overflow-hidden">
        
        {/* Decorativo de fundo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-wellness-sage via-wellness-gold to-wellness-sage"></div>

        {/* Ícone de Sucesso */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-wellness-sage/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-wellness-sage" strokeWidth={2} />
          </div>
        </div>

        {/* Hero de Celebração */}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-neutral-900">
          Compra Aprovada!
        </h1>
        <p className="font-sans text-lg text-neutral-600 mb-10 max-w-lg mx-auto">
          Seu pagamento foi confirmado e o seu mapa está pronto para ser desbravado. Veja abaixo como acessar seu conteúdo agora mesmo.
        </p>

        {/* Passos */}
        <div className="space-y-4 text-left mb-10">
          
          <div className="flex items-start gap-4 p-4 rounded-xl bg-wellness-cream/50 border border-wellness-sage/10">
            <div className="mt-1 bg-wellness-sage/20 text-wellness-sage p-2 rounded-lg">
              <MailOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 font-sans">1. Cheque seu e-mail</h3>
              <p className="text-neutral-600 text-sm mt-1">
                A Hotmart enviou uma mensagem com o assunto <strong>&quot;Seu acesso ao O Mapa da Raiz&quot;</strong>. Lembre-se de verificar a caixa de SPAM ou Promoções.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-wellness-cream/50 border border-wellness-sage/10">
            <div className="mt-1 bg-wellness-sage/20 text-wellness-sage p-2 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 font-sans">2. Cadastre sua senha</h3>
              <p className="text-neutral-600 text-sm mt-1">
                Ao clicar no link do e-mail, você será direcionado para criar sua senha segura na área de membros.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-wellness-cream/50 border border-wellness-sage/10">
            <div className="mt-1 bg-wellness-sage/20 text-wellness-sage p-2 rounded-lg">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 font-sans">3. Comece a jornada</h3>
              <p className="text-neutral-600 text-sm mt-1">
                Com o login feito, você já pode assistir a primeira aula e iniciar seu processo de transformação.
              </p>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="https://purchase.hotmart.com/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center gap-2 w-full sm:w-auto px-8 py-4 bg-[#D4AF37] hover:bg-[#c29f32] text-white font-bold rounded-lg font-sans transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Acessar Minhas Compras
          </Link>

          {/* Substitua o número abaixo pelo WhatsApp de suporte real */}
          <Link 
            href="https://wa.me/5511983076914?text=Oi%2C%20acabei%20de%20comprar%20o%20Mapa%20da%20Raiz%20e%20preciso%20de%20ajuda" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center gap-2 w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg font-sans transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Suporte no WhatsApp
          </Link>
        </div>
        
        <p className="text-xs text-neutral-400 mt-6 text-center">
          Se tiver qualquer problema, nos chame no WhatsApp ou responda ao e-mail de confirmação.
        </p>

      </div>
    </main>
  );
}
