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
const storage = new CloudinaryStorage({
   cloudinary: cloudinary,
   // allowedFormats: ['jpeg', 'jpg', 'png'],
   params: {
      folder: 'post/images',
   },
});

const storageFile = new CloudinaryStorage({
   cloudinary: cloudinary,
   params: {
      folder: (req, file) => {
         if (file.fieldname === 'images') {
            return 'post/images';
         } else {
            return 'post/videos';
         }
      },
      allowedFormats: ['jpeg', 'png', 'jpg', 'mp3', 'mp4'],
      resource_type: 'auto',
   },
});

// const upload = multer({ storage: storage });

// module.exports = upload;
module.exports = {
   cloudinary,
   storage,

   storageFile,
}; // thằng này gọi ở đau ?
