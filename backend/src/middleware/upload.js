const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// multer-storage-cloudinary v4 uses `params` as a function or plain object
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'margadarshak/resumes',
    allowed_formats: ['pdf'],
    resource_type: 'raw'
  }
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'margadarshak/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, crop: 'limit' }]
  }
});

exports.uploadResume = multer({ storage: resumeStorage, limits: { fileSize: 10 * 1024 * 1024 } });
exports.uploadImage = multer({ storage: imageStorage, limits: { fileSize: 5 * 1024 * 1024 } });
exports.cloudinary = cloudinary;
