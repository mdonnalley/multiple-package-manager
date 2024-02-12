/* eslint-disable perfectionist/sort-objects */
import {Args, Command, Flags, ux} from '@oclif/core'
// @ts-expect-error because no types exist
import hyperlinker from 'hyperlinker'
import sortBy from 'lodash.sortby'

import {convertDateStringToDaysAgo, dateFlag, readableDate} from '../../date-utils.js'
import {Github, Issue} from '../../github.js'
import {Repos} from '../../repos.js'
import {startRandomSpinner} from '../../util.js'

export default class OrgIssues extends Command {
  public static args = {
    org: Args.string({description: 'Github org', required: true}),
  }

  public static description =
    'List all open issues for added repos in an org. Requires GH_TOKEN to be set in the environment.'

  public static examples = [
    '<%= config.bin %> <%= command.id %> my-github-org --since 1/1/24',
    '<%= config.bin %> <%= command.id %> my-github-org --since friday',
  ]

  public static flags = {
    'sort-by': Flags.option({
      description: 'Sort by',
      options: ['created', 'repo', 'author', 'updated'] as const,
      default: 'repo',
      char: 'b',
    })(),
    since: dateFlag({
      description: 'Only show issues updated after this date',
      char: 's',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    startRandomSpinner('Looking for issues')
    const {args, flags} = await this.parse(OrgIssues)

    const repos = await new Repos().init()
    const github = new Github()
    const all = await github.repoIssues(repos.getReposOfOrg(args.org), {since: flags.since?.toISOString()})

    const columns = {
      title: {header: 'Title', minWidth: 80},
      issue: {get: (r: Issue): string => hyperlinker(`${r.repo}#${r.number}`, r.url), header: 'Issue'},
      author: {get: (r: Issue): string => r.user, header: 'Author'},
      updated: {
        get: (r: Issue): string => `${readableDate(r.updated)} (${convertDateStringToDaysAgo(r.updated)})`,
        header: 'Updated',
      },
      created: {
        get: (r: Issue): string => `${readableDate(r.created)} (${convertDateStringToDaysAgo(r.created)})`,
        header: 'Created',
      },
      labels: {get: (r: Issue): string => r.labels.join(', '), header: 'Labels'},
    }
    const sorted = sortBy(Object.values(all), flags['sort-by'])
    ux.action.stop(`Found ${sorted.length} issue${sorted.length === 1 ? '' : 's'}`)
    if (sorted.length === 0) {
      this.log('No issues found')
      return
    }

    ux.table(flags['sort-by'] === 'created' || flags['sort-by'] === 'updated' ? sorted.reverse() : sorted, columns, {
      title: 'Issues',
      'no-truncate': true,
    })
  }
}