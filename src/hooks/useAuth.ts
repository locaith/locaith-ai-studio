import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  user_metadata: {
    [key: string]: any
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;
    let retried = false;

    // 1. Check initial session - CRITICAL: Handle errors properly
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          // CRITICAL: Clear invalid session data automatically
          console.warn('🧹 Clearing invalid session data from localStorage')
          localStorage.removeItem('locaith-auth-token')

          if (mounted) {
            setUser(null)
          }
          return
        }

        if (session?.user && mounted) {
          // CRITICAL: Ensure email exists (Google sometimes returns null if scope missing)
          const userEmail = session.user.email || 'unknown@user.com';
          const userName = session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            userEmail.split('@')[0] ||
            'User';

          // Set user from session data
          setUser({
            id: session.user.id,
            email: userEmail,
            full_name: userName,
            avatar_url: session.user.user_metadata?.avatar_url,
            user_metadata: session.user.user_metadata || {}
          })

          // Try to fetch profile (non-blocking, optional)
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()

            if (profile && mounted) {
              setUser(prev => prev ? ({
                ...prev,
                full_name: profile.full_name || prev.full_name,
                avatar_url: profile.avatar_url || prev.avatar_url
              }) : null)
            } else if (!profile) {
              // Auto-create profile if missing
              await supabase.from('profiles').insert({
                id: session.user.id,
                email: userEmail,
                full_name: userName,
                avatar_url: session.user.user_metadata?.avatar_url
              })
            }
          } catch (profileError) {
            console.warn('Profile fetch failed (non-critical):', profileError)
          }
        } else if (mounted) {
          setUser(null)
        }
      } catch (error) {
        console.error('Critical auth error:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    const onVisibility = async () => {
      if (!mounted) return
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const userEmail = session.user.email || 'unknown@user.com'
          const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0] || 'User'
          setUser({
            id: session.user.id,
            email: userEmail,
            full_name: userName,
            avatar_url: session.user.user_metadata?.avatar_url,
            user_metadata: session.user.user_metadata || {}
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // 2. Listen for auth state changes - HANDLE ALL EVENTS
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const userEmail = session?.user?.email || 'unknown';
      console.log('🔐 Auth Event:', event, userEmail)

      // CRITICAL: Handle sign out and errors
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state')
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      // Handle token refresh error
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      }

      // CRITICAL: Set user on INITIAL_SESSION (page load), SIGNED_IN, or TOKEN_REFRESHED
      if (session?.user && mounted && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const safeEmail = session.user.email || 'unknown@user.com';
        const safeName = session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          safeEmail.split('@')[0] ||
          'User';

        setUser({
          id: session.user.id,
          email: safeEmail,
          full_name: safeName,
          avatar_url: session.user.user_metadata?.avatar_url,
          user_metadata: session.user.user_metadata || {}
        })

        // Try to fetch profile (non-blocking)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (profile && mounted) {
            setUser(prev => prev ? ({
              ...prev,
              full_name: profile.full_name || prev.full_name,
              avatar_url: profile.avatar_url || prev.avatar_url
            }) : null)
          }
        } catch (profileError) {
          console.warn('Profile fetch failed (non-critical):', profileError)
        }
      } else if (!session && mounted) {
        setUser(null)
      }

      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: (import.meta as any).env?.VITE_SITE_URL || window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      // Force clear even if error
      setUser(null)
      throw error
    }
  }

  const resetSupabaseSession = async () => {
    try {
      setLoading(true)
      localStorage.removeItem('locaith-auth-token')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userEmail = session.user.email || 'unknown@user.com'
        const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0] || 'User'
        setUser({
          id: session.user.id,
          email: userEmail,
          full_name: userName,
          avatar_url: session.user.user_metadata?.avatar_url,
          user_metadata: session.user.user_metadata || {}
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    resetSupabaseSession,
    refreshSession,
    isAuthenticated: !!user
  }
}
