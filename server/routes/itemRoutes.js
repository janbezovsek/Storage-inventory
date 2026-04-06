import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getItems,
  importItems,
  uploadPhoto,
  deletePhoto,
} from '../controllers/itemController.js'
import { requireAdmin } from '../middleware/authMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const excelUpload = multer({ dest: 'temp/' })

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `item-${req.params.id}-${Date.now()}${ext}`)
  }
})
const photoUpload = multer({ storage: photoStorage })

router.get('/', getItems)
router.post('/import', requireAdmin, excelUpload.single('file'), importItems)
router.post('/:id/photo', requireAdmin, photoUpload.single('photo'), uploadPhoto)
router.delete('/photo/:photoId', requireAdmin, deletePhoto)

export default router