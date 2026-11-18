const enquiryChannels = {
  web: {name:'Website',source:'Website chat or form',agent:'AI enquiry agent',reply:'On-screen answer',record:'Website chat · Service guide shared',owner:'Customer service',question:'Can you explain how the service works?',answer:'We start with a short review of your workflow. Would you like to arrange an introductory call?'},
  email: {name:'Email',source:'Shared email inbox',agent:'AI enquiry agent',reply:'Email reply',record:'Email thread · Introduction requested',owner:'Account owner',question:'Could you send the next steps by email?',answer:'The first step is a short review. Reply with a convenient time and our team will arrange it.'},
  phone: {name:'Phone',source:'Incoming phone call',agent:'AI voice agent',reply:'Spoken reply',record:'Call summary · Callback requested',owner:'Callback owner',question:'Could someone call me back about a tailored quote?',answer:'Of course. May I confirm your callback number and the best time for our team to reach you?'},
  whatsapp: {name:'WhatsApp',source:'WhatsApp Business',agent:'AI enquiry agent',reply:'WhatsApp reply',record:'WhatsApp conversation · Booking link requested',owner:'Bookings team',question:'Can I book an introductory call?',answer:'Yes. I can share our booking link here so you can choose a convenient time.'}
};
let selectedChannel='web';
function selectChannel(key){
  selectedChannel=key;
  const channel=enquiryChannels[key];
  document.querySelectorAll('[data-channel]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.channel===key));
  document.querySelectorAll('[data-channel-path]').forEach(el=>{
    const labels=[channel.source,channel.agent,'CRM update',channel.reply,channel.owner];
    el.replaceChildren();
    labels.forEach(label=>{const step=document.createElement('span');step.textContent=label;el.append(step)});
  });
  document.querySelectorAll('[data-crm-example]').forEach(el=>el.textContent=channel.record+' · Assigned to '+channel.owner);
  const cards=document.querySelectorAll('#gallery .storycard');
  if(cards.length){
    const phone=key==='phone';
    cards[0].querySelector('strong').textContent=phone?'Answer an inbound call':'Answer a '+channel.name+' enquiry';
    const labels=cards[0].querySelectorAll('svg text');
    labels[0].textContent=channel.name;
    labels[1].textContent=channel.reply;
    cards[0].querySelector('small').textContent=channel.agent+' · '+channel.owner;
    examples[0].story=channel.agent+' handles the enquiry. “'+channel.answer+'” The CRM records the outcome and next owner.';
    examples[1].story='The '+channel.name+' conversation contains an agreed next step. Adelante checks for an existing task, adds the commitment and routes it to '+channel.owner+'.';
    examples[2].story='The daily brief picks up the outstanding '+channel.name+' follow-up. '+channel.owner+' sees its deadline beside the CRM record.';
    showExample(0);
  }
  if(typeof displayAgentRoute==='function')displayAgentRoute(routeIndex===2?2:0);
  if(window.updateChannelAtlas)window.updateChannelAtlas(key);
}
function channelPicker(){
  const panel=document.createElement('div');panel.className='channelbar';
  for(const [key,channel] of Object.entries(enquiryChannels)){
    const b=document.createElement('button');b.textContent=channel.name;b.dataset.channel=key;b.onclick=()=>selectChannel(key);panel.append(b);
  }
  return panel;
}
function mountChannelPanels(){
  for(const [section,target] of [['ai-agents','#agentTabs'],['diagrams','#gallery'],['studio','.workspace'],['control','.wheelwrap']]){
    const marker=document.getElementById(section).querySelector(target);
    const group=document.createElement('div');group.className='channelpanel';
    group.append(channelPicker());
    const path=document.createElement('div');path.dataset.channelPath='';path.className='channelpath';group.append(path);
    if(section==='studio'){const line=document.createElement('p');line.dataset.crmExample='';group.append(line)}
    marker.before(group);
  }
  selectChannel('web');
}
