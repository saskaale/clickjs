import {str2Arr, print_help_msg} from './utils';
import {createOption, helpOption} from './option';
import {createArgument} from './argument';


function _ensureParams(descriptor){
    if(!descriptor._arguments)
        descriptor._arguments = [];
    if(!descriptor._options)
        descriptor._options = [];
}

function _ensureCommands(target){
    if(!target._commands)
        target._commands = [];
}

function command(name, props){
    class MyCommand{
        constructor(fun){
            this._fun = fun;
        }
    }
    return function (target, key, descriptor) {
        const Command = createGroup(MyCommand, name, {...props, _fun: descriptor} );

        _ensureCommands(target);
        _ensureParams(descriptor);

        target._commands.push(new Command(descriptor));
        return descriptor;
    }
}

function createGroup(target, name, props = {}) {
    name = str2Arr(name);

    const Group = class extends target{
        static _isClick = true;

        arglength(){
            return name ? name.length : 0;
        }

        _getCommands(){
            return this._commands || [];
        }

        _getOptions(){
            const options = (props._fun ? props._fun._options : this._options) || [];

            return options.concat([helpOption]);
        }

        _getArguments(){
            return (props._fun ? props._fun._arguments : this._arguments) || [];
        }

        print_help_msg(){
            print_help_msg.call(this);
        }
                
        help(){
            return `${(name ? name.join(',') : "").padEnd(20,' ')} ${props._help}`;
        }

        match(ctx, cliargs){
            if(name === undefined){
                return true;
            }
    
            for(let i = 0; i < name.length; ++i){
                if(cliargs[i] != name[i])
                    return false;
            }
    
            return true;
        }

        init(){

        }

        async run(args = process.argv.slice(2)){
            //preprocess into object/key value
            await this.execute(this, args);
        }

        static async run(args = process.argv.slice(2)){
            return new Group().run(args);
        }

        static group(name, props = {}){
            const self = Group.prototype;
            return function (target) {
                _ensureCommands(self);
                const newgroup = createGroup(target, name, props);

                let instance;
                const getInstance = (...args) => instance || (instance = new newgroup(...args))

                const fakeclass = {
                    init: () => {instance = 0},
                    match: (ctx, ...args) => getInstance(ctx).match(ctx, ...args),
                    arglength: (ctx, ...args) => getInstance(ctx).arglength(ctx, ...args),
                    help: (ctx, ...args) => getInstance(ctx).help(ctx, ...args),
                    execute: (ctx, ...args) => getInstance(ctx).execute(ctx, ...args)
                }
                self._commands.push(fakeclass);
                return newgroup;
            }
        }
    
        async parseCmdOptions(ctx, cmdargs, optsDefinition, parsedParams = {}){
            let parsedArgs = optsDefinition.map(e=>0);

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
                if(parsedArgs[i] <= 0){
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

        async execute(ctx, cmdargs, options = [], parsedParams = {}, ...rest){
            const commands = this._getCommands();

            let matches = 0;
            for(let i = 0; i < commands.length; i++){
                const command = commands[i];
                command.init()
                if(command.match(this, cmdargs)){
                    const arglength = command.arglength();
                    await command.execute(ctx, cmdargs.slice(arglength), options, parsedParams, ...rest);
                    matches++;
                }
            }

            const fun = props._fun;
            if(fun){
                options = options.concat(this._getOptions()).concat(this._getArguments());
                cmdargs = await this.parseCmdOptions(ctx, cmdargs, options, parsedParams);    
                fun.value.call(ctx, parsedParams);    
            }

            if(commands.length && matches <= 0){
                this.print_help_msg();
                process.exit(0);
            }
        }
    };
    _ensureCommands(Group);
    return Group;
}

function group(name, props = {}){
    name = str2Arr(name);
    return (target) => createGroup(target, name, props);
}

function option(name, params = {}){
    return function (target, key, descriptor) {
        _ensureParams(descriptor);
        descriptor._options.push(createOption(name, params))
        return descriptor;
    }
}

function argument(name, params = {}){
    return function (target, key, descriptor) {
        _ensureParams(descriptor);
        descriptor._arguments.unshift(createArgument(name, params))
        return descriptor;
    }
}

function help(text){
    return function (target, key, descriptor) {
        _ensureParams(descriptor);
        descriptor._help = text;
        return descriptor;
    }
}


const Click = {
    group,
    argument,
    option,
    command,
    help
}


export default Click;