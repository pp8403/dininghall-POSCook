
import { Injectable } from '@angular/core';
import { Platform, AlertController, ToastController, Alert } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
// import {Transfer, TransferObject} from '@ionic-native/transfer';

import { FileOpener } from '@ionic-native/file-opener';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Diagnostic } from '@ionic-native/diagnostic';



import { Observable } from 'rxjs/Rx';

import { CommonProvider } from '../common/common';
import { HttpRequestProvider } from '../../providers/http-request/http-request';
/*
  Generated class for the UpdateProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UpdateProvider {

  alertbox: Alert;
  isDownloading = false;

  interval = null;
  constructor(private platform: Platform,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private transfer: FileTransfer,
    private appVersion: AppVersion,
    private file: File,


    private fileOpener: FileOpener,

    private diagnostic: Diagnostic,
    private inAppBrowser: InAppBrowser,

    private common: CommonProvider,
    private http: HttpRequestProvider, ) {

  }

  init() {
    clearInterval(this.interval);
    this.checkUpdate(false);
    this.interval=setInterval(() => {
      this.checkUpdate(false).then(isneed => {
        console.log("====>checkUpdate:", isneed ? "true" : "false");
      });
    }, 60000);
  }
  getQrCode(): Promise<string> {
    return this.http.Request("GetVersion", {}).then(serverRes => {
      let apkName = serverRes.data.url;
      var apkUrl = "http://" + this.common.APIHost + "/apk/" + encodeURI(apkName);
      return Promise.resolve(apkUrl);
    }, err => { return Promise.reject(err); });
  }
  checkUpdate(isManualCheck = false): Promise<boolean> {

    if (!this.isMobile()) { return Promise.resolve(false); }
    return this.appVersion.getVersionNumber().then(localAPPver => {
      if (localAPPver == null) { return Promise.resolve(false); }
      let params = {
        'versionNo': localAPPver
      };
      return this.http.Request("GetVersion", {}).then(serverRes => {
        if(serverRes.data.version.length<=0) return Promise.resolve(false);
        if (serverRes.data.version == localAPPver) {
          if (isManualCheck == true)
            this.toastCtrl.create({
              message: '已经是最新版',
              duration: 1000,
              position: 'bottom'
            }).present();
          return Promise.resolve(false);
        }


        let apkName = serverRes.data.url;
        let isForce = serverRes.data.isForce === '1';



        var apkUrl = "http://" + this.common.APIHost + "/apk/" + encodeURI(apkName);
        this.downloadApp(apkUrl, serverRes.data.version);
        return Promise.resolve(true);


      }, err => {
        return Promise.resolve(false);
      });
    });


  }


  downloadApp(apkUrl, newVersion) {
    if (this.isDownloading == true) return;
    if (this.isIos()) {
      //this.openUrlByBrowser('https://esquelmobile.github.io/dininghallappdownload/');
      return;
    }
    if (this.isAndroid()) {
      if (!apkUrl) {
        this.alertCtrl.create({
          subTitle: '未找到android apk下载地址',
          buttons: [
            {
              text: '确定'
            }
          ]
        }).present();
        // alert('未找到android apk下载地址');
        return;
      }
      let updateProgress = -1;
      this.externalStoragePermissionsAuthorization().subscribe(() => {
        let alertProg = this.alertCtrl.create({
          title: `正在下载更新(v${newVersion})：0%`,
          enableBackdropDismiss: false
        });
        alertProg.present();
        const fileTransfer: FileTransferObject = this.transfer.create();
        const apkSavePath = this.file.externalDataDirectory + 'download/' + `DiningHall_POS_Update.apk`;  // 下载apk保存的目录

        // alert('路径-apk-->' + apk);
        // 下载并安装apk
        fileTransfer.download(apkUrl, apkSavePath).then(() => {
          alertProg && alertProg.dismiss();
          this.fileOpener.open(apkSavePath, 'application/vnd.android.package-archive').catch(e => {
            this.alertCtrl.create({
              title: '本地升级失败',
              subTitle: '请前往网页下载',
              buttons: [{
                text: '确定', handler: () => {
                  this.openUrlByBrowser(apkUrl); // 打开网页下载
                }
              }
              ]
            }).present();
          });
        }, err => {
          updateProgress = -1;
          alertProg && alertProg.dismiss();
          // this.logger.log(err, 'android app 本地升级失败');
          this.alertCtrl.create({
            title: '本地升级失败',
            subTitle: '请前往网页下载',
            buttons: [{
              text: '确定', handler: () => {
                this.openUrlByBrowser(apkUrl); // 打开网页下载
              }
            }
            ]
          }).present();
        });

        let timer = null; // 由于onProgress事件调用非常频繁,所以使用setTimeout用于函数节流
        fileTransfer.onProgress((event: ProgressEvent) => {
          this.isDownloading = true;
          const progress = Math.floor(event.loaded / event.total * 100); // 下载进度
          updateProgress = progress;
          if (!timer) {
            // 更新下载进度
            timer = setTimeout(() => {
              if (progress === 100) {
                alertProg && alertProg.dismiss();
              } else {
                //alertProg.setTitle(`正在下载：${progress}%`);
                let lstObjAlertTitle = document.getElementsByClassName('alert-title');
                const title = lstObjAlertTitle[lstObjAlertTitle.length - 1];
                title && (title.innerHTML = `正在下载更新(v${newVersion})：${progress}%`);

              }
              clearTimeout(timer);
              timer = null;
            }, 1000);
          }
        });
      });


    }

  }



  /**
   * 通过浏览器打开url
   */
  openUrlByBrowser(url: string): void {
    this.inAppBrowser.create(url, '_system');
  }

  /**
   * 是否真机环境
   * @return {boolean}
   */
  isMobile(): boolean {
    return this.platform.is('mobile') && !this.platform.is('mobileweb');
  }

  /**
   * 是否android真机环境
   * @return {boolean}
   */
  isAndroid(): boolean {
    return this.isMobile() && this.platform.is('android');
  }

  /**
   * 是否ios真机环境
   * @return {boolean}
   */
  isIos(): boolean {
    return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'));
  }


  /**
   * 检测app是否有读取存储权限,如果没有权限则会请求权限
   */
  externalStoragePermissionsAuthorization = (() => {
    let havePermission = false;
    return () => {
      return Observable.create(observer => {
        if (havePermission) {
          observer.next(true);
        } else {
          const permissions = [this.diagnostic.permission.READ_EXTERNAL_STORAGE, this.diagnostic.permission.WRITE_EXTERNAL_STORAGE];
          this.diagnostic.getPermissionsAuthorizationStatus(permissions).then(res => {
            if (res.READ_EXTERNAL_STORAGE == 'GRANTED' && res.WRITE_EXTERNAL_STORAGE == 'GRANTED') {
              havePermission = true;
              observer.next(true);
            } else {
              havePermission = false;
              this.diagnostic.requestRuntimePermissions(permissions).then(res => {// 请求权限
                if (res.READ_EXTERNAL_STORAGE == 'GRANTED' && res.WRITE_EXTERNAL_STORAGE == 'GRANTED') {
                  havePermission = true;
                  observer.next(true);
                } else {
                  havePermission = false;
                  this.alertCtrl.create({
                    title: '缺少读取存储权限',
                    subTitle: '请在设置或app权限管理中开启',
                    buttons: [{ text: '取消' },
                    {
                      text: '去开启',
                      handler: () => {
                        this.diagnostic.switchToSettings();
                      }
                    }
                    ]
                  }).present();
                  observer.error(false);
                }
              }).catch(err => {
                observer.error(false);
              });
            }
          }).catch(err => {
            observer.error(false);
          });
        }
      });
    };
  })();

  /**
   * 获得app版本号,如0.01
   * @description  对应/config.xml中version的值
   * @returns {Promise<string>}
   */
  getVersionNumber(): Promise<string> {
    return new Promise((resolve) => {
      this.appVersion.getVersionNumber().then((value: string) => {
        resolve(value);
      }).catch(err => {
        console.log('getVersionNumber:' + err);
      });
    });
  }
}
