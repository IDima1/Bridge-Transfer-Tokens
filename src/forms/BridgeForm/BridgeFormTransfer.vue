<template>
  <form class="bridge-form-transfer" @submit.prevent="submit">
    <div class="bridge-form-transfer__token">
      <select-field
        v-model="chosenTokenId"
        class="bridge-form-transfer__field"
        :value-options="bridgeChainTokensIds"
        :label="$t('bridge-form-transfer.token-lbl')"
        :disabled="isFormDisabled"
      >
        <template #head>
          {{ chosenTokenSender?.name || chosenTokenId }}
        </template>
        <template #default="{ selectField }">
          <button
            class="bridge-form-transfer__select-option"
            type="button"
            v-for="item in chainFromTokens"
            :key="item.id"
            @click="selectField.select(item.id)"
          >
            {{ item.name }}
          </button>
        </template>
      </select-field>
    </div>
    <div class="bridge-form-transfer__chains">
      <select-field
        v-model="chosenChainSenderId"
        class="bridge-form-transfer__field"
        :value-options="bridgeChainsAvailable"
        :label="$t('bridge-form-transfer.chain-sender-lbl')"
        :disabled="isFormDisabled"
      />
      <app-button
        class="bridge-form-transfer__chains-swap-btn"
        modification="border-circle"
        :icon-right="$icons.switchHorizontal"
        :size="'small'"
        @click="swapChains"
        :disabled="isFormDisabled"
      />
      <select-field
        v-model="chosenChainRecipientId"
        class="bridge-form-transfer__field"
        :value-options="allowedChainRecipientIds"
        :label="$t('bridge-form-transfer.chain-recipient-lbl')"
        :disabled="isFormDisabled"
      />
    </div>
    <template v-if="providerSender.isConnected.value">
      <template v-if="isChosenTokenSenderReplacable">
        <div class="bridge-form-transfer__amount-container">
          <p class="bridge-form-transfer__balance">
            <template v-if="isBalanceLoaded">
              <template v-if="isBalanceLoadFailed">
                <p>
                  {{ $t('bridge-form-transfer.balance-loading-error-msg') }}
                </p>
              </template>
              <template v-else>
                <div :style="{ opacity: isFormDisabled ? '0.5' : '1' }">
                  {{
                    $t('bridge-form-transfer.balance-lbl', {
                      value: formatAmount(selectedTokenBalance?.amount),
                    })
                  }}
                </div>
              </template>
            </template>
            <template v-else>
              <loader
                class="bridge-form-transfer__balance-skeleton"
                scheme="skeleton"
              />
            </template>
          </p>
          <input-field
            v-model="chosenTokenQuantity"
            type="number"
            class="bridge-form-transfer__field"
            :label="$t('bridge-form-transfer.amount-lbl')"
            :disabled="isFormDisabled"
            :error-message="
              chosenTokenQuantity && !isTokensEnough
                ? $t('bridge-form-transfer.funds-not-enough-msg')
                : ''
            "
          />
        </div>
      </template>
      <template v-else-if="isChosenTokenSenderNotReplacable">
        <div class="bridge-form-transfer__amount-container">
          <span v-if="chosenTokenNftId" class="bridge-form-transfer__balance">
            <template v-if="isBalanceLoaded">
              <template v-if="isBalanceLoadFailed">
                {{ $t('bridge-form-transfer.balance-loading-error-msg') }}
              </template>
              <template v-else>
                <div :style="{ opacity: isFormDisabled ? '0.5' : '1' }">
                  {{
                    $t('bridge-form-transfer.balance-lbl', {
                      value: formatAmount(selectedTokenBalance?.amount),
                    })
                  }}
                </div>
              </template>
            </template>
            <template v-else>
              <loader
                class="bridge-form-transfer__balance-skeleton"
                scheme="skeleton"
              />
            </template>
          </span>
          <input-field
            v-model="chosenTokenNftId"
            class="bridge-form-transfer__field"
            type="number"
            :label="$t('bridge-form-transfer.nft-id-lbl')"
            :disabled="isFormDisabled"
            :error-message="
              isNftLoaded && isNftLoadFailed
                ? $t('bridge-form-transfer.nft-load-failed-msg')
                : ''
            "
          >
            <template v-if="chosenTokenNftId && !isNftLoaded" #nodeRight>
              <loader class="bridge-form-transfer__nft-loader" />
            </template>
          </input-field>
        </div>
        <collapse
          :is-shown="Boolean(nftDetails?.image)"
          :style="{ opacity: isFormDisabled ? '0.7' : '1' }"
        >
          <div class="bridge-form-transfer__nft">
            <img
              class="bridge-form-transfer__nft-image"
              :src="nftDetails?.image"
              :alt="nftDetails?.name"
            />

            <div class="bridge-form-transfer__nft-details">
              <span class="bridge-form-transfer__nft-details-name">
                {{ nftDetails?.name }}
              </span>
              <span class="bridge-form-transfer__nft-details-description">
                {{ nftDetails?.description }}
              </span>
            </div>
          </div>
        </collapse>
      </template>
      <input-field
        v-model="receiverAddress"
        class="bridge-form-transfer__field"
        :label="$t('bridge-form-transfer.receiver-lbl')"
        :disabled="isFormDisabled"
        :error-message="
          !!receiverAddress && !isReceiverValid
            ? $t('bridge-form-transfer.receiver-invalid-msg')
            : ''
        "
      />
    </template>
    <div class="bridge-form-transfer__actions">
      <template v-if="isSubmitting || txHash || finishedFlowTx">
        <status-alert
          class="bridge-form-transfer__status-alert"
          :title="
            txHash
              ? $t('bridge-form-transfer.locked-status-success-title')
              : $t('bridge-form-transfer.locking-status-title')
          "
          :subtitle="
            txHash
              ? $t('bridge-form-transfer.locked-status-success-subtitle')
              : $t('bridge-form-transfer.locking-status-subtitle')
          "
          :status="txHash ? 'success' : 'disabled'"
          :is-loading="!txHash && isSubmitting"
          :icon-name="txHash ? $icons.lockClosed : undefined"
        >
          <template v-if="txHash" #subtitle>
            <i18n-t
              keypath="bridge-form-transfer.locked-status-success-subtitle"
            >
              <template #link>
                <a
                  :href="
                    providerSender.getTxUrl(
                      chosenChainSender.chain_params.explorer_url,
                      txHash,
                    )
                  "
                  target="_blank"
                  class="bridge-form-transfer__status-alert-link"
                >
                  {{ $t('bridge-form-transfer.locked-status-success-link') }}
                </a>
              </template>
            </i18n-t>
          </template>
        </status-alert>
        <template
          v-if="(isNeedToSendRedeemTx && isSubmitting) || finishedFlowTx"
        >
          <status-alert
            class="bridge-form-transfer__status-alert"
            :title="
              finishedFlowTx
                ? $t('bridge-form-transfer.redeeming-status-success-title')
                : $t('bridge-form-transfer.redeeming-status-title')
            "
            :subtitle="
              finishedFlowTx
                ? $t('bridge-form-transfer.redeeming-status-success-subtitle')
                : $t('bridge-form-transfer.redeeming-status-subtitle')
            "
            :status="finishedFlowTx && !isSubmitting ? 'success' : 'disabled'"
            :is-loading="isSubmitting"
            :icon-name="
              finishedFlowTx && !isSubmitting ? $icons.checkCircle : undefined
            "
          >
            <template v-if="finishedFlowTx" #subtitle>
              <i18n-t
                keypath="bridge-form-transfer.redeeming-status-success-subtitle"
              >
                <template #link>
                  <a
                    :href="
                      providerReceiver.getTxUrl(
                        chosenChainRecipient.chain_params.explorer_url,
                        finishedFlowTx,
                      )
                    "
                    target="_blank"
                    class="bridge-form-transfer__status-alert-link"
                  >
                    {{ $t('bridge-form-transfer.redeeming-success-link') }}
                  </a>
                </template>
              </i18n-t>
            </template>
          </status-alert>
          <app-button
            v-if="finishedFlowTx"
            class="bridge-form-transfer__action-btn"
            size="large"
            :text="$t('bridge-form-transfer.transfer-another-btn')"
            @click="resetForm"
          />
        </template>
      </template>
      <template v-if="!isSubmitting && !finishedFlowTx">
        <template v-if="txHash">
          <template v-if="providerReceiver.isConnected.value">
            <template v-if="isProviderReceiverChainValid">
              <status-alert
                class="bridge-form-transfer__status-alert"
                :title="$t('bridge-form-transfer.start-redeem-status-title')"
                :subtitle="
                  $t('bridge-form-transfer.start-redeem-status-subtitle')
                "
                :status="'disabled'"
              />
              <app-button
                class="bridge-form-transfer__action-btn"
                type="submit"
                size="large"
                :text="$t('bridge-form-transfer.redeem-btn')"
                :disabled="!isFormValid"
              />
            </template>
            <template v-else>
              <status-alert
                v-if="
                  providerReceiver.selectedAddress.value !== receiverAddress
                "
                class="bridge-form-transfer__status-alert"
                :title="
                  $t('bridge-form-transfer.receiver-invalid-status-title')
                "
                :subtitle="
                  $t('bridge-form-transfer.receiver-invalid-status-subtitle')
                "
                :status="'error'"
                :icon-name="$icons.userCircle"
              />
              <template v-else>
                <status-alert
                  class="bridge-form-transfer__status-alert"
                  :title="
                    $t(
                      // eslint-disable-next-line max-len
                      'bridge-form-transfer.chain-recipient-invalid-status-title',
                    )
                  "
                  :subtitle="
                    $t(
                      // eslint-disable-next-line max-len
                      'bridge-form-transfer.chain-recipient-invalid-status-subtitle',
                    )
                  "
                  :status="'error'"
                  :icon-name="$icons.blockchainNodes"
                />
                <app-button
                  class="bridge-form-transfer__action-btn"
                  size="large"
                  :text="$t('bridge-form-transfer.switch-chain-btn')"
                  @click="
                    trySwitchChain(
                      providerReceiver,
                      chosenChainRecipient.chain_params.chain_id,
                    )
                  "
                  :icon-left="$icons.refresh"
                />
              </template>
            </template>
            <app-button
              class="bridge-form-transfer__action-btn"
              scheme="flat"
              size="large"
              :text="
                $t('bridge-form-transfer.disconnect-provider-btn', {
                  address: cropAddress(providerReceiver.selectedAddress.value),
                })
              "
              @click="providerReceiver.disconnect"
            />
          </template>
          <template v-else>
            <status-alert
              class="bridge-form-transfer__status-alert"
              :title="$t('bridge-form-transfer.connect-receiver-status-title')"
              :subtitle="
                $t('bridge-form-transfer.connect-receiver-status-subtitle')
              "
              :status="'disabled'"
            />
            <modal-provider-selector
              :title="$t('bridge-form-transfer.provider-modal-title')"
              :subtitle="$t('bridge-form-transfer.provider-modal-subtitle')"
              :provider-wrapper="providerReceiver"
              :chain-type="chosenChainRecipient.chain_type"
            >
              <template #default="{ modal }">
                <app-button
                  class="bridge-form-transfer__action-btn"
                  size="large"
                  :text="$t('bridge-form-transfer.connect-provider-btn')"
                  @click="modal.show"
                />
              </template>
            </modal-provider-selector>
          </template>
        </template>
        <template v-else>
          <template v-if="providerSender.isConnected.value">
            <template v-if="isProviderSenderChainValid">
              <app-button
                class="bridge-form-transfer__action-btn"
                type="submit"
                size="large"
                :text="$t('bridge-form-transfer.transfer-btn')"
                :disabled="!isFormValid"
              />
            </template>
            <template v-else>
              <status-alert
                class="bridge-form-transfer__status-alert"
                :title="
                  $t('bridge-form-transfer.chain-sender-invalid-status-title')
                "
                :subtitle="
                  $t(
                    'bridge-form-transfer.chain-sender-invalid-status-subtitle',
                  )
                "
                :status="'error'"
                :icon-name="$icons.blockchainNodes"
              />
              <app-button
                class="bridge-form-transfer__action-btn"
                size="large"
                :text="$t('bridge-form-transfer.switch-chain-btn')"
                :icon-left="$icons.refresh"
                @click="
                  trySwitchChain(
                    providerSender,
                    chosenChainSender.chain_params.chain_id,
                  )
                "
              />
            </template>
            <app-button
              class="bridge-form-transfer__action-btn"
              scheme="flat"
              size="large"
              :text="
                $t('bridge-form-transfer.disconnect-provider-btn', {
                  address: cropAddress(providerSender.selectedAddress.value),
                })
              "
              @click="providerSender.disconnect"
            />
          </template>
          <template v-else>
            <modal-provider-selector
              :provider-wrapper="providerSender"
              :chain-type="chosenChainSender.chain_type"
              :title="$t('bridge-form-transfer.provider-modal-title')"
              :subtitle="$t('bridge-form-transfer.provider-modal-subtitle')"
            >
              <template #default="{ modal }">
                <app-button
                  class="bridge-form-transfer__action-btn"
                  size="large"
                  :text="$t('bridge-form-transfer.connect-provider-btn')"
                  @click="modal.show"
                />
              </template>
            </modal-provider-selector>
          </template>
        </template>
      </template>
    </div>
  </form>
