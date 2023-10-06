<template>
  <slot
    :modal="{
      show: showModal,
      hide: hideModal,
      toggle: toggleModal,
    }"
  />
  <modal v-model:is-shown="isModalShown">
    <template #default>
      <div class="modal-provider-selector__modal-pane">
        <div class="modal-provider-selector__modal-header">
          <h3 v-if="title" class="modal-provider-selector__modal-title">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="modal-provider-selector__modal-subtitle">
            {{ subtitle }}
          </p>
          <app-button
            class="modal-provider-selector__modal-close-button"
            scheme="none"
            size="small"
            :icon-right="$icons.x"
            @click="hideModal"
          />
        </div>
        <div class="modal-provider-selector__modal-body">
          <provider-selector
            :designated-providers="supportedDesignatedProviders"
            @select="handleSelectDesignatedProvider"
          />
        </div>
      </div>
    </template>
  </modal>
</template>

<script lang="ts" setup>
import { AppButton, Modal, ProviderSelector } from '@/common'

import { computed, ref } from 'vue'
import { UseProvider } from '@/composables'
import { CHAIN_TYPES, PROVIDERS_BY_CHAINS_TYPES } from '@/enums'
import { DesignatedProvider } from '@/types'
import { storeToRefs } from 'pinia'
import { useWeb3ProvidersStore } from '@/store'
import { ErrorHandler } from '@/helpers'

const props = withDefaults(
  defineProps<{
    providerWrapper: UseProvider
    chainType: CHAIN_TYPES
    title?: string
    subtitle?: string
  }>(),
  {
    title: '',
    subtitle: '',
  },
)

const isModalShown = ref(false)

const { providers } = storeToRefs(useWeb3ProvidersStore())

const supportedDesignatedProviders = computed<DesignatedProvider[]>(() => {
  return providers.value.filter(el =>
    PROVIDERS_BY_CHAINS_TYPES[props.chainType].includes(el.name),
  )
})

const showModal = () => {
  isModalShown.value = true
}

const hideModal = () => {
  isModalShown.value = false
}

const toggleModal = () => {
  isModalShown.value ? hideModal() : showModal()
}

const handleSelectDesignatedProvider = async (
  designatedProvider: DesignatedProvider,
) => {
  try {
    await props.providerWrapper.init(designatedProvider)

    if (!props.providerWrapper.isConnected.value) {
      await props.providerWrapper.connect()
    }
    hideModal()
  } catch (error) {
    ErrorHandler.process(error)
  }
}
</script>

<style lang="scss" scoped>
.modal-provider-selector__modal-pane {
  background: var(--background-primary-main);
  padding: toRem(24);
  width: clamp(#{toRem(300)}, 90vw, #{toRem(552)});
  border-radius: toRem(28);
}

.modal-provider-selector__modal-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: toRem(6);
  margin-bottom: toRem(32);
  padding-right: toRem(48);
}

.modal-provider-selector__modal-title {
  font-size: toRem(28);
  line-height: toRem(36);
}

.modal-provider-selector__modal-subtitle {
  font-size: toRem(14);
  line-height: toRem(20);
  color: var(--text-secondary-main);
}

.modal-provider-selector__modal-close-button {
  position: absolute;
  right: toRem(0);
  top: toRem(0);
  color: var(--primary-main);
}
</style>
