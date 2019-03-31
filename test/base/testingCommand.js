import assert from 'assert';


export default class TestingCommand{
    constructor(name,data, done){
        this._name = name;
        this._data = data;
        this._done = done;
    }

    _checkCall(name, data){
        assert.equal(name, this._name, `not called correct handler >>${name}<< != >>${this._name}<<`);
        if(this._data !== undefined)
            assert.deepStrictEqual(data, this._data, `data are not equal >>${JSON.stringify(data)}<< != >>${JSON.stringify(this._data)}<<`);
        this._done();
    }
}

const createStatic = (getClass, name, data, done) => {
    const _checkAll = (_name, _data) => {
        assert.equal(name, _name, `not called correct handler >>${name}<< != >>${_name}<<`);
        if(data !== undefined)
            assert.deepStrictEqual(data, _data, `data are not equal >>${JSON.stringify(data)}<< != >>${JSON.stringify(_data)}<<`);
        done();
    }

    return getClass(_checkAll);
}

export {createStatic};