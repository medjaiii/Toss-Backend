import aws from "aws-sdk"

const S3 = new aws.S3({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
    Bucket:process.env.AWS_STORAGE_BUCKET_NAME
})


export default S3

