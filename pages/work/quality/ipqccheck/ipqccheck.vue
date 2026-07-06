<template>
	<view class="check-container">
		<view class="check-header">
			<view class="left">
				<uni-icons custom-prefix="iconfont" type="icon-xianshiqi2" color="#fff" size="18"></uni-icons>
				<text>工位</text>
			</view>
			<view class="right">
				请扫描
			</view>
		</view>
		<view class="check-body">
			<view class="body-item">
				<view class="label">
					<uni-icons custom-prefix="iconfont" type="icon-gongju"></uni-icons>
					<text>工段</text>
				</view>

				<text>--</text>
			</view>
			<view class="body-item">
				<view class="label">
					<uni-icons custom-prefix="iconfont" type="icon-gongxu"></uni-icons>
					<text>工序</text>
				</view>

				<text>--</text>
			</view>
			<view class="body-item">
				<view class="label">
					<uni-icons custom-prefix="iconfont" type="icon-xianshiqi2"></uni-icons>
					<text>设备</text>
				</view>
				<text>--</text>
			</view>
		</view>
		<view class="check-result">
			<text>工单/跟踪标签</text>
			<view class="right">
				<text>请扫描或选择</text>
				<uni-icons type="right" color="#007aff">
				</uni-icons>
			</view>
		</view>
		<view class="check-center">
			<view class="check-item">
				<text>送检数</text>
				<text>--</text>
			</view>
			<view class="check-item">
				<text>抽样数</text>
				<text>--</text>
			</view>
			<view class="check-item">
				<text>不合格数</text>
				<text>--</text>
			</view>
		</view>

		<view class="check-list">
			<view class="check-value">
				<text>项目</text>
				<text>抽样数</text>
				<text>不合格数</text>
				<text>项目结论</text>
			</view>
		</view>
		<view class="bottom-container">
			<view class="left">
				<text>结论 --</text>
			</view>
			<view class="right">
				<button type="primary" size="mini" disabled="true">保存</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	.check-container {
		& .check-header {
			background-color: var(--uni-color-primary);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;
			color: #fff;

			& .left {
				display: flex;
				align-items: center;

				& uni-text {
					margin-left: 20rpx;
				}
			}
		}

		& .check-body {
			background-color: #fff;
			padding: 20rpx;

			& .body-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 10rpx;

				& uni-text {
					margin-left: 10rpx;
				}
			}
		}

		& .check-center {
			background-color: #fff;
			padding: 20rpx;
			margin-top: 20rpx;
			display: flex;
			justify-content: center;
			align-items: center;

			& .check-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				border-right: 1px solid var(--uni-border-color);

				&:last-child {
					border-right: 0;
				}
			}
		}

		& .check-result {
			background-color: #fff;
			padding: 20rpx;
			display: flex;
			justify-content: space-between;
			margin-top: 20rpx;

			& .right {
				display: flex;
				align-items: center;

				& uni-text {
					margin-right: 10rpx;
				}
			}
		}

		& .check-list {
			margin-top: 20rpx;
			background-color: #fff;
			padding: 20rpx;

			& .check-value {
				display: flex;
				justify-content: space-between;

				& uni-text {
					flex: 1;
				}
			}
		}
	}
</style>