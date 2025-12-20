import sharp from 'sharp'
import * as path from 'path'
import * as fs from 'fs'

async function enhanceMehndiImages() {
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  const originalPath = path.join(imagesDir, 'Mehndi_Background.jpg')
  const mirroredPath = path.join(imagesDir, 'Mehndi_Background_Mirrored.jpg')
  
  // Check if images exist
  if (!fs.existsSync(originalPath)) {
    console.error('❌ Original image not found:', originalPath)
    return
  }
  
  if (!fs.existsSync(mirroredPath)) {
    console.error('❌ Mirrored image not found:', mirroredPath)
    return
  }

  console.log('✨ Enhancing Mehndi background images...\n')

  try {
    // Create backup directory
    const backupDir = path.join(imagesDir, 'backup')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Enhance original image - write to temp file first
    console.log('📸 Processing original image...')
    const originalTempPath = path.join(imagesDir, 'Mehndi_Background_enhanced.jpg')
    const originalBackupPath = path.join(backupDir, 'Mehndi_Background_backup_' + Date.now() + '.jpg')
    
    // Create backup first
    fs.copyFileSync(originalPath, originalBackupPath)
    console.log('   📋 Backup created')
    
    await sharp(originalPath)
      .modulate({
        brightness: 1.05,      // Slightly brighter
        saturation: 1.15,      // More vibrant colors
        hue: 0                 // No hue shift
      })
      .sharpen({
        sigma: 1.2,            // Moderate sharpening
        flat: 1.0,
        jagged: 2.0
      })
      .normalise()             // Normalize contrast
      .gamma(1.1)              // Slight gamma adjustment for better mid-tones
      .jpeg({ quality: 90 })   // High quality JPEG
      .toFile(originalTempPath)

    // Try to replace - if it fails, at least we have the enhanced version
    try {
      fs.copyFileSync(originalTempPath, originalPath)
      fs.unlinkSync(originalTempPath)
      console.log('✅ Original image enhanced and replaced\n')
    } catch (err) {
      console.log('⚠️  Could not replace original file (may be in use), but enhanced version saved as:', originalTempPath)
      console.log('   You can manually replace it when the file is not in use.\n')
    }

    // Enhance mirrored image with same settings
    console.log('📸 Processing mirrored image...')
    const mirroredTempPath = path.join(imagesDir, 'Mehndi_Background_Mirrored_enhanced.jpg')
    const mirroredBackupPath = path.join(backupDir, 'Mehndi_Background_Mirrored_backup_' + Date.now() + '.jpg')
    
    // Create backup first
    fs.copyFileSync(mirroredPath, mirroredBackupPath)
    console.log('   📋 Backup created')
    
    await sharp(mirroredPath)
      .modulate({
        brightness: 1.05,      // Slightly brighter
        saturation: 1.15,      // More vibrant colors
        hue: 0                 // No hue shift
      })
      .sharpen({
        sigma: 1.2,            // Moderate sharpening
        flat: 1.0,
        jagged: 2.0
      })
      .normalise()             // Normalize contrast
      .gamma(1.1)              // Slight gamma adjustment for better mid-tones
      .jpeg({ quality: 90 })   // High quality JPEG
      .toFile(mirroredTempPath)

    // Try to replace - if it fails, at least we have the enhanced version
    try {
      fs.copyFileSync(mirroredTempPath, mirroredPath)
      fs.unlinkSync(mirroredTempPath)
      console.log('✅ Mirrored image enhanced and replaced\n')
    } catch (err) {
      console.log('⚠️  Could not replace mirrored file (may be in use), but enhanced version saved as:', mirroredTempPath)
      console.log('   You can manually replace it when the file is not in use.\n')
    }
    console.log('🎉 Both images have been enhanced successfully!')
    console.log('   - Increased brightness (5%)')
    console.log('   - Increased saturation (15%)')
    console.log('   - Applied sharpening')
    console.log('   - Normalized contrast')
    console.log('   - Adjusted gamma for better mid-tones')
    
  } catch (error) {
    console.error('❌ Error enhancing images:', error)
    process.exit(1)
  }
}

enhanceMehndiImages()
