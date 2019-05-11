// common/nyz_area_picker/nyz_area_picker.js
import remoteUrls from '../../lib/urls/urls.js';
var areaTool = require('../../utils/area.js');
var index = [0,0,0]
function getCityByProvinceId(provinceId, citys){
  var citysShow = [];
  for (var i = 0; i < citys.length; i++) {
    if (citys[i].fatherProvince == provinceId) {
      citysShow.push(citys[i]);
    }
  }
  return citysShow;
}
function getAreaByCityId(countyId, areas) {
  var areasShow = [];
  for (var i = 0; i < areas.length; i++) {
    if (areas[i].fatherCounty == countyId) {
      areasShow.push(areas[i]);
    }
  }
  return areasShow;
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:{    //控制area_select显示隐藏
      type:Boolean,
      value:false
    },
    maskShow:{    //是否显示蒙层
      type: Boolean,
      value: true
    }
  }, 
  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  ready() { 
    console.log('生命show!123'); 
    var self = this;
    var provinces = [];
    //获取所有省
    wx.request({
      url: remoteUrls.provinceList,
      success: function (res) {
        for (var i = 0; i < res.data.rows.length; i++) {
          provinces.push(res.data.rows[i]);
        }
        self.setData({
          provincesList: provinces
        });
        //获取省对应的所有市
        var citys = [];
        wx.request({
          url: remoteUrls.cityList,
          complete: function (res) {
            for (var i = 0; i < res.data.rows.length; i++) {
              citys.push(res.data.rows[i]);
            }
            var cityShow = getCityByProvinceId(provinces[0].provinceId, citys)
            self.setData({
              citysList: citys,
              citysShowList: cityShow
            });
            //获取市对应的所有地区
            var areas = [];
            wx.request({
              url: remoteUrls.areaList,
              complete: function (res) {
                for (var i = 0; i < res.data.rows.length; i++) {
                  areas.push(res.data.rows[i]);
                }
                self.setData({
                  areasList: areas,
                  areasShowList: getAreaByCityId(cityShow[0].countyId, areas)
                });
              }
            });
          }
        }); 
        
      }
    });
  },
  /**
   * 组件的初始数据
   */
  data: {
    provincesList: null,
    citysList: null,
    areasList: null,
    citysShowList: null,
    areasShowList: null,
    value:[0,0,0],
    province: '北京市',
    city: '北京市',
    area: '东城区'
  }, 

  /**
   * 组件的方法列表
   */
  methods: {
    handleNYZAreaChange:function(e){
      var that = this;
      var value = e.detail.value;
      /**
       * 滚动的是省
       * 省改变 市、区都不变
       */
      if(index[0] != value[0]){
        index = [value[0],0,0];
        let selectCitys = getCityByProvinceId(that.__data__.provincesList[index[0]].provinceId, that.__data__.citysList);
        let selectAreas = getAreaByCityId(selectCitys[index[1]].countyId, that.__data__.areasList);
        that.setData({
          citysShowList: selectCitys,
          areasShowList: selectAreas,
          value: [index[0],0,0],
          province: that.__data__.provincesList[index[0]],
          city: selectCitys[0],
          area: selectAreas[0]
        })
        console.log(that);
      } else if (index[1] != value[1]){
        /**
         * 市改变了 省不变 区变
         */
        index = [value[0], value[1], 0]
        let selectAreas = getAreaByCityId(that.__data__.citysShowList[index[1]].countyId, that.__data__.areasList);
        that.setData({
          areasShowList: selectAreas,
          value: [index[0], index[1], 0],
          province: that.__data__.provincesList[index[0]],
          city: that.__data__.citysShowList[index[1]],
          area: that.__data__.areasShowList[index[2]]
        })
      } else if (index[2] != value[2]){
        /**
         * 区改变了
         */
        index = [value[0], value[1], value[2]]
        that.setData({
          value: [index[0], index[1], index[2]],
          province: that.__data__.provincesList[index[0]],
          city: that.__data__.citysShowList[index[1]],
          area: that.__data__.areasShowList[index[2]]
        })
      }
    },
    /**
     * 确定按钮的点击事件
     */
    handleNYZAreaSelect:function(e){
      //console.log("e:" + JSON.stringify(e));
      var myEventDetail = e; // detail对象，提供给事件监听函数
      var myEventOption = {}; // 触发事件的选项
      this.triggerEvent('sureSelectArea', myEventDetail, myEventOption)
    },
    /**
     * 取消按钮的点击事件
     */
    handleNYZAreaCancle:function(e){
      var that = this;
      that.setData({
        show:false
      })
    }
  }
})
