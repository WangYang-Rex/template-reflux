// See https://github.com/Jias/natty-fetch for more details.
let util = require('./util.js');
let {Toast} = SaltUI;
let fetch_config = {
    mockUrlPrefix: '/mock/',
    urlPrefix: '/',
    mock: __LOCAL__ ? true : false,
    // jsonp: true,
    header: {},
    method: 'POST',
    withCredentials: true,
    traditional: true,
    data: {
        _tb_token_: ''
    },
    timeout: 20000,
    fit: function(response) {
        let ret = {}
        if(response.result == 100){
            ret.success = true;
            ret.content = response.data;
        } else if(response.result == 702 ||response.result == 703) {
            //未获取到用户 跳转到Login进行免登
            if(location.href.indexOf('url=')<=0){
                var _corpId = sessionStorage.getItem('corpId') || util.getUrlParam('corpId') || util.getUrlParam('corpId', location.href);
                location.hash = '#/login?expire=1'+ (_corpId ? '&corpId='+_corpId : '');
            }
            ret.success = false;
            ret.error = {
                message: '当前用户未登陆'
            }
        } else {
            ret.success = false;
            ret.content = response.data;
            ret.error = {
                message: response.message
            }
            Toast.show({
                autoHide: true,
                type: 'error',
                content: response.message
            })
        }
        return ret;
    }
}
const context = salt.fetch.context(fetch_config);

let apis = {
    getSomeInfo: {
        mockUrl: 'query/getSomeInfo.json',
        url: 'query/getSomeInfo.json'
    }
}
context.create('API', apis);
module.exports = context.api;
