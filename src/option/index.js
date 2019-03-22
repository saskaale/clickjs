import DefaultOption from './default';
import BooleanOption from './boolean';
import HelpOption    from './help';

import {str2Arr} from '../utils';


const helpOption = new HelpOption();


function createOption(name, params){
    name = str2Arr(name);

    if(name.every(e=>e.match(/.+\/.+/g))){
        return new BooleanOption(name, params);
    }

    return new DefaultOption(name, params);
}

export {createOption, helpOption};

