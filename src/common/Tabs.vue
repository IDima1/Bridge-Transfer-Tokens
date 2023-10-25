<template>
  <div class="tabs">
    <router-link
      v-for="(tab, index) in tabs"
      :key="index"
      class="tabs__tab"
      :to="tab.route"
    >
      {{ tab.title }}
    </router-link>
  </div>
  <div class="tabs__divider" />
</template>

<script lang="ts" setup>
import { LocationAsRelativeRaw } from 'vue-router'

withDefaults(
  defineProps<{
    tabs: {
      title: string
      route: LocationAsRelativeRaw
    }[]
  }>(),
  {
    tabs: () => [],
  },
)
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  align-items: center;
  margin-top: toRem(24);
}

.tabs__tab {
  display: flex;
  align-items: center;
  gap: toRem(14);
  position: relative;
  padding: toRem(14) toRem(16);
  color: var(--text-primary-main);

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: toRem(2);
    width: 0;
    opacity: 0;
    background: var(--primary-main);
    transition: 0.2s ease-in-out;
  }

  &.router-link-exact-active {
    &:after {
      width: 100%;
      opacity: 1;
    }
  }
}

.tabs__divider {
  width: 100%;
  height: toRem(1);
  background-color: var(--border-secondary-light);
}
</style>
