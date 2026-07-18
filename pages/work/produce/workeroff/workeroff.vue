<template>
	<view class="worker-container">
		<view class="work-content">
			<view class="work-item">
				<view class="work-label">
					<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont" type="icon-xianshiqi"
						size="18"></uni-icons><text>{{ $t('ws.workStation') }}</text>
				</view>
				<text class="work-value">

				</text>
			</view>
			<view class="work-item">
				<view class="work-label">
					<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont"
						type="icon-shebeidianjian" size="18"></uni-icons>
					<text>{{ $t('ws.equipment') }}</text>
				</view>
				<text class="work-value">
				</text>
				<text class="work-label">
					{{ $t('ws.process') }}
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					{{ $t('ws.workSheet') }}
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					{{ $t('ws.planQty') }}
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					{{ $t('ws.productCode') }}
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					{{ $t('ws.productName') }}
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<button type="primary" size="mini">{{ $t('produce.workeroff.oneKeyOff') }}</button>
			</view>
		</view>
		<view class="worker-info">
			<view class="common-container-header">
				<uni-icons color="#fff" custom-prefix="iconfont" type="icon-yuangonghuangye" size="18"></uni-icons>
				<text class="common-text">{{ $t('produce.worker.cardNo') }}</text>
				<text class="common-right">
					{{ $t('produce.worker.scanOrInput') }}
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					{{ $t('produce.worker.name') }}
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					{{ $t('produce.worker.post') }}
				</text>
				<text class="work-value">
				</text>
			</view>
			<view class="work-item">
				<text class="work-label">
					{{ $t('produce.worker.onTime') }}
				</text>
				<text class="work-value">
				</text>
			</view>
		</view>
		<view class="splitor">
		</view>
		<view class="last-record">
			<text class="record-title">{{ $t('produce.worker.lastRecord') }}</text>
			<view class="work-item">
				<text class="work-label">
					{{ $t('produce.workeroff.offPerson') }}
				</text>
				<text class="work-value">
				</text>
				<text class="work-label">
					{{ $t('produce.workeroff.offTime') }}
				</text>
				<text class="work-value">
				</text>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini">{{ $t('produce.workeroff.confirmOn') }}</button>
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
