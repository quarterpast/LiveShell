fs = require \fs
path = require \path
cp = require \child_process
global <<< require \prelude-ls
q = require \q
Sync = require \sync
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

register-bin(file)=
	global[path.basename file] = async (
			args='',
			streams
	)->
		console.log file,args
		cmd = cp.spawn file,(args.split /\s+/),{cwd,process.env}
		if streams.stdin?
			streams.stdin.pipe cmd
		out = promise-stream cmd.stdout
		err = promise-stream cmd.stderr
		return {out,err}

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
	ls '.'