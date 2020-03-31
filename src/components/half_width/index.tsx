import React from 'react';

import styles from './styles.module.css';

const HalfWidthImage = function ({ img, alt, ...opts }) {
  const largeClass = `large_${opts.large || 100}`;
  const smallClass = `small_${opts.small || 100}`;

  const classes = [
    styles.container,
    styles[largeClass],
    styles[smallClass],
  ].join(' ');

  return (
    <div className={classes}>
      <img src={img} alt={alt} />
    </div>
  );
};

export { HalfWidthImage };