import {str2Arr} from '../utils';
import { createOption } from '../option';
import HelpOption from '../option/help';

export default class Command{
    constructor(data){
        this._data = data;
    }

    arglength(){
        const {params: {name}} = this._data;
        return name ? str2Arr(name).length : 0;
    }

    match(ctx, cliargs){
        const {params: {name}} = this._data;

        if(name === undefined){
            return true;
        }

        let names = str2Arr(name);

        for(let i = 0; i < names.length; ++i){
            if(cliargs[i] != names[i])
                return false;
        }

        return true;
    }

    _getOptions(){
        const {fun} = this._data;
        return fun._options.concat([new HelpOption()]);
    }

    help(){
        let helpText = this._help ? ['', '          '+this._help] : [];
    
        let text = helpText.concat([
            '',
            'Options:']).concat(
                this._getOptions().map(e=>'          '+e.help())
            );
        return text.filter(e=>e !== undefined).join('\n');

    }

    parseCmdOptions(ctx, cmdargs, optsDefinition, parsedParams = {}){
        const parsedArgs = optsDefinition.map(e=>false);
        
        while(cmdargs.length > 0){
            let shiftBy = undefined;
            for( let i = 0; i < optsDefinition.length; ++i ){
                const optRepresentation = optsDefinition[i];

                const matchedLength = optRepresentation.match(this,cmdargs);

                if(matchedLength > 0){
                    if(parsedArgs[i]){
                        //TODO: add error for reuse of options
                        console.warn(`error of reusing option >>${optRepresentation.key()}<<`)
                    }
                    parsedParams[optRepresentation.key(this)] = optRepresentation.value(this,cmdargs);
                    parsedArgs[i] = true;

                    shiftBy = matchedLength;
                    break;
                }
            }

            if(shiftBy <= 0){
                //TODO: add unparsed option error
                console.warn(`Unrecognized argument >>${cmdargs[0]}<<`);
            }

            //TODO: Possible use array.shift() ???
            cmdargs = cmdargs.slice(shiftBy || 1);
        }

        //parse default options
        optsDefinition.forEach((arg, i) => {
                if(!parsedArgs[i] && arg.defaultVal()){
                    parsedParams[arg.key()] = arg.defaultVal();
                    parsedArgs[i] = true;
                }
            });

        //check for not parsed neccessary options
        const missingOption = optsDefinition.find((arg, i) => !parsedArgs[i] && arg.isNeeded());
        if(missingOption){
            //TODO: missing option error
            console.warn(`Missing option >>${missingOption.key()}<<`);
        }

        return parsedParams;
    }

    execute(ctx, cmdargs, options = [], parsedParams = {}){
        const {fun} = this._data;

        options = options.concat(this._getOptions());

        parsedParams = this.parseCmdOptions(ctx, cmdargs, options, parsedParams);

        fun.value.call(ctx, parsedParams);
    }
}

function createCommand(...args){
    return new Command(...args);
}

export {createCommand};