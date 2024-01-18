
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    console.log("localFilePath---",localFilePath);
    try {
        if (!localFilePath) return null;

        // check file size 
        const stats = fs.statSync(localFilePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        if (fileSizeInMB > 1) {
            throw new Error('File size exceeds 1MB limits.')
        }
        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // console.log("response----",response.original_filename);
        return response;
    } catch (error) {
        console.error('Error during Cloudinary upload:', error);
        throw error;
    }
};

// console.log("uploadOnCloudinary-----------",uploadOnCloudinary);

module.exports = { cloudinary, uploadOnCloudinary };
