
var currentPage = 1;//当前页,默认 第一页

import url from '../../lib/urls/urls.js';
import constant from '../../lib/const/checkConstant.js';
var page = 1;
var page_size = 10;

/**
 * 登录
 */
var login = () => {
  checkLogin(() => {
    console.log("已登录,不用重复登录了。。。");
  }, () => {
    remoteLogin()
  });
}

/**
 * 服务端请求登录
 */
var remoteLogin = (success, fail) => {
  console.info("remoteLogin invoked...")
  //调用登录接口
  wx.login({
    success: function (loginRes) {
      console.log("登录获取code", loginRes);
      wx.request({
        url: url.loginUrl,
        data: {
          code: loginRes.code
        },
        complete: function (res) {
          console.log("login res:" + res)
          if (res.statusCode != 200) {//失败
            console.error("登陆失败", res);
            var data = res.data || { msg: '无法请求服务器' };
            if (typeof fail == "function") {
              fail();
            } else {
              wx.showModal({
                title: '提示',
                content: data.msg,
                showCancel: false
              });
            }
          } else {//成功
            console.log("登录成功", res);
            console.log("res.data.data.code", res.data.code);
            wx.setStorage({
              key: constant.LOGIN_TOKEN,
              data: res.data.code
            })
            typeof success == "function" && success();
          }
        }
      })
    },
    fail: function (res) {
      console.log("wx.login has error", res)
    }
  })
}

/**
 * 校验登录
 */
var checkLogin = (success, fail) => {
  var dianToken = wx.getStorageSync(constant.LOGIN_TOKEN);
  if (!dianToken) {
    typeof fail == "function" && fail();
  } else {
    wx.checkSession({
      success: function () {
        /** 
          wx.request({
              url: CHECK_LOGIN_URL,
              data: {
                  dianToken: dianToken
              },
              complete: function (res) {
                  if (res.statusCode != 200) {//失败
                      typeof fail == "function" && fail();
                  } else {//成功
                      typeof success == "function" && success();
                  }
              }
          })
          */
        console.log("checkSession success!")
        typeof success == "function" && success();
      },
      fail: function () {
        typeof fail == "function" && fail();
      }
    })
  }
}

/**
 * 获得用户信息
 */
var getUserInfo = (success, fail) => {
  wx.getUserInfo({
    success: function (res) {
      var userInfo = res.userInfo
      if (config.fullLogin) {//上传加密数据
        wx.request({
          url: url.fullUserInfoUrl,
          data: {
            dianToken: wx.getStorageSync(constant.LOGIN_TOKEN),
            encryptedData: res.encryptedData,
            iv: res.iv
          }, success: function (requestRes) {
            typeof success == "function" && success(userInfo);
          }
        });
      } else {
        typeof success == "function" && success(userInfo);
      }
    }, fail: function () {
      typeof fail == "function" && fail();
    }
  })
}

var app = getApp();

