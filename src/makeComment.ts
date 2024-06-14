// @ts-ignore
import { TestResults } from './models'
import { GitHub } from '@actions/github/lib/utils'

export type Args = {
  prId: number
  commitSha: string
  testRunId: string
  owner: string
  repo: string
  results: TestResults
}

// @ts-ignore
export const makeComment = async (
  octokit: InstanceType<typeof GitHub>,
  args: Args
) => {
  const { results } = args
  const approve = results.failed === 0
  let message: string
  if (approve) {
    message =
      'All tests passed successfully :white_check_mark: (Jobs are not included in this run)'
  } else {
    message = await createMessage(args)
  }

  await sendMessage(octokit, message, args)
}

const createMessage = async (args: Args) => {
  const reportUrl = args.results.link

  const tableContent = args.results.tests
    .map(
      test =>
        `| ${test.name} | ${test.message} | ${test.traceUrl ? `[click](${test.traceUrl})` : '-'} |`
    )
    .join('\n')
  const message = `[Test report](${reportUrl}): ${args.results.failed}/${args.results.total} failed :rotating_light:

| Test  | Message | Trace |
| ------------- | ------------- | ------------- |
${tableContent}
`

  return message
}

const sendMessage = async (
  octokit: InstanceType<typeof GitHub>,
  message: string,
  args: Args
) => {
  const { prId, owner, repo } = args

  await minimizePreviousComments(octokit, args)
  await octokit.rest.issues.createComment({
    issue_number: prId,
    owner: owner,
    repo: repo,
    body: message
  })
}

export const minimizePreviousComments = async (
  octokit: InstanceType<typeof GitHub>,
  { owner, repo, prId }: Args
) => {
  const queryComments = `
    query comments($owner: String!, $repo: String!, $pull_number: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $pull_number) {
          comments(last: 100, orderBy: { field: UPDATED_AT, direction: DESC }) {
            nodes {
              id
              url
              author {
                login
              }
              body
              isMinimized
            }
          }
        }
      }
    }
  `
  const commentsResponse = await octokit.graphql(queryComments, {
    owner: owner,
    repo: repo,
    pull_number: Number(prId)
  })

  const comments =
    // @ts-ignore
    commentsResponse.repository.pullRequest.comments.nodes.filter(
      // @ts-ignore
      comment =>
        comment.author.login === 'github-actions' && !comment.isMinimized
    )

  for (const comment of comments) {
    const query = `
            mutation minimizeComment($id: ID!) {
            minimizeComment(input: { classifier: OUTDATED, subjectId: $id }) {
                clientMutationId
            }
            }
        `
    await octokit.graphql(query, { id: comment.id })
  }
}
