import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CommonProvider } from '../common/common';
import { AppConfig } from '../../app/AppConfig';

/*
  Generated class for the HttpRequestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HttpRequestProvider {

  constructor(
    private http: HttpClient,
    private common: CommonProvider,
  ) {


  }

  public Request(action: string, param: any, ignoreErrMsg:boolean=false): Promise<any> {
    return this.httpPost(action, param).then(re => {
      if (re.success == false) {
        return Promise.reject({ 'msg': re.msg, 'type': 'api', 'ignoreErrMsg': re.ignoreErrMsg });//接口返回错误提示
      }
      else
        return Promise.resolve(re);
    }, error => {
      return Promise.reject(error);
    }).then(re => {
      return Promise.resolve(re);
    }, error => {
      console.log("===>return error:", error);
      let msg = error.msg;

      if (ignoreErrMsg==false && error.ignoreErrMsg !=true) {
        if (error.type == 'api') {
          this.common.Toast(msg);
        }
        else {
          this.common.Toast(`[${error.type}]${msg}`, 'bottom');
        }
      }
      return Promise.reject(msg);
    });
  }

  private httpPost(actioin: string, postBody: any) {
    return this.common.GetStorage(this.common.LSName_APIURL).then(apihost => {
      return this.common.GetStorage(this.common.LSName_UUID).then(uuid => {
        // let apiurl = "http://" + apihost;
        // apiurl += "/api/pos/?_action=" + actioin;
        //apihost='172.16.73.230:1788';
        let apiurl=AppConfig.APIUrlFormat.replace('{url}',apihost).replace('{action}',actioin);
        let options = {
          headers: {
            'Content-Type': 'application/json',
            //'token': '111'
          }
        };

        postBody._mid = uuid;

        console.log("===>Post:", apiurl, "body:", JSON.stringify(postBody));
        return this.http.post(apiurl, postBody, options).toPromise()
          .then(res => {
            console.log("===>", "Response:", apiurl, "body:", JSON.stringify(res));
            return Promise.resolve(res);
          })
          .catch(err => {
            return this.handleError(err);
          });
      });
    });

  }
  private extractData(res: Response) {
    console.log("===>", "Response:", res);

    //var re = res.text() ? res.json() : {};
    return Promise.resolve(res);
  }

  private handleError(error: Response | any): Promise<any> {

    console.log("===>Http error:", error);
    // if (error.status == 200) {
    //   return Promise.resolve("success");
    // }
    let msg = '';
    if (typeof error.text == typeof '') msg = error.text;
    else if (typeof error.message == typeof '') msg = error.message;
    else msg = 'error:' + JSON.stringify(error);
    return Promise.reject({ 'msg': msg, 'type': 'http', 'ignoreErrMsg': false });
  }
}
