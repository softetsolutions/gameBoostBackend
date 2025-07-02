import express from "express";
import {
  getFacebookAuthUrl,
  getGoogleAuthUrl,
  getPaypalAuthUrl,
  getSocialConnectStatus,
  getTwittwrAuthUrl,
  handleFacebookCallback,
  handleGoogleCallback,
  handlePaypalCallback,
  handleTwitterCallback,
  unlinkSocialAccount,
} from "../controllers/social.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// Get social connection status
router.get("/status", auth, getSocialConnectStatus);
// Unlink a social account
router.post("/unlink", auth, unlinkSocialAccount);

//Redirect user to {google,facebook,twitter,paypal} login page
router.get("/google", getGoogleAuthUrl);
router.get("/facebook", getFacebookAuthUrl);
router.get("/twitter", getTwittwrAuthUrl);
router.get('/paypal', getPaypalAuthUrl);

// Handle callbacks from social providers
router.get("/google/callback",handleGoogleCallback );
router.get("/facebook/callback",handleFacebookCallback );
router.get("/twitter/callback",handleTwitterCallback);
router.get('/paypal/callback',handlePaypalCallback);

export default router;
