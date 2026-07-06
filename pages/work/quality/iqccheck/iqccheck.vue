<template>
	<view class="check-container">
		<view class="check-header">
			<view class="left">
				<uni-icons type="scan" color="#007aff" size="18"></uni-icons>
				<text>请扫描或选择到货号</text>
			</view>
			<view class="right">
				<uni-icons type="right" color="#007aff" size="18"></uni-icons>
			</view>
		</view>
		<view class="check-body">
			<view class="check-item">
				<text>材料名称</text>
				<text>--</text>
			</view>
			<view class="check-item">
				<text>到货仓库</text>
				<text>--</text>
			</view>
			<view class="check-item">
				<text>到货日期</text>
				<text>--</text>
			</view>
			<view class="check-item">
				<text>供应商</text>
				<text>--</text>
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
		<view class="check-result">
			<text>最终结论</text>
			<uni-icons type="right" color="#007aff"></uni-icons>
		</view>
		<view class="check-list">
			<view class="check-value">
				<text>项目</text>
				<text>抽样数</text>
				<text>不合格数</text>
				<text>项目结论</text>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini">保存</button>
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
			background-color: #fff;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx;

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

			& .check-item {
				padding: 10rpx 20rpx;

				& uni-text:last-child {
					margin-left: 20rpx;
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
			border-top: 1px solid var(--uni-border-color);
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