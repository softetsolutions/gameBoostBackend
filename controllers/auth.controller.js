import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import createError from 'http-errors';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) throw createError(409, 'User already exists');
    const user = await User.create({ username, email, password, role });
    res.status(200).json({ user, token: generateToken(user._id) });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, 'Invalid email or password');
    }
     const token = jwt.sign(
      { id: user._id,role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } 
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, email: user.email },
    });

    
  } catch (err) {
    next(err);
  }
};
