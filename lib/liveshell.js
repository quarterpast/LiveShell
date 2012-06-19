(function(){
  var fs, path, cp, q, Sync, cwd, async, promiseStream, registerBin, readDir, listBin, cd, __split = ''.split;
  fs = require('fs');
  path = require('path');
  cp = require('child_process');
  __import(global, require('prelude-ls'));
  q = require('q');
  Sync = require('sync');
  cwd = process.cwd();
  async = call('async');
  promiseStream = async(function(read, length){
    var defer, offset, $buffer;
    length == null && (length = 1024);
    defer = q.defer();
    offset = 0;
    $buffer = new Buffer(length);
    read.on('error', function(e){
      throw e;
    });
    read.on('data', function(chunk){
      var bigger;
      if (chunk.length > $buffer.length - offset) {
        bigger = new Buffer($buffer.length + 1024);
        $buffer.copy(bigger);
        $buffer = bigger;
      }
      chunk.copy($buffer, offset);
      return offset += chunk.length;
    });
    read.on('end', function(){
      return defer.resolve($buffer);
    });
    return defer.promise;
  });
  registerBin = __curry(function(file){
    return global[path.basename(file)] = async(function(args, streams){
      var cmd, out, err;
      args == null && (args = '');
      console.log(file, args);
      cmd = cp.spawn(file, args.split(/\s+/), {
        cwd: cwd,
        env: process.env
      });
      if (streams.stdin != null) {
        streams.stdin.pipe(cmd);
      }
      out = promiseStream(cmd.stdout);
      err = promiseStream(cmd.stderr);
      return {
        out: out,
        err: err
      };
    });
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
  cd = function(dir){
    return process.env.PWD = cwd = path.resolve(cwd, dir);
  };
  each(registerBin)(
  listBin());
  Sync(function(){
    cd("lib");
    return ls('.');
  });
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
