const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.onPostDelete = functions.database
  .ref("/post/{postId}")
  .onDelete(async snap => {
    const post = snap.val();
    if (post.type === 'image') {
      const imageRef = admin.database().ref(`images/${post.refId}`)
      imageRef.remove();
      return;
    }
    if (post.type === 'quote') {
      const quoteRef = admin.database().ref(`quotes/${post.refId}`)
      quoteRef.remove();
      return
    }
  });
