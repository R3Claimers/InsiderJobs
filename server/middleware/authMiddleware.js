import jwt from 'jsonwebtoken'
import Company from '../models/company.js'

export const protectCompany = async (req,res,next) => {
    const token = req.headers.token

    if(!token){
        return res.status(401).json({success : false,message : 'Not authorized , Login again'})
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.company = await Company.findById(decoded.id).select('-password')
        
        next()
    }
    catch(error){
        return res.status(401).json({success : false, message : error.message})
    }
}