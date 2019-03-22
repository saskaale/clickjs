import DefaultOption from './default';

export default class HelpOption extends DefaultOption{
    constructor(){
        super(["--help"], {help: "Show this message and exit."});
    }

    value(ctx){
        ctx.print_help_msg();
        process.exit(0);
    }

    isNeeded(){
        return false;
    }
}