# Plex-Bit - Calendar-Based Class Scheduling System

## Project Overview

A comprehensive calendar-based class scheduling system that supports both single-instance and recurring classes with flexible scheduling patterns, modern UI, and robust backend infrastructure.

## Features

- **Class Management**: Create, read, update, delete classes (single & recurring)
- **Recurring Patterns**: Daily, weekly, monthly, and custom recurrence
- **Resource Management**: CRUD for room types, rooms, and instructors
- **Conflict Detection**: Prevent scheduling conflicts
- **Caching Layer**: Redis for improved performance
- **Modern UI**: Responsive calendar interface

## Tech Stack

### Backend
- Node.js + TypeScript + Express
- MongoDB with Mongoose
- Redis for caching
- Express-Validator for validation

### Frontend
- React + TypeScript
- Vite as build tool
- Tailwind CSS for styling
- React Query for data fetching
- React Router for navigation

## Prerequisites

### Option 1: With Docker (Recommended)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. MongoDB and Redis will be available via Docker Compose

### Option 2: Without Docker

#### MongoDB
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Or download from https://www.mongodb.com/try/download/community
```

#### Redis
```bash
# macOS with Homebrew
brew install redis
brew services start redis

# Or download from https://redis.io/download
```

## Project Structure

```
plex-bit/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and Redis configuration
│   │   ├── controllers/    # API controllers
│   │   ├── middleware/     # Error handling, validation
│   │   ├── models/         # MongoDB models (Class, ClassInstance, Instructor, Room, RoomType)
│   │   ├── modules/        # Feature modules (classes, instructors, rooms, roomTypes, conflict, cache)
│   │   │   ├── cache/      # Redis caching service
│   │   │   ├── classes/    # Class management (controller, service, repository, DTOs, routes)
│   │   │   ├── conflict/   # Conflict detection service
│   │   │   ├── instructors/# Instructor management
│   │   │   ├── rooms/      # Room management
│   │   │   └── roomTypes/  # Room type management
│   │   ├── shared/         # Shared utilities, constants, errors
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities (date formatting, response formatting)
│   │   ├── app.ts          # Express application
│   │   └── routes.ts       # API routes definition
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   └── calendar/   # Calendar feature (components, hooks, types, API)
│   │   ├── hooks/         # Custom hooks (useClasses, useInstructors, useRooms, useRoomTypes)
│   │   ├── lib/           # API client configuration
│   │   ├── pages/          # Page components
│   │   ├── router/         # React Router configuration
│   │   ├── types/          # TypeScript types
│   │   ├── components/     # Reusable components (Layout)
│   │   ├── main.tsx        # Application entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### 1. Clone and Install Dependencies

```bash
cd plex-bit

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

#### Backend Configuration

Copy `backend/.env.example` to `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/plex-bit
MONGODB_DB_NAME=plex-bit

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache TTL (seconds)
CACHE_TTL=3600

# JWT (optional)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

#### Frontend Configuration

The frontend uses Vite. Create a `.env` file in the frontend directory if needed:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Services

#### With Docker
```bash
docker-compose up -d
```

#### Without Docker
```bash
# Start MongoDB (if not running as service)
mongod --dbpath /usr/local/var/mongodb

# Start Redis (if not running as service)
redis-server
```

### 4. Run the Backend

```bash
cd backend
npm run dev  # Development with hot reload
# OR
npm run build && npm start  # Production
```

### 5. Run the Frontend

```bash
cd frontend
npm run dev  # Development with hot reload
# OR
npm run build  # Production build
```

### 6. Verify Installation

#### Backend Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "title": "Health Check",
  "message": "Server is running",
  "timestamp": "2024-03-15T10:30:00.000Z",
  "environment": "development"
}
```

#### Frontend
Open `http://localhost:5173` in your browser (or the port shown in terminal).

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format

#### Success Response (Paginated)
```json
{
  "title": "Classes fetched",
  "message": "Class list loaded",
  "data": [...],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12
  }
}
```

#### Success Response (Single)
```json
{
  "title": "Class created",
  "message": "New class scheduled successfully",
  "data": { ... }
}
```

#### Error Response
```json
{
  "title": "Validation Error",
  "message": "Invalid input data",
  "errors": [
    { "field": "startTime", "message": "Start time must be before end time" }
  ]
}
```

