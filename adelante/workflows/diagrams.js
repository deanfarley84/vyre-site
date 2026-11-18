const examples=[
 {title:'Prepare a reply',caption:'Collect the context behind an enquiry.',source:['Inbox','Account record'],work:'Prepare reply',role:'Account owner',story:'An enquiry arrives. Adelante checks the account record and prepares a reply for the account owner to approve.'},
 {title:'Capture a commitment',caption:'Give a meeting promise an owner.',source:['Meeting notes','Task list'],work:'Assign follow-up',role:'Team lead',story:'A deadline is agreed in a meeting. Adelante finds the existing task so the team lead can confirm its owner and due date.'},
 {title:'Build the daily brief',caption:'Bring upcoming decisions into view.',source:['Diary','Task list'],work:'Prioritise brief',role:'Management',story:'A review is coming up. Adelante pairs the diary entry with its open action and brings the decision into the management brief.'}
];
const illustrations=[
 '<rect class="sheet" x="20" y="26" width="96" height="50" rx="8"/><path class="thin" d="m30 38 18 12 18-12"/><text x="30" y="66">Enquiry</text><path class="thin" d="M117 48Q144 48 150 77"/><rect class="sheet" x="135" y="65" width="98" height="62" rx="7"/><text x="148" y="88">Reply draft</text><path class="thin" d="M148 99h67m-67 9h47"/>',
 '<rect class="sheet" x="20" y="35" width="90" height="77" rx="7"/><text x="32" y="59">Meeting</text><path class="thin" d="M34 82v11m8-19v26m8-21v16m8-26v34m8-25v18m8-14v10"/><path class="thin" d="M111 72h29m-7-6 7 6-7 6"/><rect class="sheet" x="147" y="43" width="92" height="57" rx="7"/><circle class="ghost" cx="162" cy="61" r="7"/><path class="thin" d="m158 61 3 3 5-6"/><text x="175" y="65">Action</text><path class="thin" d="M157 83h66"/>',
 '<rect class="sheet" x="14" y="30" width="67" height="32" rx="6"/><text x="23" y="51">Diary</text><rect class="sheet" x="14" y="88" width="67" height="32" rx="6"/><text x="23" y="109">Tasks</text><path class="thin" d="M81 46Q110 46 119 76M81 104Q110 104 119 76h18"/><rect class="sheet" x="137" y="39" width="98" height="77" rx="7"/><text x="148" y="62">Daily brief</text><circle class="fill" cx="153" cy="77" r="3"/><circle class="fill" cx="153" cy="91" r="3"/><path class="thin" d="M163 77h57m-57 14h45"/>'
];
const gallery=document.querySelector('#gallery');
function showExample(i){
 [...gallery.children].forEach((b,j)=>b.setAttribute('aria-pressed',i===j));
 document.querySelector('#journey').textContent=examples[i].story;
}
examples.forEach((e,i)=>{const b=document.createElement('button');b.className='storycard';b.innerHTML='<svg viewBox="0 0 255 150" aria-hidden="true">'+illustrations[i]+'</svg><strong>'+e.title+'</strong><small>'+e.caption+'</small>';b.onclick=()=>showExample(i);gallery.append(b)});
showExample(1);
const levels=[['Routine','Adelante organises','Routine written enquiries receive a channel-specific reply. The voice agent answers calls, checks approved details and logs the outcome.'],['Review','Your team approves','Review an unusual request or a callback raised by the voice agent. The CRM record shows the source channel and next action.'],['Decision','People decide','Your team sets prices, handles exceptions and makes external commitments.']];
const choices=document.querySelector('#levelChoices');levels.forEach(([name,label,description],i)=>{let b=document.createElement('button');b.textContent=label;b.onclick=()=>{document.querySelector('.wheel span').textContent=name;document.querySelector('#levelText').textContent=description;[...choices.children].forEach((v,j)=>v.setAttribute('aria-pressed',i===j))};choices.append(b)});choices.firstChild.click();
