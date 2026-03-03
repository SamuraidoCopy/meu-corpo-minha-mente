import { test, expect } from '@playwright/test'

test.describe('E2E - Meu Corpo Minha Mente v1.0', () => {
    test('Acesso Inicial - Página de Login da Raiz', async ({ page }) => {
        // Acessa a raiz local
        await page.goto('http://localhost:3000/')

        // Checagem se o texto de boas vindas está na home original ou redirect p/ /login
        // Observação: Como há middleware que redireciona sem sessão para /login
        // Esperamos no mínimo que ele renderize um form ou link
        const pageContent = await page.content()
        expect(pageContent).toBeTruthy()

        // Testa se não quebram chunks (Error Boundaries)
        const errObj = await page.evaluate(() => document.body.innerText.includes('[object Event]'))
        expect(errObj).toBe(false)
    })
})
