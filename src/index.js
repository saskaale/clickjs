import {str2Arr} from './utils';
import {createOption} from './option';
import {createCommand} from './command';


function _ensureParams(_,_2,descriptor){
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
        _ensureParams(target, key, descriptor);
        target._commands.push(createCommand({params: {name}, fun: descriptor}));
        return descriptor;
    }
}

function group(){
    return function (target) {
        if(target._isClick === undefined)
            return class extends target{
                static _isClick = true;

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
            };
        return target;
    }
}

function option(name, params = {}){
    return function (target, key, descriptor) {
        _ensureParams(target, key, descriptor);
        descriptor._options.push(createOption(name, params))
        return descriptor;
    }
}

function argument(name, params = {}){
    return function (target, key, descriptor) {
        _ensureParams(target, key, descriptor);
        descriptor._arguments.push(new Argument(name, params))
        return descriptor;
    }
}


const Click = {
    group,
    argument,
    option,
    command,
}


export default Click;