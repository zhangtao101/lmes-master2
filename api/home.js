import request from './request.js';
 // const MES_USER = '/mes-user';
 const MES_USER = '/hzsmt-user';
export default {
	login: (uname, pwd, rememberMe, from) => {
		return request({
			url: `${MES_USER}/sys/user/authenticate`,
			method: 'POST',
			data: {
				loginName: uname, //uname
				password: pwd, //pwd
				rememberMe: rememberMe // rememberMe
			},
			header: {
				From: from //from
			}
		});
	},
	getMenuList: (userCode) => {
		return request({
			url: `${MES_USER}/sys/user/selectAppUrlListByUserCode`,
			method: 'GET',
			data: {
				userCode
			},
		});
	}
}