export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png'; // Fallback
  // If it's an uploaded file from our backend
  if (imagePath.startsWith('/uploads')) {
    return import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${imagePath}`
      : `http://localhost:5000${imagePath}`;
  }
  // Otherwise, return original (e.g., https://... from seeder dummy data)
  return imagePath;
};
