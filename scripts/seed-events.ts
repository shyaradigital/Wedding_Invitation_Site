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
      title: 'Mehndi',
      description: 'Henna painting ceremony, otherwise known as Mehndi, is to be held the night before the wedding as a way of wishing the bride good health and prosperity as she makes her journey on to marriage.',
    },
    {
      slug: 'wedding',
      title: 'Hindu Wedding',
      description: 'The Wedding Ceremony unites two souls spiritually, mentally and physically. The bond of matrimony is sacred and the ceremony of marriage is conducted according to Vedic traditions.',
    },
    {
      slug: 'reception',
      title: 'Reception',
      description: 'Reception ceremony is celebrated just after the main wedding. It is the first public appearance of the newly wed couple after their marriage.',
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

