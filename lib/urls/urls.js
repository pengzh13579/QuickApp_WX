var config = require('../config/config')

// 登录服务
const LOGIN_URL = `${config.host}/wxController/login`;
// 解密微信用户信息并保存在服务端
const FULL_USER_INFO_URL = `${config.host}/wxController/decodeWxInfo`;
// 校验是否登录
const CHECK_LOGIN_URL = `${config.host}/wxController/checkLogin`;
// 获得主页列表
const TASK_LIST = `${config.host}/wxController/getTaskList`;
// 获得省级列表
const PROVINCE_LIST = `${config.host}/wxController/provinceList`;
// 获得市及自治区列表
const CITY_LIST = `${config.host}/wxController/countyList`;
// 获得地区列表
const AREA_LIST = `${config.host}/wxController/districtList`;

module.exports = {
  loginUrl: LOGIN_URL,
  fullUserInfoUrl: FULL_USER_INFO_URL,
  checkLoginUrl: CHECK_LOGIN_URL,
  taskList: TASK_LIST,
  provinceList: PROVINCE_LIST,
  cityList: CITY_LIST,
  areaList: AREA_LIST
}