# File Upload System

A modern and user-friendly file upload system built with Node.js and Express. This system allows users to upload single or multiple files with descriptions and provides a clean interface for managing uploaded files.

## Features

- Single file upload with optional description
- Multiple files upload (up to 5 files at once)
- File type validation (JPEG, PNG, GIF, PDF)
- File size limit (5MB per file)
- Real-time upload status feedback
- List of uploaded files with preview links
- Responsive design for all devices
- Modern and intuitive user interface

## Technologies Used

- Node.js
- Express.js
- Multer (for file upload handling)
- Express Validator
- Modern CSS with Flexbox and Grid
- Vanilla JavaScript (ES6+)

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FileUpload
```

2. Install dependencies:
```bash
npm install
```

3. Create an `uploads` directory in the project root:
```bash
mkdir uploads
```

4. Create a `.env` file in the project root:
```env
PORT=3000
```

## Usage

1. Start the server:
```bash
npm start
```

2. For development with auto-reload:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

- `POST /upload` - Upload a single file
  - Accepts: `file` (file), `description` (optional text)
  - Returns: Upload status and file details

- `POST /upload-multiple` - Upload multiple files
  - Accepts: `files` (multiple files)
  - Returns: Upload status and file details

- `GET /files` - Get list of uploaded files
  - Returns: Array of file objects with names and paths

## File Restrictions

- Allowed file types: JPEG, PNG, GIF, PDF
- Maximum file size: 5MB per file
- Maximum files per upload: 5 files

## Security Features

- File type validation
- File size limits
- Secure file naming
- Input validation
- CORS enabled
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Express.js team for the amazing framework
- Multer for file upload handling
- The Node.js community for continuous support and resources 