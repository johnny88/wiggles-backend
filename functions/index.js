const admin = require("firebase-admin");

admin.initializeApp();

exports.processSignUp = require("./auth/processSignUp").processSignUp;
exports.afterImageUpload = require("./storage/afterImageUpload").afterImageUpload;
exports.addMessage = require("./migrations/migrate-to-firestore").addMessage;
