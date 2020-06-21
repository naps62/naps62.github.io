// Create general interfaces that you could can use to leverage other data sources
// The core theme sets up MDX as a type for the general interface

const options = require(`../options`);

const mdxResolverPassthrough = (fieldName) => async (
  source,
  args,
  context,
  info
) => {
  const type = info.schema.getType(`Mdx`);
  const mdxNode = context.nodeModel.getNodeById({
    id: source.parent,
  });
  const resolver = type.getFields()[fieldName].resolve;
  const result = await resolver(mdxNode, args, context, {
    fieldName,
  });
  return result;
};

module.exports = ({ actions }) => {
  const { createTypes, createFieldExtension } = actions;

  const { basePath } = options;

  const slugify = (source) => {
    const slug = source.slug ? source.slug : kebabCase(source.title);

    return `/${basePath}/${slug}`.replace(/\/\/+/g, `/`);
  };

  createFieldExtension({
    name: `slugify`,
    extend() {
      return {
        resolve: slugify,
      };
    },
  });

  createFieldExtension({
    name: `mdxpassthrough`,
    args: {
      fieldName: `String!`,
    },
    extend({ fieldName }) {
      return {
        resolve: mdxResolverPassthrough(fieldName),
      };
    },
  });

  createTypes(`
    interface Post @nodeInterface {
      id: ID!
      slug: String! @slugify
      title: String!
      date: Date! @dateformat
      excerpt(pruneLength: Int = 160): String!
      body: String!
      html: String
      timeToRead: Int!
      tags: [PostTag]
      banner: File @fileByRelativePath
      description: String
    }

    type PostTag {
      name: String
      slug: String
    }

    interface Page @nodeInterface {
      id: ID!
      slug: String!
      title: String!
      excerpt(pruneLength: Int = 160): String!
      body: String!
    }

    type MdxPost implements Node & Post {
      slug: String! @slugify
      title: String!
      date: Date! @dateformat
      excerpt(pruneLength: Int = 140): String! @mdxpassthrough(fieldName: "excerpt")
      body: String! @mdxpassthrough(fieldName: "body")
      html: String! @mdxpassthrough(fieldName: "html")
      timeToRead: Int! @mdxpassthrough(fieldName: "timeToRead")
      tags: [PostTag]
      banner: File @fileByRelativePath
      description: String
    }

    type MdxPage implements Node & Page {
      slug: String!
      title: String!
      excerpt(pruneLength: Int = 140): String! @mdxpassthrough(fieldName: "excerpt")
      body: String! @mdxpassthrough(fieldName: "body")
    }

    type MinimalBlogConfig implements Node {
      basePath: String
      blogPath: String
      postsPath: String
      pagesPath: String
      tagsPath: String
      externalLinks: [ExternalLink]
      navigation: [NavigationEntry]
      showLineNumbers: Boolean
    }

    type ExternalLink {
      name: String!
      url: String!
    }

    type NavigationEntry {
      title: String!
      slug: String!
    }
  `);
};
