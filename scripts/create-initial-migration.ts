/**
 * Script to create initial migration for PostgreSQL
 * Run this before deploying to production
 * 
 * Usage: npx tsx scripts/create-initial-migration.ts
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

console.log('🚀 Creating initial migration for PostgreSQL...\n')

try {
  // Check if migrations directory exists
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true })
    console.log('✅ Created migrations directory')
  }

  // Create initial migration
  console.log('📝 Creating migration...')
  execSync('npx prisma migrate dev --name init --create-only', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db', // Fallback for local
    },
  })

  console.log('\n✅ Migration created successfully!')
  console.log('\n📋 Next steps:')
  console.log('1. Review the migration files in prisma/migrations/')
  console.log('2. Commit the migration files to git')
  console.log('3. After deploying, run: npx prisma migrate deploy')
} catch (error) {
  console.error('\n❌ Error creating migration:', error)
  console.log('\n💡 Alternative: Use "npx prisma db push" for development')
  process.exit(1)
}

