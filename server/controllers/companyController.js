import {v2 as cloudinary} from 'cloudinary'
import bcrypt from 'bcrypt'
import Company from '../models/company.js'
import generateToken from '../utils/generateToken.js'
import Job from '../models/job.js'
import JobApplication from '../models/jobApplication.js'
// Register a new company
export const registerCompany = async (req,res) => {
    const {name , email , password} = req.body;
    
    const imageFile = req.file

    if(!name || !email || !password || !imageFile){
        return res.status(400).json({success : false,message : "Missing Details"})
    }

    try{
        const companyExists = await Company.findOne({email})

        if(companyExists){
            return res.status(409).json({success : false,message: "Company already registered"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password : hashPassword,
            image : imageUpload.secure_url
        })

        res.status(201).json({
            success : true,
            company : {
                _id : company._id,
                name : company.name,
                email : company.email,
                image : company.image
            },
            token : generateToken(company._id)
        })


    }
    catch(error){
        res.status(500).json({success : false, message : error.message})
    }
}

// Company Login
export const loginCompany = async (req,res) => {
    const { email , password } = req.body

    try{
        const company = await Company.findOne({email})
        if(!company){
            return res.status(401).json({success : false , message : "Invalid email"})
        }
        if( await bcrypt.compare(password,company.password)){
            res.status(200).json({
                success : true,
                company : {
                    _id : company._id,
                    name : company.name,
                    email : company.email,
                    image : company.image
                },
                token : generateToken(company._id)
            })
        }else{
            res.status(401).json({success : false, message : 'Invalid password'})
        }
    }
    catch(error){
        res.status(500).json({success : false , message : error.message})
    }
}

// Get company data
export const getCompanyData = async (req,res) => {
    
    try {
        const company = req.company
        res.status(200).json({success : true, company})
    } catch (error) {
        res.status(500).json({success : false, message : error.message})
    }
}

// Post a new job
export const postJob = async (req,res) => {
    const { title , description , category , location , salary , level } = req.body

    const companyId = req.company._id
    
    try {

        const newJob = new Job({
            title,
            description,
            category,
            location,
            salary,
            companyId,
            date : Date.now(),
            level
        })

        await newJob.save()
        res.status(201).json({success : true, newJob})
    }
    catch(error){
        res.status(500).json({success : false,message : error.message})
    }
}

// Get company job applicant
export const getCompanyJobApplicants = async (req,res) => {
    try {
        const companyId = req.company._id

        // Find job applications for the user and populate related data
        const applications = await JobApplication.find({companyId})
        .populate('userId','name image resume')
        .populate('jobId','title location category level salary')
        .exec()

        return res.status(200).json({success : true , applications})
    } catch (error) {
        res.status(500).json({success : false , message : error.message})
    }
}

// Get company posted jobs
export const getCompanyPostedJobs = async (req,res) => {
    try {
        const companyId = req.company._id
        const jobs = await Job.find({companyId})

        // (ToDo) Adding No. of applicants into in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({jobId : job._id})
            return {...job.toObject(), applicants:applicants.length}
        }))
        res.status(200).json({success : true, jobsData})

    } catch (error) {
        res.status(500).json({success : false , message : error.message})
    }
}

// change job application status (PATCH method)
export const changeJobApplicationStatus = async (req,res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        
        const application = await JobApplication.findById(id)
        if (!application) {
            return res.status(404).json({success : false, message : 'Application not found'})
        }
        
        // Find Job application data and update status
        await JobApplication.findOneAndUpdate({_id : id},{status})
        res.status(200).json({success : true, message : 'Status updated successfully'})
    } catch (error) {
        res.status(500).json({success : false , message : error.message})
    }
}

// change job visibility (PATCH method)
export const changeVisibility = async (req,res) => {
    try {
        const { id } = req.params
        const companyId = req.company._id

        const job = await Job.findById(id)
        
        if (!job) {
            return res.status(404).json({success : false, message : 'Job not found'})
        }
        
        if(companyId.toString() !== job.companyId.toString()){
            return res.status(403).json({success : false, message : 'Not authorized to modify this job'})
        }
        
        job.visible = !job.visible
        await job.save()

        res.status(200).json({success : true , message: 'Job visibility updated', job})

    } catch (error) {
        res.status(500).json({success : false, message : error.message})
    }
}

// Delete a job (DELETE method)
export const deleteJob = async (req,res) => {
    try {
        const { id } = req.params
        const companyId = req.company._id

        const job = await Job.findById(id)
        
        if (!job) {
            return res.status(404).json({success : false, message : 'Job not found'})
        }
        
        if(companyId.toString() !== job.companyId.toString()){
            return res.status(403).json({success : false, message : 'Not authorized to delete this job'})
        }
        
        // Delete all applications related to this job
        await JobApplication.deleteMany({jobId: id})
        
        // Delete the job
        await Job.findByIdAndDelete(id)

        res.status(200).json({success : true , message: 'Job deleted successfully'})

    } catch (error) {
        res.status(500).json({success : false, message : error.message})
    }
}
