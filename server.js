import server from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();



connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
