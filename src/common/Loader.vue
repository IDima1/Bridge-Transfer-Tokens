<template>
  <div class="loader">
    <template v-if="scheme === 'spinner'">
      <spinner />
    </template>
    <template v-else-if="scheme === 'skeleton'">
      <skeleton />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { Spinner, Skeleton } from '@/common/loaders'

withDefaults(
  defineProps<{
    scheme?: 'spinner' | 'skeleton'
  }>(),
  {
    scheme: 'spinner',
  },
)
</script>

<style lang="scss" scoped>
.loader {
  display: grid;
  place-items: center;
}
</style>
