export interface Config {
  name: string;
  version?: string;
  debug?: boolean;
}

export function loadConfig(path: string): Config {
  return { name: 'default' };
}

export default function createDefaultConfig(): Config {
  return { name: 'default', version: '1.0.0', debug: false };
}
