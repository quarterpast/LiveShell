(function(){
  var fs, path, cp, q, Sync, repl, LiveScript, vm, cwd, async, registerBin, readDir, listBin, run, exec, PS1, __split = ''.split;
  fs = require('fs');
  path = require('path');
  cp = require('child_process');
  __import(global, require('prelude-ls'));
  q = require('q');
  Sync = require('sync');
  repl = require('repl');
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
  exec = async(__curry(function(ctx, line){
    var out;
    try {
      run(ctx)(
      out = LiveScript.compile(line, {
        bare: true
      }));
      if (stdout in out) {
        out.stdout.pipe(process.stdout);
      }
      return [null, ""];
    } catch (e) {
      return e;
    }
  }));
  PS1 = __curry(function(user, host, dir){
    return "\x1b[1;37m[\x1b[1;34m" + user + "@" + host + " \x1b[0;32m" + dir + "\x1b[1;37m]\x1b[0m$";
  });
  Sync(function(){
    var ctx, srv;
    each(registerBin(ctx = {}))(
    listBin());
    ctx.cd = function(dir){
      return process.env.PWD = cwd = path.resolve(cwd, dir);
    };
    return srv = repl.start(PS1('matt', 'Vera', '~'), null, exec(ctx));
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
}).call(this);
