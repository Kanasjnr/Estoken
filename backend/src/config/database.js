const mongoose = require ("mongoose")

const connectDB = async () => {
    try {
         await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        console.log(`MongoDB connected 🎈 `);
    } catch (error) {
    console.error(`Error.message`);
    process.exit(1)
    
    }
    
}

module.exports = connectDB