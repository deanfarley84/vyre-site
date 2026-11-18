let shortNotice = true;
function complexEnquirySteps(){
  const channel = enquiryChannels[selectedChannel];
  const notice = shortNotice ? '24 hours' : '72 hours';
  const reply = shortNotice
    ? 'Thursday at 10 is available and your existing rate still applies. The usual change fee is €40. I’ve asked your account manager about waiving it and kept your original booking in place.'
    : 'I’ve moved your booking to Thursday at 10. Your existing rate still applies, and there is no change fee. Your updated confirmation is ready.';
  return [
    ['Understand the request',channel.source,'“Please move our booking to Thursday at 10 if there is no fee. Does our agreed rate still apply? If there is a fee, could you waive it?”','Three questions · Date change, account pricing and fee exception'],
    ['Check business records','Adelante AI Brain','The account agreement fixes the rate through renewal. The change policy allows free moves with at least 48 hours’ notice and otherwise charges €40. The diary shows Thursday at 10 available. This request arrived '+notice+' before the original booking.','Evidence · Account agreement, change policy and booking diary'],
    ['Reply to the customer',channel.reply,'“'+reply+'”',shortNotice?'Confirmed facts answered · Waiver pending':'All three questions resolved under the agreed rules'],
    ['Update and follow up','CRM and team workflow',shortNotice?'Log the conversation and its sources, retain the original booking and create a waiver-review task for the account manager. The customer receives the decision after review.':'Recheck the slot, apply the authorised booking change, record the preserved rate and zero fee, and log the confirmation against the same CRM contact.',shortNotice?'Case open · Account manager owns the waiver decision':'Case resolved · Booking and contact timeline updated']
  ];
}
const agentRoutes = [
  {
    get name(){return enquiryChannels[selectedChannel].agent},
    get title(){return enquiryChannels[selectedChannel].source+' to CRM and follow-up'},
    get steps(){
      const c=enquiryChannels[selectedChannel],phone=selectedChannel==='phone';
      return [
        [phone?'Call answered':'Enquiry received',c.source,phone?'“Hello, you’re speaking with the AI assistant. How can I help?” The caller asks: “'+c.question+'”':'“'+c.question+'”','Incoming '+c.name+' enquiry'],
        [phone?'Request clarified':'Intent identified',c.agent,phone?'The voice agent identifies a tailored quote request, checks the callback details with the caller and uses the agreed handover rule.':'The agent checks the request against approved service information and matches the conversation to the customer record.','Intent and next action identified'],
        ['CRM updated','Contact timeline',phone?'Record the confirmed number, preferred callback time, reason for the call and team owner on the contact record.':'Match or create the contact, record the original channel and log the enquiry and next action.',c.record],
        [phone?'Callback confirmed':'Reply sent',c.reply,phone?'“Thank you. I’ve passed your quote request and preferred time to our team.” The callback owner receives the call summary and task.':'“'+c.answer+'” The agent logs the reply and routes any exception to the team.',c.owner+' · '+(phone?'Callback task created':'Reply logged')]
      ];
    }
  },
  {
    name: 'Lead generation agent',
    title: 'From campaign response to sales conversation',
    steps: [
      ['Lead captured', 'Campaign form', 'A prospect responds to a campaign and requests a callback about reducing manual administration. The form includes their business email and preferred contact channel.', 'Callback requested'],
      ['Lead qualified', 'AI lead agent', 'The agent checks the business against the agreed target profile and identifies the stated need and buying timeframe. Missing details trigger a qualifying question.', 'Target profile matched · Project this quarter'],
      ['CRM updated', 'Sales pipeline', 'The agent checks for an existing contact and opportunity, records the campaign source and assigns the qualified lead to the sales owner.', 'Qualified · Sales owner assigned'],
      ['Follow-up sent', 'Prospect inbox', '“Thanks for requesting a callback about your admin workflow. Would morning or afternoon suit you?” The agent records the outgoing reply and creates a callback task.', 'Follow-up logged · Callback due']
    ]
  },
  {name:'Complex enquiry agent',title:'One enquiry, three business decisions',get steps(){return complexEnquirySteps()}}
];
const agentTabs = document.querySelector('#agentTabs');
const agentSteps = document.querySelector('#agentSteps');
let routeIndex = 0;
let stageIndex = 0;
function displayAgentStage(index) {
  stageIndex = index;
  const route = agentRoutes[routeIndex];
  const [name,system,description,result] = route.steps[index];
  [...agentSteps.children].forEach((button,i) => {
    button.setAttribute('aria-pressed',i === index);
    button.classList.toggle('passed',i < index);
  });
  document.querySelector('#agentDetail').innerHTML = '<small>'+system+'</small><h3>'+name+'</h3><p>'+description+'</p><strong>'+result+'</strong>';
  if(routeIndex===2){
    const panel=document.querySelector('#agentDetail');
    const controls=document.createElement('fieldset');
    controls.className='case-switch';
    controls.innerHTML='<legend>Test the notice period</legend>';
    for(const [value,label] of [[true,'24 hours · exception'],[false,'72 hours · automatic']]){
      const b=document.createElement('button');
      b.textContent=label;
      b.setAttribute('aria-pressed',shortNotice===value);
      b.onclick=()=>{shortNotice=value;displayAgentStage(index);document.querySelector('.case-switch [aria-pressed="true"]').focus()};
      controls.append(b);
    }
    panel.append(controls);
  }
  document.querySelector('#agentNext').textContent = index === route.steps.length-1 ? 'Replay example ↺' : 'Next step →';
}
function displayAgentRoute(index) {
  routeIndex = index;
  const route = agentRoutes[index];
  [...agentTabs.children].forEach((button,i) => button.setAttribute('aria-pressed',i === index));
  agentTabs.firstElementChild.textContent = enquiryChannels[selectedChannel].agent;
  document.querySelector('#agentTitle').textContent = route.title;
  agentSteps.replaceChildren();
  route.steps.forEach(([name],i) => {
    const button = document.createElement('button');
    button.textContent = name;
    button.onclick = () => displayAgentStage(i);
    agentSteps.append(button);
  });
  displayAgentStage(0);
}
agentRoutes.forEach(({name},i) => {
  const button = document.createElement('button');
  button.textContent = name;
  button.onclick = () => displayAgentRoute(i);
  agentTabs.append(button);
});
document.querySelector('#agentNext').onclick = () => displayAgentStage((stageIndex + 1) % agentRoutes[routeIndex].steps.length);
displayAgentRoute(0);
