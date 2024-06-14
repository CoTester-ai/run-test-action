import { GitHub } from '@actions/github/lib/utils'

export const notifyAboutStart = async (
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string,
  commitSha: string
) => {
  await octokit.rest.checks.create({
    owner: owner,
    repo: repo,
    name: 'E2E tests',
    head_sha: commitSha,
    status: 'in_progress'
  })
}

export const notifyAboutEnd = async (
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string,
  commitSha: string,
  conclusion: 'success' | 'failure'
) => {
  await octokit.rest.checks.create({
    owner: owner,
    repo: repo,
    name: 'E2E tests',
    head_sha: commitSha,
    status: 'completed',
    conclusion: conclusion
  })
}
