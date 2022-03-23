const crypto = require("crypto-js");

export function getSig (){
    console.log("started sig");
var queryParams = ""; //pm.request.url.query.members; // check this 
var params = {};
var i = 0;
var prior_s, prior_p;
for (let [k, v] of Object.entries(queryParams)) {
    for (let [p, s] of Object.entries(v)) {
        if (prior_p == 'key' && prior_s != 'sig') {
            params[prior_s] = resolveVariable(s);
        }
        prior_s = s;
        prior_p = p;
    }
}
console.log(" keys to object done");
Object.keys(params).sort().forEach(function(key) {
  params[key] = params[key];
});

// sending direct object
var mainobj = {
    "external_customer_id" : '201',
    "first_name" : 'sandeep',
    "last_name" : 'perkari',
    "postal_code" : '20878',
    "country" : 'US',
    "channel": 'POS',
    "sub_channel" : 'MN_vadnais_heights',
    "sub_channel_detail": "Campaign1234",
    "email": "sandeep.perkari.fssd@gmail.com",
    "uuid": "253f5789e33eef"
}

console.log("our main object", mainobj);
var base64Secret = "secret_key"; //pm.environment.get("secret_key");

var keys = [];
var paramQueryString = paramsString(mainobj, keys).toString();

var paramHashInput = paramQueryString.replace(/=/g,"");
 paramHashInput = paramHashInput.replace(/[\[\]']+/g,"");
 paramHashInput = paramHashInput.replace(/&/g,"");

console.log("paramHashInput:" + paramHashInput);
var rawSignature = base64Secret + paramHashInput;
//console.log(base64Secret);
console.log("raw",rawSignature);
console.log("sss", crypto)
var sig = crypto.MD5(rawSignature).toString();
// pm.environment.set("sig", sig);
console.log("sig", sig);
console.log("sig func completed")
}

// export getSig;

class StringBuilder {
    
    constructor()
    {
        this.value = "";
    }
    
    append(str) {
        this.value = this.value.concat(str);
        return this;
    }
    
    toString() {
        return this.value;
    }
    
    length() {
        return this.value.length;
    }
    
    substring(start, end) {
        return this.value.substring(start,end);
    }
}


// Stack class 
class Stack { 

	// Array is used to implement stack 
	constructor() 
	{ 
		this.items = []; 
	} 
    
    // push function 
    push(element) 
    { 
    	// push element into the items 
    	this.items.push(element); 
    } 
    
    // pop function 
    indexOf(obj) 
    { 
    	return this.items.indexOf(obj);
    } 
    
    // pop function 
    pop() 
    { 
    	// return top most element in the stack 
    	// and removes it from the stack 
    	// Underflow if stack is empty 
    	if (this.items.length == 0) 
    		return "Underflow"; 
    	return this.items.pop(); 
    } 
    
    // peek function 
    peek() 
    { 
    	// return the top most element from the stack 
    	// but does'nt delete it. 
    	return this.items[this.items.length - 1]; 
    } 
    
    // isEmpty function 
    isEmpty() 
    { 
    	// return true if stack is empty 
    	return this.items.length == 0; 
    } 
    
    // printStack function 
    printStack() 
    { 
    	var str = ""; 
    	for (var i = 0; i < this.items.length; i++) 
    		str += this.items[i] + " "; 
    	return str; 
    } 

} 

function resolveVariable(v) {
    if (v.startsWith("{{") && v.endsWith("}}")) {
        var lookup = v.replace("{{","");
        lookup = lookup.replace("}}","");
        console.log("resole variable ", lookup);
        // v = pm.environment.get(lookup); 
    }
    return v;
}

// Main



// functions
function sortObject(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

function paramsString(aHash, keys) {
    var sb = new StringBuilder();
    var products_regex = /products\[(?<product_index>[\d])\]\[(?<attribute_name>[a-zA-Z_-]*)\]/
    var tenders_regex = /tenders\[(?<tender_index>[\d])\]\[(?<attribute_name>[a-zA-Z_-]*)\]/
    var products = []
    var tenders = []
    for (let [k ,v] of Object.entries(aHash).sort((a,b) => (a > b ? 1 : -1))) {
        console.log(k + ": yo " + v)
        keys.push(k);
        var entry = v;
        if(entry.constructor == Array) {
            sb.append(paramsString(entry, keys)).append("&");
        }
        else {
            for(let keyObj of keys) {
                var key = keyObj.toString();
                if (key.indexOf("products") === 0) {
                    // get index of product
                    var product_match = key.match(products_regex).groups;
                    console.log(product_match);
                    if (!products.includes(product_match.product_index)) {
                        sb.append("products");
                        sb.append(product_match.product_index);
                        products.push(product_match.product_index);
                    }
                    sb.append(product_match.attribute_name);
                } else if (key.indexOf("tenders") === 0) {
                    // get index of tender
                    var tenders_match = key.match(tenders_regex).groups;
                    console.log(tenders_match);
                    if (!tenders.includes(tenders_match.tender_index)) {
                        sb.append("tenders");
                        sb.append(tenders_match.tender_index);
                        tenders.push(tenders_match.tender_index);
                    }
                    sb.append(tenders_match.attribute_name);
                } else {
                    if(keys.indexOf(key) === 0) {
                        console.log("appending here");
                        sb.append(key);
                    }
                    else {
                        sb.append("[").append(key).append("]");
                    }
                }
            }
            try {
                sb.append("=").append(encodeURI(entry.toString())).append("&");
            } catch (e) {
                console.log("It's very unlikely", e);
            }
        }
        keys.pop();
    }
    console.log("added as string", sb);
    return sb.length() === 0 ? "" : sb.substring(0, sb.length() - 1);
}


