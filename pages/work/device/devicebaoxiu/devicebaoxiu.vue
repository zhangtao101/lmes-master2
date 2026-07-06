<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">设备报修</text>
		</view>
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons type="home" color="#fff"></uni-icons>
						<text>设备：</text>
					</view>
					<view class="right">
						请扫描
					</view>
				</view>
				<view class="content-container">
					<view class="content-item">
						<text class="content-label">
							设备号：
						</text>
						<text class="content-value"></text>
						<text>设备名称：</text>
						<text class="content-value"></text>
					</view>
					<view class="content-item">
						<text class="content-label">
							当前位置：
						</text>
						<text class="content-value"></text>
						<text>当前状态：</text>
						<text class="content-value"></text>
					</view>
				</view>
			</view>
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">报修明细</text>
					</view>
				</view>
				<view class="label-info-container">
					<view class="label-item">
						<view class="left">
							<text>报修类型：</text>
							<uni-data-select label="报修类型" v-model="bx_type"></uni-data-select>
						</view>

					</view>
					<view class="label-item">
						<view class="left">
							<text>报修受理周期：</text>
							<uni-easyinput type="text" autoHeight v-model="value" placeholder="请输入内容"></uni-easyinput>
							<text>单位：小时</text>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>报修事项：</text>
							<uni-data-select label="报修类型" v-model="bx_type"></uni-data-select>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>报修内容：</text>
							<uni-easyinput type="textarea" autoHeight v-model="value"
								placeholder="请输入内容"></uni-easyinput>
						</view>

					</view>
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" size="mini">确认提交</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				bx_type: 0
			}
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";

	.label-info-container {
		background-color: var(--uni-bg-color-grey-deep) !important;

		& .left {
			display: flex;
			align-items: center;

			& :deep(.uni-select__input-box) {
				background-color: #fff;
				padding-left: 10rpx;
				height: 30px;
				padding-right: 10rpx;
			}

			& :deep(.uni-easyinput__content-input) {
				height: 30px;
				padding-left: 10rpx;
				padding-right: 10rpx;
			}

		}
	}
</style>