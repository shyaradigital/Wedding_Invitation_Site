/**
 * Script to seed initial events
 * Run with: npx tsx scripts/seed-events.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const events = [
    {
      slug: 'mehndi',
      title: 'Mehndi & Pithi',
      description: 'Join us for an evening of traditional Mehndi and Pithi ceremonies.',
    },
    {
      slug: 'wedding',
      title: 'Hindu Wedding',
      description: 'The main wedding ceremony where we exchange vows and celebrate our union.',
    },
    {
      slug: 'reception',
      title: 'Reception',
      description: 'A grand celebration with dinner, music, and dancing.',
    },
  ]

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    })
  }

  console.log('Events seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

