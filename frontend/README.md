# LevelUp Frontend

A modern, responsive frontend for the LevelUp adaptive learning platform built with Next.js 15, React 19, and Tailwind CSS.

## 🚀 Features

### Core Components
- **Homepage**: Clean, intuitive interface for starting learning sessions
- **Test Session**: Interactive test-taking experience with real-time progress tracking
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Modern Stack**: Built with the latest React and Next.js features

### User Experience
- **Session Configuration**: Easy selection of exam branch, subject, and topic
- **Progress Tracking**: Visual progress indicators and question navigation
- **Real-time Updates**: Live progress updates and session management
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Next.js 15**: App Router with server-side rendering
- **React 19**: Latest React features and hooks
- **TypeScript**: Full type safety and modern JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Axios**: HTTP client for API communication

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

## 🛠️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
app/
├── page.tsx              # Main homepage
├── test-session/         # Test session page
│   └── page.tsx
├── layout.tsx            # Root layout
├── globals.css           # Global styles
└── favicon.ico           # App icon

components/                # Reusable components (future)
hooks/                    # Custom React hooks (future)
lib/                      # Utility functions (future)
types/                    # TypeScript definitions (future)
```

## 🎨 Component Overview

### Homepage (`app/page.tsx`)
The main landing page featuring:
- **Hero Section**: Clear value proposition and call-to-action
- **Feature Grid**: Three key benefits of the platform
- **Session Configuration**: Interactive form for starting tests
- **How It Works**: Step-by-step explanation of the learning process

**Key Features:**
- Dynamic taxonomy loading from backend
- Cascading dropdowns (Branch → Subject → Topic)
- Real-time session configuration display
- Responsive grid layouts

### Test Session (`app/test-session/page.tsx`)
The interactive test-taking interface featuring:
- **Question Display**: Clean, readable question presentation
- **Option Selection**: Radio button interface with visual feedback
- **Progress Tracking**: Real-time progress bar and question navigation
- **Time Tracking**: Per-question time measurement
- **Navigation**: Previous/next and direct question jumping

**Key Features:**
- Real-time progress updates
- Question navigation grid
- Time tracking per question
- Session submission with validation
- Responsive sidebar layout

## 🔌 API Integration

### Backend Communication
The frontend communicates with the backend API at `http://localhost:3001`:

- **Taxonomy API**: Fetch branches, subjects, and topics
- **Session API**: Create, retrieve, and submit test sessions
- **Authentication**: JWT-based auth (ready for Clerk integration)

### API Endpoints Used
```typescript
// Get taxonomy for a branch
GET /api/taxonomy?branch=JEE

// Create new test session
POST /api/sessions

// Get test session
GET /api/sessions/:id

// Submit completed session
POST /api/sessions/:id/submit
```

## 🎯 State Management

### Local State
- **Session Configuration**: Branch, subject, and topic selection
- **Test Progress**: Current question, responses, and time tracking
- **UI State**: Loading states, form validation, and user feedback

### Data Flow
1. **Taxonomy Loading**: Fetch and cache branch/subject/topic hierarchy
2. **Session Creation**: Send configuration to backend, receive session data
3. **Test Taking**: Track responses and time locally
4. **Session Submission**: Send completed responses to backend

## 🎨 Styling & Design

### Design System
- **Color Palette**: Blue and purple gradients with neutral grays
- **Typography**: Clear hierarchy with readable fonts
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable UI patterns with consistent styling

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Tailwind's responsive utilities
- **Grid Layouts**: Adaptive grid systems
- **Touch Friendly**: Appropriate sizing for mobile interaction

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Development Workflow
1. **Component Development**: Create components in the `app` directory
2. **Styling**: Use Tailwind CSS classes for consistent design
3. **State Management**: Use React hooks for local state
4. **API Integration**: Fetch data from backend endpoints
5. **Testing**: Test components and user flows

## 🔮 Future Enhancements

### Planned Features
- **User Authentication**: Clerk integration for secure login
- **Progress Dashboard**: Visual progress tracking and analytics
- **Question Review**: Detailed explanations and learning resources
- **Performance Analytics**: Individual and comparative statistics
- **Mobile App**: React Native or PWA for mobile users

### Technical Improvements
- **State Management**: Redux Toolkit or Zustand for complex state
- **Caching**: React Query for API data caching
- **Testing**: Jest and React Testing Library
- **Performance**: Code splitting and lazy loading
- **SEO**: Meta tags and structured data

## 🧪 Testing

### Component Testing
- **Unit Tests**: Test individual component functionality
- **Integration Tests**: Test component interactions
- **User Flow Tests**: Test complete user journeys

### Testing Tools
- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for testing

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality works without JavaScript

## 🔒 Security Considerations

- **Input Validation**: Client-side validation for user inputs
- **API Security**: Secure communication with backend
- **Authentication**: JWT token management
- **Data Privacy**: Secure handling of user responses

## 🤝 Contributing

### Development Guidelines
1. **Component Structure**: Use functional components with hooks
2. **TypeScript**: Maintain strict type safety
3. **Styling**: Use Tailwind CSS classes consistently
4. **Accessibility**: Ensure keyboard navigation and screen reader support
5. **Performance**: Optimize for Core Web Vitals

### Code Quality
- **ESLint**: Follow project linting rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Component Props**: Well-defined interfaces

## 📝 License

ISC License - see package.json for details

## 🆘 Support

For development questions or issues:
1. Check the backend API is running
2. Verify environment configuration
3. Check browser console for errors
4. Review API endpoint responses
