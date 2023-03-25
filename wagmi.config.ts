import { defineConfig } from '@wagmi/cli';
import { PubliusFactory__factory, Publius__factory } from './src/Types/Contract';
import { react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'src/generated.ts',
  contracts: [
    {
      name: 'Publius',
      abi: Publius__factory.abi,
    },
    {
      name: 'PubliusFactory',
      abi: PubliusFactory__factory.abi,
    },
  ],
  plugins: [
    react(),
  ],
});
