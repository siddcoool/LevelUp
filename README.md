# 🚀 LevelUp - Adaptive Learning Platform

A sophisticated, scalable platform for adaptive learning that automatically adjusts difficulty based on student performance, featuring infinite levels and intelligent question selection.

## 🌟 What is LevelUp?

LevelUp is an intelligent learning platform that creates personalized educational experiences through:

- **Adaptive Difficulty**: Questions automatically adjust to your skill level
- **Infinite Progression**: Unlimited levels that grow with you
- **Smart Analytics**: Comprehensive progress tracking and insights
- **AI-Ready**: Built to integrate with AI question generation

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Homepage      │    │ • API Routes    │    │ • Users         │
│ • Test Session  │    │ • Services      │    │ • Questions     │
│ • Progress      │    │ • Models        │    │ • Progress      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Key Features

### 🧠 Adaptive Learning Engine
- **Dynamic Difficulty**: Questions selected within ±15% of target difficulty
- **Skill Estimation**: Continuous learning rate adjustment based on performance
- **Level Progression**: Automatic advancement at 60%+ accuracy
- **Coverage Balancing**: Ensures subject/topic diversity

### 📊 Comprehensive Analytics
- **Student Progress**: Per-scope tracking (branch/subject/topic)
- **Performance Metrics**: Accuracy, time, and difficulty analysis
- **Admin Dashboard**: Real-time insights and heatmaps
- **Daily Rollups**: Automated metrics calculation

### 🔒 Enterprise-Grade Security
- **JWT Authentication**: Secure token-based auth (Clerk ready)
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request sanitization
- **CORS Protection**: Controlled cross-origin access

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: App Router with server-side rendering
- **React 19**: Latest React features and hooks
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful, customizable icons

### Backend
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: Document database with Mongoose ODM
- **TypeScript**: Enterprise-grade type safety
- **JWT**: Secure authentication
- **Rate Limiting**: API protection

### Database Design
- **Optimized Indexes**: Strategic MongoDB indexing for performance
- **Schema Design**: Flexible, extensible data models
- **Performance**: Optimized for high-volume queries
- **Scalability**: Ready for horizontal scaling

## 📁 Project Structure

```
LevelUp/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth & validation
│   │   ├── types/          # TypeScript definitions
│   │   └── scripts/        # Database seeding
│   ├── package.json
│   └── README.md
├── frontend/                # Next.js web application
│   ├── app/                # App Router pages
│   ├── components/         # Reusable components
│   ├── package.json
│   └── README.md
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd LevelUp
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start MongoDB (if running locally)
mongod

# Seed the database
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔌 API Endpoints

### Core Learning API
```http
POST   /api/sessions              # Create test session
POST   /api/sessions/:id/submit   # Submit completed session
GET    /api/sessions/:id          # Get session details
GET    /api/sessions              # Get session history
```

### Taxonomy API
```http
GET    /api/taxonomy              # Get complete taxonomy
GET    /api/taxonomy/branches     # Get all branches
GET    /api/taxonomy/branches/:branchKey/subjects
GET    /api/taxonomy/branches/:branchKey/subjects/:subjectKey/topics
```

### Admin Analytics API
```http
GET    /api/admin/metrics/overview
GET    /api/admin/heatmap/topic-accuracy
GET    /api/admin/users/:id/responses
GET    /api/admin/sessions
GET    /api/admin/dashboard
```

## 🧠 How It Works

### 1. Session Creation
1. Student selects exam branch, subject, and/or topic
2. System calculates target difficulty based on current skill level
3. Intelligent algorithm selects 30 questions with coverage balancing
4. Session created with question snapshot (answers hidden)

### 2. Adaptive Question Selection
- **Difficulty Targeting**: Questions within ±0.15 of target
- **Coverage Balancing**: Ensures subject/topic diversity
- **Freshness Priority**: Prioritizes questions with fewer attempts
- **Smart Backfilling**: Falls back to easier/harder questions if needed

### 3. Progress Tracking
- **Skill Estimation**: Adaptive learning rate adjustment
- **Level Advancement**: Automatic progression at 60%+ accuracy
- **Streak Tracking**: Consecutive successful sessions
- **Performance History**: Rolling window of recent performance

### 4. Analytics & Insights
- **Daily Metrics**: Automated daily rollups
- **Branch Breakdown**: Performance comparison across exam types
- **Topic Heatmaps**: Visual accuracy patterns
- **User Drilldowns**: Individual student analysis

## 📊 Database Schema

### Core Collections
1. **Users**: Student and admin profiles
2. **Branches**: Exam categories (JEE, NEET, etc.)
3. **Subjects**: Academic subjects within branches
4. **Topics**: Specific topics within subjects
5. **Questions**: MCQ questions with difficulty ratings
6. **StudentProgress**: Per-scope learning progress
7. **TestSessions**: 30-question test sessions
8. **DailyMetrics**: Aggregated analytics

### Key Design Principles
- **Levels are Infinite**: Each level = 30 questions, computed dynamically
- **Skill-Based Difficulty**: Target difficulty adjusts based on performance
- **Scope Flexibility**: Progress tracked at branch, subject, or topic level
- **Question Reuse**: Questions can be used across students and sessions

## 🔮 Future Enhancements

### AI Integration
- **Question Generation**: OpenAI integration for dynamic content
- **Semantic Search**: Vector embeddings for question matching
- **Deduplication**: AI-powered question similarity detection
- **Personalization**: ML-based learning path optimization

### Advanced Features
- **Real-time Analytics**: WebSocket integration for live dashboards
- **Queue System**: Background job processing with BullMQ + Redis
- **Advanced IRT**: Item Response Theory for better difficulty estimation
- **Mobile App**: React Native or PWA for mobile users

### Enterprise Features
- **Multi-tenancy**: Support for multiple institutions
- **SSO Integration**: Enterprise authentication systems
- **Advanced Reporting**: Custom report builder
- **API Rate Limiting**: Tiered access control

## 🧪 Testing

### Backend Testing
- **Unit Tests**: Service and model testing
- **Integration Tests**: API endpoint testing
- **Performance Tests**: Database query optimization
- **Security Tests**: Authentication and validation

### Frontend Testing
- **Component Tests**: Individual component testing
- **Integration Tests**: User flow testing
- **E2E Tests**: Complete user journey testing
- **Performance Tests**: Core Web Vitals optimization

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```

### Environment Variables
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/levelup
PORT=3001
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contributing

### Development Guidelines
1. **Code Quality**: Follow TypeScript best practices
2. **Testing**: Maintain comprehensive test coverage
3. **Documentation**: Update READMEs and API docs
4. **Performance**: Optimize for speed and scalability
5. **Security**: Follow security best practices

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
1. **Documentation**: Check the README files in each directory
2. **Issues**: Create GitHub issues for bugs or feature requests
3. **Discussions**: Use GitHub Discussions for questions
4. **Wiki**: Check the project wiki for detailed guides

### Common Issues
- **MongoDB Connection**: Ensure MongoDB is running and accessible
- **Port Conflicts**: Check if ports 3000/3001 are available
- **Dependencies**: Run `npm install` in both directories
- **Environment**: Verify `.env` file configuration

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Express.js Team**: For the robust Node.js framework
- **MongoDB Team**: For the flexible document database
- **Tailwind CSS**: For the utility-first CSS framework

---

**Built with ❤️ for the future of education**
# LevelUp
