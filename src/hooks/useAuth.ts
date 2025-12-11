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
          redirectTo: `${redirectUrl}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (err: any) {
      console.error('Google sign in error:', err)
      setError({
        message: err.message || 'Failed to sign in with Google',
        code: err.code
      })
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Email
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (err: any) {
      console.error('Email sign in error:', err)
      setError({
        message: err.message || 'Failed to sign in with email',
        code: err.code
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Sign up with Email
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          redirectTo: `${window.location.origin}/`
        }
      })

      if (error) throw error
      return data
    } catch (err: any) {
      console.error('Email sign up error:', err)
      setError({
        message: err.message || 'Failed to sign up',
        code: err.code
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
    } catch (err: any) {
      console.error('Resend verification error:', err)
      setError({
        message: err.message || 'Failed to resend verification email',
        code: err.code
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
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
    signInWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    signOut,
    clearError,
    isAuthenticated: !!user
  }
}
