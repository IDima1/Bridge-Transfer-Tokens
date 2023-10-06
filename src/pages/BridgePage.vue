<template>
  <div class="bridge-page">
    <div class="bridge-page__header">
      <h1 class="bridge-page__title">
        {{ $t('bridge-page.title') }}
      </h1>
      <h5 class="bridge-page__subtitle">
        {{ $t('bridge-page.subtitle') }}
      </h5>
    </div>
    <tabs
      :tabs="[
        {
          title: $t('bridge-page.transfer-link'),
          route: { name: $routes.bridgeTransfer },
        },
        {
          title: $t('bridge-page.redeem-link'),
          route: { name: $routes.bridgeRedeem },
        },
      ]"
    />
    <template v-if="isLoaded">
      <template v-if="isLoadFailed">
        <error-message :message="$t('bridge-page.loading-error-msg')" />
      </template>
      <template v-else-if="bridgeFormer.bridgeChains.value.length">
        <bridge-form :former="bridgeFormer" />
      </template>
      <template v-else>
        <no-data-message :message="$t('bridge-page.no-data-msg')" />
      </template>
    </template>
    <template v-else>
      <loader scheme="skeleton" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ErrorMessage, NoDataMessage, Loader, Tabs } from '@/common'
import BridgeForm from '@/forms/BridgeForm.vue'

import { ref } from 'vue'
import { useBridgeForm } from '@/composables'
import { ErrorHandler } from '@/helpers'

const isLoaded = ref(false)
const isLoadFailed = ref(false)

const bridgeFormer = useBridgeForm()

const init = async () => {
  try {
    await bridgeFormer.init()
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error)
    isLoadFailed.value = true
  }
  isLoaded.value = true
}

init()
</script>

<style lang="scss" scoped>
.bridge-page {
  max-width: toRem(552);
  width: 100%;
  height: 100%;
  padding: 0 0 toRem(48);
  margin: 0 auto;
}

.bridge-page__header {
  display: flex;
  flex-direction: column;
  gap: toRem(6);
}

.bridge-page__title {
  font-size: toRem(32);
}

.bridge-page__subtitle {
  color: var(--text-secondary-main);
}
</style>
