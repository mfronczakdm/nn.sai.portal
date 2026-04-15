import React from 'react';
import { render, screen } from '@testing-library/react';

import { createComponentProps } from '@/__tests__/test-utils/testHelpers';
import { mockPageEditing } from '@/__tests__/test-utils/mockPage';

import type {
  HtmlSnippetBlockFields,
  HtmlSnippetBlockProps,
} from '@/components/html-snippet-block/html-snippet-block.props';

function htmlSnippetBlockProps(partial: Partial<HtmlSnippetBlockProps>): HtmlSnippetBlockProps {
  return {
    ...createComponentProps({}),
    fields: {},
    ...partial,
  } as HtmlSnippetBlockProps;
}

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
    tag?: React.ElementType;
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

import { Default as HtmlSnippetBlock } from '@/components/html-snippet-block/HtmlSnippetBlock';

const baseFields = {
  title: { value: 'Orders', editable: false },
  subtitle: { value: 'Recent activity', editable: false },
  body: {
    value: '<p>Demo <strong>HTML</strong> body.</p>',
    editable: false,
  },
};

describe('HtmlSnippetBlock', () => {
  it('renders title, subtitle, and HTML body from flat fields', () => {
    render(<HtmlSnippetBlock {...htmlSnippetBlockProps({ fields: baseFields })} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Orders');
    expect(screen.getByText('Recent activity')).toBeInTheDocument();
    const body = document.querySelector('.html-snippet-block__body');
    expect(body?.innerHTML).toContain('Demo');
    expect(body?.innerHTML).toContain('<strong>HTML</strong>');
  });

  it('renders empty article when no field values and not editing', () => {
    const { container } = render(<HtmlSnippetBlock {...htmlSnippetBlockProps({ fields: {} })} />);

    const article = container.querySelector('[data-component="html-snippet-block"]');
    expect(article).toBeInTheDocument();
    expect(article?.querySelector('h1')).toBeNull();
  });
});

describe('HtmlSnippetBlock (editing)', () => {
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

  it('still renders shell when values are empty in editing mode', () => {
    render(
      <HtmlSnippetBlock
        {...htmlSnippetBlockProps({
          fields: {
            title: { value: '', editable: true },
            subtitle: { value: '', editable: true },
            body: { value: '', editable: true },
          } as HtmlSnippetBlockFields,
        })}
      />,
    );

    expect(document.querySelector('[data-component="html-snippet-block"]')).toBeInTheDocument();
  });
});
