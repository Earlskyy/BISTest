export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors || err.issues
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({ error: 'Invalid reference' });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
