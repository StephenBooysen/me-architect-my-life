# Architect My Life

A comprehensive desktop application for personal goal management, habit tracking, and self-reflection. Built with Electron, Express.js, and SQLite using modern web technologies.

## Features

### 🎯 Goal Management
- **Hierarchical System**: Annual → Monthly → Weekly goal breakdown
- **Progress Tracking**: Visual progress bars and completion percentages  
- **Focus Areas**: Organize goals by life areas (Health, Career, Relationships, etc.)
- **Priority Management**: High, medium, low priority levels
- **Success Criteria**: Define clear success metrics for each goal

### ✅ Habit Tracking
- **Daily Habits**: Track daily, weekday, weekend, or custom frequency habits
- **Streak Counters**: Visual streak tracking with milestone celebrations
- **Habit Categories**: Organize habits by category
- **Quick Toggle**: One-click habit completion from dashboard

### 📝 Reflection & Journaling
- **Morning Notes**: Start your day with intention setting and priorities
- **Evening Reflection**: End your day with gratitude and learning
- **Default Templates**: Built-in templates for morning and evening reflection
- **Progress Insights**: Track mood, energy levels, and daily ratings

### 💭 How You Feel (Mood Tracking)
- **Daily Mood Rating**: Simple 1-10 scale mood tracking
- **Monthly Analytics**: Visual trends and patterns in your emotional well-being
- **Calendar View**: Historical mood data at a glance
- **Correlation Insights**: Connect mood patterns with habits and goals

### 📚 Wisdom Library
- **Quote Collection**: Store inspirational quotes and wisdom
- **Source Attribution**: Track authors and sources
- **Category Organization**: Organize by themes and topics
- **Personal Notes**: Add your own insights to each piece of wisdom

### 🤖 AI Guide (Claude Integration)
- **Chat Interface**: Conversational AI assistance with session management
- **Goal Setting Help**: Break down complex goals into actionable steps
- **Progress Analysis**: AI-powered insights on your progress patterns
- **Motivational Support**: Personalized encouragement and advice
- **API Key Configuration**: Secure setup with your own Claude API key

### 🎨 Modern Interface
- **Clean Design**: Minimalist, focus-driven interface with custom CSS
- **Sidebar Navigation**: Easy-to-use navigation with keyboard shortcuts
- **Responsive Layout**: Works well on different screen sizes
- **Intuitive UX**: Streamlined user experience with consistent patterns

## Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/StephenBooysen/me-architect-my-life.git
cd me-architect-my-life
```

2. Install dependencies:
```bash
npm install
```

3. Start the web development server:
```bash
npm run dev:web
```

4. Or run the full Electron application:
```bash
npm run electron:dev
```

5. For production builds:
```bash
npm start              # Start web server
npm run electron       # Start Electron app
npm run build:electron # Build distributable
```

## Development Commands

```bash
# Web development (ideal for development/Codespaces)
npm run dev:web

# Electron development
npm run electron:dev

# Production web server
npm start

# Electron production
npm run electron

# Build Electron distributables
npm run build:electron        # Current platform
npm run build:electron-all    # All platforms

# Code quality
npm run lint
npm run format
npm test

# Utility
npm run kill  # Kill processes on port 3100
```

## Architecture

### Technology Stack
- **Electron v28.0.0**: Cross-platform desktop framework
- **Express.js**: Backend web server with REST API
- **EJS**: Server-side templating engine
- **Vanilla JavaScript**: Modern ES6+ frontend without framework dependencies
- **SQLite**: Local database storage
- **Custom CSS**: Modern styling with utility patterns
- **Flat Icons**: Beautiful icon library
- **Chart.js**: Data visualization and progress charts
- **Date-fns**: Date manipulation utilities
- **Noobly Core**: Application framework and service registry

### Project Structure
```
├── app.js                    # Express.js web server entry point
├── electron.js              # Electron main process
├── preload.js               # Electron preload script
├── package.json             # Dependencies and scripts
├── src/
│   ├── components/          # Database and utility components
│   │   └── webdatabase.js   # SQLite database manager
│   ├── routes/              # Express.js API routes
│   │   └── index.js         # REST API endpoints
│   └── pages/               # EJS page route handlers
│       └── index.js         # Page routing logic
├── views/                   # EJS templates
│   ├── layouts/             # Layout templates
│   ├── pages/               # Page templates
│   └── partials/            # Reusable components
├── public/                  # Static assets and client-side JS
│   ├── js/                  # Frontend JavaScript modules
│   │   ├── components/      # UI component logic
│   │   └── main.js          # Application initialization
│   ├── css/                 # Stylesheets
│   └── images/              # Icons and assets
└── data/                    # SQLite database files
```

### Database Schema
The SQLite database includes 12 tables for comprehensive data management:
- **goals**: Hierarchical goal storage (annual/monthly/weekly) with progress tracking
- **goal_notes**: Notes and learnings for each goal ("what worked" / "what didn't work")
- **focus_areas**: Life area categorization and monthly focus assignments
- **monthly_focus_assignments**: Track focus areas by month/year
- **habits**: Habit definitions with frequency and target streak configurations
- **habit_logs**: Daily habit completion records with notes
- **morning_notes**: Daily morning intention setting and priorities
- **evening_reflections**: Daily evening gratitude and learning reflection
- **wisdom**: Inspirational quotes and personal insights with categorization
- **templates**: Default reflection templates for morning and evening
- **ai_chats**: AI conversation history with session management
- **moods**: Daily mood tracking (1-10 scale) for emotional well-being

## Configuration

### AI Integration
The application includes Claude AI integration via the Anthropic API:
- Add your Claude API key through the Settings page
- Uses claude-3-5-sonnet-20241022 model
- Session-based chat history with context management
- Secure API key storage and proxy through Express.js backend

### Data Storage
All data is stored locally in SQLite databases:
- **Electron mode**: Database stored in user data directory
- **Web mode**: `data/web-database.db` in project directory
- Automatic database initialization with default data
- Comprehensive schema with 12 tables for full feature support

## Contributing

This is a personal project, but suggestions and feedback are welcome! Please feel free to:
- Report bugs via GitHub issues
- Suggest new features
- Share your experience using the app

## License

ISC License - Feel free to use this for your own personal goal tracking needs!

## Acknowledgments

- Built with comprehensive PRD specifications (see `docs/Architecting My Life PRD.md`)
- Inspired by the need for better personal productivity tools
- Icons provided by Flat Icons library
- AI integration powered by Anthropic's Claude
- Framework support from Noobly Core application registry

---

**Start architecting your best life today!** 🚀

### Quick Docker Setup
```bash
docker build -t architect-my-life-web .
docker run -p 3100:3100 architect-my-life-web
```
  