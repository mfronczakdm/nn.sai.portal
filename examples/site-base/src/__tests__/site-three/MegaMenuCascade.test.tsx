/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  MegaMenuCascadeProvider,
  MegaMenuCascadeL1Scope,
  useMegaMenuCascade,
} from '@/components/site-three/MegaMenuCascade';
import { MobileMenuWrapper } from '@/components/site-three/MobileMenuWrapper';

jest.mock('lucide-react', () => ({
  ChevronRight: () => <span data-testid="chevron-right" />,
  X: () => <span data-testid="close-icon" />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>{children}</a>
  ),
}));

function CascadeRegistrar({
  id,
  title,
  primaryLinks,
  secondaryGroups,
}: {
  id: string;
  title: string;
  primaryLinks: Array<{ id: string; text: string; href: string }>;
  secondaryGroups?: Array<{ title: string; links: Array<{ id: string; text: string; href: string }> }>;
}) {
  const cascade = useMegaMenuCascade();

  React.useEffect(() => {
    if (!cascade?.enabled) return;
    cascade.setL1PrimaryLinks(id, primaryLinks);
    secondaryGroups?.forEach((group) => cascade.addL1SecondaryGroup(id, group));
  }, [cascade, id, primaryLinks, secondaryGroups]);

  return (
    <MegaMenuCascadeL1Scope id={id} title={title}>
      <div data-testid={`scope-${id}`} />
    </MegaMenuCascadeL1Scope>
  );
}

function CascadeMenuFixture() {
  return (
    <MobileMenuWrapper alwaysVisible label="MENU" darkPanel>
      <MegaMenuCascadeProvider enabled>
        <CascadeRegistrar
          id="about-us"
          title="About Us"
          primaryLinks={[
            { id: 'overview', text: 'Amkor Overview', href: '/about-us/amkor-overview' },
            { id: 'careers', text: 'Careers', href: '/about-us/careers' },
            { id: 'contact', text: 'Contact Us', href: '/about-us/contact-us' },
          ]}
          secondaryGroups={[
            {
              title: 'Careers',
              links: [
                { id: 'china', text: 'China', href: '/about-us/careers/china' },
                { id: 'france', text: 'France', href: '/about-us/careers/france' },
              ],
            },
          ]}
        />
        <CascadeRegistrar
          id="packaging"
          title="Packaging"
          primaryLinks={[
            { id: 'laminate', text: 'Laminate', href: '/packaging/laminate' },
          ]}
        />
      </MegaMenuCascadeProvider>
    </MobileMenuWrapper>
  );
}

describe('MegaMenuCascade', () => {
  it('keeps the cascade panel closed by default', () => {
    render(<CascadeMenuFixture />);

    expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Primary navigation')).not.toBeInTheDocument();
  });

  it('shows L1 items and opens L2 column on L1 click', () => {
    render(<CascadeMenuFixture />);

    fireEvent.click(screen.getByLabelText('Toggle menu'));

    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Packaging')).toBeInTheDocument();
    expect(screen.queryByText('Amkor Overview')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('About Us'));

    expect(screen.getByText('Amkor Overview')).toBeInTheDocument();
    expect(screen.getByText('Careers')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('opens L3 column when L2 item has a secondary group', () => {
    render(<CascadeMenuFixture />);

    fireEvent.click(screen.getByLabelText('Toggle menu'));
    fireEvent.click(screen.getByText('About Us'));
    fireEvent.click(screen.getByRole('button', { name: 'Careers' }));

    expect(screen.getByText('China')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('closes the menu from the close button', () => {
    render(<CascadeMenuFixture />);

    fireEvent.click(screen.getByLabelText('Toggle menu'));
    expect(screen.getByText('About Us')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close menu'));
    expect(screen.queryByText('About Us')).not.toBeInTheDocument();
  });

  it('registers primary links when LinkList mounts before L1 scope effect', () => {
    function LinkListBeforeScopeRegistrar({
      l1Id,
      links,
    }: {
      l1Id: string;
      links: Array<{ id: string; text: string; href: string }>;
    }) {
      const cascade = useMegaMenuCascade();

      React.useEffect(() => {
        if (!cascade?.enabled) return;
        cascade.setL1PrimaryLinks(l1Id, links);
      }, [cascade, l1Id, links]);

      return null;
    }

    render(
      <MobileMenuWrapper alwaysVisible label="MENU" darkPanel>
        <MegaMenuCascadeProvider enabled>
          <MegaMenuCascadeL1Scope id="services" title="Services">
            <LinkListBeforeScopeRegistrar
              l1Id="services"
              links={[
                { id: 'design', text: 'Design Services', href: '/services/design-services' },
                { id: 'pkg', text: 'Package Characterization', href: '/services/package-characterization' },
              ]}
            />
          </MegaMenuCascadeL1Scope>
        </MegaMenuCascadeProvider>
      </MobileMenuWrapper>
    );

    fireEvent.click(screen.getByLabelText('Toggle menu'));
    fireEvent.click(screen.getByText('Services'));

    expect(screen.getByText('Design Services')).toBeInTheDocument();
    expect(screen.getByText('Package Characterization')).toBeInTheDocument();
  });

  it('registers L1 items when menu opens in editing mode', () => {
    render(
      <div className="editing-mode">
        <MobileMenuWrapper alwaysVisible label="MENU" darkPanel>
          <MegaMenuCascadeProvider enabled>
            <MegaMenuCascadeL1Scope id="about-us" title="About Us" isPageEditing>
              <div data-testid="scope-about-us" />
            </MegaMenuCascadeL1Scope>
            <MegaMenuCascadeL1Scope id="packaging" title="Packaging" isPageEditing>
              <div data-testid="scope-packaging" />
            </MegaMenuCascadeL1Scope>
          </MegaMenuCascadeProvider>
        </MobileMenuWrapper>
      </div>
    );

    expect(screen.queryByText('About Us')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Toggle menu'));

    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Packaging')).toBeInTheDocument();
  });
});
