import { validationResult } from 'express-validator';

export default (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "ValidationError",
      messages: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  next();
};
