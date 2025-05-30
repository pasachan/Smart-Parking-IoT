# Smart Parking IoT System

A complete IoT-based smart parking management system with real-time slot monitoring, RFID-based access control, and web-based booking interface.

## 🏗️ Project Architecture

```
Smart Parking IoT/
├── backend/                   # NestJS REST API
├── frontend/                  # React.js Web Application
├── esp-code/                  # ESP32/Arduino Microcontroller Code
└── database/                  # MySQL Database Schema
```

## 🚀 Features

- **Real-time Slot Monitoring**: Live parking slot availability tracking
- **RFID Access Control**: Secure entry/exit using RFID tags
- **Web Booking System**: Online slot reservation with user management
- **IoT Integration**: ESP32-based hardware for sensor data collection
- **RESTful API**: Complete backend API for data management

## 🛠️ Tech Stack

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: MySQL with TypeORM

### Frontend (React.js)
- **Framework**: React.js

### Hardware (ESP32)
- **Microcontroller**: ESP32 Development Board
- **Sensors**: Ultrasonic sensors for vehicle detection
- **RFID**: RC522 RFID reader module
- **Connectivity**: WiFi for cloud communication
- **Display**: I2C Oled display

### Database
- **Primary DB**: MySQL
- **ORM**: TypeORM for database operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Arduino IDE or PlatformIO
- ESP32 Development Board
- RFID RC522 Module
- Ultrasonic Sensors (HC-SR04)

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE smart_parking;
USE smart_parking;

# Import schema
source database/schema.sql;
```

### 2. Backend Setup

```bash
cd backend
npm install

# set mysql credential details in app.module.ts and change the mail credetials in mail.service.ts
# start server

nest start --watch 
```

The backend will be available at `http://localhost:3433`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Configure API endpoint
# Set REACT_APP_API_URL=http://localhost:3433

# Start development server
npm run start
```

The frontend will be available at `http://localhost:3001`

### 4. ESP32 Setup

```bash
# Open esp-code/main.ino in Arduino IDE
# Install required libraries:
# Configure WiFi credentials and API endpoint in the code
# Upload to ESP32 board
```

## 📊 Database Schema

### Slots Table
- `id`: Primary key (auto-increment)
- `slot_number`: Unique slot identifier (VARCHAR 10)
- `is_occupied`: Current occupation status (BOOLEAN)

### Bookings Table
- `id`: Primary key (auto-increment)
- `name`: User name (VARCHAR)
- `email`: User email (VARCHAR)
- `slotId`: Foreign key to slots table
- `rfIdTagId`: RFID tag UID (VARCHAR)
- `startTime`: Booking start time (TIMESTAMP)
- `endTime`: Booking end time (TIMESTAMP)
- `checkInTime`: Actual check-in time (TIMESTAMP, nullable)
- `checkOutTime`: Actual check-out time (TIMESTAMP, nullable)
- `status`: Booking status (ENUM: active, checked_in, completed, cancelled)
- `createdAt`: Record creation timestamp

## 🔌 API Endpoints

### Slots
- `GET /slots` - Get all parking slots
- `GET /slots/:id` - Get specific slot details
- `PUT /slots/:id/status` - Update slot occupation status

### Bookings
- `POST /bookings` - Create new booking
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get specific booking
- `PUT /bookings/:id/checkin` - Check-in to slot
- `PUT /bookings/:id/checkout` - Check-out from slot
- `DELETE /bookings/:id` - Cancel booking

## 🔧 Hardware Setup

- Read the readme.md inside esp32 folder 

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to web server (nginx, apache, etc.)
# or use services like Vercel, Netlify
```

### Database Deployment
- Use cloud services like AWS RDS, Google Cloud SQL
- Or deploy on VPS with proper backup strategies


## 👥 Authors

- **Pareekshit Sachan** - *Initial work*

## 🙏 Acknowledgments

- IoT and embedded systems community
- Open source libraries and frameworks used

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
