

const errorhandler = (err,req,res,next) =>{
      console.log(err.stack);
      res.status(err.status || 500).json({
         status:"error",
         message:err.message || "Internal server error"
      })
      next();
}
export default errorhandler;