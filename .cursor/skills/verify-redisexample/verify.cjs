#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {spawn, spawnSync} = require('node:child_process');
const net = require('node:net');
const root = process.cwd();
const out = process.env.VERIFY_EVIDENCE_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'verify-redisExample-'));
fs.mkdirSync(out, {recursive:true});
const evidence = {app:'redisExample', startedAt:new Date().toISOString(), actions:[]};
const children=[];const sockets=[];
const reserve=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
function launch(cmd,args,env){const log=fs.openSync(path.join(out,`process-${children.length}.log`),'a');const child=spawn(cmd,args,{cwd:root,env:{...process.env,...env},stdio:['ignore',log,log]});fs.closeSync(log);children.push(child);child.on('error',e=>{evidence.processError=e.message;});return child;}
async function request(url, options={}) {const res=await fetch(url,{...options,signal:AbortSignal.timeout(5000)});const text=await res.text(); evidence.actions.push({method:options.method||'GET',url,status:res.status,body:text});return {status:res.status,text,json:()=>JSON.parse(text)};}
async function ready(base,route,child){for(let i=0;i<100;i++){if(evidence.processError)throw Error(evidence.processError);if(child.exitCode!==null)throw Error(`server exited ${child.exitCode}`);try{const r=await fetch(base+route,{signal:AbortSignal.timeout(300)});if(r.ok)return;}catch{} await new Promise(r=>setTimeout(r,100));}throw Error('readiness timeout');}
(async()=>{
const redisPort=await reserve();const redisBin=process.env.REDIS_SERVER_BIN||'redis-server';
const redis=launch(redisBin,['--bind','127.0.0.1','--port',String(redisPort),'--save','','--appendonly','no'],{});
const {createClient}=await import('redis');const client=createClient({socket:{host:'127.0.0.1',port:redisPort,connectTimeout:3000,reconnectStrategy:()=>false}});client.on('error',()=>{});await client.connect();
try {const port=await reserve();const base=`http://127.0.0.1:${port}`;const username='verify-cache-user';
await client.setEx(username,100,JSON.stringify({login:username,name:'Cache verification',bio:'Disposable cache fixture',public_repos:3,followers:4,following:5}));
const child=launch(process.execPath,['index.js'],{PORT:String(port),REDIS_PORT:String(redisPort)});await ready(base,`/repos/${username}`,child);
const first=await request(base+`/repos/${username}`);assert.equal(first.status,200);assert(first.text.includes('Cache verification'));assert(first.text.includes('Public Repositories: 3'));assert(first.text.includes('Followers: 4'));assert(await client.ttl(username)>0);
const second=await request(base+`/repos/${username}`);assert.equal(second.text,first.text);evidence.actions.push({redis:'fixture readback',stored:JSON.parse(await client.get(username)),ttl:await client.ttl(username)});
evidence.boundary='Real isolated Redis and real HTTP cache-hit path; preseeded fixture means GitHub cache-miss/provider failure paths are NOT verified. No public API calls made.';
} finally {await client.quit();}
 evidence.result='passed';
})().catch(e=>{evidence.result='failed';evidence.error=e.stack;process.exitCode=1;}).finally(async()=>{
 for(const s of sockets)s.close();
 for(const c of children.reverse()){if(c.exitCode===null){c.kill('SIGTERM');await Promise.race([new Promise(r=>c.once('exit',r)),new Promise(r=>setTimeout(r,2000))]);if(c.exitCode===null)c.kill('SIGKILL');}}
 evidence.cleaned=children.every(c=>c.exitCode!==null||c.signalCode!==null);
 fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify(evidence,null,2));
 assert(fs.existsSync(path.join(out,'evidence.json')));console.log(JSON.stringify({result:evidence.result,evidence:out,cleaned:evidence.cleaned}));
});
