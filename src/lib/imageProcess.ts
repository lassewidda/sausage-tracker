'use client'

const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.85
export const MAX_RAW_SIZE = 25 * 1024 * 1024

export function isHeic(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  )
}

/**
 * Try to decode a blob natively via Canvas (works for HEIC in Safari iOS/macOS).
 * Returns null if the browser can't decode it.
 */
function tryNativeDecode(blob: Blob): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url)
      resolve(null)
    }, 10000)
    img.onload = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(timeout)
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

/**
 * Draw an HTMLImageElement to canvas and return a resized JPEG blob.
 */
function imageToJpeg(img: HTMLImageElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let { width, height } = img
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width)
        width = MAX_DIMENSION
      } else {
        width = Math.round((width * MAX_DIMENSION) / height)
        height = MAX_DIMENSION
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob returned null'))),
      'image/jpeg',
      JPEG_QUALITY
    )
  })
}

/**
 * Full processing pipeline:
 * 1. Try native Canvas decode (works for HEIC in Safari)
 * 2. Fall back to heic2any for non-Safari browsers
 * 3. Resize to max 1920px and re-encode as JPEG
 */
export async function processImage(file: File): Promise<{ blob: Blob; filename: string }> {
  const filename = file.name.replace(/\.(heic|heif|png|webp|gif)$/i, '') + '.jpg'

  // Try native decode first (fast path — works on all modern browsers for JPEG/PNG,
  // and for HEIC on Safari iOS/macOS)
  const img = await tryNativeDecode(file)
  if (img) {
    const blob = await imageToJpeg(img)
    return { blob, filename }
  }

  // Native decode failed — try heic2any (for HEIC on Chrome/Firefox)
  if (isHeic(file)) {
    try {
      const heic2anyModule = await import('heic2any')
      const heic2any = heic2anyModule.default ?? heic2anyModule
      const result = await (heic2any as Function)({
        blob: file,
        toType: 'image/jpeg',
        quality: JPEG_QUALITY,
      })
      const converted: Blob = Array.isArray(result) ? result[0] : result
      const convertedImg = await tryNativeDecode(converted)
      if (convertedImg) {
        const blob = await imageToJpeg(convertedImg)
        return { blob, filename }
      }
    } catch (err) {
      console.error('heic2any failed:', err)
    }
  }

  throw new Error('Could not decode image. Try converting to JPEG first.')
}
