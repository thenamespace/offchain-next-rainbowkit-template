import {
  getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import {
  mainnet,
  optimism,
  base
} from 'wagmi/chains';


export const config = getDefaultConfig({
    appName: 'Namespace Offchain Rainbow Kit Demo',
    projectId: 'YOUR_PROJECT_ID',
    chains: [mainnet, optimism, base],
    ssr: true,
  });
