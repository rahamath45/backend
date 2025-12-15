import express from 'express';
import { body, param } from 'express-validator';
import {
  createBooking,
  listBookings,
  cancelBooking,
  roomUtilization
} from '../controllers/bookingController.js';
import validate from '../middlewares/validateRequest.js';

const bookingsrouter = express.Router();

// Create Booking
bookingsrouter.post(
  '/',
  [
    body('roomId').isString().notEmpty().withMessage('roomId required'),
    body('title').isString().notEmpty().withMessage('title required'),
    body('organizerEmail').isEmail().withMessage('valid email required'),
    body('startTime').isISO8601().withMessage('startTime must be ISO date'),
    body('endTime').isISO8601().withMessage('endTime must be ISO date'),
  ],
  validate,
  createBooking
);

// List Bookings
bookingsrouter.get('/', listBookings);

// Cancel Booking
bookingsrouter.post(
  '/:id/cancel',
  [param('id').isMongoId().withMessage('invalid booking id')],
  validate,
  cancelBooking
);

// Reports → Room Usage
bookingsrouter.get('/reports/room-utilization', roomUtilization);

export default bookingsrouter;
