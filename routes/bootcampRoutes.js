const express = require('express')
const { getBootcamps ,getBootcamp, createBootcamps, updateBootcamps, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload } = require('../controllers/bootcampController')

// include other resource router
const courseRouter = require('./courseRoutes')

const router = express.Router()

// Re-route into other resource router
router.use('/:bootcampId/courses',courseRouter)


router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius)
router.route('/:id/photo').put(bootcampPhotoUpload)


router
    .route('/')
    .get(getBootcamps)
    .post(createBootcamps)


router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamps)
    .delete(deleteBootcamp)

module.exports = router
