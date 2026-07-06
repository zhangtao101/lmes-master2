/**
 * 公共打印工具模块
 * 负责打印机连接检测/重连/引导连接页，以及标签绘制相关功能
 * 适用于精臣 JCSDK-JCApiModule 插件（uni-app app-plus）
 */

// ==================== 常量定义 ====================

/** 插件名称 */
const JCSDK_PLUGIN_NAME = 'JCSDK-JCApiModule'

/** 打印机连接状态变化事件名称 */
const PRINTER_CONNECTED_EVENT = 'JC_PRINTER_CONNECTED'

/** 本地存储键：上次连接的打印机设备信息 */
const STORAGE_KEY_LAST_DEVICE = 'JC_PRINTER_LAST_DEVICE'
/** 本地存储键：当前会话是否已连接打印机 */
const STORAGE_KEY_SESSION_CONNECTED = 'JC_PRINTER_SESSION_CONNECTED'

// ==================== 标签纸类型 ====================
/**
 * 标签纸类型
 * @typedef {Object} LabelType
 * @property {number} Gap - 间隙纸
 * @property {number} BlackMark - 黑标纸
 * @property {number} Continuous - 连续纸
 * @property {number} FixedHole - 定孔纸
 * @property {number} Transparent - 透明纸
 */
const LabelType = {
	Gap: 1, // 间隙纸
	BlackMark: 2, // 黑标纸
	Continuous: 3, // 连续纸
	FixedHole: 4, // 定孔纸
	Transparent: 5 // 透明纸
}

// ==================== 旋转角度类型 ====================
/**
 * 绘制支持的旋转角度
 * @typedef {Object} LabelRotateType
 * @property {number} None - 不旋转
 * @property {number} Rotate90 - 旋转90度
 * @property {number} Rotate180 - 旋转180度
 * @property {number} Rotate270 - 旋转270度
 */
const LabelRotateType = {
	None: 0,
	Rotate90: 90,
	Rotate180: 180,
	Rotate270: 270
}

// ==================== 换行模式类型 ====================
/**
 * 换行方式
 * @typedef {Object} LineModeType
 * @property {number} Justified - 宽高固定，内容自适应（字号/字间距/行间距按比例缩放）
 * @property {number} AutoHeight - 宽度固定，高度自适应
 * @property {number} Fixed - 宽高固定，超出部分裁剪
 * @property {number} Adapt - 宽高固定，内容超过时预设宽高自动缩小
 */
const LineModeType = {
	Justified: 1,
	AutoHeight: 2,
	Fixed: 4,
	Adapt: 6
}

// ==================== 条码类型 ====================
/**
 * 条码类型
 * @typedef {Object} BarCodeType
 * @property {number} Code128 - Code128
 * @property {number} CodeUPC_A - UPC-A
 * @property {number} CodeUPC_E - UPC-E
 * @property {number} Ean8 - EAN-8
 * @property {number} Ean13 - EAN-13
 * @property {number} Code93 - Code93
 * @property {number} Code39 - Code39
 * @property {number} CodeBar - CodeBar
 * @property {number} ITF25 - ITF-25
 */
const BarCodeType = {
	Code128: 20,
	CodeUPC_A: 21,
	CodeUPC_E: 22,
	Ean8: 23,
	Ean13: 24,
	Code93: 25,
	Code39: 26,
	CodeBar: 27,
	ITF25: 28
}

// ==================== 条码文字显示位置 ====================
/**
 * 条码/二维码文字显示位置
 * @typedef {Object} BarCodeTextPosition
 * @property {number} Below - 下方显示
 * @property {number} Above - 上方显示
 * @property {number} Hidden - 不显示
 */
const BarCodeTextPosition = {
	Below: 0,
	Above: 1,
	Hidden: 2
}

// ==================== 二维码类型 ====================
/**
 * 二维码类型
 * @typedef {Object} QrCodeType
 * @property {number} QrCode - 二维码
 * @property {number} PDF417 - PDF417
 * @property {number} DataMatrix - DataMatrix
 * @property {number} AZTEC - AZTEC
 */
