<template>
	<view class="main-container">
		<view class="container-box">
			<view class="box-header">
				<view class="icon">
				</view>
			<view class="title">{{ $t('index.unreadMsg') }}
			</view>
			</view>
			<view class="box-content">
				<view class="content-item" v-for="item in 2" :key="item">
					{{ $t('index.unreadMsg') }}{{item}}
				</view>
			<view class="more">
				{{ $t('index.more') }}
			</view>
			</view>
		</view>
		<view class="container-box">
			<view class="box-header">
				<view class="icon">
				</view>
			<view class="title">{{ $t('index.todo') }}
			</view>
			</view>
			<view class="box-content task-content">
				<view class="task-item" v-for="item in 5" :key="item">
					{{ $t('index.todo') }}{{item}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import home from '/api/home.js'
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {
			//判断是否登录
			const auth = uni.getStorageSync('auth');
			if (!auth) {
				uni.showToast({
					title: this.$t('index.loginFirst')
				})
				uni.navigateTo({
					url: '/pages/login/login'
				})
			}
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	.main-container {
		padding: 50rpx 20rpx;
		color: var(--uni-text-color_second);

		& .box-content {
			padding-left: 60rpx;
			padding-right: 30rpx;

			&.task-content {
				padding-left: 40rpx;
			}


			& .content-item {
				border-bottom: 1px solid var(--uni-border-color);
				padding: 20rpx;
				padding-left: 0;
			}

			& .more {
				text-align: right;
				margin-top: 40rpx;

			}

			& .task-item {
				height: 160rpx;
				border-radius: 10px;
				background-color: var(--uni-bg-color-grey-deep);
				margin-top: 40rpx;
				padding: 10rpx;
			}
		}
	}
</style>