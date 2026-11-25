import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normaliseServiceGroup,filterServices,countServiceGroups,serviceGroups,setupServiceFilter} from '../services-filter.mjs';

const services=[{id:'cdp',groups:['cdp']},{id:'training',groups:['cdp']},{id:'landing',groups:['website']},{id:'image',groups:['website','social','social']},{id:'zalo',groups:['zalo']}];
test('filters retain source order and restore every service for all or unknown groups',()=>{
  assert.deepEqual(filterServices(services,'cdp').map(s=>s.id),['cdp','training']);
  assert.deepEqual(filterServices(services,'website').map(s=>s.id),['landing','image']);
  assert.deepEqual(filterServices(services,'all'),services);
  assert.deepEqual(filterServices(services,'unknown'),services);
  assert.deepEqual(filterServices(services,'private'),[]);
  assert.equal(normaliseServiceGroup(null),'all');
});
test('counts support multi-group cards without counting a repeated tag twice',()=>{
  assert.deepEqual(countServiceGroups(services),{all:5,cdp:2,website:2,private:0,zalo:1,social:1,analytics:0,ai:0});
  assert.deepEqual(countServiceGroups([]),{all:0,cdp:0,website:0,private:0,zalo:0,social:0,analytics:0,ai:0});
});
test('the expanded catalogue preserves the original twelve services and agreed pricing',()=>{
  const html=readFileSync(new URL('../dich-vu/index.html',import.meta.url),'utf8');
  const cards=[...html.matchAll(/<article class="service-card[^>]*data-service-groups="([^"]+)"/g)].map(match=>({groups:match[1].split(/\s+/)}));
  assert.equal(cards.length,14);
  assert.deepEqual(countServiceGroups(cards),{all:14,cdp:2,website:3,private:2,zalo:2,social:3,analytics:1,ai:1});
  assert.equal([...html.matchAll(/class="service-price"[^>]*>Nhắn Zalo nhận báo giá/g)].length,14);
  assert.equal([...html.matchAll(/class="service-price-amount">Liên hệ</g)].length,14);
  assert.equal(html.includes('399.000'),false);
  for(const title of ['Dịch vụ thiết kế Landing Page','Đào tạo và hỗ trợ sử dụng CNVCDP','Thiết kế ảnh sản phẩm đăng sàn TMĐT'])assert.ok(html.includes(`<h3>${title}</h3>`));
});

test('filter controls update actual card visibility, counts, focus and shareable URLs, then clean up',()=>{
  class Element extends EventTarget {
    constructor(dataset={}){super();this.dataset=dataset;this.hidden=false;this.textContent='';this.attrs=new Map();}
    setAttribute(key,value){this.attrs.set(key,value);}
    querySelector(){return this.count;}
    focus(options){this.focusOptions=options;}
    getBoundingClientRect(){return{left:0,right:200};}
  }
  const nodes=services.map(service=>new Element({serviceGroups:service.groups.join(' ')}));
  const buttons=serviceGroups.map(group=>{const n=new Element({serviceFilter:group.id});n.count=new Element();return n;});
  const controls=new Element();controls.scrollWidth=600;controls.clientWidth=600;controls.querySelectorAll=()=>buttons;
  const grid={querySelectorAll:()=>nodes};
  const count=new Element(),status=new Element(),empty=new Element();
  const host=new Element();
  host.querySelector=selector=>({'[data-service-filters]':controls,'[data-service-grid]':grid,'[data-service-count]':count,'[data-service-status]':status,'[data-service-empty]':empty})[selector];
  const view=new EventTarget();view.location={href:'https://example.com/dich-vu/?nguon=test&nhom=cdp#catalog-title'};
  view.history={state:{keep:true},replaceState(state,title,url){this.state=state;view.location.href=String(url);}};
  const api=setupServiceFilter({querySelector:()=>host},view);
  assert.equal(api.getState(),'cdp');
  assert.deepEqual(nodes.map(n=>n.hidden),[false,false,true,true,true]);
  assert.equal(count.textContent,'02 / 05 dịch vụ');
  buttons[2].dispatchEvent(new Event('click'));
  assert.deepEqual(nodes.map(n=>n.hidden),[true,true,false,false,true]);
  assert.equal(new URL(view.location.href).searchParams.get('nhom'),'website');
  assert.equal(new URL(view.location.href).searchParams.get('nguon'),'test');
  assert.equal(new URL(view.location.href).hash,'#catalog-title');
  assert.deepEqual(view.history.state,{keep:true});
  const end=new Event('keydown',{cancelable:true});end.key='End';buttons[2].dispatchEvent(end);
  assert.equal(api.getState(),'ai');
  assert.ok(nodes.every(n=>n.hidden));
  assert.deepEqual(buttons[7].focusOptions,{preventScroll:true});
  buttons[3].dispatchEvent(new Event('click'));
  assert.equal(empty.hidden,false);
  buttons[0].dispatchEvent(new Event('click'));
  assert.ok(nodes.every(n=>!n.hidden));
  assert.equal(new URL(view.location.href).searchParams.has('nhom'),false);
  view.location.href='https://example.com/dich-vu/?nhom=zalo';view.dispatchEvent(new Event('popstate'));
  assert.equal(api.getState(),'zalo');
  api.destroy();
  assert.ok(nodes.every(n=>!n.hidden));assert.equal(controls.hidden,true);
  buttons[1].dispatchEvent(new Event('click'));assert.ok(nodes.every(n=>!n.hidden));
});
