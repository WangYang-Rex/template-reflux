require('./app.styl');

if (__LOCAL__ && window.chrome && window.chrome.webstore) { // This is a Chrome only hack
    // see https://github.com/livereload/livereload-extensions/issues/26
    setInterval(function() {
        document.body.focus();
    }, 200);
}

// bind fastclick
window.FastClick && FastClick.attach(document.body);
// 应用初始化 免登
let util = require('./util.js');
var _corpId = util.getUrlParam('corpId') || util.getUrlParam('corpId', location.href);
_corpId ? window.sessionStorage.setItem('corpId', _corpId) : null;
//将入口页面url缓存到session
window.sessionStorage.setItem('first_page_url', location.href);
//判断url和cookie是做免登还是只是鉴权
let dingApi = require('./dingApi');
dingApi.dd_config();

const { Router, Route, IndexRoute, Link, hashHistory } = ReactRouter;

const PageHome = require('../pages/home');
const PageLogin = require('../pages/login');
class App extends React.Component {
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

ReactDOM.render(
    <Router history={hashHistory}>
        <Route name="app" path="/" component={App}>
            <IndexRoute component={PageHome}/>
            <Route path="home" component={PageHome}/>
            <Route path="login" component={PageLogin}/>
        </Route>
    </Router>,
    document.getElementById('App')
);
