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
				<navigator v-for="(item, index) of taskData" :key="index"
					:url="item.type === '问题判定' ? `/pages/work/andon/wentipanding/wentipanding?code=${index}&obj=${decodeURIComponent(JSON.stringify(item))}` : `/pages/work/andon/wentiprocess/wentiprocess?code=${index}&obj=${decodeURIComponent(JSON.stringify(item))}`">
					<view class="task-item">
						<text>{{ item.name }}</text>
						<view class="content-item">
							<text>andon问题编号：</text>
							<text class="content-value">{{ item.code }}</text>
						</view>
						<view class="content-item">
							<text>待办类型：</text>
							<text class="content-value">{{ item.type }}</text>
						</view>
						<view class="content-item">
							<text>当前状态：</text>
							<text :class="{
									'content-value': true,
									 'delay': item.status == '超时',
									 'pending': item.status == '待处理'
								}">{{ item.status }}</text>
						</view>
					</view>
				</navigator>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				taskData: [{
						name: '待办任务001',
						code: 'andon-001',
						type: '问题判定',
						status: '待处理'
					},
					{
						name: '待办任务002',
						code: 'andon-002',
						type: '问题判定',
						status: '待处理'
					},
					{
						name: '待办任务003',
						code: 'andon-003',
						type: '问题处理',
						status: '待处理',
						exceptionType: 1
					},
					{
						name: '待办任务004',
						code: 'andon-004',
						type: '问题处理',
						status: '待处理',
						exceptionType: 2
					},
					{
						name: '待办任务005',
						code: 'andon-005',
						type: '问题处理',
						status: '超时',
						exceptionType: 3
					},
				]
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
				border-radius: 10px;
				background-color: var(--uni-bg-color-grey-deep);
				margin-top: 40rpx;
				padding: 10rpx;
			}
		}
	}
</style>