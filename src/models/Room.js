import mongoose from 'mongoose';


const roomSchema = new mongoose.Schema({
name: { type: String, required: true },
capacity: { type: Number, required: true, min: 1 },
floor: { type: Number, default: 0 },
amenities: [{ type: String }]
}, { timestamps: true });


// enforce unique name case-insensitive
roomSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });


const Room = mongoose.model('Room', roomSchema);
export default Room;