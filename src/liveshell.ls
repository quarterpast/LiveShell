fs = require \fs
path = require \path
cp = require \child_process
global <<< require \prelude-ls
q = require \q

cwd = process.cwd!

register-bin(file)=
	global[path.basename file] = (args='',stream={process.stdout,process.stderr})->
		defer = q.defer!
		cmd = cp.exec-file file,args,{cwd,process.env},(e,out,err)->
			stream.stdout.write out
			stream.stderr.write err
			defer.resolve e
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
	process.env.PWD = cwd := path.resolve cwd,dir

list-bin! |> each register-bin

cat 'lib/liveshell.js'