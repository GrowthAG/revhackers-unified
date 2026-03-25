import { test, expect } from '@playwright/test';

test.describe('Autenticação Global Flow', () => {
  test('A página de Login carrega com sucesso sem disparar o Global Error Boundary', async ({ page }) => {
    // 1. Navegar para a aplicação local (assumindo a porta padrão do Vite 5173)
    await page.goto('http://localhost:5173/login');

    // 2. Garantir que a "Tela Branca da Morte" / Error Boundary estrito *NÃO* é acionado
    const errorSignal = page.locator('text=Algo deu errado');
    await expect(errorSignal).not.toBeVisible();

    // 3. Garantir que o UI principal carregou com sucesso
    // Procurando o Input de email genérico usado no login brutalista
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();

    // Procurando a call to action principal de login
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });
});
