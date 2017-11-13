require('./PageLogin.styl');
let dingApi = require('../../app/dingApi');

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }
    /**
     * 获取授权码 免登
     *
     * @memberof Login
     */
    doAuth() {
        let t = this;
        //获取corpId
        window.needAuth = true;
        dingApi.dd_config()
    }

    render() {
        return (
            <div className="login">
                <div class="loading">
                页面正在加载中...
                </div>
            </div>
        );
    }

    componentWillMount() {
        util.setTitle('登录')
    }

    componentDidMount() {
        this.doAuth();
    }

    componentWillReceiveProps(nextProps) {
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    componentWillUpdate(nextProps, nextState) {
    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
    }
}

module.exports = Login;
