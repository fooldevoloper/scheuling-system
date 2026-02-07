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

### Frontend (Coming Soon)
- React + TypeScript
- Modern UI Library

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
│   │   ├── models/         # MongoDB models
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (cache, conflict detection)
│   │   ├── types/          # TypeScript types
│   │   ├── utils/         # Utilities (date, response formatting)
│   │   └── app.ts         # Express application
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## Getting Started

### 1. Clone and Install Dependencies

```bash
cd plex-bit
cd backend
npm install
```

### 2. Configure Environment

Edit `backend/.env` or copy from example:

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

### 5. Verify Installation

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

### API Endpoints

#### Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/classes` | Get all classes (paginated) |
| GET | `/api/classes/:id` | Get single class |
| GET | `/api/classes/calendar` | Get calendar view |
| POST | `/api/classes` | Create class |
| PUT | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Delete class |

#### Create Class Examples

**Single Class:**
```json
POST /api/classes
{
  "name": "Introduction to Python",
  "description": "Learn Python basics",
  "courseCode": "CS101",
  "instructorId": "507f1f77bcf86cd799439011",
  "roomTypeId": "507f1f77bcf86cd799439012",
  "roomId": "507f1f77bcf86cd799439013",
  "classType": "single",
  "startDate": "2024-03-15",
  "endDate": "2024-03-15",
  "startTime": "09:00",
  "endTime": "10:30"
}
```

**Weekly Recurring Class:**
```json
POST /api/classes
{
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
  "instructorId": "507f1f77bcf86cd799439011",
  "roomTypeId": "507f1f77bcf86cd799439012"
}
```

**Monthly Recurring Class:**
```json
POST /api/classes
{
  "name": "Monthly Review Meeting",
  "classType": "recurring",
  "recurrence": {
    "pattern": "monthly",
    "dayOfMonth": [5, 20],
    "timeSlots": [
      { "startTime": "09:00", "endTime": "10:00" }
    ],
    "endDate": "2024-12-31"
  },
  "instructorId": "507f1f77bcf86cd799439011",
  "roomTypeId": "507f1f77bcf86cd799439012"
}
```

#### Query Parameters

**Get Classes:**
```
GET /api/classes?page=1&limit=10&startDate=2024-03-01&endDate=2024-03-31&instructorId=...
```

**Get Calendar:**
```
GET /api/classes/calendar?startDate=2024-03-01&endDate=2024-03-31&view=month
```

## Scheduling Logic

### Recurrence Patterns

1. **Daily**: Classes repeat every N days
2. **Weekly**: Classes repeat on specific weekdays
3. **Monthly**: Classes repeat on specific days of the month
4. **Custom**: Custom RRule-based patterns

### Time Slot Format
All times use 24-hour format: `HH:mm` (e.g., "09:00", "14:30")

### Conflict Detection
The system automatically prevents:
- Double-booking instructors
- Room conflicts
- Overlapping class times

## Caching Strategy

Redis is used as a read-through cache:
- All class list requests are cached
- Calendar data is cached
- Cache invalidates on create/update/delete
- Default TTL: 1 hour

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/plex-bit |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | - |
| CACHE_TTL | Cache TTL in seconds | 3600 |

## Development

### Running Tests
```bash
npm test
npm run test:coverage
```

### Building for Production
```bash
npm run build
```

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Conventional commits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
