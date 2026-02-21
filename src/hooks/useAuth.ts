import { useState, useEffect } from 'react';
import { config } from '@/lib/config';
import { upsertUser } from '@/lib/supabase';

interface AuthState {
  loading: boolean;
  userId: number | null;
  error: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    userId: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function handshake() {
      // Check sessionStorage first (already authenticated this session)
      const stored = sessionStorage.getItem('eap_user_id');
      if (stored) {
        const uid = Number(stored);
        setState({ loading: false, userId: uid, error: null });
        return;
      }

      // Preview/dev mode: bypass auth when Supabase not configured
      if (config.isPreview) {
        const mockId = 12345;
        sessionStorage.setItem('eap_user_id', String(mockId));
        setState({ loading: false, userId: mockId, error: null });
        return;
      }

      // Check URL for ?token=UUID
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        window.location.href = '/token';
        return;
      }

      try {
        const res = await fetch(config.authApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error('Auth failed');

        const data = await res.json();
        const userId = Number(data.user_id);

        if (!userId || isNaN(userId)) throw new Error('Invalid user_id');

        // Store in sessionStorage
        sessionStorage.setItem('eap_user_id', String(userId));

        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.pathname + url.search);

        // Upsert user in Supabase
        await upsertUser(userId);

        if (!cancelled) {
          setState({ loading: false, userId, error: null });
        }
      } catch (err) {
        console.error('Auth handshake failed:', err);
        window.location.href = '/token';
      }
    }

    handshake();
    return () => { cancelled = true; };
  }, []);

  return state;
}
