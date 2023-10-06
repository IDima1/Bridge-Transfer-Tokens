<template>
  <div class="spinner">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.spinner {
  display: inline-block;
  position: relative;
  width: toRem(80);
  height: toRem(80);
}

.spinner:after {
  content: ' ';
  display: block;
  position: absolute;
  width: toRem(64);
  height: toRem(64);
  margin: toRem(8);
  border-radius: 50%;
  border: toRem(6) solid var(--primary-main);
  border-color: var(--primary-main) transparent transparent transparent;
  animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner div:nth-child(1) {
  animation-delay: -0.45s;
}
.spinner div:nth-child(2) {
  animation-delay: -0.3s;
}
.spinner div:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
