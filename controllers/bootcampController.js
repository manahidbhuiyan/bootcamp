const path = require('path');
const Bootcamp = require("../models/Bootcamp");
const errorResponse = require('../utilities/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utilities/geocoder');
const {param} = require("express/lib/router");

// @desc    Get all bootcamps
// @route   GET/api/v1/bootcaps
// access   public

exports.getBootcamps = asyncHandler(async (req, res, next) => {

    let query
    // copy req.query
    const reqQuery = {...req.query}

    // fields to execute
    const removeFields = ['select','sort','page','limit'];

    //loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // create query String
    let queryStr = JSON.stringify(req.query);

    // create Operators ($gt, $gte, $lt ... etc)
    queryStr = queryStr.replace(/\b(gt | gte | lt | lte | in)\b/g, match => `$${match}`);

    // finding resources
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

    // select fields
    if (req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields)
    }

    // sort
    if (req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy)
    }else{
        query = query.sort('-name')
    }

    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page - 1) * limit
    const endIndex = page  * limit
    const total = await Bootcamp.countDocuments()

    query = query.skip(startIndex).limit(limit)

    //executing Query
    const bootcamp = await query;

    //pagination result

    const pagination = {}

    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
      success: true,
      count: bootcamp.length,
        pagination,
      data: bootcamp
    });
});
// @desc    Get single bootcamp
// @route   GET/api/v1/bootcaps
// access   public

exports.getBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new errorResponse(`Bootcamp not found with id of ${req.params.id}`,400)
            )
    }
    res.status(200).json({
      success: true,
      data: bootcamp,
    });
});

// @desc    create new bootcamps
// @route   GET/api/v1/bootcaps/:id
// access   Private
exports.createBootcamps = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(200).json({
      success: true,
      data: bootcamp,
    });
});

// @desc   update single bootcamp
// @route   GET/api/v1/bootcaps
// access   Private
exports.updateBootcamps = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        if(!bootcamp){
            return res.status(200).json({success:false})
        }
        res.status(200).json({
          success: true,
          data: bootcamp,
        });
});

// @desc    delete single bootcamp
// @route   GET/api/v1/bootcaps/:id
// access   Private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)
        if(!bootcamp){
            return res.status(200).json({success:false})
        }
        bootcamp.remove()
        res.status(200).json({
          success: true,
          data: {},
        });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// @desc    Upload Photo in Bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// access   Private
exports.bootcampPhotoUpload = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp){
        return next(
            new errorResponse(`Bootcamp not found id of ${req.params.id}`,404)
        )
    }

    if(!req.files){
        return next(
            new errorResponse(`Please Upload a file`,400)
        )
    }
    const file = req.files.file

    //  make sure the file is image
    if (!file.mimetype.startsWith('image')){
     return next(new errorResponse(`please upload a image file`,400))
    }

//    check file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new errorResponse(`please upload an image less then ${process.env.MAX_FILE_UPLOAD}`,400))
    }

//    create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
        if (err){
            console.log(err)
            return next(new errorResponse(`file upload error`,500))
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {photo : file.name});

        res.status(200).json({
            success: true,
            data: file.name
        })
    })

});
