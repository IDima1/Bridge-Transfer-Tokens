<template>
  <transition name="collapse__body-transition">
    <div v-show="isShown" class="collapse__body">
      <slot />
    </div>
  </transition>
</template>

<script lang="ts" setup>
defineProps<{
  isShown: boolean
}>()
</script>

<style lang="scss" scoped>
.collapse__body {
  overflow: hidden;
}

.collapse__body-transition-enter-active {
  overflow: hidden;
  animation: collapse-frame-keyframes 0.25s ease-in-out;
}

.collapse__body-transition-leave-active {
  overflow: hidden;
  animation: collapse-frame-keyframes 0.25s ease-in-out reverse;
}

@keyframes collapse-frame-keyframes {
  from {
    height: 0;
  }

  to {
    height: var(--collapse-body-height);
  }
}
</style>
