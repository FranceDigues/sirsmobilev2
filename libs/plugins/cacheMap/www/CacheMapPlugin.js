/**
 * Created by roch dardie on 17/04/15.
 */
var exec = require('cordova/exec');

function CacheMapPlugin() {
    console.log("CacheMapPlugin.js 2 : is created ");
}




CacheMapPlugin.prototype._amplifier = function (info) {
    console.log("firset step");



    if(info.evType === "clearCacheProgress") {
        cordova.fireWindowEvent("clearCacheProgress", info);
        console.log("event recive from android");
        console.log(info);
    }


    if(info.evType === "updateListCache") {
        //FIXME : pk on doit encapsuler ce con d'objet??git commit
        cordova.fireDocumentEvent("updateListCache", {aCaDe:info.aCaDe});
        //MyEvent = new CustomEvent("updateListCache", info);
        //document.dispatchEvent(MyEvent);
        //console.log("event recive from android");
        //console.log(info);
        //console.log( info.aCaDe);
    }
};



CacheMapPlugin.prototype.updateCache = function (cacheArray) {
    console.log("CacheMapPlugin.js: updateCache");
    exec(function (result) {

        //alert("result" + result);
    }, function (result) {
    //alert("Error" + result);
    }, "CacheMapPlugin", "updateCache", cacheArray);
};

CacheMapPlugin.prototype.clearOneCache = function (cache) {
    console.log("CacheMapPlugin.js: initUserData");
    exec(cacheMapPlugin._amplifier, function () {
        console.log("ERROR");
        //alert("Error" + result);
    }, "CacheMapPlugin", "clearOne", [cache]);
};

CacheMapPlugin.prototype.clearCacheList = function (cacheArray) {
    console.log("CacheMapPlugin.js: initUserData");
    exec(cacheMapPlugin._amplifier, function () {
        console.log("ERROR");
        //alert("Error" + result);
    }, "CacheMapPlugin", "clearOne", cacheArray);
};

CacheMapPlugin.prototype.clearAll = function () {
    console.log("CacheMapPlugin.js: initUserData");

    //fixme :  juste pour le debug

    exec(function () {console.log("ERROR");}, function () {console.log("ERROR");}, "CacheMapPlugin", "unregisterReceiver", []);


    //clean
    exec(cacheMapPlugin._amplifier, function () {
        console.log("ERROR");
        //alert("Error" + result);
    }, "CacheMapPlugin", "clearAll", []);
};


CacheMapPlugin.prototype.CaDeListReQuest = function () {
    console.log("CacheMapPlugin.js: request cache List");
    exec(cacheMapPlugin._amplifier, function () {
        console.log("ERROR");
        //alert("Error" + result);
    }, "CacheMapPlugin", "getCaDeList", []);
};











var cacheMapPlugin = new CacheMapPlugin();
//
//var Cache =
//{
//    updateCache : function( success, error )
//    {
//        exec(success, error, "Cache", "updateCache", [])
//
//    },
//    initUserData : function( success, error )
//    {
//        exec(success, error, "Cache", "initUserData", [])
//    }
//}



module.exports = cacheMapPlugin;
