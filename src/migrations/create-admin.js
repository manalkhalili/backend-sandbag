const bcrypt = require("bcryptjs");
const { User } = require("/src/models"); // غيري حسب مسار ملف models

async function createAdmin() {
    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (existingAdmin) {
        console.log("Admin already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);
    await User.create({
        name: "Admin",
        email: "admin@sandbag.com",
        password: hashedPassword,
        role: "admin",
        phone: "0590000000"
    });

    console.log("✅ Admin account created successfully!");
}

createAdmin().catch(console.error);
