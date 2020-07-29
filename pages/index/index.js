//index.js
//获取应用实例
import * as event from '../../utils/event.js'
const Http = require('../../utils/request.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    percent: 1,
    current: 0,
    autoplay: true,
    controls: false,
    showPlayBtn: false,
    showProgress: false,
    playState: true,
    animationShow: false,
    currentTranslateY: 0,
    // 触摸开始时间
    touchStartTime: 0,
    // 触摸结束时间
    touchEndTime: 0,
    // 最后一次单击事件点击发生时间
    lastTapTime: 0,
    // 单击事件点击后要触发的函数
    lastTapTimeoutFunc: null,
    touchStartingY: 0,
    nowPage: 1,
    pageNo: 1,
    contentId: '',
    likeNum: 0,
    rows: 9,
    commentList: [],
    videos: [
      {
        videoUrl: "http://video.microc.cn/dG1wL3d4MzkwNjg3YjY3OTZjZTMzYS5vNnpBSnMzYTJqaDJHUWRGVllDV2JhaHhjTUFzLkFaeGE2d1NIVTV3cjkyNGFlOGIyMjMxYTgwNjYyOTVhZjY2YTJjN2VjY2MwLm1wNA==",
        durations: 10,
        poster: "https://p3.pstatp.com/large/131040001488de047292a.jpg",
        likenum: 10,
        commnetnum: '20',
        rewardNum: '6'
      },
      {
        videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200fce0000bg36q72j2boojh1t030g&line=0",
        durations: 10,
        poster: "https://p99.pstatp.com/large/12c5c0009891b32e947b7.jpg",
        likenum: 10,
        commnetnum: '20',
        rewardNum: '6'
      },
      {
        videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0300fd10000bfrb9mlpimm72a92fsj0&line=0",
        durations: 10,
        poster: "https://p99.pstatp.com/large/12246000525d4c87900e7.jpg",
        likenum: 10,
        commnetnum: '20',
        rewardNum: '6'
      },
      {
        videoUrl: "http://video.microc.cn/lecturer_iOS_201903181745504660A5DxJE9a.mp4",
        durations: 10,
        poster: "http://video.microc.cn/lecturer_iOS_201903181745504660A5DxJE9a.mp4?vframe/jpg/offset/0",
        likenum: 10,
        commnetnum: '20',
        rewardNum: '6'
      }
    ],
    videoIndex: 0,
    objectFit: "contain",
    totalCount: '',
    hasmoreData: false,
    loaderMore: true,
    hiddenloading: false,
    inputValue: '',
    addingText: false,
    conid: '',
    lecid: '',
    indexVideo: '',
    rewardNum: '',
    gold: '',
    commnetNum: '',
    nodata: false,
    windowHeight: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 滑动
    this.videoChange = throttle(this.touchEndHandler, 200)
    console.log(this.videoChange, 'this.videoChangethis.videoChange')
    // 绑定updateVideoIndex事件，更新当前播放视频index
    event.on('updateVideoIndex', this, function (index) {
      console.log('event updateVideoIndex:', index)
      setTimeout(() => {
        this.setData({
          animationShow: false,
          playState: true
        }, () => {
          // 切换src后，video不能立即播放，settimeout一下
          setTimeout(() => {
            this.vvideo.play()
          }, 100)
        })
      }, 600)
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    that.setData({
      windowHeight: wx.getSystemInfoSync().windowHeight
    })
  },
  onReady: function () {
    this.vvideo = wx.createVideoContext("kdvideo", this)
    this.animation = wx.createAnimation({
      duration: 500,// 整个动画过程花费的时间，单位为毫秒
      transformOrigin: '0 0 0'// 动画的类型
    })
    this.toast = this.selectComponent("#toast");
    this.animationTwo = wx.createAnimation({ //评论组件弹出动画
      duration: 400, // 整个动画过程花费的时间，单位为毫秒
      timingFunction: "ease", // 动画的类型
      delay: 0 // 动画延迟参数
    })
  },
  changePlayStatus() {
    console.log('changePlayStatus')
    let playState = !this.data.playState
    if (this.data.animationShow) {

    } else {
      if (playState) {
        this.vvideo.play()
      } else {
        this.vvideo.pause()
      }
      this.setData({
        playState: playState
      })
    }

  },
  touchStart(e) {
    let touchStartingY = this.data.touchStartingY
    this.touchStartTime = e.timeStamp
    touchStartingY = e.touches[0].clientY
    console.log(touchStartingY)
    this.setData({
      touchStartingY: touchStartingY
    })
  },
  touchMove(e) {
    this.videoChange(e)
  },
  touchEndHandler(e) {
    let touchStartingY = this.data.touchStartingY
    console.log(touchStartingY)
    console.log(e.changedTouches[0].clientY)
    let deltaY = e.changedTouches[0].clientY - touchStartingY
    console.log('deltaY ', deltaY)

    let index = this.data.videoIndex
    console.log(index, 'indexindexindexindex')
    if (deltaY > 100 && index !== 0) {
      // 更早地设置 animationShow
      this.setData({
        animationShow: true
      }, () => {
        console.log('-1 切换')
        this.data.commentList = [] //滑动上一个视频清除评论列表
        this.createAnimation(-1, index).then((res) => {
          console.log(res)
          this.setData({
            animation: this.animation.export(),
            videoIndex: res.index,
            currentTranslateY: res.currentTranslateY,
            percent: 1
          }, () => {
            event.emit('updateVideoIndex', res.index)
          })
        })
      })
    } else if (deltaY < -100 && index !== (this.data.videos.length - 1)) {
      this.setData({
        animationShow: true
      }, () => {
        console.log('+1 切换')
        this.createAnimation(1, index).then((res) => {
          this.setData({
            animation: this.animation.export(),
            videoIndex: res.index,
            currentTranslateY: res.currentTranslateY,
            percent: 1
          }, () => {
            event.emit('updateVideoIndex', res.index)
          })
        })
      })
    }
  },
  touchEnd(e) {
    console.log('------touchEnd------')
    console.log(e)
    this.touchEndTime = e.timeStamp
    this.videoChange(e)
  },
  touchCancel(e) {
    console.log('------touchCancel------')
    console.log(e)
  },
  listenerLogin: function () {
    // this.toast.showToast('恭喜你，获得了toast');
  },
  createAnimation(direction, index) {
    // direction为-1，向上滑动，animationImage1为(index)的poster，animationImage2为(index+1)的poster
    // direction为1，向下滑动，animationImage1为(index-1)的poster，animationImage2为(index)的poster
    let videos = this.data.videos
    let currentTranslateY = this.data.currentTranslateY
    console.log('direction ', direction)
    console.log('index ', index)
    // 更新 videoIndex
    index += direction
    currentTranslateY += -direction * this.data.windowHeight
    console.log('currentTranslateY: ', currentTranslateY)
    this.animation.translateY(currentTranslateY).step()

    return Promise.resolve({
      index: index,
      currentTranslateY: currentTranslateY
    })
  },
  showTalks: function (e) {
    // 加载数据'
    this.setData({
      contentId: e.currentTarget.dataset.videoid,
      commnetNum: e.currentTarget.dataset.commnetnum
    })
    console.log(e)
    this.getCommentList();

    // 设置动画内容为：使用绝对定位显示区域，高度变为100%
    this.animationTwo.bottom("0rpx").height("100%").step()
    this.setData({
      talksAnimationData: this.animationTwo.export(),
      animationShow: true
    })
  },

  hideTalks: function () {
    // 设置动画内容为：使用绝对定位隐藏整个区域，高度变为0
    this.animationTwo.bottom("-100%").height("0rpx").step()
    this.setData({
      commentList: [],
      talksAnimationData: this.animationTwo.export(),
      animationShow: false,
    })
    this.vvideo.play()
  },
  /// 双击
  doubleTap: function (e) {
    var that = this
    // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
    that.setData({
      contentId: e.currentTarget.dataset.videoid, // 点赞内容id
      videoIndex: e.currentTarget.dataset.index,
      likeNum: e.currentTarget.dataset.likenum
    })
    that.addVideoLike()
  },
  addVideoLike: function () { // 点赞视频
    var that = this;
    const params = {
      accessToken: app.globalData.token,
      evaType: 'content',
      id: that.data.contentId,
      likeFlag: 1
    }
    const index = that.data.videoIndex
    const videosList = "videos[" + index + "].isLike"
    const likenum = "videos[" + index + "].likenum"
    const like = that.data.likeNum
    console.log(likenum, 'likenumlikenumlikenumlikenum')
    Http.HttpRequst(false, '/api/lecture/addUserLike?accessToken=' + params.accessToken + '&evaType=content' + '&id=' + params.id + '&likeFlag=1', false, '', params, 'POST', false, function (res) {
      console.log(res.code == 102, '66')
      if (res.code == 102) {
        that.setData({
          [videosList]: res.dataObject,
          [likenum]: parseInt(like) + parseInt(1)
        })
      } else if (res.code == 101) {
        console.log(res.value)
      } else {

      }
    })
  },
  /**
   * 获取视频评论数据
   */
  getCommentList: function (e) { //
    wx.showNavigationBarLoading();
    const params = {
      pageSize: 10,
      nowPage: this.data.pageNo,
      contId: this.data.contentId,
      accessToken: app.globalData.token
    }
    const that = this
    Http.HttpRequst(false, '/api/lecture/getCommentList', false, '', params, 'get', false, function (res) {
      console.log(res.code == 102, '66')
      if (res.code == 102) {
        if (res.dataObject.list.length < that.data.rows) {
          that.setData({
            commentList: that.data.commentList.concat(res.dataObject.list),
            totalCount: res.dataObject.totalCount
          })
          that.setData({
            hasmoreData: true,
            hiddenloading: false,
            loaderMore: false
          })
        } else {
          that.setData({
            commentList: that.data.commentList.concat(res.dataObject.list),
            totalCount: res.dataObject.totalCount
          })
        }
        if (that.data.pageNo && res.dataObject.list.length == 0) {
          that.setData({
            nodata: true
          })
        }
      } else if (res.code == 1001) {

      }
    })
  },
  /**
   * 获取用户信息
   */
  getOwnInfo: function () {
    var params = {
      accessToken: app.globalData.token
    }
    Http.HttpRequst(false, '/api/lecture/getOwnInfo', false, '', params, 'get', false, function (res) {
      if (res.code == 102) {
        app.globalData.userId = res.dataObject.lecturerId
      } else if (res.code == 1001) {

      }
    })
  },
  goHome: function () {
    wx.redirectTo({
      url: '/pages/home/home'
    })
  },
  goFollow: function () {
    wx.redirectTo({
      url: '/pages/follow/follow'
    })
  },
  goSearch: function () {
    wx.redirectTo({
      url: '/pages/search/search'
    })
  },
  goUserHome: function (e) {
    var lecrid = e.currentTarget.dataset.lecturerid
    app.globalData.userId = lecrid
    wx.navigateTo({
      url: '/pages/home/home'
    })
  },
  contentInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  /**
   * 点击评论视频
   */
  addComment: function () {

  },
  /**
   * 点击头像关注
   */
  addLecturerFans: function (e) {
  },
  //粉丝取消关注
  delLecturerFans: function (e) {
  },
  /**
   * 悬赏弹框组件
   */
  onShowModal: function (e) {
    // 显示弹框
    this.setData({
      addingText: true,
      conid: e.currentTarget.dataset.conid,
      lecid: e.currentTarget.dataset.lecid,
      indexVideo: e.currentTarget.dataset.index,
      rewardNum: e.currentTarget.dataset.rewardnum
    })
  },
  onInputCancel: function () {
    // 隐藏弹框
    console.log(55566)
    this.setData({
      addingText: false
    })
  }
})
function throttle(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}