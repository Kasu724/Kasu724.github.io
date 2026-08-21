import { deploymentCommit } from 'virtual:site-metadata'

export type RecentCommit = {
  sha: string
  message: string
  repository: string
  date: string
  url: string
}

type GitHubCommit = {
  sha: string
  html_url: string
  commit: {
    message: string
    committer: { date: string } | null
  }
}

type GitHubCommitSearchResponse = {
  items?: Array<GitHubCommit & {
    repository: { full_name: string }
  }>
}

type RecentCommitsCache = {
  cachedAt: number
  commits: RecentCommit[]
}

const githubUser = 'Kasu724'
const siteRepository = `${githubUser}/${githubUser}.github.io`
const recentCommitsCacheKey = 'kasu724-recent-github-commits'
const recentCommitsEndpoint = `https://api.github.com/search/commits?${new URLSearchParams({
  q: `author:${githubUser}`,
  sort: 'committer-date',
  order: 'desc',
  per_page: '3',
})}`
const hasDeploymentCommit = /^[0-9a-f]{7,40}$/i.test(deploymentCommit)

let recentCommitsRequest: Promise<RecentCommit[]> | null = null

function isRecentCommit(value: unknown): value is RecentCommit {
  if (!value || typeof value !== 'object') return false

  const commit = value as Record<string, unknown>
  return ['sha', 'message', 'repository', 'date', 'url']
    .every((key) => typeof commit[key] === 'string')
}

function readCache() {
  try {
    const value = window.localStorage.getItem(recentCommitsCacheKey)
    if (!value) return null

    const cache = JSON.parse(value) as Partial<RecentCommitsCache>
    if (
      typeof cache.cachedAt !== 'number'
      || !Array.isArray(cache.commits)
      || !cache.commits.every(isRecentCommit)
    ) {
      return null
    }

    return cache as RecentCommitsCache
  } catch {
    return null
  }
}

function writeCache(commits: RecentCommit[]) {
  try {
    window.localStorage.setItem(recentCommitsCacheKey, JSON.stringify({
      cachedAt: Date.now(),
      commits,
    }))
  } catch {
    // The live request still works when storage is unavailable.
  }
}

export function getCachedRecentCommits() {
  return readCache()?.commits ?? []
}

function toRecentCommit(commit: GitHubCommit, repository: string): RecentCommit {
  return {
    sha: commit.sha,
    message: commit.commit.message.split('\n')[0],
    repository: repository.replace(`${githubUser}/`, ''),
    date: commit.commit.committer?.date ?? '',
    url: commit.html_url,
  }
}

function githubRequest<T>(url: string, signal: AbortSignal) {
  return fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal,
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`)
    }

    return (await response.json()) as T
  })
}

function newestFirst(left: RecentCommit, right: RecentCommit) {
  const leftDate = Date.parse(left.date)
  const rightDate = Date.parse(right.date)

  return (Number.isNaN(rightDate) ? 0 : rightDate)
    - (Number.isNaN(leftDate) ? 0 : leftDate)
}

async function fetchRecentCommits() {
  const signal = AbortSignal.timeout(8_000)
  const searchRequest = githubRequest<GitHubCommitSearchResponse>(recentCommitsEndpoint, signal)
  const deploymentRequest = hasDeploymentCommit
    ? githubRequest<GitHubCommit>(
        `https://api.github.com/repos/${siteRepository}/commits/${deploymentCommit}`,
        signal,
      )
    : Promise.resolve(null)

  const [searchResult, deploymentResult] = await Promise.allSettled([
    searchRequest,
    deploymentRequest,
  ])
  const commits = searchResult.status === 'fulfilled'
    ? (searchResult.value.items ?? []).map((item) => (
        toRecentCommit(item, item.repository.full_name)
      ))
    : getCachedRecentCommits()

  if (deploymentResult.status === 'fulfilled' && deploymentResult.value) {
    commits.push(toRecentCommit(deploymentResult.value, siteRepository))
  }

  const uniqueCommits = [...new Map(
    commits.map((commit) => [`${commit.repository}:${commit.sha}`, commit]),
  ).values()]
    .sort(newestFirst)
    .slice(0, 3)

  if (uniqueCommits.length === 0) {
    throw new Error('GitHub did not return any commits')
  }

  writeCache(uniqueCommits)
  return uniqueCommits
}

export function loadRecentCommits() {
  if (!recentCommitsRequest) {
    recentCommitsRequest = fetchRecentCommits()
      .finally(() => {
        recentCommitsRequest = null
      })
  }

  return recentCommitsRequest
}
