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

export default class ArgOption{
    _parseValue(ctx, value){
        //TODO: do argument validation and parsing
        if(this._params.callback)
            value = this._params.callback(value, this.key(), ctx);
        return value;
    }

    reuse(readed){
        return readed <= 0;
    }

    async defaultVal(ctx){
        if(this._params.envvar !== undefined){
            const val = process.env[this._params.envvar];
            if(val){
                return this._parseValue(ctx, val);
            }
        }


        if(typeof this._params.default === 'function'){
            return this._params.default(ctx, this.key());
        }
        if(this._params.default !== undefined){
            return this._params.default;
        }
        
        //reade from prompt
        if(this._params.prompt){
            process.stdout.write(`${this._params.prompt}:`);
            let readed = await readStdinSync();
            return this._parseValue(ctx, readed);
        }
    }
}
