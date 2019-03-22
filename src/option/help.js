import DefaultOption from './default';

export default class HelpOption extends DefaultOption{
    constructor(){
        super(["--help"], {help: "Show this message and exit."});
    }

    value(ctx){
        ctx.print_help_msg(true);
    }

    isNeeded(){
        return false;
    }

    key(){
        const key = this._name[this._name.length - 1][0];
        return key.replace(/^\-[0-2]/g, '').toLowerCase();
    }
}
