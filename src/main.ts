import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('token')
    if (token.length === 0) {
      core.warning('token is set to an empty string')
    }

    const project = core.getInput('project')
    if (project.length === 0) {
      core.setFailed('project is set to an empty string')
    }

    const groupStringId = core.getInput('group')
    if (groupStringId.length === 0) {
      core.warning('group is set to an empty string')
    }

    let includeString = core.getInput('include')
    if (includeString.length === 0) {
      includeString = 'all'
    }
    const include = includeString.split(',').map(s => s.trim())
    const excludeString = core.getInput('exclude')
    const exclude = excludeString.split(',').map(s => s.trim())
    let url = core.getInput('url')

    if (url.length === 0) {
      url = 'https://frugal-corgi-830.convex.site'
    }

    const issueNumber = github.context.issue.number
    if (!issueNumber || issueNumber < 1) {
      core.warning(
        'issue.number variable (Pull Request ID) not available. ' +
          'Make sure you run this action in a workflow triggered by pull request ' +
          'if you expect a comment with the test results on your PR'
      )
    }

    const executeUrl = `${url}/api/v1/runs`
    const context = {
      prId: issueNumber,
      repo: github.context.repo.repo,
      owner: github.context.repo.owner,
      ref: github.context.ref,
      commitSha: github.context.payload.pull_request
        ? github.context.payload.pull_request?.head.sha
        : github.context.sha
    }

    core.debug(JSON.stringify({ executeUrl, context }, null, 2))

    let response: Response

    try {
      response = await fetch(executeUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token
        },
        body: JSON.stringify({
          projectSlug: project,
          include,
          exclude,
          groupStringId,
          triggerSource: 'CICD',
          context: {
            ...context
          }
        }),
        method: 'POST'
      })

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type')
        throw new Error(
          `response not ok ${response.status}, ${JSON.stringify(
            {
              body:
                contentType === 'application/json' ? await response.json() : {}
            },
            null,
            2
          )}`
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(
          `unable to execute:  ${
            typeof error.message === 'object'
              ? JSON.stringify({
                  error: error.message
                })
              : error.message
          }`
        )
      } else {
        core.setFailed('unknown Error')
      }
      return
    }

    const { runId } = (await response.json()) as { runId: string }
    console.debug(`runId: ${runId}`)
    core.setOutput('runId', runId)
  } catch (error) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
