# LevelUp Backend API

A robust, scalable backend for the LevelUp adaptive learning platform built with Express.js, MongoDB, and TypeScript.

## 🏗️ Architecture

- **Express.js**: RESTful API server with middleware for security, rate limiting, and compression
- **MongoDB + Mongoose**: Document database with optimized schemas and indexing
- **TypeScript**: Full type safety and modern JavaScript features
- **JWT Authentication**: Secure token-based authentication (ready for Clerk integration)
- **Modular Design**: Clean separation of concerns with services, models, and routes

## 🚀 Features

### Core Learning System
- **Adaptive Question Selection**: Intelligent algorithm that balances difficulty, coverage, and student history
- **Level Progression**: Infinite levels based on 30-question sessions with skill-based advancement
- **Progress Tracking**: Per-scope student progress with skill estimation and streak tracking
- **Question Management**: Support for both database and AI-generated questions

### API Endpoints
- **Sessions**: Create, submit, and retrieve test sessions
- **Taxonomy**: Get branches, subjects, and topics hierarchy
- **Admin Analytics**: Comprehensive dashboard with metrics, heatmaps, and drill-downs

### Performance & Scalability
- **Optimized Indexing**: Strategic MongoDB indexes for fast queries
- **Rate Limiting**: API protection against abuse
- **Compression**: Response compression for better performance
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/levelup
   
   # Server Configuration
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   
   # JWT Secret (for development)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Clerk Configuration (when you integrate Clerk)
   CLERK_SECRET_KEY=your-clerk-secret-key
   CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed the database with initial data
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Collections Overview

1. **Users**: Student and admin profiles (Clerk integration ready)
2. **Branches**: Exam categories (JEE, NEET, etc.)
3. **Subjects**: Academic subjects within branches
4. **Topics**: Specific topics within subjects
5. **Questions**: MCQ questions with difficulty ratings and performance stats
6. **StudentProgress**: Per-scope learning progress and skill estimates
7. **TestSessions**: 30-question test sessions with responses
8. **DailyMetrics**: Aggregated analytics for admin dashboard

### Key Design Principles

- **Levels are Infinite**: Each level = 30 questions, computed dynamically
- **Skill-Based Difficulty**: Target difficulty adjusts based on student performance
- **Scope Flexibility**: Progress tracked at branch, subject, or topic level
- **Question Reuse**: Questions can be used across students and sessions
- **Performance Tracking**: Comprehensive stats for adaptive selection

## 🔌 API Endpoints

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Sessions API

#### Create Test Session
```http
POST /api/sessions
Content-Type: application/json

{
  "mode": "all|subject|topic",
  "branchId": "branch_id",
  "subjectId": "subject_id", // required for subject/topic mode
  "topicId": "topic_id"      // required for topic mode
}
```

#### Submit Session
```http
POST /api/sessions/:id/submit
Content-Type: application/json

{
  "responses": [
    {
      "questionId": "question_id",
      "selectedIndex": 0,
      "timeSec": 45
    }
  ]
}
```

#### Get Session
```http
GET /api/sessions/:id?answers=true
```

#### Get Session History
```http
GET /api/sessions?branchId=branch_id&limit=10&offset=0
```

### Taxonomy API

#### Get Complete Taxonomy
```http
GET /api/taxonomy?branch=JEE
```

#### Get Branches
```http
GET /api/taxonomy/branches
```

#### Get Subjects for Branch
```http
GET /api/taxonomy/branches/JEE/subjects
```

#### Get Topics for Subject
```http
GET /api/taxonomy/branches/JEE/subjects/physics/topics
```

### Admin API

#### Overview Metrics
```http
GET /api/admin/metrics/overview?from=2024-01-01&to=2024-01-31
```

#### Topic Accuracy Heatmap
```http
GET /api/admin/heatmap/topic-accuracy?branchId=branch_id&from=2024-01-01&to=2024-01-31
```

#### User Drilldown
```http
GET /api/admin/users/:id/responses?from=2024-01-01&to=2024-01-31
```

#### Sessions with Filters
```http
GET /api/admin/sessions?branchId=branch_id&subjectId=subject_id&from=2024-01-01&to=2024-01-31
```

#### Dashboard Summary
```http
GET /api/admin/dashboard
```

## 🧠 Question Selection Algorithm

The system uses a sophisticated algorithm to select 30 questions per session:

1. **Difficulty Targeting**: Questions selected within ±0.15 of target difficulty
2. **Coverage Balancing**: Ensures subject/topic diversity based on mode
3. **Freshness Priority**: Prioritizes questions with fewer attempts
4. **Smart Backfilling**: Falls back to easier/harder questions if needed
5. **Repeat Prevention**: Avoids recently seen questions (rolling 300-question window)

## 📊 Analytics & Metrics

### Student Progress Tracking
- **Skill Estimation**: Adaptive learning rate adjustment
- **Level Progression**: Automatic level advancement at 60%+ accuracy
- **Streak Tracking**: Consecutive successful sessions
- **Performance History**: Rolling window of recent performance

### Admin Dashboard
- **Daily Rollups**: Automated daily metrics calculation
- **Branch Breakdown**: Performance comparison across exam types
- **Topic Heatmaps**: Visual accuracy patterns across subjects
- **User Drilldowns**: Individual student performance analysis

## 🔒 Security Features

- **Helmet.js**: Security headers and protection
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: Safe error responses

## 🚀 Development

### Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run seed         # Seed database with sample data
```

### Project Structure
```
src/
├── models/          # Mongoose schemas and models
├── services/        # Business logic services
├── routes/          # Express route handlers
├── middleware/      # Authentication and validation
├── types/           # TypeScript type definitions
├── scripts/         # Database seeding and utilities
└── index.ts         # Main server entry point
```

## 🔮 Future Enhancements

- **AI Question Generation**: OpenAI integration for dynamic question creation
- **Vector Search**: Semantic question matching and deduplication
- **Queue System**: Background job processing with BullMQ + Redis
- **Real-time Analytics**: WebSocket integration for live dashboards
- **Advanced IRT**: Item Response Theory for better difficulty estimation

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain comprehensive error handling
3. Add appropriate indexes for new query patterns
4. Update API documentation for new endpoints
5. Include tests for new functionality

## 📝 License

ISC License - see package.json for details
