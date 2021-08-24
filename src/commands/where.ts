import { Command, Flags } from '@oclif/core';
import { Repos } from '../repos';

export default class View extends Command {
  public static description = 'Print location of a github repository.';
  public static disableJsonFlag = true;
  public static flags = {
    remote: Flags.boolean({
      description: 'Return url of repository.',
      default: false,
    }),
  };
  public static args = [
    {
      name: 'repo',
      description: 'Name of repository.',
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(View);
    const repos = await Repos.create();
    const repo = repos.get(args.repo);
    if (!repo) {
      process.exitCode = 1;
      throw new Error(`${args.repo as string} has not been added yet.`);
    }

    this.log(flags.remote ? repo.urls.html : repo.location);
  }
}
