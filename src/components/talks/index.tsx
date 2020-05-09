import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import styles from './talks.module.css';

const AllImagesQuery = graphql`
  {
    allFile(filter: { extension: { in: ["png", "jpg"] } }) {
      edges {
        node {
          name
          publicURL
          relativePath
          name
        }
      }
    }
  }
`;

const YoutubeEmbed = ({ id }) => {
  const youtubeOpts = {
    height: 390,
    width: 640,
    playerVars: { autoplay: 0 },
  };

  return (
    <div className={styles.video}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
  );
};

const Image = ({ src }) => {
  const images = useStaticQuery(AllImagesQuery);
  const imageData = images.allFile.edges.find(({ node }) => node.name == src);

  return (
    <div className={styles.photo}>
      <img src={imageData.node.publicURL} />
    </div>
  );
};

const Talk = ({ title, event, description, slides, ...opts }) => {
  return (
    <section className={styles.talk}>
      <div className={styles.description}>
        <h2>{title}</h2>
        <h3>{event}</h3>
        <p>{description}</p>
        <a target="_blank" href={slides}>
          Slides
        </a>
      </div>

      <div className={styles.media}>
        {opts.youtubeID ? (
          <YoutubeEmbed YoutubeEmbed id={opts.youtubeID} />
        ) : (
          <Image src={opts.image} />
        )}
      </div>
    </section>
  );
};

const Talks = ({ talks }) => (
  <ul className={styles.list}>
    {talks.map((talk: any, index: number) => (
      <li key={`content_item_${index}`}>
        <Talk {...talk} />
      </li>
    ))}
  </ul>
);

export { Talks };
