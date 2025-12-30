/**
 * NOTE:
 * MongoDB transactions require a replica set.
 * This project uses MongoDB Atlas, which provides
 * replica set support by default.
 */



import mongoose from "mongoose";

const connectDB = async () => {
  const mongodbURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@democluster.ymybf5n.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=democluster`;

  try {
    await mongoose.connect(mongodbURI);
    console.log("connected to mongoDB database");

    //  Replica set verification (IMPORTANT for transactions)
    const admin = mongoose.connection.db.admin();
    const info = await admin.command({ hello: 1 });

    if (info.setName) {
      console.log(`MongoDB Replica Set detected: ${info.setName}`);
    } else {
      console.warn(
        " MongoDB is not running as a replica set. Transactions may fail."
      );
    }
  } catch (error) {
    console.log("connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
