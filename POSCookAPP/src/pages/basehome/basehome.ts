import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Device } from '@ionic-native/device';

import { CommonProvider } from '../../providers/common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';



import { HearbeatProvider } from '../../providers/hearbeat/hearbeat';
import { UpdateProvider } from '../../providers/update/update';
import { SettimeoutProvider } from '../../providers/settimeout/settimeout';


@IonicPage()
@Component({
  selector: 'page-basehome',
  templateUrl: 'basehome.html'
})
export class BasehomePage {

  msgArr = [];
  constructor(public navCtrl: NavController,
    private common: CommonProvider,
    private device: Device,
    private http: HttpRequestProvider,
    
    
    private heartbeat: HearbeatProvider,
    private update: UpdateProvider,
    private settimeout: SettimeoutProvider
  ) {

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
      this.msgArr.push({ type: 0, msg: "正在检测设备UUID..." });
      return this.common.GetStorage(this.common.LSName_UUID).then(uuid => {
        if (uuid == null) {
          uuid = this.device.uuid;
          if (uuid == null || (uuid + '').trim().length <= 0) uuid = this.common.GetRandomStr(12);
          return this.common.SetStorage(this.common.LSName_UUID, uuid).then(() => {
            return Promise.resolve(uuid);
          });
        }
        return Promise.resolve(uuid);
      });
    }).then(uuid => {
      this.msgArr.push({ type: 1, msg: `设备UUID为:${uuid}。` });
      this.msgArr.push({ type: 0, msg: "正在检测接口请求地址..." });
      return this.common.GetStorage(this.common.LSName_APIURL);
    }).then(apiurl => {
      this.msgArr.push({ type: 1, msg: `接口请求地址为:${apiurl}。` });
      this.msgArr.push({ type: 0, msg: "正在检测接口连接情况..." });
      return this.http.Request("test", {});
    }).then(suc => {
      this.msgArr.push({ type: 1, msg: `接口连接正常。` });
      

      this.http.Request("Heartbeat", {}).then(heartbeatPack => {
        this.msgArr.push({ type: 1, msg: `获取远程配置完毕（配置情况可在设置中查看）` });
        this.common.SetStorage(this.common.LSName_curMealName, heartbeatPack.data.curMealName).then(() => {
          return this.common.SetStorage(this.common.LSName_cantingName, heartbeatPack.data.cantingName);
        }).then(() => {
          return this.common.SetStorage(this.common.LSName_machineName, heartbeatPack.data.machineName);
        }).then(() => {
          return this.common.SetStorage(this.common.LSName_refreshValue, heartbeatPack.data.refreshval);
        }).then(() => {
          
          
          
          this.msgArr.push({ type: 0, msg: "正在开启自动更新服务..." });
          this.update.init();
          this.msgArr.push({ type: 0, msg: "正在启动心跳包..." });
          // this.heartbeat.start();

          this.msgArr.push({ type: 0, msg: "正在检查远程配置..." });
          //判断设置跳转到首页
          this.settimeout.regAction(() => {
            this.common.GotoHomePage().then(suc => {
              this.heartbeat.start();
            }, err => {
              this.msgArr.push({ type: 2, msg: err });
              this.common.Alert(`尚未对该设备设置窗口类型!`, () => {
                this.settimeout.clear();
                this.gotoSysSetting();
              }, "远程配置错误", "查看配置");

              this.settimeout.regAction(() => {
                this.loadDate();
              }, 30000);
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
      this.common.Alert(`请检查网络情况和系统配置是否正常！`, () => {
        this.settimeout.clear();
        this.gotoSysSetting();
      }, "接口连接异常", "接口设置");

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
