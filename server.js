const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const app = express();
const colors = require('colors')
const fileUpload = require('express-fileupload')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')


// load env vars
dotenv.config({path: './config/config.env'})

// connect to Database
connectDB();


// const logger = require('./middleware/logger')
const morgan = require('morgan')

// import router
const bootcamps = require('./routes/bootcampRoutes')
const courses = require('./routes/courseRoutes')
const auth = require('./routes/authRoutes')


// Body Parser
app.use(express.json());

// app.use(logger)
// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//file uploading
app.use(fileUpload())

//set static folder
app.use(express.static(path.join(__dirname, 'public')))

// mounted routes
app.use('/api/v1/bootcamps',bootcamps)
app.use('/api/v1/courses',courses)
app.use('/api/v1/auth',auth)



// error handeller
app.use(errorHandler)
 
const PORT = process.env.PORT || 5000

const server = app.listen(
    PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT} `.yellow.bold)
)

// Handle unhandled promise rejections

process.on('unhandledRejection',(err,promise) =>{
    console.log(`Error: ${err.message }`.red.bold);
    server.close(() => process.exit(1));
});