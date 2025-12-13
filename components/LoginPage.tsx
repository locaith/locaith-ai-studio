import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/hooks/useAuth';
import { AuthErrorDisplay } from './AuthErrorDisplay';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resendVerificationEmail, loading: authLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // FAILSAFE: Auto-reset if stuck in loading (soft handling)
  useEffect(() => {
    if (!isSigningIn) return;

    const timer = setTimeout(() => {
      console.warn('⚠️ Sign in loading timeout - please try again')
      alert('Sign in seems to be taking too long. Please try again.');
      setIsSigningIn(false);
      // Do not clear storage or reload to avoid losing session
    }, 15000)

    return () => clearTimeout(timer)
  }, [isSigningIn])

  const handleGoogleLogin = async () => {
    if (isSigningIn) return;
    try {
      setIsSigningIn(true);
      clearError?.();
      await signInWithGoogle();
      // Redirect will happen automatically
    } catch (error) {
      console.error("Login failed:", error);
      setIsSigningIn(false);
    }
  };

  const handleRetry = () => {
    clearError?.();
    if (email && password) {
      handleSubmit(new Event('submit') as any);
    } else {
      handleGoogleLogin();
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail(email);
      alert('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    if (isSignUp && !fullName) {
        alert('Please enter your full name');
        return;
    }

    try {
        setIsSigningIn(true);
        clearError?.();
        
        if (isSignUp) {
            await signUpWithEmail(email, password, fullName);
            alert('Registration successful! Please check your email to confirm your account.');
            setIsSignUp(false); // Switch back to login
        } else {
            await signInWithEmail(email, password);
            onLoginSuccess();
        }
    } catch (err) {
        console.error("Authentication failed:", err);
    } finally {
        setIsSigningIn(false);
    }
  };

  const videos = [
    '/locaith-tv-animation-2-xuathien.mp4',
    '/intro.mp4',
    '/Locaith-AI-Co-2.mp4',
    '/Locaith-AI-Co-3.mp4'
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div className="min-h-screen bg-[#020617] relative lg:grid lg:grid-cols-2 overflow-hidden">

      {/* Video Background (Mobile: Absolute Fullscreen, Desktop: Right Column) */}
      <div className="absolute inset-0 lg:relative h-full w-full bg-black overflow-hidden z-0 lg:order-2">
        {/* Overlay for mobile readability */}
        <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-l lg:from-transparent lg:to-[#020617] z-10 lg:w-32" />
        <video
          key={videos[currentVideoIndex]}
          src={videos[currentVideoIndex]}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover opacity-75 lg:opacity-80"
        />
        <div className="absolute bottom-12 right-12 z-20 text-right max-w-md hidden lg:block">
          <h2 className="text-3xl font-bold text-white mb-2">Experience the Future</h2>
          <p className="text-slate-400">Build, design, and automate with the power of Locaith AI.</p>
        </div>
      </div>

      {/* Left Column: Form */}
      <div className="relative flex flex-col justify-center px-4 sm:px-12 md:px-20 lg:px-24 xl:px-32 z-20 lg:order-1 h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Glow background for form area - Desktop only or subtle on mobile */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-zinc-500/10 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="relative w-full max-w-md mx-auto lg:max-w-none">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-8 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Studio
          </button>

          {/* Logo & Title */}
          <div className="mb-10">
            <img
              src="/logo-locaith.png"
              alt="Locaith Studio"
              className="w-12 h-12 mb-6"
            />
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
              {isSignUp ? 'Create Account' : 'Locaith Studio'}
            </h1>
            <p className="text-slate-400 text-lg">
              {isSignUp ? 'Join us to build your AI ecosystem.' : 'Log in to control your entire AI ecosystem.'}
            </p>
          </div>

          {/* Form */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error.message}</p>
              {error.message.includes('Email not confirmed') && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="mt-2 text-brand-400 hover:text-brand-300 text-sm font-medium underline"
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder-slate-600"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder-slate-600"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full rounded-xl bg-white text-black font-semibold py-3.5 text-sm hover:bg-slate-200 transition-colors shadow-lg shadow-white/5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#020617] px-4 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 text-white font-medium py-3.5 text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSigningIn && !email ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
            <button 
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    clearError?.();
                    setEmail('');
                    setPassword('');
                    setFullName('');
                }} 
                className="text-brand-400 hover:text-brand-300 transition-colors font-medium focus:outline-none"
            >
              {isSignUp ? 'Sign in' : 'Sign up now'}
            </button>
          </p>
        </div>

        {/* Auth Error Display */}
        <AuthErrorDisplay
          error={error}
          onRetry={handleRetry}
          onDismiss={clearError}
        />
      </div>
    </div >
  );
};
