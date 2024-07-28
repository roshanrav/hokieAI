import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
    username : {
        type: String,
        required : [true, "Please provide unique Username"],
        unique: [true, "Username Exist"]
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        unique : false,
    },
    email: {
        type: String,
        required : [true, "Please provide a unique email"],
        unique: true,
    },
    firstName: { type: String },
    lastName: { type: String },
    advisorFirstName: { type: String, required: [true, "Please provide the advisor's first name"] },
    advisorLastName: { type: String, required: [true, "Please provide the advisor's last name"] },
    advisorEmail: { type: String, required: [true, "Please provide an advisor email"] },
    major: { type: String, required: [true, "Please provide a major"] },
    standing: { type: String, enum: ['freshman', 'sophomore', 'junior', 'senior', 'graduate'], default: 'freshman' },
    profile: { type: String }

});

export default mongoose.model.Users || mongoose.model('User', UserSchema);