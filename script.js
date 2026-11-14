<<<<<<< ours
const order = [];
const orderList = document.querySelector('#order-list');
const orderTotal = document.querySelector('#order-total');
const orderStatus = document.querySelector('#order-status');
const clearOrderButton = document.querySelector('#clear-order');
const printOrderButton = document.querySelector('#print-order');

function renderOrder() {
  orderList.innerHTML = '';
  if (order.length === 0) {
    orderList.innerHTML = '<li class="empty-order">No items yet — choose something from the menu above.</li>';
  } else {
    order.forEach((item, index) => {
      const row = document.createElement('li');
      row.className = 'order-item';
      row.innerHTML = `<span>${item.name}</span><strong>$${item.price.toFixed(2)}</strong><button type="button" aria-label="Remove ${item.name}" data-remove="${index}">×</button>`;
      orderList.appendChild(row);
    });
  }

  const total = order.reduce((sum, item) => sum + item.price, 0);
  orderTotal.textContent = `$${total.toFixed(2)}`;
}

document.querySelectorAll('.buy-button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = {name: button.dataset.item, price: Number(button.dataset.price)};
    order.push(item);
    renderOrder();
    orderStatus.textContent = `${item.name} added to your order.`;
    document.querySelector('#order').scrollIntoView({behavior: 'smooth', block: 'center'});
  });
});

orderList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove]');
  if (!removeButton) return;
  const removed = order.splice(Number(removeButton.dataset.remove), 1)[0];
  renderOrder();
  orderStatus.textContent = `${removed.name} removed from your order.`;
});

clearOrderButton.addEventListener('click', () => {
  order.length = 0;
  renderOrder();
  orderStatus.textContent = 'Your order has been cleared.';
});

printOrderButton.addEventListener('click', () => {
  if (order.length === 0) {
    orderStatus.textContent = 'Add an item before printing your order.';
    return;
  }
  window.print();
});

