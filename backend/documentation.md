# Smart Parking System API Documentation

This document provides details about all the API endpoints available in the Smart Parking System, including request formats, expected inputs, and response structures.

## Table of Contents
- [Users API](#users-api)
- [Slots API](#slots-api)
- [Bookings API](#bookings-api)
- [Error Responses](#error-responses)
- [Complete Booking Flow Documentation](#complete-booking-flow-documentation)

## Users API

### Register a New User
Creates a new user with an associated RFID tag.

- **URL**: `/users/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "uid": "ABCD1234"  // RFID Tag UID
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "uid": "ABCD1234",
    "created_at": "2023-05-18T18:00:00.000Z"
  }
  ```

### Get All Users
Retrieves all users registered in the system.

- **URL**: `/users`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "uid": "ABCD1234",
      "created_at": "2023-05-18T18:00:00.000Z",
      "bookings": []
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "uid": "EFGH5678",
      "created_at": "2023-05-18T19:00:00.000Z",
      "bookings": []
    }
  ]
  ```

### Get User by ID
Retrieves user information by ID.

- **URL**: `/users/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "uid": "ABCD1234",
    "created_at": "2023-05-18T18:00:00.000Z",
    "bookings": []
  }
  ```

### Get User by RFID UID
Retrieves user information by RFID tag ID.

- **URL**: `/users/rfid/:uid`
- **Method**: `GET`
- **URL Parameters**: `uid=[string]`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "uid": "ABCD1234",
    "created_at": "2023-05-18T18:00:00.000Z",
    "bookings": []
  }
  ```

## Slots API

### Create a New Parking Slot
Creates a new parking slot in the system.

- **URL**: `/slots`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "slot_number": "A1"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "slot_number": "A1",
    "is_occupied": false
  }
  ```

### Get All Slots
Retrieves all parking slots.

- **URL**: `/slots`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "slot_number": "A1",
      "is_occupied": false
    },
    {
      "id": 2,
      "slot_number": "A2",
      "is_occupied": true
    }
  ]
  ```

### Get Available Slots
Retrieves all available (unoccupied) parking slots.

- **URL**: `/slots/available`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "slot_number": "A1",
      "is_occupied": false
    },
    {
      "id": 3,
      "slot_number": "A3",
      "is_occupied": false
    }
  ]
  ```

### Get Slot by ID
Retrieves information about a specific parking slot.

- **URL**: `/slots/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "slot_number": "A1",
    "is_occupied": false,
    "bookings": []
  }
  ```

### Set Slot Occupancy
Updates the occupancy status of a parking slot.

- **URL**: `/slots/:id/occupy`
- **Method**: `PATCH`
- **URL Parameters**: `id=[integer]`
- **Request Body**:
  ```json
  {
    "occupied": true
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "message": "Slot status updated successfully"
  }
  ```

### Search Available Slots by Time
Searches for available parking slots during a specific time period.

- **URL**: `/slots/search`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "startTime": "2023-05-20T14:00:00.000Z",
    "endTime": "2023-05-20T16:00:00.000Z",
    "location": "Section A"  // Optional
  }
  ```
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "slot_number": "A1",
      "is_occupied": false
    },
    {
      "id": 3,
      "slot_number": "A3",
      "is_occupied": false
    }
  ]
  ```

## Bookings API

### Create a New Booking
Creates a new parking slot booking.

- **URL**: `/bookings`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "rfIdTagId": "ABCD1234",
    "slotId": 2,
    "startTime": "2023-05-20T14:00:00.000Z",
    "endTime": "2023-05-20T16:00:00.000Z"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "rfIdTagId": "ABCD1234",
    "slotId": 2,
    "startTime": "2023-05-20T14:00:00.000Z",
    "endTime": "2023-05-20T16:00:00.000Z",
    "checkInTime": null,
    "checkOutTime": null,
    "status": "active",
    "createdAt": "2023-05-18T20:00:00.000Z"
  }
  ```

### Get All Bookings
Retrieves all bookings in the system.

