const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log('Destination folder:', './uploads');
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // console.log('Original filename:', file.originalname);
        const newFilename = file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop();
        // console.log('New filename:', newFilename);
        cb(null, newFilename);
    }
});

const upload = multer({ storage: storage,
limits: {
    fileSize: 1024 * 1024 * 1,
} });

module.exports = { upload };