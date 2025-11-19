import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from '@sentry/node';
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import path from 'path'
import { fileURLToPath } from 'url'

//Initialize Express
const app = express()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up EJS as view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// Connect to database
await connectDB()
await connectCloudinary()

//Middlewares
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.get('/',(req,res)=> res.status(200).send("API working"))
app.post('/webhooks',clerkWebhooks)
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRoutes)
app.use('/admin',adminRoutes)
// Port
const PORT = process.env.PORT || 5000;
Sentry.setupExpressErrorHandler(app);
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})