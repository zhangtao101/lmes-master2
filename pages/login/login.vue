<template>
	<view class="login-container">
		<view class="login-form">
			<view class="form-item">
				<view class="form-item-wrapper">
					<uni-icons type="person" size="20" color="#999"></uni-icons>
				<uni-easyinput 
					:placeholder="$t('login.accountPlaceholder')" 
					v-model="username" 
					:inputBorder="false"
					placeholderStyle="color: #999;"
				></uni-easyinput>
				</view>
			</view>
			<view class="form-item">
				<view class="form-item-wrapper">
					<uni-icons type="locked" size="20" color="#999"></uni-icons>
				<uni-easyinput 
					:placeholder="$t('login.passwordPlaceholder')" 
					type="password" 
					v-model="password" 
					:inputBorder="false"
					placeholderStyle="color: #999;"
				></uni-easyinput>
				</view>
			</view>
			<view class="form-item">
				<button type="primary" class="login-btn" @click="onLogin" :loading="isLoading" :disabled="isLoading">
					{{isLoading ? $t('login.submitting') : $t('login.submit')}}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import home from '../../api/home.js'
	export default {
		data() {
			return {
				username: '',
				password: '',
				isLoading: false
			}
		},
		methods: {
			onLogin: function() {
				if (!this.username || !this.password) {
					uni.showToast({
						title: this.$t('login.empty'),
						icon: 'none',
						duration: 2000
					})
					return;
				}

				this.isLoading = true;

				home.login(this.username, this.password, false, 'pda').then(res => {
					if (res.code == 200) {
						uni.setStorageSync("auth", res.data.Authorization)
						uni.setStorageSync("user", res.data.user);
						uni.reLaunch({
							url: '/pages/work/work'
						});
					} else {
						uni.showToast({
							title: res.msg || this.$t('login.fail'),
							duration: 3000,
							mask: true
						})
						this.isLoading = false;
					}

				}).catch(err => {
					uni.showToast({
						title: err || this.$t('login.netError'),
						duration: 3000,
						mask: true
					})
					this.isLoading = false;
				});
			}
		}
	}
</script>

<style scoped lang="less">
	.login-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx;
		position: relative;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			width: 600rpx;
			height: 600rpx;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 50%;
			top: -200rpx;
			right: -200rpx;
		}

		&::after {
			content: '';
			position: absolute;
			width: 400rpx;
			height: 400rpx;
			background: rgba(255, 255, 255, 0.08);
			border-radius: 50%;
			bottom: -150rpx;
			left: -150rpx;
		}

		.login-form {
			width: 100%;
			background: rgba(255, 255, 255, 0.95);
			border-radius: 32rpx;
			padding: 60rpx 40rpx;
			box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
			z-index: 1;

			.form-item {
				margin-bottom: 32rpx;

				.form-item-wrapper {
					display: flex;
					align-items: center;
					background: #f5f7fa;
					border-radius: 16rpx;
					padding: 24rpx 30rpx;
					border: 2rpx solid transparent;
					transition: all 0.3s;

					&:focus-within {
						border-color: #667eea;
						background: #ffffff;
						box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
					}

					&:first-child {
						margin-right: 20rpx;
					}

					::v-deep .uni-easyinput__content {
						background: transparent !important;
						padding: 0 !important;
						height: auto !important;
						min-height: auto !important;
					}
				}

				.login-btn {
					width: 100%;
					height: 96rpx;
					line-height: 96rpx;
					font-size: 32rpx;
					font-weight: bold;
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border-radius: 48rpx;
					border: none;
					box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
					transition: all 0.3s;

					&:active {
						transform: translateY(2rpx);
						box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
					}
				}
			}
		}

		.login-footer {
			margin-top: 60rpx;
			text-align: center;
			z-index: 1;

			text {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
</style>