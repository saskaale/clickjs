import {str2Arr} from './utils';
import {createOption} from './option';


class Click{
    constructor(fun){
    }

    run(){
        //preprocess into object/key value

        const args = process.argv.slice(2);

        this.execute(args);
    }

    execute(cmdargs, ...rest){
        for(let i = 0; i < this._commands.length; i++){
            const command = this._commands[i];
            if(command.match(this, cmdargs)){
                const arglength = command.arglength();
                command.execute(this, cmdargs.slice(arglength), ...rest);
            }
        }

    }

    static _ensureParams(_,_2,descriptor){
        if(!descriptor._arguments)
            descriptor._arguments = [];
        if(!descriptor._options)
            descriptor._options = [];
    }

    static _ensureCommands(target){
        if(!target._commands)
            target._commands = [];
    }

    static command(name){
        return function (target, key, descriptor) {
            Click._ensureCommands(target);
            Click._ensureParams(target, key, descriptor);
            target._commands.push(new Command({params: {name}, fun: descriptor}));
            return descriptor;
        }
    }

    static group(name){
        return function (target, key, descriptor) {
            Click._ensureCommands(target);
            Click._ensureParams(target, key, descriptor);
            target._commands.push(new Command({params: {name}, fun: descriptor}));
            return descriptor;
        }
    }

    static option(name, params = {}){
        return function (target, key, descriptor) {
            Click._ensureParams(target, key, descriptor);
            descriptor._options.push(createOption(name, params))
            return descriptor;
        }
    }

    static arguments(name, params = {}){
        return function (target, key, descriptor) {
            Click._ensureParams(target, key, descriptor);
            descriptor._arguments.push(new Argument(name, params))
            return descriptor;
        }
    }


}


class Command{
    constructor(data){
        this._data = data;
    }

    arglength(){
        const {params: {name}} = this._data;
        return name ? str2Arr(name).length : 0;
    }

/*    @Click.command("help")
    help(){
        console.log("PRINT HELP");
    }
*/
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

    parseCmdOptions(ctx, cmdargs, optsDefinition, parsedParams = {}){
        const parsedArgs = optsDefinition.map(e=>false);
        
        while(cmdargs.length > 0){
            let shiftBy = undefined;
            for( let i = 0; i < optsDefinition.length; ++i ){
                const optRepresentation = optsDefinition[i];

                const matchedLength = optRepresentation.match(cmdargs);

                if(matchedLength > 0){
                    if(parsedArgs[i]){
                        //TODO: add error for reuse of options
                        console.warn(`error of reusing option >>${optRepresentation.key()}<<`)
                    }
                    parsedParams[optRepresentation.key()] = optRepresentation.value(cmdargs);
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


        parsedParams = this.parseCmdOptions(ctx, cmdargs, options.concat(fun._options), parsedParams);

        fun.value.call(ctx, parsedParams);
    }
}


export default Click;