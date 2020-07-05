/** @jsx jsx */
import { jsx, Styled } from 'theme-ui';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import Layout from './layout';
import SEO from './seo';

type PageProps = {
  data: {
    page: {
      title: string;
      slug: string;
      excerpt: string;
      body: string;
      cssClass: string;
    };
  };
};

const Page = ({ data: { page } }: PageProps) => {
  return (
    <Layout>
      <SEO title={page.title} description={page.excerpt} />
      <Styled.h1>{page.title}</Styled.h1>
      <section sx={{ my: 5 }} className={page.cssClass}>
        <MDXRenderer>{page.body}</MDXRenderer>
      </section>
    </Layout>
  );
};

export default Page;