const QrCodeType = {
	QrCode: 31,
	PDF417: 32,
	DataMatrix: 33,
	AZTEC: 34
}

// ==================== 线条类型 ====================
/**
 * 线条类型
 * @typedef {Object} LineType
 * @property {number} Solid - 实线
 * @property {number} Dotted - 虚线（默认虚实1:1相间）
 */
const LineType = {
	Solid: 1,
	Dotted: 2
}

// ==================== 图形类型 ====================
/**
 * 图形类型
 * @typedef {Object} GraphType
 * @property {number} Round - 圆形
 * @property {number} Oval - 椭圆形
 * @property {number} Rectangle - 矩形
 * @property {number} RoundedRectangle - 圆角矩形
 */
const GraphType = {
	Round: 1,
	Oval: 2,
	Rectangle: 3,
	RoundedRectangle: 4
}

// ==================== 模块内部变量 ====================

let jcapi = null
let sdkInited = false

// sessionConnected 只表示"当前 JS 运行期内我们认为已连接"
let sessionConnected = false

// ==================== 内部辅助函数 ====================

/**
 * 根据设备地址判断设备类型
 * @param {string} address - 设备地址
 * @returns {number} 0=蓝牙, 1=WiFi/IP
 */
function getAddressDeviceType(address) {
	// 约定：包含 '.' 的认为是 WiFi/IP
	return address && address.includes('.') ? 1 : 0
}

/**
 * 规范化设备信息
 * @param {Object} device - 原始设备信息
 * @returns {Object|null} 规范化后的设备信息
 */
function normalizeDevice(device) {
	if (!device) return null
	const address = device.address
	const name = device.name || device.deviceName || ''
	if (!address) return null
	return {
		address,
		name,
		deviceType: getAddressDeviceType(address)
	}
}

/**
 * 获取本地存储的上次连接设备
 * @returns {Object|null}
 */
function getStorageLastDevice() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEY_LAST_DEVICE)
		if (!raw) return null
		return raw
	} catch (e) {
		return null
	}
}

/**
 * 保存上次连接的设备到本地存储
 * @param {Object} device - 设备信息
 */
function setStorageLastDevice(device) {
	try {
		uni.setStorageSync(STORAGE_KEY_LAST_DEVICE, device)
	} catch (e) {
		// ignore
	}
}

/**
 * 触发打印机连接事件
 * @param {Object} payload - 事件载荷
 */
function emitConnected(payload) {
	try {
		uni.$emit(PRINTER_CONNECTED_EVENT, payload || {})
	} catch (e) {
		// ignore
	}
}

/**
 * 设置会话连接状态
 * @param {boolean} connected - 是否已连接
 */
function setSessionConnected(connected) {
	sessionConnected = !!connected
	try {
		uni.setStorageSync(STORAGE_KEY_SESSION_CONNECTED, sessionConnected)
	} catch (e) {
		// ignore
	}
}

/**
 * 获取当前页面路由
 * @returns {string}
 */
function getCurrentRoute() {
	try {
		const pages = getCurrentPages && getCurrentPages()
		const current = pages && pages[pages.length - 1]
		// uni-app app-plus 下 route 常见字段：route 或 $route
		return current && (current.route || current.$route || '')
	} catch (e) {
		return ''
	}
}

/**
 * 等待打印机连接事件
 * @param {Object} options - 配置选项
 * @param {number} [options.timeoutMs=60000] - 超时时间（毫秒）
 * @returns {Promise<Object>}
 */
function waitForConnectedEvent({ timeoutMs = 60000 } = {}) {
	return new Promise((resolve, reject) => {
		let timer = null
		const handler = (payload) => {
			if (timer) clearTimeout(timer)
			try {
				uni.$off(PRINTER_CONNECTED_EVENT, handler)
			} catch (e) {
				// ignore
			}
			resolve(payload)
		}

		try {
			uni.$on(PRINTER_CONNECTED_EVENT, handler)
		} catch (e) {
			// ignore
		}

		timer = setTimeout(() => {
			try {
				uni.$off(PRINTER_CONNECTED_EVENT, handler)
			} catch (e) {
				// ignore
			}
			reject(new Error('等待打印机连接超时'))
		}, timeoutMs)
	})
}

