import React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import "./CreatePost.css";

const CREATE_POST = gql`
  mutation createPost($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        headline
        body
        headerImageFile
      }
    }
  }
`;

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

const CreatePost = () => {
  return (
    <Mutation
      mutation={CREATE_POST}
      refetchQueries={[{ query: GET_POSTS }]}
    >
      {(createPost, { data, loading, error }) => (
        <div>
          <span className="create-post-header">Create Post</span>
          <form
            onSubmit={event => {
              event.preventDefault();
              const fd = new FormData(event.target);
              const headline = fd.get("headline");
              const body = fd.get("body");
              const headerImageFile = fd.get("headerImageFile");
              createPost({
                variables: {
                  input: {
                    post: {
                      headline,
                      body,
                      headerImageFile,
                    }
                  }
                }
              });
            }}
          >
            <label>
              Headline
              <input type="text" name="headline" required />
            </label>
            <label>
              Body
              <textarea name="body" required />
            </label>
            <label>
              Header Image
              <input type="file" name="headerImageFile" accept='image/*' required />
            </label>
            <input type="submit" value="Submit" />
          </form>
          {loading && <p>Loading...</p>}
          {error && <p>Error :( Please try again</p>}
        </div>
      )}
    </Mutation>
  );
};

export default CreatePost;
