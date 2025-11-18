import jwt from 'jsonwebtoken'
import Company from '../models/company.js'

export const protectCompany = async (req,res,next) => {
    // Get token from headers (for API calls) or query params (for EJS pages)
    const token = req.headers.token || req.query.token

    if(!token){
        // Check if it's a browser request (EJS page) or API request
        const isHtmlRequest = req.path.includes('/report') || req.accepts('html')
        
        if(isHtmlRequest){
            return res.status(401).send(`
                <!DOCTYPE html>
                <html><head><title>Unauthorized</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>🔒 Authentication Required</h1>
                    <p>Please log in to view this report.</p>
                    <a href="/" style="color: #667eea; text-decoration: none; font-weight: bold;">Go to Home</a>
                </body></html>
            `)
        }
        
        return res.status(401).json({success : false,message : 'Not authorized , Login again'})
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.company = await Company.findById(decoded.id).select('-password')
        
        next()
    }
    catch(error){
        // Check if it's a browser request (EJS page) or API request
        const isHtmlRequest = req.path.includes('/report') || req.accepts('html')
        
        if(isHtmlRequest){
            return res.status(401).send(`
                <!DOCTYPE html>
                <html><head><title>Unauthorized</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>🔒 Invalid or Expired Token</h1>
                    <p>Your session has expired. Please log in again.</p>
                    <a href="/" style="color: #667eea; text-decoration: none; font-weight: bold;">Go to Home</a>
                </body></html>
            `)
        }
        
        return res.status(401).json({success : false, message : error.message})
    }
}