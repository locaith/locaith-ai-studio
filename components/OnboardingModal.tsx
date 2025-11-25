import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

interface OnboardingModalProps {
    userId: string;
    onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, onComplete }) => {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        try {
            setLoading(true);

            // Update profile with onboarding_completed
            const { error } = await supabase
                .from('profiles')
                .update({
                    onboarding_completed: true,
                    ...(fullName && { full_name: fullName })
                })
                .eq('id', userId);

            if (error) throw error;

            onComplete();
        } catch (error) {
            console.error('Error completing onboarding:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                {step === 1 && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Locaith AI Studio!</h2>
                        <p className="text-gray-600 mb-6">
                            Create stunning websites, documents, and designs with the power of AI.
                        </p>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Profile</h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            Help us personalize your experience
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name (optional)
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
                        <p className="text-gray-600 mb-6">
                            Start creating amazing content with Locaith AI Studio
                        </p>

                        <button
                            onClick={handleComplete}
                            disabled={loading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Start Creating'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
