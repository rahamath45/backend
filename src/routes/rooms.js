
import { body } from 'express-validator';
import { createRoom, listRooms } from '../controllers/roomController.js'; 

import { Router } from 'express';
import validateRequest from '../middlewares/validateRequest.js';

const roomsrouter = Router();

roomsrouter.post('/', [ body('name').isString().notEmpty().withMessage('name required'), body('capacity').isInt({ min: 1 }).withMessage('capacity must be >= 1'), ], validateRequest, createRoom);
roomsrouter.get('/', listRooms);

export default roomsrouter;