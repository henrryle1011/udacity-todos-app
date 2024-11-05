import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Ensure region is set, typically via env variable
})

// S3 bucket name from environment variables
const bucketName = process.env.TODOS_S3_BUCKET
const signedUrlExpireSeconds = 60 * 5  // 5 minutes expiration

// Helper function to generate a presigned URL for uploading an object
const getPutSignedUrl = async (key) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  try {
    // Generate the signed URL with expiration time
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: signedUrlExpireSeconds,
    })
    return presignedUrl
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw new Error('Could not generate presigned URL')
  }
}

// Function to generate both presigned upload URL and public image URL
const generateImageUrl = async (imageId) => {
  // Generate a presigned URL for PUT requests (upload)
  const presignedUrl = await getPutSignedUrl(imageId)

  // Generate the public URL to access the image after upload
  const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageId}`

  return { presignedUrl, imageUrl }
}

export {
  getPutSignedUrl,
  generateImageUrl
}
