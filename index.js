import  express  from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import SignUpRouter from "./apps/web-client/sign_up_api/router/SignupRouter.js"
import UserProfileRouter from "./apps/web-client/profile/router/ProfileRouter.js"
import PromoterSignup from "./apps/web-client/sign_up_api/router/PromoterSignUpRouter.js"
import Jobrouter from "./apps/web-client/job/router/JobRouter.js"
import Progressrouter from "./apps/web-client/progress/router/ProgressRouter.js"
import SmsRouter from "./apps/web-client/sms/TwiliioApi.js"
import EmailRouter from "./apps/web-client/email/EmailRouter.js"

dotenv.config()

const app = express()

app.use(express.json())
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/naukridb',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
 
})

app.use("/api/users",SignUpRouter)
app.use("/api/userProfile",UserProfileRouter)
app.use("/api/promoter",PromoterSignup)
app.use("/api/job",Jobrouter)
app.use("/api/status",Progressrouter)
app.use("/api/sms",SmsRouter)
app.use("/api/email",EmailRouter)

app.use((err,req,res,next)=>{
    console.log(err)
    res.status(400).send({message:err.message,field:err.field})
    next()
})

//all port configuration
const port  = process.env.PORT || 5000
app.listen(port,()=>{
    console.log(`Serve at http://localhost:${port}`)
})