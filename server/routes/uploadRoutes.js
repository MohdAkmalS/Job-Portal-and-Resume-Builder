const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

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
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// @route POST /api/upload
// @desc Upload a file
router.post('/', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    // Return full path
    const fullUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.send({
        success: true,
        message: 'File uploaded',
        filePath: fullUrl
    });
});

module.exports = router;
