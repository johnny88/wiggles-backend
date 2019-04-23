const functions = require("firebase-functions");
const admin = require("firebase-admin");
const uuidv4 = require("uuid/v4");

const EXIT_MESSAGES = {
  OBJECT_DOESNT_EXIST: "Image object does not exist, exiting early.",
  OBJECT_NOT_IMAGE: "Object is not an image, ignoring."
};

admin.initializeApp(functions.config().firebase);

exports.afterImageUpload = functions.storage.object().onFinalize(object => {
  if (!object) return console.log(EXIT_MESSAGES.OBJECT_DOESNT_EXIST);
  if (!isObjectImage(object))
    return console.log(EXIT_MESSAGES.OBJECT_NOT_IMAGE);
  const id = uuidv4();
  const imageRef = admin.database().ref(`images/${id}`);
  return imageRef.set({
    id,
    path: object.name,
    contentType: object.contentType
  });
});

const isObjectImage = ({ contentType }) => contentType.startsWith("image/");
