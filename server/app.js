require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

const registerRoute = require('./Routes/register');
const loginRoute = require('./Routes/login');
const filesRoute = require('./Routes/files');

app.use('/api/auth', registerRoute);  
app.use('/api/auth', loginRoute); 
app.use('/api/files', filesRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});