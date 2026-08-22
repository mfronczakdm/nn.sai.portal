import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Default as ArticleContent,
  ServicePageVariant,
  kmpage,
} from '../../components/article-content/ArticleContent';
import {
  fullArticleContentProps,
  servicePageVariantProps,
  kmpageProps,
  splitTitleProps,
  titleOnlyProps,
  pageTitleOnlyProps,
  pageViaExternalFieldsProps,
  pageViaNestedExternalFieldsProps,
  emptyProps,
} from './ArticleContent.mockProps';

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({
    field,
    tag: Tag = 'span',
    className,
    id,
  }: {
    field?: { value?: string };
    tag?: keyof JSX.IntrinsicElements;
    className?: string;
    id?: string;
  }) => {
    if (!field?.value && Tag !== 'h1') return null;
    return React.createElement(Tag, { className, id }, field?.value ?? '');
  },
  RichText: ({ field, className }: { field?: { value?: string }; className?: string }) => {
    if (!field?.value) return null;
    return React.createElement('div', {
      className,
      dangerouslySetInnerHTML: { __html: field.value },
    });
  },
}));

jest.mock('../../components/image/ImageWrapper.dev', () => ({
  Default: ({ image }: { image?: { value?: { src?: string; alt?: string } } }) => {
    if (!image?.value?.src) return null;
    return React.createElement('img', {
      src: image.value.src,
      alt: image.value.alt ?? '',
      'data-testid': 'kmpage-hero-image',
    });
  },
}));

describe('ArticleContent', () => {
  it('renders page short title, primary headline, subtitle, and summary', () => {
    render(<ArticleContent {...fullArticleContentProps} />);

    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building resilient health platforms');
    expect(
      screen.getByText(/How modern integration patterns reduce risk/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Teams often underestimate/i)).toBeInTheDocument();
  });

  it('renders pageTitle as h2 when pageHeaderTitle differs from pageTitle', () => {
    render(<ArticleContent {...splitTitleProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building resilient health platforms');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Technical deep dive');
  });

  it('uses pageTitle as h1 when pageHeaderTitle is absent', () => {
    render(<ArticleContent {...titleOnlyProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Article without page header title field');
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders pageTitle as h1 with pageSummary when no pageHeaderTitle', () => {
    const { container } = render(<ArticleContent {...pageTitleOnlyProps} />);

    expect(screen.getByText('Section label')).toBeInTheDocument();
    expect(screen.getByText(/Body intro without main header title/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Section label');
    expect(container.querySelector('section')).toHaveAttribute('aria-labelledby', 'article-content-primary-heading');
  });

  it('resolves copy from externalFields when datasource fields are empty', () => {
    render(<ArticleContent {...pageViaExternalFieldsProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title from page externalFields');
    expect(screen.getByText(/Summary from page externalFields/i)).toBeInTheDocument();
  });

  it('resolves copy from fields.data.externalFields jsonValue when no datasource', () => {
    render(<ArticleContent {...pageViaNestedExternalFieldsProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title from nested externalFields');
    expect(screen.getByText(/Summary from nested externalFields/i)).toBeInTheDocument();
  });

  it('returns null when no fields and not editing', () => {
    const { container } = render(<ArticleContent {...emptyProps} />);
    expect(container.firstChild).toBeNull();
  });

  it('exposes data-component for analytics and authoring', () => {
    const { container } = render(<ArticleContent {...fullArticleContentProps} />);
    expect(container.querySelector('[data-component="ArticleContent"]')).toBeInTheDocument();
  });
});

describe('ArticleContent ServicePageVariant', () => {
  it('renders header title, subtitle, and summary in a two-column layout', () => {
    const { container } = render(<ServicePageVariant {...servicePageVariantProps} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Modular Construction');
    expect(
      screen.getByText(/Build faster with more control over schedule, labor, and quality/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Move critical work offsite into a controlled environment/i)).toBeInTheDocument();
    expect(container.querySelector('[data-variant="ServicePageVariant"]')).toBeInTheDocument();
  });

  it('returns null when no service page fields and not editing', () => {
    const { container } = render(<ServicePageVariant {...emptyProps} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('ArticleContent kmpage', () => {
  // Export must stay lowercase to match Sitecore Variant Definition `kmpage`.
  // JSX requires PascalCase tags, so tests use createElement.
  it('renders image, titles, summary callout, and Detail body', () => {
    const { container } = render(React.createElement(kmpage, kmpageProps));

    expect(screen.getByTestId('kmpage-hero-image')).toHaveAttribute(
      'src',
      expect.stringContaining('89538338843c4f9ebab1c4128e14a6ff'),
    );
    expect(screen.getByText('Claims')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Claims Knowledge Base');
    expect(screen.getByText('Claim Intake & Standards')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(
      screen.getByText(/Shared internal standards for commercial lines claim intake/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Progressive Claims Knowledge Base for associates/i)).toBeInTheDocument();
    expect(container.querySelector('[data-variant="kmpage"]')).toBeInTheDocument();
  });

  it('returns null when no kmpage fields and not editing', () => {
    const { container } = render(React.createElement(kmpage, emptyProps));
    expect(container.firstChild).toBeNull();
  });
});
