import express from 'express'
import { changeJobApplicationStatus, changeVisibility, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController.js';
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js';
const router = express.Router();

//Register a company
router.post('/register',upload.single('image'),registerCompany)

// company login
router.post('/login',loginCompany)

// get company data
router.get('/company',protectCompany,getCompanyData)

//Post a job
router.post('/post-job',protectCompany,postJob)

//get applicants data of company
router.get('/applicants',protectCompany,getCompanyJobApplicants)

// Get company job list
router.get('/list-jobs',protectCompany,getCompanyPostedJobs)

// change application status
router.post('/change-status',protectCompany,changeJobApplicationStatus)

// change application visibility
router.post('/change-visibility',protectCompany,changeVisibility)

export default router