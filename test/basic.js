import Click from '../src/index';
import assert from 'assert';
import TestingCommand from './base/testingCommand';
import {
    NonInteractiveContext as TestingContext
} from './base/context';

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

    @Click.command("4")
    @Click.argument("value")
    @Click.argument("value2", {default: '12'})
    evaluate4(data){
        this._checkCall('evaluate4', data);
    }

    @Click.command("5")
    @Click.option("--prefixed", {callback: (v) => "_"+v})
    evaluate5(data){
        this._checkCall('evaluate5', data);
    }

    @Click.command("6")
    @Click.argument("prefixed", {callback: (v) => "_"+v})
    evaluate6(data){
        this._checkCall('evaluate6', data);
    }
}


describe('Basic', function() {
    describe('#simple', function() {
        it('evaluate1', function(done){
            new Command('evaluate1', undefined, done).run(['1']);
        });
        it('evaluate2', function(done){
            new Command('evaluate2', undefined, done).run(['2']);
        });
    });
    describe('#static', function() {
        it('dispatch', function(done){
            @Click.group()
            class TestCommand extends TestingCommand{
                @Click.command("1")
                evaluate1(data){
                    done()
                }
            }

            TestCommand.run(['1'], TestingContext);
        });
    });
    describe('#options', function() {
        it('evaluate-defaultValue', function(done){
            new Command('evaluate2', {name2: '12'}, done).run(['2'], TestingContext);
        });
        it('evaluate-defaultOverride', function(done){
            new Command('evaluate2', {name2: 'a'}, done).run(['2', '--name2', 'a'], TestingContext);
        });
        it('evaluate-1options', function(done){
            new Command('evaluate2', {name2: '12', name: 'ab'}, done).run(['2', '--name', 'ab'], TestingContext);
        });
        it('evaluate-2options', function(done){
            new Command('evaluate2', {name2: 'c', name: 'ab'}, done).run(['2', '--name', 'ab', '--name2', 'c'], TestingContext);
        });
    });
    describe('#options', function() {
        it('=', function(done){
            new Command('evaluate2', {name2:'a'}, done).run(['2', '--name2=a'], TestingContext);
        });
        it('2times=', function(done){
            new Command('evaluate2', {name2:'a', name: 'b'}, done).run(['2', '--name2=a', '--name=b'], TestingContext);
        });
        it('mixed', function(done){
            new Command('evaluate2', {name2:'a', name: 'b'}, done).run(['2', '--name2', 'a', '--name=b'], TestingContext);
        });
        it('mixed2', function(done){
            new Command('evaluate2', {name2:'a', name: 'b'}, done).run(['2', '--name2=a', '--name', 'b'], TestingContext);
        });
        it('callback', function(done){
            new Command('evaluate5', {prefixed:'_a'}, done).run(['5', '--prefixed=a'], TestingContext);
        });
    });
    describe('#defaults', function(){
        it('callback', function(done){
            @Click.group()
            class TestCommand extends TestingCommand{
                @Click.command("1")
                @Click.option("--number", {default: () => 5})
                evaluate1(data){
                    const expects = {"number": 5};
                    assert.deepStrictEqual(data, expects, `data are not equal >>${JSON.stringify(data)}<< != >>${JSON.stringify(expects)}<<`);
                    done()
                }
            }

            TestCommand.run(['1'], TestingContext);
        });
    });
    describe('#arguments', function() {
        it('basic', function(done){
            new Command('evaluate3', {value:'a', value2: 'b'}, done).run(['3', 'a', 'b'], TestingContext);
        });
        it('default', function(done){
            new Command('evaluate4', {value:'a', value2: '12'}, done).run(['4', 'a'], TestingContext);
        });
        it('callback', function(done){
            new Command('evaluate6', {prefixed:'_a'}, done).run(['6', 'a'], TestingContext);
        });
    });
});