/**
 * 判断错误是否为未连接相关错误
 * @param {Error|Object} err - 错误对象
 * @returns {boolean}
 */
function isLikelyNotConnectedError(err) {
	if (!err) return false
	const msg = (err.msg || err.message || '').toString().toLowerCase()
	if (!msg) return false
	return (
		msg.includes('未连接') ||
		msg.includes('连接失败') ||
		msg.includes('连接') && msg.includes('断开') ||
		msg.includes('断开') ||
		msg.includes('disconnect') ||
		msg.includes('not connected')
	)
}

let connectingPromise = null

// ==================== 导出函数：连接相关 ====================

/**
 * 获取打印机连接状态变化事件名称
 * @returns {string}
 */
export function getPrinterConnectedEventName() {
	return PRINTER_CONNECTED_EVENT
}

/**
 * 判断当前会话是否已连接打印机
 * @returns {boolean}
 */
export function isSessionPrinterConnected() {
	return !!sessionConnected
}

/**
 * 获取 JCApi 实例（单例）
 * 同时初始化 SDK
 * @returns {Object} jcapi 实例
 */
export function getJcapi() {
	if (!jcapi) {
		jcapi = uni.requireNativePlugin(JCSDK_PLUGIN_NAME)
	}
	if (!sdkInited) {
		// initSDK 只需要执行一次
		jcapi.initSDK()
		sdkInited = true
	}

	// 恢复 session 标记（可选，避免 JS 重启后 UI 长时间误判）
	try {
		sessionConnected = !!uni.getStorageSync(STORAGE_KEY_SESSION_CONNECTED)
	} catch (e) {
		sessionConnected = false
	}

	return jcapi
}

/**
 * 关闭打印机连接
 */
export function closePrinter() {
	try {
		if (jcapi && typeof jcapi.close === 'function') {
			jcapi.close()
		}
	} finally {
		setSessionConnected(false)
	}
}

/**
 * 搜索蓝牙打印机设备（按名称过滤）
 * @param {Object} options - 配置选项
 * @param {string[]} options.name - 要过滤的打印机名称数组
 * @returns {Promise<Array>} 设备列表
 */
export function searchBluetoothDevicesWithName({ name } = {}) {
	const _jcapi = getJcapi()
	return new Promise((resolve) => {
		_jcapi.getBluetoothDevicesWithName({ name }, function(r) {
			resolve(r || [])
		})
	})
}

/**
 * 搜索所有蓝牙设备
 * @returns {Promise<Array>} 设备列表
 */
export function searchBluetoothDevices() {
	const _jcapi = getJcapi()
	return new Promise((resolve) => {
		_jcapi.getBluetoothDevices(function(r) {
			resolve(r || [])
		})
	})
}

/**
 * 搜索 WiFi 设备
 * @returns {Promise<Array>} 设备列表
 */
export function searchWifiDevices() {
	const _jcapi = getJcapi()
	return new Promise((resolve) => {
		_jcapi.getWifiDevices(function(r) {
			resolve(r || [])
		})
	})
}

/**
 * 连接打印机
 * @param {Object} rawDevice - 设备信息（需包含 address 和 name）
 * @returns {Promise<Object>}
 */
export function connectPrinterByDevice(rawDevice) {
	const _jcapi = getJcapi()
	const device = normalizeDevice(rawDevice)
	if (!device) return Promise.reject(new Error('未找到有效打印机设备信息'))

	return new Promise((resolve, reject) => {
		_jcapi.openPrinterByDevice(device, function(r) {
			// 插件回调里约定 code=0 成功（以你现有代码为准）
			if (r && r.code === 0) {
				setStorageLastDevice(device)
				setSessionConnected(true)
				emitConnected({ device })
				resolve(r)
			} else {
				setSessionConnected(false)
				reject(r || new Error('连接打印机失败'))
			}
		})
	})
}

