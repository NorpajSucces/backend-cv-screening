// src/services/storageService.js
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer (from Multer memory) to Cloudinary via stream
 * @param {Buffer} buffer
 * @returns {Promise<string>} secure_url
 */
const uploadPdfBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
       const stream = cloudinary.uploader.upload_stream(
        {
            resource_type: "raw",
            folder: "cv_uploads",
        },
        (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        }
    );

    streamifier.createReadStream(buffer).pipe(stream);
    });
};

module.exports = { uploadPdfBuffer };