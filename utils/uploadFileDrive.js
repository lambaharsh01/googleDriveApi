const { google } = require("googleapis");
const { Readable } = require("stream");

const scope = ["https://www.googleapis.com/auth/drive"];

async function authorize() {
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
  const privateKeyRefined = privateKey.replaceAll("\\n", "\n");

  const jwtClient = new google.auth.JWT(
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    null,
    privateKeyRefined,
    scope
  );
  await jwtClient.authorize();

  return jwtClient;
}

function getFileType(mimeType) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "text/plain":
      return "txt";
    case "application/pdf":
      return "pdf";
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "application/vnd.ms-powerpoint":
      return "ppt";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "pptx";
    default:
      return "unknown";
  }
}

async function uploadFile(authClient, fileBuffer, filename, mimeType) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    var fileMetaData = {
      name: filename,
      parents: [process.env.DRIVE_STORAGE_FOLDER],
    };

    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    drive.files.create(
      {
        resource: fileMetaData,
        media: {
          body: bufferStream,
          mimeType: mimeType,
        },
        fields: "id",
      },
      function (error, file) {
        if (error) {
          return reject(error);
        }

        const fileId = file.data.id;
        const permissions = {
          role: "reader",
          type: "anyone",
        };

        drive.permissions.create(
          {
            fileId: fileId,
            resource: permissions,
          },
          function (error, permission) {
            if (error) {
              return reject(error);
            }

            // Get the direct link to the image file
            const directLink = `https://drive.google.com/uc?id=${fileId}`;

            resolve(directLink);
          }
        );
      }
    );
  });
}

async function uploadBase64File(base64String) {
  const authClient = await authorize();
  const fileBuffer = Buffer.from(base64String.split(",")[1], "base64");
  const mimeType = base64String.split(",")[0].split(":")[1].split(";")[0];
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  const filename = `${year}${month}${day}${hour}${minute}${second}_${randomNumber}.${getFileType(
    mimeType
  )}`;

  return uploadFile(authClient, fileBuffer, filename, mimeType);
}

module.exports = uploadBase64File;
