/**
 * Script to update existing event descriptions in the database
 * This ensures existing guests see the changes immediately
 * Run with: npx tsx scripts/update-event-descriptions.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating event descriptions...')

  // Update mehndi description
  await prisma.event.upsert({
    where: { slug: 'mehndi' },
    update: {
      description: 'Henna painting ceremony, otherwise known as Mehndi, is to be held the night before the wedding as a way of wishing the bride good health and prosperity as she makes her journey on to marriage.',
    },
    create: {
      slug: 'mehndi',
      title: 'Mehendi',
      description: 'Henna painting ceremony, otherwise known as Mehndi, is to be held the night before the wedding as a way of wishing the bride good health and prosperity as she makes her journey on to marriage.',
    },
  })
  console.log('✓ Updated mehndi description')

  // Update wedding description (remove old description)
  await prisma.event.upsert({
    where: { slug: 'wedding' },
    update: {
      description: null,
    },
    create: {
      slug: 'wedding',
      title: 'Hindu Wedding',
      description: null,
    },
  })
  console.log('✓ Removed wedding description')

  // Update reception description (ensure it's set)
  await prisma.event.upsert({
    where: { slug: 'reception' },
    update: {
      description: 'A grand celebration with dinner, music, and dancing.',
    },
    create: {
      slug: 'reception',
      title: 'Reception',
      description: 'A grand celebration with dinner, music, and dancing.',
    },
  })
  console.log('✓ Updated reception description')

  console.log('Event descriptions updated successfully!')
}

main()
  .catch((e) => {
    console.error('Error updating event descriptions:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
