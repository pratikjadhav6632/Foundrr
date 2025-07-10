export async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Cloudinary upload failed');
  return data.secure_url;
}

export async function uploadPostImageToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_POST_UPLOAD_PRESET);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Cloudinary upload failed');
  return data.secure_url;
} 