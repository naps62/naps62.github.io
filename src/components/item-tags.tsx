import React from 'react';
import { Styled } from 'theme-ui';
import { Link } from 'gatsby';
import useBlogConfig from '../hooks/use-blog-config';
import replaceSlashes from '../utils/replaceSlashes';

type TagsProps = {
  tags: {
    name: string;
    slug: string;
  }[];
};

const ItemTags = ({ tags }: TagsProps) => {
  const { tagsPath, basePath } = useBlogConfig();

  return (
    <React.Fragment>
      {tags.map((tag, i) => (
        <React.Fragment key={tag.slug}>
          {!!i && `, `}
          <Styled.a
            as={Link}
            to={replaceSlashes(`/${basePath}/${tagsPath}/${tag.slug}`)}
          >
            {tag.name}
          </Styled.a>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default ItemTags;
