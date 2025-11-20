import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type FeatureType = 'web-builder' | 'design' | 'text' | 'search' | 'voice' | 'automation' | 'settings'
export type ActionType = 'create' | 'update' | 'delete' | 'view' | 'export' | 'deploy' | 'generate' | 'schedule'

export interface ActivityData {
  feature_type: FeatureType
  action_type: ActionType
  action_details?: Record<string, any>
  session_id?: string
  metadata?: Record<string, any>
}

export const useUserActivity = () => {
  const { user, isAuthenticated } = useAuth()

  const trackActivity = useCallback(async (activity: ActivityData) => {
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, skipping activity tracking')
      return
    }

    try {
      const { error } = await supabase
        .from('user_activity_history')
        .insert({
          user_id: user.id,
          feature_type: activity.feature_type,
          action_type: activity.action_type,
          action_details: activity.action_details || {},
          session_id: activity.session_id || sessionStorage.getItem('session_id') || 'unknown',
          metadata: activity.metadata || {}
        })

      if (error) {
        console.error('Error tracking activity:', error)
      } else {
        console.log('Activity tracked successfully:', activity)
      }
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }, [user, isAuthenticated])

  const getRecentActivity = useCallback(async (limit: number = 10) => {
    if (!isAuthenticated || !user) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('user_activity_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent activity:', error)
        return []
      }

      return data
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }, [user, isAuthenticated])

  const getActivityByFeature = useCallback(async (featureType: FeatureType) => {
    if (!isAuthenticated || !user) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('user_activity_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_type', featureType)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching activity by feature:', error)
        return []
      }

      return data
    } catch (error) {
      console.error('Error fetching activity by feature:', error)
      return []
    }
  }, [user, isAuthenticated])

  return {
    trackActivity,
    getRecentActivity,
    getActivityByFeature
  }
}