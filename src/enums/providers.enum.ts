import { CHAIN_TYPES } from '@/enums/chains.enum'

export enum PROVIDERS {
  fallback = 'fallback',
  metamask = 'metamask',
  coinbase = 'coinbase',
  trust = 'trust',
  walletConnect = 'wallet-connect',
  brave = 'brave',
  ledger = 'ledger',
  phantom = 'phantom',
  solflare = 'solflare',
}

export enum PROVIDERS_CHECKS {
  fallback = 'isWeb3',
  metamask = 'isMetaMask',
  coinbase = 'isCoinbaseWallet',
  trust = 'isTrust',
  walletConnect = 'isWalletConnect',
  brave = 'isBraveWallet',
  ledger = 'isLedger',
  phantom = 'isPhantom',
  solflare = 'isSolflare',
}

export const PROVIDERS_BY_CHAINS_TYPES = {
  [CHAIN_TYPES.evm]: [
    PROVIDERS.metamask,
    PROVIDERS.coinbase,
    PROVIDERS.walletConnect,
  ],
  [CHAIN_TYPES.solana]: [PROVIDERS.phantom, PROVIDERS.solflare],
}
