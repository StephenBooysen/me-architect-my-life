# Product Requirements Document
## Personal Goal & Habit Tracker Desktop Application

### 1. Executive Summary

#### 1.1 Product Overview
A desktop application built with Electron that enables comprehensive personal goal management, habit tracking, and self-reflection. The application provides a hierarchical goal-setting system (annual → monthly → weekly), habit tracking, focus area management, and AI-powered guidance through Claude API integration.

#### 1.2 Target User
Single user (personal use only) - no multi-user support or security requirements needed at this time.

#### 1.3 Core Value Proposition
Provide a unified platform for setting, tracking, and achieving personal goals with intelligent AI guidance, helping users maintain focus and build positive habits through structured planning and regular reflection.

---

### 2. Product Goals & Objectives

#### 2.1 Primary Objectives
- Enable structured goal planning from annual vision to weekly execution
- Track progress and capture learnings systematically
- Build and maintain positive daily habits
- Provide AI-powered insights and guidance
- Facilitate daily reflection and mindfulness

#### 2.2 Success Metrics
- Daily application usage consistency
- Goal completion rates
- Habit streak maintenance
- User satisfaction with AI guidance quality

---

### 3. Feature Requirements

#### 3.1 Goal Management System

##### 3.1.1 Hierarchical Goal Structure
**Description:** Three-tier goal management system with automatic relationship mapping and unified interface.

**Functional Requirements:**
- **Unified Goal Interface**
  - Single page for managing all goal types (annual/monthly/weekly)
  - Hierarchical view with parent-child relationships
  - Tabbed interface for filtering by goal type
  - Inline creation and editing capabilities
  
- **Annual Goals**
  - Create, edit, and delete annual goals
  - Set target completion dates and years
  - Define success criteria and descriptions
  - Assign priority levels (High/Medium/Low)
  - Track overall progress percentage with automatic updates
  
- **Monthly Goals**
  - Link monthly goals to parent annual goals
  - Assign to specific months and years
  - Progress tracking with visual indicators
  - Automatic parent progress calculation
  
- **Weekly Goals**
  - Derive from monthly objectives
  - Assign to specific weeks
  - Week-by-week progress tracking
  - Automatic parent progress updates

##### 3.1.2 Progress Tracking & Notes
**Functional Requirements:**
- Progress indicator for each goal (0-100% slider or incremental steps)
- Rich text notes field for each goal
- "What Worked" section - capture successful strategies
- "What Didn't Work" section - document challenges and learnings
- Timestamp all updates
- View history of notes and progress changes

#### 3.2 Focus Areas Management

##### 3.2.1 Focus Area Definition
**Pre-defined Categories:**
- Health & Fitness
- Wealth & Career
- Spiritual & Mindfulness
- Family & Relationships
- Friends & Social
- Personal Development
- Hobbies & Recreation
- Custom (user-defined)

**Functional Requirements:**
- Select active focus areas per month
- Assign specific goals to focus areas
- Set monthly themes or intentions for each area
- Visual distribution of goals across focus areas
- Focus area performance analytics

##### 3.2.2 Focus Area Tracking
- Progress tracking per focus area
- Monthly review summaries
- Balance indicator showing time/effort distribution
- Alerts for neglected focus areas

#### 3.3 Daily Habits Tracker

##### 3.3.1 Habit Management
**Functional Requirements:**
- Create unlimited habits
- Set frequency (daily, weekdays, weekends, custom days)
- Define habit categories
- Set target streaks
- Enable/disable habits
- Archive completed or discontinued habits

##### 3.3.2 Habit Tracking & Visualization
- Daily check-off interface
- Streak counters with milestone celebrations
- Weekly success rate display (e.g., 5/7 days completed)
- Monthly calendar view with completion indicators
- Habit consistency trends over time
- Best streak records
- Habit correlation analysis (which habits are completed together)

#### 3.4 How You Feel (Mood Tracking)

##### 3.4.1 Daily Mood Tracking
**Description:** Simple daily mood tracking system to monitor emotional well-being over time.

**Functional Requirements:**
- Daily mood rating system (1-10 scale)
- Calendar view for historical mood data
- Monthly mood trends and analytics
- Quick daily mood entry
- Visual mood patterns over time
- Integration with reflection system

##### 3.4.2 Mood Analytics
- Monthly mood averages
- Trend identification (improving/declining patterns)
- Correlation with habit completion rates
- Visual charts and graphs for mood data
- Mood streak tracking

#### 3.5 Wisdom & Inspiration Module

