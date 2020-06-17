import React from 'react';
import Tags from '../tags';

type Props = {
  data: {
    allPost: {
      group: {
        fieldValue: string;
        totalCount: number;
      }[];
    };
  };
};

export default ({ data }: Props) => {
  const { allPost } = data;

  return <Tags list={allPost.group} />;
};
