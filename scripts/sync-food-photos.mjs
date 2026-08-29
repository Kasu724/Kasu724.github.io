import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const publicDirectory = join(repositoryRoot, 'public')
const foodDirectory = join(publicDirectory, 'images', 'food')
const foodDataFile = join(repositoryRoot, 'src', 'data', 'foodPhotos.ts')
const supportedExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'])
const arrayOpeningPattern = /export const foodPhotos: FoodPhoto\[\] = \[\r?\n/
const r2OriginalPrefix = 'originals'
const r2ThumbnailPrefix = 'thumbnails'
const thumbnailVariants = [
  { width: 400, height: 300, quality: 75 },
  { width: 800, height: 600, quality: 78 },
]
const syncConcurrency = 4
const contentTypes = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
])

try {
  loadEnvFile(join(repositoryRoot, '.env.local'))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const r2EnvironmentKeys = [
  'R2_ENDPOINT',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
]
const configuredR2EnvironmentKeys = r2EnvironmentKeys.filter((key) => process.env[key])

if (configuredR2EnvironmentKeys.length > 0 && configuredR2EnvironmentKeys.length < r2EnvironmentKeys.length) {
  const missingKeys = r2EnvironmentKeys.filter((key) => !process.env[key])
  throw new Error(`R2 configuration is incomplete. Missing: ${missingKeys.join(', ')}`)
}

const r2IsConfigured = configuredR2EnvironmentKeys.length === r2EnvironmentKeys.length
const r2Client = r2IsConfigured
  ? new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null

async function findFoodImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const images = []

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      images.push(...await findFoodImages(entryPath))
      continue
    }

    if (entry.isFile() && supportedExtensions.has(extname(entry.name).toLowerCase())) {
      images.push(entryPath)
    }
  }

  return images
}

function toPublicSource(filePath) {
  return `/${relative(publicDirectory, filePath).split(sep).join('/')}`
}

function toR2ObjectKey(filePath) {
  const relativePath = relative(foodDirectory, filePath).split(sep).join('/')
  return `${r2OriginalPrefix}/${relativePath}`
}

function toR2ThumbnailObjectKey(filePath, width) {
  const relativePath = relative(foodDirectory, filePath).split(sep).join('/')
  return `${r2ThumbnailPrefix}/${width}w/${relativePath}.webp`
}

function toR2PublicSource(objectKey) {
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/')
  return `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${encodedKey}`
}

function hasSource(fileContents, source) {
  const doubleQuotedSource = JSON.stringify(source)
  const singleQuotedSource = `'${source.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

  return fileContents.includes(`src: ${doubleQuotedSource}`)
    || fileContents.includes(`src: ${singleQuotedSource}`)
}

function hasR2ObjectSource(fileContents, objectKey) {
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/')

  return fileContents.includes(`/${encodedKey}"`) || fileContents.includes(`/${encodedKey}'`)
}

