require(`dotenv`).config({
  path: `.env`,
});

module.exports = {
  siteMetadata: {
    siteTitle: `Miguel Palhas | @naps62`,
    siteTitleAlt: `Miguel Palhas | @naps62`,
  },
  plugins: [
    {
      resolve: `@lekoarts/gatsby-theme-minimal-blog`,
      options: {
        navigation: [
          { title: `Blog`, slug: `/blog` },
          { title: `About`, slug: `/about` },
          { title: 'Speaking', slug: `/speaking` },
        ],
        externalLinks: [
          { name: `Github`, url: `https://github.com/naps62` },
          { name: `Twitter`, url: `https://twitter.com/naps62` },
          { name: `Instagram`, url: `https://www.instagram.com/naps62/` },
        ],
      },
    },
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

    // `gatsby-plugin-webpack-bundle-analyser-v2`,
  ],
};
