'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { OnboardingWizard, UserPreferences } from '@/components/onboarding-wizard';
import { DiscoverFeed } from '@/components/discover-feed';
import { Loader2, Compass } from 'lucide-react';

export default function DiscoverPage() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      setLoading(false);
      setShowOnboarding(true); // Allow browsing even without auth, but with onboarding
      return;
    }

    if (authStatus === 'authenticated') {
      fetchPreferences();
    }
  }, [authStatus]);

  const fetchPreferences = async () => {
    try {
      // Local check first for speed
      const localPrefs = localStorage.getItem('user_prefs');
      if (localPrefs) {
        const parsed = JSON.parse(localPrefs);
        setPreferences(parsed);
        setLoading(false);
        return;
      }

      // TODO: Fetch from Supabase via API if needed
      // For now, if no local prefs, show onboarding
      setLoading(false);
      setShowOnboarding(true);
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setLoading(false);
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    setLoading(true);
    setPreferences(prefs);
    setShowOnboarding(false);
    
    // Save locally
    localStorage.setItem('user_prefs', JSON.stringify(prefs));

    // Save to server/Supabase
    try {
      await fetch('/api/discover', {
        method: 'PUT', // Using PUT for saving prefs
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      });
    } catch (err) {
      console.error('Failed to save preferences to server:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
        <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Curating your Intelligence Feed...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-50 selection:bg-purple-500/30">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <div className="flex flex-col items-center text-center space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-purple-400 backdrop-blur-sm">
            <Compass className="mr-2 h-3.5 w-3.5" />
            Personalized Discovery
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Find Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
              Contribution Match
            </span>
          </h1>
          <p className="max-w-[600px] text-lg text-slate-400">
            {showOnboarding 
              ? "Tell us what you code in, and we'll scan the global ecosystem for issues that fit your skills and schedule." 
              : "Hand-picked high-impact issues tailored perfectly for you."}
          </p>
        </div>

        {showOnboarding ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <OnboardingWizard onComplete={handleOnboardingComplete} />
          </div>
        ) : (
          preferences && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <DiscoverFeed preferences={preferences} onReset={() => setShowOnboarding(true)} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
