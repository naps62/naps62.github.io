require(`dotenv`).config({
  path: `.env`,
});
const withDefaults = require(`./utils/default-options`);

const newsletterFeed = require(`./src/utils/newsletterFeed`);

const lekoOptions = withDefaults({
  feedTitle: 'Miguel Palhas | @naps62 | Software Developer',
});

const {
  feed = true,
  feedTitle = `Minimal Blog - @lekoarts/gatsby-theme-minimal-blog`,
} = lekoOptions;

module.exports = {
  siteMetadata: {
    siteTitle: `Miguel Palhas | @naps62`,
    siteTitleAlt: `Miguel Palhas | @naps62`,
    siteHeadline: `Miguel Palhas | @naps62`,
    siteUrl: 'https://naps62.com',
    siteDescription: `Software Developer | Elixir | Ruby | Rust | DevOps | Chess`,
    siteLanguage: 'en',
    siteImage: '',
    author: '@naps62',
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-53251745-1',
        head: false,
        anonymize: true,
        respectDNT: true,
        cookieDomain: 'naps62.com',
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-embed-video',
            options: {
              width: 800,
              related: false,
              noIframeBorder: true,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: lekoOptions.postsPath,
        path: lekoOptions.postsPath,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: lekoOptions.pagesPath,
        path: lekoOptions.pagesPath,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 960,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
        ],
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 960,
              quality: 90,
              linkImagesToOriginal: false,
            },
          },
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-typescript`,
    {
      resolve: `gatsby-plugin-feed`,
      options: newsletterFeed(feedTitle),
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-typescript`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-theme-ui`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_ID,
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Miguel Palhas | @naps62`,
        short_name: `naps62`,
        description: `Miguel Palhas | Software Developer`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#6B46C1`,
        display: `standalone`,
        icon: 'src/images/favicon.png',
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-netlify`,
    `gatsby-plugin-postcss`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src`,
      },
    },
  ],
};
