export const serviceGroups = [
  {id:'all', label:'Tất cả'},
  {id:'cdp', label:'CDP & dữ liệu'},
  {id:'website', label:'Website & TMĐT'},
  {id:'private', label:'Private Traffic'},
  {id:'zalo', label:'Zalo OA'},
  {id:'social', label:'Content & Social'},
  {id:'analytics', label:'Phân tích & đo lường'},
  {id:'ai', label:'AI & tự động hóa'},
];

export function normaliseServiceGroup(value) {
  return serviceGroups.some(group => group.id === value) ? value : 'all';
}

export function filterServices(services, value) {
  const group = normaliseServiceGroup(value);
  return services.filter(service => group === 'all' || service.groups?.includes(group));
}

export function countServiceGroups(services) {
  return Object.fromEntries(serviceGroups.map(group => [group.id, filterServices(services, group.id).length]));
}

export function setupServiceFilter(root = document, view = globalThis) {
  const host = root.querySelector('[data-service-catalog]');
  const controls = host?.querySelector('[data-service-filters]');
  const grid = host?.querySelector('[data-service-grid]');
  if (!host || !controls || !grid || host.dataset.filterReady === 'true') return null;
  const buttons = [...controls.querySelectorAll('[data-service-filter]')];
  const services = [...grid.querySelectorAll('.service-card')].map(node => ({node, groups:(node.dataset.serviceGroups || '').split(/\s+/).filter(Boolean)}));
  if (!services.length || buttons.length !== serviceGroups.length || buttons.some((button,index) => button.dataset.serviceFilter !== serviceGroups[index].id)) return null;
  const counts = countServiceGroups(services);
  const count = host.querySelector('[data-service-count]');
  const status = host.querySelector('[data-service-status]');
  const empty = host.querySelector('[data-service-empty]');
  const cleanups = [];
  const listen = (node,event,handler) => { node.addEventListener(event,handler); cleanups.push(() => node.removeEventListener(event,handler)); };
  const pad = number => String(number).padStart(2,'0');
  let selected = 'all';

  function select(value, updateUrl = false) {
    selected = normaliseServiceGroup(value);
    const visible = new Set(filterServices(services, selected));
    services.forEach(service => { service.node.hidden = !visible.has(service); });
    const label = serviceGroups.find(group => group.id === selected).label;
    buttons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.serviceFilter === selected)));
    if (count) count.textContent = selected === 'all' ? `${pad(services.length)} dịch vụ` : `${pad(visible.size)} / ${pad(services.length)} dịch vụ`;
    if (status) status.textContent = selected === 'all' ? `Hiển thị tất cả ${services.length} dịch vụ.` : `Hiển thị ${visible.size} dịch vụ · ${label}.`;
    if (empty) empty.hidden = visible.size !== 0;
    const active = buttons.find(button => button.dataset.serviceFilter === selected);
    if (active && controls.scrollWidth > controls.clientWidth) {
      const a = active.getBoundingClientRect();
      const b = controls.getBoundingClientRect();
      if (a.left < b.left) controls.scrollLeft += a.left - b.left - 4;
      else if (a.right > b.right) controls.scrollLeft += a.right - b.right + 4;
    }
    if (updateUrl && view.location && view.history) {
      const url = new URL(view.location.href);
      if (selected === 'all') url.searchParams.delete('nhom');
      else url.searchParams.set('nhom', selected);
      view.history.replaceState(view.history.state,'',url);
    }
  }
  buttons.forEach((button,index) => {
    const key = button.dataset.serviceFilter;
    const number = button.querySelector('[data-service-group-count]');
    if (number) number.textContent = String(counts[key]);
    button.setAttribute('aria-label',`${serviceGroups[index].label}: ${counts[key]} dịch vụ`);
    listen(button,'click',() => select(key,true));
    listen(button,'keydown',event => {
      const next = event.key === 'ArrowRight' ? (index+1)%buttons.length
        : event.key === 'ArrowLeft' ? (index+buttons.length-1)%buttons.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length-1 : null;
      if (next === null) return;
      event.preventDefault();
      select(buttons[next].dataset.serviceFilter,true);
      buttons[next].focus({preventScroll:true});
    });
  });
  const initialGroup = () => view.location ? new URL(view.location.href).searchParams.get('nhom') : 'all';
  controls.hidden = false;
  if (status) status.hidden = false;
  select(initialGroup());
  if (view.addEventListener) listen(view,'popstate',() => select(initialGroup()));
  host.dataset.filterReady = 'true';
  return {getState:() => selected, destroy(){ cleanups.forEach(cleanup => cleanup()); controls.hidden=true; if(status)status.hidden=true; services.forEach(service=>{service.node.hidden=false;}); if(empty)empty.hidden=true; if(count)count.textContent=`${pad(services.length)} dịch vụ`; delete host.dataset.filterReady; }};
}

if (typeof document !== 'undefined') setupServiceFilter();
