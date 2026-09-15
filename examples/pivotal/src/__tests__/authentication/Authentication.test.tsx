import React from 'react';
import { render, screen } from '@testing-library/react';

import { createComponentProps } from '@/__tests__/test-utils/testHelpers';

import type { AuthenticationFields, AuthenticationProps } from '@/components/authentication/authentication.props';

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSignIn = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ site: 'dfs', locale: 'en' }),
}));

jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: jest.fn(),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({
    field,
    tag: Tag = 'span',
  }: {
    field?: { value?: string };
    tag?: React.ElementType;
  }) => {
    if (!field?.value?.trim()) return null;
    return React.createElement(Tag, null, field.value);
  },
  Image: ({
    field,
    className,
  }: {
    field?: { value?: { src?: string; alt?: string } };
    className?: string;
  }) => {
    const src = field?.value?.src;
    if (!src) return null;
    // eslint-disable-next-line @next/next/no-img-element -- lightweight Sitecore Image mock
    return <img src={src} alt={field?.value?.alt ?? ''} className={className} />;
  },
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: { componentName: string }) => (
    <div data-testid="no-data">{componentName}</div>
  ),
}));

import { Default as Authentication } from '@/components/authentication/Authentication';

function authenticationProps(
  fields: Partial<AuthenticationFields>,
  params?: AuthenticationProps['params'],
): AuthenticationProps {
  return {
    ...createComponentProps({}),
    fields: {
      title: { value: 'Sign In' },
      subtitle: { value: 'Access your portal account' },
      loginButtonText: { value: '' },
      logoutButtonText: { value: 'Sign Out' },
      userNameLabel: { value: 'Email' },
      passwordLabel: { value: 'Password' },
      loginFailedMessage: { value: 'Invalid email or password' },
      ...fields,
    },
    params: params ?? {},
  } as AuthenticationProps;
}

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login button fallback when loginButtonText is empty', () => {
    render(<Authentication {...authenticationProps({ loginButtonText: { value: '' } })} />);

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders authored login button text when provided', () => {
    render(<Authentication {...authenticationProps({ loginButtonText: { value: 'OK' } })} />);

    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  it('constrains logo image within the header area', () => {
    render(
      <Authentication
        {...authenticationProps({
          logo: {
            value: {
              src: '/dfs-logo.svg',
              alt: 'Diversified',
              width: 400,
              height: 120,
            },
          },
        })}
      />,
    );

    const logo = screen.getByRole('img', { name: 'Diversified' });
    expect(logo).toHaveClass('max-h-12', 'object-contain');
  });
});
