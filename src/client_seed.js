const prisma = require('./prisma');

async function main() {
    const client = await prisma.client.create({
    data: {
        name: 'Тестовый клиент',
        email: 'client@test.kz',
        phone: '+77001234567',
        orgId: '7dc3db5d-3eb8-4747-944b-ca9cd73a0876'
    }
    });
console.log('Клиент создан:', client.email);
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());