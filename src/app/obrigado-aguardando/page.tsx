import React from 'react';
import Link from 'next/link';
import { Clock, Mail, ShieldCheck, HelpCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ObrigadoAguardandoPage(props: PageProps) {
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
        <div className="absolute top-0 left-0 w-full h-2 bg-wellness-sage/30"></div>

        {/* Ícone de Espera */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-wellness-gold/10 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-wellness-gold animate-pulse" strokeWidth={2} />
          </div>
        </div>

        {/* Hero de Status */}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-neutral-900">
          Estamos quase lá!
        </h1>
        <p className="font-sans text-lg text-neutral-600 mb-10 max-w-lg mx-auto">
          Seu pedido foi recebido e está em **análise de crédito**. Esse processo é comum e garante a sua segurança.
        </p>

        {/* Informações de Espera */}
        <div className="space-y-4 text-left mb-10">
          
          <div className="flex items-start gap-4 p-4 rounded-xl bg-wellness-cream/30 border border-wellness-sage/10">
            <div className="mt-1 text-wellness-sage">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 font-sans">Análise de Segurança</h3>
              <p className="text-neutral-600 text-sm mt-1">
                A operadora do seu cartão ou o PayPal pode levar de **alguns minutos até 24 horas** para validar a transação.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-wellness-cream/30 border border-wellness-sage/10">
            <div className="mt-1 text-wellness-sage">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 font-sans">Aviso por E-mail</h3>
              <p className="text-neutral-600 text-sm mt-1">
                Assim que o pagamento for aprovado, você receberá um e-mail da Hotmart com o assunto <strong>&quot;Seu acesso ao O Mapa da Raiz&quot;</strong>.
              </p>
            </div>
          </div>

        </div>

        {/* Ajuda/Dúvidas */}
        <div className="pt-8 border-t border-neutral-100">
          <p className="text-sm text-neutral-500 mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4 text-wellness-sage" />
            Pagou via Pix e ainda não liberou? Ou ficou com alguma dúvida?
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Substitua o número abaixo pelo WhatsApp de suporte real */}
            <Link 
              href="https://wa.me/5511983076914?text=Oi%2C%20gerei%20um%20Pix%2FBoleto%20do%20Mapa%20da%20Raiz%20e%20preciso%20de%20ajuda" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center gap-2 w-full sm:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg font-sans transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Falar no WhatsApp
            </Link>

            <Link 
              href="https://atendimento.hotmart.com.br/hc/pt-br" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center gap-2 w-full sm:w-auto px-8 py-3 border-2 border-wellness-sage text-wellness-sage hover:bg-wellness-sage hover:text-white font-bold rounded-lg font-sans transition-all duration-300"
            >
              Central Hotmart
            </Link>
          </div>
        </div>

      </div>
      
      <p className="mt-8 text-neutral-400 text-sm">
        Você pode fechar esta página com segurança.
      </p>
    </main>
  );
}
