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

    value(cmdargs){
        const arg0 = this._splitArgToKeyVal(cmdargs[0]);
        if(arg0.length > 1){
            return arg0[1]
        }

        return cmdargs[1];
    }

    isNeeded(){
        return this._params.default === undefined;
    }

    defaultVal(){
        return this._params.default;
    }

    key(){
        const key = this._name[this._name.length - 1];
        return key.replace(/^\-[0-2]/g, '').toLowerCase();
    }

    match(cmdargs){
        const arg0 = this._splitArgToKeyVal(cmdargs[0]);
        const matched = arg0.length > 1 ? 1 : 2; //"consumed" element from the cmdargs

        return this._name.some(pattern=> pattern === arg0[0]) 
                ? 
                matched
                : 
                false;
    }
}
