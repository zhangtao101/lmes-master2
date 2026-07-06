<template>
  <view class="animations">
    <view class="loader" :style="{ '--color': color }"></view>
  </view>
</template>

<script>
export default {
  name: "loading-cube",
  props: {
    color: {
      type: String,
      default: "#0396FF",
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.loader {
  width: 96rpx;
  height: 96rpx;
  margin: auto;
  position: relative;
}

.loader::before {
  content: '';
  width: 96rpx;
  height: 10rpx;
  background: #999;
  position: absolute;
  top: 120rpx;
  left: 0;
  border-radius: 50%;
  animation: shadow324 0.5s linear infinite;
}

.loader::after {
  content: '';
  width: 100%;
  height: 100%;
  background: var(--color);
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 8rpx;
  animation: jump7456 0.5s linear infinite;
}

@keyframes jump7456 {
  15% {
    border-bottom-right-radius: 6rpx;
  }

  25% {
    transform: translateY(18rpx) rotate(22.5deg);
  }

  50% {
    transform: translateY(36rpx) scale(1, .9) rotate(45deg);
    border-bottom-right-radius: 80rpx;
  }

  75% {
    transform: translateY(18rpx) rotate(67.5deg);
  }

  100% {
    transform: translateY(0) rotate(90deg);
  }
}

@keyframes shadow324 {
  0%,
  100% {
    transform: scale(1, 1);
  }

  50% {
    transform: scale(1.2, 1);
  }
}
</style>
