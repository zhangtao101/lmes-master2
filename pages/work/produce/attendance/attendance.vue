<template>
	<view class="attendance-container">
		<view class="top-container">
			<view class="header">
				<view class="left">
					<view class="profile">
						<uni-icons type="contact-filled" size="54" color="#fff"></uni-icons>
						<view class="name">
							<text>{{ $t('common.scan') }}</text>
							<text>--</text>
						</view>
					</view>

				</view>
				<view class="right">
					<text>11:01:47</text>
					<text>2024-05-17 星期五</text>

				</view>

			</view>
			<view class="opt-button">
				<view class="left">
					<button plain type="primary"> {{ $t('produce.attendance.onDuty') }}</button>
				</view>
				<view class="right">
					<button plain type="primary"> {{ $t('produce.attendance.offDuty') }}</button>
				</view>
			</view>
		</view>
		<view class="body-container">
			<view class="body-content">
				<view class="header">
					<view>
						<uni-icons custom-prefix="iconfont" size="18" color="#007aff" type="icon-gongju"></uni-icons>
						<text class="label">--</text>
					</view>
					<text>--</text>
				</view>
				<view class="content">
					<view class="header sub-header">
						<view>
							<uni-icons custom-prefix="iconfont" size="18" color="#007aff"
								type="icon-xianshiqi2"></uni-icons>
							<text class="label">{{ $t('produce.attendance.station') }}</text>
						</view>
						<uni-icons type="down" size="18" color="#007aff"></uni-icons>
					</view>
					<view class="content-body">
						<image style="width: 200rpx; height: 200rpx;" src="/static/images/scan_bg.jpg">
						</image>
						<text>{{ $t('produce.attendance.scanStation') }}</text>
					</view>
				</view>
				<view class="attendance-record">
					<view class="record-title">
						<text>{{ $t('produce.attendance.record') }}</text>
						<text>|</text>
						<text class="value">0</text>
					</view>
					<view class="record-list">
						<text>{{ $t('produce.attendance.time') }}</text>
						<text>{{ $t('produce.attendance.person') }}</text>
						<text>{{ $t('produce.attendance.qualify') }}</text>

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
	.attendance-container {
		& .top-container {
			background-color: var(--uni-color-primary);
			color: #fff;
			padding: 20rpx;

			& .header {
				display: flex;

				& .left,
				& .right {
					flex: 1;
					padding: 20rpx;
				}

				& .left {
					& .profile {
						display: flex;
						align-items: center;

						& .name {
							display: flex;
							flex-direction: column;
						}
					}
				}

				& .right {
					display: flex;
					flex-direction: column;

					& uni-text {
						margin-bottom: 15rpx;
					}
				}
			}

			& .opt-button {
				display: flex;
				padding-bottom: 40rpx;
				justify-content: space-around;

				& .left,
				& .right {
					flex: 0 1 45%;
				}

				& uni-button {
					color: #fff;
					border-color: #fff;
					border-radius: 50px;
					width: 100%;
					line-height: 60rpx;
				}
			}

		}

		& .body-container {
			position: relative;

			& .body-content {
				padding: 0 40rpx;
				position: absolute;
				right: 0;
				left: 0;
				top: -30rpx;

				& .header {
					background-color: #fff;
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 30rpx 20rpx;
					border-radius: 5px;

					& .label {
						margin-left: 10rpx;
					}

					&.sub-header {
						padding: 10rpx;
					}

				}

				& .content {
					margin-top: 20rpx;
					background-color: #fff;
					padding: 30rpx 20rpx;
					border-radius: 5px;

					& .content-body {
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
					}
				}

				& .attendance-record {
					& .record-title {
						padding: 20rpx 0;

						& uni-text {
							margin-right: 20rpx;
						}

						& .value {
							color: var(--uni-color-primary);
						}
					}

					& .record-list {
						background-color: #fff;
						padding-top: 20rpx;
						display: flex;
						justify-content: space-around;
						min-height: 200rpx;
					}
				}
			}
		}
	}
</style>