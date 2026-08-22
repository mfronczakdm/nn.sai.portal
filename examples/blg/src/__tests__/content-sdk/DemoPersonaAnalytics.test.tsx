import { render, waitFor } from '@testing-library/react';

import DemoPersonaAnalytics from '@/components/content-sdk/DemoPersonaAnalytics';
import { DEMO_TAXONOMY_STORAGE_KEY } from '@/lib/demo-taxonomy';

const mockIdentifyDemoPersona = jest.fn().mockResolvedValue(undefined);
const mockIsDemoAnalyticsEnabled = jest.fn();

jest.mock('@/lib/demo-analytics-identity', () => ({
  identifyDemoPersona: (...args: unknown[]) => mockIdentifyDemoPersona(...args),
  isDemoAnalyticsEnabled: () => mockIsDemoAnalyticsEnabled(),
}));

describe('DemoPersonaAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockIsDemoAnalyticsEnabled.mockReturnValue(true);
  });

  it('identifies a stored persona on mount without resetting the session', async () => {
    window.localStorage.setItem(DEMO_TAXONOMY_STORAGE_KEY, 'Internal Agent licensed in FL');

    render(<DemoPersonaAnalytics />);

    await waitFor(() => {
      expect(mockIdentifyDemoPersona).toHaveBeenCalledWith('Internal Agent licensed in FL', {
        resetSession: false,
      });
    });
  });

  it('does nothing when analytics is disabled', async () => {
    mockIsDemoAnalyticsEnabled.mockReturnValue(false);
    window.localStorage.setItem(DEMO_TAXONOMY_STORAGE_KEY, 'Claims Specialist licensed in NC');

    render(<DemoPersonaAnalytics />);

    await waitFor(() => {
      expect(mockIdentifyDemoPersona).not.toHaveBeenCalled();
    });
  });
});
