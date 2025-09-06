import jwt from "jsonwebtoken";
import createError from "http-errors";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    const httpOnlyCookie = req.cookies?.token;

    console.log("Auth middleware running...");
    console.log("Header:", authHeader);
    console.log("Cookie:", httpOnlyCookie);

    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (httpOnlyCookie) {
      token = httpOnlyCookie;
    }

    if (!token) {
      throw createError(401, "No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded payload:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      next(createError(401, "Token expired"));
    } else if (err.name === "JsonWebTokenError") {
      next(createError(401, "Invalid token"));
    } else {
      next(createError(500, "Internal server error"));
    }
  }
};

export default auth;
