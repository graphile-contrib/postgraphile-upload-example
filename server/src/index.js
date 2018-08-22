const fs = require("fs");
const path = require("path");
const express = require("express");
const { postgraphile } = require("postgraphile");
const PostGraphileUploadFieldPlugin = require("postgraphile-plugin-upload-field");
const { apolloUploadExpress } = require("apollo-upload-server");

const app = express();

const UPLOAD_DIR_NAME = "uploads";

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
  console.log("Server listening on port 5000");
});

async function resolveUpload(upload) {
  const { filename, mimetype, encoding, createReadStream } = upload;
  const stream = createReadStream();
  // Save file to the local filesystem
  const { id, filepath } = await saveLocal({ stream, filename });
  // Return metadata to save it to Postgres
  return filepath;
}

function saveLocal({ stream, filename }) {
  const timestamp = new Date().toISOString().replace(/\D/g, "");
  const id = `${timestamp}_${filename}`;
  const filepath = path.join(UPLOAD_DIR_NAME, id);
  const fsPath = path.join(process.cwd(), filepath);
  return new Promise((resolve, reject) =>
    stream
      .on("error", error => {
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(fsPath);
        reject(error);
      })
      .on("end", () => resolve({ id, filepath }))
      .pipe(fs.createWriteStream(fsPath))
  );
}
