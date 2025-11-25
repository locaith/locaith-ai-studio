import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useCallback } from 'react';

export type ActivityFeature = 'web-builder' | 'design' | 'text' | 'search' | 'automation' | 'dashboard';
export type ActivityAction = 'create' | 'update' | 'delete' | 'deploy' | 'generate' | 'view';

interface LogActivityParams {
    feature: ActivityFeature;
    action: ActivityAction;
    details?: Record<string, any>;
}

export const useActivity = () => {
    const { user } = useAuth();

    const logActivity = useCallback(async ({ feature, action, details }: LogActivityParams) => {
        if (!user?.id) {
            console.warn('Cannot log activity: No user');
            return;
        }

        try {
            const { error } = await supabase
                .from('user_activity')
                .insert({
                    user_id: user.id,
                    feature_type: feature,
                    action_type: action,
                    action_details: details || {},
                    created_at: new Date().toISOString()
                });

            if (error) {
                console.error('Failed to log activity:', error);
            } else {
                console.log(`📝 Activity logged: ${feature}.${action}`);
            }
        } catch (err) {
            console.error('Activity logging error:', err);
        }
    }, [user?.id]);

    return { logActivity };
};
