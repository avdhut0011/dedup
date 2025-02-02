import {TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  readonly hashString: (input: string) => string;
  readonly hashFile: (filePath: string) => string;
  readonly compareHashes: (hash1: string, hash2: string) => number;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeSSDeepModule',
);