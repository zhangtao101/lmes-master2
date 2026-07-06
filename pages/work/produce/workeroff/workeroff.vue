<template>
	<view class="worker-container">
		<view class="work-content">
			<view class="work-item">
				<view class="work-label">
					<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont" type="icon-xianshiqi"
						size="18"></uni-icons><text>工位：</text>
				</view>
				<text class="work-value">

				</text>
			</view>
			<view class="work-item">
				<view class="work-label">
					<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont"
						type="icon-shebeidianjian" size="18"></uni-icons>
					<text>设备：</text>
				</view>
				<text class="work-value">
				</text>
				<text class="work-label">
					工序：
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					工单号：
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					计划数量：
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					产品编号：
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					产品名称：
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<button type="primary" size="mini">一键下工</button>
			</view>
		</view>
		<view class="worker-info">
			<view class="common-container-header">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-yuangonghuangye" size="18"></uni-icons>
				<text class="common-text">员工卡号：</text>
				<text class="common-right">
					请扫描或输入
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					员工姓名：
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					所属岗位：
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					上工时间：
				</text>
				<text class="work-value">
				</text>
			</view>
		</view>
		<view class="splitor">
		</view>
		<view class="last-record">
			<text class="record-title">前次记录</text>
			<view class="work-item">
				<text class="work-label">
					下工人员：
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					下工时间：
				</text>
				<text class="work-value">
				</text>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini">确认上工</button>
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
	.worker-container {
		padding: 40rpx;

		& .work-item {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			padding: 10rpx 0;

			& .work-label {
				margin-left: 10rpx;
				// width: 160rpx;
				// flex: 1;
				text-align: right;
				// font-size: 26rpx;
			}

			& .work-value {
				margin-left: 10rpx;
				flex: 1;
			}
		}

		& .last-record {

			& .record-title {
				color: var(--uni-color-error);
				font-weight: 600;
			}

		}

	}
</style>