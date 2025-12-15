const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure storage
// Configure storage (Memory Storage for Vercel/Serverless)
const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: PDFs Only!');
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit (Vercel has body size limits too)
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// @route POST /api/upload
// @desc Upload a file (Returns Base64 Data URI)
router.post('/', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    // Convert buffer to Base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    res.send({
        success: true,
        message: 'File uploaded successfully',
        filePath: dataURI // Returning Data URI instead of URL
    });
});

module.exports = router;
