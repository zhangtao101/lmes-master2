<template>
  <view class="animations">
    <view class="loader" :style="{ '--color': color }">
      <view></view>
      <view></view>
      <view></view>
      <view></view>
      <view></view>
    </view>
  </view>
</template>

<script>
export default {
  name: "loading-book",
  props: {
    color: {
      type: String,
      default: "#767979",
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.loader {
  position: relative;
  width: 66rpx;
  height: 66rpx;
  perspective: 134rpx;
}

.loader view {
  width: 100%;
  height: 100%;
  background: var(--color);
  position: absolute;
  left: 50%;
  transform-origin: left;
  animation: loader 2s infinite;
}

.loader view:nth-child(1) {
  animation-delay: 0.15s;
}

.loader view:nth-child(2) {
  animation-delay: 0.3s;
}

.loader view:nth-child(3) {
  animation-delay: 0.45s;
}

.loader view:nth-child(4) {
  animation-delay: 0.6s;
}

.loader view:nth-child(5) {
  animation-delay: 0.75s;
}

@keyframes loader {
  0% {
    transform: rotateY(0deg);
  }

  50%, 80% {
    transform: rotateY(-180deg);
  }

  90%, 100% {
    opacity: 0;
    transform: rotateY(-180deg);
  }
}
</style>
