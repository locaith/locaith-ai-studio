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

    // 1. Check initial session - CRITICAL: Handle errors properly
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          // ZOMBIE SESSION FIX: If error getting session, sign out immediately
          console.error('Session error, clearing auth:', error)
          await supabase.auth.signOut()
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (session?.user && mounted) {
          // Set user from session data
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            user_metadata: session.user.user_metadata
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
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
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
        // Force clean slate
        await supabase.auth.signOut()
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    // 2. Listen for auth state changes - HANDLE ALL EVENTS
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth Event:', event, session?.user?.email)

      // CRITICAL: Handle sign out and errors
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
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

      // Set user on sign in or token refresh
      if (session?.user && mounted && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          user_metadata: session.user.user_metadata
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
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
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

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  }
}