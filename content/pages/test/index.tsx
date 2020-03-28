import React from 'react';

const Speaking = () => (
  <div>
    <ul>
      {Talks.talks.map((data: any, index: number) => {
        return <li key={`content_item_${index}`}>{data.item}</li>;
      })}
    </ul>
  </div>
);

export default Speaking;
// Hi!

// These are my talks

// ### An Introduction to Smart Contracts

// <iframe width="560" height="315" src="https://www.youtube.com/embed/bYUrCHv9ewI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

// [Slides](https://slides.com)
