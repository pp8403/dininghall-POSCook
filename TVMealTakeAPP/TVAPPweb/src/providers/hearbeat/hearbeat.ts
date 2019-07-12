
import { Injectable } from '@angular/core';

import { CommonProvider } from '../common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';
import { SettimeoutProvider } from '../settimeout/settimeout';
/*
  Generated class for the HearbeatProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
declare let android: any;
@Injectable()
export class HearbeatProvider {
  private settimeoutTAG="Heartbeat";
  stopFlag = false;
  //interval = null;
  Period = 10;//心跳周期(秒)
  ErrorTimesThenJump = 6;//心跳失败N次后跳转到home

  RequestErrorCount = 0;

  constructor(
    private common: CommonProvider,
    private http: HttpRequestProvider,
    private settimeout:SettimeoutProvider,
  ) {

  }


  Request() {
    this.settimeout.clearSingle(this.settimeoutTAG);
    this.http.Request("Heartbeat", {}).then(res => {
      this.RequestErrorCount = 0;

      var msg = res.msg;
      switch (msg) {
        case "normal":
          this.common.GetStorage(this.common.LSName_curMealName).then(curMealName => {
            this.common.GetStorage(this.common.LSName_cantingName).then(cantingName => {
              this.common.GetStorage(this.common.LSName_machineName).then(machineName => {
                this.common.GetStorage(this.common.LSName_refreshValue).then(refreshValue => {
                        if (curMealName !== res.data.curMealName ||
                          cantingName !== res.data.cantingName ||
                          machineName !== res.data.machineName ||
                          refreshValue !== res.data.refreshval 
                        ) {
                          this.stop();
                          this.common.GotoBasePage();
                          android.refresh();
                        } else {
                          if (this.stopFlag == false) {
                            this.settimeout.regActionSingle(this.settimeoutTAG,()=>{
                              this.Request();
                            },this.Period * 1000);
                            
                          }
                        }
                });
              });
            });
          });

          break;
        default:

          this.common.Toast(msg);
          break;
      }
    }, err => {
      console.log("===>heartbeat return error:",this.RequestErrorCount,err);
      this.RequestErrorCount++;
      if (this.RequestErrorCount > this.ErrorTimesThenJump) {
        this.stop();
        this.common.GotoBasePage();
      }else{
        if (this.stopFlag == false) {

          this.settimeout.regActionSingle(this.settimeoutTAG,()=>{
            this.Request();
          },this.Period * 1000);
        }
      }
    });
  }

  start() {
    this.stop();
    this.RequestErrorCount = 0;
    this.stopFlag = false;
    this.Request();
  }
  stop() {
    this.stopFlag = true;
    this.settimeout.clearSingle(this.settimeoutTAG);
  }
}
