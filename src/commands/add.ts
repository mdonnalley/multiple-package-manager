import * as path from 'path';
import { URL } from 'url';
import * as chalk from 'chalk';
import { Command, Flags } from '@oclif/core';
import { CloneMethod, Repos } from '../repos';

function parseOrgAndRepo(entity: string): { org: string; repo: string | null } {
  if (entity.startsWith('https://')) {
    const url = new URL(entity);
    const pathParts = url.pathname.split('/').filter((p) => !!p);
    // ex: https://github.com/my-org
    if (pathParts.length === 1) return { org: pathParts[0], repo: null };
    // ex: https://github.com/my-org/my-repo
    else return { org: pathParts[0], repo: pathParts[1] };
  } else {
    const parts = entity.split('/').filter((e) => !!e);
    if (parts.length === 1) {
      // ex: my-org
      return { org: entity, repo: null };
    } else {
      // ex: my-org/my-repo
      return { org: parts[0], repo: parts[1] };
    }
  }
}

export class Add extends Command {
  public static readonly description = 'Add a github org. Requires GH_TOKEN to be set in the environment.';
  public static readonly flags = {
    method: Flags.string({
      description: 'Method to use for cloning.',
      default: 'ssh',
      options: ['ssh', 'https'],
    }),
  };

  public static readonly args = [
    {
      name: 'entity',
      description: 'Github org, repo, or url to add',
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(Add);
    const repos = await Repos.create();

    const info = parseOrgAndRepo(args.entity);
    const repositories = await repos.fetch(info.org, info.repo);
    this.log(`Cloning repositories into ${path.join(repos.directory.name, info.org)}`);
    for (const repo of repositories) {
      this.log(`  * ${chalk.bold(repo.name)}`);
      await repos.clone(repo, flags.method as CloneMethod);
    }
    await repos.write();
  }
}