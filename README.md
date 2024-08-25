# CoTester.ai GitHub Action

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action triggers [CoTester.ai](https://app.cotester.ai) in pipelines.

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

jobs:
  cotester-action:
    name: Cotester Test
    runs-on: ubuntu-latest

    steps:
      - name: coTester.ai - trigger tests in github
        uses: CoTester-ai/run-test-action@latest
        env:
          PWDEBUG: console
        with:
          secretKey: ${{ secrets.COTESTER_SECRET_KEY }} # required
          project: 'cotesterai' # required
          group: 'smoke'
```
