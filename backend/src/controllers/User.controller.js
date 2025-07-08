import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(
            500, 
            "Something went wrong while generating access and refresh tokens"
        )
    }
}


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

    const existedUser = await User.findOne({
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

const loginUser = asyncHandler( async (req, res) => {
    // take details from the frontend - either (username, email) & pwd
    // check if the user is registered or not 
    // if not registered then show error or redirect to the signup page 
    // if registered then redirect to the landing page / dashboard

    const {email, username, password} = req.body;

    if(!username && !email) {
        throw new ApiError(
            400,
            "username or email is required."
        )
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if(!user) {
        throw new ApiError(
            400,
            "user does not exist."
        )
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(
            401,
            "wrong password !!"
        )
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user logged in successfully."
        )
    )
}) 

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            {},
            "user logged out successfully."
        )
    )
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(
            401,
            "Unauthorized request !"
        )
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(
                401,
                "Invalid refresh token !"
            )
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(
                401, 
                "Refresh token is expired or used !"
            )
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "access token refreshed successfully !"
            )
        )
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "invalid refresh token !"
        )
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}