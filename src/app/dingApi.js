// let DB = require('./db.js');
let util = require('./util.js');
let {Toast} = SaltUI;

//dd.error
dd.error(function(error){
    console.log('dd error', JSON.stringify(error))
    let _config = JSON.parse(JSON.stringify(window.config));
    if(typeof(_config)=='object'){
        delete _config.jsApiList
    }
    let obj = {
        device: util.getDeviceDetail(),
        page_url: location.href,
        first_page_url: sessionStorage.getItem('first_page_url'),
        corpId: sessionStorage.getItem('coprId') || util.getUrlParam('corpId') || util.getUrlParam('corpId', location.herf),
        signature: sessionStorage.getItem('signature'),
        config: _config,
        error: error,
        url: sessionStorage.getItem('url')
    }
    DB.API.errorinfo_save({
        corpId: sessionStorage.getItem('corpId'),
        type: 'dd_error',
        detail: JSON.stringify(obj)
    })
    .then(function () {
    })
    if(error.errorCode == 3){
        //权限校验失败，需要重新授权
        sessionDismiss()
    }
})

//鉴权失败，
let sessionDismiss = function(){
    if(!window.dismiss) {
        window.dismiss = true;
        setTimeout(function(){
            dd.device.notification.alert({
                message: "会话失效，请重进应用",
                title: "提示",//可传空
                buttonName: "确定",
                onSuccess : function() {
                    // 关闭页面
                    dd.biz.navigation.close({
                        onSuccess : function(result) {
                            console.log('dd.biz.navigation.close success')
                        },
                        onFail : function(err) {
                            console.log('dd.biz.navigation.close fail:' +JSON.stringify(err))
                        }
                    })
                },
                onFail : function(err) {
                    console.log(JSON.stringify(err))
                }
            });
        }, 1000)
    }
}

/**
 * dingding JSSDK初始化函数
 * 调用get_free_login_cfg接口获取 config 相关参数
 * 执行dd.config
 * 设置dd.error和dd.ready监听
 * @param {any} cb 回调函数
 */
let dd_config = function (cb) {
    let t = this, _corpId = sessionStorage.getItem('corpId');
    // if(!_corpId){
    //     _corpId = util.getUrlParam('corpId') || util.getUrlParam('corpId', location.herf);
    //     _corpId ? window.sessionStorage.setItem('corpId', _corpId) : null;
    // }
    if(!_corpId) {
        //没拿到corpId
        sessionDismiss()
        return
    }
    let config = {
        agentId: '', // 必填，微应用ID
        corpId: _corpId, //必填，企业ID
        timeStamp: '123', // 必填，生成签名的时间戳
        nonceStr: '', // 必填，生成签名的随机串
        signature: '', // 必填，签名
        type: 0, //选填。0表示微应用的jsapi,1表示服务窗的jsapi。不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
        jsApiList: [
            'biz.contact.choose', 'biz.ding.post', 'biz.telephone.call',
            'biz.util.uploadImage', 'biz.util.uploadAttachment', 'biz.cspace.preview',
            'runtime.permission.requestOperateAuthCode',
            'biz.util.open','biz.customContact.choose',
            'biz.map.locate', 'device.geolocation.get',
            'biz.contact.complexPicker',"biz.contact.departmentsPicker"
            // 'biz.navigation.setLeft', 'biz.navigation.setTitle', 'biz.navigation.setRight',
            // 'ui.webViewBounce.disable', 'biz.util.previewImage',
            // 'ui.nav.recycle', 'ui.nav.push', 'ui.nav.preload',//salt.router
            // 'device.notification.confirm',  'device.notification.alert', 'device.notification.prompt',
            // 'biz.util.openLink', 'biz.util.datepicker',
        ] // 必填，需要使用的jsapi列表，注意：不要带dd。
    };
    DB.API.get_free_login_cfg({
        "corpId": _corpId,
        // "corpId": 'ding7fa044c9c343ff1f35c2f4657eb6378f',
        "redirectURL": location.href.replace(location.hash, ''),
        "domain": 'meeting'
    })
    .then(function (content) {
        console.log(content)
        //缓存到sessionStorage
        sessionStorage.setItem('spaceId', content.spaceId);
        sessionStorage.setItem('cId', content.cId);
        sessionStorage.setItem('signature', content.signature);
        sessionStorage.setItem('nonceStr', content.nonStr);
        sessionStorage.setItem('timeStamp', content.timeStamp);
        sessionStorage.setItem('agentId', content.agentId);
        sessionStorage.setItem('url', content.url);

        config['signature'] = content.signature;
        config['nonceStr'] = content.nonStr;
        config['timeStamp'] = content.timeStamp;
        config['corpId'] = content.corpId;
        config['agentId'] = content.agentId;
        window.config = config;
        try {
            dd && dd.config(config);
        } catch (e) {
            console.log('dd.config报错：'+JSON.stringify(e))
        }
        //dd.ready
        dd.ready(function(){
            console.log('dd ready');
            if(!window.initSetting){
                window.initSetting = true;
                let device = util.getDevice();
                if(device == 'android'){
                } else if(device == 'iphone'){
                    //禁用iOS webview弹性效果(仅iOS支持) 0.0.5
                    dd.ui.webViewBounce.disable();
                }
                //设置导航栏左侧返回按钮事件
                dd_setLeft();
            }
            //处理业务
            if(window.needAuth){
                window.needAuth = false;
                getAuthCode(function(){
                }, function(){
                    Toast.hide();
                    if(util.getUrlParam('expire')){
                        window.history.go(-1)
                    }else{
                        let url = decodeURIComponent(util.getUrlParam('url'));
                        location.hash = url ? url : '#/';
                    }
                })
            }
        })
    })
    .catch(function (error) {
        console.log(error)
    })

}

