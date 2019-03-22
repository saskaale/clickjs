import {str2Arr, print_help_msg} from '../utils';
import HelpOption from '../option/help';

export default class Command{
    constructor(name, data){
        this._data = data;
        this._name = name;
    }

    arglength(){
        const name = this._name;
        return name ? name.length : 0;
    }

    match(ctx, cliargs){
        const name = this._name;

        if(name === undefined){
            return true;
        }

        for(let i = 0; i < name.length; ++i){
            if(cliargs[i] != name[i])
                return false;
        }

        return true;
    }

    _getCommands(){
        return [];
    }

    _getOptions(){
        const {fun} = this._data;
        return fun._options.concat([new HelpOption()]);
    }

    _getArguments(){
        const {fun} = this._data;
        return fun._arguments;
    }

    help(){
        return this._help;
    }
    
    print_help_msg(){
        print_help_msg.apply(this, arguments);
    }

    async parseCmdOptions(ctx, cmdargs, optsDefinition, parsedParams = {}){
        const parsedArgs = optsDefinition.map(e=>0);
        
        while(cmdargs.length > 0){
            let shiftBy = undefined;
            for( let i = 0; i < optsDefinition.length; ++i ){
                const optRepresentation = optsDefinition[i];

                const matchedLength = optRepresentation.match(this,cmdargs);

                if(matchedLength > 0){
                    if(parsedArgs[i] && !optRepresentation.reuse(this, parsedArgs[i])){
                        continue;
                    }
        
                    if(parsedArgs[i]){
                        //TODO: add error for reuse of options
                        console.warn(`error of reusing option >>${optRepresentation.key()}<<`)
                    }

                    const v = await optRepresentation.value(this,cmdargs);
                    parsedParams[optRepresentation.key(this)] = await optRepresentation.value(this,cmdargs);
                    parsedArgs[i]++;

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
        for(let i = 0; i < optsDefinition.length; ++i){
            const arg = optsDefinition[i];
            if(!parsedArgs[i]){
                const defaultVal = await arg.defaultVal();
                if(defaultVal){
                    parsedParams[arg.key()] = defaultVal;
                    parsedArgs[i]++;    
                }
            }
        }

        //check for not parsed neccessary options
        const missingOption = optsDefinition.find((arg, i) => !parsedArgs[i] && arg.isNeeded());
        if(missingOption){
            //TODO: missing option error
            console.warn(`Missing option >>${missingOption.key()}<<`);
        }

        return parsedParams;
    }

    async execute(ctx, cmdargs, options = [], parsedParams = {}){
        const {fun} = this._data;

        options = options.concat(this._getOptions()).concat(this._getArguments());

        cmdargs = await this.parseCmdOptions(ctx, cmdargs, options, parsedParams);

        fun.value.call(ctx, parsedParams);
    }
}

function createCommand(name, data){
    return new Command(str2Arr(name), data);
}

export {createCommand};