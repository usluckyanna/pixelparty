const storageKey='ai-project-data-v1';
const sampleNote='Reminder: Please bring your completed Science project outline to class on Friday, October 16. Include your question, three sources, and a sketch of your experiment. If you need more time, talk to Ms. Rivera before Thursday.';
const defaultData={note:sampleNote,language:'中文',question:'我应该先做哪一步？',result:null};
let data={...defaultData,...(JSON.parse(localStorage.getItem(storageKey)||'null')||{})};
const $=selector=>document.querySelector(selector);
function save(){localStorage.setItem(storageKey,JSON.stringify(data));}
function setText(selector,value,empty=false){const element=$(selector);element.textContent=value||'';if(empty)element.classList.toggle('empty-result',!value);}
function renderResult(result){
  if(!result){setText('#translation-result','发送一条通知后，这里会显示翻译。',true);setText('#explanation-result','这里会用更简单的话说明老师的重点。',true);setText('#answer-result','如果你填写问题，AI 会在同一次发送中回答。',true);$('#todo-list').innerHTML='<li class="empty-result">截止日期和行动清单会出现在这里。</li>';return;}
  setText('#translation-result',result.translation||'AI 没有返回翻译。');setText('#explanation-result',result.explanation||'AI 没有返回解释。');setText('#answer-result',result.answer||'没有额外问题。');
  const todos=Array.isArray(result.todos)?result.todos:[];const list=$('#todo-list');list.innerHTML='';if(!todos.length){list.innerHTML='<li>没有识别出明确的待办事项，请向老师确认。</li>';return;}todos.forEach(item=>{const li=document.createElement('li');const task=document.createElement('span');task.className='todo-task';task.textContent=item.task||'未说明任务';const date=document.createElement('span');date.className='todo-date';date.textContent=`截止日期：${item.deadline||'未说明'}`;li.append(task,date);list.appendChild(li);});
}
function render(){ $('#note-input').value=data.note||'';$('#language-input').value=data.language||'中文';$('#question-input').value=data.question||'';renderResult(data.result);}
$('#example-button').addEventListener('click',()=>{data.note=sampleNote;data.question='我应该先做哪一步？';save();render();$('#note-input').focus();});
$('#interpret-form').addEventListener('submit',async event=>{
  event.preventDefault();const button=$('#send-button');const note=$('#note-input').value.trim();const language=$('#language-input').value;const question=$('#question-input').value.trim();if(!note)return;
  button.disabled=true;$('#send-label').textContent='正在思考……';$('#thinking').textContent='正在思考……';
  try{const response=await fetch('/api/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({note,language,question})});const body=await response.json();if(!response.ok)throw new Error(body.error||'AI 暂时无法回复。');data={...data,note,language,question,result:body.result};save();renderResult(data.result);$('#results').scrollIntoView({behavior:'smooth',block:'start'});$('#thinking').textContent='已完成。请核对重要信息。';}
  catch(error){$('#thinking').textContent=error.message||'AI 暂时无法回复，请检查密钥和网络连接。';}
  finally{button.disabled=false;$('#send-label').textContent='解释这条通知';}
});
render();
