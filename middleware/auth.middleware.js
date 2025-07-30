import jwt from 'jsonwebtoken';
import createError from 'http-errors';


const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1]; 
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    next(createError(401, 'Invalid or expired token'));
  }
};

export default auth;