/**
 * 获取授权码
 * 成功获取后调用免登接口get_free_login_auth
 * @param {function} cb1 回调函数:获取授权码后调用
 * @param {function} cb2 回调函数:成功免登后调用
 */
let getAuthCode = function (cb1, cb2) {
    console.log('getAuthCode start')
    dd.runtime.permission.requestAuthCode({
        corpId: sessionStorage.getItem('corpId'), //企业id
        onSuccess: function (info) {
            console.log('getAuthCode success:' + info.code);
            //进行免登
            sessionStorage.setItem('code', info.code);
            cb1 && cb1();

            DB.API.get_free_login_auth({
                "code": sessionStorage.getItem('code'),
                "corpId": sessionStorage.getItem('corpId')
            })
            .then(function (content) {
                cb2 && cb2();
            })
            .catch(function (error) {
            })
        },
        onFail: function (err) {
            console.log('requestAuthCode fail: ' + JSON.stringify(err));
            dd.device.notification.alert({
                message: "您不是当前企业员工",
                title: "提示",
                buttonName: '知道了',
                onSuccess : function() {
                    // 关闭页面
                    dd.biz.navigation.close({
                        onSuccess : function(result) {
                            console.log('dd.biz.navigation.close success')
                        },
                        onFail : function(err) {
                            console.log('dd.biz.navigation.close fail:' +JSON.stringify(err))
                        }
                    })
                },
                onFail : function(err) {
                }
            });
        }
    });
}

/**
 * 获取用户反馈式临时授权码
 * 成功获取后调用send_corp_msg_by_code发送oa信息
 * @param {object} params oa信息参数
 */
let getRequestOperateAuthCode = function (params) {
    dd.runtime.permission.requestOperateAuthCode({
        corpId: sessionStorage.getItem('corpId'),
        agentId: sessionStorage.getItem('agentId'),
        onSuccess: function(result) {
            DB.API.send_corp_msg_by_code({
                "code": result.code,
                "agentid": sessionStorage.getItem('agentId'), //企业当前使用应用的agentId，如不传，则默认使用有成会议的agentId
                "userIdArray": params.userIdArray, //员工id列表,消息接收者
                "messageType": 'oa', //text|image|voice|file|link|oa
                "msgContents": params.msgContents //消息体
            })
            .then(function(content) {
                console.log('消息发送成功')
            })
            .catch(function(error) {
                console.log('消息发送失败', error);
            })
        },
        onFail : function(err) {
            console.log(err)
        }

    })
}

/**
 * 打开应用内页面
 * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.vr9W11&treeId=171&articleId=104919&docType=1
 * @param {any} name
 * @param {any} params
 */
let open = function (name, params, cd, errorCb) {
    dd.biz.util.open({
        name: name,//页面名称
        params: params,//传参
        onSuccess : function() {
            /**/
            console.log('open success')
            cd && cd();
        },
        onFail : function(err) {
            console.log('open fail')
            errorCb && errorCb()
        }
    });
}

