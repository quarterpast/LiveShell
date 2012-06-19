(function(){
  var fs, path, cp, q, cwd, registerBin, readDir, listBin, cd, __split = ''.split;
  fs = require('fs');
  path = require('path');
  cp = require('child_process');
  __import(global, require('prelude-ls'));
  q = require('q');
  cwd = process.cwd();
  registerBin = __curry(function(file){
    return global[path.basename(file)] = function(args, stream){
      var cmd;
      args == null && (args = '');
      stream == null && (stream = {
        stdout: process.stdout,
        stderr: process.stderr
      });
      cmd = cp.execFile(file, args, {
        cwd: cwd,
        env: process.env
      });
      cmd.stdout.pipe(stream.stdout);
      return cmd.stderr.pipe(stream.stderr);
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
  cd = __curry(function(dir){
    return process.env.PWD = cwd = path.resolve(cwd, dir);
  });
  each(registerBin)(
  listBin());
  ls();
  cd('..');
  ls();
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function __curry(f, args){
    return f.length ? function(){
      var params = args ? args.concat() : [];
      return params.push.apply(params, arguments) < f.length ?
        __curry.call(this, f, params) : f.apply(this, params);
    } : f;
  }
}).call(this);
