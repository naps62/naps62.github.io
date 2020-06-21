const { basePath, blogPost, tagsPath, formatString } = require(`../options`);

// These template are only data-fetching wrappers that import components
const homepageTemplate = require.resolve(
  `../../src/templates/homepage-query.tsx`
);
const blogTemplate = require.resolve(`../../src/templates/blog-query.tsx`);
const postTemplate = require.resolve(`../../src/templates/post-query.tsx`);
const pageTemplate = require.resolve(`../../src/templates/page-query.tsx`);
const tagTemplate = require.resolve(`../../src/templates/tag-query.tsx`);
const tagsTemplate = require.resolve(`../../src/templates/tags-query.tsx`);

module.exports = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;

  createPage({
    path: basePath,
    component: homepageTemplate,
    context: {
      formatString,
    },
  });

  createPage({
    path: `/${basePath}/${blogPath}`.replace(/\/\/+/g, `/`),
    component: blogTemplate,
    context: {
      formatString,
    },
  });

  createPage({
    path: `/${basePath}/${tagsPath}`.replace(/\/\/+/g, `/`),
    component: tagsTemplate,
  });

  const result = await graphql(`
    query {
      allPost(sort: { fields: date, order: DESC }) {
        nodes {
          slug
        }
      }
      allPage {
        nodes {
          slug
        }
      }
      tags: allPost(sort: { fields: tags___name, order: DESC }) {
        group(field: tags___name) {
          fieldValue
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your posts or pages`,
      result.errors
    );
    return;
  }

  const posts = result.data.allPost.nodes;

  posts.forEach((post) => {
    createPage({
      path: post.slug,
      component: postTemplate,
      context: {
        slug: post.slug,
        formatString,
      },
    });
  });

  const pages = result.data.allPage.nodes;

  if (pages.length > 0) {
    pages.forEach((page) => {
      createPage({
        path: `/${basePath}/${page.slug}`.replace(/\/\/+/g, `/`),
        component: pageTemplate,
        context: {
          slug: page.slug,
        },
      });
    });
  }

  const tags = result.data.tags.group;

  if (tags.length > 0) {
    tags.forEach((tag) => {
      createPage({
        path: `/${basePath}/${tagsPath}/${kebabCase(tag.fieldValue)}`.replace(
          /\/\/+/g,
          `/`
        ),
        component: tagTemplate,
        context: {
          slug: kebabCase(tag.fieldValue),
          name: tag.fieldValue,
          formatString,
        },
      });
    });
  }
};