</template>

<script lang="ts" setup>
import {
  AppButton,
  Loader,
  ModalProviderSelector,
  StatusAlert,
  Collapse,
} from '@/common'
import { SelectField, InputField } from '@/fields'
import { useBridgeForm, UseProvider } from '@/composables'
import { computed, ref, toRefs } from 'vue'
import { ErrorHandler, cropAddress, formatAmount } from '@/helpers'
import { BN } from '@/utils'

const props = defineProps<{
  former: ReturnType<typeof useBridgeForm>
}>()

const isSubmitting = ref(false)

const {
  bridgeChains,
  nftDetails,
  selectedTokenBalance,

  isBalanceLoaded,
  isBalanceLoadFailed,
  isNftLoaded,
  isNftLoadFailed,

  chosenChainSender,
  chosenChainRecipient,
  chainFromTokens,
  receiverAddress,
  chosenTokenQuantity,
  chosenTokenNftId,
  txHash,
  finishedFlowTx,

  chosenChainSenderId,
  isProviderSenderChainValid,
  allowedBridgeChainsToSelect,
  chosenChainRecipientId,
  isProviderReceiverChainValid,
  chosenTokenId,
  chosenTokenSender,
  isChosenTokenSenderReplacable,
  isChosenTokenSenderNotReplacable,
  isReceiverValid,
  isNeedToSendRedeemTx,

  providerSender,
  providerReceiver,

  handleApproval,
  transfer,
  redeem,
  sendRedeemTx,

  resetForm,
} = toRefs(props.former)

