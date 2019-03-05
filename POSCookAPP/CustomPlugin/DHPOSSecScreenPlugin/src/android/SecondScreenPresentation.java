package com.esquel.dininghall.secondscreen;

import android.app.Activity;
import android.app.Presentation;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.Display;
import android.view.ViewGroup.LayoutParams;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/**
 * 
 * This class is responsible to display the WebView of the presenting page on the connected Presentation Display.
 *
 */
public class SecondScreenPresentation extends Presentation {
	private static String DEFAULT_DISPLAY_URL="about:blank";
	private WebView webView;

	private Activity outerContext;
	private String displayUrl;
	private  String receiveMsgFun;
	/**
	 * @param outerContext the parent activity
	 * @param display the {@link Display} associated to this presentation
	 * @param displayUrl the URL of the display html page to present on the display as default page 
	 */
	public SecondScreenPresentation(Activity outerContext, Display display, String displayUrl,String receiveMsgFun) {
		super(outerContext, display);
		this.outerContext = outerContext;
		this.displayUrl = displayUrl == null? DEFAULT_DISPLAY_URL: displayUrl;//+"#"+display.getName();
		this.receiveMsgFun=receiveMsgFun;

		setContentView(getWebView());
		loadUrl(getDisplayUrl());
	}
	
	/**
	 * set webview as content view of the presentation 
	 * @see android.app.Dialog#onCreate(Bundle)
	 */
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
	}
	
	/**
	 * destroy webview on stop
	 * @see Presentation#onStop()
	 */
	protected void onStop() {
		getWebView().destroy();
		super.onStop();
	}
	

	public WebView getWebView() {
		if (webView == null) {
			webView = new WebView(this.getContext());
			webView.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
			webView.getSettings().setJavaScriptEnabled(true);
			webView.getSettings().setAppCacheEnabled(false);
			webView.getSettings().setLoadsImagesAutomatically(true);
			webView.getSettings().setAllowFileAccess(true);
			webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
			webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
			webView.getSettings().setDomStorageEnabled(true);
			webView.getSettings().setDatabaseEnabled(true);
			webView.getSettings().setUserAgentString("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36");
			webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
			webView.getSettings().setLoadWithOverviewMode(true);
		    webView.getSettings().setUseWideViewPort(true);
			webView.setWebViewClient(new WebViewClient() {	
				@Override
				public void onPageStarted(WebView view, String url,Bitmap favicon) {
					super.onPageStarted(view, url, favicon);
				}
				@Override
				public void onPageFinished(WebView view, String url) {
					super.onPageFinished(view, url);
				}
			});
			webView.addJavascriptInterface(new Object(){
				@JavascriptInterface
				public void setOnPresent() {

				}
				@JavascriptInterface
				public void close(String sessId) {

				}
				@JavascriptInterface
				public void postMessage(String sessId, String msg) {

				}
			}, "NavigatorPresentationJavascriptInterface");
			
		}
		return webView;
	}
	
    public  void ReceiveMsg(String msg){
		String script=this.receiveMsgFun.replaceAll("\\[msg\\]",msg);

		Log.e("=========>SecondScreen","接到消息:执行"+script);
		webView.evaluateJavascript(script, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String s) {
            	//if(s!=null)
                //	Toast.makeText(outerContext, "返回值:"+s, Toast.LENGTH_LONG).show();
            }
        });
    }
	
	/**
	 * @return the parent {@link Activity} associated with this presentation
	 */
	public Activity getOuterContext() {
		return outerContext;
	}
	
	/**
	 * @param url the url of the page to load
	 */
	public void loadUrl(final String url){
		if (getDisplay() != null) {
			getOuterContext().runOnUiThread(new Runnable() {
				@Override
				public void run() {
					getWebView().loadUrl(url);
				}
			});
		}
	}
	
	/**
	 * @return the URL of the display html page
	 */
	public String getDisplayUrl() {
		return displayUrl;
	}
}
