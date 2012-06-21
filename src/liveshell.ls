fs = require \fs
path = require \path
cp = require \child_process
global <<< require \prelude-ls
q = require \q
Sync = require \sync
rl = require \readline
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

exec(i,ctx,line)=
	try
		out = LiveScript.compile line,{+bare} |> run ctx
		if out.stdout? then
			out.stdout.on \data, ->
				console.log it
				i.write it
	catch
		console.warn e

prompt(i)=
	[p,l] = PS1 \matt,\Vera,path.basename cwd
	i.set-prompt p,l.length
	i.prompt!

PS1(user,host,dir)=
	["\x1b[1;37m[\x1b[1;31m#user@#host \x1b[0;32m#dir\x1b[1;37m]\x1b[0m$ ","[#user@#host #dir]$ "]

Sync ->
	list-bin! |> each register-bin ctx={}
	ctx.cd = (dir)->
		process.env.PWD = cwd := path.resolve cwd,dir

	i = rl.create-interface process.stdin,process.stdout
	i.on \line, ->
		exec i,ctx,it
		prompt i
	prompt i