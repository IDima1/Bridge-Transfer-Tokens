import { CHAIN_TYPES } from '@/enums'
import { TxRequestBody } from '@/types/provider.types'

export type BridgeToken = {
  type: 'token'
  id: string
  name: string
  symbol: string
  token_type: string
  chains?: BridgeChain[]
}

export type BridgeChain = {
  type: 'chain'
  id: string
  chain_params: {
    chain_hex_id: string
    chain_id: number
    native_currency_name: string
    native_decimals: number
    native_symbol: string
    rpc: string
    explorer_url: string
  }
  chain_type: CHAIN_TYPES
  name: string
  tokens?: BridgeToken[]
}

export type BridgeApprovalResponse = {
  id: string
  type: 'evm_transaction' | 'processed_transaction'
  tx_body: TxRequestBody
  chain: BridgeChain
}

export type BridgeLockTokenResponse = {
  id: string
  type: 'evm_transaction' | 'processed_transaction'
  tx_body: TxRequestBody
  chain: BridgeChain
}

export type BridgeRedeemTokenResponse = {
  id: string
  type: 'evm_transaction' | 'processed_transaction'
  tx_body: TxRequestBody
  chain: BridgeChain
}

export type BridgeNftDetails = {
  type: 'nft'
  id: string
  description: string
  image: string
  metadata_url: string
  name: string
}

export type BridgeTokenBalance = {
  amount: string
  id: string
  type: 'balance'
}
