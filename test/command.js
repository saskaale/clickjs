import Click from '../src/index';

@Click.group()
class Command{
    @Click.command("2")
    @Click.argument("value")
    @Click.argument("value2")
    evaluate2(params){
        console.log("command run 2()")
        console.log(params);
    }

    @Click.command("1")
    @Click.option("name")
    @Click.option("name2", {default: '12'})
    evaluate1(params){
        console.log("command run 1()");
        console.log(params);
    }
}

@Command.group("3")
class SubCommand{
    @Click.command("2")
    evaluate2(params){
        console.log("command run 3-2()");
        console.log(params);
    }

    @Click.command("1")
    @Click.option("name")
    @Click.option("name2", {default: '12'})
    evaluate1(params){
        console.log("command run 3-1()");
        console.log(params);
    }
}

new Command().run();