function replaceSource(fileContents, source, replacement) {
  const replacementSource = `src: ${JSON.stringify(replacement)}`
  const doubleQuotedSource = `src: ${JSON.stringify(source)}`
  const singleQuotedSource = `src: '${source.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

  return fileContents
    .replaceAll(doubleQuotedSource, replacementSource)
    .replaceAll(singleQuotedSource, replacementSource)
}

async function objectExists(objectKey) {
  try {
    await r2Client.send(new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
    }))
    return true
  } catch (error) {
    const statusCode = error.$metadata?.httpStatusCode

    if (statusCode === 404 || error.name === 'NotFound' || error.name === 'NoSuchKey') {
      return false
    }

    throw error
  }
}

async function uploadOriginalToR2(filePath, objectKey) {
  if (await objectExists(objectKey)) return false

  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: objectKey,
    Body: await readFile(filePath),
    ContentType: contentTypes.get(extname(filePath).toLowerCase()),
    CacheControl: 'public, max-age=31536000, immutable',
  }))

  return true
}

async function uploadThumbnailToR2(filePath, objectKey, variant) {
  if (await objectExists(objectKey)) return false

  const thumbnail = await sharp(filePath)
    .rotate()
    .resize({
      width: variant.width,
      height: variant.height,
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: variant.quality, effort: 4 })
    .toBuffer()

  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: objectKey,
    Body: thumbnail,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }))

  return true
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex
      nextIndex += 1
      results[currentIndex] = await callback(items[currentIndex], currentIndex)
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

await mkdir(foodDirectory, { recursive: true })
const foodImages = await findFoodImages(foodDirectory)

if (foodImages.length > 0 && !r2IsConfigured) {
  throw new Error([
    'R2 credentials are required to publish food photos.',
    'Restore the five R2_* values in .env.local on this computer, then run npm run food:sync again.',
    'The source photos are ignored by Git and cannot be served by GitHub Pages directly.',
  ].join(' '))
}

const fileContents = await readFile(foodDataFile, 'utf8')
const syncResults = await mapWithConcurrency(foodImages, syncConcurrency, async (filePath) => {
  const localSource = toPublicSource(filePath)
  const originalObjectKey = toR2ObjectKey(filePath)
  const r2Source = r2IsConfigured ? toR2PublicSource(originalObjectKey) : null
  let uploadedOriginal = false
  let uploadedThumbnailCount = 0

  if (r2IsConfigured) {
    uploadedOriginal = await uploadOriginalToR2(filePath, originalObjectKey)
    if (uploadedOriginal) console.log(`Uploaded ${originalObjectKey} to R2.`)

    for (const variant of thumbnailVariants) {
      const thumbnailObjectKey = toR2ThumbnailObjectKey(filePath, variant.width)
      const uploadedThumbnail = await uploadThumbnailToR2(filePath, thumbnailObjectKey, variant)
      if (uploadedThumbnail) {
        uploadedThumbnailCount += 1
        console.log(`Uploaded ${thumbnailObjectKey} to R2.`)
      }
    }
  }

  if (r2Source && hasSource(fileContents, localSource)) {
    return {
      uploadedOriginal,
      uploadedThumbnailCount,
      missingImage: null,
      sourceReplacement: { source: localSource, replacement: r2Source },
    }
  }

  if (
    (!r2IsConfigured && hasSource(fileContents, localSource))
    || hasR2ObjectSource(fileContents, originalObjectKey)
    || (r2Source && hasSource(fileContents, r2Source))
  ) {
    return {
      uploadedOriginal,
      uploadedThumbnailCount,
      missingImage: null,
      sourceReplacement: null,
    }
  }

  const fileStats = await stat(filePath)
  return {
    uploadedOriginal,
    uploadedThumbnailCount,
    sourceReplacement: null,
    missingImage: {
      source: r2Source ?? localSource,
      addedAt: fileStats.birthtimeMs || fileStats.ctimeMs || fileStats.mtimeMs,
    },
  }
})
const uploadedOriginalCount = syncResults.filter((result) => result.uploadedOriginal).length
const uploadedThumbnailCount = syncResults.reduce((count, result) => count + result.uploadedThumbnailCount, 0)
const sourceReplacements = syncResults
  .map((result) => result.sourceReplacement)
  .filter((replacement) => replacement !== null)
const missingImages = syncResults
  .map((result) => result.missingImage)
  .filter((image) => image !== null)
  .sort((left, right) => right.addedAt - left.addedAt || left.source.localeCompare(right.source))

function logUploadSummary() {
  if (uploadedOriginalCount > 0) {
    console.log(`Uploaded ${uploadedOriginalCount} original food photo${uploadedOriginalCount === 1 ? '' : 's'} to R2.`)
  }
  if (uploadedThumbnailCount > 0) {
    console.log(`Uploaded ${uploadedThumbnailCount} optimized thumbnail variant${uploadedThumbnailCount === 1 ? '' : 's'} to R2.`)
  }
  if (sourceReplacements.length > 0) {
    console.log(`Updated ${sourceReplacements.length} food photo source${sourceReplacements.length === 1 ? '' : 's'} to use R2.`)
  }
}

if (missingImages.length === 0 && sourceReplacements.length === 0) {
  logUploadSummary()
  console.log('Food photo data is already synchronized.')
  process.exit(0)
}

let updatedContents = sourceReplacements.reduce(
  (contents, { source, replacement }) => replaceSource(contents, source, replacement),
  fileContents,
)

if (missingImages.length > 0) {
  const openingMarkerMatch = updatedContents.match(arrayOpeningPattern)

  if (!openingMarkerMatch) {
    throw new Error(`Could not find the food photo array opening marker in ${foodDataFile}.`)
  }

  const openingMarkerIndex = openingMarkerMatch.index
  const lineEnding = openingMarkerMatch[0].endsWith('\r\n') ? '\r\n' : '\n'
  const newEntries = missingImages.map(({ source }) => [
    '  {',
    `    src: ${JSON.stringify(source)},`,
    "    date: '',",
    "    caption: '',",
    "    restaurant: '',",
    "    location: '',",
    '  },',
  ].join(lineEnding)).join(lineEnding)

  const insertionIndex = openingMarkerIndex + openingMarkerMatch[0].length
  updatedContents = [
    updatedContents.slice(0, insertionIndex),
    `${newEntries}${lineEnding}`,
    updatedContents.slice(insertionIndex),
  ].join('')
}

await writeFile(foodDataFile, updatedContents, 'utf8')
logUploadSummary()
if (missingImages.length > 0) {
  console.log(`Added ${missingImages.length} new food photo entr${missingImages.length === 1 ? 'y' : 'ies'}.`)
}
