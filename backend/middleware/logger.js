import pool from '../config/database.js';

export const logger = async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Log to console
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${ip}`);
    
    // Log to database if authenticated
    if (req.user?.id) {
      try {
        await pool.query(
          'INSERT INTO system_logs (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
          [
            req.user.id,
            `${req.method} ${req.path}`,
            JSON.stringify({
              statusCode: res.statusCode,
              duration,
              query: req.query,
              body: req.method === 'POST' || req.method === 'PUT' ? '***' : null
            }),
            ip
          ]
        );
      } catch (error) {
        console.error('Failed to log to database:', error);
      }
    }
  });
  
  next();
};
