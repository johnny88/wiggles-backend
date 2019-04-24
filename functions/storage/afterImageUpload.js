const functions = require("firebase-functions");
const admin = require("firebase-admin");
const uuidv4 = require("uuid/v4");
const path = require("path");

const EXIT_MESSAGES = {
  OBJECT_DOESNT_EXIST: "Image object does not exist, exiting early.",
  OBJECT_NOT_IMAGE: "Object is not an image, ignoring."
};

exports.afterImageUpload = functions.storage
  .object()
  .onFinalize(async object => {
    if (!object) return console.log(EXIT_MESSAGES.OBJECT_DOESNT_EXIST);
    if (!isObjectImage(object))
      return console.log(EXIT_MESSAGES.OBJECT_NOT_IMAGE);

    const id = uuidv4();

    const timestamp = path.basename(object.name, path.extname(object.name));
    const imageRef = admin.database().ref(`images/${id}`);
    return imageRef.set({
      id,
      path: object.name,
      contentType: object.contentType,
      userId: object.metadata.userId,
      timestamp,
    });
  });

const isObjectImage = ({ contentType }) => contentType.startsWith("image/");

