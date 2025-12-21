/**
 * Script to update existing event descriptions in the database
 * This ensures existing guests see the changes immediately
 * Run with: npx tsx scripts/update-event-descriptions.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating event descriptions...')

  // Update mehndi title and description
  await prisma.event.upsert({
    where: { slug: 'mehndi' },
    update: {
      title: 'Mehndi',
      description: 'Henna painting ceremony, otherwise known as Mehndi, is to be held the night before the wedding as a way of wishing the bride good health and prosperity as she makes her journey on to marriage.',
    },
    create: {
      slug: 'mehndi',
      title: 'Mehndi',
      description: 'Henna painting ceremony, otherwise known as Mehndi, is to be held the night before the wedding as a way of wishing the bride good health and prosperity as she makes her journey on to marriage.',
    },
  })
  console.log('✓ Updated mehndi title and description')

  // Update wedding description
  await prisma.event.upsert({
    where: { slug: 'wedding' },
    update: {
      description: 'The Wedding Ceremony unites two souls spiritually, mentally and physically. The bond of matrimony is sacred and the ceremony of marriage is conducted according to Vedic traditions.',
    },
    create: {
      slug: 'wedding',
      title: 'Hindu Wedding',
      description: 'The Wedding Ceremony unites two souls spiritually, mentally and physically. The bond of matrimony is sacred and the ceremony of marriage is conducted according to Vedic traditions.',
    },
  })
  console.log('✓ Updated wedding description')

  // Update reception description
  await prisma.event.upsert({
    where: { slug: 'reception' },
    update: {
      description: 'Reception ceremony is celebrated just after the main wedding. It is the first public appearance of the newly wed couple after their marriage.',
    },
    create: {
      slug: 'reception',
      title: 'Reception',
      description: 'Reception ceremony is celebrated just after the main wedding. It is the first public appearance of the newly wed couple after their marriage.',
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
