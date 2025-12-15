import mongoose from 'mongoose';


const bookingSchema = new mongoose.Schema({
roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
title: { type: String, required: true },
organizerEmail: { type: String, required: true },
startTime: { type: Date, required: true },
endTime: { type: Date, required: true },
status: { type: String, enum: ['confirmed','cancelled'], default: 'confirmed' },
createdAt: { type: Date, default: Date.now }
});


// index to speed up overlap checks on roomId + start/end
bookingSchema.index({ roomId: 1, startTime: 1, endTime: 1 });


const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;