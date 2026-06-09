import { prisma } from '../db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@boxcricket.com';
    const password = process.env.ADMIN_PASSWORD || 'secret123';
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
        console.log('Admin already exists.');
        return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.admin.create({
        data: {
            email,
            passwordHash
        }
    });
    console.log(`Admin created with email: ${email}`);
    console.log(`Password: ${password}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => {
    process.exit(0);
});
//# sourceMappingURL=seedAdmin.js.map