- **URL**: `/bookings`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "rfIdTagId": "ABCD1234",
      "slotId": 2,
      "startTime": "2023-05-20T14:00:00.000Z",
      "endTime": "2023-05-20T16:00:00.000Z",
      "checkInTime": null,
      "checkOutTime": null,
      "status": "active",
      "createdAt": "2023-05-18T20:00:00.000Z",
      "slot": {
        "id": 2,
        "slot_number": "A2",
        "is_occupied": true
      }
    }
  ]
  ```

### Get Booking by ID
Retrieves information about a specific booking.

- **URL**: `/bookings/:id`
- **Method**: `GET`
- **URL Parameters**: `id=[integer]`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "rfIdTagId": "ABCD1234",
    "slotId": 2,
    "startTime": "2023-05-20T14:00:00.000Z",
    "endTime": "2023-05-20T16:00:00.000Z",
    "checkInTime": null,
    "checkOutTime": null,
    "status": "active",
    "createdAt": "2023-05-18T20:00:00.000Z",
    "slot": {
      "id": 2,
      "slot_number": "A2",
      "is_occupied": true
    }
  }
  ```

### Get User Bookings
Retrieves all bookings for a specific user.

- **URL**: `/bookings/user/:email`
- **Method**: `GET`
- **URL Parameters**: `email=[string]`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "rfIdTagId": "ABCD1234",
      "slotId": 2,
      "startTime": "2023-05-20T14:00:00.000Z",
      "endTime": "2023-05-20T16:00:00.000Z",
      "checkInTime": null,
      "checkOutTime": null,
      "status": "active",
      "createdAt": "2023-05-18T20:00:00.000Z",
      "slot": {
        "id": 2,
        "slot_number": "A2",
        "is_occupied": true
      }
    }
  ]
  ```

### Get Booking by RFID Tag ID
Retrieves active booking information by RFID tag ID, useful for access control.

- **URL**: `/bookings/rfid/:rfIdTagId`
- **Method**: `GET`
- **URL Parameters**: `rfIdTagId=[string]`
- **Response**: `200 OK`
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "rfIdTagId": "ABCD1234",
    "slotId": 2,
    "startTime": "2023-05-20T14:00:00.000Z",
    "endTime": "2023-05-20T16:00:00.000Z",
    "checkInTime": null,
    "checkOutTime": null,
    "status": "active",
    "createdAt": "2023-05-18T20:00:00.000Z",
    "slot": {
      "id": 2,
      "slot_number": "A2",
      "is_occupied": true
    }
  }
  ```

### Verify RFID Access (For Gate/Barrier Systems)
Simplified endpoint specifically for gate/barrier systems to verify if an RFID tag has an active booking.
Returns a minimal response for embedded systems.

- **URL**: `/bookings/verify-rfid/:rfIdTagId`
- **Method**: `GET`
- **Success Response**: `200 OK`
  ```json
  {
    "statusCode": 200,
    "Name": "John Doe"
  }
  ```
- **Error Response**: `404 Not Found`
  ```json
  {
    "statusCode": 404,
    "message": "No active booking found for this RFID tag",
    "error": "Not Found"
  }
  ```

### Get Active Bookings
Retrieves all currently active bookings.

