const user = require('../model/adminModel');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { email, password } = req.body; 
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Invalid input"
            });
        }

        const existUser = await user.findOne({ email });
        if (!existUser) {
            return res.status(404).json({
                success: false,
                message: "User does not exist"
            });
        }
        const checkPass = await bcrypt.compare(password, existUser.password);
        if (!checkPass) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User logged in successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
            message: "An error occurred"
        });
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body; 
        console.log("hello")
        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                message: "Invalid input"
            });
        }
        const existUser = await user.findOne({ email });
        if (existUser) {
            return res.status(404).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new user({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(200).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
            message: "An error occurred"
        });
    }
};

module.exports = { login, register };
