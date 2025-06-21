# Puppeteer Manager

## Overview

This is a full-stack web application for managing Puppeteer automation tasks. It provides a comprehensive interface for creating, monitoring, and managing web scraping and automation tasks using Puppeteer scripts with customizable browser profiles.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: Local file system for scripts and profiles
- **API**: RESTful API endpoints

## Key Components

### Database Schema
The application uses three main database tables:
- **tasks**: Stores automation task information with status tracking
- **scripts**: Manages TypeScript script files with metadata
- **profiles**: Stores browser profile configurations

### Storage System
- **Database Storage**: PostgreSQL for all structured data (tasks, scripts, profiles) using Drizzle ORM
- **File Storage**: Local file system for script and profile content files only
- **Hybrid Approach**: Database stores metadata and configuration, files store actual script/profile content

### UI Components
- **Dashboard**: Main interface with tabbed navigation
- **Task Management**: Create, monitor, and manage automation tasks
- **Script Management**: Upload and manage TypeScript files
- **Profile Management**: Configure browser settings and profiles
- **API Testing**: Interactive API documentation and testing interface

## Data Flow

1. **Task Creation**: Users select scripts and profiles to create new automation tasks
2. **Database Storage**: All tasks, scripts, and profiles metadata stored in PostgreSQL
3. **File Management**: Script and profile content files maintained in local file system
4. **Task Execution**: Tasks are tracked with NEW → READY → RUNNING → COMPLETED/FAILED status flow
5. **Real-time Updates**: Frontend automatically refreshes data using React Query
6. **Hybrid Storage**: Database handles structured data, files handle content

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React icons
- **Styling**: Tailwind CSS with class-variance-authority

### Backend Dependencies
- **Database**: Neon Database (PostgreSQL) with Drizzle ORM
- **File Upload**: Multer for handling file uploads
- **Validation**: Zod for runtime type validation
- **Development**: tsx for TypeScript execution

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast bundling for production
- **Vite**: Development server with hot module replacement

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts development server on port 5000
- **Hot Reload**: Vite provides instant feedback during development
- **Database**: Uses environment variable `DATABASE_URL` for connection

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Configured for Replit autoscale deployment

### Configuration
- **Environment**: Uses `.replit` configuration for Replit deployment
- **Build Process**: Separate build commands for frontend and backend
- **Port Configuration**: Configured to run on port 5000 with external port 80

## Changelog
- June 13, 2025. Initial setup
- June 13, 2025. Updated profile configuration schema to support comprehensive browser automation settings including proxy configuration, viewport settings, timezone, language, and custom scripting options
- June 13, 2025. Implemented JSON file-based task storage system with dedicated tasks folder - all tasks now persist as individual JSON files (task_[id].json) with automatic loading on startup
- June 13, 2025. Added collapsible sidebar functionality with smooth animations, icon-only view when collapsed, tooltips for navigation items, and responsive footer stats layout
- June 13, 2025. Added task-specific endpoints: GET /api/tasks/:id/profile and GET /api/tasks/:id/script to retrieve complete profile and script details for individual tasks
- June 18, 2025. Added custom field support to profile configuration with JSON editor and validation
- June 18, 2025. Implemented "New Script" button in Script Management for creating scripts directly in the interface
- June 18, 2025. Migrated from file-based storage to PostgreSQL database for all structured data (tasks, scripts, profiles) while maintaining file system for script and profile content
- June 18, 2025. Completed removal of filename dependencies - system now operates entirely with names as identifiers, eliminating all file creation functionality
- June 18, 2025. Removed "New Task" button from the main header area, keeping only the one in the task list controls for better UI organization
- June 18, 2025. Adjusted Scripts tab layout to reduce Script Files panel width and increase Edit Script panel width for better code editing experience
- June 18, 2025. Added scroll functionality to task detail modal with up/down scroll buttons for better navigation through task content
- June 19, 2025. Improved sidebar alignment to ensure all content is properly left-aligned when expanded
- June 19, 2025. Aligned Collapse button to the left in sidebar menu for consistent navigation layout
- June 19, 2025. Updated UI to use table format for Script Files and Profile Configurations with ID, Name, Description columns
- June 19, 2025. Implemented popup modal interface for Script Editor and Profile Configuration editing
- June 19, 2025. Added ID-based sorting for Tasks, Scripts, and Profiles tables (ascending order)
- June 19, 2025. Implemented complete Worker Management system with database table (id, username, password, description), API endpoints, and UI interface matching Profile Management design
- June 20, 2025. Removed content field from Profile system - eliminated all content element references from database schema, API endpoints, storage layer, and UI components
- June 20, 2025. Fixed custom field display in Profile API endpoints to return proper JSON format instead of raw strings
- June 20, 2025. Removed Script Source and Custom Script fields from Profile system - updated database schema, storage layer, and UI components
- June 20, 2025. Updated Edit Profile popup to replace "Advanced" tab with "Custom Field" tab featuring dedicated JSON editor with syntax highlighting
- June 20, 2025. Implemented comprehensive JavaScript syntax highlighting for Script Source Code editor with color-coded keywords, strings, comments, functions, and operators
- June 20, 2025. Enhanced all table screens (Tasks, Workers, Profiles, Scripts) with row selection - users can now click anywhere on a table row to edit that item instead of using Edit buttons (later removed per user request)
- June 20, 2025. Updated Tasks API endpoints to return customField in profiles as proper JSON format instead of raw strings for better data structure and frontend consumption
- June 20, 2025. Implemented clickable ID functionality for all table screens - users can click on ID numbers to view details or edit items with blue link styling and hover effects
- June 20, 2025. Added clickable Profile and Script columns in Task List - users can click on profile/script names to view detailed read-only information in popup modals without edit buttons
- June 20, 2025. Updated Edit Profile popup title to "Profile Details" and added read-only Profile ID field displayed alongside Profile Name in Basic tab
- June 20, 2025. Updated Edit Script popup title to "Script Details" and added read-only Script ID field displayed alongside Script Name
- June 20, 2025. Improved Task List detail modals by moving scroll bars to specific content sections - Profile Details has scrollable Custom Fields area, Script Details has scrollable Source Code area for better content visibility
- June 20, 2025. Enhanced Profile Details modal in Task List by increasing overall width to max-w-4xl and reducing Custom Fields section to 50% width for better layout proportions
- June 20, 2025. Replaced simple Profile Details modal in Task List with comprehensive tabbed interface from Profile screen - includes Basic, Browser, Proxy, and Custom Field tabs with read-only fields and proper JSON syntax highlighting
- June 20, 2025. Updated Edit Task popup title to "Task Details" and added read-only Task ID field displayed alongside Worker ID field with proper grid layout
- June 20, 2025. Modified Task List to open Task Details popup (edit modal) when clicking on Task ID instead of the read-only task details view modal
- June 20, 2025. Updated Task Details popup to only show "Update Task" button when task status is "NEW" - other statuses show read-only view with Close button only
- June 20, 2025. Changed Cancel button to "Close" in Task Details popup for better user experience
- June 20, 2025. Enhanced Task List Profile Details Custom Field display with comprehensive JSON syntax highlighting matching Profile screen formatting - includes color-coded keys, values, brackets, and JSON badge
- June 20, 2025. Optimized Task List Profile Details Custom Field width with max-width constraint (max-w-2xl) and reduced font size for better popup proportions
- June 21, 2025. Renamed Cancel button to "Close" in Browser Profiles script detail popup for consistent UI labeling

## User Preferences

Preferred communication style: Simple, everyday language.