import jwt from 'jsonwebtoken';
import createError from 'http-errors';

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw createError(401, 'No token provided');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(createError(401, 'Invalid token'));
  }
};

export default auth;
