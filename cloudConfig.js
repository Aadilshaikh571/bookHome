const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bookHome', // Specify your folder name
    allowed_formats: 'jpeg,png,jpg', // Corrected format as a comma-separated string
    public_id: (req, file) => `Screenshot_${Date.now()}`, // Unique identifier for the file
  },
});

module.exports = { cloudinary, storage };
