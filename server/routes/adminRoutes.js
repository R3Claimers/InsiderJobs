import express from 'express'
import { getAdminReport } from '../controllers/adminController.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Route to get admin report page (protected route)
router.get('/report', protectCompany, getAdminReport)

export default router
