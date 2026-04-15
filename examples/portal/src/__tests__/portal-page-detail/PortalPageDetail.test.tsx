import React from 'react';
import { render, screen } from '@testing-library/react';

import { createComponentProps } from '@/__tests__/test-utils/testHelpers';
import { mockPageEditing } from '@/__tests__/test-utils/mockPage';

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div data-testid="no-data-fallback">
      {componentName} requires a datasource item assigned. Please assign a datasource item to edit the
      content.
    </div>
  ),
}));

import { Default as PortalPageDetail } from '@/components/portal-page-detail/PortalPageDetail';

const baseFields = {
  data: {
    datasource: {
      title: { jsonValue: { value: 'Orders', editable: false } },
      subtitle: { jsonValue: { value: 'Recent activity', editable: false } },
      body: {
        jsonValue: {
          value: '<p>Demo <strong>HTML</strong> body.</p>',
          editable: false,
        },
      },
    },
  },
};

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: jest.fn(() => ({
    page: {
      mode: {
        isEditing: false,
        isNormal: true,
        isPreview: false,
        name: 'normal',
        designLibrary: { isVariantGeneration: false },
        isDesignLibrary: false,
      },
      layout: { sitecore: { context: {}, route: null } },
      locale: 'en',
    },
  })),
  Text: ({
    field,
    tag: Tag = 'span',
    className,
  }: {
    field?: { value?: string };
    tag?: keyof JSX.IntrinsicElements;
    className?: string;
  }) => {
    if (!field?.value?.trim()) return null;
    return React.createElement(Tag, { className }, field.value);
  },
  RichText: ({ field, className }: { field?: { value?: string }; className?: string }) => {
    if (!field?.value?.trim()) return null;
    return React.createElement('div', {
      className,
      dangerouslySetInnerHTML: { __html: field.value },
    });
  },
}));

describe('PortalPageDetail', () => {
  it('renders title, subtitle, and HTML body from datasource', () => {
    render(
      <PortalPageDetail
        {...createComponentProps({
          fields: baseFields,
        })}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Orders');
    expect(screen.getByText('Recent activity')).toBeInTheDocument();
    const body = document.querySelector('.portal-page-detail__body');
    expect(body?.innerHTML).toContain('Demo');
    expect(body?.innerHTML).toContain('<strong>HTML</strong>');
  });

  it('shows NoDataFallback when datasource is missing', () => {
    render(
      <PortalPageDetail
        {...createComponentProps({
          fields: { data: {} },
        })}
      />,
    );

    expect(screen.getByTestId('no-data-fallback')).toBeInTheDocument();
    expect(screen.getByText(/Portal Page Detail requires a datasource/i)).toBeInTheDocument();
  });
});

describe('PortalPageDetail (editing)', () => {
  const defaultPage = {
    page: {
      mode: {
        isEditing: false,
        isNormal: true,
        isPreview: false,
        name: 'normal' as const,
        designLibrary: { isVariantGeneration: false },
        isDesignLibrary: false,
      },
      layout: { sitecore: { context: {}, route: null } },
      locale: 'en',
    },
  };

  beforeEach(() => {
    const sdk = jest.requireMock('@sitecore-content-sdk/nextjs') as {
      useSitecore: jest.Mock;
    };
    sdk.useSitecore.mockReturnValue({ page: mockPageEditing });
  });

  afterEach(() => {
    const sdk = jest.requireMock('@sitecore-content-sdk/nextjs') as {
      useSitecore: jest.Mock;
    };
    sdk.useSitecore.mockReturnValue(defaultPage);
  });

  it('still renders field chrome when values are empty', () => {
    render(
      <PortalPageDetail
        {...createComponentProps({
          fields: {
            data: {
              datasource: {
                title: { jsonValue: { value: '', editable: true } },
                subtitle: { jsonValue: { value: '', editable: true } },
                body: { jsonValue: { value: '', editable: true } },
              },
            },
          },
        })}
      />,
    );

    expect(document.querySelector('[data-component="portal-page-detail"]')).toBeInTheDocument();
  });
});