/**
 * 设置导航栏返回按钮点击事件
 * @param {any} params
 */
let dd_setLeft = function (cb){
    let device = util.getDevice();
    if(device == 'android'){
        document.addEventListener('backbutton', function(e) {
            // 在这里处理你的业务逻辑
            //backbutton事件的默认行为是回退历史记录，如果你想阻止默认的回退行为，那么可以通过preventDefault()实现
            if(cb){
                cb();
                return;
            }
            var href = location.href;
            if(href.indexOf('#/?')>-1
            ||href.indexOf('#/home?')>-1
            ||href.indexOf('#/mymeeting?')>-1
            ||href.indexOf('#/set?')>-1
            ||href.indexOf('#/checkinresult')>-1
            ||href.indexOf('#/matchmeetingroom')>-1
            ||href.indexOf('#/meetingtemplate?')>-1) {
                dd.biz.navigation.close({
                    onSuccess : function(result) {
                        console.log('dd.biz.navigation.close success')
                    },
                    onFail : function(err) {
                        console.log('dd.biz.navigation.close fail:' +JSON.stringify(err))
                    }
                })
                e.preventDefault();
            }else if(href.indexOf('#/meetingdetail/')>-1){
                e.preventDefault();
                location.hash = "/mymeeting";
            }else if(href.indexOf('#/approve/')>-1){
                e.preventDefault();
                location.hash = "/set";
            }else if(href.indexOf('#/manage')>-1){
                e.preventDefault();
                location.hash = "/set";
            }else if(href.indexOf('#/approvedetail')>-1 && href.indexOf('/approvalApply')>-1){
                e.preventDefault();
                location.hash = "/approve/approvalApply";
            }else if(href.indexOf('#/approvedetail')>-1 && href.indexOf('/myApproval')>-1){
                e.preventDefault();
                location.hash = "/approve/myApproval";
            }else if(href.indexOf('#/addroomplace')>-1){
                e.preventDefault();
                window.history.go(util.getUrlParam('SEARCH_BAR') ? -2 : -1);
            }else if(href.indexOf('/meetingtemplatedetail')>-1){
                e.preventDefault();
                location.hash = "/meetingtemplate";
            }else if(href.indexOf('#/addmeeting')>-1){
                e.preventDefault();
                let ifExit = sessionStorage.getItem("confirm");
                if(ifExit){
                    dd.device.notification.confirm({
                        message: "当前会议预约未完成，确定退出吗？",
                        title: "提示",
                        buttonLabels: ['取消','确定'],
                        onSuccess : function(result) {
                            if(result.buttonIndex == 1) {
                                sessionStorage.removeItem("confirm")
                                // location.hash = "/";
                                window.history.go(-1)
                            }
                        },
                        onFail : function(err) {}
                    });
                }else{
                    // location.hash = "/";
                    window.history.go(-1)
                }
            }else if(href.indexOf('#/addroom/')>-1 ||href.indexOf('#/addroom/')>-1){
                e.preventDefault();
                let ifExit = sessionStorage.getItem("addRoomConfirm");
                if(ifExit){
                    dd.device.notification.confirm({
                        message: "当前会议室信息未保存，确定退出吗？",
                        title: "提示",
                        buttonLabels: ['取消','确定'],
                        onSuccess : function(result) {
                            if(result.buttonIndex == 1) {
                                sessionStorage.removeItem("addRoomConfirm")
                                location.hash = "/manage";
                            }
                        },
                        onFail : function(err) {}
                    });
                }else{
                    location.hash = "/manage";
                }
            }else if(href.indexOf('#/addnewoption/')>-1 || href.indexOf('#/addnewoption?')>-1){
                e.preventDefault();
                let ifExit = sessionStorage.getItem("addNewOptionConfirm");
                if(ifExit){
                    dd.device.notification.confirm({
                        message: "您还没有保存当前内容，确定退出吗？",
                        title: "提示",
                        buttonLabels: ['取消','确定'],
                        onSuccess : function(result) {
                            if(result.buttonIndex == 1) {
                                sessionStorage.removeItem("addNewOptionConfirm")
                                window.history.go(-1)
                            }
                        },
                        onFail : function(err) {}
                    });
                }else{
                    window.history.go(-1)
                }
            }
        });
    } else if(device == 'iphone'){
        //控制ios的返回按钮
        dd.biz.navigation.setLeft({
            show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
            control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
            showIcon: true,//是否显示icon，true 显示， false 不显示，默认true； 注：具体UI以客户端为准
            text: '返回',//控制显示文本，空字符串表示显示默认文本
            onSuccess : function(result) {
                //如果control为true，则onSuccess将在发生按钮点击事件被回调
                //1级类目点击返回退出应用
                if(cb){
                    cb();
                    return;
                }
                var href = location.href;
                if(href.indexOf('#/?')>-1
                ||href.indexOf('#/home?')>-1
                ||href.indexOf('#/mymeeting?')>-1
                ||href.indexOf('#/set?')>-1
                ||href.indexOf('#/checkinresult')>-1
                ||href.indexOf('#/matchmeetingroom')>-1
                ||href.indexOf('#/meetingtemplate?')>-1) {
                    dd.biz.navigation.close({
                        onSuccess : function(result) {
                            console.log('dd.biz.navigation.close success')
                        },
                        onFail : function(err) {
                            console.log('dd.biz.navigation.close fail:' +JSON.stringify(err))
                        }
                    })
                }else if(href.indexOf('#/meetingdetail/')>-1){
                    location.hash = "/mymeeting";
                }else if(href.indexOf('#/approve/')>-1){
                    location.hash = "/set";
                }else if(href.indexOf('#/manage')>-1){
                    location.hash = "/set";
                }else if(href.indexOf('#/approvedetail')>-1 && href.indexOf('/approvalApply')>-1){
                    location.hash = "/approve/approvalApply";
                }else if(href.indexOf('#/approvedetail')>-1 && href.indexOf('/myApproval')>-1){
                    location.hash = "/approve/myApproval";
                }else if(href.indexOf('#/addroomplace')>-1){
                    window.history.go(util.getUrlParam('SEARCH_BAR') ? -2 : -1);
                }else if(href.indexOf('/meetingtemplatedetail')>-1){
                    location.hash = "/meetingtemplate";
                }else if(href.indexOf('#/addmeeting')>-1){
                    let ifExit = sessionStorage.getItem("confirm");
                    if(ifExit){
                        dd.device.notification.confirm({
                            message: "当前会议预约未完成，确定退出吗？",
                            title: "提示",
                            buttonLabels: ['取消','确定'],
                            onSuccess : function(result) {
                                if(result.buttonIndex == 1) {
                                    sessionStorage.removeItem("confirm")
                                    window.history.go(-1)
                                }
                            },
                            onFail : function(err) {}
                        });
                    }else{
                        window.history.go(-1)
                    }
                }else if(href.indexOf('#/addroom/')>-1 || href.indexOf('#/addroom?')>-1){
                    let ifExit = sessionStorage.getItem("addRoomConfirm");
                    if(ifExit){
                        dd.device.notification.confirm({
                            message: "当前会议室信息未保存，确定退出吗？",
                            title: "提示",
                            buttonLabels: ['取消','确定'],
                            onSuccess : function(result) {
                                if(result.buttonIndex == 1) {
                                    sessionStorage.removeItem("addRoomConfirm")
                                    // window.history.go(-1)
                                    location.hash = '/manage'
                                }
                            },
                            onFail : function(err) {}
                        });
                    }else{
                        location.hash = '/manage'
                    }
                }else if(href.indexOf('#/addnewoption/')>-1 || href.indexOf('#/addnewoption?')>-1){
                    let ifExit = sessionStorage.getItem("addNewOptionConfirm");
                    if(ifExit){
                        dd.device.notification.confirm({
                            message: "您还没有保存当前内容，确定退出吗？",
                            title: "提示",
                            buttonLabels: ['取消','确定'],
                            onSuccess : function(result) {
                                if(result.buttonIndex == 1) {
                                    sessionStorage.removeItem("addNewOptionConfirm")
                                    window.history.go(-1)
                                }
                            },
                            onFail : function(err) {}
                        });
                    }else{
                        window.history.go(-1)
                    }
                }else {
                    window.history.go(-1)
                }
            },
            onFail : function(err) {
                console.log(JSON.stringify(err))
            }
        });
    }
}

let dingApi = {
    dd_config,
    getAuthCode,
    getRequestOperateAuthCode,
    open,
    dd_setLeft
};
window.dingApi = dingApi;
module.exports = dingApi;
