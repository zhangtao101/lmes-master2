import Toast from '@/components/toast/toast.vue'

const showToast = (options) => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const toastInstance = currentPage.$refs.toast || new Toast()

	if (!toastInstance.visible) {
		toastInstance.$props = {
			visible: true,
			...options
		}
	} else {
		clearTimeout(toastInstance.timer)
		toastInstance.$props = {
			visible: true,
			...options
		}
		toastInstance.startTimer()
	}

	return toastInstance
}

export default showToast
