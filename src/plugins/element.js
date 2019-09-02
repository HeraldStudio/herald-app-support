import Vue from 'vue'
import '../theme/override.scss'
import { Button, Upload, Loading, Message, MessageBox, Notification, Form, Select, Input, FormItem, Option, PageHeader } from 'element-ui'

Vue.use(Button)
Vue.use(Upload)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
Vue.use(PageHeader)

Vue.use(Loading.directive);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;