import { prisma } from './src/db.js';
import bcrypt from 'bcrypt';

async function main() {
  const newEmail = 'Arsalan@boxcricket.com';
  const newPassword = '8897482687@MA_BOX';
  const hash = await bcrypt.hash(newPassword, 10);
  
  await prisma.admin.deleteMany({});
  
  await prisma.admin.create({
    data: {
      email: newEmail,
      passwordHash: hash
    }
  });
  
  console.log('Admin credentials updated in database.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