---

### Classes API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classes` | Get all classes (paginated) |
| GET | `/api/classes/:id` | Get single class |
| GET | `/api/classes/calendar` | Get calendar view |
| POST | `/api/classes` | Create class |
| PUT | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |

#### Get All Classes

**Request:**
```
GET /api/classes?page=1&limit=10&startDate=2024-03-01&endDate=2024-03-31
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| startDate | string | Filter by start date (ISO format) |
| endDate | string | Filter by end date (ISO format) |
| instructorId | string | Filter by instructor ID |
| roomId | string | Filter by room ID |
| roomTypeId | string | Filter by room type ID |
| search | string | Search in name/description |

**Response:**
```json
{
  "title": "Classes fetched",
  "message": "Class list loaded",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Introduction to Python",
      "description": "Learn Python basics",
      "courseCode": "CS101",
      "classType": "single",
      "startDate": "2024-03-15",
      "endDate": "2024-03-15",
      "startTime": "09:00",
      "endTime": "10:30",
      "instructor": {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
        "name": "Dr. John Smith"
      },
      "room": {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Room 101"
      },
      "roomType": {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d4",
        "name": "Lecture Hall"
      },
      "createdAt": "2024-03-10T08:00:00.000Z",
      "updatedAt": "2024-03-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "totalPages": 12
  }
}
```

#### Get Calendar View

**Request:**
```
GET /api/classes/calendar?startDate=2024-03-01&endDate=2024-03-31
```

**Response:**
```json
{
  "title": "Calendar data fetched",
  "message": "Calendar data loaded",
  "data": {
    "2024-03-15": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Introduction to Python",
        "startTime": "09:00",
        "endTime": "10:30",
        "color": "#3B82F6",
        "instructor": { "name": "Dr. John Smith" },
        "room": { "name": "Room 101" }
      }
    ],
    "2024-03-18": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d5",
        "name": "Advanced Mathematics",
        "startTime": "10:00",
        "endTime": "11:30",
        "color": "#10B981",
        "instructor": { "name": "Dr. Jane Doe" },
        "room": { "name": "Room 202" }
      }
    ]
  }
}
```

#### Create Single Class

**Request:**
```
POST /api/classes
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Introduction to Python",
  "description": "Learn Python basics and fundamentals",
  "courseCode": "CS101",
  "instructorId": "65f1a2b3c4d5e6f7a8b9c0d2",
  "roomTypeId": "65f1a2b3c4d5e6f7a8b9c0d4",
  "roomId": "65f1a2b3c4d5e6f7a8b9c0d3",
  "classType": "single",
  "startDate": "2024-03-15",
  "endDate": "2024-03-15",
  "startTime": "09:00",
  "endTime": "10:30"
}
```

**Response:**
```json
{
  "title": "Class created",
  "message": "New class scheduled successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Introduction to Python",
    "description": "Learn Python basics and fundamentals",
    "courseCode": "CS101",
    "classType": "single",
    "startDate": "2024-03-15",
    "endDate": "2024-03-15",
    "startTime": "09:00",
    "endTime": "10:30",
    "instructor": "65f1a2b3c4d5e6f7a8b9c0d2",
    "roomType": "65f1a2b3c4d5e6f7a8b9c0d4",
    "room": "65f1a2b3c4d5e6f7a8b9c0d3",
    "createdAt": "2024-03-10T08:00:00.000Z",
    "updatedAt": "2024-03-10T08:00:00.000Z"
  }
}
```

#### Create Weekly Recurring Class

**Request:**
```
POST /api/classes
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Advanced Mathematics",
  "description": "Calculus and linear algebra",
  "courseCode": "MATH201",
  "instructorId": "65f1a2b3c4d5e6f7a8b9c0d2",
  "roomTypeId": "65f1a2b3c4d5e6f7a8b9c0d4",
  "classType": "recurring",
  "recurrence": {
    "pattern": "weekly",
    "daysOfWeek": [1, 3],
    "timeSlots": [
      { "startTime": "10:00", "endTime": "11:30" },
      { "startTime": "14:00", "endTime": "15:30" }
    ],
    "endDate": "2024-06-15",
    "interval": 1
  }
}
```

**Response:**
```json
{
  "title": "Class created",
  "message": "Weekly recurring class scheduled successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d5",
    "name": "Advanced Mathematics",
    "classType": "recurring",
    "recurrence": {
      "pattern": "weekly",
      "daysOfWeek": [1, 3],
      "timeSlots": [
        { "startTime": "10:00", "endTime": "11:30" },
        { "startTime": "14:00", "endTime": "15:30" }
      ],
      "endDate": "2024-06-15",
      "interval": 1
    },
    "createdAt": "2024-03-10T08:00:00.000Z"
  }
}
```

#### Create Monthly Recurring Class

**Request:**
```
POST /api/classes
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Monthly Review Meeting",
  "description": "Department review and planning",
  "instructorId": "65f1a2b3c4d5e6f7a8b9c0d2",
  "roomTypeId": "65f1a2b3c4d5e6f7a8b9c0d4",
  "classType": "recurring",
  "recurrence": {
    "pattern": "monthly",
    "dayOfMonth": [5, 20],
    "timeSlots": [
      { "startTime": "09:00", "endTime": "10:00" }
    ],
    "endDate": "2024-12-31"
  }
}
```

#### Update Class

**Request:**
```
PUT /api/classes/65f1a2b3c4d5e6f7a8b9c0d1
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Introduction to Python - Advanced",
  "startTime": "10:00",
  "endTime": "11:30"
}
```

**Response:**
```json
{
  "title": "Class updated",
  "message": "Class updated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Introduction to Python - Advanced",
    "startTime": "10:00",
    "endTime": "11:30",
    "updatedAt": "2024-03-11T12:00:00.000Z"
  }
}
```

#### Delete Class

**Request:**
```
DELETE /api/classes/65f1a2b3c4d5e6f7a8b9c0d1
```

**Response:**
```json
{
  "title": "Class deleted",
  "message": "Class deleted successfully"
}
```

---

### Instructors API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/instructors` | Get all instructors |
| GET | `/api/instructors/:id` | Get single instructor |
| POST | `/api/instructors` | Create instructor |
| PUT | `/api/instructors/:id` | Update instructor |
| DELETE | `/api/instructors/:id` | Delete instructor |

