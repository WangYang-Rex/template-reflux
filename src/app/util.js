/**
 * 客户端设置导航栏标题
 *
 * @param {any} _title
 */
let setTitle = function (_title){
  dd && dd.biz.navigation.setTitle({
      title: _title,
      onSuccess: function (result) {
      }
  })
}
/**
* 时间格式化函数
*
* @param {string} time 时间戳，为空则取当前时间
* @param {string} format format格式，为空则返回扩展过的date对象
* @returns format格式时间或者扩展过的date对象
*/
let dateFormat = function (time, format) {
  let date;
  if(time) {
      //兼容ios 把yyyy-MM-dd hh:mm 改为 yyyy/MM/dd hh:mm
      if(typeof(time) == 'string'){
          time = time.replace(/-/g,'/');
      }
      if(typeof(time) == 'string' && time.indexOf('24:') >= 0) {
          time = time.replace('24:','23:')
          var _temp_date = new Date(time);
          date = new Date(_temp_date.getTime() + 60*60*1000)
      } else {
          date = new Date(time);
      }

  } else {
      date = new Date();
  }
  let _time = date.getTime(),

  _year = date.getFullYear(),
  _month = date.getMonth()+1,
  _date = date.getDate(),

  _hour = date.getHours(),
  _minute = date.getMinutes(),
  _second = date.getSeconds();
  if(format){
      //yyyy-MM-dd hh:mm:ss 2006-07-02 08:09:04
      format = format.replace('yyyy',_year);
      format = format.replace('MM', _month<10 ? '0'+_month : _month);
      format = format.replace('dd', _date<10 ? '0'+_date : _date);
      format = format.replace('hh', _hour<10 ? '0'+_hour : _hour);
      format = format.replace('mm', _minute<10 ? '0'+_minute : _minute);
      format = format.replace('ss',_second<10 ? '0'+_second : _second);

      //yyyy-M-d h:m:s hh:mm:ss 2006-7-2 8:9:4.18
      format = format.replace('M', _month);
      format = format.replace('d', _date);
      format = format.replace('h', _hour);
      format = format.replace('m', _minute);
      format = format.replace('s', _second);
      return format
  } else {
      let _dateTime = new Date(_year+'/'+_month+'/'+_date + ' 00:00');
      let obj = {
          year: _year,
          month: _month,
          day: _date,
          hour: _hour,
          minute: _minute,
          second: _second,

          time: _time, // 毫秒数
          dateTime: _dateTime.getTime(),
          date: date
      };
      return obj;
  }
}
/**
* 获取浏览器的params
*
* @param {string} key
* @returns string
*/
let getUrlParam = function (key, _url) {
  let url = _url ? _url : location.href;
  if(url.lastIndexOf('?')<0){
      return ''
  }
  let arr = url.substring(url.lastIndexOf('?')+1).split('&');

  for(let i = 0;i<arr.length; i++){
      let _cks = arr[i].split('=');
      if(_cks[0] == key){
          return _cks[1]
      }
  }
  return '';
}
/**
* 从cookie获取获取用户信息
*
* @returns userInfo
*/
let getUserInfo = function () {

  let cookies = document.cookie.split(';');
  let userInfo = {
      isAdmin: false
  };
  for(let i = 0; i<cookies.length; i++){
      let _cks = cookies[i].split('=');
      if(_cks[0].trim() == 'yzuid'){
          userInfo.id = decodeURIComponent(decodeURIComponent(_cks[1].trim()));
      }
      if(_cks[0].trim() == 'yzuname'){
          userInfo.name = decodeURIComponent(_cks[1].trim());
      }
      if(_cks[0].trim() == 'yzuavatar'){
          userInfo.avatar = decodeURIComponent(_cks[1].trim());
      }
      if(_cks[0].trim() == 'yzadminflag'){
          userInfo.isAdmin = _cks[1].trim() == '1' ? true : false;
      }
  }
  let spaceId = window.sessionStorage.getItem('spaceId');
  let corpId = window.sessionStorage.getItem('corpId');
  if(spaceId) {
      userInfo.spaceId = spaceId;
  }
  if(corpId){
      userInfo.corpId = corpId;
  }
  return userInfo;

}
/**
* cookie取值
*
* @param {any} key
* @returns
*/
let getValueFromCookieByKey = function (key) {
  let cookies = document.cookie.split(';');
  let obj = cookies.map(ck => {
      let _cks = ck.split('=');
      return {
          key: typeof(_cks[0])=='string' && _cks[0].trim(),
          value: typeof(_cks[1])=='string' && _cks[1].trim()
      }
  }).filter(item => {
      return item.key === key
  })[0];
  return obj && obj.value ? obj.value : null;
}
//显示loading
let showLoading = function () {
  let $loading = $('<div class="meeting-loading"></div>');
  $('body').append($loading);
}
//隐藏index.html loading
let hideLoading = function () {
  let $dom = document.querySelector('.meeting-loading');
  $dom && $dom.remove();
}
let closeLoading = function () {
  let $dom = document.querySelector('.first-loading');
  $dom && $dom.setAttribute('style','display:none !important');
}
/**
* 链接地址切换成https
* @param {any} url
* @returns
*/
let urlFormat = function (url){
  if(url.indexOf('http://')>-1){
      return url.replace('http://', 'https://')
  }
  return url
}
/**
* 返回设备类型
* @returns android/iphone/pc
*/
let getDevice = function(){
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {  //判断iPhone|iPad|iPod|iOS
      return 'iphone'
  } else if (/(Android)/i.test(navigator.userAgent)) {   //判断Android
      return 'android'
  } else {  //pc
      return 'pc'
  };
}
let getDeviceDetail = function(){
  return navigator.userAgent
}

