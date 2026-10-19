(function(){
'use strict';
var root=document.getElementById('communityHub');if(!root)return;
var KEY='hc_city_world_v1',today=new Date().toLocaleDateString('en-CA');
var defaults=[
{id:'learn',title:'تعلّم حاجة جديدة',desc:'اقرأ معلومة أو تعلّم كلمة جديدة',xp:25,coins:12,icon:'📚'},
{id:'note',title:'اكتب فكرة في النوتس',desc:'سجّل فكرة أو خطّة صغيرة',xp:20,coins:10,icon:'✍️'},
{id:'focus',title:'ركّز 15 دقيقة',desc:'ذاكر أو اشتغل على هدفك بدون تشتيت',xp:30,coins:15,icon:'🎯'},
{id:'kind',title:'اعمل خيرًا بسيطًا',desc:'ساعد شخصًا أو قل كلمة طيبة',xp:25,coins:12,icon:'💚'}
];
var state=load();
function load(){try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&typeof s==='object'){if(s.day!==today){s.day=today;s.done=[];s.dailyBonus=false;}s.xp=Number(s.xp)||0;s.coins=Number(s.coins)||0;s.done=Array.isArray(s.done)?s.done:[];s.custom=Array.isArray(s.custom)?s.custom:[];return s;}}catch(e){}return {day:today,xp:0,coins:0,done:[],custom:[],claimed:[]};}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function level(){return Math.floor(state.xp/100)+1;}
function levelProgress(){return state.xp%100;}
function buildings(){var l=level();return [
{name:'بيتك',icon:'🏡',need:1,desc:'بداية عالمك الخاص'},
{name:'المكتبة',icon:'📚',need:2,desc:'كل معرفة تبني مستقبلك'},
{name:'حديقة السلام',icon:'🌳',need:3,desc:'مساحة للراحة والتوازن'},
{name:'مركز الابتكار',icon:'🔬',need:5,desc:'أفكارك تتحول لمشاريع'},
{name:'برج الأحلام',icon:'🏙️',need:8,desc:'مع كل خطوة تكبر مدينتك'}
];}
function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function allTasks(){return defaults.concat(state.custom);}
function render(){
 var old=document.getElementById('hcCitySection');if(old)old.remove();
 var nav=document.querySelector('.hc-jumpbar');
 if(nav&&!nav.querySelector('[href="#hcCitySection"]'))nav.insertAdjacentHTML('afterbegin','<a href="#hcCitySection">🏙️ مدينتي</a>');
 var sec=document.createElement('section');sec.className='hc-section hc-city';sec.id='hcCitySection';
 var done=state.done.length,total=allTasks().length,bonus=done>=total&&!state.dailyBonus;
 var b=buildings();
 var map=b.map(function(x,i){var open=level()>=x.need;return '<div class="city-building '+(open?'unlocked':'locked')+'"><div class="city-building-art">'+(open?x.icon:'🔒')+'</div><b>'+esc(x.name)+'</b><span>'+(open?'مفتوح':'يفتح عند المستوى '+x.need)+'</span></div>';}).join('');
 var tasks=allTasks().map(function(t){var checked=state.done.indexOf(t.id)!==-1;return '<label class="city-task '+(checked?'complete':'')+'"><input type="checkbox" data-city-task="'+esc(t.id)+'" '+(checked?'checked':'')+'><span class="city-task-icon">'+esc(t.icon||'⭐')+'</span><span class="city-task-copy"><b>'+esc(t.title)+'</b><small>'+esc(t.desc||'مهمة صغيرة ليوم أفضل')+'</small></span><span class="city-reward">+'+Number(t.xp||20)+' XP</span></label>';}).join('');
 sec.innerHTML='<div class="hc-section-head"><div><h2 class="hc-heading">مدينتي الخاصة 🏙️</h2><div class="hc-sub">كل إنجاز صغير بيبني جزءًا جديدًا من عالمك. تقدّمك محفوظ على جهازك.</div></div><span class="hc-count">المستوى '+level()+'</span></div>'+
 '<div class="city-hero"><div class="city-hero-copy"><div class="city-eyebrow">HALAL WORLD · YOUR PROGRESS</div><h3>أهلاً بك في عالمك!</h3><p>ابدأ بخطوة صغيرة النهارده، وارجع بكرة تلاقي نفسك بنيت أكتر.</p><div class="city-stats"><span>⭐ <b>'+state.xp+'</b> XP</span><span>🪙 <b>'+state.coins+'</b> عملة</span><span>🏗️ <b>'+b.filter(function(x){return level()>=x.need;}).length+'</b> مبانٍ مفتوحة</span></div><div class="city-level-line"><div><b>المستوى '+level()+'</b><span>'+levelProgress()+' / 100 XP للمستوى التالي</span></div><div class="city-progress"><i style="width:'+levelProgress()+'%"></i></div></div></div><div class="city-emblem"><div class="city-sun">☀️</div><div class="city-house">🏡</div><div class="city-path">✦ · ✦ · ✦</div></div></div>'+
 '<div class="city-map-wrap"><div class="city-map-head"><div><h3>خريطة مدينتك</h3><p>كل مبنى جديد علامة على إنجازك</p></div><span class="city-map-chip">المستوى '+level()+'</span></div><div class="city-map">'+map+'<div class="city-river"></div></div><div class="city-building-note">🔒 المباني المقفولة هتتفتح تلقائيًا لما تجمع XP كفاية.</div></div>'+
 '<div class="city-lower"><div class="city-tasks-panel"><div class="city-panel-head"><div><h3>مهام اليوم 🎯</h3><p>مش لازم تعمل كل حاجة؛ ابدأ باللي تقدر عليه.</p></div><span class="city-count">'+done+' / '+total+'</span></div><div class="city-task-list">'+tasks+'</div><form id="hcCityAddForm" class="city-add-form"><input id="hcCityTaskInput" maxlength="70" placeholder="أضف مهمة من اختيارك…" aria-label="مهمة جديدة"><button class="hc-btn primary" type="submit">+ إضافة</button></form><div class="city-small-note">المهام اختيارية. مفيش عقوبة لو فاتك يوم.</div></div><div class="city-reward-panel"><div class="city-reward-icon">🎁</div><h3>مكافأة اليوم</h3><p>لما تكمّل كل مهام اليوم، هتاخد مكافأة إضافية.</p><div class="city-reward-value">+50 XP · +25 🪙</div><button class="hc-btn gold" id="hcCityBonus" '+(done<total||state.dailyBonus?'disabled':'')+'>'+(state.dailyBonus?'تم استلام المكافأة ✓':'استلام المكافأة')+'</button><p class="city-small-note">'+(done>=total?(state.dailyBonus?'ارجع بكرة لمكافأة جديدة.':'أحسنت! المكافأة جاهزة.'):'أنجز المهام المتاحة لفتح المكافأة.')+'</p><button class="hc-btn" id="hcCityReset" type="button">إعادة ضبط المدينة</button></div></div>';
 root.insertBefore(sec,root.firstChild);
}
function toastCity(msg){var t=document.createElement('div');t.className='hc-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},2200);}
root.addEventListener('change',function(e){var cb=e.target.closest('[data-city-task]');if(!cb)return;var id=cb.getAttribute('data-city-task'),task=allTasks().find(function(t){return t.id===id;});if(!task)return;var idx=state.done.indexOf(id);if(cb.checked&&idx===-1){state.done.push(id);state.xp+=Number(task.xp||20);state.coins+=Number(task.coins||10);if(state.xp%100<Number(task.xp||20))toastCity('🎉 وصلت لمستوى جديد!');else toastCity('أحسنت! +' +(task.xp||20)+' XP');}else if(!cb.checked&&idx!==-1){state.done.splice(idx,1);state.xp=Math.max(0,state.xp-Number(task.xp||20));state.coins=Math.max(0,state.coins-Number(task.coins||10));}save();render();});
root.addEventListener('submit',function(e){if(e.target.id!=='hcCityAddForm')return;e.preventDefault();var input=document.getElementById('hcCityTaskInput'),title=(input.value||'').trim();if(!title)return;state.custom.push({id:'custom_'+Date.now(),title:title,desc:'مهمتك الخاصة',xp:20,coins:10,icon:'✨'});save();render();toastCity('اتضافت مهمتك!');});
root.addEventListener('click',function(e){if(e.target.closest('#hcCityBonus')){if(state.done.length<allTasks().length||state.dailyBonus)return;state.xp+=50;state.coins+=25;state.dailyBonus=true;save();render();toastCity('🎁 مكافأة اليوم اتضافت لرصيدك!');return;}if(e.target.closest('#hcCityReset')){if(!confirm('متأكد إنك عايز تصفّر تقدم المدينة؟'))return;state={day:today,xp:0,coins:0,done:[],custom:[],dailyBonus:false};save();render();toastCity('بدأت مدينة جديدة من الصفر.');}});
render();
})();
