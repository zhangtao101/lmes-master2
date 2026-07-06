<template>
	<view v-if="visible" class="toast-mask" @click="handleMaskClick">
		<view class="toast-container" :class="type" @click.stop>
			<view class="toast-icon" v-if="icon !== 'none'">
				<uni-icons :type="iconType" :size="40"></uni-icons>
			</view>
			<text class="toast-message">{{message}}</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'Toast',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		message: {
			type: String,
			default: ''
		},
		icon: {
			type: String,
			default: 'success'
		},
		duration: {
			type: Number,
			default: 2000
		}
	},
	data() {
		return {
			timer: null
		}
	},
	watch: {
		visible(newVal) {
			if (newVal) {
				this.startTimer();
			} else {
				this.clearTimer();
			}
		}
	},
	computed: {
		iconType() {
			const iconMap = {
				'success': 'checkmarkempty',
				'error': 'closeempty',
				'warn': 'info',
				'none': ''
			};
			return iconMap[this.icon] || 'checkmarkempty';
		},
		type() {
			return this.icon;
		}
	},
	methods: {
		startTimer() {
			this.clearTimer();
			this.timer = setTimeout(() => {
				this.$emit('close');
			}, this.duration);
		},
		clearTimer() {
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			}
		},
		handleMaskClick() {
			this.$emit('close');
		}
	},
	destroyed() {
		this.clearTimer();
	}
}
</script>

<style lang="less" scoped>
	.toast-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		animation: fadeIn 0.3s;
	}

	.toast-container {
		background: #fff;
		border-radius: 16rpx;
		padding: 40rpx 60rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		min-width: 400rpx;
		max-width: 600rpx;
		animation: slideUp 0.3s;

		&.success {
			.toast-icon {
				color: #52c41a;
			}
		}

		&.error {
			.toast-icon {
				color: #ff4d4f;
			}
		}

		&.warn {
			.toast-icon {
				color: #faad14;
			}
		}

		.toast-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 80rpx;
			height: 80rpx;
		}

		.toast-message {
			font-size: 28rpx;
			color: #333;
			text-align: center;
			line-height: 1.5;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100rpx);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
