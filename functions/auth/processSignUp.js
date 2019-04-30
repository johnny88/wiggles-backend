const functions = require("firebase-functions");
const admin = require("firebase-admin");

const emailWhitelist = ["jpangs88@gmail.com", "susannebjorkblom@hotmail.com"];
const emailInWhiteList = ({ email, emailVerified }) =>
  email && emailWhitelist.includes(email) && emailVerified;

exports.processSignUp = functions.auth.user().onCreate(async user => {
  if (!user) return console.log("User does not exist, exiting early.");
  if (!emailInWhiteList(user))
    return console.log(`${user.email} not in whitelist, exiting early.`);
  const customClaims = { authorized: true };
  try {
    console.log("Email in whitelist, creating account.");
    
    const accountRef = admin.database().ref(`accounts/${user.uid}`);
    accountRef.set({
      id: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    });

    console.log("Adding custom claims.");
    await admin.auth().setCustomUserClaims(user.uid, customClaims);
    const metadataRef = admin.database().ref("metadata/" + user.uid);
    return metadataRef.set({ refreshTime: new Date().getTime() });
  } catch (error) {
    console.log(error);
  }
});
