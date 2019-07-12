package com.esquel.dininghall.usbnfc;


import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;


import com.das.dascard.MifareCardProcess;
import com.dk.usbNfc.Card.Mifare;
import com.dk.usbNfc.DeviceManager.ComByteManager;
import com.dk.usbNfc.DeviceManager.DeviceManager;
import com.dk.usbNfc.DeviceManager.DeviceManagerCallback;
import com.dk.usbNfc.DeviceManager.UsbNfcDevice;
import com.dk.usbNfc.Exception.CardNoResponseException;
import com.dk.usbNfc.Exception.DeviceNoResponseException;
import com.dk.usbNfc.Tool.StringTool;

/**
 * This class echoes a string called from JavaScript.
 */
public class DHPOSUsbNfcPlugin extends CordovaPlugin {

    private UsbNfcDevice usbNfcDevice;
    private CallbackContext readCallbackContext;
    private CallbackContext startListenCallbackContext;
    private StringBuffer msgBuffer= new StringBuffer();


    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("Test")) {
            String message = args.getString(0);
            this.Test(message, callbackContext);
            return true;
        } else if (action.equals("StartListen")) {
            this.StartListen(callbackContext);
            return true;
        }else if (action.equals("RegReadCallBack")) {
            this.RegReadCallBack(callbackContext);
            return true;
        }else if (action.equals("UnRegReadCallBack")) {
            this.UnRegReadCallBack();
            return true;
        }
        return false;
    }
    private  void RegReadCallBack(CallbackContext callbackContext){
        this.readCallbackContext=callbackContext;
    }
    private  void UnRegReadCallBack(){
        this.readCallbackContext=null;
    }
    private void Test(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            callbackContext.success("return:" + message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

    private void _StartListen(){
        try {

            // usb_nfc设备初始化
            Activity activity = cordova.getActivity();
            usbNfcDevice = null;
            usbNfcDevice = new UsbNfcDevice(activity.getApplicationContext());
            usbNfcDevice.setCallBack(deviceManagerCallback);

            // if (usbNfcDevice.usbHidManager.mDeviceConnection == null) {
            //     callbackContext.error("未找到USB读卡设备！");
            // }

            // 打开/关闭自动寻卡，100ms间隔，寻M1/UL卡
            boolean isSuc = usbNfcDevice.startAutoSearchCard((byte) 10, ComByteManager.ISO14443_P4);
            if (isSuc) {
                this.startListenCallbackContext.success("已启动USB NFC监听!");
                return;
            } else {
                this.startListenCallbackContext.error("USB NFC监听启动失败!");
            }

        } catch (DeviceNoResponseException ex) {
            Log.e("=============>Exception", ex.getMessage());
            this.startListenCallbackContext.error("USB NFC监听启动失败!"+ex.getMessage());
        } catch (Exception ex) {
            Log.e("=============>Exception", ex.getMessage());
            this.startListenCallbackContext.error("USB NFC监听启动失败!"+ex.getMessage());
        }
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        _StartListen();
    }

    private void StartListen(CallbackContext callbackContext) {
        this.startListenCallbackContext=callbackContext;
        new Thread(new Runnable() {
            @Override
            public void run() {
                _StartListen();
            }
        }).start();
    }

    // ==============================================
    String ByteToStr(int byteSize, byte[] in) {
        String ret = new String("");
        if (in.length < byteSize)
            return ret;

        for (int i = 0; i < byteSize; i++) {
            ret = ret.concat(String.format("%1$02X ", in[i]));
        }
        return ret;
    }

    private DeviceManagerCallback deviceManagerCallback = new DeviceManagerCallback() {

        @Override
        public void onReceiveInitCiphy(boolean blnIsInitSuc) {
            super.onReceiveInitCiphy(blnIsInitSuc);
        }

        @Override
        public void onReceiveDeviceAuth(byte[] authData) {
            super.onReceiveDeviceAuth(authData);
        }

        @Override
        // 寻到卡片回调
        public void onReceiveRfnSearchCard(boolean blnIsSus, int cardType, byte[] bytCardSn, byte[] bytCarATS) {
            super.onReceiveRfnSearchCard(blnIsSus, cardType, bytCardSn, bytCarATS);
            if (!blnIsSus || cardType == UsbNfcDevice.CARD_TYPE_NO_DEFINE) {
                return;
            }

            final int cardTypeTemp = cardType;
            new Thread(new Runnable() {
                @Override
                public void run() {
                    boolean isReadWriteCardSuc;
                    try {
                        
                        if (usbNfcDevice.isAutoSearchCard()) {
                            // 如果是自动寻卡的，寻到卡后，先关闭自动寻卡
                            usbNfcDevice.stoptAutoSearchCard();
                            isReadWriteCardSuc = readWriteCardDemo(cardTypeTemp);

                            // 读卡结束，重新打开自动寻卡
                            startAutoSearchCard();
                        } else {
                            isReadWriteCardSuc = readWriteCardDemo(cardTypeTemp);

                            // 如果不是自动寻卡，读卡结束,关闭天线
                            usbNfcDevice.closeRf();
                        }

                        // 打开蜂鸣器提示读卡完成
                        if (isReadWriteCardSuc) {
                            usbNfcDevice.openBeep(50, 50, 3); // 读写卡成功快响3声
                        } else {
                            usbNfcDevice.openBeep(100, 100, 2); // 读写卡失败慢响2声
                        }
                    } catch (DeviceNoResponseException e) {
                        e.printStackTrace();
                    }
                }
            }).start();
        }

        @Override
        public void onReceiveRfmSentApduCmd(byte[] bytApduRtnData) {
            super.onReceiveRfmSentApduCmd(bytApduRtnData);

            System.out.println("Activity接收到APDU回调：" + StringTool.byteHexToSting(bytApduRtnData));
        }

        @Override
        public void onReceiveRfmClose(boolean blnIsCloseSuc) {
            super.onReceiveRfmClose(blnIsCloseSuc);
        }

        @Override
        // 按键返回回调
        public void onReceiveButtonEnter(byte keyValue) {
            if (keyValue == DeviceManager.BUTTON_VALUE_SHORT_ENTER) { // 按键短按
                System.out.println("Activity接收到按键短按回调");
            } else if (keyValue == DeviceManager.BUTTON_VALUE_LONG_ENTER) { // 按键长按
                System.out.println("Activity接收到按键长按回调");
            }
        }
    };

    private boolean startAutoSearchCard() throws DeviceNoResponseException {

        // 打开自动寻卡，300ms间隔，寻M1/UL卡
        boolean isSuc = false;
        int falseCnt = 0;
        do {
            isSuc = usbNfcDevice.startAutoSearchCard((byte) 30, ComByteManager.ISO14443_P4);
        } while (!isSuc && (falseCnt++ < 10));
        if (!isSuc) {
            Log.e("=============>Exception", "不支持自动寻卡！");
        }
        return isSuc;
    }

    private boolean readWriteCardDemo(int cardType) {
        if(cardType==DeviceManager.CARD_TYPE_MIFARE){ //寻到Mifare卡
            final Mifare mifare = (Mifare) usbNfcDevice.getCard();
            if (mifare != null) {

                byte[ ]  key  =  new  byte[6];			//密钥计算结果
                key  =  MifareCardProcess. calculateKey(mifare.uid);	//计算认证密钥
                //byte[] key = {(byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff, (byte) 0xff};
                try {
                    boolean anth = mifare.authenticate((byte) 12, Mifare.MIFARE_KEY_TYPE_A, key);
                    if (anth) {
                        byte[] readDataBytes = mifare.read((byte) 12);
                        long esquelSN=MifareCardProcess. getCardNumber(readDataBytes);

                        msgBuffer.delete(0, msgBuffer.length());
                        msgBuffer.append(esquelSN);
                        handlerReadCallBack.sendEmptyMessage(1);
                    }
                    else {
                        msgBuffer.delete(0, msgBuffer.length());
                        //msgBuffer.append("USB NFC读卡失败，请重试！the key authentication failed！");
                        msgBuffer.append("读卡失败，请重新刷卡！Please try again！0");
                        handlerReadCallBack.sendEmptyMessage(0);
                        return false;
                    }
                } catch (CardNoResponseException e) {
                    msgBuffer.delete(0, msgBuffer.length());
                    //msgBuffer.append("USB NFC读卡失败，请重试！" + e.getMessage());
                    msgBuffer.append("读卡失败，请重新刷卡！Please try again！1");
                    handlerReadCallBack.sendEmptyMessage(0);
                    return false;
                }catch (Exception e) {
                    msgBuffer.delete(0, msgBuffer.length());
                    //msgBuffer.append("USB NFC读卡失败，请重试！" + e.getMessage());
                    msgBuffer.append("读卡失败，请重新刷卡！Please try again！2");
                    handlerReadCallBack.sendEmptyMessage(0);
                    return false;
                }
            }
        }
        return true;
    }

    private Handler handlerReadCallBack = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case 0:
                    if(readCallbackContext!=null) {
                        //readCallbackContext.error(msgBuffer.toString());
                        PluginResult mPlugin = new PluginResult(PluginResult.Status.ERROR,
                                msgBuffer.toString());
                        mPlugin.setKeepCallback(true);
                        readCallbackContext.sendPluginResult(mPlugin);
                    }
                    break;
                case 1:
                    if(readCallbackContext!=null) {
                        //readCallbackContext.success(msgBuffer.toString());
                        PluginResult mPlugin = new PluginResult(PluginResult.Status.OK,
                                msgBuffer.toString());
                        mPlugin.setKeepCallback(true);
                        readCallbackContext.sendPluginResult(mPlugin);
                    }
                    break;

            }
        }
    };

}