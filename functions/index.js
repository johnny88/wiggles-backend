const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.processSignUp = require("./auth/processSignUp").processSignUp;
exports.afterImageUpload = require("./storage/afterImageUpload").afterImageUpload;
