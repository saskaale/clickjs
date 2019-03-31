import { str2Arr, ArgOption } from '../utils';
import { createOption } from '../option';
import HelpOption from '../option/help';

export default class Argument extends ArgOption{
    constructor(name, params){
        super();

        this._params = params;
        this._name = name;
    }

    _getOptions(){
        const {fun} = this._data;
        return fun._options.concat([new HelpOption()]);
    }

    cmdlineinfo(){
        return `<${this._name}>`;
    }

    isNeeded(){
        return true;
    }

    help(){
        let ret = `<${this._name}>`.padEnd(10,' ');
        if(this._params.help){
            ret += this._params.help;
        }

        return ret;
    }

    key(){
        return this._name;
    }

    match(self, context, cmdargs){
        return cmdargs.length > 0 ? 1 : 0;
    }

    async value(self, context, cmdargs){
        return this._parseValue(self, context, cmdargs[0]);
    }
}

function createArgument(name, data){
    return new Argument(name, data);
}

export {createArgument};