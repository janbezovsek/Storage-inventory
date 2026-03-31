import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import itemRoutes from './routes/itemRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/items', itemRoutes)
app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))