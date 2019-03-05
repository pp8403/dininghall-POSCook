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

  public Request(action: string, param: any): Promise<any> {
    return this.httpPost(action, param).then(re => {
      if (re.success == false) {
        return Promise.reject("___" + re.msg);
      }
      else
        return Promise.resolve(re);
    }, error => {
      return Promise.reject(error);
    }).then(re => {
      return Promise.resolve(re);
    }, error => {
      console.log("===>return error:", error);
      let msg = error;

      if ((error + "").startsWith("___")) {
        msg = (error + "").substr(3);
        //this.common.Alert(msg);

        // let msgArr = [];
        // msgArr.push(msg);
        // this.common.GotoErrorPage("错误提示", msgArr);
        this.common.Toast(msg);
      }
      else {
        this.common.Toast(msg,'bottom');
      }
      return Promise.reject(msg);
    });
  }

  private httpPost(actioin: string, postBody: any) {
    return this.common.GetStorage(this.common.LSName_APIURL).then(apihost => {
      return this.common.GetStorage(this.common.LSName_UUID).then(uuid => {
        // let apiurl = "http://" + apihost;
        // apiurl += "/posjk?_action=tv_" + actioin;

        let apiurl=AppConfig.APIUrlFormat.replace('{url}',apihost).replace('{action}',actioin);

        let options = {
          headers: {
            'Content-Type': 'application/json',
            //'token': '111'
          }
        };

        postBody._tvid = uuid;

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
    return Promise.reject(msg);
  }
}
