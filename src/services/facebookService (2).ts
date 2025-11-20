import { supabase } from '../lib/supabase'

export interface FacebookPage {
  id: string
  name: string
  access_token: string
  category: string
  category_list: Array<{
    id: string
    name: string
  }>
  tasks: string[]
}

export interface SocialConnection {
  id: string
  user_id: string
  provider: string
  account_id: string
  account_name: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export const facebookService = {
  async initiateFacebookOAuth(): Promise<string> {
    try {
      // This would typically be handled by a Supabase Edge Function
      // For now, we'll simulate the OAuth flow
      const facebookAppId = 'YOUR_FACEBOOK_APP_ID' // This should be stored in Supabase secrets
      const redirectUri = `${window.location.origin}/auth/facebook/callback`
      const scope = 'pages_show_list,pages_read_engagement,pages_manage_posts,publish_video'
      
      const oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`
      
      // Open popup for Facebook OAuth
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      
      const popup = window.open(
        oauthUrl,
        'FacebookAuth',
        `width=${width},height=${height},top=${top},left=${left}`
      )
      
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            reject(new Error('Facebook authentication cancelled'))
          }
        }, 1000)
        
        // Listen for the OAuth callback
        window.addEventListener('message', (event) => {
          if (event.origin === window.location.origin && event.data.type === 'facebook-auth-success') {
            clearInterval(checkClosed)
            popup?.close()
            resolve(event.data.code)
          }
        })
      })
    } catch (error) {
      console.error('Facebook OAuth error:', error)
      throw error
    }
  },

  async connectFacebookAccount(code: string): Promise<FacebookPage[]> {
    try {
      // In a real implementation, this would call a Supabase Edge Function
      // that handles the OAuth token exchange and page fetching
      
      // Simulate Facebook API calls
      const response = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      })
      
      if (!response.ok) {
        throw new Error('Failed to connect Facebook account')
      }
      
      const data = await response.json()
      return data.pages
    } catch (error) {
      console.error('Error connecting Facebook account:', error)
      throw error
    }
  },

  async getConnectedPages(userId: string): Promise<SocialConnection[]> {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'facebook')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching connected pages:', error)
      throw error
    }
  },

  async schedulePost(postData: {
    userId: string
    provider: string
    accountId: string
    contentText: string
    mediaUrl?: string
    scheduledTime: string
  }) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: postData.userId,
          provider: postData.provider,
          account_id: postData.accountId,
          content_text: postData.contentText,
          media_url: postData.mediaUrl,
          scheduled_time: postData.scheduledTime,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error scheduling post:', error)
      throw error
    }
  },

  async getScheduledPosts(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      throw error
    }
  }
}