// backend/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth.middleware');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration Multer (stockage temporaire en mémoire)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedVideo.includes(file.mimetype) || allowedImage.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez MP4, WebM, MOV pour les vidéos ou JPG, PNG pour les images.'), false);
    }
  }
});

// @desc    Upload vidéo
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'skillup-maroc/videos',
          eager: [
            { streaming_profile: 'hd', format: 'm3u8' }, // HLS pour streaming adaptatif
            { quality: 'auto', format: 'mp4' } // Version MP4 optimisée
          ],
          eager_async: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Erreur upload vidéo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'upload' 
    });
  }
});

// @desc    Upload image (thumbnail)
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Aucun fichier fourni' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'skillup-maroc/thumbnails',
          transformation: [
            { width: 1280, height: 720, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Erreur upload image:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'upload' 
    });
  }
});

// @desc    Supprimer un fichier
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, async (req, res) => {
  try {
    const { type = 'video' } = req.query;
    
    await cloudinary.uploader.destroy(req.params.publicId, {
      resource_type: type
    });

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé'
    });

  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
  }
});

// @desc    Obtenir une signature pour upload direct (côté client)
// @route   GET /api/upload/signature
// @access  Private
router.get('/signature', protect, async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.query.type === 'image' ? 'skillup-maroc/thumbnails' : 'skillup-maroc/videos';
    
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur génération signature' });
  }
});

module.exports = router;
