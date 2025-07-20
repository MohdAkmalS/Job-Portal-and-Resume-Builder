const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const authRouter = require('./route/adminRoutes')
const app = express();
app.use(express.json());
app.use(cors());

console.log("hello");
app.get('/' , (req , res) => {
    res.status(200).json({message : "hello"})
})
app.use('/auth' , authRouter);
mongoose.connect("mongodb://localhost:27017/webPage").then(() => console.log('mongoDb is connected'));
app.listen(3001, () => console.log("Server running on port 3000"));
