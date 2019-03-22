async function readStdinSync() {
    return new Promise(resolve => {
        let data = ''
        process.stdin.setEncoding('utf8')
        process.stdin.resume()
        const t = setTimeout(() => {
        process.stdin.pause()
        resolve(data)
        }, 1e3)
        process.stdin.on('readable', () => {
        let chunk
        while ((chunk = process.stdin.read())) {
            data += chunk
        }
        }).on('end', () => {
        clearTimeout(t)
        resolve(data)
        })
    })
}

function str2Arr(val){
    if(typeof val === 'string')
        return [val];
    return val;    
}

class ArgOption{
    _parseValue(value){
        //TODO: do argument validation and parsing
        if(this._params.callback)
            value = this._params.callback(ctx, this.key(), value);
        return value;
    }
}

export {str2Arr, readStdinSync, ArgOption}