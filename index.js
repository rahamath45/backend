import express from "express";
import dotenv from "dotenv";

import cors from "cors";
import errorhandler from "./src/middlewares/errorhandler.js";
import connectDB from "./src/config/db.js";
import morgan from "morgan";
import roomsrouter from "./src/routes/rooms.js";
import bookingsrouter from "./src/routes/bookings.js";

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/rooms', roomsrouter);
app.use('/bookings', bookingsrouter);
 

app.use(errorhandler);
const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
      connectDB();
})
