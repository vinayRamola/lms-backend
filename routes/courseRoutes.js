import { Router  } from "express";
import { authorizedRoles, isLoggedIn } from "../middlewares/authMiddleware.js";

import { addLectureToCourseId, createCourse, deleteLectureCourseId, getAllCourses, getLectureByCourseId, removeCourse, updateCourse } from "../controllers/courseController.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

router.route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,authorizedRoles('ADMIN'),
        upload.single('thumbnail'),
        createCourse
        );

// router.post('/course/create', isLoggedIn,authorizedRoles('ADMIN'),
// upload.single('thumbnail'),
// createCourse)

router.route('/:id')
    .get(isLoggedIn, authorizedRoles('ADMIN'), getLectureByCourseId)
    .put(isLoggedIn, authorizedRoles('ADMIN'), updateCourse)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeCourse)
    .post(isLoggedIn, authorizedRoles('ADMIN'), upload.single('lecture'), addLectureToCourseId)

      
export default router;