import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as ArticleContent } from '../../components/article-content/ArticleContent';
import {
  fullArticleContentProps,
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
