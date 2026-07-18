<template>
	<view class="main-container">
		<view class="container-box">
			<view class="box-header">
				<view class="icon">
				</view>
				<view class="title">
					<uni-search-bar></uni-search-bar>
				</view>
			</view>
			<view class="box-content task-content">
				<view class="task-item" v-for="item in 5" :key="item">
					<view>
						<view class="task-header">
							<image style="width:56rpx;height:56rpx;" src="../../../../static/images/shebei.png"></image>
							<text>
								JJG-00{{item}} | M0{{item}}#全自动干粉压机
							</text>
							<navigator url="/pages/work/device/devicerepair/equipmentMaintenance" style="float: right;">
								<image style="width:56rpx;height:56rpx;" src="../../../../static/images/you.png">
								</image>
							</navigator>
						</view>
						<view class="task-content">
							<view class="content-item">
								<text>维修计划：</text>
								<text class="content-value">
									<text style="color: red;">{{ $t('device.emergencyRepair') }}</text> | 100
								</text>
							</view>
							<view class="content-item">
								<text>报修时间：</text>
								<text class="content-value">
									24-10-25 22:08
								</text>
							</view>
							<view class="content-item">
								<text>报修故障：</text>
								<text class="content-value">
									设备故障/机器油压异常
								</text>
							</view>
						</view>
					</view>
				</view>
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
	.main-container {
		padding: 50rpx 20rpx;
		color: var(--uni-text-color_second);

		.title {
			border-bottom: 1px solid #888888;
			width: 100%;
		}

		& .box-content {
			padding-left: 60rpx;
			padding-right: 30rpx;

			&.task-content {
				padding-left: 40rpx;
			}


			& .content-item {
				padding-top: 12rpx;
				padding-left: 20rpx;
				display: flex;

				& .content-value {
					flex: 1;
					white-space: pre-wrap;
					word-break: break-all;

					&.pending {
						color: var(--uni-color-success);
					}

					&.delay {
						color: var(--uni-color-error);
					}
				}
			}

			& .more {
				text-align: right;
				margin-top: 40rpx;

			}

			& .task-item {
				border-radius: 10px;
				margin-top: 25rpx;
				padding: 5rpx;


				& .task-header,
				& .task-content {
					background-color: var(--uni-bg-color-grey-deep);
					margin: 10rpx 0 10rpx 0;
				}

				& .task-header * {

					vertical-align: middle;
				}
			}
		}
	}
</style>