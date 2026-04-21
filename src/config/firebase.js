const admin = require('firebase-admin');

// Note: You will need to download your service account key from:
// Firebase Console > Project Settings > Service Accounts > Generate new private key
// Then save it as 'firebase-service-account.json' in the backend root.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
