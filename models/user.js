import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String
        },
        password: {
            type: String
        },
        userType: {
            type: String
        },
        isSuperAdmin: {
            type: Boolean
        }

    },
    {
        timestamps: true,
    }
)


export const Users = mongoose.model("Users", userSchema);