- **URL**: `/bookings/status/active`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "rfIdTagId": "ABCD1234",
      "slotId": 2,
      "startTime": "2023-05-20T14:00:00.000Z",
      "endTime": "2023-05-20T16:00:00.000Z",
      "checkInTime": null,
      "checkOutTime": null,
      "status": "active",
      "createdAt": "2023-05-18T20:00:00.000Z",
      "slot": {
        "id": 2,
        "slot_number": "A2",
        "is_occupied": true
      }
    }
  ]
  ```

### Complete a Booking
Marks a booking as completed (e.g., when the car leaves).

- **URL**: `/bookings/:id/complete`
- **Method**: `PATCH`
- **URL Parameters**: `id=[integer]`
- **Response**: `200 OK`
  ```json
  {
    "message": "Booking marked as completed"
  }
  ```

### Cancel a Booking
Cancels an active booking.

- **URL**: `/bookings/:id`
- **Method**: `DELETE`
- **URL Parameters**: `id=[integer]`
- **Response**: `200 OK`
  ```json
  {
    "message": "Booking cancelled successfully"
  }
  ```

### Cleanup Expired Bookings
Administrative endpoint to clean up expired bookings.

- **URL**: `/bookings/maintenance/cleanup`
- **Method**: `POST`
- **Response**: `200 OK`
  ```json
  {
    "message": "Expired bookings cleanup complete",
    "processedCount": 3
  }
  ```

## Error Responses

All endpoints can return the following error responses:

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### Bad Request (400)
```json
{
  "statusCode": 400,
  "message": "Invalid input data",
  "error": "Bad Request"
}
```

### Internal Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Complete Booking Flow Documentation

This section provides a comprehensive walkthrough of the complete parking process, from searching for available slots to exiting the parking facility.

### Step 1: Finding Available Parking Slots

The first step in the process is to search for available parking slots during the desired time period.

**API Call:**
```http
POST /slots/search
Content-Type: application/json

{
  "startTime": "2023-05-25T09:00:00Z",
  "endTime": "2023-05-25T18:00:00Z"
}
```

**Response:**
```json
[
  {
    "id": 1,
    "slot_number": "A1",
    "is_occupied": false
  },
  {
    "id": 4,
    "slot_number": "B2",
    "is_occupied": false
  }
]
```

This endpoint checks:
- Which slots are currently not occupied
- Which slots don't have any overlapping bookings during the requested time period
- Returns only slots that are completely available for the entire duration

### Step 2: Creating a Booking

Once the user selects a slot from the available options, a booking can be created.

**API Call:**
```http
POST /bookings
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "rfIdTagId": "ABCD1234",
  "slotId": 4,
  "startTime": "2023-05-25T09:00:00Z",
  "endTime": "2023-05-25T18:00:00Z"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "rfIdTagId": "ABCD1234",
  "slotId": 4,
  "startTime": "2023-05-25T09:00:00Z",
  "endTime": "2023-05-25T18:00:00Z",
  "checkInTime": null,
  "checkOutTime": null,
  "status": "active",
  "createdAt": "2023-05-24T15:30:00.000Z"
}
```

During this process:
- The system validates that the slot is available
- Checks for any booking conflicts
- Creates a new active booking
- Associates the RFID tag with the booking

### Step 3: Check-In Process (Entering the Parking Area)

When a user arrives at the parking facility, they scan their RFID tag at the entry gate.

**API Call (RFID Scan at Entry):**
```http
PATCH /bookings/scan-rfid/ABCD1234
```

**Response (Entry - First Scan):**
```json
{
  "statusCode": 200,
  "action": "Entry",
  "message": "Welcome, John Doe!",
  "slotNumber": "A2",
  "checkInTime": "2023-05-25T09:15:00Z"
}
```

What happens during check-in:
- The system checks if the booking status is "active" (confirms it's the first scan)
- Updates the booking status to "checked_in"
- Records the check-in time
- The slot is confirmed as physically occupied
- The gate opens and displays a welcome message with the assigned slot number
- The user proceeds to their reserved parking slot

If verification fails (no active booking, wrong time, etc.), the response will be a 404 error.

### Step 4: Check-Out Process (Exiting the Parking Area)

When the user is ready to leave, they scan their RFID tag again at the exit gate.

**API Call (RFID Scan at Exit):**
```http
PATCH /bookings/scan-rfid/ABCD1234
```

**Response (Exit - Second Scan):**
```json
{
  "statusCode": 200,
  "action": "Exit",
  "message": "Thank you, John Doe! Come again.",
  "parkingDuration": "2h 15m",
  "checkOutTime": "2023-05-25T11:30:00Z"
}
```

What happens during check-out:
1. The system detects that the booking status is already "checked_in" (confirms it's the second scan)
2. Updates the booking status to "completed"
3. Records the check-out time
4. Calculates the parking duration
5. Updates the slot status to "available" (is_occupied = false)
6. The gate opens for exit with