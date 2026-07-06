<template>
	<view class="main-container">
		<view class="container-box">
			<view class="box-header">
				<view class="icon">
				</view>
				<view class="title">待办任务
				</view>
			</view>
			<view class="box-content task-content">
				<view class="task-item" v-for="item in 5" :key="item">
	
					<navigator :url="item % 2 === 0 ? '/pages/work/device/baoyang/baoyang' : '/pages/work/produce/devicecheck/devicecheck?workStation={}'">
						<view>
							<text>待办任务{{item}}</text>
							<view class="content-item">
								<text>设备号：</text>
								<text class="content-value">JJG-00{{item}}</text>
								<text>待办类型：</text>
								<text class="content-value">
									{{item % 2 === 0 ? '设备保养' : '设备点检'}}
								</text>
							</view>
							<view class="content-item">
								<text>当前状态：</text>
								<text class="content-value delay">
									{{item % 2 === 0 ? '待保养' : '待点检'}}
								</text>
							</view>
						</view>
					</navigator>
					
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {

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
				height: 150rpx;
				border-radius: 10px;
				background-color: var(--uni-bg-color-grey-deep);
				margin-top: 40rpx;
				padding: 10rpx;
			}
		}
	}
</style>