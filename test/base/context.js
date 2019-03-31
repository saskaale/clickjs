import {Context} from '../../src/index';
import assert   from 'assert';

class NonInteractiveContext extends Context{
    static exit(){
        assert.fail('Should not exit');
    }
    static write(){
        assert.fail('Should not print anything to console');
    }
    static get console(){
        assert.fail('Should not print anything to console');
    }
    static async readline(){
        assert.fail('Should not read from input');
    }
}

class EnvContext{
    constructor(env = {}){
        this._env = env;
    }

    get env(){
        return {...this._env};
    }

    exit(){
        assert.fail('Should not exit');
    }
    write(){
        assert.fail('Should not print anything to console');
    }
    get console(){
        assert.fail('Should not print anything to console');
    }
    async readline(){
        assert.fail('Should not read from input');
    }
}

class IOContext extends EnvContext{
    constructor(input = [], env = {}){
        super(env);
        this._inp = input;
        this._out = [];
    }

    exit(){
        this._write(IOContext.EXIT);
    }

    _write(...args){
        args.forEach(e => this._out.push(e+""));
    }

    get console(){
        const write = this._write.bind(this);

        return {
            log: write,
            error: write,
            warn: write
        }
    }

    async readline(){
        if(this._inp.length <= 0)
            assert.fail('input is empty :(');

        return this._inp.unshift();
    }
}
IOContext.EXIT = Symbol('exit');


export {NonInteractiveContext, IOContext, EnvContext};