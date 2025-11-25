import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/hooks/useAuth';
import {
    Clock,
    Globe,
    Github,
    Trash2,
    ExternalLink,
    Layout,
    Plus,
    Activity,
    Server,
    BarChart3,
    ArrowUpRight,
    MoreHorizontal,
    Calendar,
    Zap
} from 'lucide-react';

interface Website {
    id: string;
    project_name: string;
    subdomain: string;
    created_at: string;
    github_repo?: string;
    status: string;
    updated_at?: string;
    html_content?: string;
    messages?: any[];
}

interface ActivityLog {
    id: string;
    feature_type: string;
    action_type: string;
    created_at: string;
    action_details?: any;
}

interface Deployment {
    id: string;
    version: number;
    deployed_at: string;
    website_id: string;
}

export const DashboardFeature: React.FC<{ onOpenProject: (website: Website) => void, onNewProject: () => void }> = ({ onOpenProject, onNewProject }) => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [websites, setWebsites] = useState<Website[]>([]);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [stats, setStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visRefresh, setVisRefresh] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (authLoading) return; // Wait for auth to finish

            if (!user) {
                if (isMounted) setLoading(false);
                return;
            }

            // Failsafe timeout
            const timeoutId = setTimeout(() => {
                if (isMounted && loading) {
                    console.warn('Dashboard loading timed out');
                    setLoading(false);
                }
            }, 8000);

            try {
                if (isMounted) setLoading(true);

                // Filter deployments by user's websites to avoid RLS scanning issues
                const [wRes, aRes, dRes, sRes] = await Promise.all([
                    supabase.from('websites').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
                    supabase.from('user_activity').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
                    supabase.from('deployments').select('*, websites!inner(user_id)').eq('websites.user_id', user.id).order('deployed_at', { ascending: false }).limit(10),
                    supabase.rpc('get_user_stats', { user_uuid: user.id })
                ]);

                if (!isMounted) return;

                if (wRes.error) throw wRes.error;
                if (aRes.error) throw aRes.error;

                setWebsites(wRes.data || []);
                setActivities(aRes.data || []);
                setDeployments(dRes.data ? dRes.data.map((d: any) => {
                    const { websites, ...rest } = d; // Remove joined table data
                    return rest;
                }) : []);
                setStats(sRes.data || null);
            } catch (err: any) {
                console.error('Error loading dashboard:', err);
                // Don't show error to user if it's just stats missing
                if (err.message?.includes('get_user_stats')) {
                    console.warn('Stats RPC missing, ignoring');
                } else if (isMounted) {
                    setError(err.message);
                }
            } finally {
                clearTimeout(timeoutId);
                if (isMounted) setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [user, authLoading, visRefresh]);

    useEffect(() => {
        let isRefreshing = false;

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isAuthenticated && !isRefreshing && !loading) {
                isRefreshing = true;
                setVisRefresh((v) => v + 1);
                setTimeout(() => { isRefreshing = false; }, 1000);
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [isAuthenticated, loading]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('websites')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setWebsites(prev => prev.filter(w => w.id !== id));
        } catch (err: any) {
            alert('Error deleting website: ' + err.message);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const getGradient = (name: string) => {
        const gradients = [
            'from-rose-400 to-orange-300',
            'from-violet-600 to-indigo-600',
            'from-cyan-500 to-blue-500',
            'from-emerald-400 to-cyan-400',
            'from-fuchsia-500 to-pink-500',
            'from-amber-400 to-orange-500'
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
        return gradients[index];
    };

    if (authLoading || loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Layout className="w-8 h-8 text-brand-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Locaith AI</h2>
                    <p className="text-gray-500 mb-8">Please sign in to access your dashboard and manage your projects.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-[#F8FAFC] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator'}</p>
                    </div>
                    <button
                        onClick={onNewProject}
                        className="group flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-medium">New Project</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Layout size={20} />
                            </div>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+2 this week</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_websites ?? websites.length}</div>
                        <div className="text-sm text-gray-500">Total Projects</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <Server size={20} />
                            </div>
                            <span className="text-xs font-medium text-gray-500">All time</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_deployments ?? deployments.length}</div>
                        <div className="text-sm text-gray-500">Total Deployments</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                <Zap size={20} />
                            </div>
                            <span className="text-xs font-medium text-gray-500">Latest</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                            {activities.length > 0 ? formatDate(activities[0].created_at) : '-'}
                        </div>
                        <div className="text-sm text-gray-500">Last Activity</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Projects Section (2/3 width on large screens) */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                            <button className="text-sm text-brand-600 font-medium hover:text-brand-700 hover:underline">View All</button>
                        </div>

                        {websites.length === 0 ? (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                                <p className="text-gray-500 max-w-sm mb-6">Start your journey by creating your first AI-powered website.</p>
                                <button onClick={onNewProject} className="text-brand-600 font-medium hover:underline">Create Project</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {websites.map((site) => (
                                    <div
                                        key={site.id}
                                        onClick={() => onOpenProject(site)}
                                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                                    >
                                        <div className={`h-36 bg-gradient-to-br ${getGradient(site.project_name)} relative p-4 flex flex-col justify-between`}>
                                            <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium">
                                                    {site.status}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDelete(site.id, e)}
                                                    className="p-1.5 bg-white/20 backdrop-blur-md hover:bg-red-500 text-white rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div className="bg-white/90 backdrop-blur-sm self-start px-3 py-1.5 rounded-lg text-xs font-mono text-gray-700 shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                {site.subdomain && site.subdomain.includes('.') ? site.subdomain : `${site.subdomain}.locaith.ai`}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{site.project_name}</h3>
                                                <ArrowUpRight size={18} className="text-gray-300 group-hover:text-brand-600 transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    <span>{formatDate(site.updated_at || site.created_at)}</span>
                                                </div>
                                                {site.github_repo && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Github size={14} />
                                                        <span>Linked</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Activity Feed (1/3 width) */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                            {activities.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">No recent activity</div>
                            ) : (
                                <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {activities.map((activity, index) => (
                                        <div key={activity.id} className="relative pl-6 py-3 group hover:bg-gray-50 rounded-lg transition-colors">
                                            {/* Timeline line */}
                                            {index !== activities.length - 1 && (
                                                <div className="absolute left-[11px] top-8 bottom-0 w-px bg-gray-100 group-hover:bg-gray-200 transition-colors" />
                                            )}

                                            {/* Dot */}
                                            <div className="absolute left-0 top-4 w-[22px] h-[22px] rounded-full bg-white border-2 border-gray-100 flex items-center justify-center z-10 group-hover:border-brand-200 group-hover:scale-110 transition-all">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-brand-500 transition-colors" />
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {activity.action_type === 'create' ? 'Created' :
                                                        activity.action_type === 'update' ? 'Updated' :
                                                            activity.action_type === 'delete' ? 'Deleted' :
                                                                activity.action_type}
                                                    <span className="text-gray-500 font-normal"> {activity.feature_type}</span>
                                                </span>
                                                <span className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(activity.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
