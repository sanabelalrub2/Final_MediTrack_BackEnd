import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB, {
           
        });
        console.log("✅ Database connection established ✅");
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err);
        process.exit(1);  
    }
};









export default connectDb;
