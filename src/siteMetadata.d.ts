declare module 'virtual:site-metadata' {
  export const deploymentCommit: string

  export const recentCommits: Array<{
    sha: string
    message: string
    repository: string
    date: string
    url: string
  }>
}
