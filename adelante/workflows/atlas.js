(() => {
  const columns = [
    ['Your company','Where the work starts',[
      ...Object.entries(enquiryChannels).map(([key,c])=>[key,c.name,c.source,c.question+' '+c.agent+' logs the request and routes the next action to '+c.owner+'.']),
      ['crm','CRM & campaigns','Accounts, contacts and leads','Match new interest to existing records so the customer history stays together.'],
      ['docs','Business documents','Service guides and policies','Use approved service information when preparing answers and checking proposed actions.'],
      ['meet','Meetings & calendar','Notes and commitments','Find agreed deadlines, upcoming meetings and promises that need an owner.'],
      ['tasks','Team operations','Tasks, owners and status','Read the current state of work to identify outstanding actions and overdue handovers.']]],
    ['Adelante AI Brain','How information becomes usable',[
      ['knowledge','Service knowledge','What the business offers','Links approved answers to the source document. A question outside the guide goes to the team.'],
      ['terms','Account terms & exceptions','Agreed prices, fees and notice periods','Read the current account agreement alongside standard policy. Check which terms apply, and send discretionary exceptions to the authorised owner.'],
      ['capacity','Operational availability','Slots, existing bookings and deadlines','Check the existing commitment and the requested slot before offering a change. Recheck availability before confirming it.'],
      ['context','Customer context','Who is asking and why','Connects messages, campaign details and CRM history to the relevant account and enquiry.'],
      ['memory','Decision memory','What was agreed','Associates a commitment with its source, owner and due date so the next team can act on it.'],
      ['policy','Rules & permissions','What the agent may do','Applies the agreed boundaries for access, routine replies, record updates and human approval.']]],
    ['Automations','What Adelante manages',[
      ['reply','Enquiry agent','Answer and log','Checks the service guide, updates the contact record and sends an approved routine answer.'],
      ['complex','Complex enquiry agent','Resolve multi-part requests','Combines account terms, customer history, policies and availability. Answers each question, completes authorised changes and assigns outstanding exceptions.'],
      ['voice','AI voice agent','Answer inbound calls','Answers spoken enquiries, confirms callback details, logs a call summary in the CRM and assigns unresolved questions to the team.'],
      ['lead','Lead generation agent','Qualify and follow up','Qualifies campaign responses, updates the opportunity, sends a follow-up and assigns the next sales action.'],
      ['follow','Meeting follow-ups','Prepare and assign','Turns an agreed commitment into a proposed task update for the responsible lead.'],
      ['brief','Daily management brief','Surface decisions','Connects open work to upcoming commitments so managers know where a decision is needed.'],
      ['review','Workflow review','Find recurring delays','Reviews handovers and flags repeated delays for the process owner to investigate.']]],
    ['Who uses it','Who receives the result',[
      ['service','Customer service','Routine replies and exceptions','Receives the conversation, the answer already sent and any question requiring personal attention.'],
      ['sales','Sales team','Qualified leads and callbacks','Receives a qualified opportunity with its source, conversation history and next action recorded.'],
      ['team','Employees & team leads','Owned actions and deadlines','Review proposed actions and confirm who will deliver each commitment.'],
      ['leaders','Management','Priorities and approvals','Review exceptions and decide where attention or approval is needed today.'],
      ['owners','Process owners','Evidence and improvements','Inspect repeated delays, agree changes and track whether the handover improves.']]]
  ];
  const flows = [
    {source:['web','email','whatsapp','docs','crm'],brain:['knowledge','context','policy'],action:'reply',roles:['service'],demo:'ai-agents',index:0},
    {source:['web','email','phone','whatsapp','crm','docs','meet'],brain:['knowledge','context','terms','capacity','policy'],action:'complex',roles:['service','sales'],demo:'ai-agents',index:2},
    {source:['phone','crm','docs'],brain:['knowledge','context','policy'],action:'voice',roles:['service','sales'],demo:'ai-agents',index:0},
    {source:['crm','web','email','whatsapp','phone'],brain:['context','policy'],action:'lead',roles:['sales'],demo:'ai-agents',index:1},
    {source:['meet','tasks'],brain:['memory','policy'],action:'follow',roles:['team'],demo:'studio',index:0},
    {source:['meet','tasks'],brain:['memory'],action:'brief',roles:['leaders','team'],demo:'studio',index:1},
    {source:['tasks','crm'],brain:['context','memory'],action:'review',roles:['owners','leaders'],demo:'studio',index:2}
  ];
  const inputs={...Object.fromEntries(Object.keys(enquiryChannels).map(key=>[key,['knowledge','context','policy']])),crm:['context','terms','policy'],docs:['knowledge','terms','policy'],meet:['memory','capacity'],tasks:['memory','policy']};
  const map=document.getElementById('atlasMap'),svg=map.querySelector('svg'),detail=document.getElementById('atlasDetail');
  const nodes=new Map(),edges=new Map();
  let selected=null;
  function addEdge(a,b,flow){const key=a+'|'+b;if(!edges.has(key))edges.set(key,new Set());edges.get(key).add(flow)}
  flows.forEach(f=>{
    f.source.forEach(a=>f.brain.filter(b=>inputs[a].includes(b)).forEach(b=>addEdge(a,b,f)));
    f.brain.forEach(b=>addEdge(b,f.action,f));f.roles.forEach(b=>addEdge(f.action,b,f));
  });
  columns.forEach(([title,subtitle,items],i)=>{
    const col=document.createElement('div');col.className='atlascol col'+i;
    col.innerHTML='<div class="atlashead"><small>0'+(i+1)+'</small><h2>'+title+'</h2></div><p>'+subtitle+'</p>';
    items.forEach(([id,label,sub,description])=>{
      const button=document.createElement('button');button.innerHTML='<b>'+label+'</b><span>'+sub+'</span>';
      button.onclick=()=>{if(enquiryChannels[id])selectChannel(id);else select(id)};col.append(button);nodes.set(id,{button,label,description});
    });map.append(col);
  });
  function select(id){
    selected=id;
    const matches=flows.filter(f=>[...f.source,...f.brain,f.action,...f.roles].includes(id));
    const lit=new Set();
    for(const path of svg.children){
      const [a,b]=path.dataset.edge.split('|');
      const active=id!==null && [...edges.get(path.dataset.edge)].some(f=>matches.includes(f)) &&
        (nodes.get(id).button.parentElement!==nodes.get(a).button.parentElement||a===id) &&
        (nodes.get(id).button.parentElement!==nodes.get(b).button.parentElement||b===id);
      path.classList.toggle('trace',active);if(active){lit.add(a);lit.add(b)}
    }
    nodes.forEach(({button},key)=>{button.setAttribute('aria-pressed',key===id);button.classList.toggle('related',lit.has(key))});
    detail.replaceChildren();
    const content=document.createElement('div');content.innerHTML=id?'<strong>'+nodes.get(id).label+'</strong><p>'+nodes.get(id).description+'</p>':'<strong>Explore the service from either end</strong><p>Select a business record to follow it forwards, or a team to trace its work back to the source.</p>';detail.append(content);
    if(id)matches.forEach(f=>{const link=document.createElement('a');link.href='#'+f.demo;link.textContent=nodes.get(f.action).label+' demo ↗';link.onclick=()=>{if(f.demo==='ai-agents'){selectChannel(f.action==='voice'?'phone':enquiryChannels[id]?id:selectedChannel==='phone'&&f.action==='reply'?'web':selectedChannel);displayAgentRoute(f.index)}else switchView(f.index)};detail.append(link)});
    document.getElementById('resetAtlas').disabled=id===null;
  }
  function draw(){
    const bounds=map.getBoundingClientRect();svg.replaceChildren();
    for(const key of edges.keys()){
      const [a,b]=key.split('|').map(id=>nodes.get(id).button.getBoundingClientRect());
      const x=a.right-bounds.left,y=a.top+a.height/2-bounds.top,z=b.left-bounds.left,w=b.top+b.height/2-bounds.top,m=(x+z)/2;
      const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.dataset.edge=key;p.setAttribute('d','M'+x+' '+y+' C'+m+' '+y+' '+m+' '+w+' '+z+' '+w);svg.append(p);
    }select(selected);
  }
  document.getElementById('resetAtlas').onclick=()=>select(null);
  window.updateChannelAtlas=select;
  new ResizeObserver(draw).observe(map);draw();
})();
