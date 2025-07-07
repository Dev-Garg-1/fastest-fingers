import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const TypingSessionSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        wpm: {
            type: Number,
            required: true
        },

        rawWpm: {
            type: Number
        },

        accuracy: {
            type: Number,
            required: true
        },

        correctWords: {
            type: Number,
            required: true
        },

        incorrectWords: {
            type: Number,
            required: true
        },

        duration: {
            type: Number
        },

        startedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)

TypingSessionSchema.plugin(mongooseAggregatePaginate);

export const TypingSession = mongoose.model("TypingSession", TypingSessionSchema);