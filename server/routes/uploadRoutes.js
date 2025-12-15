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
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit (Max safe limit for Vercel)
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('resume'); // Define single upload here

// @route POST /api/upload
// @desc Upload a file (Returns Base64 Data URI)
router.post('/', (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading (e.g. File too large)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File too large. Max limit is 4MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            // An unknown error occurred when uploading.
            return res.status(400).json({ success: false, message: err });
        }

        // Everything went fine.
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
});

module.exports = router;
