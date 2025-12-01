import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../src/hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup')
  const { signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  
  const videos = [
    '/locaith-tv-animation-2-xuathien.mp4',
    '/Locaith AI Co.mp4',
    '/Locaith AI Co-2.mp4',
    '/Locaith AI Co-3.mp4'
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  useEffect(() => {
    setIsLogin(initialMode !== 'signup')
  }, [initialMode, isOpen])

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      onClose()
      navigate('/')
    } catch (error) {
      console.error('Google sign in failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        {/* Left Panel - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-12 bg-white">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <img src="/logo-locaith.png" alt="Locaith" className="w-10 h-10" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Log into your account
            </h1>

            {/* Google Auth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mt-8 flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white rounded-lg py-3.5 px-4 mb-4 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Email Button */}
            <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg py-3.5 px-4 mb-4 transition-colors font-medium text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Login with email
            </button>

            {/* Apple Button */}
            <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg py-3.5 px-4 mb-6 transition-colors font-medium text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Login with Apple
            </button>

            {/* Sign up link */}
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline font-semibold"
              >
                Sign up
              </button>
            </p>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center mt-8">
              By continuing, you agree to{' '}
              <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Right Panel - Brand Display with SVG */}
        <div className="hidden lg:flex lg:w-1/2 bg-black flex-col items-center justify-center relative overflow-hidden">
          <video
            key={videos[currentVideoIndex]}
            src={videos[currentVideoIndex]}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

          <div className="relative z-20 flex flex-col items-center justify-center p-16 w-full h-full">
              {/* SVG Logo Display */}
              <div className="w-full max-w-md flex items-center justify-center mb-8">
                <img
                  src="/locaith-logo-script-tv.svg"
                  alt="Locaith Logo"
                  className="w-full h-auto opacity-90 drop-shadow-2xl"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              </div>

              {/* Tagline */}
              <div className="text-center">
                <p className="text-white/90 text-lg font-light tracking-wide">
                  AI-Powered Studio for Modern Creators
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}