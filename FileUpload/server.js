const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Define upload directories for different file types
const uploadDirs = {
    images: path.join(__dirname, 'uploads', 'images'),
    videos: path.join(__dirname, 'uploads', 'videos'),
    pdfs: path.join(__dirname, 'uploads', 'pdfs'),
    others: path.join(__dirname, 'uploads', 'others')
};

// Create upload directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Function to calculate file hash
function calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('error', reject);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

// Function to check for duplicate files
async function checkDuplicateFile(filePath, fileHash) {
    const allDirs = Object.values(uploadDirs);
    
    for (const dir of allDirs) {
        if (!fs.existsSync(dir)) continue;
        
        const files = fs.readdirSync(dir);
        for (const filename of files) {
            const existingPath = path.join(dir, filename);
            try {
                const existingHash = await calculateFileHash(existingPath);
                if (existingHash === fileHash) {
                    return {
                        isDuplicate: true,
                        existingPath: existingPath
                    };
                }
            } catch (error) {
                console.error(`Error checking file ${filename}:`, error);
            }
        }
    }
    
    return { isDuplicate: false };
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        let uploadDir = uploadDirs.others;

        // Determine the appropriate directory based on file type
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            uploadDir = uploadDirs.images;
        } else if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) {
            uploadDir = uploadDirs.videos;
        } else if (['.pdf'].includes(ext)) {
            uploadDir = uploadDirs.pdfs;
        }

        console.log('Uploading to directory:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// File upload
app.post('/upload', upload.single('file'), [
    body('description').optional().trim().isLength({ max: 200 })
], async (req, res) => {
    console.log('Received upload request');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Check for duplicate files
        const fileHash = await calculateFileHash(req.file.path);
        const duplicateCheck = await checkDuplicateFile(req.file.path, fileHash);

        if (duplicateCheck.isDuplicate) {
            // Delete the uploaded file since it's a duplicate
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                error: 'Duplicate file detected',
                details: 'This file has already been uploaded'
            });
        }

        console.log('File uploaded successfully:', req.file);
        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                description: req.body.description
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        // Clean up the uploaded file if there was an error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Error uploading file: ' + error.message });
    }
});

// Get list of uploaded files
app.get('/files', (req, res) => {
    try {
        console.log('Reading files from directories:', uploadDirs);
        const fileList = [];

        // Function to process files in a directory
        function processDirectory(dir, type) {
            try {
                if (!fs.existsSync(dir)) {
                    console.log(`Directory does not exist: ${dir}`);
                    return;
                }

                const files = fs.readdirSync(dir);
                console.log(`Found ${files.length} files in ${dir}`);
                
                files.forEach(filename => {
                    try {
                        const filePath = path.join(dir, filename);
                        const stats = fs.statSync(filePath);
                        
                        // Get the relative path from the uploads directory
                        const relativePath = path.relative(path.join(__dirname, 'uploads'), filePath);
                        const webPath = '/uploads/' + relativePath.replace(/\\/g, '/');

                        fileList.push({
                            filename: filename,
                            path: webPath,
                            type: type,
                            size: stats.size,
                            date: stats.mtime
                        });
                    } catch (fileError) {
                        console.error(`Error processing file ${filename}:`, fileError);
                    }
                });
            } catch (dirError) {
                console.error(`Error reading directory ${dir}:`, dirError);
            }
        }

        // Process each directory
        processDirectory(uploadDirs.images, 'image');
        processDirectory(uploadDirs.videos, 'video');
        processDirectory(uploadDirs.pdfs, 'pdf');
        processDirectory(uploadDirs.others, 'other');

        // Group files by type
        const categorizedFiles = {
            images: fileList.filter(file => file.type === 'image'),
            videos: fileList.filter(file => file.type === 'video'),
            pdfs: fileList.filter(file => file.type === 'pdf'),
            others: fileList.filter(file => file.type === 'other')
        };

        console.log('Sending categorized files:', categorizedFiles);
        res.json(categorizedFiles);
    } catch (error) {
        console.error('Error in /files endpoint:', error);
        res.status(500).json({ 
            error: 'Error loading files',
            details: error.message
        });
    }
});

// Delete file
app.delete('/files/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        console.log('Delete request received for file:', filename);

        // Find the file in any of the upload directories
        let filePath = null;
        let foundDir = null;

        // Check each directory for the file
        for (const [type, dir] of Object.entries(uploadDirs)) {
            const testPath = path.join(dir, filename);
            if (fs.existsSync(testPath)) {
                filePath = testPath;
                foundDir = type;
                break;
            }
        }

        if (!filePath) {
            console.log('File not found:', filename);
            return res.status(404).json({ 
                error: 'File not found',
                details: `File "${filename}" does not exist in any upload directory`
            });
        }

        // Validate that the file path is within an upload directory
        const normalizedFilePath = path.normalize(filePath);
        const isInUploadDir = Object.values(uploadDirs).some(dir => 
            normalizedFilePath.startsWith(path.normalize(dir))
        );

        if (!isInUploadDir) {
            console.error('Invalid file path:', filePath);
            return res.status(400).json({ 
                error: 'Invalid file path',
                details: 'File path is outside of allowed upload directories'
            });
        }

        // Delete the file
        fs.unlinkSync(filePath);
        console.log('File deleted successfully:', filePath);

        // Return success response
        res.json({ 
            message: 'File deleted successfully',
            filename: filename,
            directory: foundDir
        });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ 
            error: 'Failed to delete file',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
    }
    res.status(500).json({ error: err.message });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 