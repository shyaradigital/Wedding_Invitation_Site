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
      title: 'Mehendi',
      description: 'Henna painting ceremony, otherwise known as Mehndi, is to be held the night before the wedding as a way of wishing the bride good health and prosperity as she makes her journey on to marriage.',
    },
    {
      slug: 'wedding',
      title: 'Hindu Wedding',
      description: null,
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
      update: {
        title: event.title,
        description: event.description,
      },
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