##### 3.5.1 Wisdom Capture
**Functional Requirements:**
- Create and categorize quotes, insights, and wisdom
- Tag system for easy retrieval
- Source attribution
- Personal notes on each entry
- Import from external sources (copy/paste)

##### 3.5.2 Contextual Display
- Smart quote display based on current view/activity
- Daily wisdom on dashboard
- Relevant quotes when viewing specific goal categories
- Random inspiration generator
- Favorite/bookmark system

#### 3.6 Dashboard

##### 3.6.1 Dashboard Components
**Primary View Elements:**
- Today's Focus widget
  - Top 3 priority items for today
  - Current week's goals progress
  - Today's habits checklist
  
- Progress Summary Cards
  - Annual goals progress bars
  - Monthly focus areas status
  - Current habit streaks
  
- Quick Actions
  - Add new goal
  - Complete habit
  - Write morning/evening notes
  - Chat with AI guide

- Motivational Elements
  - Daily wisdom quote
  - Achievement notifications
  - Streak celebrations

##### 3.6.2 Dashboard Customization
- Drag-and-drop widget arrangement
- Show/hide components
- Adjust widget sizes
- Color themes

#### 3.7 Reflection & Journaling

##### 3.7.1 Morning Notes
**Template Questions (Customizable):**
- What are my top 3 priorities today?
- How do I want to feel today?
- What am I grateful for?
- What challenges might I face?
- My intention for today is...

**Features:**
- Quick template fill-out
- Previous entries reference
- Mood tracker
- Energy level indicator

##### 3.7.2 Evening Reflection
**Template Questions (Customizable):**
- What went well today?
- What could have been better?
- What did I learn?
- Tomorrow's top priority is...
- I'm grateful for...

**Features:**
- Daily accomplishment log
- Lesson learned capture
- Tomorrow planning
- Day rating (1-10)

##### 3.7.3 Template Management
- Create custom templates
- Edit existing templates
- Template versioning
- Schedule different templates for different days

#### 3.8 AI Guide Integration (Claude API)

##### 3.8.1 Conversational Interface
**Implementation:**
- Persistent chat sidebar/modal
- Context-aware conversations based on current goals and progress
- Natural language interaction
- Voice input option (future enhancement)

##### 3.8.2 AI Guidance Features
**Core Capabilities:**
- Goal setting assistance
  - Help break down annual goals into actionable monthly/weekly tasks
  - Suggest realistic timelines
  - Identify potential obstacles
  
- Progress analysis
  - Review performance trends
  - Identify patterns in successes/failures
  - Suggest course corrections
  
- Motivational support
  - Personalized encouragement based on progress
  - Celebrate achievements
  - Provide perspective during setbacks
  
- Strategic advice
  - Recommend focus area adjustments
  - Suggest habit stacking opportunities
  - Provide productivity tips

##### 3.8.3 AI Context Management
- Share relevant goal data with Claude
- Maintain conversation history
- Privacy controls for data sharing
- Customizable AI personality/tone

---

### 4. Technical Requirements

#### 4.1 Technology Stack
- **Framework:** Electron v28.0.0
- **Backend:** Express.js with EJS templating
- **Frontend:** Vanilla JavaScript with modern ES6+ features
- **Styling:** Custom CSS with modern design principles
- **Database:** SQLite for local storage
- **API Integration:** Claude API via direct HTTP requests
- **Additional Libraries:** Chart.js, UUID, date-fns, noobly-core framework
- **Development:** Nodemon, ESLint, Prettier

#### 4.2 Platform Requirements
- **Operating Systems:** Windows 10+, macOS 10.14+, Ubuntu 20.04+
- **Memory:** Minimum 4GB RAM
- **Storage:** 500MB available disk space
- **Internet:** Required for AI features only

#### 4.3 Data Management
- Local SQLite database for all user data
- Automatic daily backups
- Export functionality (JSON, CSV)
- Import capability for data migration
- Data retention for historical analysis

---

### 5. User Interface Design

#### 5.1 Design Principles
- Clean, minimalist interface
- Focus on content over chrome
- Consistent visual hierarchy
- Accessibility compliance (WCAG 2.1 AA)
- Dark/light mode support

#### 5.2 Navigation Structure
```
Main Navigation:
├── Dashboard (Home)
├── Goals (Unified hierarchical view)
├── Focus Areas
├── Habits
├── How You Feel (Mood tracking)
├── Reflection
│   ├── Morning Notes
│   └── Evening Reflection
├── Wisdom Library
├── AI Guide
└── Settings
    ├── AI Configuration
    ├── Preferences
    └── Data Management
```

