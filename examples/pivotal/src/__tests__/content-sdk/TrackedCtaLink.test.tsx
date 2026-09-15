import { fireEvent, render } from '@testing-library/react';

import { TrackedCtaLink } from '@/components/content-sdk/TrackedCtaLink';

const mockTrackCdpLinkClickEvent = jest.fn().mockResolvedValue(undefined);
const mockUseSitecore = jest.fn();

jest.mock('@/lib/cdp-link-click-event', () => ({
  trackCdpLinkClickEvent: (...args: unknown[]) => mockTrackCdpLinkClickEvent(...args),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Link: ({ field, onClick, className }: { field: { value?: { href?: string; text?: string } }; onClick?: () => void; className?: string }) => (
    <a href={field?.value?.href} className={className} onClick={onClick}>
      {field?.value?.text}
    </a>
  ),
  useSitecore: () => mockUseSitecore(),
}));

describe('TrackedCtaLink', () => {
  const linkField = {
    value: {
      href: '/checking/open',
      text: 'Opening a free checking account',
      linktype: 'internal',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSitecore.mockReturnValue({
      page: {
        mode: {
          isEditing: false,
          isPreview: false,
        },
      },
    });
  });

  it('tracks a CDP event using the link text when clicked', () => {
    const { getByRole } = render(<TrackedCtaLink field={linkField} className="btn btn-primary" />);

    fireEvent.click(getByRole('link', { name: 'Opening a free checking account' }));

    expect(mockTrackCdpLinkClickEvent).toHaveBeenCalledWith('Opening a free checking account');
  });

  it('does not track events in editing mode', () => {
    mockUseSitecore.mockReturnValue({
      page: {
        mode: {
          isEditing: true,
          isPreview: false,
        },
      },
    });

    const { getByRole } = render(<TrackedCtaLink field={linkField} />);
    fireEvent.click(getByRole('link'));

    expect(mockTrackCdpLinkClickEvent).not.toHaveBeenCalled();
  });
});
