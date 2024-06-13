// @ts-ignore
export const notifyAboutStart = async (
  octokit,
  owner: string,
  repo: string,
  commitSha: string
) => {
  octokit.rest.checks.create({
    owner: owner,
    repo: repo,
    name: 'E2E tests',
    head_sha: commitSha,
    status: 'in_progress'
  })
}
