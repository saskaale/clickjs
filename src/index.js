import {str2Arr, print_help_msg} from './utils';
import {createOption, helpOption} from './option';
import {createArgument} from './argument';
import Context from './context';

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

        //print multiline help detailed info
        print_help_msg(context){
            print_help_msg.call(this, context);
        }

        //Command line example
        usageinfo(self){
            return `${self.usageinfo()} ${(name ? name.join(',') : "")}`;
        }

        //one-line summary help string
        help(){
            return `${(name ? name.join(',') : "").padEnd(20,' ')} ${props.help || `command >>${name}<<`}`;
        }

        match(self, context, cliargs){
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

        async run(args = process.argv.slice(2), context = Context){
            //preprocess into object/key value
            await this.execute(this, context, args);
        }

        static async run(args = process.argv.slice(2), context = Context){
            return await new Group().run(args, context);
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
                    match: (self, ...args) => getInstance(self).match(self, ...args),
                    arglength: (self, ...args) => getInstance(self).arglength(self, ...args),
                    help: (self, ...args) => getInstance(self).help(self, ...args),
                    execute: (self, ...args) => getInstance(self).execute(self, ...args)
                }
                self._commands.push(fakeclass);
                return newgroup;
            }
        }
    
        async parseCmdOptions(self, context, cmdargs, optsDefinition, parsedParams = {}){
            let parsedArgs = optsDefinition.map(e=>0);

            while(cmdargs.length > 0){
                let shiftBy = undefined;
                for( let i = 0; i < optsDefinition.length; ++i ){
                    const optRepresentation = optsDefinition[i];
    
                    const matchedLength = optRepresentation.match(this, context, cmdargs);
    
                    if(matchedLength > 0){
                        if(parsedArgs[i] && !optRepresentation.reuse(this, context, parsedArgs[i])){
                            continue;
                        }
            
                        if(parsedArgs[i]){
                            //TODO: add error for reuse of options
                            console.warn(`error of reusing option >>${optRepresentation.key()}<<`)
                        }
                        parsedParams[optRepresentation.key(this, context)] = await optRepresentation.value(this, context, cmdargs);
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
                    const defaultVal = await arg.defaultVal(this, context);
                    if(defaultVal){
                        parsedParams[arg.key(this)] = defaultVal;
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

        async execute(self, context, cmdargs, options = [], parsedParams = {}, ...rest){
            const commands = this._getCommands();

            let matches = 0;
            for(let i = 0; i < commands.length; i++){
                const command = commands[i];
                command.init()
                if(command.match(this, context, cmdargs)){
                    const arglength = command.arglength();
                    await command.execute(self, context, cmdargs.slice(arglength), options, parsedParams, ...rest);
                    matches++;
                }
            }

            const fun = props._fun;
            if(fun){
                options = options.concat(this._getOptions()).concat(this._getArguments());
                cmdargs = await this.parseCmdOptions(self, context, cmdargs, options, parsedParams);
                fun.value.call(self, parsedParams);    
            }

            if(commands.length && matches <= 0){
                this.print_help_msg(context);
                context.exit(0);
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
export {Context};