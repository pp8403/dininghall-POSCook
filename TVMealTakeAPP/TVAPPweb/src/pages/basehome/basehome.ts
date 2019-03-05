import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';


import { CommonProvider } from '../../providers/common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';


import { HearbeatProvider } from '../../providers/hearbeat/hearbeat';
import { SettimeoutProvider } from '../../providers/settimeout/settimeout';


@IonicPage()
@Component({
  selector: 'page-basehome',
  templateUrl: 'basehome.html'
})
export class BasehomePage {

  msgArr = [];
  //private interval = null;

  constructor(public navCtrl: NavController,
    private common: CommonProvider,

    private http: HttpRequestProvider,
    private heartbeat: HearbeatProvider,
    private settimeout:SettimeoutProvider,
  ) {
    window['TVHomePage'] = this;
    let urluuid=this.common.getQueryString("uuid");
    if(urluuid) this.common.SetStorage(this.common.LSName_UUID, urluuid);
  }

  _TouchPage(): number {
    return 1;
  }

  ionViewDidEnter() {
    this.heartbeat.stop();
    
    this.settimeout.regAction(() => {
      this.loadDate();
    }, 300);
  }

  loadDate() {
    //window.location.href="http://"+window.location.host+"/#/secondscreen-home";
    //if(1==1) return;
    this.msgArr = [];
    this.msgArr.push({ type: 0, msg: "正在初始化数据,请稍候......" });
    this.common.SetStorage(this.common.LSName_curMealName, '').then(() => {
      return this.common.SetStorage(this.common.LSName_cantingName, '');
    }).then(() => {
      return this.common.SetStorage(this.common.LSName_machineName, '');
    }).then(() => {
      return this.common.SetStorage(this.common.LSName_refreshValue, null);
    }).then(() => {
      this.msgArr.push({ type: 0, msg: "正在获取UUID..." });
      return this.common.GetStorage(this.common.LSName_UUID).then(uuid => {
        console.log("===>LSName_UUID",uuid);
        if (uuid == null || (uuid + '').trim().length <= 0) {
          uuid = this.common.getQueryString("uuid");
          if (uuid == null || (uuid + '').trim().length <= 0)
            return Promise.reject('empty uuid');
        }
        return Promise.resolve(uuid);
      });
    }).then(uuid => {
      this.msgArr.push({ type: 1, msg: `设备UUID为:${uuid}。` });
      this.msgArr.push({ type: 0, msg: "正在检测接口请求地址..." });
      this.common.GetStorage(this.common.LSName_APIURL).then(apiurl => {
        this.msgArr.push({ type: 1, msg: `接口请求地址为:${apiurl}。` });
        this.msgArr.push({ type: 0, msg: "正在检测接口连接情况..." });
        return this.http.Request("test", {});
      }).then(suc => {
        this.msgArr.push({ type: 1, msg: `接口连接正常。` });
        this.msgArr.push({ type: 0, msg: "正在获取远程配置..." });
  
        this.http.Request("Heartbeat", {}).then(heartbeatPack => {
          this.msgArr.push({ type: 1, msg: `获取远程配置完毕` });
          this.common.SetStorage(this.common.LSName_curMealName, heartbeatPack.data.curMealName).then(() => {
            return this.common.SetStorage(this.common.LSName_cantingName, heartbeatPack.data.cantingName);
          }).then(() => {
            return this.common.SetStorage(this.common.LSName_machineName, heartbeatPack.data.machineName);
          }).then(() => {
            return this.common.SetStorage(this.common.LSName_refreshValue, heartbeatPack.data.refreshval);
          }).then(() => {
            this.msgArr.push({ type: 0, msg: "正在启动心跳包..." });
            //this.heartbeat.start();
  
            this.msgArr.push({ type: 0, msg: "正在检查远程配置..." });
            //判断设置跳转到首页
            this.settimeout.regAction(() => {
              this.common.GotoHomePage().then(suc => { 
                this.heartbeat.start();
              });
            }, 2000);
          });
        }, error => {
          this.msgArr.push({ type: 2, msg: `获取远程配置失败!!!` });
          this.msgArr.push({ type: 2, msg: error });
          this.common.Alert(error);
          
          this.settimeout.regAction(() => {
            this.loadDate();
          }, 30000);
        });
      }, error => {
        this.msgArr.push({ type: 2, msg: `接口连接失败!!!` });
        this.msgArr.push({ type: 2, msg: error });
        this.common.Alert(`请检查网络情况和系统配置是否正常！`);
        
        this.settimeout.regAction(() => {
          this.loadDate();
        }, 30000);
      });
    }, error => {
      this.msgArr.push({ type: 2, msg: `获取UUID失败!!!` });
      this.common.Alert(`获取UUID失败!!!`);
      this.settimeout.regAction(() => {
        this.loadDate();
      }, 30000);
    });
  }


  ionViewWillLeave() {
    // 清除定时器
    this.settimeout.clear();
    console.log("===>BaseHompe page leave...");
  }

  gotoSysSetting() {
    //this.navCtrl.setRoot("SettingPage");
    this.navCtrl.push("SettingPage");
  }

}
