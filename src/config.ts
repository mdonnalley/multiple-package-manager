import * as os from 'os';
import * as path from 'path';
import { ConfigFile, JsonMap } from './configFile';

export interface Configuration extends JsonMap<string> {
  directory: string;
}

export class Config extends ConfigFile<Configuration> {
  public static DEFAULT_DIRECTORY = path.join(os.homedir(), 'repos');

  private static DEFAULT_CONFIG: Configuration = { directory: Config.DEFAULT_DIRECTORY };

  public constructor() {
    super('config.json');
  }

  protected make(): Configuration {
    return Config.DEFAULT_CONFIG;
  }
}