import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import { Input } from 'element-ui'
// import { Message } from 'element-ui'

// Vue.use(Button)
// Vue.use(Form)
// Vue.use(FormItem)
// Vue.use(Input)
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import { Message,MessageBox } from 'element-ui'
Vue.use(ElementUi)

Vue.prototype.$Message = ElementUi.Message
Vue.prototype.$confirm = ElementUi.MessageBox.confirm