#### Get All Instructors

**Request:**
```
GET /api/instructors?page=1&limit=10
```

**Response:**
```json
{
  "title": "Instructors fetched",
  "message": "Instructor list loaded",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Dr. John Smith",
      "email": "john.smith@university.edu",
      "department": "Computer Science",
      "specialization": "Machine Learning",
      "phone": "+1-555-0123",
      "createdAt": "2024-03-10T08:00:00.000Z",
      "updatedAt": "2024-03-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Create Instructor

**Request:**
```
POST /api/instructors
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Dr. John Smith",
  "email": "john.smith@university.edu",
  "department": "Computer Science",
  "specialization": "Machine Learning",
  "phone": "+1-555-0123"
}
```

**Response:**
```json
{
  "title": "Instructor created",
  "message": "New instructor added successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Dr. John Smith",
    "email": "john.smith@university.edu",
    "department": "Computer Science",
    "specialization": "Machine Learning",
    "phone": "+1-555-0123",
    "createdAt": "2024-03-10T08:00:00.000Z",
    "updatedAt": "2024-03-10T08:00:00.000Z"
  }
}
```

#### Update Instructor

**Request:**
```
PUT /api/instructors/65f1a2b3c4d5e6f7a8b9c0d2
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Dr. John A. Smith",
  "specialization": "Deep Learning and AI"
}
```

---

### Rooms API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | Get all rooms |
| GET | `/api/rooms/:id` | Get single room |
| POST | `/api/rooms` | Create room |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |

#### Get All Rooms

**Request:**
```
GET /api/rooms?page=1&limit=10&roomTypeId=...
```

**Response:**
```json
{
  "title": "Rooms fetched",
  "message": "Room list loaded",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
      "name": "Room 101",
      "capacity": 50,
      "floor": 1,
      "building": "Main Building",
      "equipment": ["projector", "whiteboard", "computers"],
      "roomType": {
        "_id": "65f1a2b3c4d5e6f7a8b9c0d4",
        "name": "Lecture Hall"
      },
      "createdAt": "2024-03-10T08:00:00.000Z",
      "updatedAt": "2024-03-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### Create Room

**Request:**
```
POST /api/rooms
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Room 101",
  "capacity": 50,
  "floor": 1,
  "building": "Main Building",
  "equipment": ["projector", "whiteboard", "computers"],
  "roomTypeId": "65f1a2b3c4d5e6f7a8b9c0d4"
}
```

**Response:**
```json
{
  "title": "Room created",
  "message": "New room added successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d3",
    "name": "Room 101",
    "capacity": 50,
    "floor": 1,
    "building": "Main Building",
    "equipment": ["projector", "whiteboard", "computers"],
    "roomType": "65f1a2b3c4d5e6f7a8b9c0d4",
    "createdAt": "2024-03-10T08:00:00.000Z",
    "updatedAt": "2024-03-10T08:00:00.000Z"
  }
}
```

---

### Room Types API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/room-types` | Get all room types |
| GET | `/api/room-types/:id` | Get single room type |
| POST | `/api/room-types` | Create room type |
| PUT | `/api/room-types/:id` | Update room type |
| DELETE | `/api/room-types/:id` | Delete room type |

#### Get All Room Types

**Request:**
```
GET /api/room-types
```

**Response:**
```json
{
  "title": "Room types fetched",
  "message": "Room type list loaded",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d4",
      "name": "Lecture Hall",
      "description": "Large room for lectures",
      "color": "#3B82F6",
      "createdAt": "2024-03-10T08:00:00.000Z",
      "updatedAt": "2024-03-10T08:00:00.000Z"
    },
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d5",
      "name": "Lab",
      "description": "Computer lab",
      "color": "#10B981",
      "createdAt": "2024-03-10T08:00:00.000Z",
      "updatedAt": "2024-03-10T08:00:00.000Z"
    }
  ]
}
```

#### Create Room Type

**Request:**
```
POST /api/room-types
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Lecture Hall",
  "description": "Large room for lectures with projector",
  "color": "#3B82F6"
}
```

**Response:**
```json
{
  "title": "Room type created",
  "message": "New room type added successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d4",
    "name": "Lecture Hall",
    "description": "Large room for lectures with projector",
    "color": "#3B82F6",
    "createdAt": "2024-03-10T08:00:00.000Z",
    "updatedAt": "2024-03-10T08:00:00.000Z"
  }
}
```

---

## Scheduling Logic

### Recurrence Patterns

The system supports four types of recurrence patterns:

#### 1. Daily Recurrence
Classes repeat every N days (default: 1 day).

```json
{
  "classType": "recurring",
  "recurrence": {
    "pattern": "daily",
    "timeSlots": [
      { "startTime": "09:00", "endTime": "10:30" }
    ],
    "endDate": "2024-06-15",
    "interval": 1
  }
}
```

#### 2. Weekly Recurrence
Classes repeat on specific weekdays (0=Sunday, 6=Saturday).

```json
{
  "classType": "recurring",
  "recurrence": {
    "pattern": "weekly",
    "daysOfWeek": [1, 3],  // Monday, Wednesday
    "timeSlots": [
      { "startTime": "10:00", "endTime": "11:30" },
      { "startTime": "14:00", "endTime": "15:30" }
    ],
    "endDate": "2024-06-15",
    "interval": 1
  }
}
```

#### 3. Monthly Recurrence
Classes repeat on specific days of the month.

```json
{
  "classType": "recurring",
  "recurrence": {
    "pattern": "monthly",
    "dayOfMonth": [5, 20],  // 5th and 20th of each month
    "timeSlots": [
      { "startTime": "09:00", "endTime": "10:00" }
    ],
    "endDate": "2024-12-31"
  }
}
```

### Time Slot Format
All times use 24-hour format: `HH:mm` (e.g., "09:00", "14:30")

### Conflict Detection

The system automatically prevents scheduling conflicts through the [`ConflictService`](backend/src/modules/conflict/conflict.service.ts):

1. **Double-booking Instructors**: An instructor cannot be scheduled for two classes at the same time
2. **Room Conflicts**: A room cannot be used by two classes simultaneously
3. **Overlapping Class Times**: Classes with overlapping time ranges are detected and rejected

When creating or updating a class, the system checks for conflicts:
```typescript
// Example: Conflict detection logic
const hasConflict = await conflictService.checkConflicts({
  startDate,
  endDate,
  startTime,
  endTime,
  instructorId,
  roomId,
  excludeClassId // For updates
});
```

If a conflict is detected, the API returns:
```json
{
  "title": "Scheduling Conflict",
  "message": "Cannot schedule class due to conflicts",
  "errors": [
    {
      "field": "roomId",
      "message": "Room 'Room 101' is already booked on 2024-03-15 from 09:00 to 10:30"
    }
  ]
}
```

---

## System Design Decisions

### Architecture

#### Backend (Layered Architecture)

The backend follows a layered architecture pattern:

1. **Routes Layer**: Defines API endpoints and maps to controllers
2. **Controller Layer**: Handles HTTP requests, validates input, calls services
3. **Service Layer**: Contains business logic, coordinates between repositories and services
4. **Repository Layer**: Data access layer, abstracts database operations
5. **Model Layer**: MongoDB schemas and types

```
Request → Route → Controller → Service → Repository → MongoDB
                              ↓
                        Conflict Service
                              ↓
                        Cache Service
```

#### Frontend (Feature-Based Architecture)

The frontend is organized by features rather than file type:

```
frontend/src/features/
├── calendar/
│   ├── components/   # Calendar-specific components
│   ├── hooks/        # Calendar-specific hooks
│   ├── types/        # Calendar-specific types
│   └── api/          # Calendar API calls
```

### Caching Strategy

Redis is used as a read-through cache layer:

1. **Cache Key Structure**:
   - Classes list: `classes:list:{page}:{limit}:{filters}`
   - Calendar data: `calendar:{startDate}:{endDate}`
   - Single resource: `resource:{type}:{id}`

2. **Cache Invalidation**:
   - Automatic invalidation on create/update/delete operations
   - Configurable TTL (default: 1 hour)

3. **Benefits**:
   - Reduces database load for frequently accessed data
   - Improves API response times
   - Particularly effective for calendar views

### Database Schema

#### Class Model
```typescript
{
  name: string;           // Class name
  description?: string;   // Optional description
  courseCode?: string;    // Course identifier
  classType: 'single' | 'recurring';
  instructor: ObjectId;   // Reference to Instructor
  room?: ObjectId;        // Optional room reference
  roomType: ObjectId;     // Reference to RoomType
  
  // For single classes
  startDate: string;      // ISO date
  endDate: string;        // ISO date
  startTime: string;      // HH:mm format
  endTime: string;        // HH:mm format
  
  // For recurring classes
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];    // 0-6 for weekly
    dayOfMonth?: number[];    // 1-31 for monthly
    timeSlots: Array<{
      startTime: string;
      endTime: string;
    }>;
    endDate: string;
    interval?: number;        // Repeat every N periods
  };
  
  createdBy?: ObjectId;   // Optional user reference
  createdAt: Date;
  updatedAt: Date;
}
```

#### Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Instructor │ 1   N │    Class    │ N   1 │   RoomType  │
│             │───────│             │───────│             │
└─────────────┘       └─────────────┘       └─────────────┘
                              │ N   1
                              ↓
                        ┌─────────────┐
                        │    Room     │
                        └─────────────┘
```

### Why These Design Decisions?

1. **MongoDB**: Flexible schema allows easy modification of recurrence patterns and class metadata without migrations

2. **Redis Caching**: 
   - Calendar views are expensive queries
   - Caching improves perceived performance
   - TTL-based invalidation balances freshness and performance

3. **Repository Pattern**:
   - Testability: Easy to mock in unit tests
   - Maintainability: Centralized data access logic
   - Flexibility: Can switch database implementations

4. **Service Layer**:
   - Business logic isolation
   - Reusable across controllers
   - Enables transaction management

5. **Frontend Feature Organization**:
   - Scalability: Easy to add new features
   - Cohesion: Related code is grouped together
   - Maintainability: Easier to understand and modify

---

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/plex-bit |
| MONGODB_DB_NAME | Database name | plex-bit |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | - |
| REDIS_DB | Redis database number | 0 |
| CACHE_TTL | Cache TTL in seconds | 3600 |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | JWT expiration | 7d |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3000/api |
| VITE_PORT | Frontend dev server port | 5173 |

---

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Conventional commits

### Docker Production Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## License

MIT License
