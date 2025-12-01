
// STATEFUL MOCK SUPABASE CLIENT
// This mock simulates Supabase Auth behavior for local development without valid API keys.
// It maintains session state and notifies subscribers (useAuth hooks) when state changes.

class MockAuth {
  private session: any = null;
  private listeners: Function[] = [];

  constructor() {
    // Initialize with a default user if desired, or null to simulate logged out
    // Checking localStorage for persistence simulation
    try {
        const stored = localStorage.getItem('sb-mock-session');
        if (stored) {
            this.session = JSON.parse(stored);
        }
    } catch (e) {}
  }

  private notify(event: string, session: any) {
    this.listeners.forEach(l => l(event, session));
    if (session) {
        localStorage.setItem('sb-mock-session', JSON.stringify(session));
    } else {
        localStorage.removeItem('sb-mock-session');
    }
  }

  async getSession() {
    return { data: { session: this.session }, error: null };
  }

  async getUser() {
    return { data: { user: this.session?.user || null }, error: null };
  }

  onAuthStateChange(callback: Function) {
    this.listeners.push(callback);
    // Immediately notify of current state
    if (this.session) {
        callback('INITIAL_SESSION', this.session);
    }
    return { data: { subscription: { unsubscribe: () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    } } } };
  }

  async signInWithOAuth(params: any) {
    console.log('🔐 Mock SignIn with params:', params);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = {
      id: 'mock-user-123',
      email: 'demo@locaith.com',
      user_metadata: {
        full_name: 'Locaith Demo User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Locaith'
      },
      app_metadata: { provider: 'google' },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };

    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser
    };

    this.session = mockSession;
    this.notify('SIGNED_IN', this.session);

    return { data: { session: this.session }, error: null };
  }

  async signOut() {
    console.log('🔒 Mock SignOut');
    this.session = null;
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }
}

const mockAuth = new MockAuth();

// Create a flexible proxy for DB operations
const createMockChain = (returnData: any = [], singleData: any = null) => {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    gt: () => chain,
    lt: () => chain,
    gte: () => chain,
    lte: () => chain,
    like: () => chain,
    ilike: () => chain,
    is: () => chain,
    in: () => chain,
    contains: () => chain,
    order: () => chain,
    limit: () => chain,
    range: () => chain,
    
    single: async () => ({ data: singleData || {}, error: null }),
    maybeSingle: async () => ({ data: singleData || {}, error: null }),
    
    then: (resolve: Function) => resolve({ data: returnData, error: null })
  };
  
  // Handle mutations
  chain.insert = (data: any) => {
      console.log(`[MockDB] Insert:`, data);
      return { ...chain, data, error: null };
  };
  chain.update = (data: any) => {
      console.log(`[MockDB] Update:`, data);
      return { ...chain, data, error: null };
  };
  chain.delete = () => {
      console.log(`[MockDB] Delete`);
      return { ...chain, error: null };
  };
  
  return chain;
};

const mockSupabase = {
  auth: mockAuth,
  from: (table: string) => {
    console.log(`[MockDB] Access table: ${table}`);
    return createMockChain();
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/150' } }),
    })
  },
  functions: {
      invoke: async (funcName: string, options: any) => {
          console.log(`[MockFunctions] Invoke ${funcName}`, options);
          return { data: { success: true, message: "Function mocked" }, error: null };
      }
  }
};

// Decide whether to use Real or Mock Supabase
// If VITE_SUPABASE_URL is localhost or missing, use Mock
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const shouldUseMock = !supabaseUrl || supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');

import { createClient } from '@supabase/supabase-js';

export const supabase = shouldUseMock 
    ? (mockSupabase as any) 
    : createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

if (shouldUseMock) {
    // console.warn('⚠️ USING MOCK SUPABASE CLIENT (Local/Demo Mode)');
} else {
    console.log('✅ Connected to Real Supabase');
}
