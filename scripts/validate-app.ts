const BASE_URL = 'http://localhost:3000';
const ROUTES = [
  '/',
  '/login',
  '/onboarding',
  '/mapa',
  '/diario',
  '/diagnostico',
  '/admin',
  '/preview-safe-space',
  '/o-mapa-da-raiz',
  '/o-mapa-da-raiz-b'
];

async function validateApp() {
  console.log('🚀 Iniciando Validação Sistêmica AIOS (Fetch Mode)...\n');
  
  let hasErrors = false;

  for (const route of ROUTES) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      const status = response.status;
      const statusIcon = status >= 200 && status < 300 ? '✅' : status === 307 || status === 302 ? '🔄' : '❌';

      console.log(`${statusIcon} [${status}] ${route}`);
      
      if (status >= 500) {
        hasErrors = true;
      }
    } catch (error: any) {
      console.log(`❌ [ERROR] ${route}: ${error.name === 'TimeoutError' ? 'Timeout' : error.message}`);
      hasErrors = true;
    }
  }

  console.log('\n-----------------------------------');
  if (hasErrors) {
    console.log('⚠️ Validação concluída com ALERTAS. Verifique se o servidor local (npm run dev) está ativo.');
    process.exit(1);
  } else {
    console.log('🌟 Sistema ESTÁVEL. Todas as rotas respondendo conforme esperado.');
    process.exit(0);
  }
}

validateApp();
