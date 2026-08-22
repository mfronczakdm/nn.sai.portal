'use client';

import { useEffect, JSX } from 'react';

import { readStoredDemoTaxonomy } from '@/lib/demo-taxonomy';
import {
  identifyDemoPersona,
  isDemoAnalyticsEnabled,
} from '@/lib/demo-analytics-identity';

/**
 * Re-identifies a stored demo persona after page reload without resetting profileId.
 */
const DemoPersonaAnalytics = (): JSX.Element => {
  useEffect(() => {
    if (!isDemoAnalyticsEnabled()) return;

    const storedPersona = readStoredDemoTaxonomy();
    if (!storedPersona) return;

    void identifyDemoPersona(storedPersona, { resetSession: false });
  }, []);

  return <></>;
};

export default DemoPersonaAnalytics;
