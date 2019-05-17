module.exports = {
  HttpRequst: HttpRequst,
}
// const baseUrl = 'http://172.16.1.226/invi';
const baseUrl = 'https://sub.supshop.cn/dollyin';
// const baseUrl = 'http://x34mm3.natappfree.cc/invi';
const dataUrl = "http://test.xxynet.com:8980/dollyin";//数据统计测试环境
const loginUrl = "http://172.16.0.200:8080/shopguide"
var app = getApp()
// https://bms.microc.cn/shopguide/

//sessionChoose 1是带sessionID的GET方法  2是不带sessionID的GET方法, 3是带sessionID的Post方法,4是不带sessionID的Post方法
//ask是是否要进行询问授权，true为要，false为不要
//sessionChoose为1,2,3,4,所以paramSession下标为0的则为空
function HttpRequst(loading, url, sessionChoose, sessionId, params, method, ask, callBack) {
  if (loading == true) {
    wx.showToast({
      title: '数据加载中',
      icon: 'loading'
    })
  }
  var paramSession = [{},
  { 'content-type': 'application/json', 'Cookie': 'JSESSIONID=' + sessionId },
  { 'content-type': 'application/json' },
  { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'JSESSIONID=' + sessionId },
  { 'content-type': 'application/x-www-form-urlencoded' }]
  // var token = '6811d67aac541f927d54b978e88f0817';
  // if (wx.getStorageSync('environment') !== 'wx') {
  //   token = wx.getStorageSync('token')
  // }
  var token = wx.getStorageSync('token');
  var session = ''
  // console.log(token, '我是token')
  if (sessionChoose == false) {
    session = 'application/json'
  } else {
    session = 'application/x-www-form-urlencoded'
  }
  wx.request({
    url: dataUrl + url,
    data: params,
    header: {
      'content-type': session,
      // token: token
      token: app.globalData.token
    },
    method: method,
    success: function (res) {
      // console.log(res)
      wx.hideLoading()
      if (res.statusCode == 200) {
        if (loading == true) {
          wx.hideToast();//隐藏提示框
        }
        console.log(res.data.code, url, 'urlurlurlurlurlurl')
        if (res.data.code === 1001) {
          // 登录失效
          wx.showToast({
            title: '登录信息失效',
            icon: 'none'
          })
          setTimeout(function () {
            wx.redirectTo({
              url: '/pages/login/login',
            })
          }, 1000)
        } else if (res.data.code == 101) {
          wx.showModal({
            title: '提示',
            content: '异常',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              }
            }
          })
        } else if (res.data.code === undefined) {

        } else {
          callBack(res.data);
        }
      } else if (res.statusCode == 502) {
        wx.showModal({
          title: '提示',
          content: '服务器异常',
        })
      }
    },
    fail: function (e) {
      console.log(e)
    },
    complete: function () {
      if (loading == true) {
        wx.hideToast();//隐藏提示框
      }
    }
  })
}