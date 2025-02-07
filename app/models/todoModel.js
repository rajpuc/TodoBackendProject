import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        status: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Corrected ref
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const TodoModel = mongoose.model("Todo", todoSchema); 
export default TodoModel;
