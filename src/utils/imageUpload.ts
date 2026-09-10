export const resolveImageUrl = (url: string | null | undefined, bucket: string): string => {
  if (!url) return '';

  const uploadPath = `/uploads/`;
  if (url.startsWith(uploadPath) && !url.startsWith(`${uploadPath}${bucket}/`)) {
    return `${uploadPath}${bucket}/${url.slice(uploadPath.length)}`;
  }

  return url;
};