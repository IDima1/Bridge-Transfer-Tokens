<template>
  <form class="bridge-form-redeem" @submit.prevent="submit">
    <div class="bridge-form-redeem__header">
      <select-field
        v-model="chosenChainSenderId"
        :value-options="bridgeChainsAvailable"
        :label="$t('bridge-form-redeem.chain-sender-lbl')"
        :disabled="isFormDisabled"
      />
      <select-field
        v-model="chosenTokenId"
        :value-options="bridgeChainTokensIds"
        :label="$t('bridge-form-redeem.token-lbl')"
        :disabled="isFormDisabled"
      >
        <template #head>
          {{ chosenTokenSender?.name || chosenTokenId }}
        </template>
        <template #default="{ selectField }">
          <button
            type="button"
            v-for="item in chainFromTokens"
            :key="item.id"
            @click="selectField.select(item.id)"
          >
            {{ item.name }}
          </button>
        </template>
      </select-field>
      <input-field
        v-model="txHash"
        :label="$t('bridge-form-redeem.tx-hash-lbl')"
        :disabled="isFormDisabled"
      />
    </div>
    <div class="bridge-form-redeem__actions">
      <template v-if="isSubmitting || finishedFlowTx">
        <template v-if="!isNeedToSendRedeemTx && isSubmitting">
          <status-alert
            class="bridge-form-redeem__status-alert"
            :title="$t('bridge-form-redeem.try-redeem-status-title')"
            :subtitle="$t('bridge-form-redeem.try-redeem-status-subtitle')"
            :status="'disabled'"
            :is-loading="isSubmitting"
          />
        </template>
        <template
          v-else-if="(isNeedToSendRedeemTx && isSubmitting) || finishedFlowTx"
        >
          <status-alert
            class="bridge-form-redeem__status-alert"
            :title="
              finishedFlowTx
                ? $t('bridge-form-redeem.redeem-status-success-title')
                : $t('bridge-form-redeem.redeeming-status-title')
            "
            :subtitle="
              finishedFlowTx
                ? $t('bridge-form-redeem.redeem-status-success-subtitle')
                : $t('bridge-form-redeem.redeeming-status-subtitle')
            "
            :status="finishedFlowTx && !isSubmitting ? 'success' : 'disabled'"
            :is-loading="isSubmitting"
            :icon-name="
              finishedFlowTx && !isSubmitting ? $icons.checkCircle : undefined
            "
          >
            <template v-if="finishedFlowTx" #subtitle>
              <i18n-t
                keypath="bridge-form-redeem.redeem-status-success-subtitle"
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
                    class="bridge-form-redeem__status-alert-link"
                  >
                    {{ $t('bridge-form-redeem.redeeming-success-link') }}
                  </a>
                </template>
              </i18n-t>
            </template>
          </status-alert>
          <app-button
            v-if="finishedFlowTx"
            class="bridge-form-redeem__action-btn"
            size="large"
            :text="$t('bridge-form-redeem.redeem-another-btn')"
            @click="resetForm"
          />
        </template>
      </template>
      <template v-if="!isSubmitting && !finishedFlowTx">
        <template v-if="isNeedToSendRedeemTx">
          <template v-if="providerReceiver.isConnected.value">
            <template v-if="isProviderReceiverChainValid">
              <status-alert
                class="bridge-form-redeem__status-alert"
                :title="$t('bridge-form-redeem.start-redeem-status-title')"
                :subtitle="
                  $t('bridge-form-redeem.start-redeem-status-subtitle')
                "
                :status="'disabled'"
              />
              <app-button
                size="large"
                class="bridge-form-redeem__action-btn"
                type="submit"
                :text="$t('bridge-form-redeem.submit-btn')"
                :disabled="!txHash"
              />
            </template>
            <template v-else>
              <status-alert
                class="bridge-form-redeem__status-alert"
                :title="
                  $t('bridge-form-redeem.chain-recipient-invalid-status-title')
                "
                :subtitle="
                  $t(
                    // eslint-disable-next-line max-len
                    'bridge-form-redeem.chain-recipient-invalid-status-subtitle',
                  )
                "
                :status="'error'"
                :icon-name="$icons.blockchainNodes"
              />
              <app-button
                size="large"
                class="bridge-form-redeem__action-btn"
                :text="$t('bridge-form-redeem.switch-chain-btn')"
                :icon-left="$icons.refresh"
                @click="
                  trySwitchChain(
                    providerReceiver,
                    chosenChainRecipient.chain_params.chain_id,
                  )
                "
              />
            </template>
            <app-button
              size="large"
              class="bridge-form-redeem__action-btn"
              scheme="flat"
              :text="
                $t('bridge-form-redeem.disconnect-provider-btn', {
                  address: cropAddress(providerReceiver.selectedAddress.value),
                })
              "
              @click="providerReceiver.disconnect"
            />
          </template>
          <template v-else>
            <modal-provider-selector
              :provider-wrapper="providerReceiver"
              :chain-type="chosenChainRecipient.chain_type"
            >
              <template #default="{ modal }">
                <app-button
                  size="large"
                  class="bridge-form-redeem__action-btn"
                  :text="$t('bridge-form-redeem.connect-provider-btn')"
                  @click="modal.show"
                />
              </template>
            </modal-provider-selector>
          </template>
        </template>
        <template v-else>
          <app-button
            size="large"
            class="bridge-form-redeem__action-btn"
            type="submit"
            :text="$t('bridge-form-redeem.submit-btn')"
            :disabled="!txHash"
          />
        </template>
      </template>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { AppButton, ModalProviderSelector, StatusAlert } from '@/common'
