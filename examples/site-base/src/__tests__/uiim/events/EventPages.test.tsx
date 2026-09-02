/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Default as EventListing } from '@/components/uiim/events/EventListing';
import { Default as EventDetail } from '@/components/uiim/events/EventDetail';
import { useSitecore } from '@sitecore-content-sdk/nextjs';

jest.mock('change-case', () => ({
  kebabCase: (s: string) => String(s).replace(/\s+/g, '-').toLowerCase(),
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div>{componentName} requires a datasource item assigned.</div>
  ),
}));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right" />,
  ChevronLeft: () => <span data-testid="chevron-left" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
  Clock: () => <span data-testid="clock" />,
  MapPin: () => <span data-testid="map-pin" />,
  Search: () => <span data-testid="search" />,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    checked,
    onCheckedChange,
    id,
  }: {
    checked?: boolean;
    onCheckedChange?: () => void;
    id?: string;
  }) => <input id={id} type="checkbox" checked={Boolean(checked)} onChange={onCheckedChange} />,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag: Tag = 'span' }: any) => <Tag>{field?.value || ''}</Tag>,
  RichText: ({ field }: any) => <div>{field?.value}</div>,
  NextImage: ({ field }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={field?.value?.src || ''} alt={field?.value?.alt || ''} />
  ),
  useSitecore: jest.fn(() => ({ page: { mode: { isEditing: false } } })),
}));

const mockedUseSitecore = useSitecore as jest.Mock;

const params = { styles: '', RenderingIdentifier: 'events' };
const rendering = { componentName: 'EventListing' } as any;
const page = { mode: { isEditing: false } } as any;

const listingFields = {
  data: {
    datasource: {
      searchPlaceholder: { jsonValue: { value: 'Search' } },
      eventTypeLabel: { jsonValue: { value: 'Event Type' } },
      moreInfoLabel: { jsonValue: { value: 'More Info' } },
      clearCalendarLabel: { jsonValue: { value: 'CLEAR CALENDAR SELECTION' } },
      emptyResultsText: { jsonValue: { value: 'No events match your filters.' } },
      eventsRoot: {
        targetItem: {
          children: {
            results: [
              {
                id: '1',
                name: 'Outdoor Living Trends Talk',
                url: { path: '/Visit/Events/Outdoor Living Trends Talk' },
                pageTitle: { jsonValue: { value: 'Outdoor Living Trends Talk' } },
                eventStart: { jsonValue: { value: '20260915T083000' } },
                eventEnd: { jsonValue: { value: '20260915T093000' } },
                eventLocation: { jsonValue: { value: 'Building 1, Floor 8, Oasis Meeting Space' } },
                eventType: { jsonValue: { value: 'Trend Talk' } },
                eventTimezone: { jsonValue: { value: 'EST' } },
                image: { value: '<image src="https://example.com/talk.jpg" alt="Talk" />' },
              },
              {
                id: '2',
                name: 'Closing Toast',
                url: { path: '/Visit/Events/Closing Toast' },
                pageTitle: { jsonValue: { value: 'Celebrate Success: Closing Toast' } },
                eventStart: { jsonValue: { value: '20260918T090000' } },
                eventEnd: { jsonValue: { value: '20260918T170000' } },
                eventLocation: { jsonValue: { value: 'Building 3, Floor 1, Registration Area' } },
                eventType: { jsonValue: { value: 'Networking' } },
                eventTimezone: { jsonValue: { value: 'EST' } },
              },
            ],
          },
        },
      },
    },
  },
};

