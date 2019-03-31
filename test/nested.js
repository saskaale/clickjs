import Click from '../src/index';
import assert from 'assert';
import TestingCommand, {createStatic} from './base/testingCommand';

const createStaticClass = (...args) => createStatic((_checkAll) => {
    @Click.group()
    class NewCommand{
        @Click.command("1")
        evaluate1(data){
            _checkAll('evaluate1', data);
        }
    }

    @NewCommand.group('2')
    class NewSubCommand{
        @Click.command("1")
        evaluate1(data){
            _checkAll('evaluate2_1', data);
        }

        @Click.command("2")
        @Click.option("--name")
        @Click.option("--name2", {default: '12'})
        evaluate2(data){
            _checkAll('evaluate2_2', data);
        }
    }

    return NewCommand;
}, ...args)


describe('Nested', function() {
    describe('#simple', function() {
        it('1level', function(done){
            createStaticClass('evaluate1', undefined, done).run(['1']);
        });
        it('1st', function(done){
            createStaticClass('evaluate2_1', undefined, done).run(['2', '1']);
        });
        it('2nd', function(done){
            createStaticClass('evaluate2_2', undefined, done).run(['2', '2']);
        });
    });
});
