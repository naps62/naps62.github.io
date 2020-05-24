import React from 'react';

type Props = {
  src: string;
  alt: string;
};

const Gif = ({ src, alt }: Props) => {
  return <img src={src} alt={alt} />;
};

export { Gif };
