import {str2Arr} from './utils';
import {createOption} from './option';
import {createCommand} from './command';
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

function command(name){
    return function (target, key, descriptor) {
        _ensureCommands(target);
        _ensureParams(descriptor);
        target._commands.push(createCommand(name, {fun: descriptor}));
        return descriptor;
    }
}

function createGroup(name, target) {
    const Group = class extends target{
        static _isClick = true;

        arglength(){
            return name ? name.length : 0;
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

        async run(){
            //preprocess into object/key value
    
            const args = process.argv.slice(2);

            await this.execute(this, args);
        }

        static group(name){
            const self = Group.prototype;
            return function (target) {
                _ensureCommands(self);
                const newgroup = createGroup(name, target);
                self._commands.push(new newgroup());
                return newgroup;
            }
        }
    
        async execute(ctx, cmdargs, ...rest){
            for(let i = 0; i < this._commands.length; i++){
                const command = this._commands[i];
                if(command.match(this, cmdargs)){
                    const arglength = command.arglength();
                    await command.execute(ctx, cmdargs.slice(arglength), ...rest);
                }
            }
        }                
    };
    _ensureCommands(Group);
    return Group;
}

function group(name){
    name = str2Arr(name);
    return (target) => createGroup(name, target);
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
        descriptor._arguments.push(createArgument(name, params))
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