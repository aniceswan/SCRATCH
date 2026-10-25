import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSeriesPoems, readingProps } from '../src/lib/series-sequence.js';

const a={id:'first',data:{title:'First',order:70}};
const b={id:'second',data:{title:'Second',order:2}};
const c={id:'third',data:{title:'Third',order:99}};

test('series references preserve curated order and omit unavailable unpublished members',()=>{
 const result=resolveSeriesPoems([{id:'third'},{id:'draft'},{id:'first'}],[a,b,c]);
 assert.deepEqual(result,[c,a]);
 assert.deepEqual(resolveSeriesPoems([], [a,b]),[]);
});

test('reader numbering and neighboring links use the series order, including both ends',()=>{
 const sequence=[c,a,b];
 const first=readingProps(sequence,0,'/series/light/puisi/');
 assert.equal(first.poem,c);
 assert.equal(first.number,1);
 assert.equal(first.total,3);
 assert.deepEqual(first.previous,{title:'Second',url:'/series/light/puisi/second/'});
 assert.deepEqual(first.next,{title:'First',url:'/series/light/puisi/first/'});
 const last=readingProps(sequence,2,'/series/light/puisi/');
 assert.deepEqual(last.next,{title:'Third',url:'/series/light/puisi/third/'});
 assert.deepEqual(last.previous,{title:'First',url:'/series/light/puisi/first/'});
 assert.equal(last.number,3);
});

test('a single-poem series wraps to itself and archive reading keeps its own URLs',()=>{
 const single=readingProps([b],0,'/series/one/puisi/');
 assert.deepEqual(single.previous,single.next);
 assert.equal(single.next.url,'/series/one/puisi/second/');
 assert.equal(single.total,1);
 assert.equal(readingProps([a,b],0).next.url,'/puisi/second/');
});

test('a missing reader position cannot silently link to a different poem',()=>{
 for(const index of [-1,2,.5]) assert.throws(()=>readingProps([a,b],index),RangeError);
 assert.throws(()=>readingProps([],0),RangeError);
});
