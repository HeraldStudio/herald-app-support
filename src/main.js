import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './axios'
import './plugins/element.js'

Vue.config.productionTip = false
window.baseURL = "https://myseu.cn/ws3/"
Vue.use(axios)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

document.addEventListener('gesturestart', function (event) {
  event.preventDefault();
});