import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { createRoom,join,vote,advance,snapshot } from './game.js';
import { scenes } from '../shared/story.js';
export function createApp(){
 const app=express(),http=createServer(app),io=new Server(http,{maxHttpBufferSize:10000});const rooms=new Map();
 const broadcast=room=>{for(const s of io.sockets.sockets.values())if(s.data.code===room.code)s.emit('state',snapshot(room,s.data.host));};
 io.on('connection',socket=>{
  let calls=0; const limiter=setInterval(()=>calls=0,1000);
  socket.on('action',(data,ack=()=>{})=>{try{
   if(++calls>25)throw Error('Esperá un momento.');if(!data||typeof data!=='object')throw Error('Solicitud inválida.');
   if(data.type==='create'){if(rooms.size>=50)throw Error('No hay salas disponibles.');const r=createRoom();rooms.set(r.code,r);socket.data={code:r.code,host:true};ack({ok:true,code:r.code,hostKey:r.hostKey});broadcast(r);return;}
   const r=rooms.get(String(data.code||socket.data.code).toUpperCase());if(!r)throw Error('No encontramos esa sala.');
   if(data.type==='host'){if(data.key!==r.hostKey)throw Error('Clave del presentador incorrecta.');socket.data={code:r.code,host:true};}
   else if(data.type==='watch')socket.data={code:r.code};
   else if(data.type==='join'){const p=join(r,data.name,data.token);socket.data={code:r.code,player:p.id};p.online=true;ack({ok:true,token:p.token,id:p.id});broadcast(r);return;}
   else {if(socket.data.code!==r.code)throw Error('Entrá a la sala primero.');const p=r.players.find(p=>p.id===socket.data.player);const scene=scenes[r.scene];
    if(['next','close','approve','assist'].includes(data.type)){if(!socket.data.host)throw Error('Solo el presentador puede hacer eso.');
     if(data.type==='next')advance(r);if(data.type==='close')r.closed=true;
     if(data.type==='assist'&&scene.type==='charge')r.energy=100;
     if(data.type==='approve'&&scene.type==='proposal'&&r.proposals[data.id]){r.approved=r.approved.includes(data.id)?r.approved.filter(id=>id!==data.id):[...r.approved.slice(0,3),data.id];}
    }else {if(!p)throw Error('Entrá como jugador.');
     if(data.type==='vote')vote(r,p.id,String(data.value));
     if(data.type==='proposal'){if(scene.type!=='proposal'||r.closed||typeof data.text!=='string'||!data.text.trim()||data.text.length>60)throw Error('Escribí hasta 60 caracteres durante la negociación.');r.proposals[p.id]=data.text.trim();}
     if(data.type==='hold'&&scene.type==='charge'){p.holding=data.value===true;p.lastHold=Date.now();}
     if(data.type==='ready'&&scene.type==='ready'&&!r.ready.includes(p.id))r.ready.push(p.id);
    }
   }ack({ok:true});broadcast(r);
  }catch(e){ack({ok:false,error:e.message});}});
  socket.on('disconnect',()=>{clearInterval(limiter);const r=rooms.get(socket.data.code);const p=r?.players.find(p=>p.id===socket.data.player);if(p){p.online=[...io.sockets.sockets.values()].some(s=>s.data.code===r.code&&s.data.player===p.id);p.holding=false;broadcast(r);}});
 });
 const tick=setInterval(()=>{for(const r of rooms.values()){if(scenes[r.scene].type!=='charge'||r.energy>=100)continue;for(const p of r.players)if(Date.now()-p.lastHold>1500)p.holding=false;const counts=[0,1].map(t=>r.players.filter(p=>p.team===t&&p.online&&p.holding).length);const targets=[0,1].map(t=>Math.min(5,Math.max(1,r.players.filter(p=>p.team===t).length)));if(counts.every((n,i)=>n>=targets[i]))r.energy=Math.min(100,r.energy+5);broadcast(r);}},250);
 app.get('/health',(_,res)=>res.json({ok:true}));app.use(express.static(fileURLToPath(new URL('../dist',import.meta.url))));app.get('/{*path}',(_,res)=>res.sendFile(fileURLToPath(new URL('../dist/index.html',import.meta.url))));
 return {http,io,close:()=>{clearInterval(tick);io.close();http.close();}};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {http}=createApp();http.listen(Number(process.env.PORT)||3001,'0.0.0.0',()=>console.log('Northstar Live: http://localhost:3001'));}
