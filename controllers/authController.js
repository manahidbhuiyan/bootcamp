const User = require("../models/User");
const errorResponse = require('../utilities/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Register User
// @route   POST /api/v1/auth/register
// access   Public
exports.register = asyncHandler( async (req, res, next) => {

    const {name , email, password, role} = req.body

    const user = await User.create({
        name,
        email,
        password,
        role
    })
    const token = user.getSignJwtToken()
        res.status(200).json({
        success: true,
        token
        });
});

// @desc    logIn User
// @route   GET /api/v1/auth/register
// access   Public
exports.login = asyncHandler( async (req, res, next) => {

    const {email, password} = req.body

   // validate email and password
   if(!email || !password){
       return next(new errorResponse('Please Provide an email and password!',400))
   }

   const user = await User.findOne({email}).select('+password')
    // check user register or not
    if (!user){
        return next(new errorResponse('Invalid credentiasl',401))
    }

    //check password validation
    const isMatch = await user.matchPassword(password)

    if (!isMatch){
        return next(new errorResponse('Invalid Password'),401)
    }

    const token = user.getSignJwtToken()
    res.status(200).json({
        success: true,
        token,
        data: user
    });
});