/**
 * 确保打印机已连接：未连接 -> 自动打开连接页 -> 等用户完成 -> 返回继续执行
 * @param {Object} options - 配置选项
 * @param {string} [options.connectPagePath='/pages/work/warehouse/printerConnect/printerConnect'] - 连接页面路径
 * @param {number} [options.timeoutMs=60000] - 超时时间
 * @param {string} [options.openMode='modal'] - 打开方式：'modal' 弹窗提示 | 'auto' 自动跳转
 * @param {boolean} [options.autoReconnect=true] - 是否尝试用上次连接设备自动重连
 * @param {boolean} [options.forceReconnect=false] - 是否强制重连
 * @returns {Promise<Object>} { connected: boolean, method: string }
 */
export async function ensurePrinterConnected({
	connectPagePath = '/pages/work/warehouse/printerConnect/printerConnect',
	timeoutMs = 60000,
	openMode = 'modal',
	autoReconnect = true,
	forceReconnect = false
} = {}) {
	getJcapi()

	if (connectingPromise && !forceReconnect) return connectingPromise

	connectingPromise = (async () => {
		if (!forceReconnect && isSessionPrinterConnected()) {
			return { connected: true, method: 'session' }
		}

		// 1) 尝试自动重连
		if (autoReconnect) {
			const lastDevice = getStorageLastDevice()
			if (lastDevice) {
				try {
					await connectPrinterByDevice(lastDevice)
					if (isSessionPrinterConnected()) {
						return { connected: true, method: 'reconnect_last_device' }
					}
				} catch (e) {
					// ignore，继续走引导连接页
				}
			}
		}

		// 2) 仍未连接：引导到连接页
		const route = getCurrentRoute()
		const alreadyOnConnectPage = route && route.includes('printerConnect')

		const doOpenConnectPage = () => {
			if (alreadyOnConnectPage) return
			try {
				uni.navigateTo({ url: connectPagePath })
			} catch (e) {
				// ignore
			}
		}

		let waitPromise = null

		if (openMode === 'auto') {
			waitPromise = waitForConnectedEvent({ timeoutMs })
			doOpenConnectPage()
		} else {
			// 弹窗提示用户去连接页操作，连接完成后工具会自动继续打印
			const canNavigate = await new Promise((resolve) => {
				uni.showModal({
					title: '打印机未连接',
					content: '未检测到已连接的打印机。请先去连接打印机。连接完成后将自动继续打印。',
					confirmText: '去连接',
					cancelText: '稍后再说',
					success: function(res) {
						resolve(!!res.confirm)
					}
				})
			})
			if (!canNavigate) {
				throw new Error('用户取消连接打印机')
			}
			waitPromise = waitForConnectedEvent({ timeoutMs })
			doOpenConnectPage()
		}

		// 3) 等待连接事件或超时
		await waitPromise
		return { connected: true, method: 'event' }
	})()

	try {
		return await connectingPromise
	} finally {
		connectingPromise = null
	}
}

/**
 * 带状态检测的打印入口
 * - 先 ensurePrinterConnected
 * - 执行 printTask（由调用方绘制/提交打印）
 * - 如果打印报"未连接/断连"等错误：尝试重连并重试一次
 * @param {Object} options - 配置选项
 * @param {Function} options.printTask - 打印任务函数，接收 jcapi 实例，需返回 Promise
 * @param {string} [options.connectPagePath='/pages/work/warehouse/printerConnect/printerConnect'] - 连接页面路径
 * @param {number} [options.timeoutMs=60000] - 超时时间
 * @param {boolean} [options.retryOnDisconnect=true] - 断连时是否重试
 * @param {string} [options.openMode='modal'] - 打开方式
 * @returns {Promise<Object>}
 */
export async function printWithEnsureConnected({
	printTask,
	connectPagePath = '/pages/work/warehouse/printerConnect/printerConnect',
	timeoutMs = 60000,
	retryOnDisconnect = true,
	openMode = 'modal'
} = {}) {
	if (typeof printTask !== 'function') {
		throw new Error('printTask 必须是函数')
	}

	await ensurePrinterConnected({ connectPagePath, timeoutMs, openMode })

	const execute = async () => {
		// 交给调用方返回 Promise
		return await printTask(getJcapi())
	}

	try {
		return await execute()
	} catch (err) {
		if (!retryOnDisconnect || !isLikelyNotConnectedError(err)) {
			throw err
		}

		// 打印期间可能断连了：强制重连并只重试一次
		try {
			setSessionConnected(false)
			await ensurePrinterConnected({
				connectPagePath,
				timeoutMs,
				openMode,
				forceReconnect: true
			})
			return await execute()
		} catch (e2) {
			// 重连也失败，则抛原始错误或新错误
			throw e2 || err
		}
	}
}