let preView = function (url){
  dd.biz.util.previewImage({
      urls: url,//图片地址列表
      // current: '',//当前显示的图片链接
      onSuccess : function(result) {
          /**/
      },
      onFail : function(err) {}
  })
}

/**
* 打点函数
* @param {any} params
*/
let clickPoint = function(point){
  var user = getUserInfo();
  if(!user.id) {
      return;
  }
  var $img = $('<img style="position:absolute;bottom:0;left:-100px;width:0;height:0;" />'),
      keyMap = {
          app_type: 'url_tj', // 必须是这个才能统计出来
          log_type: 'click',
          taobaoNick: user.name,
          taobaoId: user.id,
          corpId: user.corpId,
          role: user.isAdmin ? 'admin' : '',
          point: point,
          rad: Math.random(),
      };

  var queryStr = $.param($.extend({}, keyMap));
  $img.attr('src', 'http://ftj.superboss.cc/tj.jpg?' + queryStr);
  $img.on('load', function() {
      $img.remove();
  });
  $('body').append($img);
}
// 时长格式化
let timeFormat = function (time, time2) {
  let _time = 0;
  if(time2){
      _time = (dateFormat(time2).time - dateFormat(time).time) / 60 / 1000
  } else {
      _time = time;
  }
  let hour = parseInt(_time/60),
  minute = parseInt(_time%60);
  return (hour > 0 ? hour + '小时' : '') + (minute > 0 ? minute + '分钟' : '')
}
let addMore= function (show,control,text,cb) {
  dd.biz.navigation.setRight({
      show: show,//控制按钮显示， true 显示， false 隐藏， 默认true
      control: control,//是否控制点击事件，true 控制，false 不控制， 默认false
      text: text,//控制显示文本，空字符串表示显示默认文本
      onSuccess: function (result) {
          //如果control为true，则onSuccess将在发生按钮点击事件被回调
          /*
           {}
           */
          cb && cb()
      },
      onFail: function (err) {
      }
  });
}
let showModal = function(cb){
  dd.device.notification.modal({
      image:location.origin +'/public/images/modal.gif', // 标题图片地址
      title:"支持多任务协同", //标题
      content:"点击右上角更多-置顶到聊天窗口，随时暂停当前任务，快速返回聊天列表，高效协同", //文本内容
      buttonLabels:["我知道了"],// 最多两个按钮，至少有一个按钮。
      onSuccess : function(result) {
          //onSuccess将在点击button之后回调
          /*{
           buttonIndex: 0 //被点击按钮的索引值，Number，从0开始
           }*/
          if(result.buttonIndex == 0){
              cb && cb()
          }
      },
      onFail : function(err) {}
  })
}
// 将地址列表格式转换成citys
/** _city / cities 数据结构
*  [
*      {"province":"浙江省","city":"杭州市","detail":[{"name":"恒鑫大厦","type":"building","road":"江南大道588号","district":"滨江区","list":[{"name":"楼号6","type":"num","list":[{"name":"1楼","type":"floor"},{"name":"2楼","type":"floor"}],"selectedfloor":[]}]},{"name":"东冠大厦","type":"building","road":"江南大道588号","district":"萧山区","list":[{"name":"楼号2","type":"num","list":[{"name":"1楼","type":"floor"}],"selectedfloor":[]}]}]},
*      {"province":"浙江省","city":"温州市","detail":[{"name":"温州大厦","type":"building","road":"啦啦啦888号","district":"温州区","list":[{"name":"A栋","type":"num","list":[{"name":"1楼","type":"floor"},{"name":"2楼","type":"floor"}],"selectedfloor":[]}]}]},
*      {
*          "province":"河南省",
*          "city":"周口市",
*          "detail":[
*              {
*                  "name":"周口大厦",
*                  "type":"building",
*                  "road":"啦啦啦888号",
*                  "district":"周口区",
*                  "list":[
*                      {"name":"A栋",
*                      "type":"num",
*                      "list":[
*                          {"name":"11楼","type":"floor"}
*                          ],
*                      "selectedfloor":[]
*                      }
*                   ]
*              }
*         ]
*     }
* ]
* */
let addrListFormat = function(addressList, defaultAddress){
  let content= JSON.parse(JSON.stringify(addressList)),
  multi= false, cities= [];
  // 省                                     市                building                             //楼号
  // if((content.length == 1 && content[0].list.length == 1 && content[0].list[0].list.length == 1 && content[0].list[0].list[0].list.length == 1
  //             //楼层
  //         && content[0].list[0].list[0].list[0].list.length == 1) || content.length == 0){
  if(content.length == 0){
      multi = 2;
  }else{
      multi = 1;
  }
  content.map(function(province){
      province.list.map(function(city){
          city.list.map(function(building){
              building.list.map(function(num){
                  //给每一栋楼追加一个选中楼层的参数
                  let selectedfloor = [];
                  let addr1;
                  if(num.name){
                      addr1 =  province.name + city.name + building.road + building.name + num.name;
                  }else{
                      addr1 =  province.name + city.name + building.road + building.name;
                  }
                  if(JSON.parse(JSON.stringify(defaultAddress))){
                      //这里处理选中的情况
                      defaultAddress.map(function(item){
                          let addr2;
                          if(item.num){
                              addr2 = item.province + item.city + item.road + item.building + item.num;
                          }else{
                              addr2 = item.province + item.city + item.road + item.building;
                          }
                          if(JSON.stringify(addr1) == JSON.stringify(addr2)){
                              selectedfloor.push(item.floor)
                          }
                      })
                  }
                  num.selectedfloor = selectedfloor;
              })
          })
          cities.push({
              "province": province.name,
              "city": city.name,
              "detail": city.list
          })
      })
  })
  return {
      multi: multi,
      cities: cities
  }
}
let getSelectAddrList = function(cities){
  let selectAddressList = [];
  cities.map(function(item){
      item.detail.map(function(building){
          building.list.map(function(num){
              num.selectedfloor.map(function(floor){
                  let addr = {
                      province: item.province,
                      city: item.city,
                      district: building.district,
                      road: building.road,
                      building: building.name,
                      floor: floor
                  }
                  if(num.name){
                     addr.num = num.name
                  }
                  selectAddressList.push(addr)
              })
          })
      })
  })
  return selectAddressList
}
let beginTimeFormat = function(beginTime){
  let beginArr = beginTime.split(":");
  let minutes = beginArr[1];
  if(minutes >= 0 && minutes < 15){
      minutes = 0
  }else if(minutes >= 15 && minutes < 30){
      minutes = 15
  }else if(minutes >= 30 && minutes < 45){
      minutes = 30
  }else if(minutes>=45){
      minutes = 45
  }
  return beginArr[0]+":"+minutes;

}
let util = {
  showLoading,
  hideLoading,
  closeLoading,
  setTitle,
  dateFormat,
  getUrlParam,
  getUserInfo,
  getValueFromCookieByKey,
  urlFormat,
  getDevice,
  preView,
  clickPoint,
  timeFormat,
  addMore,
  showModal,
  addrListFormat,
  getSelectAddrList,
  beginTimeFormat,
  getDeviceDetail
}
window.util = util;
module.exports = util;
