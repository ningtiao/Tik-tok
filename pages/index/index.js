//index.js
//获取应用实例
import * as event from '../../utils/event.js'
const app = getApp()
const windowHeight = wx.getSystemInfoSync().windowHeight

Page({
  data: {
    percent: 1,
    autoplay: true,
    controls: false,
    showFullscreenBtn: false,
    showPlayBtn: false,
    showFullscreenBtn: false,
    showCenterPlayBtn: false,
    enableProgressGesture: false,
    showProgress: false,
    playState: true,
    animationShow: false,
    currentTranslateY: 0,
    touchStartingY: 0,
    videos: [
      {
        videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200faf0000bg5joco1ahq89k7ik9j0&line=0",
        durations: 10,
        poster: "https://p3.pstatp.com/large/131040001488de047292a.jpg"
      },
      {
        videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200f2f0000bg2dbhb6j2qj3mr8pa9g&line=0",
        durations: 10,
        poster: "https://p1.pstatp.com/large/12bea0008f8a226fc53c3.jpg"
      },
      {
        videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200fce0000bg36q72j2boojh1t030g&line=0",
        durations: 10,
        poster: "https://p99.pstatp.com/large/12c5c0009891b32e947b7.jpg"
      },
      {
        videoUrl: "https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0300fd10000bfrb9mlpimm72a92fsj0&line=0",
        durations: 10,
        poster: "https://p99.pstatp.com/large/12246000525d4c87900e7.jpg"
      },
      {
        videoUrl: "http://video.microc.cn/lecturer_iOS_201903181745504660A5DxJE9a.mp4",
        durations: 10,
        poster: "http://video.microc.cn/lecturer_iOS_201903181745504660A5DxJE9a.mp4?vframe/jpg/offset/0"
      }
    ],
    videoIndex: 0,
    objectFit: "contain"
  },
  onLoad: function () {
    // 滑动
    this.videoChange = throttle(this.touchEndHandler, 200)
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
      }, 500)
    })
  },
  bindplay() {
    console.log('--- video play ---')
  },
  binderror(err) {
    console.log(err)
  },
  bindtimeupdate(e) {
    let percent = (e.detail.currentTime / e.detail.duration) * 100
    this.setData({
      percent: percent.toFixed(2)
    })
  },
  onReady: function () {
    this.vvideo = wx.createVideoContext("kdvideo", this)
    this.animation = wx.createAnimation({
      duration: 500,
      transformOrigin: '0 0 0'
    })
  },
  changePlayStatus() {
    console.log('changePlayStatus')
    let playState = !this.data.playState
    if (playState) {
      this.vvideo.play()
    } else {
      this.vvideo.pause()
    }
    this.setData({
      playState: playState
    })
  },
  touchStart(e) {
    let touchStartingY = this.data.touchStartingY
    console.log('------touchStart------')
    touchStartingY = e.touches[0].clientY
    this.setData({
      touchStartingY: touchStartingY
    })
  },
  touchMove(e) {
    // this.videoChange(e)
  },
  touchEndHandler(e) {
    let touchStartingY = this.data.touchStartingY
    let deltaY = e.changedTouches[0].clientY - touchStartingY
    console.log('deltaY ', deltaY)

    let index = this.data.videoIndex
    if (deltaY > 50 && index !== 0) {
      // 更早地设置 animationShow
      this.setData({
        animationShow: true
      }, () => {
        console.log('-1 切换')
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
    } else if (deltaY < -50 && index !== (this.data.videos.length - 1)) {
      this.setData({
        animationShow: true
      }, () => {
        console.log('+1 切换')
        this.createAnimation(1, index).then((res) => {
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
    }
  },
  touchEnd(e) {
    console.log('------touchEnd------')
    this.videoChange(e)
  },
  touchCancel(e) {
    console.log('------touchCancel------')
    console.log(e)
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
    currentTranslateY += -direction * windowHeight
    console.log('currentTranslateY: ', currentTranslateY)
    this.animation.translateY(currentTranslateY).step()

    return Promise.resolve({
      index: index,
      currentTranslateY: currentTranslateY
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