const isFormDisabled = computed(
  () => isSubmitting.value || Boolean(txHash.value),
)

const isFormValid = computed(() => {
  if (isChosenTokenSenderReplacable.value) {
    return (
      Number(chosenTokenQuantity.value) &&
      isReceiverValid.value &&
      isTokensEnough.value
    )
  } else if (isChosenTokenSenderNotReplacable.value) {
    return (
      chosenTokenNftId.value && isReceiverValid.value && isTokensEnough.value
    )
  } else {
    return false
  }
})

const bridgeChainsAvailable = computed(() =>
  bridgeChains.value.map(chain => chain.id),
)

const allowedChainRecipientIds = computed(() =>
  allowedBridgeChainsToSelect.value.map(chain => chain.id),
)

const bridgeChainTokensIds = computed(() =>
  chainFromTokens.value?.map(token => token.id),
)

const isTokensEnough = computed(() =>
  isChosenTokenSenderReplacable.value
    ? selectedTokenBalance.value?.amount &&
      new BN(selectedTokenBalance.value?.amount).compare(
        chosenTokenQuantity.value,
      ) > 0
    : Number(selectedTokenBalance.value?.amount) > 0,
)

const submit = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {
    if (txHash.value) {
      await sendRedeemTx.value()
    } else {
      await handleApproval.value()
      await transfer.value()
      await redeem.value()
    }
  } catch (error) {
    ErrorHandler.process(error)
  }
  isSubmitting.value = false
}

