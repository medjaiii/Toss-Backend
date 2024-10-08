import multer from "multer"
import multerS3 from "multer-s3"
import S3 from "./AWS_S3_config.js"

const uploadFile = (req, res, next) => {
    const Storage = multer({
        storage: multerS3({
            s3: S3,
            bucket: "tossbucket",
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname })
            },
            key: function (req, file, cb) {
                cb(null, Date.now().toString())
            }
        })
    }).array("profileImages", 5)

    Storage(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: 'Upload Unsuccessful',
                errorMessage: err.message,
                errorCode: err.code
            })
        }
        if (err) {
            return res.status(400).json({
                message: 'Error Occured',
                errorMessage: err.message
            })
        }
        console.log("Upload Successful")
        next()
    })
}



export const uploadSingle = multer({
    storage: multerS3({
        s3: S3,
        bucket: "tossbucket",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname })
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    }
    )
})

const uploadIntroVideo = multer({
    storage: multerS3({
        s3: S3,
        bucket: "tossbucket",  // Your S3 bucket name
        contentType: multerS3.AUTO_CONTENT_TYPE,  // Auto set the content type
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });  // Store the field name as metadata
        },
        key: function (req, file, cb) {
            // Use timestamp as the file key (file name) in S3
            cb(null, Date.now().toString() + '-' + file.originalname);  // Store original file name as well
        }
    }),
    limits: { fileSize: 1024 * 1024 * 50 }  // Set max file size to 50MB (you can adjust this limit)
}).single("profileVideos");  // This handles a single file upload with the field name "userIntroVideo"

// Middleware function to handle errors and upload process
const handleIntroVideoUpload = (req, res, next) => {
    uploadIntroVideo(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: 'Upload Unsuccessful',
                errorMessage: err.message,
                errorCode: err.code
            });
        }
        if (err) {
            return res.status(400).json({
                message: 'Error Occurred',
                errorMessage: err.message
            });
        }
        console.log("Intro video upload successful");
        next();  // Proceed to the next middleware if upload was successful
    });
};
// const fileFilter = (req,file,cb)=>{

//     if(file.mimetype==="image/jpeg" || file.mimetype==="image/jpg" || file.mimetype==="image/png" ){
//         cb(null,true)
//     }else{
//         cb(null,false)
//     }
// }

export default uploadFile
export { handleIntroVideoUpload };
