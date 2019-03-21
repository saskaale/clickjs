import DefaultOption from './default';

export default class BooleanOption extends DefaultOption{
    constructor(name, params){
        this._name = name.map(e=>e.split('/',2));
        this._params = params;
    }

    value(ctx, cmdargs){
        const arg0 = cmdargs[0];
        const found = this._name.find(([pos, neg])=> arg0 === pos || arg0 === neg);
        if(arg0 === found[0])
            return true;
        if(arg0 === found[1])
            return false;
    }

    isNeeded(){
        return this._params.default === undefined;
    }

    key(){
        const key = this._name[this._name.length - 1][0];
        return key.replace(/^\-[0-2]/g, '').toLowerCase();
    }

    match(ctx, cmdargs){
        const arg0 = cmdargs[0];
        const found = this._name.some(([pos, neg])=> arg0 === pos || arg0 === neg);

        return found ? 1 : false;
    }
}
