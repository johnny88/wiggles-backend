const admin = require("firebase-admin");

admin.initializeApp();

exports.getPosts = require('./api/get-posts').getPosts;
//exports.processSignUp = require("./auth/processSignUp").processSignUp;
//exports.afterImageUpload = require("./storage/afterImageUpload").afterImageUpload;
//exports.onDeleteImage = require("./database/onImageDelete").onDeleteImage;
//exports.onPostDelete = require("./database/onPostDelete").onPostDelete;
