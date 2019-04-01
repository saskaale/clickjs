import Click from '../src/index';
import TestingCommand from './base/testingCommand';
import {
    EnvContext
} from './base/context';

@Click.group()
class Command extends TestingCommand{
    @Click.command("1")
    @Click.option("--name", {envvar:"env_name"})
    @Click.option("--name2", {default: '12', envvar: "env_name2"})
    evaluate1(data){
        this._checkCall('evaluate1', data);
    }

    @Click.command("2")
    @Click.argument("value", {envvar:"env_value"})
    @Click.argument("value2", {envvar:"env_value2"})
    evaluate2(data){
        this._checkCall('evaluate2', data);
    }

    @Click.command("3")
    @Click.argument("value", {envvar:"env_value"})
    @Click.argument("value2", {envvar:"env_value2", default: 'defVal'})
    evaluate3(data){
        this._checkCall('evaluate3', data);
    }

}


describe('Env', function() {
    describe('#options1', function() {
        const env1 = new EnvContext({});
        it('fromdefault', function(done){
            new Command('evaluate1', {name2: '12'}, done).run(['1'], env1);
        });
        it('eval1', function(done){
            new Command('evaluate1', {name2: '12'}, done).run(['1'], env1);
        });
    });
    describe('#option2', function() {
        const env2 = new EnvContext({env_name2: '21'});
        it('evaluate1', function(done){
            new Command('evaluate1', {name2: '21', name: 'tony'}, done).run(['1', '--name', 'tony'], env2);
        });
    });
    describe('#arguments1', function() {
        const env2 = new EnvContext({env_value2: '21'});
        it('evaluate1', function(done){
            new Command('evaluate2', {value2: '21', value: 'tony'}, done).run(['2', 'tony'], env2);
        });
    });
    describe('#arguments2', function() {
        const env3 = new EnvContext({env_value2: 'defVal2'});
        it('evaluate2', function(done){
            new Command('evaluate3', {value2: 'defVal2', value: 'a'}, done).run(['3', 'a'], env3);
        });
        it('evaluate3', function(done){
            new Command('evaluate3', {value2: 'defVal2'}, done).run(['3'], env3);
        });
    });
});
