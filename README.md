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

#### Validation Logic

Room name must not be empty
Capacity must be ≥ 1
Booking must have valid roomId
Start & end time must be valid ISO dates
Cannot book overlapping times
The server returns clear error messages for invalid requests.

#### What this project solves

Modern offices need a simple way to:
 avoid double-bookings
 see room availability
manage meetings easily
 track room usage

This backend provides a clean API system for any frontend (web/mobile/internal app).
#### Notes

All routes follow REST principles
Clean ESM imports (import/export)
Error handling middleware included
Well-structured controllers

regrads,
S.Rahamathunissa
Email:rahmathsulaiman45@gmail.com