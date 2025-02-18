import { readFileSync } from 'fs';
import { load } from 'js-yaml';

export function configLoader(configPath: string): () => Record<string, any> {
  return () => {
    console.log(`Loading config from ${configPath}`);
    // eslint-disable-next-line prettier/prettier
    const config = load(readFileSync(configPath, 'utf8')) as Record<string, any>;
    console.log(`Loaded config: ${JSON.stringify(config)}`);
    config.port = config.port ?? 3000;
    config.host = config.host ?? 'localhost';
    return {
      ...config,
      ...process.env,
    };
  };
}
