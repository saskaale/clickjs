async function readStdinAsync() {
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

class Context{
    static get console(){
        return console;
    }
    static get env(){
        return process.env;
    }
    static exit(...args){
        return process.exit(...args);
    }
    static async readline(){
        return await readStdinAsync();
    }
}

export default Context;