import { ComputedRef, Ref } from 'vue'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { Deferrable } from '@ethersproject/properties'
import {
  Transaction as SolTransaction,
  TransactionSignature,
} from '@solana/web3.js'
import { ethers } from 'ethers'

import { PROVIDERS } from '@/enums'
import { EthereumProvider } from '@/types/ethereum.types'
import { PhantomProvider } from '@/types/solana.types'

export type ProviderInstance = EthereumProvider | PhantomProvider | unknown

export type DesignatedProvider = {
  name: PROVIDERS
  instance: ProviderInstance
}

export type ChainId = string | number

export type Chain = {
  id: ChainId
  name: string
  rpcUrl: string
}

export type TxRequestBody =
  | Deferrable<TransactionRequest>
  | SolTransaction
  | string
  | unknown

export type EthTransactionResponse = ethers.providers.TransactionResponse

export type SolanaTransactionResponse = TransactionSignature

export type TransactionResponse =
  | EthTransactionResponse
  | SolanaTransactionResponse
  | unknown

export interface ProviderWrapper {
  currentProvider?: ComputedRef<ethers.providers.Web3Provider>
  currentSigner?: ComputedRef<ethers.providers.JsonRpcSigner>

  chainId: Ref<ChainId>
  selectedAddress: Ref<string>
  isConnected: ComputedRef<boolean>

  init: () => Promise<void>
  connect: () => Promise<void>
  switchChain: (chainId: ChainId) => Promise<void>
  addChain?: (
    chainId: ChainId,
    chainName: string,
    chainRpcUrl: string,
  ) => Promise<void>
  signAndSendTransaction: (
    txRequestBody: TxRequestBody,
  ) => Promise<TransactionResponse>
  getHashFromTxResponse: (txResponse: TransactionResponse) => string
  getTxUrl: (explorerUrl: string, txHash: string) => string
  getAddressUrl: (explorerUrl: string, address: string) => string
  disconnect?: () => Promise<void>
}

export type { UseProvider } from '@/composables/useProvider'
