
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CONFIGURATION ---
// REPLACE THIS WITH YOUR REAL FACEBOOK APP ID
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '123456789012345'; 

type Step = 'CONNECT' | 'SETUP' | 'KEYWORDS' | 'PREVIEW' | 'DASHBOARD';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: any;
  }
}

interface Comment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
    replies: Comment[];
}

interface Post {
    id: string;
    content: string;
    image?: string;
    likes: number;
    comments: Comment[];
    date: string;
    status: 'published' | 'scheduled';
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  pageName: string;
  status: 'active' | 'paused';
  nextPost: string;
  postsCount: number;
  scheduledTime: string;
  startDate: string;
}

interface SetupForm {
  name: string;
  description: string;
  generateImage: boolean;
  audience: string;
  insight: string;
  postsPerDay: number;
  startDate: string;
  scheduledTime: string;
  style: string;
}

interface UserProfile {
    name: string;
    avatar: string;
    email: string;
    id?: string;
}

interface PageData {
    name: string;
    id: string;
    access_token?: string;
    category?: string;
    avatar?: string;
}

const SOCIAL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com', color: '#1877f2', bgClass: 'bg-[#1877f2]', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg> },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com', color: '#0077b5', bgClass: 'bg-[#0077b5]', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
  { id: 'twitter', name: 'X (Twitter)', url: 'https://twitter.com', color: '#000000', bgClass: 'bg-black', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', color: '#E1306C', bgClass: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500', icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.979-6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
];

// Helper to create mock engagement
const createMockComments = (): Comment[] => [
    {
        id: 'c1',
        user: 'Minh Anh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
        text: 'Bài viết rất hữu ích, cảm ơn ad!',
        timestamp: '10 phút trước',
        replies: []
    },
    {
        id: 'c2',
        user: 'Tuấn Hưng',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=100&h=100&q=80',
        text: 'Sản phẩm này giá bao nhiêu vậy shop?',
        timestamp: '32 phút trước',
        replies: []
    }
];

