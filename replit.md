# StackIt Q&A Platform

## Overview

This is a modern Q&A platform built with React, TypeScript, and Firebase. The application allows users to ask questions, provide answers, and vote on content. It features a clean, Stack Overflow-inspired design with real-time updates and comprehensive user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with Shadcn/UI components for consistent design
- **State Management**: React Query (TanStack Query) for server state management
- **Forms**: React Hook Form with Zod validation for robust form handling

### Backend Architecture
- **Database**: Firebase Firestore for real-time data storage
- **Authentication**: Firebase Authentication for user management
- **API**: Direct Firebase SDK integration (no custom REST API layer)
- **Real-time Updates**: Firestore listeners for live data synchronization

## Key Components

### Authentication System
- Firebase Authentication with email/password
- User profile management with additional metadata stored in Firestore
- Protected routes for authenticated-only features
- Automatic user state management through React Context

### Question & Answer System
- CRUD operations for questions and answers
- Real-time updates using Firestore listeners
- Vote system with upvote/downvote functionality
- Tag-based categorization
- Answer acceptance mechanism

### UI Component Library
- Comprehensive Shadcn/UI component system
- Consistent design tokens and theming
- Mobile-responsive layout components
- Accessible form controls and interactive elements

### Data Models
- **User**: Profile information, reputation, activity counts
- **Question**: Title, description, tags, author info, vote counts
- **Answer**: Content, author info, vote counts, acceptance status
- **Vote**: User voting records with type and target tracking

## Data Flow

### Question Creation Flow
1. User submits question form with validation
2. Question data stored in Firestore with author metadata
3. User's question count incremented
4. Real-time listeners update UI across all connected clients

### Answer & Voting Flow
1. Users can post answers to questions
2. Question author can accept answers
3. All users can vote on questions and answers
4. Vote counts update in real-time
5. User reputation calculated based on votes received

### Authentication Flow
1. Firebase handles authentication state
2. User profile data synchronized with Firestore
3. Protected routes redirect to login when needed
4. User context provides authentication state throughout app

## External Dependencies

### Core Dependencies
- **Firebase**: Authentication and Firestore database
- **React Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Zod**: Runtime type validation
- **Tailwind CSS**: Utility-first styling
- **Wouter**: Lightweight routing

### UI Dependencies
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Date-fns**: Date formatting utilities
- **Class Variance Authority**: Component variant management

## Deployment Strategy

The application is configured for multiple deployment scenarios:

### Development
- Vite dev server with HMR
- Firebase local emulators (optional)
- Environment variables for Firebase configuration

### Production Build
- Vite builds optimized static assets
- Firebase hosting for frontend deployment
- Environment variables injected at build time

### Environment Configuration
Required environment variables for Firebase:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Technical Decisions

### Database Choice: Firebase Firestore
- **Problem**: Need for real-time updates and scalable backend
- **Solution**: Firestore provides real-time listeners and automatic scaling
- **Alternatives**: Traditional REST API with polling, WebSocket implementation
- **Pros**: Real-time sync, managed infrastructure, offline support
- **Cons**: Vendor lock-in, query limitations, pricing at scale

### State Management: React Query
- **Problem**: Complex server state synchronization and caching
- **Solution**: React Query handles caching, background updates, and error states
- **Alternatives**: Redux, Zustand, plain React state
- **Pros**: Optimistic updates, automatic refetching, excellent DX
- **Cons**: Learning curve, additional dependency

### Styling: Tailwind CSS + Shadcn/UI
- **Problem**: Consistent, maintainable styling system
- **Solution**: Utility-first CSS with pre-built accessible components
- **Alternatives**: Styled-components, CSS modules, Material-UI
- **Pros**: Fast development, consistent design, small bundle size
- **Cons**: Verbose HTML, initial learning curve

### Form Handling: React Hook Form + Zod
- **Problem**: Complex form validation and error handling
- **Solution**: Lightweight forms with schema-based validation
- **Alternatives**: Formik, plain React state
- **Pros**: Minimal re-renders, excellent TypeScript support, schema validation
- **Cons**: Additional complexity for simple forms