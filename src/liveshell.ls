fs = require \fs
path = require \path
cp = require \child_process
global <<< require \prelude-ls
q = require \q

cwd = process.cwd!

register-bin(file)=
	global[path.basename file] = (args='',stream={process.stdout,process.stderr})->
		defer = q.defer!
		#console.log cwd,path.exists-sync cwd
		cmd = cp.spawn file,(args.split /\s+/),{cwd,process.env}
		cmd.stdout.pipe stream.stdout
		cmd.stderr.pipe stream.stderr
		cmd.on \exit, defer~resolve
		return defer.promise

read-dir(dir)=
	fs.readdir-sync dir
	|> map partial path.join, dir

list-bin()=
	process.env.PATH / ':'
	|> filter path.exists-sync
	|> map read-dir
	|> concat

cd(dir)=
	defer = q.defer!
	process.env.PWD = cwd := path.resolve cwd,dir
	process.nextTick defer~resolve
	return defer.promise

list-bin! |> each register-bin

cd "lib" .then ->ls '.'