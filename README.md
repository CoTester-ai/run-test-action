# CoTester.ai GitHub Action

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)



This action triggers [CoTester.ai](https://app.cotester.ai) on pull request and merges.

## Getting Started

First of all you should create some tests on [cotester.ai](https://app.cotester.ai) and get your API token [here](https://app.cotester.ai/settings/integrations).

```yaml
- name: CoTester.ai
  uses: CoTester-ai/run-test-action
  with:
    token: ${{ secrets.COTESTER_TOKEN }} # required
    project: 'project-slug' # required
    include: 'smoke,regression' # optional
    exclude: 'performance' # optional
    github-token: ${{ secrets.GITHUB_TOKEN }} # needed to comment on PR
```
