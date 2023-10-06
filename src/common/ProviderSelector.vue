<template>
  <div class="provider-selector">
    <app-button
      class="provider-selector__item"
      scheme="flat"
      size="large"
      v-for="item in designatedProviders"
      :key="item.name"
      :icon-left="getIconForCurrentDesignatedProvider(item)"
      :text="item.name"
      @click="selectDesignatedProvider(item)"
    />
  </div>
</template>

<script lang="ts" setup>
import { AppButton } from '@/common'
import { DesignatedProvider } from '@/types'
import { ICON_NAMES, PROVIDERS } from '@/enums'
import { get } from 'lodash-es'

defineProps<{
  designatedProviders: DesignatedProvider[]
}>()

const emit = defineEmits<{
  (event: 'select', payload: DesignatedProvider): void
}>()

const selectDesignatedProvider = (designatedProvider: DesignatedProvider) => {
  emit('select', designatedProvider)
}

const getIconForCurrentDesignatedProvider = (
  designatedProvider: DesignatedProvider,
) => {
  const designatedProvidersToIconsMap = {
    [PROVIDERS.metamask]: ICON_NAMES.metamask,
    [PROVIDERS.coinbase]: ICON_NAMES.coinbase,
  }

  return get(
    designatedProvidersToIconsMap,
    designatedProvider.name,
    ICON_NAMES.userCircle,
  ) as ICON_NAMES
}
</script>

<style lang="scss" scoped>
.provider-selector {
  display: flex;
  flex-direction: column;
  gap: toRem(24);
}

.provider-selector__item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
