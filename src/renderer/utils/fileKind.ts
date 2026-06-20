/**
 * 判断文件是否为可编辑文件（Markdown 或纯文本）
 */
export const isEditableFile = (fileName: string): boolean => {
  return /\.(md|markdown|txt)$/i.test(fileName);
};

/**
 * 判断文件是否为图片文件
 */
export const isImageFile = (fileName: string): boolean => {
  return /\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)$/i.test(fileName);
};

/**
 * 根据文件路径获取图片的 MIME 类型
 */
export const getImageMimeType = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'bmp': return 'image/bmp';
    case 'ico': return 'image/x-icon';
    default: return 'image/png';
  }
};
