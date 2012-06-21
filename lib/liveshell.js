(function(){
  var fs, path, cp, q, Sync, rl, LiveScript, vm, cwd, async, registerBin, readDir, listBin, run, exec, prompt, PS1, __split = ''.split;
  fs = require('fs');
  path = require('path');
  cp = require('child_process');
  __import(global, require('prelude-ls'));
  q = require('q');
  Sync = require('sync');
  rl = require('readline');
  LiveScript = require('LiveScript');
  vm = require('vm');
  cwd = process.cwd();
  async = call('async');
  registerBin = __curry(function(obj, file){
    return obj[path.basename(file)] = function(args, streams){
      var cmd;
      args == null && (args = '');
      streams == null && (streams = {});
      cmd = cp.spawn(file, args.split(/\s+/), {
        cwd: cwd,
        env: process.env
      });
      if (streams.stdin != null) {
        streams.stdin.pipe(cmd);
      } else {
        process.stdin.pipe(cmd);
      }
      return cmd;
    };
  });
  readDir = __curry(function(dir){
    return map(partial(path.join, dir))(
    fs.readdirSync(dir));
  });
  listBin = __curry(function(){
    return concat(
    map(readDir)(
    filter(path.existsSync)(
    __split.call(process.env.PATH, ':'))));
  });
  run = __curry(function(ctx, code){
    return vm.runInNewContext(code, ctx);
  });
  exec = __curry(function(ctx, line){
    var out;
    try {
      run(ctx)(
      out = LiveScript.compile(line, {
        bare: true
      }));
      if ('stdout' in out) {
        return out.stdout.pipe(process.stdout);
      }
    } catch (e) {
      return console.warn(e);
    }
  });
  prompt = __curry(function(i, line){
    var p, l, __ref;
    __ref = PS1('matt', 'Vera', path.basename(cwd)), p = __ref[0], l = __ref[1];
    i.setPrompt(p, l.length);
    i.prompt();
    return line;
  });
  PS1 = __curry(function(user, host, dir){
    return ["\x1b[1;37m[\x1b[1;34m" + user + "@" + host + " \x1b[0;32m" + dir + "\x1b[1;37m]\x1b[0m$", "[" + user + "@" + host + " " + dir + "]$ "];
  });
  Sync(function(){
    var ctx, i;
    each(registerBin(ctx = {}))(
    listBin());
    ctx.cd = function(dir){
      return process.env.PWD = cwd = path.resolve(cwd, dir);
    };
    i = rl.createInterface(process.stdin, process.stdout);
    i.on('line', __compose((prompt(i)),(exec(ctx))));
    return prompt(i, '');
  });
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function __curry(f, args){
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      return params.push.apply(params, arguments) < f.length && arguments.length ?
        __curry.call(this, f, params) : f.apply(this, params);
    } : f;
  }
  function __compose(f, g){
    return function(){
      return f(g.apply(this, arguments)); 
    }
  }
}).call(this);
