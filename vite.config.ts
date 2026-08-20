import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const githubRepository = 'Kasu724/Kasu724.github.io'
const githubUser = 'Kasu724'
const siteMetadataModuleId = 'virtual:site-metadata'
const resolvedSiteMetadataModuleId = `\0${siteMetadataModuleId}`

type RecentCommit = {
  sha: string
  message: string
  repository: string
  date: string
  url: string
}

type GitHubCommitSearchResponse = {
  items: Array<{
    sha: string
    html_url: string
    repository: { full_name: string }
    commit: {
      message: string
      committer: { date: string } | null
    }
  }>
}

function readGit(args: string[]) {
  try {
    return execFileSync('git', args, {
      cwd: fileURLToPath(new URL('.', import.meta.url)),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function getDeploymentCommit() {
  return process.env.VITE_DEPLOYMENT_COMMIT?.trim() || readGit(['rev-parse', 'HEAD'])
}

function getLocalRecentCommits(): RecentCommit[] {
  const output = readGit(['log', '-3', '--pretty=format:%H%x1f%s%x1f%cI%x1e'])

  return output
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [sha, message, date] = record.split('\x1f')

      return {
        sha,
        message,
        repository: githubRepository.replace(`${githubUser}/`, ''),
        date,
        url: `https://github.com/${githubRepository}/commit/${sha}`,
      }
    })
}

async function getRecentCommits(): Promise<RecentCommit[]> {
  const query = new URLSearchParams({
    q: `author:${githubUser}`,
    sort: 'committer-date',
    order: 'desc',
    per_page: '3',
  })
  const token = process.env.GITHUB_TOKEN?.trim()

  try {
    const response = await fetch(`https://api.github.com/search/commits?${query}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`)
    }

    const data = (await response.json()) as GitHubCommitSearchResponse
    const commits = data.items.map((item) => ({
      sha: item.sha,
      message: item.commit.message.split('\n')[0],
      repository: item.repository.full_name.replace(`${githubUser}/`, ''),
      date: item.commit.committer?.date ?? '',
      url: item.html_url,
    }))

    return commits.length > 0 ? commits : getLocalRecentCommits()
  } catch (error) {
    console.warn('Could not load recent GitHub activity; using local commits.', error)
    return getLocalRecentCommits()
  }
}

// https://vite.dev/config/
export default defineConfig(async () => {
  const deploymentCommit = getDeploymentCommit()
  const recentCommits = await getRecentCommits()

  return {
    plugins: [
      react(),
      {
        name: 'site-metadata',
        resolveId(id: string) {
          return id === siteMetadataModuleId ? resolvedSiteMetadataModuleId : undefined
        },
        load(id: string) {
          if (id !== resolvedSiteMetadataModuleId) return undefined

          return [
            `export const deploymentCommit = ${JSON.stringify(deploymentCommit)}`,
            `export const recentCommits = ${JSON.stringify(recentCommits)}`,
          ].join('\n')
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          home: fromRoot('index.html'),
          about: fromRoot('about/index.html'),
          projects: fromRoot('projects/index.html'),
        },
      },
    },
  }
})
