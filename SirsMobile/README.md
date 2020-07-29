# SIRS Mobile

## Prerequisites

Install **Android SDK** : http://developer.android.com/sdk/installing/index.html

Define **ANDROID_HOME** env variable :
```bash
export ANDROID_HOME=<Path_To_Sdk_Folder>
```
Update the **PATH** :
```bash
export PATH=${PATH}:<Path_To_Sdk_Folder>/platform-tools:<Path_To_Sdk_Folder>/tools
```
Install **Gradle 6.5.1** :
```bash
curl -s "https://get.sdkman.io" | bash
sdk install gradle 6.5.1
```

Install **NodeJs 12.15.0** or greater

Install **Ionic 6.10.1** and **Cordova 9.0.0**:
```bash
npm install -g ionic@6.10.1
npm install -g cordova@9.0.0
```

Install **Capacitor**:
```bash
npm install --save @capacitor/cli @capacitor/core
```

## First installation

Execute this both commands :

```bash
npm install
```

## Launch App on device

**With Capacitor**

```bash
ionic capacitor run android
```



***Error fetch Android Ionic Project***

***if you find this error '(failed)net::ERR_CLEARTEXT_NOT_PERMITTED', ADD THIS***

***in config.xml, in plateform tag***
```xml
<edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application" xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:networkSecurityConfig="@xml/network_security_config" android:usesCleartextTraffic="true" />
</edit-config>
```

***in android/app/src/main/AndroidManifest.xml, in plateform tag***
```
android:usesCleartextTraffic="true"
```