// ==================== 导出函数：绘制相关 ====================

/**
 * 初始化画板
 * @param {Object} options - 配置选项
 * @param {number} options.width - 画布宽度（毫米）
 * @param {number} options.height - 画布高度（毫米）
 * @returns {void}
 */
export function initDrawingBoard({ width, height }) {
	const _jcapi = getJcapi()
	_jcapi.initDrawingBoard({ width, height })
}

/**
 * 绘制文本
 * @param {Object} options - 配置选项
 * @param {number} options.x - X坐标（毫米）
 * @param {number} options.y - Y坐标（毫米）
 * @param {number} options.width - 宽度（毫米）
 * @param {number} options.height - 高度（毫米）
 * @param {string} options.value - 文本内容
 * @param {number} [options.fontSize=3] - 字体大小
 * @param {number} [options.rotate=0] - 旋转角度
 * @param {number} [options.lineMode=LineModeType.AutoHeight] - 换行模式
 * @param {number} [options.textAlignHorizontal=0] - 水平对齐：0=左对齐, 1=居中, 2=右对齐
 * @param {number} [options.textAlignVertical=0] - 垂直对齐：0=顶部, 1=居中, 2=底部
 * @returns {void}
 */
export function drawLabelText({
	x,
	y,
	width,
	height,
	value,
	fontSize = 3,
	rotate = 0,
	lineMode = LineModeType.AutoHeight,
	textAlignHorizontal = 0,
	textAlignVertical = 0
}) {
	const _jcapi = getJcapi()
	_jcapi.drawLabelText({
		x,
		y,
		width,
		height,
		value,
		fontSize,
		rotate,
		lineMode,
		textAlignHorizontal,
		textAlignVertical
	})
}

/**
 * 绘制二维码
 * @param {Object} options - 配置选项
 * @param {number} options.x - X坐标（毫米）
 * @param {number} options.y - Y坐标（毫米）
 * @param {number} options.width - 宽度（毫米）
 * @param {number} options.height - 高度（毫米）
 * @param {string} options.value - 二维码内容
 * @param {number} [options.rotate=0] - 旋转角度
 * @param {number} [options.codeType=QrCodeType.QrCode] - 二维码类型
 * @returns {void}
 */
export function drawLabelQrCode({
	x,
	y,
	width,
	height,
	value,
	rotate = 0,
	codeType = QrCodeType.QrCode
}) {
	const _jcapi = getJcapi()
	_jcapi.drawLabelQrCode({
		x,
		y,
		width,
		height,
		value,
		rotate,
		codeType
	})
}

/**
 * 绘制条形码
 * @param {Object} options - 配置选项
 * @param {number} options.x - X坐标（毫米）
 * @param {number} options.y - Y坐标（毫米）
 * @param {number} options.width - 宽度（毫米）
 * @param {number} options.height - 高度（毫米）
 * @param {string} options.value - 条码内容
 * @param {number} [options.codeType=BarCodeType.Code128] - 条码类型
 * @param {number} [options.fontSize=3] - 字体大小
 * @param {number} [options.rotate=0] - 旋转角度
 * @param {number} [options.textHeight=3] - 文字高度
 * @param {number} [options.textPosition=BarCodeTextPosition.Below] - 文字显示位置
 * @returns {void}
 */
export function drawLabelBarCode({
	x,
	y,
	width,
	height,
	value,
	codeType = BarCodeType.Code128,
	fontSize = 3,
	rotate = 0,
	textHeight = 3,
	textPosition = BarCodeTextPosition.Below
}) {
	const _jcapi = getJcapi()
	_jcapi.drawLabelBarCode({
		x,
		y,
		width,
		height,
		value,
		codeType,
		fontSize,
		rotate,
		textHeight,
		textPosition
	})
}

