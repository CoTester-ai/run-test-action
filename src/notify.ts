import { GitHub } from '@actions/github/lib/utils'

export const notifyAboutStart = async (
  octokit: InstanceType<typeof GitHub>,
  runId: string,
  link: string,
  owner: string,
  repo: string,
  commitSha: string
) => {
  await octokit.rest.checks.create({
    owner: owner,
    repo: repo,
    name: 'CoTester.ai',
    head_sha: commitSha,
    status: 'in_progress',
    details_url: link,
    external_id: runId
  })
}
