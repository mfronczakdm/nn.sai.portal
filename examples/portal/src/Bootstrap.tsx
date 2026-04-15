'use client';

import { useEffect, JSX } from 'react';
import { initContentSdk } from '@sitecore-content-sdk/nextjs';
import { eventsPlugin } from '@sitecore-content-sdk/events';
import { analyticsBrowserAdapter, analyticsPlugin } from '@sitecore-content-sdk/analytics-core';
import config from 'sitecore.config';

const Bootstrap = ({ siteName }: { siteName: string }): JSX.Element | null => {
  useEffect(() => {
    // Initialize whenever Edge is configured. Sitecore EditingScripts and form-related
    // client code use the events SDK (e.g. triggerView / readyFormSubmit); skipping init
    // in development previously caused [IE-002] SDK not initialized after navigation
    // (e.g. post-login). Page-level VIEW events stay gated in CdpPageView (normal mode).
    if (config.api.edge?.clientContextId) {
      initContentSdk({
        config: {
          contextId: config.api.edge.clientContextId,
          edgeUrl: config.api.edge.edgeUrl,
          siteName: siteName || config.defaultSite,
        },
        plugins: [
          analyticsPlugin({
            options: {
              enableCookie: true,
              cookieDomain: window.location.hostname.replace(/^www\./, ''),
            },
            adapter: analyticsBrowserAdapter(),
          }),
          eventsPlugin(),
        ],
      });
    } else {
      console.error('Client Edge API settings missing from configuration');
    }
  }, [siteName]);

  return null;
};

export default Bootstrap;
