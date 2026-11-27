import { randomBytes, randomUUID } from 'node:crypto';
import { scenes } from '../shared/story.js';
export function createRoom(){return {code:randomBytes(3).toString('hex').toUpperCase(),hostKey:randomUUID(),players:[],scene:0,closed:false,votes:{},proposals:{},approved:[],energy:0,ready:[],history:[]};}
export function join(room,name,token){
 let player=room.players.find(p=>p.token===token);
 if(player)return player;
 if(room.players.length>=20)throw Error('La sala está llena.');
 if(typeof name!=='string'||!name.trim()||name.trim().length>24)throw Error('Usá un apodo de 1 a 24 caracteres.');
 player={id:randomUUID(),token:randomUUID(),name:name.trim(),team:room.players.filter(p=>p.team===0).length<=room.players.filter(p=>p.team===1).length?0:1,online:false,holding:false};room.players.push(player);return player;
}
export function options(room){return scenes[room.scene].type==='ballot'?room.approved.map(id=>({id,label:room.proposals[id]})): (scenes[room.scene].options||[]).map((label,id)=>({id:String(id),label}));}
export function vote(room,id,value){if(room.closed||!['vote','ballot'].includes(scenes[room.scene].type)||!options(room).some(o=>o.id===value))throw Error('Ese voto no está disponible.');room.votes[id]=value;}
export function result(room){const opts=options(room);const counts=opts.map(o=>({...o,count:Object.values(room.votes).filter(v=>v===o.id).length}));const max=Math.max(0,...counts.map(o=>o.count));const winners=counts.filter(o=>o.count===max&&max>0);return {counts,winners};}
export function advance(room){if(room.scene>=scenes.length-1)return; if(room.scene===2&&!room.approved.length)throw Error('Aprobá al menos una propuesta.');room.history.push({scene:room.scene,...result(room)});room.scene++;room.closed=false;room.votes={};room.players.forEach(p=>p.holding=false);}
export function snapshot(room,host=false){return {code:room.code,scene:room.scene,closed:room.closed,players:room.players.map(({token,holding,...p})=>p),responded:Object.keys(room.votes).length,options:options(room),results:room.closed?result(room):null,proposals:host?room.proposals:undefined,approved:host?room.approved:undefined,energy:room.energy,ready:room.ready,history:room.history,holding:[0,1].map(t=>room.players.filter(p=>p.team===t&&p.holding&&p.online).length)};}
