const fs = require("fs");
const path = require("path");
const express = require("express");
const { postgraphile } = require("postgraphile");
const PostGraphileUploadFieldPlugin = require("postgraphile-plugin-upload-field");
const { apolloUploadExpress } = require("apollo-upload-server");

const app = express();

const UPLOAD_DIR_NAME = 'uploads';

// Serve uploads as static resources
app.use(`/${UPLOAD_DIR_NAME}`, express.static(path.resolve(UPLOAD_DIR_NAME)));

// Attach multipart request handling middleware
app.use(apolloUploadExpress());

app.use(
  postgraphile("postgres://localhost:5432/upload_example", "public", {
    graphiql: true,
    enableCors: true,
    appendPlugins: [PostGraphileUploadFieldPlugin],
    graphileBuildOptions: {
      uploadFieldDefinitions: [
        {
          match: ({ schema, table, column, tags }) =>
            column === "header_image_file",
          resolve: resolveUpload
        }
      ]
    }
  })
);

app.listen(5000, () => {
  console.log('Server listening on port 5000');
});

async function resolveUpload(upload) {
  const { filename, mimetype, encoding, createReadStream } = upload;
  const stream = createReadStream();
  // Save file to the local filesystem
  const id = `${new Date().getTime()}_${filename}`;
  const path = `${UPLOAD_DIR_NAME}/${id}`;
  const writeStreamPath = `./${path}`;
  const writeStream = fs.createWriteStream(writeStreamPath);
  await stream.pipe(writeStream);
  // Return metadata to save it to Postgres
  return path;
}
