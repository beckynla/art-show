import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getUploadsDir } from '@/lib/storage'
import { processUploadedImage } from '@/lib/imageProcessing'
import { getSession } from '@/lib/auth'
import { generateUploadFilename, isAllowedImageType, isValidImageSize, MAX_GIF_SIZE } from '@/lib/images'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!isValidImageSize(file.size)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB' },
        { status: 400 }
      )
    }
    if (file.type === 'image/gif' && file.size > MAX_GIF_SIZE) {
      return NextResponse.json(
        { error: 'GIF too large. Maximum size for GIFs is 5MB' },
        { status: 400 }
      )
    }

    // Ensure uploads directory exists
    const uploadsDir = getUploadsDir()
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Resize, orient and strip metadata; the extension comes from the processed output,
    // not the original filename, so nothing but images can be stored
    let processed
    try {
      processed = await processUploadedImage(Buffer.from(await file.arrayBuffer()), file.type)
    } catch (error) {
      console.error('Error processing image:', error)
      return NextResponse.json(
        { error: 'This image could not be read. Try saving it as a JPEG and uploading again.' },
        { status: 400 }
      )
    }

    const filename = generateUploadFilename(`image.${processed.extension}`)
    await writeFile(path.join(uploadsDir, filename), processed.buffer)

    const url = `/uploads/${filename}`

    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
