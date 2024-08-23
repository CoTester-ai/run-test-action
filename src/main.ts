import * as core from '@actions/core'
import * as github from '@actions/github'

import { execute } from '@cotesterai/self-hosted-executor'
import { exit } from 'process'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const secretKey = core.getInput('secretKey')
    if (secretKey.length === 0) {
      core.warning('apiKey is set to an empty string')
    }

    const projectSlug = core.getInput('project')
    if (projectSlug.length === 0) {
      core.setFailed('project is set to an empty string')
    }

    const group = core.getInput('group')
    if (group.length === 0) {
      core.warning('group is set to an empty string')
    }

    let url = core.getInput('url')
    if (url.length === 0) {
      url = 'https://frugal-corgi-830.convex.cloud'
    }

    const issueNumber = github.context.issue.number
    if (!issueNumber || issueNumber < 1) {
      core.warning(
        'issue.number variable (Pull Request ID) not available. ' +
          'Make sure you run this action in a workflow triggered by pull request ' +
          'if you expect a comment with the test results on your PR'
      )
    }

    const triggerContext = {
      source: 'CICD',
      author: 'ANON', // TODO:
      github: {
        prId: issueNumber,
        commitSha:
          github.context.payload.pull_request !== undefined
            ? github.context.payload.pull_request.head.sha
            : github.context.sha,
        ref: github.context.ref,
        repo: github.context.repo.repo,
        owner: github.context.repo.owner
      }
    }

    core.info(`Running with context: ${JSON.stringify(triggerContext)}`)

    const variables = []

    const testExecutionResult = await execute({
      projectSlug,
      group,
      variables,
      triggerContext,
      secretKey,
      settings: {
        cotesterConvexUrl: url
      }
    })
    core.info(`Test execution result: ${JSON.stringify(testExecutionResult)}`)
    if (testExecutionResult.result === 'failed') {
      core.setOutput('result', JSON.stringify(testExecutionResult))
      core.setFailed('Test execution failed')
    }
  } catch (error) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
  exit()
}
