## Features
### Authentication
- User registration with username and password
- Secure login system with password hashing using bcrypt
- Session-based authentication
- Automatic logout after session expiration
- Protection against unauthorized access
### Security
- Password hashing using bcrypt
- Session management with secure cookies
- SQL injection prevention using parameterized queries
- Input validation and sanitization
- Protection against common security vulnerabilities
### User Interface
- Clean and modern design
- Responsive layout that works on all devices
- Smooth transitions between login and registration forms
- Real-time feedback messages
- Profile page with logout functionality
### Database
- MySQL database integration
- Automatic database and table creation
- Efficient user data storage
- Session persistence using MySQL
## Prerequisites
Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- XAMPP (for MySQL)
- npm (Node Package Manager)
## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Login
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start XAMPP:
   - Open XAMPP Control Panel
   - Start Apache and MySQL services
   - Make sure both services are running (green)
4. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=3000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=login_system
     SESSION_SECRET=your-super-secret-key-change-this-in-production
     ```
## Running the Application
1. Start the development server:
   ```
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
## Project Structure
```
Login/
├── public/
│   ├── index.html      # Login and registration page
│   └── profile.html    # User profile page
├── server.js           # Main server file
├── package.json        # Project dependencies
└── .env               # Environment variables
```
## API Endpoints
### Authentication
- `POST /register` - Register a new user
  - Request body: `{ username: string, password: string }`
  - Response: Success/error message
- `POST /login` - Login user
  - Request body: `{ username: string, password: string }`
  - Response: Success/error message
- `POST /logout` - Logout user
  - Response: Success/error message
- `GET /check-auth` - Check authentication status
  - Response: `{ isAuthenticated: boolean }`
### Pages
- `GET /` - Login/Registration page
- `GET /profile` - User profile page (requires authentication)
## Database Schema
### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
## Security Features
1. **Password Security**
   - Passwords are hashed using bcrypt
   - Salt is automatically generated and stored with the hash
   - Prevents password exposure in case of database breach
2. **Session Management**
   - Secure session handling with express-session
   - Session data stored in MySQL
   - Session expiration after 24 hours
   - Secure cookie settings
3. **Database Security**
   - Parameterized queries to prevent SQL injection
   - Input validation before database operations
   - Unique username constraint
4. **Frontend Security**
   - Client-side input validation
   - Secure password handling
   - Protection against unauthorized access to profile page
## Error Handling
The application includes comprehensive error handling for:
- Database connection issues
- Invalid credentials
- Duplicate usernames
- Session errors
- Network errors
- Invalid input