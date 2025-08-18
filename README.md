# Architect My Life

A comprehensive desktop application for personal goal management, habit tracking, and self-reflection. Built with Electron, React, and SQLite.

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
- **Morning Notes**: Start your day with intention setting
- **Evening Reflection**: End your day with gratitude and learning
- **Custom Templates**: Create personalized reflection templates
- **Progress Insights**: Track mood, energy levels, and daily ratings

### 📚 Wisdom Library
- **Quote Collection**: Store inspirational quotes and wisdom
- **Source Attribution**: Track authors and sources
- **Category Organization**: Organize by themes and topics
- **Personal Notes**: Add your own insights to each piece of wisdom

### 🤖 AI Integration
- **Goal Setting Assistance**: Get help breaking down complex goals
- **Progress Analysis**: AI-powered insights on your progress patterns
- **Motivational Support**: Personalized encouragement and advice
- **Strategic Planning**: Recommendations for achieving your goals

### 🎨 Modern Interface
- **Clean Design**: Minimalist, focus-driven interface
- **Dark/Light Mode**: Toggle between themes
- **Responsive Layout**: Works well on different screen sizes
- **Intuitive Navigation**: Easy-to-use sidebar navigation

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

3. Run in development mode:
```bash
npm run dev
```

4. Or build for production:
```bash
npm run build
npm start
```

## Development Commands

```bash
# Development mode (hot reload)
npm run dev

# Build React frontend only
npm run build:renderer

# Build entire application
npm run build

# Start production build
npm start

# Create distributable
npm run dist

# Code quality
npm run lint
npm run format
npm test
```

## Architecture

### Technology Stack
- **Electron**: Cross-platform desktop framework
- **React**: Frontend user interface
- **SQLite**: Local database storage
- **Vite**: Fast build tool and dev server
- **Lucide React**: Beautiful icon library
- **Date-fns**: Date manipulation utilities

### Project Structure
```
src/
├── main/              # Electron main process
│   ├── main.js        # Application entry point
│   ├── preload.js     # Secure IPC bridge
│   └── database.js    # SQLite database manager
└── renderer/          # React frontend
    ├── components/    # Reusable components
    ├── contexts/      # React context providers  
    ├── pages/         # Application pages
    ├── styles/        # Global CSS styles
    └── App.jsx        # Main React component
```

### Database Schema
- **goals**: Hierarchical goal storage with progress tracking
- **focus_areas**: Life area categorization
- **habits**: Habit definitions and configurations
- **habit_logs**: Daily habit completion records
- **morning_notes** / **evening_reflections**: Daily journaling
- **wisdom**: Inspirational quotes and personal insights
- **templates**: Customizable reflection templates

## Configuration

### AI Integration
To enable AI features, add your Claude API key to the application settings or environment variables.

### Data Storage
All data is stored locally in SQLite database. The database file is automatically created in your user data directory.

## Contributing

This is a personal project, but suggestions and feedback are welcome! Please feel free to:
- Report bugs via GitHub issues
- Suggest new features
- Share your experience using the app

## License

ISC License - Feel free to use this for your own personal goal tracking needs!

## Acknowledgments

- Built with the comprehensive PRD specifications
- Inspired by the need for better personal productivity tools
- Icons provided by Lucide React
- AI integration powered by Anthropic's Claude

---

**Start architecting your best life today!** 🚀
