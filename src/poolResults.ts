import { TestResults } from './models'

export const poolResults = async (
  url: string,
  token: string,
  testRunId: string
): Promise<TestResults> => {
  let results: (TestResults & { processing: boolean }) | undefined = undefined

  while (results === undefined || results.processing) {
    const response = await fetch(`${url}/api/v1/runs/?runId=${testRunId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': token
      },
      method: 'GET'
    })
    if (!response.ok) {
      throw new Error(
        `response not ok ${response.status} ${await response.text()}`
      )
    }

    results = await response.json()
  }

  if (!results) {
    throw new Error('No results found')
  }

  return results
}
