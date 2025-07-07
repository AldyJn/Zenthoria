// tests/e2e/student-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Student Registration and Login Flow', () => {
  test('should register, confirm email, login and access dashboard', async ({ page }) => {
    // 1. Registro
    await page.goto('/auth/register')
    await page.fill('input[name="email"]', 'test.student@example.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.fill('input[name="confirmPassword"]', 'Test123!')
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'Student')
    await page.selectOption('select[name="role"]', 'student')
    await page.click('button[type="submit"]')
    
    // Verificar redirección a login
    await expect(page).toHaveURL('/auth/login')
    
    // 2. Login
    await page.fill('input[name="email"]', 'test.student@example.com')
    await page.fill('input[name="password"]', 'Test123!')
    await page.click('button[type="submit"]')
    
    // Esperar redirección al dashboard
    await page.waitForURL('/student/dashboard', { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('Bienvenido')
  })

  test('should join a class and see it in dashboard', async ({ page }) => {
    // Asumir que ya está logueado
    await page.goto('/student/dashboard')
    
    // Click en unirse a clase
    await page.click('text=Unirse a Clase')
    
    // Ingresar código
    await page.fill('input[name="classCode"]', 'ABC123')
    await page.click('button:has-text("Unirse")')
    
    // Verificar mensaje de éxito
    await expect(page.locator('.toast-success')).toBeVisible()
    
    // Verificar que la clase aparece en el dashboard
    await page.goto('/student/dashboard')
    await expect(page.locator('.class-card')).toBeVisible()
  })
})

test.describe('Student Class Persistence', () => {
  test('should persist class enrollment in database', async ({ page, request }) => {
    // Login como estudiante
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'existing.student@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Unirse a clase via API
    const response = await request.post('/api/classes/join', {
      data: { classCode: 'TEST01' }
    })
    
    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    expect(result.success).toBe(true)
    
    // Verificar en el dashboard
    await page.goto('/student/dashboard')
    await page.reload() // Forzar recarga
    await expect(page.locator('text=TEST01')).toBeVisible()
  })
})