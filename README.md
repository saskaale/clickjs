# clickjs
JavaScript port of famous Python click library for argument parsing [![Build Status](https://travis-ci.org/saskaale/clickjs.svg?branch=master)](https://travis-ci.org/saskaale/clickjs)



### Table of Contents
* [Installation](#installation)
* [Usage](#usage)
* [Documentation](#documentation)
* [Dependencies](#dependencies)
* [License](#license)

### Installation
Install the package npm:
```console
$ npm install clickjs --save
```

Alternatively if you are using yarn:
```console
$ yarn add clickjs
```


## Enabling decorators

**TypeScript**

Enable the compiler option `experimentalDecorators` in `tsconfig.json` or pass it as flag `--experimentalDecorators` to the compiler.

**Babel 7.x:**

Install support for decorators: `npm i --save-dev @babel/plugin-proposal-class-properties @babel/plugin-proposal-decorators`. And enable it in your `.babelrc` file:

```json
{
    "presets": ["@babel/preset-env"],
    "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true}],
        ["@babel/plugin-proposal-class-properties", { "loose": true}]
    ]
}
```

**Babel 6.x:**

Install support for decorators: `npm i --save-dev babel-plugin-transform-decorators-legacy`. And enable it in your `.babelrc` file:

```json
{
    "presets": ["es2015", "stage-1"],
    "plugins": ["transform-decorators-legacy"]
}
```

**Babel 5.x**

```json
 {
   "stage": 1
 }
```

Probably you have more plugins and presets in your `.babelrc` already, note that the order is important and `transform-decorators-legacy` should come as first.


### Usage

```javascript
import Click from 'clickjs';

@Click.group()
class Command{
    @Click.command("2")
    @Click.argument("value")
    @Click.argument("value2")
    evaluate2(params){
        console.log("command run 2()")
        console.log(params);
    }

    @Click.command("1")
    @Click.option("name")
    @Click.option("name2", {default: '12'})
    evaluate1(params){
        console.log("command run 1()");
        console.log(params);
    }
}

@Command.group("3")
class SubCommand{
    @Click.command("2")
    evaluate2(params){
        console.log("command run 3-2()");
        console.log(params);
    }

    @Click.command("1")
    @Click.option("name")
    @Click.option("name2", {default: '12'})
    evaluate1(params){
        console.log("command run 3-1()");
        console.log(params);
    }
}

new Command().run();
```

### License
This code has been released under the [Apache 2.0 License](LICENSE).
