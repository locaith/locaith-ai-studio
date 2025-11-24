import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/hooks/useAuth';
import { Clock, Globe, Github, Trash2, ExternalLink, Layout, Plus, Activity, Server, BarChart3 } from 'lucide-react';

interface Website {
    id: string;
    project_name: string;
    subdomain: string;
    created_at: string;
    github_repo?: string;
    status: string;
}

export const DashboardFeature: React.FC<{ onOpenProject: (website: Website) => void, onNewProject: () => void }> = ({ onOpenProject, onNewProject }) => {
    const { user, isAuthenticated } = useAuth();
    const [websites, setWebsites] = useState<Website[]>([]);
    const [deployments, setDeployments] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [stats, setStats] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchAll();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [wRes, aRes, dRes, sRes] = await Promise.all([
                supabase.from('websites').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
                supabase.from('user_activity_history').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(25),
                supabase.from('deployments').select('*').order('deployed_at', { ascending: false }).limit(25),
                supabase.rpc('get_user_stats', { user_uuid: user?.id })
            ]);

            if (wRes.error) throw wRes.error;
            if (aRes.error) throw aRes.error;
            if (dRes.error) throw dRes.error;
            setWebsites(wRes.data || []);
            setActivities(aRes.data || []);
            setDeployments(dRes.data || []);
            setStats(sRes.data || null);
        } catch (err: any) {
            console.error('Error loading dashboard:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const { error } = await supabase
                .from('websites')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setWebsites(websites.filter(w => w.id !== id));
        } catch (err: any) {
            alert('Error deleting website: ' + err.message);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Generate a deterministic gradient based on the project name
    const getGradient = (name: string) => {
        const colors = [
            'from-pink-500 to-rose-500',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-violet-500 to-purple-500',
            'from-amber-500 to-orange-500',
            'from-indigo-500 to-blue-600'
        ];
        const index = name.length % colors.length;
        return colors[index];
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="h-full w-full overflow-y-auto bg-gray-50 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Đăng nhập để xem Dashboard</h2>
                    </div>
                </div>
            </div>
        );
    }

    const activeCount = useMemo(() => websites.filter(w => w.status === 'active').length, [websites]);
    const pausedCount = useMemo(() => websites.filter(w => w.status === 'paused').length, [websites]);

    return (
        <div className="h-full w-full overflow-y-auto bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Tổng quan dự án, hoạt động và lần triển khai gần đây</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onNewProject}
                            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
                        >
                            <Plus size={18} />
                            <span className="font-medium">Tạo dự án</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-100">
                        {error}
                    </div>
                )}

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-brand-600" />
                        <div>
                            <div className="text-xs text-gray-500">Tổng dự án</div>
                            <div className="text-xl font-bold text-gray-900">{stats?.total_websites ?? websites.length}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                        <Server className="w-5 h-5 text-emerald-600" />
                        <div>
                            <div className="text-xs text-gray-500">Tổng deployments</div>
                            <div className="text-xl font-bold text-gray-900">{stats?.total_deployments ?? deployments.length}</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <div>
                            <div className="text-xs text-gray-500">Hoạt động gần nhất</div>
                            <div className="text-sm font-medium text-gray-900">{stats?.last_activity_at ? new Date(stats.last_activity_at).toLocaleString() : '—'}</div>
                        </div>
                    </div>
                </div>

                {/* Two Column: Activity & Deployments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="font-semibold">Hoạt động gần đây</div>
                            <div className="text-xs text-gray-400">{activities.length} mục</div>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                            {activities.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">Chưa có hoạt động</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {activities.map((a) => (
                                        <div key={a.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{a.feature_type} • {a.action_type}</div>
                                                    <div className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">{a.action_details ? JSON.stringify(a.action_details).slice(0,60) + (JSON.stringify(a.action_details).length>60?'…':'') : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-semibold">Triển khai gần đây</div>
                        <div className="max-h-72 overflow-y-auto">
                            {deployments.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">Chưa có deployment</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {deployments.slice(0,10).map((d) => (
                                        <div key={d.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                    <Server className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Version {d.version}</div>
                                                    <div className="text-xs text-gray-500">{new Date(d.deployed_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">{String(d.website_id).slice(0,8)}…</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {websites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Layout className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md text-center">
                            Start building your dream website with AI. Just describe what you want, and we'll code it for you.
                        </p>
                        <button
                            onClick={onNewProject}
                            className="text-brand-600 font-medium hover:underline"
                        >
                            Create your first project &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {websites.map((site) => (
                            <div
                                key={site.id}
                                onClick={() => onOpenProject(site)}
                                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-[280px]"
                            >
                                {/* Thumbnail / Preview Area */}
                                <div className={`h-32 bg-gradient-to-br ${getGradient(site.project_name)} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                                    {/* Overlay Content */}
                                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-gray-700 shadow-sm">
                                            {site.subdomain}.locaith.ai
                                        </div>
                                    </div>

                                    {/* Hover Actions */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
                                        <button
                                            onClick={(e) => handleDelete(site.id, e)}
                                            className="p-2 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg shadow-sm transition-colors"
                                            title="Delete Project"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
                                            {site.project_name}
                                        </h3>
                                        {site.github_repo && (
                                            <Github size={16} className="text-gray-400 mt-1" />
                                        )}
                                    </div>

                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                        {/* Description would go here if we had one, for now using status */}
                                        Status: <span className="capitalize">{site.status}</span>
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            <span>{formatDate(site.created_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>Open Studio</span>
                                            <ExternalLink size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
