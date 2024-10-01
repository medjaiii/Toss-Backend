// import multer from "multer"
// import multerS3 from "multer-s3"
// import S3 from "./AWS_S3_config.js"

// const uploadFile = (req,res,next)=>{
//     const Storage = multer({
//         storage:multerS3({
//             s3:S3,
//             bucket:"tossbucket",
//             contentType: multerS3.AUTO_CONTENT_TYPE,
//             metadata:function(req,file,cb){
//                 cb(null,{fieldName: file.fieldname})
//             },
//             key: function(req,file,cb){
//                 cb(null, Date.now().toString())
//             }
//         })
//     }).array("profileImages",5)

//     Storage(req,res,(err)=>{
//         if(err instanceof multer.MulterError){
//             return res.status(400).json({
//                 message:'Upload Unsuccessful',
//                 errorMessage:err.message,
//                 errorCode:err.code
//             })
//         }
//         if(err){
//             return res.status(400).json({
//                 message:'Error Occured',
//                 errorMessage:err.message
//             })
//         }
//         console.log("Upload Successful")
//         next()
//     })
// }



// export const uploadSingle = multer({
//     storage: multerS3({
//         s3:S3,
//         bucket:"tossbucket",
//         contentType: multerS3.AUTO_CONTENT_TYPE,
//         metadata:function(req,file,cb){
//             cb(null,{fieldName: file.fieldname})
//         },
//         key: function(req,file,cb){
//             cb(null, Date.now().toString())
//         }
//       }
//     )
//     })
// // const fileFilter = (req,file,cb)=>{

// //     if(file.mimetype==="image/jpeg" || file.mimetype==="image/jpg" || file.mimetype==="image/png" ){
// //         cb(null,true)
// //     }else{
// //         cb(null,false)
// //     }
// // }

// export default uploadFile


import multer from "multer";
import multerS3 from "multer-s3";
import S3 from "./AWS_S3_config.js";

// Middleware to handle multiple file types (images and video)
const uploadFile = (req, res, next) => {
    const Storage = multer({
        storage: multerS3({
            s3: S3,
            bucket: "tossbucket",
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString());
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * 50, // 50MB max file size
        },
    }).fields([
        { name: "profileImages", maxCount: 5 },  // Field for images
        { name: "introVideo", maxCount: 1 }      // Field for the video
    ]);

    Storage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: "Upload Unsuccessful",
                errorMessage: err.message,
                errorCode: err.code
            });
        }
        if (err) {
            return res.status(400).json({
                message: "Error Occurred",
                errorMessage: err.message
            });
        }
        console.log("Upload Successful");
        next();
    });
};

export default uploadFile;
