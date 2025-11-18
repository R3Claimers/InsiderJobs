import Job from '../models/job.js'
import JobApplication from '../models/jobApplication.js'
import Company from '../models/company.js'
import mongoose from 'mongoose'

// Get Company Report - Statistics for logged-in company
export const getAdminReport = async (req, res) => {
    try {
        // Get the logged-in company's ID from the protected route
        const companyId = req.company._id

        // Get company details
        const companyData = await Company.findById(companyId)
        
        if (!companyData) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html><head><title>Error</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>Company Not Found</h1>
                    <p>The requested company data could not be found.</p>
                </body></html>
            `)
        }

        // Fetch company-specific data
        const totalJobs = await Job.countDocuments({ companyId })
        const totalApplications = await JobApplication.countDocuments({ companyId })
        const visibleJobs = await Job.countDocuments({ companyId, visible: true })
        const hiddenJobs = await Job.countDocuments({ companyId, visible: false })

        // Application status breakdown (only for this company)
        const pendingApplications = await JobApplication.countDocuments({ companyId, status: 'Pending' })
        const acceptedApplications = await JobApplication.countDocuments({ companyId, status: 'Accepted' })
        const rejectedApplications = await JobApplication.countDocuments({ companyId, status: 'Rejected' })

        // Get recent jobs posted by this company (last 10)
        const recentJobs = await Job.find({ companyId })
            .sort({ date: -1 })
            .limit(10)

        // Get recent applications for this company's jobs (last 10)
        const recentApplications = await JobApplication.find({ companyId })
            .populate('jobId', 'title location')
            .sort({ date: -1 })
            .limit(10)

        // Jobs by category (only this company's jobs)
        const jobsByCategory = await Job.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        // Jobs by location (only this company's jobs)
        const jobsByLocation = await Job.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])

        // Calculate average salary for this company's jobs
        const avgSalaryResult = await Job.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
            { $group: { _id: null, avgSalary: { $avg: '$salary' } } }
        ])
        const avgSalary = avgSalaryResult.length > 0 ? avgSalaryResult[0].avgSalary : 0

        // Get jobs by level (Entry, Mid, Senior)
        const jobsByLevel = await Job.aggregate([
            { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ])

        // Get frontend URL from environment or use default
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

        // Render the EJS template with company-specific data
        res.render('admin-report', {
            companyData,
            stats: {
                totalJobs,
                totalApplications,
                visibleJobs,
                hiddenJobs,
                pendingApplications,
                acceptedApplications,
                rejectedApplications,
                avgSalary
            },
            recentJobs,
            recentApplications,
            jobsByCategory,
            jobsByLocation,
            jobsByLevel,
            generatedAt: new Date().toLocaleString(),
            frontendUrl
        })

    } catch (error) {
        console.error('Error generating company report:', error)
        res.status(500).send(`
            <!DOCTYPE html>
            <html><head><title>Error</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>Error Generating Report</h1>
                <p>An error occurred while generating your analytics report.</p>
                <p style="color: #666;">${error.message}</p>
            </body></html>
        `)
    }
}
