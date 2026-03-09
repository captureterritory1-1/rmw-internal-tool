import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const materials = [
  { name: 'Italian Marble', hsnCode: '2515', defaultRate: 350 },
  { name: 'Rajasthan White Marble', hsnCode: '2515', defaultRate: 180 },
  { name: 'Black Galaxy Granite', hsnCode: '6802', defaultRate: 220 },
  { name: 'Tan Brown Granite', hsnCode: '6802', defaultRate: 150 },
  { name: 'Steel Grey Granite', hsnCode: '6802', defaultRate: 180 },
  { name: 'Kadappa Stone', hsnCode: '6801', defaultRate: 45 },
  { name: 'Kota Stone', hsnCode: '6801', defaultRate: 35 },
  { name: 'Makrana White Marble', hsnCode: '2515', defaultRate: 280 },
  { name: 'Rajnagar White Marble', hsnCode: '2515', defaultRate: 200 },
  { name: 'Green Marble', hsnCode: '2515', defaultRate: 250 },
]

async function main() {
  console.log('Seeding materials...')
  for (const material of materials) {
    await prisma.material.upsert({
      where: { name: material.name },
      update: material,
      create: material,
    })
  }
  console.log(`Seeded ${materials.length} materials.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
