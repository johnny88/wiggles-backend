const admin = require("firebase-admin");

// var config = {
  // apiKey: "AIzaSyAFp8tpwDeUhRFB4ruP-Wk6FyujzpGyon4",
  // authDomain: "wiggles-f0bd9.firebaseapp.com",
  // databaseURL: "https://wiggles-f0bd9.firebaseio.com",
  // projectId: "wiggles-f0bd9",
  // storageBucket: "wiggles-f0bd9.appspot.com",
  // messagingSenderId: "837754270874",
  // appId: "1:837754270874:web:4760e51978d04dfb"
// };

admin.initializeApp();

exports.processSignUp = require("./auth/processSignUp").processSignUp;
exports.afterImageUpload = require("./storage/afterImageUpload").afterImageUpload;
exports.addMessage = require("./migrations/migrate-to-firestore").addMessage;
