import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser()) // by adding this line , it means that now the request in (req, res) - can access the cookies directly


// routes import 
import userRouter from "./routes/User.routes.js"
import typingSessionRouter from "./routes/TypingSession.routes.js"


// routes declaration
app.use("/api/v1/users", userRouter)

app.use("/api/v1/session", typingSessionRouter)



export {app}