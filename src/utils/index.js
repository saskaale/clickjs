import ArgOption from './argoption';

function str2Arr(val){
    if(typeof val === 'string')
        return [val];
    return val;    
}

export {str2Arr, ArgOption}