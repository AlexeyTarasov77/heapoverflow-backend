import { readFileSync } from 'fs';
import { load } from 'js-yaml';

export function configLoader(configPath: string): () => Record<string, any> {
  return () => {
    console.log(`Loading config from ${configPath}`);
    const config = load(readFileSync(configPath, 'utf8')) as Record<
      string,
      any
    >;
    config.port = config.port ?? 3000;
    config.host = config.host ?? 'localhost';
    return {
      ...config,
      ...process.env,
    };
  };
}
