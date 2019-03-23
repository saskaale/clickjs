import Click from '../src/index';
import assert from 'assert';


class TestingCommand{
    constructor(name,data, done){
        this._name = name;
        this._data = data;
        this._done = done;
    }

    _checkCall(name, data){
        assert.equal(name, this._name, `not called correct handler >>${name}<< != >>${this._name}<<`);
        assert.deepEqual(data, this._data, `data are not equal >>${JSON.stringify(data)}<< != >>${JSON.stringify(this._data)}<<`);
        this._done();
    }
}

@Click.group()
class Command extends TestingCommand{
    @Click.command("1")
    evaluate1(data){
        this._checkCall('evaluate1', data);
    }

    @Click.command("2")
    @Click.option("--name")
    @Click.option("--name2", {default: '12'})
    evaluate2(data){
        this._checkCall('evaluate2', data);
    }

    @Click.command("3")
    @Click.argument("value")
    @Click.argument("value2")
    evaluate3(data){
        this._checkCall('evaluate3', data);
    }
}


describe('Basic', function() {
    describe('#simple', function() {
        it('evaluate1', function(done){
            new Command('evaluate1', {}, done).run(['1']);
        });
        it('evaluate-defaultValue', function(done){
            new Command('evaluate2', {name2: '12'}, done).run(['2']);
        });
        it('evaluate-defaultOverride', function(done){
            new Command('evaluate2', {name2: 'a'}, done).run(['2', '--name2', 'a']);
        });
        it('evaluate-1options', function(done){
            new Command('evaluate2', {name2: '12', name: 'ab'}, done).run(['2', '--name', 'ab']);
        });
        it('evaluate-2options', function(done){
            new Command('evaluate2', {name2: 'c', name: 'ab'}, done).run(['2', '--name', 'ab', '--name2', 'c']);
        });
    });
    describe('#options', function() {
        it('=', function(done){
            new Command('evaluate2', {name2:'a'}, done).run(['2', '--name2=a']);
        });
        it('2times=', function(done){
            new Command('evaluate2', {name2:'a', name: 'b'}, done).run(['2', '--name2=a', '--name=b']);
        });
        it('mixed', function(done){
            new Command('evaluate2', {name2:'a', name: 'b'}, done).run(['2', '--name2', 'a', '--name=b']);
        });
        it('mixed2', function(done){
            new Command('evaluate2', {name2:'a', name: 'b'}, done).run(['2', '--name2=a', '--name', 'b']);
        });
    });
});