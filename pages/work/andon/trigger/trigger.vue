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
						<text class="title">andon问题编号：自动生成</text>
					</view>
				</view>
				<view class="label-info-container">
					<view class="label-item">
						<view class="left">
							<text>备注：</text>
							<uni-easyinput type="textarea" autoHeight v-model="value"
								:placeholder="$t('common.inputContent')"></uni-easyinput>
						</view>

					</view>
				</view>
			</view>

		</view>
		<view class="operator-button">
			<button type="primary" size="mini">{{ $t('common.confirmSubmit') }}</button>
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

	.box-body {
		margin-top: 0 !important;
		padding-top: 0 !important;
	}

	.warehouse-info {
		margin-top: 40rpx;
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
	.operator-button {
		margin-top: 1em;
	}
</style>