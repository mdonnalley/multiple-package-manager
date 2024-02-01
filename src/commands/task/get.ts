import { Args, Command } from '@oclif/core';
import { Tasks } from '../../tasks.js';

export default class Get extends Command {
  public static description = 'Return the value of a task.';
  public static flags = {};

  public static args = {
    task: Args.string({ description: 'Name of task to get', required: true }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Get);
    const tasks = await Tasks.create();
    this.log(tasks.get(args.task));
  }
}
