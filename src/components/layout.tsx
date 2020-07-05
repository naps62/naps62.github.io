import React from 'react';
import { Main, Styled, Container, css } from 'theme-ui';
import SEO from './seo';
import Header from './header';
import SkipNavLink from './skip-nav';

type LayoutProps = { children: React.ReactNode; className?: string };

const Layout = ({ children, className }: LayoutProps) => (
  <Styled.root data-testid="theme-root">
    <SEO />
    <SkipNavLink>Skip to content</SkipNavLink>
    <Container>
      <Header />
      <Main id="skip-nav" className={className}>
        {children}
      </Main>
    </Container>
  </Styled.root>
);

export default Layout;
