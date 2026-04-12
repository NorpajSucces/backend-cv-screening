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
/**
 * Extract public_id from URL and delete file from Cloudinary resource_type: "raw"
 * @param {string} url 
 * @returns {Promise<any>}
 */
const deleteFileCloudinary = (url) => {
    return new Promise((resolve, reject) => {
        try {
            // URL format example: https://res.cloudinary.com/.../raw/upload/v1234567/cv_uploads/filename.pdf
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            // for raw resources, public_id includes the folder and filename (with extension)
            const public_id = `cv_uploads/${filename}`;
            
            cloudinary.uploader.destroy(public_id, { resource_type: "raw" }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { uploadPdfBuffer, deleteFileCloudinary };