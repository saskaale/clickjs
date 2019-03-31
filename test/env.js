import Click from '../src/index';
import TestingCommand from './base/testingCommand';
import {
    EnvContext
} from './base/context';

@Click.group()
class Command extends TestingCommand{
    @Click.command("1")
    @Click.option("--name", {envvar:"name"})
    @Click.option("--name2", {default: '12', envvar: "name2"})
    evaluate1(data){
        this._checkCall('evaluate1', data);
    }

    @Click.command("2")
    @Click.argument("value", {envvar:"value"})
    @Click.argument("value2", {envvar:"value2"})
    evaluate2(data){
        this._checkCall('evaluate2', data);
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
        const env2 = new EnvContext({name2: '21'});
        it('evaluate1', function(done){
            new Command('evaluate1', {name2: '21', name: 'tony'}, done).run(['1', '--name', 'tony'], env2);
        });
    });
    describe('#arguments1', function() {
        const env2 = new EnvContext({value2: '21'});
        it('evaluate1', function(done){
            new Command('evaluate2', {value2: '21', value: 'tony'}, done).run(['2', 'tony'], env2);
        });
        it('evaluate2', function(done){
            new Command('evaluate2', {value2: '21', value: 'tony'}, done).run(['2', 'tony'], env2);
        });
    });
});
