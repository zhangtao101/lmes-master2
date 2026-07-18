<template>
	<view class="ware-house-container">
		<view class="box-header">
			<view class="icon">
			</view>
			<text class="title">{{ $t('warehouse.equipRepairReport') }}</text>
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
						<text class="title">{{ $t('pages.device.biangeng') }}</text>
					</view>
				</view>
				<view class="label-info-container">
					<view class="label-item">
						<view class="left">
							<text style="float: right;">{{ $t('device.jiaodongType') }}</text>
							<uni-data-select :localdata="types" label="稼动类型"></uni-data-select>
							
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>稼动原因：</text>
							<uni-data-select :localdata="malfunctions" label="稼动原因"></uni-data-select>
						</view>
					</view>
					<view class="label-item">
						<view class="left">
							<text>稼动响应周期：</text>
							<uni-easyinput type="number" :min="0" autoHeight :placeholder="$t('common.inputContent')"></uni-easyinput>
							<text>单位：小时</text>
						</view>
					</view>

					<view class="label-item">
						<view class="left">
							<text>备注：</text>
							<uni-easyinput type="textarea" autoHeight :placeholder="$t('common.inputContent')"></uni-easyinput>
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
				bx_type: 0,
				types: [
					{
						value: 0,
						text: '保养'
					}, 
					{
						value: 1,
						text: '故障'
					}, 
					{
						value: 2,
						text: '调试'
					}, 
					{
						value: 3,
						text: '维修'
					}, 
					{
						value: 4,
						text: '关机'
					}
					],
				malfunctions: [
					{
						value: 0,
						text: '设备故障'
					}
				]
			}
		},
		methods: {
			openPicker() {
				this.$refs.picker.open();
			},
			confirm(e) {
				console.log('confirm', e);
			}
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