import * as core from '@actions/core'
import github from '@actions/github'

import { notifyAboutStart } from './notify'
import { poolResults } from './poolResults'
import { makeComment } from './makeComment'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('token')
    if (token.length === 0) {
      core.setFailed('token is set to an empty string')
    }

    const project = core.getInput('project')
    if (project.length === 0) {
      core.setFailed('testTargetId is set to an empty string')
    }

    const include = core.getInput('include')
    const exclude = core.getInput('exclude')
    let url = core.getInput('url')

    if (url.length === 0) {
      url = 'https://frugal-corgi-830.convex.site'
    }

    console.log(token, include, exclude, project)

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
      issueNumber,
      repo: github.context.repo.repo,
      owner: github.context.repo.owner,
      ref: github.context.ref,
      sha: github.context.sha
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

    const { testRunId } = (await response.json()) as { testRunId: string }

    const octokit = github.getOctokit(token, {}, restEndpointMethods)
    await notifyAboutStart(octokit, context.owner, context.repo, context.sha)

    const results = await poolResults(url, token, testRunId)

    makeComment(octokit, {
      prId: issueNumber,
      commitSha: context.sha,
      testRunId: testRunId,
      owner: context.owner,
      repo: context.repo,
      results: results
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
