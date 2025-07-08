import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend 
    // validation - not empty and others as well
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove pwd and refresh token field from response
    // check for user creation
    // return reponse

    const {username, email, password} = req.body;

    if(
        [username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(
            400,
            "All fields are required",
        )
    }

    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(
            409, 
            "Username or email already exist"
        )
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registring the user !"
        )
    }

    return  res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User registered successfully."
        )
    )

})

export {registerUser}