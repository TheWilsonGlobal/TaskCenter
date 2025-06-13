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
- **Database Storage**: PostgreSQL for structured data using Drizzle ORM
- **File Storage**: Local file system for script and profile files
- **Memory Storage**: In-memory fallback implementation for development

### UI Components
- **Dashboard**: Main interface with tabbed navigation
- **Task Management**: Create, monitor, and manage automation tasks
- **Script Management**: Upload and manage TypeScript files
- **Profile Management**: Configure browser settings and profiles
- **API Testing**: Interactive API documentation and testing interface

## Data Flow

1. **Task Creation**: Users select scripts and profiles to create new automation tasks
2. **File Management**: Scripts and profiles are uploaded and stored in the file system
3. **Task Execution**: Tasks are tracked with status updates (READY, RUNNING, COMPLETED, FAILED)
4. **Real-time Updates**: Frontend automatically refreshes data using React Query
5. **File System Integration**: Scripts and profiles are managed both in database and file system

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

## User Preferences

Preferred communication style: Simple, everyday language.