import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  onboarding_completed?: boolean
  user_metadata: {
    [key: string]: any
  }
}

export interface AuthError {
  message: string
  code?: string
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    let mounted = true

    // 1. Optimistically restore user from localStorage
    const restoreUserFromStorage = () => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
            const data = localStorage.getItem(key)
            if (data) {
              const parsed = JSON.parse(data)
              if (parsed?.user) {
                console.log('⚡ Optimistically restoring user from localStorage')
                const u = parsed.user
                setUser({
                  id: u.id,
                  email: u.email || 'unknown@user.com',
                  full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
                  avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture,
                  user_metadata: u.user_metadata || {}
                })
                return true
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore from localStorage:', err)
      }
      return false
    }

    // 2. Verify session with Supabase
    const checkSession = async (attempt = 1) => {
      const MAX_RETRIES = 3

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error(`Session check error (attempt ${attempt}/${MAX_RETRIES}):`, sessionError)

          if (attempt < MAX_RETRIES && mounted) {
            setTimeout(() => {
              if (mounted) checkSession(attempt + 1)
            }, 1000 * attempt) // Exponential backoff
            return
          }

          // Clear bad session after retries
          console.warn('🧹 Clearing invalid session after retries')
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)
            if (k && k.startsWith('sb-') && k.includes('-auth-token')) {
              localStorage.removeItem(k)
            }
          }

          if (mounted) {
            setUser(null)
            setError({ message: 'Session error. Please sign in again.', code: sessionError.message })
          }
          return
        }

        if (session?.user && mounted) {
          await updateUserFromSession(session)
        } else if (mounted && !session) {
          setUser(null)
        }
      } catch (err: any) {
        console.error('Critical auth error:', err)
        if (mounted) {
          setUser(null)
          setError({ message: err.message || 'Authentication failed' })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // 3. Update user state from session
    const updateUserFromSession = async (session: Session) => {
      const u = session.user
      const userEmail = u.email || 'unknown@user.com'
      const userName = u.user_metadata?.full_name || u.user_metadata?.name || userEmail.split('@')[0] || 'User'

      const authUser: AuthUser = {
        id: u.id,
        email: userEmail,
        full_name: userName,
        avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture,
        user_metadata: u.user_metadata || {}
      }

      setUser(authUser)

      // Fetch profile from database for additional data
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .maybeSingle()

        if (profile && mounted) {
          setUser(prev => prev ? {
            ...prev,
            full_name: profile.full_name || prev.full_name,
            avatar_url: profile.avatar_url || prev.avatar_url,
            onboarding_completed: profile.onboarding_completed
          } : null)
        } else if (!profile && !profileError) {
          // Profile doesn't exist, trigger should have created it
          console.warn('Profile not found for user, may need to wait for trigger')
        }
      } catch (profileError) {
        console.warn('Profile fetch failed (non-critical):', profileError)
      }
    }

    // 4. Initialize
    const hasRestoredFromStorage = restoreUserFromStorage()
    if (hasRestoredFromStorage) {
      setLoading(false) // Show UI immediately
    }
    checkSession() // Then verify with server

    // 5. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth Event:', event, session?.user?.email || 'no user')

      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        if (mounted) {
          setUser(null)
          setError(null)
          setLoading(false)
        }
        return
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      }

      if (session?.user && mounted && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await updateUserFromSession(session)
      } else if (!session && mounted) {
        setUser(null)
      }

      if (mounted) setLoading(false)
    })

    // 6. Handle page visibility (for tab switching)
    const onVisibility = async () => {
      if (!mounted || document.hidden) return
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && mounted) {
          await updateUserFromSession(session)
        }
      } catch (err) {
        console.error('Visibility check error:', err)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mounted = false
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)

      const redirectUrl = window.location.origin
      console.log('🔐 Initiating Google OAuth with redirect:', redirectUrl)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Error signing in with Google:', err)
      setError({ message: err.message || 'Failed to sign in with Google' })
      setLoading(false)
      throw err
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setError(null)
    } catch (err: any) {
      console.error('Error signing out:', err)
      setUser(null) // Force clear even on error
      setError({ message: err.message || 'Failed to sign out' })
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      if (session?.user) {
        await updateUserFromSession(session)
      }
    } catch (err: any) {
      console.error('Error refreshing session:', err)
      setError({ message: err.message || 'Failed to refresh session' })
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Clear error
  const clearError = () => setError(null)

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    refreshSession,
    clearError,
    isAuthenticated: !!user
  }
}

// Helper function to update user state
async function updateUserFromSession(session: Session) {
  // This is defined outside the hook to avoid closure issues
  // Implementation is in the hook above
}
