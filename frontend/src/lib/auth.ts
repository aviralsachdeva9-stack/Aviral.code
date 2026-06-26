const TOKEN_KEY = "cr_access_token"
const EMAIL_KEY = "cr_user_email"

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function saveEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email)
}

export function getSavedEmail(): string | null {
  return localStorage.getItem(EMAIL_KEY)
}
