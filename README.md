# postgraphile-upload-example

This app demonstrates how to add file upload support to PostGraphile using the [GraphQL Multipart Request Spec](https://github.com/jaydenseric/graphql-multipart-request-spec).

Server:
- PostGraphile
- [Upload Field plugin for PostGraphile](https://github.com/mattbretl/postgraphile-plugin-upload-field)
- [Apollo Upload Server](https://github.com/jaydenseric/apollo-upload-server) (no dependency on Apollo Server; it's a lightweight middleware for Express/Koa)

Client:
- create-react-app
- Apollo Client
- [Apollo Upload Client](https://github.com/jaydenseric/apollo-upload-client)

## Quick Start

Clone this repo.

In one terminal:

```bash
cd server
createdb upload_example
psql -d upload_example -f schema.sql
yarn
npm start
```

In another terminal:

```bash
cd client
yarn
npm start
```

The app should now be fully functional at localhost:3000. Uploaded files will be stored locally in `/server/uploads`.

## How does it work?

The [server](https://github.com/mattbretl/postgraphile-upload-example/blob/master/server/src/index.js) code should be relatively straightforward if you're familiar with PostGraphile. [Apollo Upload Server](https://github.com/jaydenseric/apollo-upload-server) middleware handles the multipart requests using [busboy](https://github.com/mscdex/busboy). The [Upload Field plugin](https://github.com/mattbretl/postgraphile-plugin-upload-field) for PostGraphile is minimally documented, but briefly, `match` is a function used to specify the file upload metadata columns and `resolve` is a function that handles the actual file upload stream.

The client is full of React/Apollo boilerplate. The unique parts are:
- [These lines in clients/src/index.js](https://github.com/mattbretl/postgraphile-upload-example/blob/master/client/src/index.js#L26-28) where createUploadLink replaces the usual createHttpLink in the ApolloClient constructor; and
- [All of client/src/CreatePost.js](https://github.com/mattbretl/postgraphile-upload-example/blob/master/client/src/CreatePost.js), which is the actual upload form. It uses the new `Query` and `Mutation` components that were [added in React Apollo 2.1](https://dev-blog.apollodata.com/introducing-react-apollo-2-1-c837cc23d926).

## Preserving metadata

By default, the example app only stores the local file path to Postgres. To preserve additional metadata, change the `header_image_file` column type to JSONB and replace the resolveUpload function with the following:

```js
async function resolveUpload(upload) {
  const { stream, filename, mimetype, encoding } = upload;
  // Save file to the local filesystem
  const { id, path } = await saveLocal({ stream, filename });
  // Return metadata to save it to Postgres
  return {
    id,
    path,
    filename,
    mimetype,
    encoding
  };
}
```

After making this change, you'll also need to update the client app to use the `path` property of the object.

For a more robust solution, consider using something like [postgraphile-plugin-derived-field](https://github.com/mattbretl/postgraphile-plugin-derived-field) to expose URLs through GraphQL instead of exposing the raw path/metadata.

If you're streaming file uploads to an object storage service such as S3, you can also use the derived field plugin to generate pre-signed URLs for clients.