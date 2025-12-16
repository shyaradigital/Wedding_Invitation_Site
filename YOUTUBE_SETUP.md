# YouTube Video Setup Guide

## Overview

The invitation videos are now hosted on YouTube and embedded in the website. This eliminates file size issues and deployment problems.

## Setup Instructions

### 1. Upload Videos to YouTube

1. **Go to YouTube Studio**: https://studio.youtube.com
2. **Click "Create" → "Upload videos"**
3. **Upload your invitation videos:**
   - `invitation-all-events.mp4` - For guests invited to all events
   - `invitation-reception-only.mp4` - For reception-only guests
4. **Set video visibility:**
   - **Recommended**: Set to "Unlisted" (only people with the link can view)
   - Or "Public" if you want it searchable
5. **Get Video IDs:**
   - After uploading, copy the video URL
   - Extract the video ID from the URL
   - Example: `https://www.youtube.com/watch?v=ABC123xyz` → Video ID is `ABC123xyz`

### 2. Set Environment Variables in Vercel

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add the following variables:**

   **For All Events Video:**
   - **Name**: `NEXT_PUBLIC_YOUTUBE_ALL_EVENTS_VIDEO_ID`
   - **Value**: Your YouTube video ID (e.g., `ABC123xyz`)
   - **Environment**: Production, Preview, Development

   **For Reception Only Video:**
   - **Name**: `NEXT_PUBLIC_YOUTUBE_RECEPTION_ONLY_VIDEO_ID`
   - **Value**: Your YouTube video ID (e.g., `XYZ789abc`)
   - **Environment**: Production, Preview, Development

3. **Redeploy** your application

### 3. Local Development

For local development, you can either:

**Option A: Use Demo Videos (Default)**
- The code includes demo video IDs as fallback
- Videos will work for testing without setting environment variables

**Option B: Set Local Environment Variables**
- Create `.env.local` file in project root
- Add:
  ```env
  NEXT_PUBLIC_YOUTUBE_ALL_EVENTS_VIDEO_ID=your-video-id-here
  NEXT_PUBLIC_YOUTUBE_RECEPTION_ONLY_VIDEO_ID=your-video-id-here
  ```

## Demo Videos

Currently using demo video IDs for testing. Replace these with your actual video IDs:

- **All Events Demo**: `dQw4w9WgXcQ` (temporary - replace with your video)
- **Reception Only Demo**: `dQw4w9WgXcQ` (temporary - replace with your video)

## How to Get YouTube Video ID

1. Upload video to YouTube
2. Copy the video URL from browser address bar
3. Extract the ID:
   - Format: `https://www.youtube.com/watch?v=VIDEO_ID`
   - Format: `https://youtu.be/VIDEO_ID`
   - The part after `v=` or after `/` is your video ID

## Video Requirements

- **Format**: MP4, MOV, or any format YouTube supports
- **Aspect Ratio**: Vertical (9:16) recommended for mobile viewing
- **Visibility**: Unlisted (recommended) or Public
- **No size limits**: YouTube handles large files automatically

## Benefits

✅ No file size limits  
✅ No Git LFS issues  
✅ Automatic video optimization  
✅ Works on all devices  
✅ Easy to update (just change video ID)  
✅ Free hosting  
✅ No deployment issues  

## Troubleshooting

### Video Not Loading
- Check if video ID is correct
- Verify video is unlisted or public (not private)
- Check browser console for errors
- Ensure environment variables are set correctly

### Video Shows Demo Content
- Environment variables not set in Vercel
- Set `NEXT_PUBLIC_YOUTUBE_ALL_EVENTS_VIDEO_ID` and `NEXT_PUBLIC_YOUTUBE_RECEPTION_ONLY_VIDEO_ID`
- Redeploy after setting variables

### Video Not Playing on Mobile
- Ensure video is set to "Unlisted" or "Public" (not "Private")
- Check if video allows embedding (should be enabled by default)

