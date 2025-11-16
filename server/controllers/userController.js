import User from '../models/user.js'
import JobApplication from '../models/jobApplication.js'
import Job from '../models/job.js'
import { v2 as cloudinary } from 'cloudinary'
import { extractSkillsFromResume} from '../utils/resumeParser.js'
// Get user data
export const getUserData = async (req,res) => {

    const {userId} = await req.auth()
    try {
        const user = await User.findById(userId)

        if(!user){
           return res.json({success : false , message : 'User not found'})
        }
        res.json({success : true, user})
    } catch (error) {
        res.json({success : false , message : error.message})
    }
}


// Apply for a job
export const applyForJob = async (req,res) => {
    const { jobId } = req.body

    const {userId} = await req.auth()
    
    try{
        const isAlreadyApplied = await JobApplication.find({ jobId, userId})
        if(isAlreadyApplied.length > 0){
            return res.json({success : false , message : 'Already Applied'})
        }
        const jobData = await Job.findById(jobId)
        if(!jobData){
            return res.json({success : false, message : 'Job Not Found'})
        }

        await JobApplication.create({
            companyId : jobData.companyId,
            userId,
            jobId,
            date : Date.now()
        })

        res.json({ success : true, message : 'Applied Successfully'})

    }
    catch(error){
        res.json({success : false , message : error.message})
    }
}

// Get user applied applicatios
export const getUserJobApplications = async (req,res) => {
    
    try {
        const {userId} =  await req.auth()

        const applications = await JobApplication.find({userId})
        .populate('companyId','name email image')
        .populate('jobId','title description location category level salary')
        .exec()

        if(!applications){
            return res.json({success : false , message : 'No job applications found for this user'})
        }
        return res.json({success : true, applications})
    } catch (error) {
        res.json({success : false , message : error.message})
    }
}

// Update user profile(resume)
export const updateUserResume = async (req,res) => {
    
    try {
        
        const {userId} = await req.auth()

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if(resumeFile){
            const skills = await extractSkillsFromResume(resumeFile.path)
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
            userData.skills = skills

        }else{
            return res.status(400).json({success : false , message: 'Resume file not provided'})
        }

        await userData.save()
        return res.json({success : true , message : 'Resume updated'})
    } catch (error) {
        res.json({success : false , message : error.message})
    }
}