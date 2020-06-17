import React from 'react';
import Homepage from '../homepage';

type Props = {
  data: {
    allPost: any;
    [key: string]: string;
  };
};

export default ({ data }: Props) => {
  const { allPost } = data;

  return <Homepage posts={allPost.nodes} />;
};
