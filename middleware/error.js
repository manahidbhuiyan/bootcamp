const errorResponse = require('../utilities/errorResponse')

const errorHandler = (err, req, res, next) => {

    let error = {...err};
    error.message = err.message

    // log to console for dev 
    console.log(err.stack.red);

// mongoose bad object Id
    if(err.name === 'CastError'){
        const message = `Bootcamp not found with id of ${err.value}`;
        error = new errorResponse(message, 404);
    }

// Mongoose duplicate key

    if(err.code === 11000){
        const message = `Duplicate field value entered`;
        error = new errorResponse(message, 400);
    }

    // Monggose Validation error

    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new errorResponse(message, 400)
    }


    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
    console.log(error)

};

module.exports = errorHandler