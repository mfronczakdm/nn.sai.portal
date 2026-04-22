import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as ArticleContent } from '../../components/article-content/ArticleContent';
import { fullArticleContentProps, splitTitleProps, titleOnlyProps, emptyProps } from './ArticleContent.mockProps';

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
  it('renders short title, primary headline, subtitle, and summary', () => {
    render(<ArticleContent {...fullArticleContentProps} />);

    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building resilient health platforms');
    expect(
      screen.getByText(/How modern integration patterns reduce risk/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Teams often underestimate/i)).toBeInTheDocument();
  });

  it('renders Title as h2 when HeaderTitle differs from Title', () => {
    render(<ArticleContent {...splitTitleProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building resilient health platforms');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Technical deep dive');
  });

  it('uses Title as h1 when HeaderTitle is absent', () => {
    render(<ArticleContent {...titleOnlyProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Article without header title field');
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
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
