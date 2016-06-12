/**
 * Created by 15050971 on 2015/11/4.
 */

var h = require("./build/Release/MurMurHash.node");

var t = h.mHash("sicxo");
console.log(t);

console.log(h.mHash("si03C7D9B8FA8DFB73547EE1328CA89606"));


var testData = [
    {name:"1",server:"h1",weight:1},
    {name:"2",server:"h2",weight:1},
    {name:"3",server:"h3",weight:1},
    {name:"4",server:"h4",weight:1}
];


var os = require('os');
console.log(os.type());

console.log("~~~");

//var fs  = require('fs');
//
//var filename = "./test_data/result.txt";
//fs.readFile("./test_data/authIdKeys.txt", function (err, data) {
//    if (err) throw err;
//    var keys = data.toString().split('\n');
//    keys.forEach(function(k,i){
//        var sk = (i+1)+"::"+ k + "-->" + h.mHash(k);
//        fs.appendFileSync(filename, sk+'\n');
//    });
//    console.log("gen all key  ok.");
//});


//测试部分
//var testData = [
//    {name:"1",server:"h1",weight:1},
//    {name:"2",server:"h2",weight:1},
//    {name:"3",server:"h3",weight:1},
//    {name:"4",server:"h4",weight:1}
//];

/*
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
*/

