# WasteSaver 🍎♻️

A clean, impactful food-rescue app that connects users with surplus food deals called "Rescue Bags" available nearby. Help reduce food waste while saving money and the planet!

## 🌟 Features

### Core Functionality
- **Discover Feed**: Map and list view of nearby businesses offering Rescue Bags
- **Smart Filtering**: Distance, price, category, and dietary preference filters
- **Rescue Bag Details**: Price comparison, pickup time, allergen info, and "surprise bag" narrative
- **Reservation System**: Reserve and pay for Rescue Bags within the app
- **Pickup Management**: In-app pickup confirmation with staff verification
- **Favorites & Alerts**: Heart favorite businesses and receive alerts for new bags
- **Impact Tracking**: Monitor orders, money saved, CO₂ emissions, and water saved
- **Rescue Parcels**: Support for larger food packages with delivery options

### User Experience
- **Onboarding**: Location access and user registration (email, social login)
- **Payment Integration**: Credit card and digital wallet support
- **Push Notifications**: Real-time alerts for favorites and pickup reminders
- **Environmental Impact**: Visual representation of positive environmental contributions
- **Achievement System**: Gamified milestones and badges for sustainability efforts

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Framework**: Express.js with RESTful API design
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **Payment**: Stripe/Razorpay integration
- **Email**: Automated notifications via Nodemailer
- **Security**: Helmet, CORS, rate limiting, input validation
- **Testing**: Jest + Supertest with MongoDB Memory Server

### Mobile App (React Native)
- **Framework**: React Native 0.73.6 with React 18.2
- **Navigation**: React Navigation with stack and tab navigators
- **Maps**: React Native Maps for location-based discovery
- **State Management**: React Context API for global state
- **UI Components**: Custom components with consistent theming
- **Testing**: Jest + React Native Testing Library
- **Analytics**: Mixpanel integration for user behavior tracking

## 📱 Screens & Navigation

### Authentication Flow
1. **Onboarding**: App introduction and location permission
2. **Signup/Login**: User registration and authentication
3. **Location Setup**: GPS coordinates and dietary preferences

### Main App Flow
1. **Home**: Dashboard with recent activity and quick actions
2. **Discover**: Map and list view of available Rescue Bags
3. **Favorites**: Saved businesses and new bag alerts
4. **Profile**: User stats, achievements, and preferences

### Transaction Flow
1. **Rescue Bag Detail**: View bag information and availability
2. **Reservation**: Select pickup time and payment method
3. **Confirmation**: Order details and pickup instructions
4. **Pickup**: In-app confirmation and verification

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+
- React Native development environment
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Backend Setup
```bash
# Install dependencies
cd server
npm install

# Environment configuration
cp env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Run tests
npm test
```

### Mobile App Setup
```bash
# Install dependencies
cd mobile
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test
```

### Root Project Commands
```bash
# Install all dependencies
npm run install:all

# Start both backend and mobile
npm run dev

# Run all tests
npm run test

# Build mobile app
npm run build
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/waste-saver
MONGODB_TEST_URI=mongodb://localhost:27017/waste-saver-test

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Mobile (.env)
```env
# API Configuration
API_BASE_URL=http://localhost:5000/api
API_TIMEOUT=10000

# Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Analytics
MIXPANEL_TOKEN=your_mixpanel_token

# Push Notifications
FCM_SERVER_KEY=your_fcm_server_key
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/logout` - User logout

### Rescue Bags
- `GET /api/rescue-bags` - Discover rescue bags with filters
- `GET /api/rescue-bags/:id` - Get specific rescue bag details

### Reservations
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations` - Get user reservations
- `GET /api/reservations/:id` - Get specific reservation
- `PUT /api/reservations/:id/cancel` - Cancel reservation

### Pickup Management
- `POST /api/pickup/confirm` - Confirm pickup
- `GET /api/pickup/active` - Get active pickups
- `GET /api/pickup/:id/instructions` - Get pickup instructions

### Favorites & Alerts
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:businessId` - Remove from favorites
- `GET /api/favorites/alerts` - Get alerts from favorites

### Profile & Impact
- `GET /api/profile/impact` - Get environmental impact stats
- `GET /api/profile/history` - Get order history
- `PUT /api/profile/preferences` - Update preferences
- `GET /api/profile/achievements` - Get user achievements

## 🧪 Testing

### Backend Testing
```bash
cd server

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Mobile Testing
```bash
cd mobile

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **Backend**: Unit tests for models, integration tests for API endpoints
- **Mobile**: Component tests, navigation tests, API service tests
- **Database**: MongoDB Memory Server for isolated testing

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform (Heroku, AWS, etc.)
3. Set up MongoDB Atlas or production MongoDB instance
4. Configure SSL certificates and domain

### Mobile App Deployment
1. **iOS**: Archive and upload to App Store Connect
2. **Android**: Generate signed APK and upload to Google Play Console
3. Configure production API endpoints
4. Set up production analytics and crash reporting

## 📈 Performance & Monitoring

### Backend Monitoring
- Request/response logging
- Database query optimization
- Memory and CPU usage monitoring
- Error tracking and alerting

### Mobile App Monitoring
- Crash reporting via Firebase Crashlytics
- Performance monitoring
- User analytics via Mixpanel
- Network request monitoring

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting and DDoS protection
- CORS configuration
- Helmet security headers
- Encrypted storage for sensitive data

## 🌱 Environmental Impact

WasteSaver helps users:
- **Reduce Food Waste**: Connect with surplus food before it's discarded
- **Save Money**: Access quality food at discounted prices
- **Lower Carbon Footprint**: Reduce CO₂ emissions from food production
- **Conserve Water**: Save water resources used in food production
- **Support Local Businesses**: Help businesses reduce waste and increase revenue

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow React Native best practices
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Too Good To Go](https://toogoodtogo.com)
- Built with modern web and mobile technologies
- Designed for sustainability and user experience
- Community-driven development approach

## 📞 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: support@wastesaver.app

---

**Made with ❤️ for a sustainable future**
# wasteSaver
