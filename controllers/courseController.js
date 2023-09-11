import Course from "../models/courseModel.js";
import AppError from "../utils/error.util.js";
import fs from 'fs/promises'
import cloudinary from 'cloudinary'

const getAllCourses = async function(req,res,next){
    try {
        const courses = await Course.find({}).select('-lectures');  // select everything and not lectures
    
        res.status(200).json({
            success: true,
            message: "All courses",
            courses
        });
    } catch (error) {
        return next(
            new AppError(error.message,500)
        )
    }
}

const getLectureByCourseId = async function(req,res,next){
    try {

        const { id } = req.params;
        const course = await Course.findById(id);

        if(!course){
            return next(
                new AppError('Invalid course id',500) 
            )
        }

        res.status(200).json({
            success: true,
            message: "All courses",
            lectures: course.lectures
        });
        
    } catch (error) {
        return next(
            new AppError(error.message,500)
        )
    }
    next();
}

const createCourse = async function(req,res,next){
    try {
        const { title, description, category, createdBy} = req.body;

        if(!title || !description || !category || !createdBy){
            return next(
                new AppError('All field are required', 400)
            )
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: 'Dummy',
                secure_url: 'Dummy',
            },
        });

        if(!course){
            return next(
                new AppError("Course could not be created, please try again", 500)
            )
        }

        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,{
                    folder: 'lms'
                });
    
                if(result){
                    course.thumbnail.public_id = result.public_id;
                    course.thumbnail.secure_url = result.secure_url;
                }
            } catch (error) {
                new AppError(error.message, 500)
            }

            fs.rm(`uploads/${req.file.filename}`);
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: "Course created successfully",
            course
        })

    } catch (error) {
        return next(
            new AppError(error.message,500)
        )
    }
}

const updateCourse = async function(req,res,next){
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(
            id,{
                $set: req.body  // data which need to be modified is only modified 
            },
            {
                runValidators: true  // data recieved in as per model
            }
        );
        if(!course){
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }
        res.status(200).json({
            success: true,
            message: 'Course updated successfulyy',
            course
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}

const removeCourse = async function(req,res,next){
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if(!course){
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }

        await Course.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Course removed successfulyy',
            course
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}

const addLectureToCourseId = async(req,res,next)=>{
    try {
        const { title, description} = req.body;
        const { id }= req.params;

        const course = await Course.findById(id);

        if(!title || !description){
            return next(
                new AppError('All field are required', 400)
            )
        }

        if(!course){
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }

        const lectureData = {
            title,
            description,
            lecture:{}
            
        };

        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,{
                    folder: 'lms'
                });
    
                if(result){
                    lectureData.lecture.public_id = result.public_id;
                    lectureData.lecture.secure_url = result.secure_url;
                }
                
            } catch (error) {
                new AppError(error.message, 500)
            }
            fs.rm(`uploads/${req.file.filename}`);
        }

        course.lectures.push(lectureData);
        course.numbersofLectures = course.lectures.length;

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Your lecture sucessfully added to course',
            course
        })

    } catch (error) {
        return next(
            new AppError(error.message, 500)
        )
    }
}

const deleteLectureCourseId = async(req,res,next)=>{
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if(!course){
            return next(
                new AppError('Course with given id does not exist', 500)
            )
        }

        course.lectures.pop(lectureData);
        course.numbersofLectures = course.lectures.length;

    } catch (error) {
        
    }
}

export{
    getAllCourses,
    getLectureByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseId,
    deleteLectureCourseId
}