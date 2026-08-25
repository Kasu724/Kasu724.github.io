import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const publicDirectory = join(repositoryRoot, 'public')
const foodDirectory = join(publicDirectory, 'images', 'food')
const foodDataFile = join(repositoryRoot, 'src', 'data', 'foodPhotos.ts')
const supportedExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'])
const arrayOpeningMarker = 'export const foodPhotos: FoodPhoto[] = [\n'

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

function hasSource(fileContents, source) {
  const doubleQuotedSource = JSON.stringify(source)
  const singleQuotedSource = `'${source.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`

  return fileContents.includes(`src: ${doubleQuotedSource}`)
    || fileContents.includes(`src: ${singleQuotedSource}`)
}

const foodImages = await findFoodImages(foodDirectory)
const fileContents = await readFile(foodDataFile, 'utf8')
const missingImages = (await Promise.all(foodImages.map(async (filePath) => {
  const source = toPublicSource(filePath)

  if (hasSource(fileContents, source)) return null

  const fileStats = await stat(filePath)
  return {
    source,
    addedAt: fileStats.birthtimeMs || fileStats.ctimeMs || fileStats.mtimeMs,
  }
})))
  .filter((image) => image !== null)
  .sort((left, right) => right.addedAt - left.addedAt || left.source.localeCompare(right.source))

if (missingImages.length === 0) {
  console.log('Food photo data is already synchronized.')
  process.exit(0)
}

const openingMarkerIndex = fileContents.indexOf(arrayOpeningMarker)

if (openingMarkerIndex === -1) {
  throw new Error(`Could not find the food photo array opening marker in ${foodDataFile}.`)
}

const newEntries = missingImages.map(({ source }) => [
  '  {',
  `    src: ${JSON.stringify(source)},`,
  "    date: '',",
  "    caption: '',",
  "    restaurant: '',",
  "    location: '',",
  '  },',
].join('\n')).join('\n')

const insertionIndex = openingMarkerIndex + arrayOpeningMarker.length
const updatedContents = [
  fileContents.slice(0, insertionIndex),
  `${newEntries}\n`,
  fileContents.slice(insertionIndex),
].join('')

await writeFile(foodDataFile, updatedContents, 'utf8')
console.log(`Added ${missingImages.length} new food photo entr${missingImages.length === 1 ? 'y' : 'ies'}.`)
