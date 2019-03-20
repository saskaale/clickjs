import Click from '../src/index';

class SubCommand extends Click{
    @Click.command("2")
    evaluate2(){
        console.log("command run 2()")
    }

    @Click.command("1")
    @Click.option("name")
    @Click.option("name2", {default: '12'})
    evaluate1(params){
        console.log("command run 1()");
        console.log(params);
    }

}


class Command extends Click{
/*    @Click.group()
    all(...args){
        new SubCommand().run(...args);
        console.log("command all")
    }
*/
    @Click.command("2")
    evaluate2(){
        console.log("command run 2()")
    }

    @Click.command("1")
    @Click.option("name")
    @Click.option("name2", {default: '12'})
    evaluate1(params){
        console.log("command run 1()");
        console.log(params);
    }
}

new Command().run();