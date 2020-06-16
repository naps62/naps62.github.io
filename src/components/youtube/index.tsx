import React from 'react';

import styles from './style.module.css';

type Props = {
  videoID: string;
};

const Youtube = ({ videoID }: Props) => (
  <div className={styles.container}>
    <iframe
      width="560"
      height="315"
      src={`https://www.youtube-nocookie.com/embed/${videoID}`}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

export { Youtube };
