const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

// Configuration
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
   secure: true,
});

const storageFile = new CloudinaryStorage({
   cloudinary: cloudinary,
   params: {
      folder: (req, file) => {
         if (file.fieldname === 'images') {
            return 'post/images';
         } else if (file.fieldname === 'videos') {
            return 'post/videos';
         } else {
            return 'avatar';
         }
      },
      allowedFormats: ['jpeg', 'png', 'jpg', 'mp3', 'mp4'],
      resource_type: 'auto',
   },
});
module.exports = {
   cloudinary,
   storageFile,
};
