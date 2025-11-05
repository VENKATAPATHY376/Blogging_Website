# Blogging Platform

A full-stack blogging platform built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🏗️ Project Structure

```
blogging-platform/
├── frontend/              # Frontend application (Vanilla JS + Bootstrap)
│   ├── index.html        # Main SPA application
│   ├── package.json      # Frontend dependencies
│   └── README.md         # Frontend documentation
├── backend/              # Backend API (Node.js + Express)
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   ├── src/              # Source code
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── middlewares/  # Custom middleware
│   └── README.md         # Backend documentation
└── README.md            # This file
```

## ✨ Features

### Frontend
- **Rich Text Editor**: Quill.js integration with image upload
- **Responsive Design**: Mobile-first Bootstrap 5 layout
- **User Authentication**: JWT-based login/register system
- **Interactive UI**: Like/dislike, commenting, tag filtering
- **Professional Design**: Warm amber color scheme

### Backend
- **RESTful API**: Express.js with proper routing
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer for image handling
- **Security**: CORS, input validation, protected routes

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/VENKATAPATHY376/Blogging_Website.git
cd Blogging_Website
```

2. **Setup Backend:**
```bash
cd backend
npm install

# Create .env file
echo "PORT=4000
MONGO_URI=mongodb://localhost:27017/blogdb
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:3000" > .env

# Start backend server
npm start
```

3. **Setup Frontend:**
```bash
cd ../frontend
npm install

# Start frontend server
npm start
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## 🧪 Testing

### Multi-User Testing
The project includes automated testing scripts:

```bash
# Install testing dependencies
npm install node-fetch

# Run automated multi-user tests
node test-script.js

# Check platform status
node user-status-checker.js
```

### Test Users
- **alice@example.com** / `Alice123!` (Writer)
- **bob@example.com** / `Bob456!` (Reviewer)
- **charlie@example.com** / `Charlie789!` (Admin)
- **diana@example.com** / `Diana012!` (Guest)
- **eve@example.com** / `Eve345!` (Mobile user)

## 📚 API Documentation

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create post (protected)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like post (protected)
- `POST /api/posts/:id/dislike` - Dislike post (protected)

### Comments
- `POST /api/comments` - Add comment (protected)

### Uploads
- `POST /api/uploads` - Upload image

### Tags
- `GET /api/posts/tags/all` - Get all available tags

## 🔒 Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Authentication**: 2-day token expiration
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Required field validation
- **XSS Protection**: DOMPurify sanitization
- **Protected Routes**: Authentication middleware

## 🎨 Design System

### Color Palette
- **Primary**: Amber (#d97706)
- **Secondary**: Stone/Warm grays
- **Background**: Clean whites and light grays
- **Text**: High contrast dark grays

### Features
- Mobile-responsive grid layout
- Smooth animations and transitions
- Professional typography with Inter font
- Subtle shadows and rounded corners

## 🚀 Deployment

### Frontend Deployment
- **Netlify**: Connect GitHub repo, auto-deploy
- **Vercel**: Import project, configure build settings
- **GitHub Pages**: Enable in repository settings

### Backend Deployment
- **Railway**: Connect GitHub, auto-deploy
- **Heroku**: Git-based deployment
- **DigitalOcean**: App Platform deployment

### Environment Variables for Production
```env
# Backend
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blogdb
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production

# Frontend (update in index.html)
API_BASE=https://your-backend-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Live Demo

- **Frontend**: [Demo Link](your-frontend-url)
- **Backend API**: [API Documentation](your-backend-url)

## 📞 Support

For support and questions:
- Open a GitHub issue
- Contact: [Your Email]

---

Built with ❤️ using modern web technologies