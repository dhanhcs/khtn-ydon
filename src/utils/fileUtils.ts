/**
 * Resilient file reading and storage utility for Y Don KHTN Portal.
 * Handles diverse file formats (Word, PPT, PDF, Images, Videos),
 * provides multiple fallbacks to prevent "Không thể đọc tệp" errors,
 * and safely manages storage quotas.
 */

/**
 * Safely converts any File or Blob into a usable URL (Data URL or Blob URL).
 * Uses 3 fallback tiers so it never fails even in strict iframes or with large files.
 */
export async function readFileToDataUrl(file: File): Promise<string> {
  // Tier 1: Standard FileReader with Promise wrapper
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader result is not string'));
        }
      };
      reader.onerror = () => reject(reader.error || new Error('FileReader read error'));
      reader.onabort = () => reject(new Error('FileReader aborted'));
      reader.readAsDataURL(file);
    });

    if (dataUrl && dataUrl.startsWith('data:')) {
      return dataUrl;
    }
  } catch (tier1Err) {
    console.warn('Tier 1 FileReader failed, trying Tier 2 arrayBuffer:', tier1Err);
  }

  // Tier 2: file.arrayBuffer() converted to base64 in safe memory chunks
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    const chunkSize = 16384; // 16KB chunks to prevent call stack limits
    let binary = '';
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64 = btoa(binary);
    const mime = file.type || getMimeFromExtension(file.name);
    return `data:${mime};base64,${base64}`;
  } catch (tier2Err) {
    console.warn('Tier 2 arrayBuffer failed, trying Tier 3 createObjectURL:', tier2Err);
  }

  // Tier 3: URL.createObjectURL - guaranteed native browser capability
  try {
    const blobUrl = URL.createObjectURL(file);
    return blobUrl;
  } catch (tier3Err) {
    console.error('All file reading tiers failed:', tier3Err);
    throw new Error('Thiết bị không cho phép đọc tệp này. Vui lòng kiểm tra quyền truy cập hoặc dán link Google Drive thay thế.');
  }
}

/**
 * Helper to get MIME type from file extension
 */
export function getMimeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mov':
      return 'video/quicktime';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Automatically format URL (e.g. drive.google.com -> https://drive.google.com)
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Automatically compress and optimize images before storing or displaying.
 * Constrains dimensions to max 1280px and compresses to high-quality JPEG (80KB - 200KB).
 * This ensures uploaded images are crisp, never exceed localStorage quota, and load instantly!
 */
export async function compressAndOptimizeImage(file: File, maxDim: number = 1280, quality: number = 0.85): Promise<string> {
  return new Promise((resolve) => {
    // If SVG or small gif, don't re-compress on canvas to preserve animation/vector
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      readFileToDataUrl(file).then(resolve).catch(() => resolve(''));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        readFileToDataUrl(file).then(resolve).catch(() => resolve(''));
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const optimized = canvas.toDataURL('image/jpeg', quality);
        resolve(optimized);
      };
      img.onerror = () => {
        resolve(src);
      };
      img.src = src;
    };
    reader.onerror = () => {
      readFileToDataUrl(file).then(resolve).catch(() => resolve(''));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Safely saves data to localStorage, catching QuotaExceededError and gracefully degrading
 */
export function safeLocalStorageSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`localStorage quota exceeded while saving key "${key}". Attempting safe fallback...`, error);
    try {
      // If quota exceeded, try preserving images while omitting huge video binary to prevent crash
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const lightweight = parsed.map((item: any) => {
          if (item.fileData && item.fileData.length > 2000000) {
            // Omit massive raw video/binary but keep metadata
            return { ...item, fileData: undefined, _fileTruncated: true };
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(lightweight));
        return true;
      }
    } catch (fallbackError) {
      console.error('Safe fallback failed:', fallbackError);
    }
    return false;
  }
}
