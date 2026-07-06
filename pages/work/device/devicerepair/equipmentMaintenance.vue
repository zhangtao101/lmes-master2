<template>
	<view class="baogong-container">
		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
			<text class="common-text">故障信息</text>
		</view>
		<view class="baogong-content">
			<view class="content-item">
				<text>维修计划：</text>
				<text class="content-value">
					<text style="color: red;">应急维修</text>
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
			<view class="content-item">
				<text>故障设备：</text>
				<text class="content-value">
					M01#全自动干粉压机
				</text>
			</view>
		</view>


		<view class="common-container-header radius">
			<uni-icons color="#fff" custom-prefix="iconfont" type="icon-xianshiqi" size="18"></uni-icons>
			<text class="common-text">维修结果</text>
		</view>
		<view class="baogong-content">
			<view class="content-item">
				<text>维修人：</text>
				<text class="content-value">
					张三
				</text>
			</view>
			
			<view class="content-item">
				<text>异常原因：</text>
				<text class="content-value">
					<input placeholder="请输入异常原因" style="text-align: right;"/>
				</text>
			</view>
			<view class="content-item">
				<text>维修结果：</text>
				<text class="content-value">
					<input placeholder="请输入维修结果" style="text-align: right;" />
				</text>
			</view>
			<view class="content-item">
				<text>备注：</text>
				<text class="content-value">
					<input placeholder="请输入备注" style="text-align: right;" />
				</text>
			</view>
			
			
			<view class="bottom-container">
				<view class="right">
					<button type="primary" size="mini" >提交</button>
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
	.baogong-container {
		padding: 20rpx;

		& .baogong-content {
			padding: 30rpx 40rpx;
			background-color: #fff;

			& .content-item {
				display: flex;
				padding: 10rpx;
				justify-content: space-between;
				align-items: center;

				& .label {
					width: 140rpx;
				}

				& .value {
					flex: 1;
					color: var(--uni-text-color);

					& span {
						display: flex;
						align-items: center;
					}
				}
			}
		}

		& .scan-box {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			color: var(--uni-text-color-grey);
			align-items: center;
			background: url('/static/images/scan-bg2.jpeg') no-repeat;
			background-position: center;
			height: 500rpx;
			background-color: #fff;
			margin-top: 20rpx;
		}
	}
</style>