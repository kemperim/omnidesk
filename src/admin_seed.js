const bcrypt = require('bcrypt');
const prisma = require('./prisma');

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  // Создаём суперадмина
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

  // Создаём тестовую организацию
  const organization = await prisma.organization.create({
    data: {
      name: 'Тестовая компания',
      subdomain: 'test'
    }
  });
  console.log('Организация создана:', organization.subdomain);

  // Создаём админа организации
  const admin = await prisma.user.create({
    data: {
      name: 'Админ',
      email: 'admin@test.kz',
      passwordHash,
      role: 'admin',
      orgId: organization.id
    }
  });
  console.log('Админ создан:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());