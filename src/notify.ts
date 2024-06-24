import { GitHub } from '@actions/github/lib/utils'

export const notifyAboutStart = async (
  octokit: InstanceType<typeof GitHub>,
  externalId: string,
  owner: string,
  repo: string,
  commitSha: string
) => {
  await octokit.rest.checks.create({
    owner: owner,
    repo: repo,
    name: 'E2E tests',
    head_sha: commitSha,
    status: 'in_progress',
    external_id: externalId
  })
}
