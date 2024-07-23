import * as core from '@actions/core'
import * as github from '@actions/github'

import { execute } from '@cotesterai/self-hosted-executor'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('apiKey')
    if (apiKey.length === 0) {
      core.warning('apiKey is set to an empty string')
    }

    const project = core.getInput('project')
    if (project.length === 0) {
      core.setFailed('project is set to an empty string')
    }

    const group = core.getInput('group')
    if (group.length === 0) {
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

    const context = {
      prId: issueNumber,
      repo: github.context.repo.repo,
      owner: github.context.repo.owner,
      ref: github.context.ref,
      commitSha: github.context.payload.pull_request
        ? github.context.payload.pull_request?.head.sha
        : github.context.sha
    }

    core.info(`Running with context: ${JSON.stringify(context)}`)

    const testExecutionResult = await execute({
      url,
      apiKey,
      project,
      group,
      include,
      exclude,
      triggerSource: 'CICD',
      context
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
}
