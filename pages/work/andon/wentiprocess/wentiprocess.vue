<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">andon问题描述</text>
		</view>
		<view class="box-body">
			<view class="warehouse-info">
				<view class="header">
					<view class="left">
						<uni-icons color="#fff" custom-prefix="iconfont" type="icon-24gf-branches"
							size="18"></uni-icons>
						<text>关联设备：</text>
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
						<text class="content-value">
							MNSB-00{{code + 1 }}
						</text>
						<text>设备名称：</text>
						<text class="content-value">
							模拟设备00{{code + 1}}
						</text>
					</view>
					<view class="content-item">
						<text class="content-label">
							当前位置：
						</text>
						<text class="content-value">一号车间</text>
						<text>当前状态：</text>
						<text class="content-value">停机</text>
					</view>
				</view>
			</view>
			<view class="warehouse-detail">
				<view class="header">
					<view class="left">
						<uni-icons type="compose"></uni-icons>
						<text class="title">andon问题编号：{{obj.code}}</text>
					</view>
				</view>
				<view class="label-info-container">
					<view class="label-item">
						<view class="left">
							<text>andon类型：</text>
							<uni-data-select label="报修类型"  :localdata="types" v-model="obj.exceptionType"></uni-data-select>
						</view>

					</view>
					<view class="label-item">
						<view class="left">
							<text>备注：</text>
							<uni-easyinput type="textarea" autoHeight v-model="value"
								placeholder="请输入内容"></uni-easyinput>
						</view>

					</view>
				</view>
			</view>
			<view class="warehouse-detail">
				<view class="label-info-container">
					<view class="label-item">
						<view class="left">
							<text>处理结果：</text>
							<uni-easyinput></uni-easyinput>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>上传图片：</text>
							<!-- <uni-easyinput></uni-easyinput> -->

						</view>
						<view class="right">
							<uni-file-picker v-model="value">
								<button type="primary" size="mini" @click="upload">上传图片</button>
							</uni-file-picker>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="operator-button more-button">
			<button type="primary" size="mini">问题关闭</button>
			<button type="primary" size="mini">转交上级</button>
			<button type="primary" size="mini">问题撤回</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				bx_type: 0,
				code: 0,
				obj: {},
				types: [
					{
						value: 1,
						text: '生产异常'
					},
					{
						value: 2,
						text: '质量异常'
					},
					{
						value: 3,
						text: '设备异常'
					},
					{
						value: 4,
						text: '物料异常'
					},
				 ]
			}
		},
		onLoad(params){
			this.code = Number.parseInt(params.code);
			this.obj = JSON.parse(decodeURIComponent(params.obj));
		},
		methods: {

		}
	}
</script>

<style lang="less" scoped>
	@import "@/static/styles/warehouse.less";

	.box-body {
		margin-top: 0 !important;
		padding-top: 0 !important;
	}

	.warehouse-info {
		margin-top: 40rpx;
		margin-bottom: 40rpx;
	}

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

	:deep(.file-picker__box:last-child) {
		width: 100% !important;

		& .file-picker__box-content {
			border-color: transparent !important;
		}
	}

	.more-button {
		display: flex;
		justify-content: space-around;
	}
	
	.operator-button {
		margin-top: 1em;
	}
</style>