import  express  from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import SignUpRouter from "./apps/web-client/sign_up_api/router/SignupRouter.js"
import UserProfileRouter from "./apps/web-client/profile/router/ProfileRouter.js"

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/naukridb',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
 
})

app.use("/api/users",SignUpRouter)
app.use("/api/userProfile",UserProfileRouter)
app.use((err,req,res,next)=>{
    console.log()
    res.status(500).send({message:err.message,field:err.field})
    next()
})

//all port configuration
const port  = process.env.PORT || 5000
app.listen(port,()=>{
    console.log(`Serve at http://localhost:${port}`)
})