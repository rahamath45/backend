## Meeting Room Booking – Backend (Node.js + Express + MongoDB)

This project is a backend service for managing meeting rooms and room bookings inside an office or workspace.
It allows admin/users to:

Create meeting rooms
View all rooms
Book a room for a specific date & time
Prevent double-booking
Cancel bookings
View booking reports (room usage)

### Tech Stack

Node.js
Express.js
MongoDB + Mongoose
express-validator (request validation)
Day.js (date comparison)
Morgan (logging)
Cors

Nodemon (dev mode)

### Database Setup

This project uses **MongoDB Atlas** as the database.

Steps:
1. Create a MongoDB Atlas account
2. Create a cluster (Replica Set is enabled by default)
3. Create a database user
4. Whitelist your IP address
5. Copy the connection string

⚠️ MongoDB transactions require a **replica set**.
MongoDB Atlas provides this by default.

### Environment Variables

Create a `.env` file in the project root:

PORT=5000
DB_USER=<mongodb_username>
DB_PASSWORD=<mongodb_password>
DB_NAME=<database_name>

ENCRYPT_SALT_ROUND=10
JWT_AUTH_SECRET_KEY=your_secret_key

These variables are required to connect securely to MongoDB
and to support authentication and encryption.

### Project Structure
Backend/
│── server.js
│── app.js
│── package.json
└── src/
    ├── models/
    │     ├── Room.js
    │     └── Booking.js
    ├── controllers/
    │     ├── roomController.js
    │     └── bookingController.js
    ├── routes/
    │     ├── rooms.js
    │     └── bookings.js
    └── middlewares/
          ├── validateRequest.js
          └── errorHandler.js

### How to Run the Project
1 Install dependencies
npm install

2 Create .env file

Inside project root:
PORT=5000

3 Start the server

Development:
npm run dev


Production:
npm start

### API Overview
1. Rooms
Method	Endpoint	Description
POST	/rooms	Create a meeting room
GET	/rooms	List all rooms
Example Room JSON
{
  "name": "Conference Room A",
  "capacity": 10
}

2. Bookings
Method	Endpoint	Description
POST	/bookings	Create a booking
GET	/bookings	List all bookings
POST	/bookings/:id/cancel	Cancel a booking
GET	/bookings/reports/room-utilization	Room usage report
Example Booking JSON
{
  "roomId": "67236df9961ab23bd86f9332",
  "title": "Team Sync Meeting",
  "organizerEmail": "john@example.com",
  "startTime": "2025-02-12T10:00:00",
  "endTime": "2025-02-12T11:00:00"
}

### MongoDB Transactions

This project uses **MongoDB transactions** to ensure data consistency.

Transactions are used when:
- Creating a booking
- Preventing overlapping bookings
- Cancelling bookings

Why transactions are needed:
- To avoid double-booking
- To ensure room availability updates are atomic
- To rollback changes if any operation fails

Implementation uses Mongoose sessions:

MongoDB Atlas runs as a replica set by default, which is required
for transaction support.

### Testing the APIs (Postman)

1. Start the server:
   npm run dev

2. Open Postman

3. Set header:
   Content-Type: application/json

4. Test endpoints:
   POST /rooms
   POST /bookings
   GET /bookings

5. Send invalid data to verify validation errors.

### Error & Validation Responses

All validation errors follow a standard format:

{
  "error": "ValidationError",
  "messages": [
    {
      "field": "title",
      "message": "title required"
    }
  ]
}

This makes frontend integration easy and predictable.

#### Validation Logic

Room name must not be empty
Capacity must be ≥ 1
Booking must have valid roomId
Start & end time must be valid ISO dates
Cannot book overlapping times
The server returns clear error messages for invalid requests.

### Assumptions & Limitations

- Authentication is not implemented (can be extended)
- Only one booking per room per time slot is allowed
- Time comparisons are handled using ISO 8601 format
- MongoDB Atlas is required for transaction support

#### What this project solves

Modern offices need a simple way to:
 avoid double-bookings
 see room availability
manage meetings easily
 track room usage

This backend provides a clean API system for any frontend (web/mobile/internal app).

### How This Project Meets the Requirements

- Prevents double-booking using transactions
- Provides clean REST APIs
- Uses validation middleware
- Handles errors gracefully
- Follows modular folder structure
- Ready for frontend integration

#### Notes

All routes follow REST principles
Clean ESM imports (import/export)
Error handling middleware included
Well-structured controllers

regrads,
S.Rahamathunissa
Email:rahmathsulaiman45@gmail.com