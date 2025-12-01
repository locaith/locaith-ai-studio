import React, { useState, useEffect } from 'react'
import { Clock, Code, Palette, Search, Mic, Zap, Settings, User, ExternalLink } from 'lucide-react'
import { useUserActivity } from '../src/hooks/useUserActivity'
import { useAuth } from '../src/hooks/useAuth'

interface RecentHistorySidebarProps {
  currentFeature: string
  isCollapsed?: boolean
}

interface ActivityItem {
  id: string
  feature_type: string
  action_type: string
  action_details: any
  created_at: string
}

const featureIcons = {
  'web-builder': Code,
  'design': Palette,
  'text': Code,
  'search': Search,
  'voice': Mic,
  'automation': Zap,
  'settings': Settings
}

const featureColors = {
  'web-builder': 'text-blue-500',
  'design': 'text-zinc-500',
  'text': 'text-green-500',
  'search': 'text-yellow-500',
  'voice': 'text-zinc-500',
  'automation': 'text-orange-500',
  'settings': 'text-gray-500'
}

const actionLabels = {
  'create': 'Created',
  'update': 'Updated',
  'delete': 'Deleted',
  'view': 'Viewed',
  'export': 'Exported',
  'deploy': 'Deployed',
  'generate': 'Generated',
  'schedule': 'Scheduled'
}

export const RecentHistorySidebar: React.FC<RecentHistorySidebarProps> = ({ 
  currentFeature, 
  isCollapsed = false 
}) => {
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const { getRecentActivity } = useUserActivity()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      loadRecentActivity()
    }
  }, [isAuthenticated])

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      const activity = await getRecentActivity(10)
      setRecentActivity(activity)
    } catch (error) {
      console.error('Error loading recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`
    }
  }

  const getActionDescription = (item: ActivityItem) => {
    const action = actionLabels[item.action_type as keyof typeof actionLabels] || item.action_type
    
    if (item.action_details?.description) {
      return item.action_details.description
    }
    
    if (item.action_details?.project_name) {
      return `${action} "${item.action_details.project_name}"`
    }
    
    if (item.action_details?.prompt) {
      const prompt = item.action_details.prompt
      return `${action} "${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}"`
    }
    
    return `${action} ${item.feature_type.replace('-', ' ')}`
  }

  if (!isAuthenticated) {
    return null
  }

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white/80 backdrop-blur-md border-r border-gray-200 p-2 mt-10 md:mt-12 h-[calc(100vh-40px)] md:h-[calc(100vh-48px)]">
        <div className="flex flex-col items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="text-xs text-gray-500 text-center">History</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col mt-10 md:mt-12 h-[calc(100vh-40px)] md:h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <p className="text-xs text-gray-500">Your recent actions across all features</p>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
            Loading...
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Start using features to see your history</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentActivity.map((item) => {
              const IconComponent = featureIcons[item.feature_type as keyof typeof featureIcons] || Code
              const colorClass = featureColors[item.feature_type as keyof typeof featureColors] || 'text-gray-500'
              
              return (
                <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-1">
                        {getActionDescription(item)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTime(item.created_at)}
                      </div>
                    </div>
                    {item.action_details?.url && (
                      <button 
                        onClick={() => window.open(item.action_details.url, '_blank')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button 
          onClick={loadRecentActivity}
          className="w-full text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}