/**
 * Database setup script for production
 * This script sets up the database schema and seeds initial data
 * Run with: npx tsx scripts/setup-database.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')

  // Check if admin exists
  const email = process.env.ADMIN_EMAIL || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  })

  if (!existingAdmin) {
    console.log('Creating admin user...')
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.admin.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
      },
    })
    console.log('Admin user created:', email)
  } else {
    console.log('Admin user already exists:', email)
  }

  // Seed events
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
  console.log('Database setup complete!')
}

main()
  .catch((e) => {
    console.error('Error setting up database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

