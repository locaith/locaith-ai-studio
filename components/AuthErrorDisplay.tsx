import React from 'react';
import { AuthError } from '../src/hooks/useAuth';

interface AuthErrorDisplayProps {
    error: AuthError | null;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error, onRetry, onDismiss }) => {
    if (!error) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                        <p className="mt-1 text-sm text-red-700">{error.message}</p>
                        {error.code && (
                            <p className="mt-1 text-xs text-red-600">Error code: {error.code}</p>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {onRetry && (
                    <div className="mt-3">
                        <button
                            onClick={onRetry}
                            className="w-full bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded-md transition-colors text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
