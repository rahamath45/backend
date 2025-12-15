import Room from '../models/Room.js';


export const createRoom = async (req, res, next) => {
try {
const { name, capacity, floor, amenities } = req.body;
const room = new Room({ name, capacity, floor, amenities });
await room.save();
res.status(201).json(room);
} catch (err) {
// handle duplicate name (case-insensitive)
if (err.code === 11000) {
err.status = 400;
err.message = 'Room name must be unique';
}
next(err);
}
};


export const listRooms = async (req, res, next) => {
try {
const { minCapacity, amenity } = req.query;
const filter = {};
if (minCapacity) filter.capacity = { $gte: parseInt(minCapacity, 10) };
if (amenity) filter.amenities = amenity;
const rooms = await Room.find(filter).collation({ locale: 'en', strength: 2 });
res.json(rooms);
} catch (err) { next(err); }
};