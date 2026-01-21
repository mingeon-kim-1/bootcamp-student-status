import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash('wrtnedu', 10)
  
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
    },
  })

  // Create default bootcamp config
  await prisma.bootcampConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      seatsPerRow: 10,
      totalRows: 5,
      seatDirection: 'bottom-right-horizontal',
      displayTitle: 'Bootcamp Status',
      useCustomLayout: false,
    },
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
