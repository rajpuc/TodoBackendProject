import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    emailVerificationToken: { type: String},
    emailVerificationTokenExpires: { type: Date},
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpires: { type: Date, default: null },
    todoList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Todo" }]
},
{
        timestamps: true,
        versionKey: false
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;
