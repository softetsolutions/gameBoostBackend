import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

//for twitter pkce
const state = crypto.randomBytes(16).toString("hex");
const code_verifier = crypto.randomBytes(64).toString("hex");
const hash = crypto.createHash("sha256").update(code_verifier).digest();
const code_challenge = hash
  .toString("base64")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "");

const GOOGLE_REDIRECT_URI = "http://localhost:5000/api/social/google/callback";
const FACEBOOK_REDIRECT_URI =
  "http://localhost:5000/api/social/facebook/callback";
const TWITTER_REDIRECT_URI =
  "http://localhost:5000/api/social/twitter/callback";
const PAYPAL_REDIRECT_URI = "http://localhost:5000/api/social/paypal/callback";
const FRONTEND_REDIRECT_URI = "http://localhost:3000";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  TWITTER_CLIENT_SECRET,
  TWITTER_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_CLIENT_ID,
} = process.env;

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export const getSocialConnectStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("socialAccounts");
    const social = user.socialAccounts?.toObject?.() || {};

    const status = {
      facebook: !!social.facebook,
      google: !!social.google,
      paypal: !!social.paypal,
      twitter: !!social.twitter,
    };

    res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

export const unlinkSocialAccount = async (req, res, next) => {
  try {
    const { platform } = req.body;

    if (!["facebook", "google", "paypal", "twitter"].includes(platform)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid platform" });
    }

    const update = {};
    update[`socialAccounts.${platform}`] = "";

    await User.findByIdAndUpdate(req.user.id, { $set: update });

    res
      .status(200)
      .json({ success: true, message: `${platform} unlinked successfully` });
  } catch (err) {
    next(err);
  }
};

export const getGoogleAuthUrl = (req, res) => {
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent");
  res.redirect(googleAuthUrl.toString());
};

export const getFacebookAuthUrl = (req, res) => {
  const fbAuthUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  fbAuthUrl.searchParams.set("client_id", FACEBOOK_CLIENT_ID);
  fbAuthUrl.searchParams.set("redirect_uri", FACEBOOK_REDIRECT_URI);
  fbAuthUrl.searchParams.set("scope", "email,public_profile");
  fbAuthUrl.searchParams.set("response_type", "code");
  res.redirect(fbAuthUrl.toString());
};

export const getTwittwrAuthUrl = (req, res) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: TWITTER_REDIRECT_URI,
    scope: "users.read tweet.read offline.access email.read",
    state,
    code_challenge,
    code_challenge_method: "S256",
  });

  res.redirect(`https://twitter.com/i/oauth2/authorize?${params}`);
};

