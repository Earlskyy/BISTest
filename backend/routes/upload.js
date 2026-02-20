import express from 'express';
import { upload, uploadToCloudinary } from '../utils/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Upload route (can be public or protected depending on use case)
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    
    res.json({
      url: imageUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
