import { GitHub } from '@actions/github/lib/utils'

export const notifyAboutStart = async (
  octokit: InstanceType<typeof GitHub>,
  owner: string,
  repo: string,
  commitSha: string
) => {
  const result = await octokit.rest.checks.create({
    owner: owner,
    repo: repo,
    name: 'E2E tests',
    head_sha: commitSha,
    status: 'in_progress'
  })
  console.log('result: ', result)
}
