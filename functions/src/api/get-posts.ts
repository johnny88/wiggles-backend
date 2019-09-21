import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onRequestWrapper, Handler } from "../helpers";

const getPostHandler: Handler = async (
  req: functions.Request,
  res: functions.Response
): Promise<void> => {
  const db = admin.firestore();
  const postRef = db.collection("posts").orderBy("timestamp", "desc");
  try {
    const postsSnap = await postRef.get();
    const posts = postsSnap.docs.map(doc => doc.data());
    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(422).json({ status: "Oh no!" });
  }
};

export const getPosts = onRequestWrapper(getPostHandler);
