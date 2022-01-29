import * as functions from "firebase-functions";
import Stripe from "stripe";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();
const fns = functions.region("asia-northeast1");

const stripe = new Stripe(functions.config().stripe.key, {
  apiVersion: "2020-08-27",
});

export const createCustomer = fns.auth.user().onCreate(async (user) => {
  const customer = await stripe.customers.create({
    name: user.displayName,
    email: user.email,
    metadata: {
      firebaseUID: user.uid,
    },
  });

  return db.doc(`customers/${user.uid}`).set({
    stripeId: customer.id,
  });
});

export const createStripeAccount = fns.https.onCall(async (_, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "ログインが必要です");
  }

  const user = await auth.getUser(context.auth.uid);

  const account = await stripe.accounts.create({
    type: "express",
    country: "JP",
    email: user.email,
    business_type: "individual",
    company: {
      name: user.displayName,
    },
  });

  return db.doc(`stripeAccounts/${user.uid}`).set({
    stripeAccountId: account.id,
  });
});
