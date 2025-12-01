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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    let mounted = true

    // 1. Get initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
            if (session) {
                setSession(session)
                await updateUserFromSession(session)
            } else {
                setLoading(false)
            }
        }
      } catch (err) {
        console.error('Error getting session:', err)
        if (mounted) setLoading(false)
      }
    }

    initSession()

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      console.log('🔐 Auth Event:', event, session?.user?.email || 'no user')

      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          setUser(null)
          setSession(null)
          setLoading(false)
        }
        return
      }

      if (mounted && session) {
        setSession(session)
        await updateUserFromSession(session)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Helper to map Supabase user to AuthUser
  const updateUserFromSession = async (session: Session) => {
    const u = session.user
    if (!u) return

    setUser({
      id: u.id,
      email: u.email || '',
      full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
      avatar_url: u.user_metadata?.avatar_url || u.user_metadata?.picture,
      user_metadata: u.user_metadata || {}
    })
    setLoading(false)
  }

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
    } catch (err: any) {
      console.error('Error signing out:', err)
      setError({ message: err.message || 'Failed to sign out' })
      throw err
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) throw error
      if (session) {
        setSession(session)
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

  const clearError = () => setError(null)

  return {
    user,
    session,
    loading,
    error,
    signInWithGoogle,
    signOut,
    refreshSession,
    clearError,
    isAuthenticated: !!user
  }
}
