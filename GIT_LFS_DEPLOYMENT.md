# Git LFS Video Files Deployment Issue

## Problem

The video files (`invitation-all-events.mp4` and `invitation-reception-only.mp4`) are stored using Git LFS (Large File Storage) because they exceed GitHub's 100MB file size limit. However, **Vercel does not automatically pull Git LFS files during deployment**, which causes the videos to be missing in production.

## Error Message

When trying to play the video, you'll see:
```
NotSupportedError: Failed to load because no supported source was found.
Video format not supported or file not found. Please verify the video file exists at: /videos/invitation-all-events.mp4
```

## Solutions

### Option 1: Configure Vercel to Pull Git LFS Files (Recommended)

1. **Enable Git LFS in Vercel Build Settings:**
   - Go to Vercel Dashboard → Your Project → Settings → Git
   - Ensure Git LFS is enabled (if available)

2. **Update Build Command:**
   The `vercel.json` has been updated to attempt pulling LFS files, but Vercel's build environment may not have Git LFS installed.

3. **Manual Workaround - Use Vercel CLI:**
   - Install Vercel CLI: `npm i -g vercel`
   - Pull LFS files locally: `git lfs pull`
   - Deploy with files: `vercel --prod`

### Option 2: Use External Storage (Best for Production)

Store videos on a CDN or cloud storage service:

1. **Upload videos to:**
   - AWS S3 + CloudFront
   - Cloudinary
   - Vercel Blob Storage
   - YouTube (unlisted) or Vimeo

2. **Update video paths in code:**
   ```typescript
   const videoSrc = isAllEvents
     ? 'https://your-cdn.com/videos/invitation-all-events.mp4'
     : 'https://your-cdn.com/videos/invitation-reception-only.mp4'
   ```

### Option 3: Remove from Git LFS and Use Alternative

1. **Remove files from Git LFS:**
   ```bash
   git lfs untrack "*.mp4"
   git rm --cached public/videos/*.mp4
   git commit -m "Remove videos from LFS"
   ```

2. **Upload videos manually to Vercel:**
   - Use Vercel's file upload feature
   - Or use a different hosting method

### Option 4: Use Vercel Blob Storage (Recommended for Vercel)

1. **Install Vercel Blob:**
   ```bash
   npm install @vercel/blob
   ```

2. **Upload videos to Vercel Blob:**
   ```typescript
   import { put } from '@vercel/blob';
   
   const blob = await put('invitation-all-events.mp4', file, {
     access: 'public',
   });
   ```

3. **Update video paths to use blob URLs**

## Current Status

- ✅ Videos are stored in Git LFS locally
- ✅ Videos exist in `public/videos/` directory
- ❌ Videos are NOT being deployed to Vercel (LFS files not pulled)
- ✅ Error handling shows helpful error messages

## Quick Fix for Testing

To test locally, the videos work fine because Git LFS files are pulled locally. For production, you'll need to implement one of the solutions above.

## Recommended Action

**For immediate fix:** Use Option 2 (External Storage) or Option 4 (Vercel Blob Storage) to host the videos on a CDN, then update the video source paths in the code.

