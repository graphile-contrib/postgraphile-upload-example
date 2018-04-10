import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Post from './Post';

const GET_POSTS = gql`
  query allPosts {
  allPosts(first: 50) {
    nodes {
      id
      headline
      headerImageFile
    }
  }
}
`;

const Posts = () => (
  <Query query={GET_POSTS}>
    {({ loading, error, data }) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error :(</div>;

      return (
        data.allPosts.nodes.map(post => Post(post))
      )
    }}
  </Query>
)

export default Posts;