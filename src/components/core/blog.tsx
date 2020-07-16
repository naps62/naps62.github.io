import React from 'react';
import Blog from '../blog';

type Props = {
  data: {
    allPost: any;
    [key: string]: string;
  };
};

export default ({ data }: Props) => {
  const { allPost } = data;

  return <Blog posts={allPost.nodes} />;
};
