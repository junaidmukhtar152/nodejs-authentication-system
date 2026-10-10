require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = process.argv[2]?.trim().toLowerCase();

        if (!email) {
            console.log(
                "Usage: node scripts/makeAdmin.js user@example.com"
            );
            return;
        }

        const user = await User.findOneAndUpdate(
            { email },
            { role: "admin" },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            console.log("User not found. Register this user first.");
            return;
        }

        console.log("Admin role assigned successfully:");
        console.log({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error("Admin setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

makeAdmin();