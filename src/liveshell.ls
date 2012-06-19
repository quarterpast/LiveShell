fs = require \fs
path = require \path
cp = require \child_process
global <<< require \prelude-ls
q = require \q

cwd = process.cwd!

register-bin(file)=
	global[path.basename file] = (args='',stream={process.stdout,process.stderr})->
		cmd = cp.exec-file file, args, {cwd,process.env}
		cmd.stdout.pipe stream.stdout
		cmd.stderr.pipe stream.stderr

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

ls!
cd '..'
ls!