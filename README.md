# CoTester.ai GitHub Action

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action triggers [CoTester.ai](https://app.cotester.ai) on pull request and
merges.

## Getting Started

First of all you should create some tests on
[cotester.ai](https://app.cotester.ai) and get your API token
[here](https://app.cotester.ai/settings/integrations).

```yaml
name: Continuous Integration

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  contents: read
  checks: write
  issues: write
  pull-requests: write

jobs:
  test-action:
    name: GitHub Actions Test
    runs-on: ubuntu-latest

    steps:
      - name: coTester.ai - trigger tests in github
        uses: CoTester-ai/run-test-action@v0.1.0
        with:
          token: ${{ secrets.COTESTER_TOKEN }} # required
          project: 'cotesterai' # required
          github-token: ${{ secrets.GITHUB_TOKEN }} # needed to comment on PR
```
