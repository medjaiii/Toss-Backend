import multer from "multer"
import multerS3 from "multer-s3"
import S3 from "./AWS_S3_config.js"

const uploadFile = (req,res,next)=>{
    const Storage = multer({
        storage:multerS3({
            s3:S3,
            bucket:"sghapp",
            metadata:function(req,file,cb){
                cb(null,{fieldName: file.fieldname})
            },
            key: function(req,file,cb){
                cb(null, Date.now().toString())
            }
        })
    }).array("profileImages",5)

    Storage(req,res,(err)=>{
        if(err instanceof multer.MulterError){
            return res.status(400).json({
                message:'Upload Unsuccessful',
                errorMessage:err.message,
                errorCode:err.code
            })
        }
        if(err){
            return res.status(500).json({
                message:'Error Occured',
                errorMessage:err.message
            })
        }
        console.log("Upload Successful")
        next()
    })
}



// const fileFilter = (req,file,cb)=>{

//     if(file.mimetype==="image/jpeg" || file.mimetype==="image/jpg" || file.mimetype==="image/png" ){
//         cb(null,true)
//     }else{
//         cb(null,false)
//     }
// }

export default uploadFile