const trySwitchChain = async (
  providerWrapper: UseProvider,
  chainId: number | string,
) => {
  try {
    await providerWrapper.switchChain(chainId)
  } catch (error) {
    ErrorHandler.process(error)
  }
}

const swapChains = () => {
  const chainFromId = chosenChainSenderId.value
  const chainToId = chosenChainRecipientId.value

  chosenChainSenderId.value = chainToId
  chosenChainRecipientId.value = chainFromId
}
</script>

<style lang="scss" scoped>
.bridge-form-transfer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: toRem(24);
  padding: toRem(24);
  margin-top: toRem(20);
}

.bridge-form-transfer__token {
  display: flex;
  width: 100%;
}

.bridge-form-transfer__chains {
  display: flex;
  align-items: center;
  gap: toRem(20);
  width: 100%;
}

.bridge-form-transfer__select-option {
  width: 100%;
  text-align: left;
  padding: toRem(12);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: toRem(16);
  transition: background-color var(--transition-duration);

  &:hover {
    background: var(--background-primary-dark);
  }
}

.bridge-form-transfer__amount-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.bridge-form-transfer__balance {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-right: toRem(16);
  font-size: toRem(12);
  line-height: 1.3;
  margin-left: auto;
  min-height: toRem(20);
}

.bridge-form-transfer__balance-disabled {
  opacity: 0.5;
}