renderOrder();
=======
const $=selector=>document.querySelector(selector);
const storageKey='savesprout-data-v1';
if(new URLSearchParams(location.search).has('fresh'))localStorage.removeItem(storageKey);
const defaults={name:'',pet:'Pip',goal:0,date:'',saved:0,expenses:[],streak:0,lastVisit:''};
let data={...defaults,...(JSON.parse(localStorage.getItem(storageKey)||'null')||{})};
const today=()=>new Date().toISOString().slice(0,10);
const money=value=>`¥${Math.round(Number(value)||0).toLocaleString('zh-CN')}`;
const save=()=>localStorage.setItem(storageKey,JSON.stringify(data));
function updateStreak(){if(data.lastVisit!==today()){const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);data.streak=data.lastVisit===yesterday?(data.streak||0)+1:1;data.lastVisit=today();save();}}
function fillGoalForm(){$('#name-input').value=data.name;$('#pet-input').value=data.pet||'Pip';$('#goal-input').value=data.goal||'';$('#date-input').value=data.date||'';}
function updatePetMood(percent){$('#pet-mood').textContent=percent>=100?'目标完成啦！':percent>60?'越来越有精神':'等你来喂养';}
function renderExpenses(){const list=$('#expense-list');if(!data.expenses.length){list.innerHTML='<li class="empty-state">还没有记录，第一笔由你开始。</li>';return;}list.innerHTML=data.expenses.slice(0,5).map((item,index)=>`<li><strong>${item.category}</strong><span>${item.note||'日常消费'}</span><b>-${money(item.amount)}</b><button class="remove-expense" type="button" data-index="${index}" aria-label="删除这条记录">×</button></li>`).join('');document.querySelectorAll('.remove-expense').forEach(button=>button.addEventListener('click',()=>{data.expenses.splice(Number(button.dataset.index),1);save();render();}));}
function renderChart(){const days=[];for(let i=6;i>=0;i--){const date=new Date(Date.now()-i*86400000).toISOString().slice(0,10);days.push(data.expenses.filter(item=>item.date===date).reduce((sum,item)=>sum+Number(item.amount),0));}const max=Math.max(...days,1);$('#weekly-total').textContent=money(days.reduce((sum,value)=>sum+value,0));$('#bar-chart').innerHTML=days.map((value,index)=>`<span class="bar ${index===6?'active':''}" style="height:${Math.max(8,value/max*100)}%"><small>${value?money(value):''}</small></span>`).join('');}
function renderInsight(goal,saved,percent){let title='先设定一个目标吧。',detail='有了目标，Pip 才能帮你看见每一步的意义。';if(goal&&percent>=100){title='你把目标养大了！';detail='这份确定感是你自己一点一点存下来的。'}else if(goal&&percent>=60){title='进度很漂亮。';detail=`已经完成 ${percent}%，再坚持一下就能抵达。`}else if(data.expenses.length){title='记录本身就是进步。';detail='看看最近的花费，选择一个今天可以少花的小地方。'}$('#insight-title').textContent=title;$('#insight-detail').textContent=detail;$('#insight-copy').textContent=goal?`已完成 ${percent}%，目标日期 ${data.date||'还未设置'}。`:'每一笔小记录，都会变成一张更清晰的地图。';}
function render(){const goal=Number(data.goal)||0;const saved=Number(data.saved)||0;const percent=goal?Math.min(100,Math.round(saved/goal*100)):0;$('#profile-label').textContent=data.name||'创建档案';$('#user-name').textContent=data.name||'朋友';$('#pet-name-display').textContent=data.pet||'Pip';$('#pet-greeting').textContent=data.pet?`${data.pet} 在这里。`:'准备好了吗？';$('#pet-message').textContent=saved>0?`${data.pet||'Pip'} 感受到你的坚持了。继续保持！`:'每一次记录，都会让我们的目标更近一点。';$('#goal-amount').textContent=money(goal);$('#saved-amount').textContent=money(saved);$('#remaining-amount').textContent=`还差 ${money(Math.max(0,goal-saved))}`;$('#progress-percent').textContent=`${percent}%`;$('#progress-bar').style.width=`${percent}%`;$('#dashboard-jar-fill').style.height=`${Math.max(8,percent)}%`;$('#hero-jar-fill').style.height=`${Math.max(8,percent)}%`;$('#streak-count').textContent=data.streak||0;$('#expense-total').textContent=`本月 ${money(data.expenses.reduce((sum,item)=>sum+Number(item.amount),0))}`;renderExpenses();renderChart();renderInsight(goal,saved,percent);updatePetMood(percent);fillGoalForm();}
$('#goal-form').addEventListener('submit',event=>{event.preventDefault();data.name=$('#name-input').value.trim();data.pet=$('#pet-input').value.trim()||'Pip';data.goal=Number($('#goal-input').value)||0;data.date=$('#date-input').value;updateStreak();save();render();$('#dashboard').scrollIntoView({behavior:'smooth'});});
$('#expense-form').addEventListener('submit',event=>{event.preventDefault();const amount=Number($('#expense-input').value);if(!amount)return;data.expenses.unshift({amount,category:$('#category-input').value,note:$('#note-input').value.trim(),date:today()});updateStreak();save();event.target.reset();render();$('#expense-list').scrollIntoView({behavior:'smooth',block:'center'});});
$('#savings-form').addEventListener('submit',event=>{event.preventDefault();const amount=Number($('#saving-input').value);if(!amount)return;data.saved+=amount;updateStreak();save();event.target.reset();render();});
$('#feed-pet').addEventListener('click',()=>{const button=$('#feed-pet');button.innerHTML='Pip 开心地摇尾巴 <span>✦</span>';$('#pet-message').textContent='谢谢你！今天也一起慢慢来。';setTimeout(()=>{button.innerHTML=`给 ${data.pet||'Pip'} 一颗心 <span>♡</span>`;},2200);});
$('#profile-button').addEventListener('click',()=>{const dialog=$('#profile-dialog');$('#dialog-title').textContent=data.name?`欢迎回来，${data.name}。`:'先创建一个小档案。';if(typeof dialog.showModal==='function')dialog.showModal();else alert('你的资料只保存在当前浏览器。');});
$('#edit-goal').addEventListener('click',()=>$('#goal').scrollIntoView({behavior:'smooth'}));
updateStreak();render();
>>>>>>> theirs
