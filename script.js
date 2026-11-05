'use strict';
const menu = document.querySelector('.menu-toggle');
const nav = document.getElementById('main-nav');
const mobile = window.matchMedia('(max-width: 900px)');
function syncMenu(){nav.hidden=mobile.matches;menu.setAttribute('aria-expanded','false');}
syncMenu(); mobile.addEventListener('change',syncMenu);
menu.addEventListener('click',()=>{nav.hidden=!nav.hidden;menu.setAttribute('aria-expanded',String(!nav.hidden));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile.matches&&!nav.hidden){nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.focus();}});
const oldRoutes={'#protection-plan':'/roofing#roof-protection','#singleshingles':'/roofing#singleshingles','#calculator':'/estimate-calculator','#gallery':'/services','#about':'/about'};
if((location.pathname==='/'||location.pathname==='/index.html')&&oldRoutes[location.hash])location.replace(oldRoutes[location.hash]);
const projectForm=document.getElementById('project-form');
if(projectForm){
 const query=new URLSearchParams(location.search);
 for(const key of ['market','service','plan']){const el=projectForm.elements.namedItem(key);const val=query.get(key);if(val&&el){if(el.tagName!=='SELECT'||[...el.options].some(o=>o.value===val))el.value=val.slice(0,100);}}
 if(query.get('plan'))projectForm.elements.namedItem('service').value='HomeGuard';
 projectForm.addEventListener('submit',e=>{
  e.preventDefault();if(!projectForm.reportValidity())return;
  const data=new FormData(projectForm);const fields=[['Name','name'],['Phone','phone'],['Email','email'],['City / ZIP','city'],['Property type','market'],['Service','service'],['Preferred schedule','schedule'],['HomeGuard plan','plan'],['Project details','message']];
  const message=fields.map(([label,key])=>label+': '+(String(data.get(key)||'').trim()||'Not specified')).join('\n\n');
  document.getElementById('request-summary').textContent=message;
  document.getElementById('email-request').href='mailto:tkconstructionnetwork@gmail.com?subject='+encodeURIComponent('TKJ project request - '+data.get('service'))+'&body='+encodeURIComponent(message);
  document.getElementById('request-review').hidden=false;
 });
 document.getElementById('copy-request').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(document.getElementById('request-summary').textContent);document.getElementById('copy-status').textContent='Copied. Paste into your email or text message and send it to TKJ. Nothing has been sent by this page.';}
  catch{document.getElementById('copy-status').textContent='Please select and copy the request text above, or call TKJ at 706-888-0837.';}
 });
}
const budget=document.getElementById('budget-form');
if(budget){
 const scopes={walls:{unit:'Measured wall square feet',low:1.85,high:2.75,min:450,note:'Two finish coats on sound, prepared walls up to 9 ft. Ceiling, trim, doors, primer and extensive repairs are separate.'},lvp:{unit:'Net floor square feet',low:8.75,high:10.5,min:750,note:'Standard click LVP material and installation. Demolition, leveling, moisture mitigation, trim and transitions are separate.'},drywall:{unit:'Board surface square feet',low:4.5,high:6,min:750,note:'New board hung and finished to Level 4. Demolition, framing, insulation, texture, primer and paint are separate.'},repair:{unit:'Paid worker-hours',low:70,high:95,min:225,note:'General craft repair labor only. Materials, specialty trades and access equipment are separate.'}};
 const select=document.getElementById('budget-scope');
 select.addEventListener('change',()=>{document.getElementById('quantity-label').textContent=scopes[select.value].unit;document.getElementById('budget-result').replaceChildren();});
 budget.addEventListener('submit',e=>{e.preventDefault();if(!budget.reportValidity())return;const q=Number(budget.elements.quantity.value);const s=scopes[select.value];if(!Number.isFinite(q)||q<1||q>100000)return;
 const dollars=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Math.ceil(n/5)*5);
 const title=document.createElement('p');title.textContent=dollars(Math.max(s.min,q*s.low))+'–'+dollars(Math.max(s.min,q*s.high))+' planning range';
 const note=document.createElement('p');note.textContent=s.note+' Confirm mobilization and project-specific conditions in your written quote.';document.getElementById('budget-result').replaceChildren(title,note);
 });
}
