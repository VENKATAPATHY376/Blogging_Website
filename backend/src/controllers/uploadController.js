import path from 'path';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  try {
    console.log('📁 Upload request received');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('📄 File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });
    
    // Verify file was actually saved
    if (!fs.existsSync(req.file.path)) {
      console.error('❌ File was not saved to disk:', req.file.path);
      return res.status(500).json({ message: 'File upload failed - file not saved' });
    }
    
    // return accessible URL path
    const url = `/uploads/${req.file.filename}`;
    console.log('✅ Upload successful, URL:', url);
    
    res.json({ 
      url,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Upload controller error:', error);
    res.status(500).json({ message: 'Internal server error during upload' });
  }
};

// Function to copy temp image to post-specific filename
export const copyImageToPost = (tempFilename, postId) => {
  try {
    console.log('📸 copyImageToPost called with:', { tempFilename, postId });
    
    if (!tempFilename || !postId) {
      console.log('📸 ❌ Missing parameters - tempFilename:', tempFilename, 'postId:', postId);
      return false;
    }
    
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const tempPath = path.join(uploadsDir, tempFilename);
    const postPath = path.join(uploadsDir, `post-${postId}.jpg`);
    
    console.log('📸 File paths:', { 
      uploadsDir, 
      tempPath, 
      postPath,
      tempExists: fs.existsSync(tempPath),
      uploadsExists: fs.existsSync(uploadsDir)
    });
    
    if (!fs.existsSync(tempPath)) {
      console.log('📸 ❌ Temp file does not exist:', tempPath);
      // List files in uploads directory for debugging
      try {
        const files = fs.readdirSync(uploadsDir);
        console.log('📸 Files in uploads directory:', files);
      } catch (e) {
        console.log('📸 Could not list uploads directory:', e.message);
      }
      return false;
    }
    
    // Copy the file
    fs.copyFileSync(tempPath, postPath);
    console.log('📸 ✅ File copied successfully');
    
    // Verify the copy worked
    if (fs.existsSync(postPath)) {
      console.log('📸 ✅ Post-specific file created:', postPath);
    } else {
      console.log('📸 ❌ Post-specific file not found after copy:', postPath);
      return false;
    }
    
    // Optionally delete temp file
    try {
      fs.unlinkSync(tempPath);
      console.log('📸 🗑️ Temp file deleted:', tempPath);
    } catch (e) {
      console.log('📸 ⚠️ Could not delete temp file:', e.message);
    }
    
    console.log('📸 ✅ Image processing complete for post:', postId);
    return true;
  } catch (error) {
    console.error('📸 ❌ Error copying image:', error);
    return false;
  }
};
