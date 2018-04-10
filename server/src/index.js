const fs = require("fs");
const path = require("path");
const express = require("express");
const { postgraphile } = require("postgraphile");
const PostGraphileUploadFieldPlugin = require("postgraphile-plugin-upload-field");
const { apolloUploadExpress } = require("apollo-upload-server");

const app = express();

const UPLOAD_DIR_NAME = 'uploads';

// Serve uploads as static resources
app.use(`/${UPLOAD_DIR_NAME}`, express.static(path.join(__dirname, `/${UPLOAD_DIR_NAME}`)));

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
  const { stream, filename, mimetype, encoding } = upload;
  // Save file to the local filesystem
  const { id, path } = await saveLocal({ stream, filename });
  // Return metadata to save it to Postgres
  return path;
}

function saveLocal({ stream, filename }) {
  const id = `${new Date().getTime()}_${filename}`;
  const path = `${UPLOAD_DIR_NAME}/${id}`;
  const writeStreamPath = `./${path}`;
  return new Promise((resolve, reject) =>
    stream
      .on("error", error => {
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(writeStreamPath);
        reject(error);
      })
      .on("end", () => resolve({ id, path }))
      .pipe(fs.createWriteStream(writeStreamPath))
  );
}
