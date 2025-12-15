import mongoose from "mongoose";
 
   
const connectDB = () => {
      const mongodbURI =  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@democluster.ymybf5n.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=democluster`;

            

    mongoose.connect(mongodbURI)
     .then(()=>{
        console.log("connected to mongoDB database");
    })
    .catch((error)=>{
        console.log("connection error:",error);
        process.exit(1)
    });
};


export default connectDB;