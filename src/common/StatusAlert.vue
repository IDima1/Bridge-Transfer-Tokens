<template>
  <div :class="indicatorMessageClasses">
    <div class="status-alert__header">
      <h4 class="status-alert__title">
        {{ title }}
      </h4>
      <p class="status-alert__subtitle">
        <template v-if="$slots.subtitle">
          <slot name="subtitle" />
        </template>
        <template v-else>
          {{ subtitle }}
        </template>
      </p>
    </div>
    <div class="status-alert__media">
      <template v-if="isLoading">
        <loader class="status-alert__loader" />
      </template>
      <template v-else-if="iconName">
        <icon class="status-alert__icon" :name="iconName" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon, Loader } from '@/common'

import { ICON_NAMES } from '@/enums'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle: string
    isLoading?: boolean
    status?: 'disabled' | 'success' | 'error' | 'warning' | 'info'
    iconName?: ICON_NAMES
    isDisabled?: boolean
  }>(),
  {
    status: 'disabled',
    iconName: undefined,
    isDisabled: false,
    isLoading: false,
  },
)

const indicatorMessageClasses = computed(() => ({
  ['status-alert']: true,
  ['status-alert--disabled']: props.isDisabled,
  [`status-alert--${props.status}`]: true,
}))
</script>

<style lang="scss" scoped>
.status-alert {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: toRem(16) toRem(16) toRem(16) toRem(16);
  border-radius: toRem(14);
  border: toRem(1) solid var(--primary-main);

  &--disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &--success {
    background-color: #e4f4e7;
    border: toRem(1) solid var(--success-main);
  }

  &--error {
    background-color: #fff2f1;
    border: toRem(1) solid var(--error-main);
  }

  &--warning {
    background-color: var(--warning-light);
    border: toRem(1) solid var(--warning-main);
  }

  &--info {
    background-color: var(--info-light);
    border: toRem(1) solid var(--info-main);
  }
}

.status-alert {
  display: flex;
  gap: toRem(22);
}

.status-alert__header {
  max-width: toRem(406);
}

.status-alert__title {
  font-size: toRem(14);
  font-weight: 500;
  line-height: toRem(20);
  color: var(--text-primary-main);
}

.status-alert__subtitle {
  font-size: toRem(14);
  font-weight: 400;
  line-height: toRem(20);
  color: var(--text-primary-light);
}

.status-alert__media {
  position: absolute;
  top: 50%;
  right: toRem(16);
  transform: translateY(-50%);
  width: toRem(36);
  height: toRem(36);
}

.status-alert__loader {
  width: 100%;
  height: 100%;

  &:deep(> *) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.45);
  }
}

.status-alert__icon {
  width: 100%;
  height: 100%;

  .status-alert--success & {
    color: var(--success-main);
  }

  .status-alert--error & {
    color: var(--error-main);
  }

  .status-alert--warning & {
    color: var(--warning-main);
  }

  .status-alert--info & {
    color: var(--info-main);
  }
}
</style>