.bridge-form-transfer__balance-skeleton {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-width: toRem(100);
  transform-origin: center;
  min-height: toRem(16);
}

.bridge-form-transfer__actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: toRem(24);
  width: 100%;
  margin-top: toRem(16);
}

.bridge-form-transfer__status-alert {
  width: 100%;
}

.bridge-form-transfer__status-alert-link {
  text-decoration: underline;
  font: inherit;
  color: var(--primary-main);
  font-weight: 600;
}

.bridge-form-transfer__nft {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: toRem(24);
}

.bridge-form-transfer__nft-image {
  display: block;
  max-width: toRem(264);
  max-height: toRem(264);
  width: 100%;
  height: auto;
}

.bridge-form-transfer__nft-details {
  display: flex;
  flex-direction: column;
  gap: toRem(12);
  background: var(--background-secondary-main);
  border: toRem(1) solid var(--border-secondary-light);
  padding: toRem(12) toRem(38) toRem(12) toRem(16);
  border-radius: toRem(14);
  width: 100%;
}

.bridge-form-transfer__nft-details-name {
  font-size: toRem(16);
  font-weight: 600;
  line-height: toRem(24);
  margin-bottom: toRem(8);
}

.bridge-form-transfer__nft-details-description {
  font-size: toRem(16);
  font-weight: 400;
  line-height: toRem(24);
  letter-spacing: toRem(0.5);
}

.bridge-form-transfer__nft-loader {
  position: relative;
  width: toRem(36);
  height: toRem(36);

  &:deep(> *) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.45);
  }
}

.bridge-form-transfer__loader {
  width: 50%;
  margin: 0 auto;
}

.bridge-form-transfer__action-btn {
  width: 100%;
}

.bridge-form-transfer__error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: toRem(12);
  color: var(--error-main);
  border-bottom: toRem(1) solid var(--error-main);
  border-radius: toRem(4);
  padding: toRem(6);
  width: 100%;
}

.bridge-form-transfer__error-message-icon {
  width: toRem(24);
  height: toRem(24);
}
</style>
