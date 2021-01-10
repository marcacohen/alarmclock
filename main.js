const { app, session, BrowserWindow } = require('electron')

//app.commandLine.appendSwitch('disk-cache-dir', '/dev/null');
//app.commandLine.appendSwitch('disk-cache-size', '1');
//app.commandLine.appendSwitch('disable-site-isolation-for-policy');
//app.commandLine.appendSwitch('disable-web-security', "1");

let win

function createWindow() {
  win = new BrowserWindow()
  win.loadFile('src/index.html');
}

app.on('widevine-ready', (version, lastVersion) => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.77 Mobile Safari/537.36';
    //details.requestHeaders['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    details.requestHeaders['Referer'] = 'http://localhost:8000/';
    details.requestHeaders['Accept-Language'] = 'en-US,en;q=0.9';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  createWindow();
});
