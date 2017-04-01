var storage = sessionStorage

var clear_data = async () => {
    storage.clear()
}

var get_data = async (n) => {
    if(storage.hasOwnProperty(n)){
        return storage.getItem(n)
    }else{
        var value = await (await fetch(n)).text()
        storage.setItem(n,value)
        return value
    }
}

var _html = async (n) => {
    var to_insert = await get_data(n)
    var config = JSON.parse(to_insert.match(/^\s*<!--([\s\S]*?)\s*-->/)[1])
    if(!config.hasOwnProperty("layout")){
        return [to_insert,config]
    }else{
        var [doc,ans] = await _html(config.layout)
        for(var i in config){
            ans[i] = config[i]
        }
        return [doc.replace(/<!--\s*[cC][oO][nN][tT][eE][nN][tT]\s*-->/,to_insert),ans]
    }
}

var async_eval_for_print = async (code,data) =>{
    print = data[0]
    var to_eval = `(async (data)=>{
        print = data[0]
        ${code}
    })([print])`
    await eval(to_eval)
}

var html = async (n) => {
    var [doc, ans] = await _html(n)
    for(var i in ans){
        this[i] = ans[i]
    }
    var print = new Proxy(function(){},{
        apply: function(target, thisArg, argumentsList){
            target.data += argumentsList.join("")
        }
    })
    print.data = ""
    var temp_doc = `?>${doc}<?`
    var htmls = temp_doc.match(/\?>[\s\S]*?<\?/g)
    var jss = temp_doc.match(/<\?([\s\S]*?)\?>/g)
    for(var i=0;i<jss.length;i++){
        try{print(htmls[i].slice(2,-2))
        }catch(e){print(`Error: ${e}`)}
        try{await async_eval_for_print(jss[i].slice(2,-2),[print])
        }catch(e){print(`Error: ${e}`)}
    }
    print(htmls[i].slice(2,-2))
    document.write(print.data)
    return [doc,ans]
}

var json = async (n,m = window) => {
    data = JSON.parse(await get_data(n))
    for(var i in data){
        m[i] = data[i]
    }
    return data
}
