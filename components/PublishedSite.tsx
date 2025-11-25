import React, { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

interface PublishedSiteProps {
    subdomain: string;
}

export const PublishedSite: React.FC<PublishedSiteProps> = ({ subdomain }) => {
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSite = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('websites')
                    .select('html_content, project_name')
                    .eq('subdomain', subdomain)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Website not found');

                setHtmlContent(data.html_content);
                document.title = data.project_name || subdomain;
            } catch (err: any) {
                console.error('Error fetching site:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSite();
    }, [subdomain]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !htmlContent) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Site not found or has been removed.</p>
                <div className="text-sm text-gray-400">Subdomain: {subdomain}</div>
            </div>
        );
    }

    return (
        <iframe
            srcDoc={htmlContent}
            className="w-full h-screen border-0"
            title="Published Website"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
        />
    );
};
