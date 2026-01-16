# Admin Music Upload Feature - Setup Guide

## Quick Start

### 1. Access the Admin Dashboard
After logging in with an admin account:
- Click the **"⚙️ Admin Dashboard"** button in the left sidebar
- Or navigate directly to `/admin` route

### 2. Upload Music

#### Step 1: Create an Album
1. Go to the **"Upload Music"** tab
2. Fill in the album details:
   - **Album Title** (required) - Name of your album
   - **Description** - Details about the album
   - **Thumbnail** (required) - Cover art image
3. Click **"Create Album"** button
4. You'll see a success message and the album form will reset

#### Step 2: Add Songs to Album
Once an album is created, a second form appears:
1. Enter song details:
   - **Song Title** (required) - Name of the song
   - **Description** - Song details or lyrics
   - **Audio File** (required) - MP3, WAV, or other audio format
   - **Thumbnail** (optional) - Individual song artwork
2. Click **"Upload Song"** to add it to the album
3. Uploaded songs appear below the form with a delete option

### 3. Manage Your Content

#### Albums Tab
- View all your uploaded albums as cards
- See album title, description, and cover art
- Delete albums (this removes all songs in that album)
- Hover for interactive effects

#### Songs Tab
- View all songs in a list format
- See song title, description, and album association
- Delete individual songs
- Search-friendly list view

### 4. Monitor Statistics
At the top of the dashboard, you'll see:
- **Total Albums**: Count of all albums you've uploaded
- **Total Songs**: Count of all songs across all albums

## Features

✅ **Album Management**
- Create albums with cover art
- Delete albums with confirmation

✅ **Song Management**
- Upload multiple songs per album
- Add optional individual song thumbnails
- Delete songs individually or with album

✅ **Upload Progress**
- Visual progress bar during file uploads
- Real-time status updates
- Success/error notifications

✅ **Security**
- Only admins can access this section
- Token-based authentication
- Automatic redirect to login if needed

## File Requirements

### Album Thumbnail
- **Format**: JPG, PNG, WebP, GIF
- **Size**: Recommended 300x300px or larger
- **Max Size**: 5MB

### Song Audio File
- **Format**: MP3, WAV, FLAC, OGG, AAC
- **Bitrate**: 128kbps minimum (256kbps recommended)
- **Duration**: Any length
- **Max Size**: 100MB (varies by service)

### Song Thumbnail (Optional)
- **Format**: JPG, PNG, WebP, GIF
- **Size**: Recommended 300x300px
- **Max Size**: 5MB

## Troubleshooting

### Upload Fails
- Check file size limits
- Ensure files are in correct format
- Verify you have valid admin credentials
- Check network connection

### Admin Dashboard Won't Load
- Confirm you're logged in
- Verify your account has admin role
- Clear browser cache and try again
- Check browser console for errors

### Can't See Uploaded Music
- Refresh the page
- Switch tabs and back to see updated lists
- Check your internet connection
- Verify files uploaded successfully (check for success message)

### Files Appear but Can't Delete
- Confirm you have admin privileges
- Verify you're still logged in
- Try refreshing the page

## Tips

💡 **Upload Organization**
- Create themed albums for better organization
- Use consistent naming conventions
- Add descriptive album descriptions
- Provide high-quality cover art

💡 **Performance**
- Upload during off-peak hours for faster speeds
- Compress images before uploading
- Use appropriate audio bitrate
- Upload one song at a time for stability

💡 **Best Practices**
- Always add album thumbnails
- Use descriptive titles and descriptions
- Add individual song thumbnails for consistency
- Keep backups of your audio files
- Review uploads before making them public

## Keyboard Shortcuts

While in the form:
- `Tab` - Move between fields
- `Enter` - Submit form (when focused on submit button)
- `Escape` - May close modals/dialogs

## API Integration

The feature integrates with these endpoints:
- `POST /api/v1/album/new` - Create album
- `POST /api/v1/song/new` - Create song
- `POST /api/v1/song/:id` - Add song thumbnail
- `DELETE /api/v1/album/:id` - Delete album
- `DELETE /api/v1/song/:id` - Delete song
- `GET /api/v1/albums` - Fetch all albums
- `GET /api/v1/songs` - Fetch all songs

## Support

For issues or features requests:
1. Check the troubleshooting section
2. Review error messages in browser console
3. Verify all files meet requirements
4. Contact your system administrator

---

**Version**: 1.0
**Last Updated**: January 2026
**Status**: Production Ready
