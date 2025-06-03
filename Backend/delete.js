const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: "./uploads/", // Folder to store images
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Initialize multer with file filter
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            return cb(new Error("Only .png, .jpg, and .jpeg format allowed!"));
        }
    },
});

// Route to upload an image
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }
    res.json({
        message: "Image uploaded successfully!",
        file: req.file.filename,
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