#### 5.3 Key Interaction Patterns
- Drag-and-drop for goal relationships
- Single-click habit completion
- Keyboard shortcuts for common actions
- Quick add buttons throughout
- Contextual menus for advanced options

---

### 6. Non-Functional Requirements

#### 6.1 Performance
- Application launch: < 3 seconds
- View transitions: < 200ms
- Data operations: < 500ms
- AI response time: < 5 seconds

#### 6.2 Reliability
- Auto-save every 30 seconds
- Crash recovery with data preservation
- Offline mode for core features
- Graceful degradation when AI unavailable

#### 6.3 Usability
- Intuitive first-time user experience
- Tooltips and help system
- Undo/redo for critical actions
- Comprehensive keyboard navigation

---

### 7. Future Enhancements (Post-MVP)

#### 7.1 Phase 2 Features
- Mobile companion app
- Cloud synchronization
- Advanced analytics and insights
- Social accountability features
- Integration with external calendars
- Pomodoro timer integration
- Voice journaling

#### 7.2 Phase 3 Features
- Multi-user support with security
- Team goal collaboration
- Public goal sharing
- Integration with fitness trackers
- Financial goal tracking with bank connections
- Computer vision for habit verification

---

### 8. Success Criteria

#### 8.1 MVP Completion Checklist
- [x] All core features implemented and functional
- [x] AI integration providing meaningful guidance
- [x] Data persistence working reliably
- [x] Daily use without critical bugs
- [ ] Export/import functionality operational
- [x] Performance metrics met

#### 8.2 User Acceptance Criteria
- Intuitive goal hierarchy management
- Satisfying habit tracking experience
- Valuable AI interactions
- Meaningful progress visualization
- Effective reflection process

---

### 9. Development Phases

#### Phase 1: Foundation ✅ COMPLETED
- Electron app setup with Express.js backend
- EJS templating system
- SQLite database schema implementation
- Navigation structure with sidebar

#### Phase 2: Core Features ✅ COMPLETED
- Hierarchical goal management system
- Focus areas with monthly assignments
- Dashboard with goal widgets
- Data persistence layer

#### Phase 3: Tracking & Habits ✅ COMPLETED
- Comprehensive habit tracker
- Progress tracking with automatic parent updates
- Calendar visualizations

#### Phase 4: Reflection & Wisdom ✅ COMPLETED
- Morning notes and evening reflections
- Default template system
- Wisdom library with categorization
- Mood tracking system (bonus feature)

#### Phase 5: AI Integration ✅ COMPLETED
- Claude API proxy implementation
- Chat interface with session management
- Context-aware AI guidance
- API key configuration

#### Phase 6: Polish & Testing ✅ COMPLETED
- Modern UI with custom CSS
- Electron menu integration
- Performance optimization
- Cross-platform support

---

### 10. Appendices

#### A. Database Schema Overview
- **Goals table:** (id, type, title, description, parent_id, progress, priority, success_criteria, target_date, target_year, target_month, target_week, focus_area_id, created_at, updated_at)
- **Goal_notes table:** (id, goal_id, type, content, created_at) - for tracking "what worked" and "what didn't work"
- **Focus_areas table:** (id, name, category, month, theme, is_active, created_at)
- **Monthly_focus_assignments table:** (id, year, month, focus_area_id, created_at)
- **Habits table:** (id, name, description, category, frequency, custom_days, target_streak, is_active, created_at)
- **Habit_logs table:** (id, habit_id, date, completed, notes, created_at)
- **Morning_notes table:** (id, date, priorities, mood, energy, gratitude, challenges, intention, template_id, created_at)
- **Evening_reflections table:** (id, date, what_went_well, what_could_improve, lessons_learned, tomorrow_priority, gratitude, day_rating, accomplishments, template_id, created_at)
- **Wisdom table:** (id, content, author, source, tags, category, personal_notes, is_favorite, created_at)
- **Templates table:** (id, name, type, questions, is_default, created_at)
- **AI_chats table:** (id, session_id, role, message, context, created_at)
- **Moods table:** (id, date, rating) - for mood tracking feature

#### B. Claude API Integration Details
- **API endpoint:** https://api.anthropic.com/v1/messages
- **Model:** claude-3-5-sonnet-20241022
- **Authentication:** x-api-key header with user-provided API key
- **API version:** 2023-06-01
- **Max tokens:** 1000 for responses
- **Context management:** Session-based chat history storage
- **Error handling:** Graceful degradation with user-friendly error messages
- **Rate limiting:** Handled by Claude API directly

#### C. Export Format Specifications
- JSON structure for full backup
- CSV format for goals and habits
- Template export format
- Wisdom library export format