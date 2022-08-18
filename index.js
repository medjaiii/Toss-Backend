import  express  from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"

import SignUpRouter from "./apps/web-client/sign_up_api/router/SignupRouter.js"

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/naukridb',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
 
})

 
const port  = process.env.PORT || 5000

app.use("/api/users",SignUpRouter)
app.use((err,req,res,next)=>{
    res.status(500).send({message:err.message})
    next()
})

app.listen(port,()=>{
    console.log(`Serve at http://localhost:${port}`)
})