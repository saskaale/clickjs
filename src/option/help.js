import DefaultOption from './default';

export default class HelpOption extends DefaultOption{
    constructor(){
        super(["--help"], {help: "Show this message and exit."});
    }

    value(self, context){
        self.print_help_msg(context);
        context.exit(0);
    }

    isNeeded(){
        return false;
    }
}