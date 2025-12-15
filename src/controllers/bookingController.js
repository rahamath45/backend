import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import IdempotencyKey from '../models/IdempotencyKey.js';

// -------------------- Helpers --------------------
function businessHoursCheck(dtStart, dtEnd) {
  // Mon–Fri 08:00–20:00
  const start = DateTime.fromJSDate(dtStart);
  const end = DateTime.fromJSDate(dtEnd);

  // Weekdays 1..5
  if (start.weekday < 1 || start.weekday > 5) return false;
  if (end.weekday < 1 || end.weekday > 5) return false;

  const opening = 8;
  const closing = 20;

  if (start.hour < opening) return false;
  if (end.hour > closing) return false;
  if (end.hour === closing && end.minute > 0) return false;

  return true;
}

async function hasOverlap(roomId, startTime, endTime, excludeBookingId = null) {
  const query = {
    roomId: new mongoose.Types.ObjectId(roomId),
    status: 'confirmed',
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existing = await Booking.findOne(query);
  return !!existing;
}

const { ObjectId } = mongoose.Types;
export const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { roomId, title, organizerEmail, startTime, endTime } = req.body;
    const idemKey = req.header("Idempotency-Key");

    // Convert to ObjectId
    let _roomId;
    try {
      _roomId = new ObjectId(roomId);
    } catch (e) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid roomId" });
    }

    const st = new Date(startTime);
    const et = new Date(endTime);

    // Basic validations
    if (isNaN(st) || isNaN(et)) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid startTime or endTime" });
    }

    if (st >= et) {
      return res.status(400).json({ error: "ValidationError", message: "startTime must be before endTime" });
    }

    const duration = (et - st) / 60000;
    if (duration < 15 || duration > 240) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Booking duration must be 15–240 minutes"
      });
    }

    if (!businessHoursCheck(st, et)) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Bookings allowed Mon–Fri 08:00–20:00"
      });
    }

    const room = await Room.findById(_roomId);
    if (!room) {
      return res.status(404).json({ error: "NotFound", message: "Unknown room" });
    }

    // ---------- IDEMPOTENCY ----------
    if (idemKey) {
      let createdBooking = null;

      try {
        await session.withTransaction(async () => {
          const existingKey = await IdempotencyKey.findOne({
            key: idemKey,
            organizerEmail
          }).session(session);

          if (existingKey) {
            if (existingKey.status === "done") {
              createdBooking = await Booking.findById(existingKey.bookingId).session(session);
              return;
            }
            const err = new Error("Request already in progress");
            err.status = 202;
            throw err;
          }

          await IdempotencyKey.create(
            [{ key: idemKey, organizerEmail, status: "in_progress" }],
            { session }
          );

          // Correct overlap check
          const overlap = await hasOverlap(_roomId, st, et);
          if (overlap) {
            const err = new Error("Overlapping booking");
            err.status = 409;
            throw err;
          }

          const docs = await Booking.create(
            [{ roomId: _roomId, title, organizerEmail, startTime: st, endTime: et }],
            { session }
          );

          const created = docs[0];

          await IdempotencyKey.updateOne(
            { key: idemKey, organizerEmail },
            { $set: { status: "done", bookingId: created._id } }
          ).session(session);

          createdBooking = created;
        });

        if (createdBooking) return res.status(201).json(createdBooking);

      } catch (err) {
        if (err.status === 409)
          return res.status(409).json({ error: "Conflict", message: "Overlapping booking" });

        if (err.status === 202)
          return res.status(202).json({ message: "Request already in progress" });

        return next(err);
      } finally {
        session.endSession();
      }

      return;
    }

    // ---------- NORMAL BOOKING ----------
    const overlap = await hasOverlap(_roomId, st, et);
    if (overlap) {
      return res.status(409).json({ error: "Conflict", message: "Overlapping booking" });
    }

    const booking = new Booking({
      roomId: _roomId,
      title,
      organizerEmail,
      startTime: st,
      endTime: et
    });

    await booking.save();
    session.endSession();
    return res.status(201).json(booking);

  } catch (err) {
    if (session.inTransaction()) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    session.endSession();
    next(err);
  }
};


// -------------------- List Bookings --------------------
export const listBookings = async (req, res, next) => {
  try {
    const { roomId, from, to, limit = 20, offset = 0 } = req.query;

    const filter = {};
    if (roomId) filter.roomId = roomId;
    if (from || to) filter.$and = [];

    if (from) filter.$and.push({ endTime: { $gte: new Date(from) } });
    if (to) filter.$and.push({ startTime: { $lte: new Date(to) } });

    const total = await Booking.countDocuments(filter);
    const items = await Booking.find(filter)
      .sort({ startTime: 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json({
      items,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.log("its",err);
  }
};

// -------------------- Cancel Booking --------------------
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'NotFound', message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.json(booking);
    }

    const now = new Date();
    const oneHourBefore = new Date(booking.startTime.getTime() - 60 * 60 * 1000);

    if (now > oneHourBefore) {
      return res.status(400).json({
        error: 'BusinessRule',
        message: 'Cannot cancel less than 1 hour before startTime'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);

  } catch (err) {
    next(err);
  }
};

// -------------------- Room Utilization Report --------------------
export const roomUtilization = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'from and to are required'
      });
    }

    const fromD = DateTime.fromISO(from);
    const toD = DateTime.fromISO(to);

    if (!fromD.isValid || !toD.isValid) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid dates'
      });
    }

    const rooms = await Room.find();
    const businessDailyHours = 12; // 08:00–20:00

    const results = [];

    for (const room of rooms) {
      const bookings = await Booking.find({
        roomId: room._id,
        status: 'confirmed',
        endTime: { $gte: fromD.toJSDate() },
        startTime: { $lte: toD.toJSDate() }
      });

      let bookedMs = 0;

      // calculate booked hours within business hours
      for (const b of bookings) {
        const s = DateTime.fromJSDate(b.startTime) < fromD ? fromD : DateTime.fromJSDate(b.startTime);
        const e = DateTime.fromJSDate(b.endTime) > toD ? toD : DateTime.fromJSDate(b.endTime);

        let cursor = s.startOf('day');
        const endDay = e.startOf('day');

        while (cursor <= endDay) {
          const businessStart = cursor.set({ hour: 8 });
          const businessEnd = cursor.set({ hour: 20 });

          const dayStart = s > businessStart ? s : businessStart;
          const dayEnd = e < businessEnd ? e : businessEnd;

          if (dayEnd > dayStart) {
            bookedMs += (dayEnd - dayStart);
          }

          cursor = cursor.plus({ days: 1 });
        }
      }

      // total possible business hours
      let cursor2 = fromD.startOf('day');
      const endDay2 = toD.startOf('day');
      let businessDays = 0;

      while (cursor2 <= endDay2) {
        if (cursor2.weekday >= 1 && cursor2.weekday <= 5) {
          businessDays += 1;
        }
        cursor2 = cursor2.plus({ days: 1 });
      }

      const totalBusinessMs =
        businessDays * businessDailyHours * 60 * 60 * 1000;

      const utilizationPercent =
        totalBusinessMs === 0 ? 0 : bookedMs / totalBusinessMs;

      results.push({
        roomId: room._id,
        roomName: room.name,
        totalBookingHours: +(bookedMs / (1000 * 60 * 60)).toFixed(2),
        utilizationPercent: +utilizationPercent.toFixed(4)
      });
    }

    res.json(results);

  } catch (err) {
    next(err);
  }
};
