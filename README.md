# Node.js Recipes Collection

A collection of practical Node.js recipes and examples demonstrating various web development concepts and best practices.

## Table of Contents

1. [Login System](#login-system)
2. [Recipes List](#recipes-list)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Contributing](#contributing)

## Login System

A secure and modern login system built with Node.js, Express, and MySQL. Features include user registration, authentication, session management, and a responsive UI.

### Features
- User registration and login
- Secure password hashing
- Session-based authentication
- MySQL database integration
- Modern, responsive UI
- Form validation
- Error handling
- Profile page
- Secure logout

### Technologies Used
- Node.js
- Express.js
- MySQL
- Express-session
- bcrypt
- dotenv

### Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file in the Login directory with:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=login_system
   SESSION_SECRET=your_secret_key
   ```

3. Set up MySQL:
   - Install MySQL (XAMPP recommended)
   - Create a database named `login_system`
   - The server will automatically create the users table

4. Start the server:
   ```bash
   cd Login
   npm start
   ```

5. Access the application:
   - Open `http://localhost:3000` in your browser
   - Register a new account
   - Login with your credentials

## Recipes List

1. **Login System**
   - User authentication
   - Session management
   - Database integration
   - Form handling
   - Security best practices

2. **File Upload System**
   - File upload handling
   - File type validation
   - Storage management
   - Progress tracking

3. **REST API**
   - API endpoints
   - CRUD operations
   - Request validation
   - Response formatting

4. **WebSocket Chat**
   - Real-time communication
   - Socket.io integration
   - Chat room management
   - User presence

5. **Email Service**
   - Email sending
   - Template rendering
   - Attachment handling
   - Queue management

6. **Payment Integration**
   - Payment processing
   - Order management
   - Transaction handling
   - Receipt generation

7. **Authentication with JWT**
   - Token-based auth
   - Refresh tokens
   - Role-based access
   - Token validation

8. **Image Processing**
   - Image upload
   - Resizing
   - Format conversion
   - Optimization

9. **PDF Generation**
   - PDF creation
   - Template rendering
   - Data formatting
   - File download

10. **Caching System**
    - Redis integration
    - Cache management
    - Performance optimization
    - Cache invalidation

11. **Search Engine**
    - Full-text search
    - Filtering
    - Pagination
    - Result highlighting

12. **Task Queue**
    - Job processing
    - Queue management
    - Worker implementation
    - Error handling

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/NodeJs-Recipes.git
   cd NodeJs-Recipes
   ```

2. Install dependencies for each recipe:
   ```bash
   cd recipe-name
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables as needed

4. Start the server:
   ```bash
   npm start
   ```

## Project Structure

```
NodeJs-Recipes/
├── Login/
│   ├── public/
│   │   ├── index.html
│   │   ├── profile.html
│   │   └── styles.css
│   ├── server.js
│   └── package.json
├── FileUpload/
│   ├── public/
│   │   ├── index.html
│   │   └── styles.css
│   ├── uploads/
│   │   ├── images/
│   │   ├── videos/
│   │   ├── pdfs/
│   │   └── others/
│   ├── server.js
│   ├── package.json
│   └── .env
├── RESTAPI/
├── WebSocketChat/
├── EmailService/
├── PaymentIntegration/
├── JWTAuth/
├── ImageProcessing/
├── PDFGenerator/
├── CachingSystem/
├── SearchEngine/
└── TaskQueue/
```
