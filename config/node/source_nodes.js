const {
  basePath,
  blogPath,
  postsPath,
  pagesPath,
  tagsPath,
  externalLinks,
  navigation,
} = require(`../options`);

module.exports = ({ actions, createContentDigest }) => {
  const { createNode } = actions;

  const blogConfig = {
    basePath,
    blogPath,
    postsPath,
    pagesPath,
    tagsPath,
    externalLinks,
    navigation,
  };

  createNode({
    ...blogConfig,
    id: `@lekoarts/gatsby-theme-minimal-blog-core-config`,
    parent: null,
    children: [],
    internal: {
      type: `BlogConfig`,
      contentDigest: createContentDigest(blogConfig),
      content: JSON.stringify(blogConfig),
      description: `Blog options`,
    },
  });
};
