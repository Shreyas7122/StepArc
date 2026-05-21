/**
 * Injects a mock Supabase session into localStorage so the app
 * bypasses the AuthScreen and loads as an authenticated user.
 * Must be called BEFORE page.goto('/').
 */
export async function setupAuthenticated(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'sb-zskwpeheleppobhqpbpn-auth-token',
      JSON.stringify({
        access_token: 'mock-access-token-steparc',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mocked-user-id-12345',
          email: 'testathlete@steparc.com',
          role: 'authenticated',
          aud: 'authenticated',
          app_metadata: { provider: 'email' },
          user_metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      })
    );
  });
}