/**
 * 绘制图片（通过 Base64）
 * @param {Object} options - 配置选项
 * @param {number} options.x - X坐标（毫米）
 * @param {number} options.y - Y坐标（毫米）
 * @param {number} options.width - 宽度（毫米）
 * @param {number} options.height - 高度（毫米）
 * @param {string} options.base64 - 图片 Base64 编码（需包含 data:image 前缀）
 * @param {number} [options.rotate=0] - 旋转角度
 * @returns {void}
 */
export function drawLabelImage({
	x,
	y,
	width,
	height,
	base64,
	rotate = 0
}) {
	const _jcapi = getJcapi()
	_jcapi.drawLabelImage({
		x,
		y,
		width,
		height,
		base64,
		rotate
	})
}

/**
 * 绘制线条
 * @param {Object} options - 配置选项
 * @param {number} options.x - 起点X坐标（毫米）
 * @param {number} options.y - 起点Y坐标（毫米）
 * @param {number} options.x2 - 终点X坐标（毫米）
 * @param {number} options.y2 - 终点Y坐标（毫米）
 * @param {number} [options.lineWidth=1] - 线宽（毫米）
 * @param {number} [options.lineType=LineType.Solid] - 线条类型
 * @returns {void}
 */
export function drawLabelLine({
	x,
	y,
	x2,
	y2,
	lineWidth = 1,
	lineType = LineType.Solid
}) {
	const _jcapi = getJcapi()
	_jcapi.drawLabelLine({
		x,
		y,
		x2,
		y2,
		lineWidth,
		lineType
	})
}

/**
 * 绘制矩形
 * @param {Object} options - 配置选项
 * @param {number} options.x - X坐标（毫米）
 * @param {number} options.y - Y坐标（毫米）
 * @param {number} options.width - 宽度（毫米）
 * @param {number} options.height - 高度（毫米）
 * @param {number} [options.lineWidth=1] - 边框线宽（毫米）
 * @param {number} [options.lineType=LineType.Solid] - 线条类型
 * @param {number} [options.graphType=GraphType.Rectangle] - 图形类型
 * @returns {void}
 */
export function drawLabelRect({
	x,
	y,
	width,
	height,
	lineWidth = 1,
	lineType = LineType.Solid,
	graphType = GraphType.Rectangle
}) {
	const _jcapi = getJcapi()
	_jcapi.drawLabelRect({
		x,
		y,
		width,
		height,
		lineWidth,
		lineType,
		graphType
	})
}

/**
 * 生成标签 JSON 数据
 * @returns {string} JSON 字符串
 */
export function generateLabelJson() {
	const _jcapi = getJcapi()
	return _jcapi.generateLabelJson()
}

/**
 * 开始打印任务
 * @param {Object} options - 配置选项
 * @param {number} options.totalCount - 总打印数量
 * @param {number} [options.density=10] - 打印浓度
 * @param {number} [options.labelType=LabelType.Gap] - 标签纸类型
 * @param {number} [options.printMode=1] - 打印模式
 * @param {Function} [callback] - 回调函数
 * @returns {void}
 */
export function startJob({
	totalCount,
	density = 10,
	labelType = LabelType.Gap,
	printMode = 1
}, callback) {
	const _jcapi = getJcapi()
	_jcapi.startJob({
		totalCount,
		density,
		labelType,
		printMode
	}, callback)
}

/**
 * 提交打印数据
 * @param {string} labelJson - 标签 JSON 数据
 * @param {Object} options - 配置选项
 * @param {number} [options.printQuantity=1] - 打印份数
 * @param {Function} [callback] - 回调函数
 * @returns {void}
 */
export function printData(labelJson, { printQuantity = 1 }, callback) {
	const _jcapi = getJcapi()
	_jcapi.printData(labelJson, {
		printQuantity
	}, callback)
}

// ==================== 导出常量 ====================

export {
	LabelType,
	LabelRotateType,
	LineModeType,
	BarCodeType,
	BarCodeTextPosition,
	QrCodeType,
	LineType,
	GraphType
}
