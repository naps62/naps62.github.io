import React from 'react';

import styles from './style.module.css';

const defaultProps = {
  src: null,
};

type Props = {
  src: any;
  alt: string;
};

const SVG = ({ src, alt }: Props) => (
  <div className={styles.container}>
    <img src={src} alt={alt} />
  </div>
);

SVG.defaultProps = defaultProps;

export { SVG };
