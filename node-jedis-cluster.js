/**
 * Created by 15050971 on 2015/11/4.
 */

var os = require('os');
var algo;
os.platform() == "win32"?
    algo = require("./build/Release/MurMurHash.node"):
    algo = require("./build_linux/Release/MurMurHash.node");


var re = {};

re.shardConfig = [];

//key 数组 排序 二分查找
var hashKeys = [];

var genNode = function(hashKey,shardIndex){
    //符号 前部 后部
    var node ;
    if(hashKey.length>=7) {
        var bp = hashKey.slice(-5),
            fp = hashKey.slice(0, -5),
            isNegative = parseFloat(fp) < 0 ? 1 : 0;

        node = {
            fp: parseFloat(fp),//首部
            bp: isNegative ? -parseFloat(bp) : parseInt(bp),//尾部
            key: hashKey,
            shardIndex: shardIndex
        };
    }else{
        node = {
            fp:parseFloat(hashKey),//首部
            bp: 0,//尾部
            key: hashKey,
            shardIndex: shardIndex
        };
    }
    return node;
};

//插入一个节点到哈希值数组
var insertHashKeys = function(hashKey,shardIndex){
    var node = genNode(hashKey,shardIndex);
    hashKeys.push(node);
};

//比较第一个key是否大于第二个
var compareKey = function(k1,k2){
    //比较部分1
    if(k1.fp > k2.fp){
        return true;
    }
    if(k1.fp < k2.fp) {
        return false;
    }
    //比较部分2
    if(k1.fp == k2.fp){
        if(k1.bp >k1.bp){
            return true;
        }else{
            return false;
        }
    }
};

var sortByKey = function(arr){
    var i = arr.length, j;
    var tempExchangVal;
    while (i > 0) {
        for (j = 0; j < i - 1; j++) {
            if (compareKey(arr[j],arr[j + 1])) {
                tempExchangVal = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tempExchangVal;
            }
        }
        i--;
    }
    return arr;
};

//初始化redis服务器组
re.createClient=function(shardConfig){
    this.shardConfig = shardConfig;
    hashKeys = [];
    shardConfig.forEach(function(shardInfo,i){
        if(!shardInfo.name){
            for (var n = 0; n < 160 * shardInfo.weight; n++) {
                var key = algo.mHash("SHARD-" + i + "-NODE-" + n);
                insertHashKeys(key,i);
            }
        } else {
            for (var n = 0; n < 160 * shardInfo.weight; n++) {
                var key = algo.mHash(shardInfo.name + "*" +shardInfo.weight+ n);
                insertHashKeys(key,i);
            }
        }
    });

    sortByKey(hashKeys);
    return this;
};

//二分法 查找最近的key
var findRecentlyKey = function(node,startIndex,endIndex){
    if(endIndex - startIndex == 0){
        return ;
    }
    if(endIndex - startIndex == 1){
        if(compareKey(hashKeys[endIndex],node)){
            return hashKeys[endIndex];
        }else{
            return;
        }
    }
    var midIndex = parseInt((startIndex + endIndex)*0.5);
    var mn = hashKeys[midIndex];
    if(node.key == mn.key){
       return mn;
    }
    if(compareKey(node,mn)){
        //下半区
        return findRecentlyKey(node,midIndex,endIndex);
    }else{
        //上半区
        return findRecentlyKey(node,startIndex,midIndex);
    }
};

//根据key 获取对应的组
re.getShard = function(key){
    var hk = algo.mHash(key);
    var node = findRecentlyKey(genNode(hk),0,hashKeys.length);
    if(!node){
        var ln = hashKeys[0];
        return this.shardConfig[ln.shardIndex];//不是第一个 是key最小的一个
    }else{
        return this.shardConfig[node.shardIndex];
    }
};


//测试部分
//var testData = [
//    {name:"1",server:"h1",weight:1},
//    {name:"2",server:"h2",weight:1},
//    {name:"3",server:"h3",weight:1},
//    {name:"4",server:"h4",weight:1}
//];
console.log("start");

var testData = [
    {name:"shard1",server:"h1",weight:1},
    {name:"shard2",server:"h2",weight:1},
    {name:"shard3",server:"h3",weight:1}
];


re.createClient(testData);
console.log(re.getShard("si8BF76C8AA0AAD67C5DB49800A0C2DA33"));
console.log(re.getShard("xfacafa"));
console.log(re.getShard("8440545771861413516"));
console.log(re.getShard("-2611651159364214418"));
console.log(re.getShard("-972350781276431501"));
console.log(re.getShard("-1698970474530562396"));
console.log(re.getShard("-1600257860166743280"));
console.log(re.getShard("8698323576935691659"));
console.log("hello");


module.exports = re;




