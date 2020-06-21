import { graphql, useStaticQuery } from 'gatsby';

type Props = {
  blogConfig: {
    basePath: string;
    blogPath: string;
    postsPath: string;
    pagesPath: string;
    tagsPath: string;
    externalLinks: {
      name: string;
      url: string;
    }[];
    navigation: {
      title: string;
      slug: string;
    }[];
    showLineNumbers: boolean;
  };
};

const useBlogConfig = () => {
  const data = useStaticQuery<Props>(graphql`
    query {
      blogConfig {
        basePath
        blogPath
        postsPath
        pagesPath
        tagsPath
        externalLinks {
          name
          url
        }
        navigation {
          title
          slug
        }
        showLineNumbers
      }
    }
  `);

  return data.blogConfig;
};

export default useBlogConfig;
