<<<<<<< HEAD
# Blogging Platform Backend

A robust Node.js/Express backend API for a modern blogging platform with user authentication, post management, and file uploads.

## ✨ Features

- **User Authentication**: JWT-based registration and login system
- **Post Management**: CRUD operations for blog posts with rich content
- **File Uploads**: Image upload functionality with Multer
- **User Interactions**: Like/dislike system and commenting
- **Tag System**: Categorization and filtering by tags
- **Security**: Password hashing, JWT tokens, CORS protection
- **Database**: MongoDB with Mongoose ODM
=======
# Blogging Platform Frontend

A modern, responsive blogging platform frontend built with vanilla JavaScript and Bootstrap.

## ✨ Features

- **Rich Text Editor**: Quill.js integration with image upload support
- **Responsive Design**: Mobile-first approach with 3-column grid layout
- **User Authentication**: JWT-based login/register system
- **Interactive UI**: Like/dislike functionality, commenting system
- **Tag Filtering**: Browse and filter posts by topics
- **Professional Design**: Warm amber color scheme, editorial aesthetic
- **Real-time Search**: Dynamic post filtering and search
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
<<<<<<< HEAD
- MongoDB (local or MongoDB Atlas)
- npm or yarn
=======
- Backend server running (see backend repository)
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc

### Installation

1. Clone the repository:
```bash
<<<<<<< HEAD
git clone https://github.com/YOUR_USERNAME/blogging-platform-backend.git
cd blogging-platform-backend
=======
git clone https://github.com/YOUR_USERNAME/blogging-platform-frontend.git
cd blogging-platform-frontend
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc
```

2. Install dependencies:
```bash
npm install
```

<<<<<<< HEAD
3. Environment Setup:
Create a `.env` file in the root directory:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/blogdb
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:3000
```

4. Start MongoDB (if using local installation):
```bash
mongod
```

5. Start the development server:
```bash
npm run dev  # or npm start
```

The server will start on http://localhost:4000

## 🛠️ Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Cross-Origin**: CORS
- **Environment**: dotenv
- **Development**: nodemon

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Post Endpoints

#### Get All Posts
```http
GET /api/posts?page=1&limit=10&q=search_term
```

#### Get Single Post
```http
GET /api/posts/:id
```

#### Create Post (Protected)
```http
POST /api/posts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My Blog Post",
  "content": "<p>Rich HTML content</p>",
  "tags": ["javascript", "web-development"]
}
```

#### Like/Dislike Post (Protected)
```http
POST /api/posts/:id/like
Authorization: Bearer <jwt_token>

POST /api/posts/:id/dislike
Authorization: Bearer <jwt_token>
```

### Comment Endpoints

#### Add Comment (Protected)
```http
POST /api/comments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "post": "post_id_here",
  "content": "This is a great post!"
}
```

### Upload Endpoints

#### Upload Image
```http
POST /api/uploads
Content-Type: multipart/form-data

