import * as functions from "firebase-functions";

export interface Handler {
  (req: functions.Request, res: functions.Response): void;
}

export const onRequestWrapper = (handler: Handler): functions.HttpsFunction =>
  functions.https.onRequest(handler);
