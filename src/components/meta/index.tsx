import React from 'react';
import { Helmet } from 'react-helmet';

const defaultProps = {
  canonical: null,
};

type Props = {
  canonical?: string;
};

const Meta = ({ canonical }: Props) => {
  return (
    <div>
      <Helmet>
        {!!canonical && <link rel="canonical" href={canonical} />}
      </Helmet>
    </div>
  );
};

Meta.defaultProps = defaultProps;

export { Meta };
