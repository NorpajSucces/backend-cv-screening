// src/services/storageService.js
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamfier");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


 * Upload buffer (from Multer memory) to Cloudinary via stream
 * @param (Buffer) buffer
 * @returns (promise<string>) secure_url
 * /
 * 

 const uploadPdBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
       const stream =
 cloudinary.uploader.upload_stream(
        {
            resource_type: "raw",
            folder: "cv_uploads",
        },
        (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
        }
    );

streamfier.creatReadStream(buffer).pipe(stream);
    });
};

module.exports = { uploadPdfBuffer };