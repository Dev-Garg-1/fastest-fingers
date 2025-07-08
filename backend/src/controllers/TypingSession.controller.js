import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {TypingSession} from "../models/TypingSession.model.js"

const submitSession = asyncHandler (async (req, res) => {
    const userId = req.user._id
    const {
        wpm,
        rawWpm,
        accuracy,
        correctWords,
        incorrectWords,
        duration,
        startedAt
    } = req.body;

    if(
        [wpm, rawWpm, accuracy, correctWords, incorrectWords, duration, startedAt].some(val => val === undefined) 
    ) {
        throw new ApiError(
            400, 
            "missing required fields"
        )
    }

    const session = await TypingSession.create({
        user: userId,
        wpm,
        rawWpm,
        accuracy,
        correctWords,
        incorrectWords,
        duration,
        startedAt
    })

    if(!session) {
        throw new ApiError(
            500, 
            "something went wrong while saving the current session !"
        )
    }

    await User.findByIdAndUpdate(userId, {
        $push: {sessions: session._id}
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            session,
            "Session submitted successfully"
        )
    )
})

const getMySessions = asyncHandler(async (req, res) => {
    const userId = req.user._id
    
    const sessions = await TypingSession.find({user: userId}).sort({createdAt: -1});

    if(!sessions) {
        throw new ApiError(
            400,
            "no sessions are there"
        )
    }

    return res
    .status(200) 
    .json(
        new ApiResponse(
            200, 
            sessions,
            "Fetched sessions successfully !"
        )
    )
})

const getLeaderboard = asyncHandler(async (req, res) => {
  const topSessions = await TypingSession.aggregate([
    {
      $sort: {
        wpm: -1,
        accuracy: -1,
        createdAt: 1,
      },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $project: {
        wpm: 1,
        accuracy: 1,
        correctWords: 1,
        incorrectWords: 1,
        createdAt: 1,
        username: "$userInfo.username",
      },
    },
  ]);

  if(!topSessions) {
    throw new ApiError(
        500,
        "failed to fetch top sessions !"
    )
  }

  return res.status(200).json(
    new ApiResponse(200, topSessions, "Leaderboard data")
  );
});

export {
    submitSession,
    getMySessions,
    getLeaderboard
}