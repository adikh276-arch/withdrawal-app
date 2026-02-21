export const config = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string) || '',
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
  googleTranslateApiKey: (import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY as string) || '',
  authApiUrl: 'https://api.mantracare.com/user/user-info',
  get isConfigured() {
    return !!(this.supabaseUrl && this.supabaseAnonKey);
  },
  get isPreview() {
    return !this.isConfigured;
  },
};
