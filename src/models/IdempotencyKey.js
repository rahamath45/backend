import mongoose from 'mongoose';


const idemSchema = new mongoose.Schema({
key: { type: String, required: true },
organizerEmail: { type: String, required: true },
bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
status: { type: String, enum: ['in_progress','done'], default: 'in_progress' },
createdAt: { type: Date, default: Date.now }
});


idemSchema.index({ key: 1, organizerEmail: 1 }, { unique: true });


const IdempotencyKey = mongoose.model('IdempotencyKey', idemSchema);
export default IdempotencyKey;