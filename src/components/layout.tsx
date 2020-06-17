import React from 'react';
import { Global } from '@emotion/core';
import { Main, Styled, Box, css, jsx } from 'theme-ui';
import 'typeface-ibm-plex-sans';
import SEO from './seo';
import Header from './header';
import Footer from './footer';
import CodeStyles from '../styles/code';
import SkipNavLink from './skip-nav';

type LayoutProps = { children: React.ReactNode; className?: string };

const Container = (props) =>
  jsx(Box, {
    ...props,
    sx: {
      width: '100%',
      minWidth: 0,
      maxWidth: 1024,
      mx: 'auto',
      p: 4,
      variant: 'styles.Container',
    },
  });

const Layout = ({ children, className }: LayoutProps) => (
  <Styled.root data-testid="theme-root">
    <Global
      styles={css({
        '*': {
          boxSizing: `inherit`,
        },
        body: {
          margin: 0,
          padding: 0,
          boxSizing: `border-box`,
          textRendering: `optimizeLegibility`,
        },
        '::selection': {
          backgroundColor: `primary`,
          color: `white`,
        },
        a: {
          transition: `all 0.3s ease-in-out`,
          color: `text`,
        },
      })}
    />
    <SEO />
    <SkipNavLink>Skip to content</SkipNavLink>
    <Container>
      <Header />
      <Main id="skip-nav" css={css({ ...CodeStyles })} className={className}>
        {children}
      </Main>
      <Footer />
    </Container>
  </Styled.root>
);

export default Layout;
