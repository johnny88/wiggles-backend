const functions = require("firebase-functions");
const admin = require("firebase-admin");
const uuidv4 = require("uuid/v4");
const path = require("path");
const spawn = require("child-process-promise").spawn;
const os = require("os");
const fs = require("fs");

const EXIT_MESSAGES = {
  OBJECT_DOESNT_EXIST: "Image object does not exist, exiting early.",
  OBJECT_NOT_IMAGE: "Object is not an image, ignoring."
};

const LAZY_PREFIX = "lazy_";

exports.afterImageUpload = functions.storage
  .object()
  .onFinalize(async object => {
    if (!object) return console.log(EXIT_MESSAGES.OBJECT_DOESNT_EXIST);
    if (!isObjectImage(object))
      return console.log(EXIT_MESSAGES.OBJECT_NOT_IMAGE);

    const id = uuidv4();

    const timestamp = path.basename(object.name, path.extname(object.name));
    const imageRef = admin.database().ref(`images/${id}`);
    const lazyImage = await createLazyLoadImage(object);
    return imageRef.set({
      id,
      path: object.name,
      contentType: object.contentType,
      userId: object.metadata.userId,
      timestamp,
      lazyImage
    });
  });

const isObjectImage = ({ contentType }) => contentType.startsWith("image/");

const createLazyLoadImage = async object => {
  // Setting up path variables
  const filePath = object.name;
  const fileDir = path.dirname(filePath);
  const tempLocalFile = path.join(os.tmpdir(), filePath);
  const fileName = path.basename(filePath);
  const lazyFilePath = path.normalize(
    path.join(fileDir, `${LAZY_PREFIX}${fileName}`)
  );
  const tempLocalLazyFile = path.join(os.tmpdir(), lazyFilePath);

  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(filePath);

  await file.download({ destination: tempLocalFile });

  await spawn("convert", [tempLocalFile, "-resize", "3x3", tempLocalLazyFile], {
    capture: ["stdout", "stderr"]
  });

  const buffer = fs.readFileSync(tempLocalLazyFile)
  const lazyImage = `data:image/gif;base64,${buffer.toString('base64')}`;

  fs.unlinkSync(tempLocalFile);
  fs.unlinkSync(tempLocalLazyFile);

  return lazyImage;
};
