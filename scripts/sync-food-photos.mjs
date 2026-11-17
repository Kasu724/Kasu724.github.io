import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mkdir, open, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import ts from 'typescript'

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const publicDirectory = join(repositoryRoot, 'public')
const foodDirectory = join(publicDirectory, 'images', 'food')
const foodDataFile = join(repositoryRoot, 'src', 'data', 'foodPhotos.ts')
const foodSyncStateFile = join(repositoryRoot, '.food-photo-sync.local')
const foodSyncLockFile = join(repositoryRoot, '.food-photo-sync-lock.local')
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
      images.push(relative(foodDirectory, entryPath).split(sep).join('/'))
    }
  }

  return images
}

function toPublicSource(imagePath) {
  return `/images/food/${imagePath}`
}

function toR2ObjectKey(imagePath) {
  return `${r2OriginalPrefix}/${imagePath}`
}

function toR2ThumbnailObjectKey(imagePath, width) {
  return `${r2ThumbnailPrefix}/${width}w/${imagePath}.webp`
}

function encodeObjectKey(objectKey) {
  return objectKey.split('/').map(encodeURIComponent).join('/')
}

function toR2PublicSource(objectKey) {
  return `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${encodeObjectKey(objectKey)}`
}

function hasSource(fileContents, source) {
  const doubleQuotedSource = JSON.stringify(source)
  const singleQuotedSource = `'${source.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

  return fileContents.includes(`src: ${doubleQuotedSource}`)
    || fileContents.includes(`src: ${singleQuotedSource}`)
}

function hasR2ObjectSource(fileContents, objectKey) {
  const encodedKey = encodeObjectKey(objectKey)

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

function removePhotoEntries(fileContents, deletedImages) {
  if (deletedImages.length === 0) return fileContents

  const sourceFile = ts.createSourceFile(foodDataFile, fileContents, ts.ScriptTarget.Latest, true)
  const photoArray = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === 'foodPhotos')
    ?.initializer

  if (!photoArray || !ts.isArrayLiteralExpression(photoArray) || sourceFile.parseDiagnostics.length > 0) {
    throw new Error(`Could not read the food photo array in ${foodDataFile}.`)
  }

  const objectKeys = deletedImages.map(toR2ObjectKey)
  const sources = new Set([...deletedImages.map(toPublicSource), ...objectKeys.map(toR2PublicSource)])
  const r2Paths = new Set(objectKeys.map((key) => `/${encodeObjectKey(key)}`))
  const tokens = photoArray.getChildren(sourceFile)
    .find((child) => child.kind === ts.SyntaxKind.SyntaxList)
    .getChildren(sourceFile)
  let updatedContents = fileContents

  // Work backwards so edits leave earlier source positions intact.
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const entry = tokens[index]
    if (!ts.isObjectLiteralExpression(entry)) continue

    const source = entry.properties.find((property) =>
      ts.isPropertyAssignment(property) && property.name.text === 'src',
    )?.initializer
    if (!source || !ts.isStringLiteralLike(source)) continue
    if (!sources.has(source.text) && !r2Paths.has(URL.parse(source.text)?.pathname)) continue

    const start = entry.getStart(sourceFile)
    const lineStart = fileContents.lastIndexOf('\n', start - 1) + 1
    const indentation = /^[\t ]*$/.test(fileContents.slice(lineStart, start))
    const comma = tokens[index + 1]
    const end = comma?.kind === ts.SyntaxKind.CommaToken ? comma.end : entry.end
    const lineBreak = indentation ? /^[\t ]*\r?\n/.exec(fileContents.slice(end))?.[0] ?? '' : ''

    updatedContents = updatedContents.slice(0, indentation ? lineStart : start)
      + updatedContents.slice(end + lineBreak.length)
  }

  return updatedContents
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

async function deletePhotoFromR2(imagePath) {
  const objectKeys = [
    ...thumbnailVariants.map(({ width }) => toR2ThumbnailObjectKey(imagePath, width)),
    toR2ObjectKey(imagePath),
  ]

  for (const objectKey of objectKeys) {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
    }))
    console.log(`Deleted ${objectKey} from R2.`)
  }
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
  const workers = await Promise.allSettled(Array.from({ length: workerCount }, () => worker()))
  const failedWorker = workers.find((workerResult) => workerResult.status === 'rejected')
  if (failedWorker) throw failedWorker.reason
  return results
}

async function uploadPhotoToR2(imagePath) {
  const filePath = join(foodDirectory, imagePath)
  const originalObjectKey = toR2ObjectKey(imagePath)
  const uploadedOriginal = await uploadOriginalToR2(filePath, originalObjectKey)
  let uploadedThumbnailCount = 0

  if (uploadedOriginal) console.log(`Uploaded ${originalObjectKey} to R2.`)

  for (const variant of thumbnailVariants) {
    const thumbnailObjectKey = toR2ThumbnailObjectKey(imagePath, variant.width)
    const uploadedThumbnail = await uploadThumbnailToR2(filePath, thumbnailObjectKey, variant)
    if (uploadedThumbnail) {
      uploadedThumbnailCount += 1
      console.log(`Uploaded ${thumbnailObjectKey} to R2.`)
    }
  }

  return { uploadedOriginal, uploadedThumbnailCount }
}

async function readSyncState() {
  try {
    return JSON.parse(await readFile(foodSyncStateFile, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function writeAtomically(path, contents) {
  const temporaryFile = `${path}.tmp.local`
  await writeFile(temporaryFile, contents, 'utf8')
  await rename(temporaryFile, path)
}

function logUploadSummary(syncResults) {
  const uploadedOriginalCount = syncResults.filter((result) => result.uploadedOriginal).length
  const uploadedThumbnailCount = syncResults.reduce((count, result) => count + result.uploadedThumbnailCount, 0)
  if (uploadedOriginalCount > 0) {
    console.log(`Uploaded ${uploadedOriginalCount} original food photo${uploadedOriginalCount === 1 ? '' : 's'} to R2.`)
  }
  if (uploadedThumbnailCount > 0) {
    console.log(`Uploaded ${uploadedThumbnailCount} optimized thumbnail variant${uploadedThumbnailCount === 1 ? '' : 's'} to R2.`)
  }
}

function addPhotoEntries(fileContents, missingImages) {
  const openingMarkerMatch = fileContents.match(arrayOpeningPattern)

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
  return fileContents.slice(0, insertionIndex) + newEntries + lineEnding + fileContents.slice(insertionIndex)
}

async function updatePhotoEntries(fileContents, imagePaths, deletedImages) {
  let updatedContents = removePhotoEntries(fileContents, deletedImages)
  let replacementCount = 0
  const missingImages = []

  for (const imagePath of imagePaths) {
    const localSource = toPublicSource(imagePath)
    const objectKey = toR2ObjectKey(imagePath)
    const r2Source = toR2PublicSource(objectKey)

    if (hasSource(updatedContents, localSource)) {
      updatedContents = replaceSource(updatedContents, localSource, r2Source)
      replacementCount += 1
    } else if (!hasR2ObjectSource(updatedContents, objectKey)) {
      const fileStats = await stat(join(foodDirectory, imagePath))
      missingImages.push({
        source: r2Source,
        addedAt: fileStats.birthtimeMs || fileStats.ctimeMs || fileStats.mtimeMs,
      })
    }
  }

  if (missingImages.length > 0) {
    missingImages.sort((left, right) => right.addedAt - left.addedAt || left.source.localeCompare(right.source))
    updatedContents = addPhotoEntries(updatedContents, missingImages)
  }

  return { updatedContents, replacementCount, addedCount: missingImages.length }
}

async function syncFoodPhotos() {
  await mkdir(foodDirectory, { recursive: true })
  const imagePaths = await findFoodImages(foodDirectory)
  const state = await readSyncState()

  if (!r2IsConfigured) {
    if (imagePaths.length > 0 || state?.images.length > 0) {
      throw new Error('R2 credentials are required to synchronize food photos. Restore the five R2_* values in .env.local, then run npm run food:sync again.')
    }
    console.log('Food photo data is already synchronized.')
    return
  }

  const target = `${process.env.R2_ENDPOINT.replace(/\/$/, '')}/${process.env.R2_BUCKET_NAME}`
  const previousImages = new Set(state?.target === target ? state.images : [])
  const currentImages = new Set(imagePaths)
  const deletedImages = [...previousImages].filter((imagePath) => !currentImages.has(imagePath))
  const saveState = (images) => writeAtomically(foodSyncStateFile, `${JSON.stringify({ target, images }, null, 2)}\n`)

  // Record new files before uploading so an interrupted upload can still be cleaned up.
  if (imagePaths.some((imagePath) => !previousImages.has(imagePath))) {
    await saveState([...new Set([...previousImages, ...currentImages])])
  }

  logUploadSummary(await mapWithConcurrency(imagePaths, syncConcurrency, uploadPhotoToR2))

  let fileContents = await readFile(foodDataFile, 'utf8')
  let changes = await updatePhotoEntries(fileContents, imagePaths, deletedImages)
  if (deletedImages.length > 0) {
    await mapWithConcurrency(deletedImages, syncConcurrency, deletePhotoFromR2)

    // Preserve metadata edits made while the R2 requests were in flight.
    const latestContents = await readFile(foodDataFile, 'utf8')
    if (latestContents !== fileContents) {
      fileContents = latestContents
      changes = await updatePhotoEntries(fileContents, imagePaths, deletedImages)
    }
  }

  if (changes.updatedContents !== fileContents) {
    await writeAtomically(foodDataFile, changes.updatedContents)
  }
  if (deletedImages.length > 0) {
    await saveState(imagePaths)
    console.log(`Removed ${deletedImages.length} deleted food photo${deletedImages.length === 1 ? '' : 's'} from the gallery sync.`)
  }
  if (changes.replacementCount > 0) {
    console.log(`Updated ${changes.replacementCount} food photo source${changes.replacementCount === 1 ? '' : 's'} to use R2.`)
  }
  if (changes.addedCount > 0) {
    console.log(`Added ${changes.addedCount} new food photo entr${changes.addedCount === 1 ? 'y' : 'ies'}.`)
  }
  if (changes.updatedContents === fileContents && deletedImages.length === 0) {
    console.log('Food photo data is already synchronized.')
  }
}

const lock = await open(foodSyncLockFile, 'wx').catch((error) => {
  if (error.code !== 'EEXIST') throw error
  throw new Error('A food photo sync already holds the lock. If it was interrupted, remove .food-photo-sync-lock.local and retry.')
})
try {
  await syncFoodPhotos()
} finally {
  await lock.close()
  await unlink(foodSyncLockFile)
}
