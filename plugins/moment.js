import Vue from 'vue'
import moment from 'moment' // 导入模块
moment.locale('zh-cn') // 设置语言 或 moment.lang('zh-cn');
Vue.prototype.$moment = moment// 赋值使用
