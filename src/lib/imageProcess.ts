'use client'

// Max dimension (width or height) after resize
const MAX_DIMENSION = 1920
// JPEG quality after resize (0–1)
const JPEG_QUALITY = 0.85
// Max file size before processing (25 MB — iPhones can shoot large HEIC)
export const MAX_RAW_SIZE = 25 * 1024 * 1024

export function isHeic(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  )
}

/**
 * Convert HEIC → JPEG blob using heic2any (browser only).
 */
export async function convertHeic(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: JPEG_QUALITY })
  return Array.isArray(result) ? result[0] : result
}

/**
 * Resize and compress an image blob using the Canvas API.
 * Returns a new JPEG blob no larger than MAX_DIMENSION on either side.
 */
export function resizeImage(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        // Already small enough — just re-encode as JPEG to normalise format
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
          'image/jpeg',
          JPEG_QUALITY
        )
        return
      }

      // Scale down proportionally
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width)
        width = MAX_DIMENSION
      } else {
        width = Math.round((width * MAX_DIMENSION) / height)
        height = MAX_DIMENSION
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => reject(new Error('Failed to load image for resizing'))
    img.src = url
  })
}

/**
 * Full processing pipeline: HEIC conversion (if needed) → resize → return JPEG blob + filename.
 */
export async function processImage(file: File): Promise<{ blob: Blob; filename: string }> {
  let blob: Blob = file

  if (isHeic(file)) {
    blob = await convertHeic(file)
  }

  blob = await resizeImage(blob)

  // Always use .jpg extension after processing
  const filename = file.name.replace(/\.(heic|heif|png|webp|gif)$/i, '') + '.jpg'
  return { blob, filename }
}
