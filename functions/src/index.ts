import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as GetPosts from "./api/get-posts";

admin.initializeApp();

export const getPosts = GetPosts.getPosts;
