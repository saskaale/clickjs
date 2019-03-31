export default class ArgOption{
    _parseValue(self, context, value){
        //TODO: do argument validation and parsing
        if(this._params.callback)
            value = this._params.callback(value, this.key(), self, context);
        return value;
    }

    reuse(self, context, readed){
        return readed <= 0;
    }

    async defaultVal(self, context){
        if(this._params.envvar !== undefined){
            const val = context.env[this._params.envvar];
            if(val){
                return this._parseValue(self, context, val);
            }
        }


        if(typeof this._params.default === 'function'){
            return this._params.default(self, context, this.key());
        }
        if(this._params.default !== undefined){
            return this._params.default;
        }
        
        //reade from prompt
        if(this._params.prompt){
            context.write(`${this._params.prompt}:`);
            let readed = await context.readline();
            return this._parseValue(self, context, readed);
        }
    }
}
