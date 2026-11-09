
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
var sectorLabels={"hospitality":"Grupos de hostelería","restaurants":"Restaurantes y chiringuitos","hotels":"Hoteles y alojamientos","real-estate":"Inmobiliarias","salons":"Peluquerías, salones y clínicas","local-services":"Servicios locales","b2b-sales":"Ventas y oficinas","social-media":"Agencias de redes sociales"};
var defaults={hospitality:[10,60,4,45,10,25],restaurants:[12,40,5,40,8,25],hotels:[10,600,2,150,12,22],"real-estate":[8,800,0,0,6,30],salons:[6,50,4,45,6,22],"local-services":[5,350,0,0,8,25],"b2b-sales":[0,0,0,0,5,30],"social-media":[6,900,0,0,10,30]};
var industry=document.body.dataset.industry||"hospitality";
var d=defaults[industry]||defaults.hospitality;
var calc=$("calc-es");
if(calc){
var rows=[["Consultas sin respuesta por semana","c-enq",d[0]],["Valor de una reserva o venta (€)","c-value",d[1]],["Cancelaciones o ausencias por semana","c-noshow",d[2]],["Valor de una cita vacía (€)","c-slot",d[3]],["Horas semanales de administración","c-admin",d[4]],["Coste por hora (€)","c-rate",d[5]]];
calc.innerHTML='<form id="calc-form-es">'+rows.map(function(r){return '<label>'+r[0]+'<input type="number" min="0" id="'+r[1]+'" value="'+r[2]+'"></label>'}).join("")+'<label>Porcentaje de consultas recuperables: <output id="c-pct">30</output>%<input type="range" min="0" max="80" value="30" id="c-rec"></label></form><aside class="result"><h3>Valor anual potencial, según tus datos</h3><div class="big" id="c-result"></div><p>Una estimación orientativa, no ingresos comprobados ni beneficio neto.</p><a class="btn" href="#get-report">Solicitar una revisión gratuita</a></aside>';
function calculate(){var v=function(id){return Math.max(0,parseFloat($(id).value)||0)};var total=v("c-enq")*52*v("c-rec")/100*v("c-value")+v("c-noshow")*52*.5*v("c-slot")+v("c-admin")*52*.5*v("c-rate");$("c-pct").textContent=v("c-rec");$("c-result").textContent=Math.round(total).toLocaleString("es-ES")+" €"}
$("calc-form-es").addEventListener("input",calculate);calculate();
}
var lead=$("lead-es");
if(lead){
var opts=Object.keys(sectorLabels).map(function(k){return '<option value="'+k+'">'+sectorLabels[k]+'</option>'}).join("");
lead.innerHTML='<form id="lead-form-es" class="lead-form"><label>Sector *<select id="l-sector" required><option value="">Selecciona un sector</option>'+opts+'</select></label><label>Nombre de la empresa *<input id="l-business" required autocomplete="organization"></label><label>Correo electrónico de trabajo *<input id="l-email" type="email" required autocomplete="email"></label><label>Teléfono *<input id="l-phone" type="tel" required autocomplete="tel"></label><label>Tu nombre (opcional)<input id="l-name" autocomplete="name"></label><label>Día y hora preferidos (opcional)<input id="l-time"></label><label>¿Qué te gustaría mejorar?<textarea id="l-overview" rows="3"></textarea></label><label class="check"><input id="l-consent" type="checkbox" required><span>Acepto que Adelante contacte conmigo para organizar esta revisión gratuita. *</span></label><p>Los datos se utilizan para gestionar tu solicitud. <a href="/privacy.html">Política de privacidad</a>.</p><div class="error" id="l-error" role="alert"></div><button type="submit" class="btn">Solicitar mi revisión gratuita</button></form><div class="confirm" id="l-confirm" role="status"></div>';
if(document.body.dataset.industry)$("l-sector").value=document.body.dataset.industry;
$("lead-form-es").addEventListener("submit",async function(e){
e.preventDefault();var form=e.currentTarget;if(!form.reportValidity())return;
var button=form.querySelector('button[type="submit"]');button.disabled=true;
var p={industry:$("l-sector").selectedOptions[0].textContent,business:$("l-business").value.trim(),email:$("l-email").value.trim(),phone:$("l-phone").value.trim(),name:$("l-name").value.trim(),preferred_time:$("l-time").value.trim(),overview:$("l-overview").value.trim(),page:location.pathname,_subject:"Adelante: revisión gratuita",_template:"table",_captcha:"false"};
try{var resp=await fetch("https://formsubmit.co/ajax/dean@vyrehq.com",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(p)});if(!resp.ok)throw new Error("HTTP "+resp.status);var result=await resp.json();if(result.success!==true&&result.success!=="true")throw new Error("No confirmado");$("l-confirm").textContent="Solicitud recibida. Nos pondremos en contacto para acordar una hora. La cita todavía no está confirmada.";$("l-confirm").classList.add("show");document.dispatchEvent(new Event("adelante:lead-success"));form.reset();
}catch(err){$("l-error").textContent="No hemos podido enviar tu solicitud. Utiliza WhatsApp o el correo electrónico.";var a=document.createElement("a");a.href="https://wa.me/34711018011?text="+encodeURIComponent("Hola, quisiera solicitar una revisión gratuita. Empresa: "+p.business+". Teléfono: "+p.phone+". Email: "+p.email+". Consulta: "+p.overview);a.textContent="Enviar por WhatsApp";a.className="btn";a.target="_blank";a.rel="noopener";$("l-confirm").replaceChildren(a);$("l-confirm").classList.add("show");
}finally{button.disabled=false}
});
}
})();