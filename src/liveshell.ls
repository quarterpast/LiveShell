fs = require \fs
path = require \path
cp = require \child_process
global <<< require \prelude-ls
q = require \q
Sync = require \sync
repl = require \repl
cwd = process.cwd!

async = call \async

promise-stream = async (read,length=1024)->
	defer = q.defer!
	offset = 0
	$buffer = new Buffer length
	read.on \error, (e)-> throw e
	read.on \data, (chunk)->
		if chunk.length > $buffer.length - offset
			bigger = new Buffer $buffer.length+1024
			$buffer.copy bigger
			$buffer := bigger
		chunk.copy $buffer,offset
		offset += chunk.length
	read.on \end, ->defer.resolve $buffer
	return defer.promise

exec(line)=

register-bin(file)=
	global[path.basename file] = async (
			args='',
			streams={}
	)->
		cmd = cp.spawn file,(args.split /\s+/),{cwd,process.env}
		if streams.stdin?
			streams.stdin.pipe cmd
		else process.stdin.pipe cmd
		return cmd

read-dir(dir)=
	fs.readdir-sync dir
	|> map partial path.join, dir

list-bin()=
	process.env.PATH / ':'
	|> filter path.exists-sync
	|> map read-dir
	|> concat

cd = (dir)->
	process.env.PWD = cwd := path.resolve cwd,dir

list-bin! |> each register-bin

Sync ->
	cd "lib"
	echo 'hello' .stdout.pipe process.stdout

