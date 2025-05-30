-- Step 1: Create the schema
CREATE DATABASE IF NOT EXISTS parking;
USE parking;

-- Step 2: Create 'users' table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    uid VARCHAR(50) NOT NULL UNIQUE, -- RFID UID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create 'slots' table
CREATE TABLE slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_number VARCHAR(10) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE
);

-- Step 4: Create 'booking' table
CREATE TABLE booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    slotId INT NOT NULL,
    rfIdTagId VARCHAR(50) NOT NULL, -- RFID UID
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    checkInTime DATETIME NULL,
    checkOutTime DATETIME NULL,
    status ENUM('active', 'checked_in', 'completed', 'cancelled') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_booking_slot FOREIGN KEY (slotId) REFERENCES slots(id) ON DELETE CASCADE
);
