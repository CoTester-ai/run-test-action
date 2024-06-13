export type Test = {
  name: string
  status: 'passed' | 'failed' | 'running'
  message?: string
  link: string
  traceUrl: string
}

export type TestResults = {
  failed: number
  passed: number
  total: number
  link: string
  tests: Test[]
}