Page({
    data: {
        list: [],
        imgList: [],
        searchLoading: true, //"上拉加载"的变量，默认false，隐藏  
        searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏 
        isRefresh: true,
        typeID: '',
        keyword:'',
        hideMessage:true,
        messagecount:0,
        hideCustomList: false,
        hideSearchDetail: true,
        monthArray:['1','2','3','4','5','6','7','8','9','10','11','12'],
        toubaoYearmonth:'',
        source: [],
        isHidden: [],
        beforeIndex: -1,
        collectImgs:[],
        currentMainID: '', //记录主键
        currentContent: '',
        onlyID: ''
    },

    // 页面初始化 options为页面跳转所带来的参数
    onLoad: function (options) {
        var that = this
        page = 1;
        var dianToken = wx.getStorageSync(constant.LOGIN_TOKEN);
        if (!dianToken) {
          typeof fail == "function" && fail();
        } else {
          wx.checkSession({
            success: function () {
              /** 
                wx.request({
                    url: CHECK_LOGIN_URL,
                    data: {
                        dianToken: dianToken
                    },
                    complete: function (res) {
                        if (res.statusCode != 200) {//失败
                            typeof fail == "function" && fail();
                        } else {//成功
                            typeof success == "function" && success();
                        }
                    }
                })
                */
              console.log("已登录,不用重复登录了。。。");
            },
            fail: function () {
            }
          })
        }
        login(() => {
          console.info("main login method invoked...")
          getUserInfo((userInfo) => {
            console.log("已获取数据", userInfo);
            app.data.userInfo = userInfo;
            app.globalData.userInfo = userInfo
            that.fetchData();
          }, () => {
            console.log("用户拒绝提供信息");
          });
        });
    },

    onShow: function () {
      // 页面显示
      console.log("onShow...");
      if (this.data.isRefresh) {
        page = 1;
        this.setData({
          list: [],
          searchLoadingComplete: false,
          isRefresh: false
        });
        this.fetchData();
      }
      
    },

    onPullDownRefresh: function () { //下拉刷新
        page = 1;
        this.setData({
            list: [],
            searchLoadingComplete : false
        });
        this.fetchData();
    },
    onReachBottom: function () { // 上拉加载更多
        // Do something when page reach bottom.
        console.log("page = " + page)
        this.setData({
          searchLoadingComplete: false,
          toubaoYearmonth: ''
        });
        this.fetchData();
    },
    keywordSearch: function ()
    {
        console.log("keyword:" + this.data.keyword);
        page = 1;
        this.setData({
          list: [],
          searchLoadingComplete: false,
          toubaoYearmonth:''
        });
        this.fetchData();
    },

    toDetailsTap: function (e) {
      wx.navigateTo({
        url: "/pages/detail/detail?id=" + e.currentTarget.dataset.id
      })
    },

    preImages: function (e) 
    {
      var that = this
      var pid = e.currentTarget.dataset.pid
      var id = e.currentTarget.dataset.id
      var nowpic = this.data.list[pid].imglist[id].img
      var picList = this.data.list[pid].imglist;
      var urls = [];
      for (var i = 0; i < picList.length; i++) 
      {
        urls.push(picList[i].img);
      }
      wx.previewImage({
        current: nowpic, // 当前显示图片的http链接
        urls: urls, // 需要预览的图片http链接列表
      })
    },

    showPart: function (e) {
      var mainid = e.currentTarget.dataset.id;
      this.setData({
        currentMainID: mainid,
        onlyID: e.currentTarget.dataset.index
      })
      this.requestPartTake(e)
    },

    savePartData: function (e)
    {
      if (e.detail.value.content == '') {
        wx.showToast({
          title: '内容不能为空',
          image: "../../images/gantan.png",
          duration: 1000
        })
        return
      }
      wx.showLoading();
      this.setData({
        currentContent: e.detail.value.content
      })
      this.requestPartTake()
    },

    requestPartTake: function()
    {

      var that = this;
      dian.request({
        loading: true,
        url: '/xcx/front/upload/doPartake',
        method: 'POST',
        data: {
          mainID: that.data.currentMainID,
          content: that.data.currentContent,
          onlyID: that.data.onlyID
        },
        success: function (res) {
          console.log("data:" + res.data.data)
          if (res.data.data == 'success') {
            wx.showToast({
              title: '报名成功',
              icon: 'success',
              duration: 1000
            })
            that.setData({
              currentContent: ''
            })
          } else if (res.data.data == 'applyed') {
            wx.showToast({
              title: '已竞标',
              icon: 'success',
              duration: 1000
            })
          } else if (res.data.data == 'blank') {
            that.setData({
              isHiddenPart: false
            })
          } else if (res.data.data == 'closed') {
            wx.showToast({
              title: '该单已被抢',
              icon: 'success',
              duration: 2000
            })
            that.setData({
              isHiddenPart: false
            })
          }
        }
      });

    },

    backToCustomList: function()
    {
      this.setData({
        hideCustomList: false,
        hideSearchDetail: true
      })
    }, 
    bindToubaoYearMonthPickerChange: function (e) {
      this.setData({
        toubaoYearmonth: e.detail.value
      })
    },
    //输入框事件，每输入一个字符，就会触发一次  
    bindKeywordInput: function (e) {
      this.setData({
        keyword: e.detail.value
      })
    },
    toSearchTap:function (e) {
      wx.navigateTo({
        url: "/pages/search/search"
      })
    },
    doCollect: function (e) 
    {
      var mainid = e.currentTarget.dataset.id;
      var collectIndex = e.currentTarget.dataset.index;
      console.info("docollect mainID: " + mainid);
      console.info("docollect index: " + collectIndex)
      var that = this;
      dian.request({
        loading: true,
        url: '/xcx/front/upload/doCollect',
        method: 'POST',
        data: {
          mainID: mainid
        },
        success: function (res) {
          console.log(res.data.data)
          if(res.data.data == 'success')
          {
            var params = {};
            var collectStr = "collectImgs[" + collectIndex + "]";
            params[collectStr] = '../../images/like-red.png';
            that.setData(params);
           
            wx.showToast({
              title: '关注成功',
              icon: 'success',
              duration: 1000
            })
          } else if (res.data.data == 'remove')
          {
            console.log("cancel do collect...")
            var params = {};
            var collectStr = "collectImgs[" + collectIndex + "]";
            params[collectStr] = '../../images/like-gray.png';
            that.setData(params);

            wx.showToast({
              title: '取消成功',
              icon: 'success',
              duration: 1000
            })
          }
        }
      });

    },
    fetchData: function () {//获取列表信息

        var that = this;
        this.setData({
          searchLoading: true,
        });
        wx.request({
          loading: true,
          url: url.taskList,
          method: 'POST',
          data: {
            pageIndex: page,
            pageSize: 10,
            keyword: that.data.keyword
          },
          success: function (res) {
            console.log(res.data.data)
            that.setData({
              searchLoading: false,
              list: that.data.list.concat(res.data.data)
            });
            //console.info("list :" + that.data.list)
            for (var i = 0; i < that.data.list.length; i++) {
              var params = {};
              var collectStr = "collectImgs[" + i + "]";
              if (undefined == that.data.list[i]) {
                continue;
              }
              if (that.data.list[i].isCollect == '1') {
                params[collectStr] = '../../images/like-red.png';
              } else {
                params[collectStr] = '../../images/like-gray.png';
              }
                
              that.setData(params);
            }
            
            if (res.data.data.length == 0) {
              that.setData({
                searchLoadingComplete: true
              });
            } else {
              page++;
            }
          }
        });
    },
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: '最专业的小程序外包市场!',
        path: '/pages/main/main',
        success: function (res) {
          // 转发成功
          wx.showToast({
            title: '分享成功',
            icon: 'success',
            duration: 2000
          })
        },
        fail: function (res) {
          // 转发失败
          wx.showToast({
            title: '取消分享',
            icon: 'success',
            duration: 2000
          })
        }
      }
    },

    goToShare: function () {
      Page.onShareAppMessage()
    }
})