export const getPaypalAuthUrl = (req, res) => {
  const url = new URL("https://www.paypal.com/signin/authorize");
  url.searchParams.set("client_id", PAYPAL_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("redirect_uri", PAYPAL_REDIRECT_URI);

  res.redirect(url.toString());
};

export const handleGoogleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code)
    return res
      .status(404)
      .json({ success: false, error: "Missing authorization code" });

  try {
    // Exchange auth code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const { access_token } = await tokenResponse.json();
    if (!access_token)
      return res
        .status(404)
        .json({ success: false, error: "Invalid token exchange" });

    // Fetch user profile from Google
    const profileResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { sub, email, given_name, family_name } =
      await profileResponse.json();
    if (!email)
      return res
        .status(404)
        .json({ success: false, error: "Email not available from Google" });

    // Check or create user
    let user = await User.findOne({
      $or: [{ email }, { "socialAccounts.google": sub }],
    });

    if (!user) {
      user = await User.create({
        username: email.split("@")[0],
        email,
        firstName: given_name,
        lastName: family_name,
        displayName: `${given_name} ${family_name}`.trim(),
        socialAccounts: { google: sub },
      });
    } else if (!user.socialAccounts.google) {
      user.socialAccounts.google = sub;
      await user.save();
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_REDIRECT_URI}?token=${token}`);
  } catch (error) {
    next(error);
  }
};

export const handleFacebookCallback = async (req, res) => {
  const code = req.query.code;
  if (!code)
    return res
      .status(404)
      .json({ success: false, error: "Missing authorization code" });

  try {
    //Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: FACEBOOK_CLIENT_ID,
          redirect_uri: FACEBOOK_REDIRECT_URI,
          client_secret: FACEBOOK_CLIENT_SECRET,
          code,
        })
    );

    const { access_token } = await tokenRes.json();
    if (!access_token)
      return res
        .status(404)
        .json({ success: false, error: "Failed to get access token" });

    // Fetch user info
    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${access_token}`
    );
    const profile = await profileRes.json();

    const { id: facebookId, email, first_name, last_name } = profile;
    if (!email)
      return res
        .status(404)
        .json({ success: false, error: "Email not available from Facebook" });

    //Find or create user
    let user = await User.findOne({
      $or: [{ email }, { "socialAccounts.facebook": facebookId }],
    });

    if (!user) {
      user = await User.create({
        username: email.split("@")[0],
        email,
        firstName: first_name,
        lastName: last_name,
        displayName: `${first_name} ${last_name}`.trim(),
        socialAccounts: { facebook: facebookId },
      });
    } else if (!user.socialAccounts.facebook) {
      user.socialAccounts.facebook = facebookId;
      await user.save();
    }

    //Generate JWT
    const token = generateToken(user._id);

    //Redirect to frontend with token
    res.redirect(`http://localhost:3000?token=${token}`);
  } catch (err) {
    next(err);
  }
};

export const handleTwitterCallback = async (req, res) => {
  const code = req.query.code;
  if (!code)
    return res
      .status(404)
      .json({ success: false, error: "Missing authorization code" });

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString(
            "base64"
          ),
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: TWITTER_CLIENT_ID,
        redirect_uri: TWITTER_REDIRECT_URI,
        code_verifier,
      }),
    });

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;
    if (!access_token) {
      return res.status(404).json({
        success: false,
        error: "Failed to get access token",
        details: tokenData,
      });
    }

    // Get user info
    const userRes = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userData = await userRes.json();
    const userInfo = userData.data;
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        error: "Failed to get user info",
        details: userData,
      });
    }

    const twitterId = userInfo.id;

    // Find or create user
    let user = await User.findOne({
      $or: [{ email: userInfo.email }, { "socialAccounts.twitter": twitterId }],
    });

    if (!user) {
      user = await User.create({
        username: userInfo.username,
        email: userInfo.email,
        firstName: userInfo.name.split(" ")[0],
        lastName: userInfo.name.split(" ")[1] || "",
        displayName: userInfo.name,
        socialAccounts: { twitter: twitterId },
      });
    } else if (!user.socialAccounts.twitter) {
      user.socialAccounts.twitter = twitterId;
      await user.save();
    }

    //Generate JWT
    const token = generateToken(user._id);

    // Redirect to frontend
    res.redirect(`http://localhost:3000?token=${token}`);
  } catch (err) {
    next(err);
  }
};

export const handlePaypalCallback = async (req, res) => {
  const code = req.query.code;
  if (!code)
    return res
      .status(404)
      .json({ success: false, error: "Missing authorization code" });

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://api.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: PAYPAL_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res
        .status(404)
        .json({ success: false, error: "Token exchange failed" });
    }

    // Get user info
    const profileRes = await fetch(
      "https://api.paypal.com/v1/identity/oauth2/userinfo?schema=openid",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const profile = await profileRes.json();
    const { user_id, email, name } = profile;

    let user = await User.findOne({
      $or: [{ email }, { "socialAccounts.paypal": user_id }],
    });

    if (!user) {
      user = await User.create({
        username: email?.split("@")[0],
        email,
        displayName: name,
        socialAccounts: { paypal: user_id },
      });
    } else if (!user.socialAccounts.paypal) {
      user.socialAccounts.paypal = user_id;
      await user.save();
    }

    const token = generateToken(user._id);

    res.redirect(`http://localhost:3000?token=${token}`);
  } catch (err) {
    next(err);
  }
};
