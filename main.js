import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false;
Vue.prototype.currentUser = {};
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
import {
	createI18n
} from 'vue-i18n'
import zhHans from './locale/zh-Hans.json'
import en from './locale/en.json'
import ko from './locale/ko.json'
import manifest from './manifest.json'

const messages = {
	'zh-Hans': zhHans,
	en,
	ko
}
const defaultLocale = (manifest && manifest.locale) || uni.getLocale() || 'zh-Hans'
const i18n = createI18n({
	locale: defaultLocale,
	fallbackLocale: 'zh-Hans',
	messages
})

export function createApp() {
	const app = createSSRApp(App)
	app.use(i18n)
	return {
		app
	}
}
// #endif