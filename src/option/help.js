import DefaultOption from './default';

export default class HelpOption extends DefaultOption{
    constructor(){
        super(["--help"], {help: "Show this message and exit."});
    }

    value(ctx){
        console.log(ctx.help())
        process.exit(0);
    }

    isNeeded(){
        return false;
    }

    key(){
        const key = this._name[this._name.length - 1][0];
        return key.replace(/^\-[0-2]/g, '').toLowerCase();
    }
}
