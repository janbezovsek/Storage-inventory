import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  getItems,
  importItems,
  uploadPhoto,
  deletePhoto,
} from '../controllers/itemController.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// multer config for Excel imports (temp storage)
const excelUpload = multer({ dest: 'temp/' })

// multer config for photos (permanent storage)
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `item-${req.params.id}-${Date.now()}${ext}`)
  }
})
const photoUpload = multer({ storage: photoStorage })

// Routes
router.get('/',                                         getItems)
router.post('/import', requireAdmin, excelUpload.single('file'), importItems)
router.post('/:id/photo', requireAdmin, photoUpload.single('photo'), uploadPhoto)
router.delete('/:id/photo', requireAdmin,               deletePhoto)

export default router