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

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Backend server running (see backend repository)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/blogging-platform-frontend.git
cd blogging-platform-frontend
```

2. Install dependencies:
```bash
npm install
```

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

## 📂 Project Structure

```
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
```

## 🧪 Testing

### Manual Testing
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Repositories

- [Backend Repository](https://github.com/YOUR_USERNAME/blogging-platform-backend) - Node.js/Express backend
- [Documentation](link-to-docs) - Full API documentation

## 🐛 Issues

Found a bug? Please open an issue on GitHub with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information

## 📞 Support

For support and questions:
- Open a GitHub issue
- Contact: your-email@example.com

---

Built with ❤️ using modern web technologies