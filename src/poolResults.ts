import { TestResults } from './models'

const poll = async <T>(
  func: () => Promise<T>,
  condition: (t: T) => boolean,
  interval: number,
  timeout: number
): Promise<T> => {
  if (timeout <= 0) {
    throw new Error('Timeout')
  }
  const res = await func()
  if (condition(res)) {
    return res
  }
  await new Promise(resolve => setTimeout(resolve, interval))
  return poll(func, condition, interval, timeout - interval)
}

export const poolResults = async (
  url: string,
  token: string,
  testRunId: string
): Promise<TestResults> => {
  const results = await poll<TestResults & { processing: boolean }>(
    async () => {
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
      return await response.json()
    },
    res => res !== undefined && !res.processing,
    30000,
    10 * 60 * 1000
  )

  if (!results) {
    throw new Error('No results found')
  }

  return results
}