file: [image_file]
```

### Tag Endpoints

#### Get All Tags
```http
GET /api/posts/tags/all
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Post Model
```javascript
{
  title: String (required),
  content: String (required),
  author: ObjectId (ref: User),
  tags: [String],
  image: String,
  likes: [ObjectId] (ref: User),
  dislikes: [ObjectId] (ref: User),
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model
```javascript
{
  post: ObjectId (ref: Post),
  author: ObjectId (ref: User),
  content: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### Authentication
- JWT tokens with 2-day expiration
- Password hashing with bcryptjs (10 rounds)
- Protected routes with middleware

### Validation
- Input validation for required fields
- Duplicate username/email prevention
- XSS protection (client-side with DOMPurify)

### CORS
- Configurable allowed origins
- Secure cross-origin requests
=======
3. Update API configuration:
   - Open `index.html`
   - Update `API_BASE` constant to point to your backend server
   ```javascript
   const API_BASE = 'http://localhost:4000/api'; // Update this URL
   ```

4. Start the development server:
```bash
npm start
```

5. Open http://localhost:3000 in your browser

## 🛠️ Technologies Used

- **Frontend Framework**: Vanilla JavaScript (ES6+)
- **Styling**: Bootstrap 5.3.2, Custom CSS
- **Rich Text Editor**: Quill.js 1.3.6
- **Icons**: Bootstrap Icons
- **Security**: DOMPurify for XSS protection
- **Development Server**: lite-server

## 📱 Features Overview

### Authentication
- User registration and login
- JWT token management
- Protected routes and actions

### Content Management
- Create posts with rich text editor
- Image upload functionality
- Tag system for post categorization
- Draft saving capability

### User Interactions
- Like/dislike posts
- Comment system
- User profiles with avatars
- Social engagement metrics

### UI/UX
- Professional amber and stone color palette
- Smooth animations and transitions
- Mobile-responsive design
- Search and filtering capabilities

## 🎨 Design System

### Color Palette
- **Primary**: Amber (#d97706)
- **Secondary**: Stone/Warm grays
- **Background**: Clean whites and light grays
- **Accents**: Subtle shadows and gradients

### Typography
- **Primary Font**: Inter
- **Weight**: 400-700 range
- **Responsive scaling**: Mobile-first approach
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc

## 📂 Project Structure

```
<<<<<<< HEAD
backend/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not in repo)
├── config/
│   └── db.js             # Database connection
├── src/
│   ├── controllers/      # Route handlers
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   └── uploadController.js
│   ├── models/           # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── postModel.js
│   │   └── commentModel.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   └── uploadRoutes.js
│   └── middlewares/      # Custom middleware
│       └── authMiddleware.js
├── uploads/              # File upload directory
└── README.md            # This file
=======
frontend/
├── index.html          # Main SPA application
├── package.json        # Dependencies and scripts
├── assets/            # Static assets (if any)
├── js/               # Additional JavaScript modules
└── README.md         # This file
```

## 🔧 Configuration

### API Integration
The frontend communicates with the backend through REST API calls. Key endpoints:

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/posts` - Fetch posts with pagination
- `POST /api/posts` - Create new post (protected)
- `POST /api/uploads` - Image upload
- `GET /api/posts/tags/all` - Get all available tags

### Environment Setup
Update the following constants in `index.html`:
```javascript
const API_BASE = 'your-backend-url/api';
const API_ORIGIN = 'your-backend-url';
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc
```

## 🧪 Testing

### Manual Testing
<<<<<<< HEAD
1. Use Postman or similar tool to test API endpoints
2. Register users and obtain JWT tokens
3. Test protected routes with Authorization header
4. Verify file upload functionality

### Automated Testing
Run the provided test script to populate with sample data:
```bash
node ../test-script.js
```

## 🚀 Deployment

### Environment Variables for Production
```env
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
JWT_SECRET=your_production_jwt_secret_here
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Railway**: Modern platform with automatic deployments
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2, ECS, or Lambda
- **Render**: Simple deployment from GitHub

### Production Checklist
- [ ] Use MongoDB Atlas for database
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS for production domain
- [ ] Set up file upload to cloud storage (AWS S3, Cloudinary)
- [ ] Add rate limiting
- [ ] Set up logging and monitoring
- [ ] Enable HTTPS
- [ ] Add input validation middleware

## 🔧 Configuration

### Database Connection
- Local MongoDB: `mongodb://localhost:27017/blogdb`
- MongoDB Atlas: Use connection string from Atlas dashboard

### File Uploads
- Development: Local `/uploads` directory
- Production: Consider cloud storage (AWS S3, Cloudinary)
=======
1. Register a new user account
2. Login with credentials
3. Create a post with images and tags
4. Test like/dislike functionality
5. Add comments to posts
6. Test search and tag filtering

### Multi-User Testing
Use the provided test users for multi-user scenarios:
- alice@example.com / Alice123!
- bob@example.com / Bob456!
- charlie@example.com / Charlie789!

## 📦 Deployment

### Development
```bash
npm start  # Starts lite-server on port 3000
```

### Production
1. Update API URLs to production backend
2. Build and deploy static files to your hosting provider:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

### Environment Variables
For production, update:
- API_BASE to production backend URL
- Ensure CORS is configured on backend for your domain
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

<<<<<<< HEAD
### Development Guidelines
- Follow REST API conventions
- Add proper error handling
- Include input validation
- Write clear commit messages
- Update documentation

=======
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc
## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Repositories

<<<<<<< HEAD
- [Frontend Repository](https://github.com/YOUR_USERNAME/blogging-platform-frontend) - React/Vue.js frontend
- [Documentation](link-to-docs) - Full API documentation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - Verify network connectivity for Atlas

2. **JWT Token Issues**
   - Check JWT_SECRET is set
   - Verify token format in Authorization header
   - Check token expiration

3. **File Upload Problems**
   - Ensure uploads directory exists
   - Check file permissions
   - Verify multer configuration

4. **CORS Errors**
   - Update CORS_ORIGIN in .env
   - Check frontend URL matches exactly
=======
- [Backend Repository](https://github.com/YOUR_USERNAME/blogging-platform-backend) - Node.js/Express backend
- [Documentation](link-to-docs) - Full API documentation

## 🐛 Issues

Found a bug? Please open an issue on GitHub with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc

## 📞 Support

For support and questions:
- Open a GitHub issue
- Contact: your-email@example.com

---

<<<<<<< HEAD
Built with ❤️ using Node.js and Express
=======
Built with ❤️ using modern web technologies
>>>>>>> a146c3ec4e9aa5a3ed5cd196f293ce5cfc1d9dfc
