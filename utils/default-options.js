module.exports = (themeOptions) => {
  const basePath = themeOptions.basePath || `/`;
  const blogPath = themeOptions.blogPath || `/blog`;
  const postsPath = themeOptions.postsPath || `content/posts`;
  const pagesPath = themeOptions.pagesPath || `content/pages`;
  const tagsPath = themeOptions.tagsPath || `/tags`;
  const externalLinks = themeOptions.externalLinks || [
    { name: `Github`, url: `https://github.com/naps62` },
    { name: `Twitter`, url: `https://twitter.com/naps62` },
    { name: `Instagram`, url: `https://www.instagram.com/naps62/` },
  ];
  const navigation = themeOptions.navigation || [
    { title: `Blog`, slug: `/blog` },
    { title: `About`, slug: `/about` },
    { title: 'Speaking', slug: `/speaking` },
  ];
  const showLineNumbers = themeOptions.showLineNumbers || true;
  const formatString = themeOptions.formatString || `DD.MM.YYYY`;

  return {
    basePath,
    blogPath,
    postsPath,
    pagesPath,
    tagsPath,
    externalLinks,
    navigation,
    showLineNumbers,
    formatString,
  };
};
