export type RecentCommit = {
  sha: string
  message: string
  repository: string
  date: string
  url: string
}

type GitHubCommitSearchResponse = {
  items?: Array<{
    sha: string
    html_url: string
    repository: { full_name: string }
    commit: {
      message: string
      committer: { date: string } | null
    }
  }>
}

type RecentCommitsCache = {
  cachedAt: number
  commits: RecentCommit[]
}

const githubUser = 'Kasu724'
const recentCommitsCacheKey = 'kasu724-recent-github-commits'
const recentCommitsEndpoint = `https://api.github.com/search/commits?${new URLSearchParams({
  q: `author:${githubUser}`,
  sort: 'committer-date',
  order: 'desc',
  per_page: '3',
})}`

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

async function fetchRecentCommits() {
  const response = await fetch(recentCommitsEndpoint, {
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal: AbortSignal.timeout(8_000),
  })

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status}`)
  }

  const data = (await response.json()) as GitHubCommitSearchResponse
  const commits = (data.items ?? []).map((item) => ({
    sha: item.sha,
    message: item.commit.message.split('\n')[0],
    repository: item.repository.full_name.replace(`${githubUser}/`, ''),
    date: item.commit.committer?.date ?? '',
    url: item.html_url,
  }))

  writeCache(commits)
  return commits
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
