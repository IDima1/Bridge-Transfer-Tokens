import { computed, ref, watch } from 'vue'
import { useProvider } from '@/composables'
import { ErrorHandler, fetchChains, sleep } from '@/helpers'
import {
  BridgeApprovalResponse,
  BridgeChain,
  BridgeLockTokenResponse,
  BridgeNftDetails,
  BridgeRedeemTokenResponse,
  BridgeToken,
  BridgeTokenBalance,
  EthTransactionResponse,
  TxRequestBody,
} from '@/types'
import { api } from '@/api'
import { useStorage } from '@vueuse/core'
import { CHAIN_TYPES, STORAGE_KEYS } from '@/enums'
import { storeToRefs } from 'pinia'
import { useWeb3ProvidersStore } from '@/store'
import { debounce, isEmpty } from 'lodash-es'
import { errors } from '@/errors'
import { ethers } from 'ethers'
import { useRouter } from '@/router'

export const useBridgeForm = () => {
  const bridgeChains = ref<BridgeChain[]>([])
  const nftDetails = ref<BridgeNftDetails>()
  const selectedTokenBalance = ref<BridgeTokenBalance>()

  const isNftLoaded = ref(false)
  const isNftLoadFailed = ref(false)
  const isBalanceLoaded = ref(false)
  const isBalanceLoadFailed = ref(false)

  const chosenChainSenderId = ref('')
  const chosenChainRecipientId = ref('')
  const chosenTokenId = ref('')
  const receiverAddress = ref('')
  const chosenTokenQuantity = ref('')
  const chosenTokenNftId = ref('')

  const txHash = ref('')

  const redeemTxBody = ref<TxRequestBody>()

  const finishedFlowTx = ref('')

  const providerSender = useProvider()
  const providerReceiver = useProvider()

  const router = useRouter()

  router.afterEach(() => {
    resetForm()
  })

  const { providers: designatedProviders } = storeToRefs(
    useWeb3ProvidersStore(),
  )

  const persistedConnectedProviders = useStorage(
    STORAGE_KEYS.connectedProviders,
    {
      providerSenderName: providerSender.selectedProvider.value,
      providerReceiverName: providerReceiver.selectedProvider.value,
    },
  )

  const chosenChainSender = computed(() =>
    bridgeChains.value.find(chain => chain.id === chosenChainSenderId.value),
  )

  const chosenChainRecipient = computed(() =>
    bridgeChains.value.find(chain => chain.id === chosenChainRecipientId.value),
  )

  const isProviderSenderChainValid = computed(
    () =>
      chosenChainSender.value?.chain_params.chain_id ===
      providerSender.chainId.value,
  )

  const isProviderReceiverChainValid = computed(
    () =>
      chosenChainRecipient.value?.chain_params.chain_id ===
        providerReceiver.chainId.value &&
      providerReceiver.selectedAddress.value === receiverAddress.value,
  )

  const allowedBridgeChainsToSelect = computed<BridgeChain[]>(() => {
    return bridgeChains.value.filter(el => el.id !== chosenChainSenderId.value)
  })

  const chainFromTokens = computed<BridgeToken[]>(
    () => chosenChainSender.value?.tokens || [],
  )

  const chosenTokenSender = computed<BridgeToken | undefined>(() =>
    chainFromTokens.value?.find(token => token.id === chosenTokenId.value),
  )

  const isChosenTokenSenderReplacable = computed(
    () => chosenTokenSender.value?.token_type === 'fungible',
  )

  const isChosenTokenSenderNotReplacable = computed(
    () => chosenTokenSender.value?.token_type === 'non-fungible',
  )

  const isNeedToSendRedeemTx = computed(() => !isEmpty(redeemTxBody.value))

  const isReceiverValid = computed(() => {
    if (receiverAddress.value) {
      if (chosenChainRecipient.value?.chain_type === CHAIN_TYPES.evm) {
        return ethers.utils.isAddress(receiverAddress.value)
      } else {
        return true
      }
    } else {
      return false
    }
  })

  watch(chosenTokenId, () => {
    chosenTokenNftId.value = ''
    chosenTokenQuantity.value = ''
  })

  watch(chosenChainSenderId, () => {
    if (chosenChainSenderId.value === chosenChainRecipientId.value) {
      chosenChainRecipientId.value = allowedBridgeChainsToSelect.value[0].id
    }

    chosenTokenId.value = chainFromTokens.value.length
      ? chainFromTokens.value[0].id
      : ''
  })

  watch(providerSender.selectedAddress, () => {
    persistedConnectedProviders.value.providerSenderName = providerSender
      .selectedAddress.value
      ? providerSender.selectedProvider.value
      : undefined
  })

  watch(providerReceiver.selectedAddress, () => {
    persistedConnectedProviders.value.providerReceiverName = providerReceiver
      .selectedAddress.value
      ? providerReceiver.selectedProvider.value
      : undefined
  })

  watch(
    chosenTokenNftId,
    debounce(() => {
      if (chosenTokenNftId.value) {
        tryLoadNftDetails()
      } else {
        nftDetails.value = undefined
        isNftLoaded.value = false
        isNftLoadFailed.value = false
      }
    }, 1000),
  )

  watch(
    [
      chosenTokenId,
      chosenTokenNftId,
      chosenChainSenderId,
      providerSender.selectedAddress,
    ],
    debounce(() => {
      if (txHash.value) return

      if (isChosenTokenSenderReplacable.value) {
        tryLoadTokenBalance()
      } else if (chosenTokenNftId.value) {
        tryLoadTokenBalance()
      }
    }, 500),
  )

  const tryLoadNftDetails = async () => {
    isNftLoaded.value = false
    isNftLoadFailed.value = false
    try {
      nftDetails.value = await loadNftDetails()
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
      isNftLoadFailed.value = true
      nftDetails.value = undefined
    }
    isNftLoaded.value = true
  }

  const tryLoadTokenBalance = async () => {
    isBalanceLoaded.value = false
    isBalanceLoadFailed.value = false
    try {
      await loadSelectedTokenBalance()
      await sleep(1500)
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error)
      isBalanceLoadFailed.value = true
    }
    isBalanceLoaded.value = true
  }

  const init = async () => {
    bridgeChains.value = await fetchChains()

    if (bridgeChains.value.length) {
      chosenChainSenderId.value = bridgeChains.value[0].id
      chosenChainRecipientId.value = allowedBridgeChainsToSelect.value[0].id

      if (chainFromTokens.value?.length) {
        chosenTokenId.value = chainFromTokens.value[0].id
      }
    }

    if (persistedConnectedProviders.value.providerSenderName) {
      const designatedproviderSender = designatedProviders.value.find(
        el => el.name === persistedConnectedProviders.value.providerSenderName,
      )

      if (designatedproviderSender) {
        try {
          await providerSender.init(designatedproviderSender)
          await providerSender.connect()
        } catch (error) {
          await providerSender.disconnect()
        }
      }
    }
    if (persistedConnectedProviders.value.providerReceiverName) {
      const designatedproviderReceiver = designatedProviders.value.find(
        el =>
          el.name === persistedConnectedProviders.value.providerReceiverName,
      )

      if (designatedproviderReceiver) {
        try {
          await providerReceiver.init(designatedproviderReceiver)
          await providerReceiver.connect()
        } catch (error) {
          await providerReceiver.disconnect()
        }
      }
    }

    await loadSelectedTokenBalance()
  }

  const handleApproval = async () => {
    const { data } = await api.post<BridgeApprovalResponse>(
      '/v1/transfers/approve',
      {
        data: {
          address: providerSender.selectedAddress.value,
          chain_id: chosenChainSenderId.value,
          token_id: chosenTokenId.value,
        },
      },
    )
    if (data) {
      await providerSender.signAndSendTx(data.tx_body)
    }
  }

  const transfer = async () => {
    const { data } = await api.post<BridgeLockTokenResponse>(
      '/v1/transfers/lock',
      {
        data: {
          token_id: chosenTokenId.value,
          chain_from: chosenChainSenderId.value,
          chain_to: chosenChainRecipientId.value,
          sender: providerSender.selectedAddress.value,
          receiver: receiverAddress.value,
          ...(isChosenTokenSenderReplacable.value
            ? { amount: chosenTokenQuantity.value }
            : {}),
          nft_id: chosenTokenNftId.value,
        },
      },
    )

    // FIXME
    if (data.type === 'evm_transaction') {
      const tx = (await providerSender.signAndSendTx(
        data.tx_body,
      )) as EthTransactionResponse
      txHash.value = tx.hash
    } else if (data.type === 'processed_transaction') {
      txHash.value = data.id
    }
  }

  const redeem = async () => {
    do {
      try {
        const { data } = await api.post<BridgeRedeemTokenResponse>(
          '/v1/transfers/redeem',
          {
            data: {
              token_id: chosenTokenId.value,
              chain_from: chosenChainSenderId.value,
              tx_hash: txHash.value,
            },
          },
        )

        if (data.type === 'evm_transaction') {
          redeemTxBody.value = data.tx_body

          if (!chosenChainRecipientId.value) {
            chosenChainRecipientId.value = data.chain.id
          }
        } else if (data.type === 'processed_transaction') {
          finishedFlowTx.value = data.id
        }

        break
      } catch (error) {
        if (
          error instanceof errors.BadRequestError &&
          error.code === 'not_confirmed'
        ) {
          await sleep(10000)
        } else {
          throw error
        }
      }
    } while (!finishedFlowTx.value)
  }

  const sendRedeemTx = async () => {
    try {
      const tx = (await providerSender.signAndSendTx(
        redeemTxBody.value,
      )) as EthTransactionResponse
      finishedFlowTx.value = tx.hash
    } catch (error) {
      ErrorHandler.process(error)
    }
  }

  const loadNftDetails = async () => {
    const { data } = await api.get<BridgeNftDetails>(
      `/v1/tokens/${chosenTokenId.value}/nfts/${chosenTokenNftId.value}`,
      {
        chain: chosenChainSenderId.value,
      },
    )
    await sleep(1500)
    return data
  }

  const loadSelectedTokenBalance = async () => {
    if (!chosenTokenId.value || !providerSender.selectedAddress.value) return

    const { data } = await api.get<BridgeTokenBalance>(
      `/v1/tokens/${chosenTokenId.value}/balance`,
      {
        address: providerSender.selectedAddress.value,
        chain: chosenChainSenderId.value,
        ...(isChosenTokenSenderNotReplacable.value
          ? { nft: chosenTokenNftId.value }
          : {}),
      },
    )

    selectedTokenBalance.value = data
  }

  const resetForm = () => {
    chosenTokenId.value = chainFromTokens.value[0].id
    chosenTokenQuantity.value = ''
    chosenTokenNftId.value = ''
    receiverAddress.value = ''
    redeemTxBody.value = ''
    finishedFlowTx.value = ''
    txHash.value = ''
  }

  return {
    bridgeChains,
    nftDetails,
    selectedTokenBalance,

    isBalanceLoaded,
    isBalanceLoadFailed,
    isNftLoaded,
    isNftLoadFailed,

    chosenChainSenderId,
    chosenChainRecipientId,
    chosenTokenId,
    receiverAddress,
    chosenTokenQuantity,
    chosenTokenNftId,
    txHash,
    finishedFlowTx,

    chosenChainSender,
    isProviderSenderChainValid,
    allowedBridgeChainsToSelect,
    chosenChainRecipient,
    isProviderReceiverChainValid,
    chainFromTokens,
    chosenTokenSender,
    isChosenTokenSenderReplacable,
    isChosenTokenSenderNotReplacable,
    isNeedToSendRedeemTx,
    isReceiverValid,

    providerSender,
    providerReceiver,

    init,
    handleApproval,
    transfer,
    redeem,
    sendRedeemTx,
    loadNftDetails,
    loadSelectedTokenBalance,

    resetForm,
  }
}
