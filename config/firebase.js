const firebaseAdmin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");

require("dotenv").config();

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

module.exports = firebaseAdmin;
