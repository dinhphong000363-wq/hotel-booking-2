# 🏨 Hotel Booking System

A full-stack hotel booking platform built with MERN stack, featuring multi-role management, AI chatbot, and integrated payment systems.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-v19-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 👤 For Customers
- 🔍 **Smart Search**: Search hotels by location, dates, and number of guests
- 🏠 **Room Browsing**: View detailed room information with images and amenities
- 📅 **Easy Booking**: Simple booking process with date selection
- 💳 **Multiple Payment Options**: Stripe and MoMo payment integration
- ⭐ **Reviews & Ratings**: Read and write reviews for hotels
- ❤️ **Favorites**: Save favorite rooms for quick access
- 🤖 **AI Chatbot**: 24/7 customer support powered by Google Gemini AI
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🔐 **Social Login**: Sign in with Google or Facebook

### 🏢 For Hotel Owners
- 📊 **Dashboard**: Comprehensive analytics and statistics
- 🏨 **Hotel Management**: Register and manage hotel information
- 🛏️ **Room Management**: Add, edit, and delete rooms
- 📋 **Booking Management**: View and manage customer bookings
- 💰 **Revenue Tracking**: Monitor earnings and booking trends
- 🗺️ **Google Maps Integration**: Set hotel location on interactive map
- 📸 **Image Upload**: Upload multiple images via Cloudinary

### 👨‍💼 For Administrators
- 📈 **Admin Dashboard**: System-wide statistics and insights
- ✅ **Hotel Approval**: Review and approve new hotel registrations
- 👥 **User Management**: Manage all users and their permissions
- 🏨 **Hotel Management**: Oversee all hotels in the system
- 🔒 **Access Control**: Lock/unlock user accounts
- 📊 **Analytics**: View charts and reports with Recharts

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Recharts** - Data visualization
- **Leaflet** - Interactive maps
- **Lucide React** - Icon library
- **jsPDF** - PDF generation

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Passport.js** - OAuth authentication (Google, Facebook)
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage and management
- **Nodemailer** - Email service
- **Google Generative AI** - Chatbot integration

## 🏗️ System Architecture

```
hotel-booking/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin pages
│   │   │   ├── hotelsOwner/ # Owner pages
│   │   │   └── payment/   # Payment pages
│   │   ├── context/       # React Context
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
│
└── server/                # Backend Node.js application
    ├── config/            # Configuration files
    │   ├── db.js         # Database connection
    │   ├── cloudinary.js # Cloudinary setup
    │   ├── passport.js   # OAuth strategies
    │   └── nodemailer.js # Email configuration
    ├── controllers/       # Route controllers
    ├── models/           # Mongoose models
    ├── routes/           # API routes
    ├── middleware/       # Custom middleware
    └── uploads/          # Temporary file storage
```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account
- Google OAuth credentials (optional)
- Facebook OAuth credentials (optional)

### Clone Repository
```bash
git clone https://github.com/yourusername/hotel-booking.git
cd hotel-booking
```

### Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

## 🔐 Environment Variables

### Server (.env)
Create a `.env` file in the `server` directory:



### Client (.env)
Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 💻 Usage

### Development Mode

#### Start Backend Server
```bash
cd server
npm run server
```
Server will run on `http://localhost:5000`

#### Start Frontend
```bash
cd client
npm run dev
```
Client will run on `http://localhost:5173`

### Production Build

#### Build Frontend
```bash
cd client
npm run build
```

#### Start Production Server
```bash
cd server
npm start
```

## 📡 API Documentation

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/google            - Google OAuth
GET    /api/auth/facebook          - Facebook OAuth
POST   /api/auth/logout            - Logout user
```

### Users
```
GET    /api/user/profile           - Get user profile
PUT    /api/user/profile           - Update profile
GET    /api/user/bookings          - Get user bookings
```

### Hotels
```
GET    /api/hotels                 - Get all hotels
GET    /api/hotels/:id             - Get hotel by ID
POST   /api/hotels                 - Create hotel (Owner)
PUT    /api/hotels/:id             - Update hotel (Owner)
DELETE /api/hotels/:id             - Delete hotel (Admin)
```

### Rooms
```
GET    /api/rooms                  - Get all rooms
GET    /api/rooms/:id              - Get room by ID
POST   /api/rooms                  - Create room (Owner)
PUT    /api/rooms/:id              - Update room (Owner)
DELETE /api/rooms/:id              - Delete room (Owner)
GET    /api/rooms/discounted       - Get discounted rooms
```

### Bookings
```
GET    /api/bookings               - Get all bookings
GET    /api/bookings/:id           - Get booking by ID
POST   /api/bookings               - Create booking
PUT    /api/bookings/:id           - Update booking status
DELETE /api/bookings/:id           - Cancel booking
```

### Reviews
```
GET    /api/reviews/room/:roomId   - Get room reviews
POST   /api/reviews                - Create review
PUT    /api/reviews/:id            - Update review
DELETE /api/reviews/:id            - Delete review
```

### Favorites
```
GET    /api/favorites              - Get user favorites
POST   /api/favorites              - Add to favorites
DELETE /api/favorites/:id          - Remove from favorites
```

### Admin
```
GET    /api/admin/dashboard        - Get admin statistics
GET    /api/admin/hotels/pending   - Get pending hotels
PUT    /api/admin/hotels/:id/approve - Approve hotel
GET    /api/admin/users            - Get all users
PUT    /api/admin/users/:id/lock   - Lock/unlock user
```

### Owner
```
GET    /api/owner/dashboard        - Get owner statistics
GET    /api/owner/bookings         - Get hotel bookings
PUT    /api/owner/bookings/:id     - Update booking status
```

### Chatbot
```
POST   /api/chatbot/message        - Send message to AI chatbot
```

### Search
```
GET    /api/search?location=&checkIn=&checkOut=&guests=
```

## 🎯 Booking Flow

```
1. Customer Books Room
   ↓
   Status: Pending
   isPaid: false
   Actions: [Confirm] [Cancel]

2. Customer Pays (Optional)
   ↓
   Status: Pending
   isPaid: true
   Actions: [Confirm] [Cancel]

3. Owner Confirms
   ↓
   Status: Confirmed
   isPaid: true/false
   Actions: [Complete] [Cancel]

4. Customer Checks Out → Owner Completes
   ↓
   Status: Completed
   isPaid: true (required)
   Actions: None
```

## 📸 Screenshots

### Customer Interface
- Home page with search functionality
- Room details with Google Maps
- Booking process
- My bookings dashboard
- Favorites list

### Hotel Owner Interface
- Owner dashboard with statistics
- Hotel information management
- Room management (add/edit/delete)
- Booking management
- Revenue charts

### Admin Interface
- Admin dashboard with system stats
- Hotel approval queue
- User management
- Hotel management
- Analytics and reports

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes and API endpoints
- ✅ CORS configuration
- ✅ Session management
- ✅ Input validation
- ✅ XSS protection
- ✅ Rate limiting (recommended for production)

## 🚀 Deployment

### Deploy to Vercel (Frontend)
```bash
cd client
vercel --prod
```

### Deploy to Vercel (Backend)
```bash
cd server
vercel --prod
```

### Deploy to Heroku (Backend)
```bash
cd server
heroku create your-app-name
git push heroku main
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- React team for the amazing library
- MongoDB for the database
- Cloudinary for image hosting
- Google for Gemini AI and Maps API
- All open-source contributors

## 📞 Support

For support, email your.email@example.com or open an issue in the repository.

---

⭐ If you found this project helpful, please give it a star!

**Made with ❤️ using MERN Stack**
