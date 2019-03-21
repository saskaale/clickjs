function readFromStdin(){
    process.stdin.resume();
    var fs = require('fs');
    var response = fs.readSync(process.stdin.fd, 1000, 0, "utf8");
    process.stdin.pause();
    return response;
}

export default class DefaultOption{
    constructor(name, params){
        this._name = name;
        this._params = params;
        
    }

    _splitArgToKeyVal(arg){
        if(arg.match(/[^=]+=.+/g)){
            return arg.split('=',2);
        }else{
            return [arg];
        }
    }

    _parseValue(value){
        
    }

    value(ctx, cmdargs){
        const arg0 = this._splitArgToKeyVal(cmdargs[0]);

        let ret;
        if(arg0.length > 1){
            ret = arg0[1];
        }else{
            ret = cmdargs[1];
        }

        return this._parseValue(ret);
    }

    isNeeded(){
        return this._params.default === undefined && this._params.prompt;
    }

    defaultVal(){
        if(typeof this._params.default === 'function'){
            return this._params.default();
        }
        if(this._params.default !== undefined){
            return this._params.default;
        }
        
        //reade from prompt
        process.stdout.write(`${this._params.prompt}:`);
        let readed = readFromStdin();
        return this._parseValue(readed);
    }

    help(){
        let text = this._name.join(" ").padEnd(25,' ');

        if(this._params.help){
            text += this._params.help;
        }

        if(this._params.default){
            const defaulttext = this._params.show_default ? `'${this._params.show_default}'` : JSON.stringify(this._params.default);
            text += `\t[default: ${defaulttext}]`;
        }

        return text;
    }

    key(){
        const key = this._name[this._name.length - 1];
        return key.replace(/^\-[0-2]/g, '').toLowerCase();
    }

    match(ctx, cmdargs){
        const arg0 = this._splitArgToKeyVal(cmdargs[0]);
        const matched = arg0.length > 1 ? 1 : 2; //"consumed" element from the cmdargs

        return this._name.some(pattern=> pattern === arg0[0]) 
                ? 
                matched
                : 
                false;
    }
}
