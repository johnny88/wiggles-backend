const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mkdirp = require("mkdirp-promise");
const spawn = require("child-process-promise").spawn;
const os = require("os");
const fs = require("fs");
const uuidv4 = require("uuid/v4");
const path = require("path");

const exitMessages = {
  OBJECT_DOESNT_EXIST: "Image object does not exist, exiting early.",
  OBJECT_NOT_IMAGE: "Object is not an image, ignoring.",
  IMAGE_NOT_ORIGINAL: "Image is not an original, skipping."
};

const statusMessages = {
  GENERATING_WEB_IMAGE: "Generating web image",
  GENERATING_THUMBNAIL_IMAGE: "Generating thumbnail image",
  FINISHED: "Finished"
};

// Max height and width of the thumbnail in pixels.
const THUMB_MAX_HEIGHT = 200;
const THUMB_MAX_WIDTH = 200;

const WEB_MAX_HEIGHT = 1080;
const WEB_MAX_WIDTH = 1080;

// Prefixes.
const THUMB_PREFIX = "thumb_";
const WEB_PREFIX = "web_";

exports.afterImageUpload = functions.storage
  .object()
  .onFinalize(async object => {
    if (!object) return console.log(exitMessages.OBJECT_DOESNT_EXIST);
    if (!isObjectImage(object))
      return console.log(exitMessages.OBJECT_NOT_IMAGE);

    const fileName = path.basename(object.name);

    if (startsWithPrefix([THUMB_PREFIX, WEB_PREFIX], fileName)) {
      console.log(exitMessages.IMAGE_NOT_ORIGINAL);
      return;
    }

    const id = uuidv4();
    const timestamp = path.basename(object.name, path.extname(object.name));
    const imageRef = admin.database().ref(`images/${id}`);

    imageRef.set({
      id,
      path: object.name,
      contentType: object.contentType,
      userId: object.metadata.userId,
      timestamp,
      status: statusMessages.GENERATING_THUMBNAIL_IMAGE,
      uploadFinished: false
    });

    const thumbnail = await convertImage(object, THUMB_PREFIX, true);
    if (!thumbnail) return;

    imageRef.update({
      status: statusMessages.GENERATING_WEB_IMAGE
    });

    const web = await convertImage(object, WEB_PREFIX);
    if (!web) return;

    return imageRef.update({
      thumbnail,
      web,
      status: statusMessages.FINISHED,
      uploadFinished: true
    });
  });

const isObjectImage = ({ contentType }) => contentType.startsWith("image/");

const startsWithPrefix = (prefixes, fileName) =>
  prefixes.some(prefix => fileName.startsWith(prefix));

const convertImage = async (object, prefix, thumbnail = false) => {
  // File and directory paths.
  const filePath = object.name;
  const contentType = object.contentType; // This is the image MIME type
  const fileDir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const convertFilePath = path.normalize(
    path.join(fileDir, `${prefix}${fileName}`)
  );
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const tempLocalDir = path.dirname(tempLocalFile);
  const tempLocalConvertFile = path.join(os.tmpdir(), convertFilePath);

  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(filePath);

  const metadata = {
    contentType: contentType,
    // To enable Client-side caching you can set the Cache-Control headers here. Uncomment below.
    "Cache-Control": `public,max-age=${60 * 60 * 24 * 30}`
  };

  // Create the temp directory where the storage file will be downloaded.
  await mkdirp(tempLocalDir);

  // Download file from bucket.
  await file.download({ destination: tempLocalFile });
  console.log("The file has been downloaded to", tempLocalFile);

  const args = thumbnail
    ? [
        tempLocalFile,
        "-thumbnail",
        `${THUMB_MAX_WIDTH}x${THUMB_MAX_HEIGHT}>`,
        tempLocalConvertFile
      ]
    : [
        tempLocalFile,
        "-resize",
        `${WEB_MAX_WIDTH}x${WEB_MAX_HEIGHT}>`,
        tempLocalConvertFile
      ];

  // Generate a thumbnail using ImageMagick.
  await spawn("convert", args, { capture: ["stdout", "stderr"] });
  console.log("Thumbnail created at", tempLocalConvertFile);

  // Uploading the Thumbnail.
  await bucket.upload(tempLocalConvertFile, {
    destination: convertFilePath,
    metadata: metadata
  });
  console.log("Thumbnail uploaded to Storage at", convertFilePath);

  // Once the image has been uploaded delete the local files to free up disk space.
  fs.unlinkSync(tempLocalFile);
  fs.unlinkSync(tempLocalConvertFile);

  return convertFilePath;
};
