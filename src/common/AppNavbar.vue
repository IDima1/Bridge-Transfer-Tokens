<template>
  <div class="app-navbar">
    <app-logo class="app-navbar__logo" />
    <icon class="app-navbar__monogram" :name="$icons.monogram" />
    <div class="app-navbar__info">
      <h4 class="app-navbar__wallet-name">
        {{ `Wallet name` }}
      </h4>
      <h5 class="app-navbar__address">
        {{ `0x07...16F6` }}
      </h5>
    </div>
    <app-button
      class="app-navbar__settings"
      size="small"
      :scheme="'none'"
      :icon-right="$icons.settings"
    />
  </div>
</template>

<script lang="ts" setup>
import { AppLogo, AppButton, Icon } from '@/common'
</script>

<style lang="scss" scoped>
.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: toRem(16);
  padding: toRem(24) toRem(192) toRem(24) toRem(192);
  background: var(--background-primary-light);
  border-bottom: var(--border-primary-main);

  @include respond-to(tablet) {
    flex-wrap: wrap;
  }
}

.app-navbar__logo {
  margin-right: auto;

  @include respond-to(xsmall) {
    width: 100%;
    margin-bottom: toRem(24);
  }
}

.app-navbar__monogram {
  width: toRem(40);
  height: toRem(40);
}

.app-navbar__address {
  color: var(--text-secondary-main);
}
</style>
