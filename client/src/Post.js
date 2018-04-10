import React from 'react';
import './Post.css';

const Post = ({id, headline, headerImageFile}) => (
  <div key={id} className="post">
    <span className="headline">{headline}</span>
    {headerImageFile ? <img alt="" src={`http://localhost:5000/${headerImageFile}`} /> : null}
  </div>
)

export default Post;