import { SelectField, InputField } from '@/fields'

import { useBridgeForm, UseProvider } from '@/composables'
import { computed, ref, toRefs } from 'vue'
import { ErrorHandler, cropAddress } from '@/helpers'

const props = defineProps<{
  former: ReturnType<typeof useBridgeForm>
}>()

const isSubmitting = ref(false)

const {
  bridgeChains,
  chosenChainSenderId,
  chosenTokenId,
  txHash,

  finishedFlowTx,
  chosenChainRecipient,
  chainFromTokens,
  chosenTokenSender,
  isNeedToSendRedeemTx,

  providerReceiver,
  redeem,
  sendRedeemTx,
  resetForm,
} = toRefs(props.former)

const isFormDisabled = computed(
  () => isSubmitting.value || Boolean(finishedFlowTx.value),
)

const bridgeChainsAvailable = computed(() =>
  bridgeChains.value.map(chain => chain.id),
)

const bridgeChainTokensIds = computed(() =>
  chainFromTokens.value?.map(token => token.id),
)

const isProviderReceiverChainValid = computed(
  () =>
    providerReceiver.value.chainId.value ===
    chosenChainRecipient.value?.chain_params.chain_id,
)

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

const submit = async () => {
  isSubmitting.value = true
  try {
    if (isNeedToSendRedeemTx.value) {
      await sendRedeemTx.value()
    } else {
      await redeem.value()
    }
  } catch (error) {
    ErrorHandler.process(error)
  }
  isSubmitting.value = false
}
</script>

<style lang="scss" scoped>
.bridge-form-redeem {
  display: flex;
  flex-direction: column;
  padding: toRem(24);
  box-shadow: toRem(0) toRem(0) toRem(12) toRem(0) rgba(161, 172, 211, 0.25);
  border-radius: toRem(4);
  margin-top: toRem(20);
  overflow: hidden auto;
}

.bridge-form-redeem__header {
  display: flex;
  flex-direction: column;
  gap: toRem(24);
  width: 100%;
}

.bridge-form-redeem__actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: toRem(24);
  flex-wrap: wrap;
  width: 100%;
  margin-top: toRem(36);
}

.bridge-form-redeem__action-btn {
  width: 100%;
}

.bridge-form-redeem__status-alert {
  width: 100%;
}

.bridge-form-redeem__status-alert-link {
  font: inherit;
  text-decoration: underline;
  color: var(--primary-main);
  font-weight: 500;
}
</style>
