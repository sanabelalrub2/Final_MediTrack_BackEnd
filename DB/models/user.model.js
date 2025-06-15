import { Schema, model, mongoose } from "mongoose";

const userSchema = new Schema(

    {

        userName: {
            type: String,
            required: true,
            min: 3,
            max: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 4,
        },
        fcmToken: {
            type: String,
        },

     
        phone: {
            type: String,
        },
        adderess: {
            type: String,
        },
        confirmEmail: {
            type: Boolean,
            default: false,
        },
        sendCode: {
            type: String,
            default: null,
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
        },
        status: {
            type: String,
            enum: ['active', 'not_active'],
        },






        emergencyContacts: [
            {
                // 
                name: { type: String, required: true },
                relationship: { type: String },
                phone: { type: String },
                email: { type: String },
            }
        ]

    },








    { timestamps: true, }



);




const userModel = mongoose.models.User || model('User', userSchema);
export default userModel;