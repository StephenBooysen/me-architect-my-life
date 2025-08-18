# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Architect My Life" is a comprehensive Electron-based desktop application for personal goal management, habit tracking, and self-reflection. Built with React, SQLite, and the Claude AI API integration.

## Technology Stack

- **Framework**: Electron with React frontend
- **Database**: SQLite for local data storage
- **Styling**: Custom CSS with utility classes
- **Icons**: Lucide React
- **Date handling**: date-fns
- **AI Integration**: Anthropic Claude API
- **Build System**: Vite for React bundling
- **State Management**: React Context API

## Development Commands

```bash
# Development (starts both Vite dev server and Electron in dev mode)
npm run dev

# Start Electron in production mode
npm start

# Build React renderer only
npm run build:renderer

# Build full application
npm run build

# Create distributable
npm run dist

# Linting and formatting
npm run lint
npm run format

# Testing
npm test
```

## Project Structure

```
src/
├── main/              # Electron main process
│   ├── main.js        # Main Electron entry point
│   ├── preload.js     # Preload script for security
│   └── database.js    # SQLite database management
└── renderer/          # React frontend
    ├── components/    # Reusable React components
    ├── contexts/      # React Context providers
    ├── pages/         # Main application pages
    ├── styles/        # Global CSS styles
    ├── App.jsx        # Main React component
    └── main.jsx       # React entry point
```

## Database Schema

The SQLite database includes tables for:
- **goals**: Annual, monthly, and weekly goals with progress tracking
- **goal_notes**: Notes and learnings for each goal
- **focus_areas**: Life areas for goal organization
- **habits**: Daily habit definitions and configurations
- **habit_logs**: Daily habit completion tracking
- **morning_notes** & **evening_reflections**: Daily journaling
- **wisdom**: Quote and inspiration library
- **templates**: Customizable reflection templates
- **ai_chats**: AI conversation history

## Key Features Implemented

1. **Dashboard**: Overview with today's focus, habit tracker, and progress summaries
2. **Goal Management**: Hierarchical goal system (annual → monthly → weekly)
3. **Navigation**: Full sidebar navigation with proper routing
4. **Database Integration**: Complete CRUD operations via React Context
5. **Theme Support**: Dark/light mode toggle
6. **Responsive UI**: Clean, modern interface with consistent styling

## Development Notes

- All database operations go through the DatabaseContext provider
- The preload.js file exposes secure IPC handlers to the renderer process
- Theme persistence is handled via localStorage
- Error boundaries and loading states are implemented throughout
- All forms include validation and error handling

## Common Tasks

- Add new pages in `src/renderer/pages/`
- Create reusable components in `src/renderer/components/`
- Database operations use the `useDatabase()` hook
- Theme management via `useTheme()` hook
- Icons from lucide-react library
- Date formatting using date-fns

## AI Integration

The application includes Claude AI integration for:
- Goal setting assistance
- Progress analysis and insights
- Motivational support
- Strategic planning advice

API configuration and chat functionality are set up but need Claude API key configuration.