import ArgOption from './argoption';

function str2Arr(val){
    if(typeof val === 'string')
        return [val];
    return val;    
}

function print_help_msg(context){
    let text = [
        'Usage:',
        '',
        '      '+this.help(),
    ];


    const args = this._getArguments();
    if(args.length){
        text = text.concat([
            '',
            'Arguments:',
            '']).concat(
                args.map(e=>'      '+e.help())
            )
    }

    const options = this._getOptions();
    if(options.length > 1){ //1 for --help option
        text = text.concat([
            '',
            'Options:',
            '']).concat(
                options.map(e=>'      '+e.help())
            )
    }

    const commands = this._getCommands();
    if(commands.length){
        text = text.concat([
            '',
            'Commands:',
            '']).concat(
                commands.map(e=>'      '+e.help())
            )
    }

    context.console.log(text.join('\n'));
}

export {str2Arr, print_help_msg, ArgOption}