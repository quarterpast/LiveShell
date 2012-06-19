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
      var defer, cmd;
      args == null && (args = '');
      stream == null && (stream = {
        stdout: process.stdout,
        stderr: process.stderr
      });
      defer = q.defer();
      cmd = cp.spawn(file, args.split(/\s+/), {
        cwd: cwd,
        env: process.env
      });
      cmd.stdout.pipe(stream.stdout);
      cmd.stderr.pipe(stream.stderr);
      cmd.on('exit', __bind(defer, 'resolve'));
      return defer.promise;
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
    var defer;
    defer = q.defer();
    process.env.PWD = cwd = path.resolve(cwd, dir);
    process.nextTick(__bind(defer, 'resolve'));
    return defer.promise;
  });
  each(registerBin)(
  listBin());
  cd("lib").then(function(){
    return ls('.');
  });
  function __import(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function __bind(obj, key){
    return function(){ return obj[key].apply(obj, arguments) };
  }
  function __curry(f, args){
    return f.length ? function(){
      var params = args ? args.concat() : [];
      return params.push.apply(params, arguments) < f.length ?
        __curry.call(this, f, params) : f.apply(this, params);
    } : f;
  }
}).call(this);
