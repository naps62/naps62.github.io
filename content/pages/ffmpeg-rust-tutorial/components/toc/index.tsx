import React from 'react';
import { Styled } from 'theme-ui';
import lodashFindIndex from 'lodash.findindex';
import lodashFind from 'lodash.find';

import styles from './style.module.css';

const AllSections = [
  { slug: 'intro', title: 'Intro' },
  { slug: 'what-is-video', title: 'What is Video?' },
  { slug: 'what-is-audio', title: 'And what is audio?' },
  { slug: 'cli', title: 'FFmpeg CLI' },
];

const Link = (slug, current: string, prefix: string) => {
  const currentSection = lodashFind(
    AllSections,
    (section) => section.slug === slug
  );

  const activeSection = lodashFind(
    AllSections,
    (section) => section.slug === current
  );

  if (activeSection.slug === currentSection.slug) {
    return <span>{currentSection.title}</span>;
  } else {
    return (
      <Styled.a href={`/ffmpeg-rust-tutorial/${currentSection.slug}`}>
        {prefix}
        {currentSection.title}
      </Styled.a>
    );
  }
};

const ToC = ({ current }) => (
  <Styled.ol className={styles.toc}>
    <Styled.li>
      {Link('intro', current)}
      <Styled.ol>
        <Styled.li>{Link('what-is-video', current)}</Styled.li>
        <Styled.li>{Link('what-is-audio', current)}</Styled.li>
      </Styled.ol>
    </Styled.li>
    <Styled.li>{Link('cli', current)}</Styled.li>
  </Styled.ol>
);

const BottomNav = ({ current }) => {
  const currentIndex = lodashFindIndex(
    AllSections,
    (section) => section.slug === current
  );

  return (
    <div className={styles.bottomNav}>
      <div>
        {currentIndex > 0 &&
          Link(AllSections[currentIndex - 1].slug, current, 'Previous: ')}
      </div>
      <div>
        {currentIndex < AllSections.length - 1 &&
          Link(AllSections[currentIndex + 1].slug, current, 'Next: ')}
      </div>
    </div>
  );
};

export { ToC, BottomNav };
