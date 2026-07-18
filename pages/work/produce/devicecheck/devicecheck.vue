<template>
	<view class="device-check-container">
		<view class="check-device">
			<uni-icons style="margin-right:10rpx" color="#676767" custom-prefix="iconfont" type="icon-xianshiqi"
				size="18"></uni-icons>
			<text class="label">{{ $t('produce.devicecheck.equipmentCode') }}</text>
			<text class="value label">{{workStation.equipmentCode }}</text>
			<text class="label">{{ $t('produce.devicecheck.equipmentName') }}</text>
			<text class="value label">{{workStation.equipmentName }}</text>
			<text class="label">{{ $t('produce.devicecheck.planCode') }}</text>
			<text class="value label"></text>
		</view>
		<view class="splitor"></view>
		<view v-for="(item,idx) in checkItems" :key="item.id">
			<view class="check-item-container">
				<view class="check-item">
					<text class="item-left">
						{{idx+1}}、{{item.checkItemName}}
					</text>
					<text class="item-right">
						{{ $t('produce.devicecheck.rangeValue') }}{{item.minNum}}~{{item.maxNum}}
					</text>
				</view>
				<view class="check-item">
					<text class="item-left">
						{{ $t('produce.devicecheck.recordValue') }}
					</text>
					<view class="item-right">
						<uni-easyinput type="digit" :disabled="item.standardNum == null"
							v-model="vModel[`checkvalue_${item.checkItemCode}`]" :clearable="false"
							@change="onValueValidate(item)"></uni-easyinput>
					</view>
				</view>
				<view class="check-item">
					<view class="item-left" style="display: flex;">
						<text>
							{{ $t('produce.devicecheck.defectLevel') }}
						</text>
						<radio-group @change="onDefectChange($event,item.checkItemCode)">
							<radio style="transform:scale(0.7)" :value="1" />{{ $t('produce.devicecheck.fatal') }}
							<radio style="transform:scale(0.7)" :value="2" />{{ $t('produce.devicecheck.serious') }}
							<radio style="transform:scale(0.7)" :value="3" />{{ $t('produce.devicecheck.minor') }}
							<radio style="transform:scale(0.7)" :value="4" checked="true" />{{ $t('produce.devicecheck.none') }}
						</radio-group>
					</view>
				</view>
				<view class="check-item">
					<text class="item-left">
						{{ $t('produce.devicecheck.judgeResult') }}
					</text>
					<view class="item-right">
						<view :style="vModel[`checkresult_${item.checkItemCode}`]==1?'color:#4cd964':'color:#dd524d'"
							style="display: flex;align-items: center">
							<uni-icons v-if="vModel[`checkresult_${item.checkItemCode}`]==1" color="#4cd964"
								type="checkbox-filled" size="20"></uni-icons>
							<uni-icons v-else color="#dd524d" type="clear" size="20"></uni-icons>
							{{vModel[`checkresult_${item.checkItemCode}`]==1? $t('common.pass'):$t('common.fail')}}
						</view>
					</view>
				</view>
			</view>
			<view class="splitor"></view>
		</view>
		<view class="check-pass">
			<view class="check-item">
				<text class="item-left">
					{{ $t('produce.devicecheck.passJudge') }}
				</text>
				<view class="item-right" style="text-align: right;">
					<switch @change="onResultJudge" style="transform:scale(0.8)" checked color="#4cd964" />
				</view>
			</view>
		</view>
		<view class="operator-button">
			<button type="primary" @click="onSure" size="mini">{{ $t('produce.devicecheck.confirm') }}</button>
		</view>
	</view>
</template>

<script>
	import produce from '/api/produce/produce.js'
	export default {
		// judgeResult 判定结果 1合格 2 不合格
		// flawResult 缺陷程度 1致命 2严重 3轻微 4无

		data() {
			return {
				check_item1: 0,
				check_item2: 0,
				workStation: {},
				checkItems: [],
				vModel: {},
				checkResult: true,
				planId: 0

			}
		},
		onLoad(params) {
			this.workStation = JSON.parse(decodeURIComponent(params.workStation));
			this.loadDeviceCheckInfo();
		},
		methods: {
			loadDeviceCheckInfo: async function() {
				const res = await produce.getDetailByEquipCode('MNSB-01');
				console.log(res)
				this.checkItems = res.data;
				this.checkItems.forEach(item => {
					this.vModel[`checkvalue_${item.checkItemCode}`] = 0;
					this.vModel[`defect_${item.checkItemCode}`] = 4;
					this.vModel[`checkresult_${item.checkItemCode}`] = 1;
					this.planId = item.planId;
				})
			},
			onDefectChange: function(evt, code) {
				this.vModel[`defect_${code}`] = evt.detail.value;
			},
			onResultJudge: function(evt) {
				this.checkResult = evt.detail.value;
			},
			onValueValidate: function(item) {
				let result = this.vModel[`checkvalue_${item.checkItemCode}`];
				if (result >= item.minNum && result <= item.maxNum) {
					this.vModel[`checkresult_${item.checkItemCode}`] = 1;
				} else {
					this.vModel[`checkresult_${item.checkItemCode}`] = 2;
				}
			},
			onSure: async function() {

				const details = [];
				this.checkItems.forEach(item => {
					details.push({
						planDetailId: item.id,
						checkResult: this.vModel[`checkvalue_${item.checkItemCode}`],
						judgeResult: this.vModel[`checkresult_${item.checkItemCode}`],
						flawResult: this.vModel[`defect_${item.checkItemCode}`]
					})
				});
				const res = await produce.saveEquipCheckRecord(
					this.workStation.equipmentCode,
					this.workStation.equipmentName, 1, this.planId, details, this.checkResult ? 1 : 2
				)
				if (res.code === 200) {
					uni.showToast({
						title: this.$t('produce.devicecheck.success')
					});
					const pages = getCurrentPages();
					const prePages = pages.filter(p => p.route == 'pages/work/produce/worksheeton/worksheeton');
					if (prePages.length >= 1) {
						let prePage = prePages[0];
						prePage.$vm['equipmentValidate'] = this.checkResult;
					}
					uni.navigateBack()
				} else {
					uni.showToast({
						title: res.msg
					})
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.device-check-container {
		padding: 20rpx 0;

		& .check-device {
			padding: 20rpx;
			padding-bottom: 0;
			display: flex;
			align-items: center;
			flex-wrap: wrap;

			& .label {
				margin-bottom: 15rpx;
			}

			& .value {
				margin-right: 20rpx;
				color: var(--uni-text-color);
			}

		}

		& .check-item {
			display: flex;
			align-items: center;
			padding: 10rpx 20rpx;

			& .item-left {
				flex: 1;
			}

			& .item-right {
				width: 200rpx;
				text-align: center;
			}
		}

		& .check-pass {
			border: 1px solid var(--uni-border-color);
			margin: 30rpx 40rpx;
			padding: 20rpx;
		}
	}
</style>
