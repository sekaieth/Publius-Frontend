import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { PubliusFactory__factory, Publius__factory } from '../../contracts/typechain-types'
import hardhatAddresses from '../../contracts/hardhat-contract-info.json'
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
    }
  ],
  plugins: [
    react(),
  ],
})