import { TestResults } from './models'

export const poolResults = async (
  url: string,
  token: string,
  testRunId: string
): Promise<TestResults> => {
  let results: (TestResults & { processing: boolean }) | undefined = undefined

  let tries = 0

  // Poll the results until they are ready or we have tried 60 times
  while (results === undefined || results.processing || tries < 60) {
    const response = await fetch(`${url}/api/v1/runs/?runId=${testRunId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': token
      },
      method: 'GET'
    })
    if (!response.ok) {
      throw new Error(
        `response not ok ${response.status} ${await response.json()}`
      )
    }

    results = await response.json()
    //sleep for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10 * 1000))
    tries++
  }

  if (!results) {
    throw new Error('No results found')
  }

  return results
}
