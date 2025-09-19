// Simple demo data and UI wiring
const DATA = {
  tasks: [
    {id:1,title:'Design logo',clientId:1,price:120,status:'available',created:'2025-09-01'},
    {id:2,title:'Write landing page copy',clientId:2,price:80,status:'available',created:'2025-09-02'},
    {id:3,title:'SEO audit',clientId:3,price:200,status:'done',created:'2025-08-25',completed:'2025-09-05'}
  ],
  clients: [
    {id:1,name:'Acme Co',email:'jobs@acme.example',avatar:'/icons/logo.svg'},
    {id:2,name:'Bright Ltd',email:'hello@bright.example',avatar:'/icons/logo.svg'},
    {id:3,name:'Cedar LLC',email:'tasks@cedar.example',avatar:'/icons/logo.svg'}
  ],
  notifications: [
    {id:1,fromClientId:1,message:'Can you expedite the logo?',time:'2025-09-10 09:12'},
    {id:2,fromClientId:2,message:'Please update copy to include pricing.',time:'2025-09-11 14:05'}
  ]
};

// Render helpers
function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

function renderDashboard(){
  const avail = DATA.tasks.filter(t=>t.status==='available');
  const done = DATA.tasks.filter(t=>t.status==='done');
  const revenue = done.reduce((s,t)=>s+(t.price||0),0);

  $('#availableCount').textContent = avail.length;
  $('#completedCount').textContent = done.length;
  $('#revenueTotal').textContent = `$${revenue}`;
  $('#clientsTotal').textContent = DATA.clients.length;

  const availList = $('#availableTasks'); availList.innerHTML='';
  avail.forEach(t=>{
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${t.title}</strong><div class="meta">${t.created} • $${t.price}</div></div><button class="btn-claim" data-id="${t.id}">Claim</button>`;
    availList.appendChild(li);
  });

  const hist = $('#historyList'); hist.innerHTML='';
  done.forEach(t=>{
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${t.title}</strong><div class="meta">Completed ${t.completed} • $${t.price}</div></div>`;
    hist.appendChild(li);
  });
}

function renderClients(){
  const list = $('#clientsList'); list.innerHTML='';
  DATA.clients.forEach(c=>{
    const li = document.createElement('li');
    li.innerHTML = `<img src="${c.avatar}" alt="${c.name}"><div><strong>${c.name}</strong><div class="meta">${c.email}</div></div>`;
    list.appendChild(li);
  });
}

function renderNotifications(){
  const list = $('#notificationsList'); list.innerHTML='';
  DATA.notifications.forEach(n=>{
    const client = DATA.clients.find(c=>c.id===n.fromClientId) || {name:'Client'};
    const li = document.createElement('li');
    li.innerHTML = `<div><strong>${client.name}</strong><div class="meta">${n.message}</div></div><div class="meta">${n.time}</div>`;
    list.appendChild(li);
  });
}

function hookClaimButtons(){
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('.btn-claim');
    if(!btn) return;
    const id = Number(btn.dataset.id);
    const task = DATA.tasks.find(t=>t.id===id);
    if(task){
      task.status='done'; task.completed=new Date().toISOString().slice(0,10);
      renderDashboard(); renderNotifications();
      alert('Task claimed and marked done — demo only.');
    }
  });
}

function setupTabs(){
  $all('.tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      $all('.tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.target;
      $all('.view').forEach(v=>v.classList.remove('active'));
      $(`#${target}`).classList.add('active');
      $('#page-title').textContent = target.charAt(0).toUpperCase() + target.slice(1);
      // render view on show
      if(target==='dashboard') renderDashboard();
      if(target==='clients') renderClients();
      if(target==='notifications') renderNotifications();
    });
  });
}

// Clock in statusbar
function startClock(){
  const el = document.querySelector('.status-clock');
  function tick(){
    const d = new Date();
    el.textContent = d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
  }
  tick(); setInterval(tick,60000);
}

// PWA install prompt handling (desktop/Android)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault(); deferredPrompt = e;
  // optionally show install UI
});

// Service worker registration
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').catch(e=>console.warn('SW failed',e));
}

// Init
document.addEventListener('DOMContentLoaded', ()=>{
  setupTabs(); renderDashboard(); startClock(); hookClaimButtons();
});

