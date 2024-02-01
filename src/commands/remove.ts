import { rm } from 'node:fs/promises';
import { Args, Command } from '@oclif/core';
import { Repos } from '../repos.js';

export default class Remove extends Command {
  public static description = 'Remove a repository from your local file system.';
  public static flags = {};

  public static args = {
    repo: Args.string({ description: 'Name of repository.', required: true }),
  };

  public static aliases = ['rm'];

  public async run(): Promise<void> {
    const { args } = await this.parse(Remove);
    const repos = await Repos.create();
    const repo = repos.getOne(args.repo);
    repos.unset(repo.fullName);
    await repos.write();
    await rm(repo.location, { recursive: true, force: true });
  }
}
