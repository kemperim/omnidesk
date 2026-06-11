const bcrypt = require('bcrypt');
const prisma = require('./prisma');

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  const superadmin = await prisma.user.create({
    data: {
      name: 'Суперадмин',
      email: 'admin@service.kz',
      passwordHash,
      role: 'superadmin',
      orgId: null
    }
  });

  console.log('Суперадмин создан:', superadmin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());