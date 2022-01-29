import * as functions from "firebase-functions";
import Stripe from "stripe";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
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
