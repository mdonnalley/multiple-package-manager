import { Command } from '@oclif/core';
import * as chalk from 'chalk';
import { cli } from 'cli-ux';
import { groupBy, sortBy } from 'lodash';
import { Repos, Repository } from '../repos';

export class List extends Command {
  public static readonly description = 'List all added repositories.';
  public static readonly flags = {};
  public static readonly aliases = ['ls'];

  public async run(): Promise<void> {
    const repositories = (await Repos.create()).getContents();
    if (Object.keys(repositories).length === 0) {
      process.exitCode = 1;
      throw new Error('No repositories have been added yet.');
    }
    const grouped = groupBy(repositories, 'org');
    for (const [org, repos] of Object.entries(grouped)) {
      const columns = {
        name: { header: 'Name' },
        url: { header: 'URL', get: (r: Repository): string => r.urls.html },
        version: { header: 'Version', get: (r: Repository): string => r.npm.version },
      };
      const sorted = sortBy(Object.values(repos), 'name');
      cli.table(sorted, columns, { title: chalk.cyan.bold(`${org} Respositories`) });
      this.log();
    }
  }
}