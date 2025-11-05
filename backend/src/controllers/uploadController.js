import path from 'path';

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // return accessible URL path
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
};
