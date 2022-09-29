const Course = require('../models/Course')
const errorResponse = require('../utilities/errorResponse')
const asyncHandler = require('../middleware/async')
const Bootcamp = require("../models/Bootcamp");

// @desc    Get All Courses
// @route   GET/api/v1/courses
// @route   GET/api/v1/bootcamps/:bootcampId/courses
// access   public

exports.getCourses = asyncHandler(async (req, res, next) =>{
  let query;

  if (req.params.bootcampId){
      query = Course.find({ bootcamp: req.params.bootcampId })
  }  else{
      query = Course.find().populate('bootcamp')
  }

  const courses = await query

    res.status(200).json({
        success: true,
        count:courses.length,
        data: courses
    })
})

// @desc    Get Single Course
// @route   GET/api/v1/courses/:id
// access   public
exports.getCourse = asyncHandler(async (req, res, next) =>{
    const course = await Course.findById(req.params.id)
    if(!Course){
        return next(
            new errorResponse(`Course not found with id of ${req.params.id}`,400)
        )
    }
    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Add Course
// @route   POST/api/v1/courses/
// @route   POST/api/v1/bootcamps/:bootcampId/courses
// access   private
exports.addCourse = asyncHandler(async (req, res, next) =>{
    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if(!bootcamp){
        return next(
            new errorResponse(`No bootcamp with the id of ${req.params.bootcampId}`,404)
        )
    }
    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Update Course
// @route   PUT/api/v1/courses/:id
// access   private
exports.updateCourse = asyncHandler(async (req, res, next) =>{

    let course = await Course.findById(req.params.id)

    if(!course){
        return next(
            new errorResponse(`No course with the id of ${req.params.id}`,404)
        )
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        success: true,
        data: course
    })
})

// @desc    Update Course
// @route   PUT/api/v1/courses/:id
// access   private
exports.deleteCourse = asyncHandler(async (req, res, next) =>{

    let course = await Course.findByIdAndDelete(req.params.id)

    if(!course){
        return next(
            new errorResponse(`No course with the id of ${req.params.id}`,404)
        )
    }
    await course.remove()
    res.status(200).json({
        success: true,
        data: { }
    })
})
