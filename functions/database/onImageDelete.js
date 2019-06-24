const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.onDeleteImage = functions.database
  .ref("/images/{imageId}")
  .onDelete(async snap => {
    const imageObj = snap.val();
    console.log("Deleting images for: ", imageObj.path);

    const bucket = admin.storage().bucket("wiggles-f0bd9.appspot.com");
    const mainFile = bucket.file(imageObj.path);
    const webFile = bucket.file(imageObj.web);
    const thumbnailFile = bucket.file(imageObj.thumbnail);

    await Promise.all([
      mainFile.delete(),
      webFile.delete(),
      thumbnailFile.delete()
    ]);

    return;
  });
