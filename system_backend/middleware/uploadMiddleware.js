import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Get directory name equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create the uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, '/uploads ');
        
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF)'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Limit to 1 file per request
    }
});

export default upload;