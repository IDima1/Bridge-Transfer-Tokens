<template>
  <div class="bridge-form">
    <div class="bridge-form__wrapper">
      <template v-if="isTranferTab">
        <bridge-form-transfer class="bridge-form__content" :former="former" />
      </template>
      <template v-else>
        <bridge-form-redeem class="bridge-form__content" :former="former" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BridgeFormTransfer from '@/forms/BridgeForm/BridgeFormTransfer.vue'
import BridgeFormRedeem from '@/forms/BridgeForm/BridgeFormRedeem.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTE_NAMES } from '@/enums'
import { useBridgeForm } from '@/composables'

defineProps<{
  former: ReturnType<typeof useBridgeForm>
}>()

const route = useRoute()

const isTranferTab = computed(() => route.name === ROUTE_NAMES.bridgeTransfer)
</script>

<style lang="scss" scoped>
.bridge-form {
  display: grid;
  justify-items: center;
}

.bridge-form__wrapper {
  position: relative;
  max-width: toRem(670);
  width: 100%;
  margin: 0 auto;
}

.bridge-form__content {
  position: relative;
  width: 100%;
  background: var(--background-primary-light);
  box-shadow: toRem(0) toRem(0) toRem(12) toRem(0) rgba(161, 172, 211, 0.25);
  border-radius: toRem(4);
}
</style>