describe('EventListing', () => {
  beforeEach(() => {
    mockedUseSitecore.mockReturnValue({ page: { mode: { isEditing: false } } });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    }) as unknown as typeof fetch;
  });

  it('renders NoDataFallback without a datasource', () => {
    render(<EventListing params={params} page={page} rendering={rendering} />);
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders listing chrome in Pages editing when a datasource GUID is assigned but GraphQL is empty', () => {
    mockedUseSitecore.mockReturnValue({ page: { mode: { isEditing: true } } });
    render(
      <EventListing
        params={params}
        page={{ mode: { isEditing: true } } as any}
        rendering={{ ...rendering, dataSource: '{684FA81B-14A4-4383-B115-2A766CA44AFB}' }}
      />
    );
    expect(screen.queryByText(/requires a datasource item assigned/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  it('still shows NoDataFallback in editing when no datasource is assigned', () => {
    mockedUseSitecore.mockReturnValue({ page: { mode: { isEditing: true } } });
    render(
      <EventListing params={params} page={{ mode: { isEditing: true } } as any} rendering={rendering} />
    );
    expect(screen.getByText(/requires a datasource item assigned/i)).toBeInTheDocument();
  });

  it('renders Sitecore field chrome from flat ListingTitle fields in editing', () => {
    mockedUseSitecore.mockReturnValue({ page: { mode: { isEditing: true } } });
    render(
      <EventListing
        fields={{ ListingTitle: { value: 'All Events' } }}
        params={params}
        page={{ mode: { isEditing: true } } as any}
        rendering={rendering}
      />
    );
    expect(screen.getByText('All Events')).toBeInTheDocument();
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.queryByText(/requires a datasource item assigned/i)).not.toBeInTheDocument();
  });

  it('groups cards by date and links More Info to the event page', () => {
    render(<EventListing fields={listingFields} params={params} page={page} rendering={rendering} />);
    expect(screen.getByText('Tuesday, September 15, 2026 | 1 Event')).toBeInTheDocument();
    expect(screen.getByText('Outdoor Living Trends Talk')).toBeInTheDocument();
    expect(screen.getByText('Building 1, Floor 8, Oasis Meeting Space')).toBeInTheDocument();
    const moreInfo = screen.getAllByText('More Info')[0].closest('a');
    expect(moreInfo).toHaveAttribute('href', '/Visit/Events/Outdoor Living Trends Talk');
  });

  it('filters by keyword and event type', () => {
    render(<EventListing fields={listingFields} params={params} page={page} rendering={rendering} />);
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'closing' } });
    expect(screen.queryByText('Outdoor Living Trends Talk')).not.toBeInTheDocument();
    expect(screen.getByText('Celebrate Success: Closing Toast')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: '' } });
    fireEvent.click(screen.getByLabelText('Trend Talk'));
    expect(screen.getByText('Outdoor Living Trends Talk')).toBeInTheDocument();
    expect(screen.queryByText('Celebrate Success: Closing Toast')).not.toBeInTheDocument();
  });
});

describe('EventDetail', () => {
  const downloadIcs = jest.fn();

  beforeEach(() => {
    Object.defineProperty(window.URL, 'createObjectURL', {
      writable: true,
      value: () => 'blob:ics',
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      writable: true,
      value: jest.fn(),
    });
    downloadIcs.mockClear();
  });

  it('renders title, 50/50 details, and Add to Calendar', () => {
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    render(
      <EventDetail
        params={params}
        rendering={{ componentName: 'EventDetail' } as any}
        page={
          {
            mode: { isEditing: false },
            layout: {
              sitecore: {
                route: {
                  name: 'Outdoor Living Trends Talk',
                  itemPath: '/Visit/Events/Outdoor Living Trends Talk',
                  fields: {
                    pageTitle: { value: 'Outdoor Living Trends Talk' },
                    EventStart: { value: '20260915T083000' },
                    EventEnd: { value: '20260915T093000' },
                    EventLocation: { value: 'Building 1, Floor 8, Oasis Meeting Space' },
                    EventTimezone: { value: 'EST' },
                    BackLinkText: { value: 'All Events' },
                    AddToCalendarLabel: { value: 'Add to Calendar' },
                    DetailsHeading: { value: 'Details' },
                    Detail: {
                      value:
                        '<p>Learn the driving forces influencing the rising interest in outdoor furnishings.</p>',
                    },
                    image: { value: { src: 'https://example.com/patio.jpg', alt: 'Patio' } },
                  },
                },
              },
            },
          } as any
        }
      />
    );

    expect(screen.getByRole('heading', { name: 'Outdoor Living Trends Talk' })).toBeInTheDocument();
    expect(screen.getByText('All Events').closest('a')).toHaveAttribute('href', '/Visit/Events');
    expect(screen.getByText('Tuesday, September 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('08:30 AM - 09:30 AM EST')).toBeInTheDocument();
    expect(screen.getByText('Building 1, Floor 8, Oasis Meeting Space')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Details' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add to Calendar' }));
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });
});
