const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.getPosts = functions.https.onRequest(async (_, res) => {
  const db = admin.firestore();
  const postRef = db.collection('posts').orderBy('timestamp', 'desc');
  const postsSnap = await postRef.get(); 
  try {
    const posts = postsSnap.docs.map((doc) => doc.data());
    res.status(200).json({ posts });
    return;
  } catch (err) {
    console.error(err);
    res.status(422).json({status: "Oh no!"})
    return;
  }
})
