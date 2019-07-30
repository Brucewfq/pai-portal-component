import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getStorageByKey } from '@/utils/auth'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  'Accept-Language': 'zh_CN',
  'Content-Type': 'application/json',
  timeout: 9000000 // request timeout
})
// 避免重复发送多次请求操作
const pending = []
const CancelToken = axios.CancelToken
const removePending = (ever) => {
  for (let p in pending) {
    // 当当前请求在数组中存在时执行函数体
    if (pending[p].u === ever.url + '&' + ever.method) {
      // 执行取消操作
      pending[p].f()
      // 把这条记录从数组中移除
      pending.splice(p, 1)
    }
  }
}
// request interceptor
service.interceptors.request.use(config => {
  // Do something before request is sent
  // if (store.getters.token) {
  //   // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
  //   config.headers['X-Token'] = getToken()
  // }
  if (store.getters.requestStatus !== 'requestToken') {
    let paiToken = null
    if (getStorageByKey('PAI-token')) {
      paiToken = JSON.parse(getStorageByKey('PAI-token'))
    }
    if (paiToken && paiToken['access_token']) {
      config.headers.Authorization = 'Bearer ' + paiToken['access_token']
    }
  }
  // 在一个ajax发送前执行一下取消操作
  removePending(config)
  config.cancelToken = new CancelToken((c) => {
    // 这里的ajax标识是用请求地址&请求方式拼接的字符串的方式，也可以选择其他的一些方式
    pending.push({ u: config.url + '&' + config.method, f: c })
  })

  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if (store.getters.requestStatus === 'requestToken') {
      return res
    } else {
      if (res.responseCode === '100') {
        return res
      } else if (res.responseCode === '300') {
        Message({
          message: res.messageList[0].message + ' logId为:' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '600') {
        Message({
          message: res.messageList[0].key + ' logId为:' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '601') {
        Message({
          message: res.messageList[0].key + ' logId为:' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '602') {
        Message({
          message: res.messageList[0].key + ' logId为:' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '603') {
        Message({
          message: res.messageList[0].key + ' logId为:' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '604') {
        Message({
          message: res.messageList[0].key + ' logId为' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '605') {
        Message({
          message: res.messageList[0].key + ' logId为' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        //
        router.push('/login')
        //
        return Promise.reject('error')
      } else if (res.responseCode === '606') {
        Message({
          message: res.messageList[0].key + 'logId为' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '607') {
        Message({
          message: res.messageList[0].key + 'logId为' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '608') {
        Message({
          message: res.messageList[0].key + 'logId为' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '609') {
        Message({
          message: res.messageList[0].key + 'logId为' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else if (res.responseCode === '610') {
        Message({
          message: res.messageList[0].key + 'logId为' + res.logId,
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject('error')
      } else {
        return res
      }
    }
  },
  /**
   * 下面的注释为通过在response里，自定义code来标示请求状态
   * 当code返回如下情况则说明权限有问题，登出并返回到登录页
   * 如想通过xmlhttprequest来状态码标识 逻辑可写在下面error中
   * 以下代码均为样例，请结合自生需求加以修改，若不需要，则可删除
   */
    // response => {
    //   const res = response.data
    //   if (res.code !== 20000) {
    //     Message({
    //       message: res.message,
    //       type: 'error',
    //       duration: 5 * 1000
    //     })
    //     // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
    //     if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //       // 请自行在引入 MessageBox
    //       // import { Message, MessageBox } from 'element-ui'
    //       MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
    //         confirmButtonText: '重新登录',
    //         cancelButtonText: '取消',
    //         type: 'warning'
    //       }).then(() => {
    //         store.dispatch('FedLogOut').then(() => {
    //           location.reload() // 为了重新实例化vue-router对象 避免bug
    //         })
    //       })
    //     }
    //     return Promise.reject('error')
    //   } else {
    //     return response.data
    //   }
    // },
  error => {
    // token 失效，跳转到登录页面
    if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
      // console.log('根据你设置的timeout/真的请求超时 判断请求现在超时了，你可以在这里加入超时的处理方案')
      error.message = '请求超时，请重试'
    } else {
      if (error.request && (error.request.status === 0 || error.request.status === 401)) {
        if (process.env.NODE_ENV !== 'production') {
          router.push('/login')
        }
      }
    }
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  })

export default service
