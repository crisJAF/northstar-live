import {test} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {createRoom,join,advance,snapshot} from '../server/game.js';
test('individual puzzle renders retry clock; ranked tree renders all fourteen and one Grinch',async()=>{
 const vite=await createServer({server:{middlewareMode:true},appType:'custom'});
 try{
  const Puzzle=(await vite.ssrLoadModule('/src/Puzzle.jsx')).default;
  const Tree=(await vite.ssrLoadModule('/src/RankingTree.jsx')).default;
  const r=createRoom();for(let i=0;i<14;i++)join(r,'Jugador '+i);advance(r);const state=snapshot(r,false,r.players[0].id);
  const html=renderToStaticMarkup(React.createElement(Puzzle,{puzzle:state.puzzle,act:()=>{},sceneId:'access',now:Date.now()}));
  assert.ok(html.includes('Enviar mi respuesta'));assert.ok(html.includes('Reno, Regalo, Copo'));assert.ok(!html.includes('Correcta'));
  const tree=renderToStaticMarkup(React.createElement(Tree,{ranking:state.ranking}));assert.equal((tree.match(/class="ornament-rank"/g)||[]).length,14);assert.equal((tree.match(/aria-label="Adorno del Grinch"/g)||[]).length,1);
 }finally{await vite.close();}
});
