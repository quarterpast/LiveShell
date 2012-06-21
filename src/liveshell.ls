fs = require \fs
path = require \path
cp = require \child_process
global <<< require \prelude-ls
q = require \q
Sync = require \sync
repl = require \repl
LiveScript = require \LiveScript
vm = require \vm
cwd = process.cwd!

async = call \async

register-bin(obj,file)=
	obj[path.basename file] = (
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

run(ctx,code)=
	vm.runInNewContext code,ctx

exec = async (ctx,line)-->
	try
		out = LiveScript.compile line,{+bare} |> run ctx
		if stdout of out then out.stdout.pipe process.stdout
		return [null,""]
	catch
		return e

PS1(user,host,dir)= "\x1b[1;37m[\x1b[1;34m#user@#host \x1b[0;32m#dir\x1b[1;37m]\x1b[0m$"

Sync ->

	list-bin! |> each register-bin ctx={}
	ctx.cd = (dir)->
		process.env.PWD = cwd := path.resolve cwd,dir
	srv = repl.start (PS1 \matt,\Vera,\~),null,exec ctx