'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';

interface AnalyticsContextType {
  captureEvent: (eventName: string, properties?: Record<string, any>) => void;
  isPostHogReady: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  captureEvent: () => {},
  isPostHogReady: false,
});

export const useAnalytics = () => useContext(AnalyticsContext);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // The PostHog project key is public by design (it ships in browser code), so it has a fallback here.
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_A7AQUNuHDWgP92hxthbkLJE53fGP2VnVBM3EbGgW9tKy';
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (key && !key.includes('phc_...')) {
      try {
        posthog.init(key, {
          api_host: host,
          person_profiles: 'identified_only',
          capture_pageview: 'history_change', // page views, including client-side navigation
          capture_pageleave: true,
          loaded: () => {
            setIsReady(true);
          },
        });
      } catch (e) {
        console.warn('PostHog initialization error:', e);
      }
    } else {
      // In simulated mode, flag ready so app functions smoothly
      setIsReady(true);
    }
  }, []);

  const captureEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog.__loaded) {
      posthog.capture(eventName, properties);
    } else {
      // Simulated client-side log for developer console
      console.log(`[PostHog Client Telemetry] ${eventName}:`, properties);
    }
  };

  return (
    <PHProvider client={posthog}>
      <AnalyticsContext.Provider value={{ captureEvent, isPostHogReady: isReady }}>
        {children}
      </AnalyticsContext.Provider>
    </PHProvider>
  );
}