export const ContentAutomationFeature: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('CONNECT');
  
  // Auth Flow State
  const [authStep, setAuthStep] = useState<'idle' | 'loading-sdk' | 'scanning' | 'success' | 'permission-request'>('idle');
  const [connectedPlatform, setConnectedPlatform] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Facebook Specific State
  const [scannedPages, setScannedPages] = useState<PageData[]>([]);
  const [selectedPageData, setSelectedPageData] = useState<PageData | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  
  // AI Loading
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Step 2: Form Data
  const [formData, setFormData] = useState<SetupForm>({
    name: '',
    description: '',
    generateImage: true,
    audience: '',
    insight: '',
    postsPerDay: 1,
    startDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    style: 'Storytelling',
  });

  // Step 3: Keywords
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<string | null>(null);

  // Step 4: Generated Content
  const [previewContent, setPreviewContent] = useState<{text: string; imageUrl: string} | null>(null);

  // Step 5: Dashboard
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Dashboard Page Interaction View State
  const [dashboardView, setDashboardView] = useState<'list' | 'page_feed'>('list');
  const [selectedCampaignForFeed, setSelectedCampaignForFeed] = useState<Campaign | null>(null);
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [replyInputs, setReplyInputs] = useState<{[key: string]: string}>({});

  // --- Initialize Facebook SDK ---
  useEffect(() => {
      const initFacebookSDK = () => {
          if (window.FB) {
              setSdkLoaded(true);
              return;
          }
          
          window.fbAsyncInit = function() {
              window.FB.init({
                appId      : FACEBOOK_APP_ID,
                cookie     : true,
                xfbml      : true,
                version    : 'v19.0'
              });
              setSdkLoaded(true);
              console.log("Facebook SDK Initialized");
          };

          // Load the SDK asynchronously
          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             // @ts-ignore
             js.src = "https://connect.facebook.net/en_US/sdk.js";
             // @ts-ignore
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));
      };

      initFacebookSDK();
  }, []);

  // --- Real Auth Logic ---

  const handleConnectFacebook = () => {
      if (!sdkLoaded || !window.FB) {
          alert("Facebook SDK is still loading or blocked. Please disable ad blockers.");
          return;
      }

      setConnectedPlatform('Facebook');
      setAuthStep('loading-sdk');
      
      // 1. TRIGGER REAL LOGIN (SCANNING PHASE)
      window.FB.login((response: any) => {
          if (response.authResponse) {
              setAuthStep('scanning');
              
              // 2. FETCH REAL USER DATA
              window.FB.api('/me', {fields: 'name,email,picture.width(150).height(150)'}, (userInfo: any) => {
                  if (userInfo && !userInfo.error) {
                       setUserProfile({
                          name: userInfo.name,
                          email: userInfo.email || 'Not shared',
                          avatar: userInfo.picture?.data?.url, // REAL AVATAR
                          id: userInfo.id
                       });

                       // 3. FETCH REAL PAGES
                       window.FB.api('/me/accounts', {fields: 'name,id,category,access_token,picture'}, (pagesResponse: any) => {
                            if (pagesResponse && !pagesResponse.error) {
                                const realPages = pagesResponse.data.map((p: any) => ({
                                    name: p.name,
                                    id: p.id,
                                    category: p.category,
                                    access_token: p.access_token,
                                    avatar: p.picture?.data?.url
                                }));
                                setScannedPages(realPages);
                                setAuthStep('success');
                            } else {
                                console.error("Error fetching pages:", pagesResponse.error);
                                setScannedPages([]); 
                                setAuthStep('success'); // Success login, but no pages
                            }
                       });
                  } else {
                      console.error("Error fetching profile:", userInfo.error);
                      setAuthStep('idle');
                  }
              });

          } else {
              console.log('User cancelled login or did not fully authorize.');
              setAuthStep('idle');
          }
      }, { scope: 'public_profile,email,pages_show_list,read_insights' });
  };

  const selectPage = (page: PageData) => {
      setSelectedPageData(page);
      setAuthStep('permission-request');
  };

  const handleGrantPublishPermission = () => {
      if (!selectedPageData) return;

      // 4. TRIGGER SECOND LOGIN FOR PUBLISHING RIGHTS
      window.FB.login((response: any) => {
          if (response.authResponse) {
              // Permission granted
              console.log("Publish permission granted for page:", selectedPageData.name);
              setCurrentStep('SETUP');
              setAuthStep('idle');
          } else {
              console.log("Permission denied");
          }
      }, { 
          scope: 'pages_manage_posts,pages_read_engagement',
          auth_type: 'reauthenticate' // Force re-auth to verify user intent
      });
  };

  const handleBack = () => {
      if (currentStep === 'SETUP') setCurrentStep('CONNECT');
      if (currentStep === 'KEYWORDS') setCurrentStep('SETUP');
      if (currentStep === 'PREVIEW') setCurrentStep('KEYWORDS');
      if (currentStep === 'DASHBOARD') {
          if (dashboardView === 'page_feed') {
              setDashboardView('list');
              return;
          }
          setCurrentStep('CONNECT');
      }
  };

  // --- AI Helpers ---

  const suggestWithAI = async (field: keyof SetupForm) => {
    if (!formData.name) return;
    setIsLoadingAI(true);
    try {
      const prompt = `Based on the marketing campaign name "${formData.name}", suggest a short, professional value for the "${field}" field. Only return the text value.`;
      const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      if (result.text) {
        setFormData(prev => ({ ...prev, [field]: result.text.trim() }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const autoFillAll = async () => {
    if (!formData.name) return;
    setIsLoadingAI(true);
    try {
      const prompt = `
        I am setting up a social media campaign named "${formData.name}".
        1. Detect the language of the name "${formData.name}".
        2. Return a JSON object with these fields filled out in that DETECTED LANGUAGE:
           - description (short summary)
           - audience (target demographic)
           - insight (key consumer insight)
           - style (e.g., SEO, Storytelling, Professional, Humorous - keep style name in English or appropriate local term)
      `;
      const result = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      const json = JSON.parse(result.text);
      setFormData(prev => ({ ...prev, ...json }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateHeadlines = async () => {
    setIsLoadingAI(true);
    try {
        const prompt = `
            Generate 5 viral, engaging headlines/hooks for a social media post about "${formData.name}".
            Context: ${formData.description}.
            Target Audience: ${formData.audience}.
            Style: ${formData.style}.
            Language: Detect from context.
            Return only the 5 headlines as a JSON array of strings.
        `;
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const headlines = JSON.parse(result.text);
        setGeneratedHeadlines(headlines);
        setCurrentStep('KEYWORDS');
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoadingAI(false);
    }
  };

  const generateFinalPost = async () => {
      if (!selectedHeadline) return;
      setIsLoadingAI(true);
      try {
          const textPrompt = `
            Write a complete social media post based on the headline: "${selectedHeadline}".
            Style: ${formData.style}.
            Audience: ${formData.audience}.
            Language: Detect from headline.
            Structure the post beautifully with HTML. 
            Use bolding for key points (wrap in **asterisks**).
            Use proper paragraphs.
            Include relevant hashtags at the end.
          `;
          
          const textResult = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: textPrompt });
          
          const imagePromptRequest = `Describe a high-quality, photorealistic image to accompany this post: "${selectedHeadline}". Short description only.`;
          const imagePromptResult = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: imagePromptRequest });
          
          const imgDesc = imagePromptResult.text.trim();
          const encodedDesc = encodeURIComponent(imgDesc);
          const imageUrl = `https://image.pollinations.ai/prompt/${encodedDesc}?width=800&height=600&nologo=true`;

          setPreviewContent({
              text: textResult.text,
              imageUrl: imageUrl
          });
          setCurrentStep('PREVIEW');
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingAI(false);
      }
  };

  const confirmCampaign = () => {
      const newCampaign: Campaign = {
          id: Date.now().toString(),
          name: formData.name,
          platform: connectedPlatform || 'Social',
          pageName: selectedPageData?.name || 'My Page',
          status: 'active',
          nextPost: 'Tomorrow, ' + formData.scheduledTime,
          postsCount: 1, // Start with 1 post published
          scheduledTime: formData.scheduledTime,
          startDate: formData.startDate
      };
      setCampaigns(prev => [newCampaign, ...prev]);
      setCurrentStep('DASHBOARD');
  };

  const openPageFeed = (campaign: Campaign) => {
      setSelectedCampaignForFeed(campaign);
      
      // Mock Feed Data (Since we can't fetch real feed without advanced permissions in this demo)
      const mockPosts: Post[] = [
          {
              id: 'post-1',
              content: previewContent?.text || "Bài viết mẫu...",
              image: previewContent?.imageUrl,
              likes: 12,
              comments: [],
              date: 'Vừa xong',
              status: 'published'
          },
          {
              id: 'post-2',
              content: `Chào mừng các bạn đến với ${campaign.pageName}! Chúng tôi rất vui được chia sẻ những kiến thức bổ ích về ${formData.name} trong thời gian tới.`,
              likes: 45,
              comments: createMockComments(),
              date: '2 giờ trước',
              status: 'published'
          }
      ];
      setFeedPosts(mockPosts);
      setDashboardView('page_feed');
  };

  const handleReply = (postId: string, commentId: string) => {
      const replyText = replyInputs[commentId];
      if (!replyText?.trim()) return;

      setFeedPosts(posts => posts.map(post => {
          if (post.id !== postId) return post;
          return {
              ...post,
              comments: post.comments.map(comment => {
                  if (comment.id !== commentId) return comment;
                  return {
                      ...comment,
                      replies: [...comment.replies, {
                          id: Date.now().toString(),
                          user: userProfile?.name || 'Page Admin',
                          avatar: userProfile?.avatar || '',
                          text: replyText,
                          timestamp: 'Vừa xong',
                          replies: []
                      }]
                  };
              })
          };
      }));
      setReplyInputs(prev => ({...prev, [commentId]: ''}));
  };

  // --- Render Helper: Format Post Content ---
  const renderPostContent = (text: string) => {
      if (!text) return null;
      // Basic cleanup of markdown code blocks if Gemini adds them
      const cleanText = text.replace(/```html/g, '').replace(/```/g, '');
      
      const lines = cleanText.split('\n');
      return lines.map((line, index) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
              <div key={index} className={`min-h-[20px] ${line.trim() === '' ? 'mb-3' : 'mb-1'}`}>
                  {parts.map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                      } else {
                          const words = part.split(/(\s+)/);
                          return words.map((word, wIdx) => {
                              if(word.startsWith('#')) {
                                  return <span key={wIdx} className="text-blue-600 hover:underline cursor-pointer font-medium">{word}</span>
                              }
                              return word;
                          });
                      }
                  })}
              </div>
          );
      });
  };

  // --- Render Components ---

  const StepIndicator = () => {
      const steps: Step[] = ['CONNECT', 'SETUP', 'KEYWORDS', 'PREVIEW', 'DASHBOARD'];
      const activeIndex = steps.indexOf(currentStep);
      const progressPercent = Math.max(0, Math.min(100, ((activeIndex + 1) / steps.length) * 100));
      return (
        <>
          <div className="hidden md:flex items-center justify-center mb-8">
              {['Connect', 'Setup', 'Keywords', 'Preview', 'Active'].map((label, idx) => {
                 const isActive = activeIndex >= idx;
                 return (
                     <div key={idx} className="flex items-center">
                         <div className={`flex flex-col items-center gap-2 ${idx !== 0 ? 'ml-4' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${isActive ? 'bg-brand-600 text-white scale-110' : 'bg-gray-200 text-gray-500'}`}>
                                {idx + 1}
                            </div>
                            <span className={`text-[10px] uppercase font-semibold ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>{label}</span>
                         </div>
                         {idx < 4 && <div className={`w-12 h-0.5 mx-2 transition-colors duration-500 ${activeIndex > idx ? 'bg-brand-600' : 'bg-gray-200'}`}></div>}
                     </div>
                 );
              })}
          </div>
          <div className="md:hidden mb-6 px-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-brand-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="mt-2 text-[10px] text-gray-500 uppercase font-semibold text-center">
              {activeIndex + 1} / {steps.length}
            </div>
          </div>
        </>
      );
  };

  return (
    <div className="h-full bg-white/50 backdrop-blur-sm overflow-y-auto p-6 animate-fade-in-up">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Auto-Pilot Content</h1>
                <p className="text-gray-500">Tạo nội dung, lên lịch và tự động hóa mạng xã hội của bạn.</p>
            </div>
        </div>

        <StepIndicator />

        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl overflow-hidden min-h-[500px] relative transition-colors duration-300">
            
            {isLoadingAI && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-brand-600 font-medium animate-pulse">AI Magic is working...</p>
                </div>
            )}

            {/* STEP 1: CONNECT */}
            {currentStep === 'CONNECT' && (
                <div className="p-8 text-center relative">
                    {/* Auth Overlay Modal */}
                    {authStep !== 'idle' && (
                        <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-8 animate-fade-in-up">
                            
                            {authStep === 'loading-sdk' && (
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="text-lg font-bold text-gray-900">Chuyển hướng đến Facebook...</h3>
                                    <p className="text-gray-500">Vui lòng đăng nhập trong cửa sổ popup.</p>
                                </div>
                            )}

                            {authStep === 'scanning' && (
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <h3 className="text-lg font-bold text-gray-900">Đã kết nối!</h3>
                                    <p className="text-gray-500">Đang quét danh sách trang từ tài khoản của bạn...</p>
                                </div>
                            )}

                            {authStep === 'success' && (
                                <div className="max-w-md w-full">
                                    <div className="flex items-center gap-3 mb-6 justify-center">
                                         {userProfile?.avatar ? (
                                             <img src={userProfile.avatar} alt="User" className="w-12 h-12 rounded-full border-2 border-green-500" />
                                         ) : (
                                             <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                                         )}
                                         <div className="text-left">
                                             <div className="text-sm text-gray-500">Xin chào,</div>
                                             <div className="font-bold text-gray-900">{userProfile?.name}</div>
                                         </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Chọn trang để quản lý</h3>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {scannedPages.length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                <p className="text-gray-500 mb-2">Không tìm thấy trang nào.</p>
                                                <p className="text-xs text-gray-400">Hãy chắc chắn bạn đã cấp quyền "Pages" khi đăng nhập.</p>
                                                <button onClick={handleConnectFacebook} className="mt-4 text-blue-600 hover:underline text-sm">Thử lại</button>
                                            </div>
                                        ) : (
                                            scannedPages.map((page) => (
                                                <button 
                                                    key={page.id}
                                                    onClick={() => selectPage(page)}
                                                    className="w-full p-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {page.avatar ? (
                                                            <img src={page.avatar} alt={page.name} className="w-10 h-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                                {page.name[0]}
                                                            </div>
                                                        )}
                                                        <div className="text-left">
                                                            <div className="font-medium text-gray-900">{page.name}</div>
                                                            <div className="text-xs text-gray-400">{page.category || 'Doanh nghiệp'}</div>
                                                        </div>
                                                    </div>
                                                    <svg className="text-gray-300 group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {authStep === 'permission-request' && selectedPageData && (
                                <div className="max-w-sm w-full bg-white rounded-2xl p-6 shadow-2xl border border-gray-200">
                                    <div className="text-center mb-6">
                                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Xác thực quyền đăng bài</h3>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Hệ thống cần xác nhận quyền <strong>quản lý nội dung</strong> trên trang <strong>{selectedPageData.name}</strong>.
                                        </p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded-lg mb-6">
                                        <p className="text-xs text-gray-500 italic">
                                            Bạn sẽ được chuyển hướng về Facebook để xác nhận quyền này một lần nữa.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setAuthStep('success')}
                                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                                        >
                                            Quay lại
                                        </button>
                                        <button 
                                            onClick={handleGrantPublishPermission}
                                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 shadow-md"
                                        >
                                            Xác nhận ngay
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <h2 className="text-xl font-bold mb-2 text-gray-900">Kết nối nền tảng</h2>
                    <p className="text-gray-500 mb-8">Chọn mạng xã hội để bắt đầu chiến dịch tự động.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {SOCIAL_PLATFORMS.map((platform) => (
                            <button 
                                key={platform.id}
                                onClick={platform.id === 'facebook' ? handleConnectFacebook : undefined}
                                className={`group relative flex items-center gap-4 p-6 rounded-xl border transition-all bg-white text-left ${
                                    platform.id === 'facebook' 
                                    ? 'border-blue-200 hover:border-blue-500 hover:shadow-lg cursor-pointer' 
                                    : 'border-gray-200 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full ${platform.bgClass} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                                    {platform.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{platform.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {platform.id === 'facebook' ? 'Auto-Connect & Publish' : 'Coming Soon'}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {!sdkLoaded && (
                        <div className="mt-4 text-xs text-red-500">
                            ⚠️ Facebook SDK chưa tải xong. Vui lòng kiểm tra kết nối mạng hoặc tắt chặn quảng cáo.
                        </div>
                    )}
                </div>
            )}

            {/* STEP 2: SETUP */}
            {currentStep === 'SETUP' && (
                <div className="p-8">
                     <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            {userProfile?.avatar ? (
                                <img src={userProfile.avatar} alt="user" className="w-12 h-12 rounded-full border border-gray-200" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                    {userProfile?.name?.[0] || 'G'}
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Thiết lập chiến dịch</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    Đăng lên: <span className="font-semibold text-brand-600">{selectedPageData?.name}</span> trên Facebook
                                </p>
                            </div>
                        </div>
                        <button onClick={autoFillAll} className="px-4 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-lg text-sm font-medium shadow-md hover:opacity-90 transition-opacity flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                            Tự động điền (AI)
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên chiến dịch</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Ví dụ: Khuyến mãi Hè 2024 (AI sẽ tự phát hiện ngôn ngữ)"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                Mô tả chung
                                <button onClick={() => suggestWithAI('description')} className="text-xs text-brand-500 hover:underline">✨ Gợi ý</button>
                            </label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Chiến dịch này nói về điều gì?"
                                rows={3}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                            />
                        </div>
                        
                        {/* Scheduling Section */}
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                                <input 
                                    type="date" 
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ đăng bài</label>
                                <input 
                                    type="time" 
                                    value={formData.scheduledTime}
                                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                Khách hàng mục tiêu
                                <button onClick={() => suggestWithAI('audience')} className="text-xs text-brand-500 hover:underline">✨ Gợi ý</button>
                            </label>
                            <input 
                                type="text"
                                value={formData.audience}
                                onChange={(e) => setFormData({...formData, audience: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                Insight / Mục tiêu
                                <button onClick={() => suggestWithAI('insight')} className="text-xs text-brand-500 hover:underline">✨ Gợi ý</button>
                            </label>
                            <input 
                                type="text"
                                value={formData.insight}
                                onChange={(e) => setFormData({...formData, insight: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                            />
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Số bài đăng mỗi ngày</label>
                             <select 
                                value={formData.postsPerDay}
                                onChange={(e) => setFormData({...formData, postsPerDay: parseInt(e.target.value)})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                             >
                                 {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
                             </select>
                        </div>

                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Phong cách viết</label>
                             <select 
                                value={formData.style}
                                onChange={(e) => setFormData({...formData, style: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                             >
                                 {['Storytelling', 'SEO Focused', 'Professional/Corporate', 'Humorous', 'Educational', 'Sales/Direct Response'].map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                        </div>

                        <div className="col-span-2 flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <input 
                                type="checkbox"
                                checked={formData.generateImage}
                                onChange={(e) => setFormData({...formData, generateImage: e.target.checked})}
                                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm text-gray-700">Tự động tạo ảnh minh họa bằng AI</span>
                        </div>
                     </div>

                     <div className="mt-8 flex justify-between">
                         <button onClick={handleBack} className="px-6 py-2 text-gray-500 hover:text-gray-900">Quay lại</button>
                         <button 
                            onClick={generateHeadlines}
                            disabled={!formData.name}
                            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             Tiếp theo: Tạo chiến lược
                         </button>
                     </div>
                </div>
            )}

            {/* STEP 3: KEYWORDS */}
            {currentStep === 'KEYWORDS' && (
                <div className="p-8">
                     <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Chọn chủ đề chính</h2>
                        <p className="text-gray-500">Chọn một tiêu đề hấp dẫn nhất để bắt đầu chiến dịch.</p>
                     </div>

                     <div className="space-y-3 max-w-2xl mx-auto">
                         {generatedHeadlines.map((headline, idx) => (
                             <button
                                key={idx}
                                onClick={() => setSelectedHeadline(headline)}
                                className={`w-full p-4 rounded-xl border text-left transition-all ${
                                    selectedHeadline === headline 
                                    ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500' 
                                    : 'bg-gray-50 border-gray-200 hover:border-brand-300'
                                }`}
                             >
                                 <span className="font-medium text-gray-900">{headline}</span>
                             </button>
                         ))}
                     </div>

                     <div className="mt-8 flex justify-between">
                         <button onClick={handleBack} className="px-6 py-2 text-gray-500 hover:text-gray-900">Quay lại</button>
                         <button 
                            onClick={generateFinalPost}
                            disabled={!selectedHeadline}
                            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             Tạo bản xem trước
                         </button>
                     </div>
                </div>
            )}

            {/* STEP 4: PREVIEW */}
            {currentStep === 'PREVIEW' && previewContent && (
                 <div className="p-8 flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">Xem trước bài đăng</h2>
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-w-[500px] mx-auto md:mx-0">
                              {/* Mock Social Header */}
                              <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                      {selectedPageData?.avatar ? (
                                          <img src={selectedPageData.avatar} alt="u" className="w-full h-full object-cover" />
                                      ) : (
                                          <span className="font-bold text-gray-500">{selectedPageData?.name?.[0]}</span>
                                      )}
                                  </div>
                                  <div>
                                      <div className="font-bold text-sm text-gray-900">{selectedPageData?.name || 'Brand Page'}</div>
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                          Vừa xong • <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Post Content with HTML Parsing */}
                              <div className="p-4 text-[15px] text-gray-900 leading-relaxed font-normal">
                                  {renderPostContent(previewContent.text)}
                              </div>

                              {/* Post Image */}
                              {previewContent.imageUrl && (
                                  <div className="w-full bg-gray-100">
                                      <img src={previewContent.imageUrl} alt="Generated" className="w-full h-auto object-cover" />
                                  </div>
                              )}

                              {/* Mock Social Stats */}
                              <div className="px-4 py-2 flex justify-between text-gray-500 text-xs border-b border-gray-100">
                                  <div className="flex items-center gap-1">
                                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">👍</div>
                                      <span>1</span>
                                  </div>
                                  <div>
                                      <span>1 bình luận</span>
                                  </div>
                              </div>

                              {/* Mock Social Actions */}
                              <div className="px-2 py-1 flex justify-between text-gray-500">
                                  <button className="flex-1 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 font-medium text-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                      Thích
                                  </button>
                                  <button className="flex-1 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 font-medium text-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                      Bình luận
                                  </button>
                                  <button className="flex-1 py-2 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 font-medium text-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                                      Chia sẻ
                                  </button>
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                          <div>
                              <h3 className="font-bold text-lg text-gray-900 mb-2">Tổng quan chiến dịch</h3>
                              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                  <li>• <strong>Nền tảng:</strong> Facebook</li>
                                  <li>• <strong>Trang:</strong> {selectedPageData?.name}</li>
                                  <li>• <strong>Tần suất:</strong> {formData.postsPerDay} bài/ngày</li>
                                  <li>• <strong>Thời gian:</strong> {formData.scheduledTime} hàng ngày</li>
                                  <li>• <strong>Bắt đầu:</strong> {formData.startDate}</li>
                                  <li>• <strong>Phong cách:</strong> {formData.style}</li>
                              </ul>
                              <div className="bg-brand-50 p-4 rounded-xl border border-brand-200">
                                  <p className="text-sm text-brand-800">
                                      Hệ thống tự động sẽ bắt đầu ngay sau khi xác nhận. AI sẽ tạo nội dung mới mỗi ngày lúc <strong>{formData.scheduledTime}</strong> dựa trên cài đặt của bạn.
                                  </p>
                              </div>
                          </div>

                          <div className="flex justify-between mt-8">
                                <button onClick={handleBack} className="px-6 py-2 text-gray-500 hover:text-gray-900">Quay lại</button>
                                <button 
                                    onClick={confirmCampaign}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-lg transition-colors"
                                >
                                    Kích hoạt chiến dịch
                                </button>
                          </div>
                      </div>
                 </div>
            )}

            {/* STEP 5: DASHBOARD & PAGE FEED */}
            {currentStep === 'DASHBOARD' && (
                <div className="p-8">
                    {dashboardView === 'list' ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Chiến dịch đang chạy</h2>
                                <button onClick={() => setCurrentStep('CONNECT')} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition-colors">
                                    + Tạo chiến dịch mới
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {campaigns.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <div className="text-gray-400 mb-2">Chưa có chiến dịch nào đang hoạt động.</div>
                                        <button onClick={() => setCurrentStep('CONNECT')} className="text-brand-600 font-medium hover:underline">Bắt đầu ngay</button>
                                    </div>
                                ) : (
                                    campaigns.map((campaign) => (
                                        <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-12 rounded-full ${campaign.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-lg">{campaign.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        {campaign.platform} • {campaign.pageName}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6">
                                                <div className="text-center hidden md:block">
                                                    <div className="text-xs text-gray-500 uppercase font-semibold">Đã đăng</div>
                                                    <div className="font-mono text-lg text-gray-900">{campaign.postsCount}</div>
                                                </div>
                                                <div className="text-center hidden md:block">
                                                    <div className="text-xs text-gray-500 uppercase font-semibold">Tiếp theo</div>
                                                    <div className="text-sm text-brand-500 font-medium">{campaign.nextPost}</div>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => openPageFeed(campaign)}
                                                        className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                                        Quản lý Trang
                                                    </button>

                                                    <button 
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                                                            campaign.status === 'active' 
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                        }`}
                                                        onClick={() => setCampaigns(campaigns.map(c => c.id === campaign.id ? {...c, status: c.status === 'active' ? 'paused' : 'active', nextPost: c.status === 'active' ? 'Paused' : 'Tomorrow, ' + c.scheduledTime} : c))}
                                                    >
                                                        {campaign.status === 'active' ? 'Active' : 'Paused'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        /* PAGE FEED VIEW */
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                                <button onClick={() => setDashboardView('list')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl overflow-hidden">
                                         {selectedCampaignForFeed?.pageName?.[0]}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-900">{selectedCampaignForFeed?.pageName}</h2>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Live Feed • Auto-Pilot Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 bg-gray-100 p-4 rounded-xl overflow-y-auto space-y-6">
                                {feedPosts.map((post) => (
                                    <div key={post.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-w-2xl mx-auto">
                                        {/* Post Header */}
                                        <div className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                                {selectedCampaignForFeed?.pageName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900">{selectedCampaignForFeed?.pageName}</div>
                                                <div className="text-xs text-gray-500">{post.date} • <span className="uppercase text-[10px] bg-gray-100 px-1 rounded">{post.status}</span></div>
                                            </div>
                                        </div>

                                        {/* Post Content */}
                                        <div className="px-4 pb-2 text-[15px] text-gray-900">
                                            {renderPostContent(post.content)}
                                        </div>
                                        {post.image && (
                                            <img src={post.image} alt="Post" className="w-full h-auto object-cover max-h-[500px]" />
                                        )}

                                        {/* Stats */}
                                        <div className="px-4 py-2 flex justify-between text-gray-500 text-xs border-b border-gray-100 mt-2">
                                            <span>👍 ❤️ 😆 {post.likes}</span>
                                            <span>{post.comments.reduce((acc, curr) => acc + 1 + curr.replies.length, 0)} bình luận</span>
                                        </div>

                                        {/* Comment Section */}
                                        <div className="p-4 bg-gray-50">
                                            <div className="space-y-4">
                                                {post.comments.map((comment) => (
                                                    <div key={comment.id} className="flex gap-2">
                                                        <img src={comment.avatar} alt={comment.user} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="bg-gray-200 px-3 py-2 rounded-2xl inline-block">
                                                                <div className="font-bold text-xs text-gray-900">{comment.user}</div>
                                                                <div className="text-sm text-gray-800">{comment.text}</div>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-gray-500 font-medium">
                                                                <button className="hover:underline">Thích</button>
                                                                <button className="hover:underline">Phản hồi</button>
                                                                <span>{comment.timestamp}</span>
                                                            </div>

                                                            {/* Replies */}
                                                            {comment.replies.length > 0 && (
                                                                <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                                                                    {comment.replies.map(reply => (
                                                                        <div key={reply.id} className="flex gap-2">
                                                                             {reply.avatar ? (
                                                                                 <img src={reply.avatar} alt={reply.user} className="w-6 h-6 rounded-full object-cover" />
                                                                             ) : (
                                                                                 <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{reply.user[0]}</div>
                                                                             )}
                                                                             <div>
                                                                                <div className="bg-gray-200 px-3 py-2 rounded-2xl inline-block">
                                                                                    <div className="font-bold text-xs text-gray-900">{reply.user}</div>
                                                                                    <div className="text-sm text-gray-800">{reply.text}</div>
                                                                                </div>
                                                                             </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Reply Input */}
                                                            <div className="mt-2 flex gap-2 items-center">
                                                                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                                                                     {userProfile?.avatar ? (
                                                                         <img src={userProfile.avatar} alt="u" className="w-full h-full object-cover" />
                                                                     ) : (
                                                                        <span>{userProfile?.name?.[0] || 'A'}</span>
                                                                     )}
                                                                </div>
                                                                <div className="flex-1 relative">
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder={`Phản hồi ${comment.user}...`}
                                                                        value={replyInputs[comment.id] || ''}
                                                                        onChange={(e) => setReplyInputs({...replyInputs, [comment.id]: e.target.value})}
                                                                        onKeyDown={(e) => e.key === 'Enter' && handleReply(post.id, comment.id)}
                                                                        className="w-full bg-white border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                                                    />
                                                                    <button 
                                                                        onClick={() => handleReply(post.id, comment.id)}
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                                                        disabled={!replyInputs[comment.id]}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
