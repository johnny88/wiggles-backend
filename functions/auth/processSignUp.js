const functions = require("firebase-functions");
const admin = require("firebase-admin");

const emailWhitelist = [
  "jpangs88@gmail.com",
  "susannebjorkblom@hotmail.com",
  "lndpangalos@gmail.com",
  "iris.pangalos@gmail.com",
  "19pangalos@gmail.com",
  "seanmheff@gmail.com",
  "joan.manuel.valdes@gmail.com",
  "gujehoglund@hotmail.com",
  "karinbjorkblom@gmail.com"
];
const emailInWhiteList = ({ email, emailVerified }) =>
  email && emailWhitelist.includes(email) && emailVerified;

exports.processSignUp = functions.auth.user().onCreate(async user => {
  if (!user) return console.log("User does not exist, exiting early.");
  if (!emailInWhiteList(user))
    return console.log(`${user.email} not in whitelist, exiting early.`);
  const customClaims = { authorized: true };
  try {
    console.log("Email in whitelist, creating account.");
    const db = admin.firestore();
    const accountRef = db.collection('accounts').doc(user.uid);
    await accountRef.set({
      id: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    });

    console.log("Adding custom claims.");
    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    const metadataRef = db.collection("metadata").doc(user.uid);
    await metadataRef.set({ refreshTime: new Date().getTime() });
    return;
  } catch (error) {
    console.log(error);
  }
});
