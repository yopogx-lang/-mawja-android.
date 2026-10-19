
(function(){
'use strict';
var root=document.getElementById('communityHub');if(!root)return;
var app=document.querySelector('.app'),soundOn=true,ctx=null,storyRequest=0,quizIndex=0,quizScore=0,questionRun=[],audioLookupId=0,memFirst=null,memLock=false,memMatches=0,memTimer=null,reactionState='idle',reactionStart=0,reactionDelay=null,hadithFilter='';
try{soundOn=localStorage.getItem('hc_button_sounds')!=='off';}catch(e){}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function toast(s){var t=document.createElement('div');t.className='hc-toast';t.textContent=s;document.body.appendChild(t);setTimeout(function(){t.remove();},2300);}
function playClick(){if(!soundOn)return;try{var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!ctx)ctx=new AC();if(ctx.state==='suspended')ctx.resume();var o=ctx.createOscillator(),g=ctx.createGain(),n=ctx.currentTime;o.type='sine';o.frequency.setValueAtTime(690,n);o.frequency.exponentialRampToValueAtTime(440,n+.035);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(.04,n+.006);g.gain.exponentialRampToValueAtTime(.0001,n+.055);o.connect(g);g.connect(ctx.destination);o.start(n);o.stop(n+.06);}catch(e){}}
function shuffledCopy(items){var out=items.slice();for(var i=out.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),tmp=out[i];out[i]=out[j];out[j]=tmp;}return out;}
var questions=[
{q:'ما الكوكب المعروف بالكوكب الأحمر؟',a:['المريخ','الزهرة','زحل','عطارد'],c:0,why:'المريخ يبدو أحمر بسبب أكاسيد الحديد على سطحه.'},
{q:'أي عنصر رمزه الكيميائي O؟',a:['الذهب','الأكسجين','الفضة','الهيدروجين'],c:1,why:'الرمز O هو رمز الأكسجين.'},
{q:'ما أكبر محيط على الأرض؟',a:['الأطلسي','الهندي','الهادئ','المتجمد الشمالي'],c:2,why:'المحيط الهادئ هو الأكبر مساحةً.'},
{q:'كم ضلعًا للمسدس؟',a:['خمسة','ستة','سبعة','ثمانية'],c:1,why:'للمسدس ستة أضلاع.'},
{q:'ما اللغة الأصلية لرواية Frankenstein؟',a:['الفرنسية','العربية','الإنجليزية','الإسبانية'],c:2,why:'كتبت ماري شيلي الرواية باللغة الإنجليزية ونشرتها عام 1818.'},
{q:'أي عضو يضخ الدم في الجسم؟',a:['الرئة','القلب','الكبد','الكلى'],c:1,why:'القلب يضخ الدم عبر الدورة الدموية.'},
{q:'ما الغاز الذي تمتصه النباتات خلال البناء الضوئي؟',a:['الأكسجين','الهيليوم','ثاني أكسيد الكربون','النيتروجين'],c:2,why:'تمتص النباتات ثاني أكسيد الكربون وتستخدم الضوء لصنع الغذاء.'}
,
{"q":"ما عاصمة أستراليا؟","a":["سيدني","كانبرا","ملبورن","بيرث"],"c":1,"why":"عاصمة أستراليا هي كانبرا."},
{"q":"ما أكبر صحراء حارة في العالم؟","a":["جوبي","ساهارا","أتاكاما","الربع الخالي"],"c":1,"why":"الصحراء الكبرى أكبر الصحارى الحارة."},
{"q":"ما أعلى جبل فوق مستوى سطح البحر؟","a":["إيفرست","كليمنجارو","مون بلان","فيزوف"],"c":0,"why":"قمة إيفرست هي الأعلى فوق مستوى سطح البحر."},
{"q":"ما المعدن السائل في درجة حرارة الغرفة؟","a":["الحديد","الزئبق","الألومنيوم","النحاس"],"c":1,"why":"الزئبق معدن سائل في درجة حرارة الغرفة."},
{"q":"ما عاصمة فرنسا؟","a":["روما","مدريد","باريس","برلين"],"c":2,"why":"باريس هي عاصمة فرنسا."},
{"q":"كم عدد حروف الأبجدية العربية الشائع؟","a":["26","28","29","30"],"c":1,"why":"الأبجدية العربية الشائعة تتكوّن من 28 حرفًا."},
{"q":"ما العملة الرسمية لليابان؟","a":["اليوان","الوون","الين","الروبية"],"c":2,"why":"الين هو العملة اليابانية."},
{"q":"ما أول شهر في التقويم الميلادي؟","a":["مارس","يناير","فبراير","أبريل"],"c":1,"why":"يناير هو الشهر الأول في التقويم الميلادي."},
{"q":"كم بتًّا في البايت الواحد؟","a":["4","8","16","32"],"c":1,"why":"البايت الواحد يساوي 8 بتات."},
{"q":"كيف يتحرك الملك في الشطرنج؟","a":["أي عدد من المربعات","مربع واحد في أي اتجاه","قطريًا فقط","على شكل حرف L"],"c":1,"why":"الملك يتحرك مربعًا واحدًا في أي اتجاه ما دام المربع آمنًا."},
{"q":"عند أي درجة مئوية يتجمد الماء النقي تقريبًا؟","a":["0","10","32","100"],"c":0,"why":"يتجمد الماء النقي عند صفر مئوية في الضغط الجوي المعتاد."},
{"q":"هل ينتقل الصوت عبر الفراغ؟","a":["نعم بسرعة الضوء","لا يحتاج وسطًا","لا، يحتاج إلى وسط مادي","فقط إذا كان مرتفعًا"],"c":2,"why":"الصوت موجة ميكانيكية تحتاج إلى وسط مادي للانتقال."},
{"q":"أي الثدييات التالية تضع البيض؟","a":["الخفاش","خلد الماء","الدلفين","الكنغر"],"c":1,"why":"خلد الماء من الثدييات الأولية التي تضع البيض."},
{"q":"ما النجم الأقرب إلى الأرض؟","a":["الشعرى اليمانية","الشمس","النجم القطبي","منكب الجوزاء"],"c":1,"why":"الشمس هي أقرب نجم إلى الأرض."},
{"q":"كم مجموع زوايا المثلث؟","a":["90 درجة","180 درجة","270 درجة","360 درجة"],"c":1,"why":"مجموع زوايا المثلث 180 درجة في الهندسة الإقليدية."},
{"q":"ما أعمق نقطة معروفة في المحيطات؟","a":["خندق ماريانا","خندق بورتوريكو","بحر قزوين","خليج المكسيك"],"c":0,"why":"تقع أعمق نقطة معروفة في خندق ماريانا بالمحيط الهادئ."},
{"q":"أي مسطح مائي يصل إليه فرعا دلتا النيل؟","a":["البحر الأحمر","البحر المتوسط","المحيط الهندي","بحر العرب"],"c":1,"why":"تصب فروع دلتا النيل في البحر المتوسط."},
{"q":"ما الصبغة التي تمنح كثيرًا من النباتات لونها الأخضر؟","a":["الهيموجلوبين","الكلوروفيل","الميلانين","الكيراتين"],"c":1,"why":"الكلوروفيل صبغة خضراء تساعد النبات على امتصاص الضوء."},
{"q":"ما مصدر الطاقة المتجددة الذي يعتمد على ضوء الشمس؟","a":["الطاقة الشمسية","الفحم","الديزل","الغاز الطبيعي"],"c":0,"why":"الخلايا الشمسية تحوّل ضوء الشمس إلى كهرباء."},
{"q":"ما الشكل الهندسي الذي له ثمانية أضلاع؟","a":["خماسي","سداسي","سباعي","مثمن"],"c":3,"why":"الشكل ذو الثمانية أضلاع يسمى مثمنًا."},
{"q":"ما الرمز الكيميائي للصوديوم؟","a":["S","So","Na","N"],"c":2,"why":"رمز الصوديوم هو Na."},
{"q":"كم يساوي 5 × 9؟","a":["40","45","50","54"],"c":1,"why":"خمسة في تسعة تساوي خمسة وأربعين."},
{"q":"ما الرقمان المستخدمان في النظام الثنائي؟","a":["1 و2","0 و1","2 و8","0 و9"],"c":1,"why":"النظام الثنائي يستخدم الرقمين صفر وواحد."},
{"q":"أي كوكب يُعد الأعلى حرارة في المتوسط؟","a":["عطارد","الزهرة","المريخ","نبتون"],"c":1,"why":"الغلاف الجوي الكثيف للزهرة يسبب تأثيرًا حراريًا قويًا."},
{"q":"كم قمرًا طبيعيًا معروفًا للمريخ؟","a":["واحد","اثنان","أربعة","سبعة"],"c":1,"why":"للمريخ قمران معروفان: فوبوس وديموس."},
{"q":"في أي دولة يقع سور الصين العظيم؟","a":["الهند","الصين","اليابان","منغوليا فقط"],"c":1,"why":"يمتد سور الصين العظيم عبر مناطق في الصين."},
{"q":"أين توجد أهرامات الجيزة؟","a":["الأردن","المكسيك","مصر","العراق"],"c":2,"why":"أهرامات الجيزة تقع في مصر قرب القاهرة."},
{"q":"ما أكبر محيط على سطح الأرض؟","a":["الأطلسي","الهندي","الهادئ","المتجمد الجنوبي"],"c":2,"why":"المحيط الهادئ هو الأكبر مساحةً."},
{"q":"ما العضوان الرئيسيان لتبادل الغازات في الجسم؟","a":["الكليتان","الرئتان","العينان","المعدتان"],"c":1,"why":"تقوم الرئتان بتبادل الأكسجين وثاني أكسيد الكربون."},
{"q":"ما اسم المجرة التي تضم مجموعتنا الشمسية؟","a":["أندروميدا","درب التبانة","المثلث","السحابة الماجلانية الكبرى"],"c":1,"why":"تقع المجموعة الشمسية داخل مجرة درب التبانة."},
{"q":"ما أسرع طائر أثناء الانقضاض؟","a":["الصقر الشاهين","النعامة","البطريق","الحمامة"],"c":0,"why":"يُعرف الصقر الشاهين بسرعته الكبيرة أثناء الانقضاض."},
{"q":"ما الغاز الذي تحتاجه معظم خلايا الإنسان للتنفس الخلوي؟","a":["الأكسجين","النيون","الهيدروجين","الميثان"],"c":0,"why":"تستخدم معظم خلايا الجسم الأكسجين في التنفس الخلوي."},
{"q":"ما الجهاز الذي يقيس درجة الحرارة؟","a":["البارومتر","الترمومتر","الفولتميتر","الميزان الزنبركي"],"c":1,"why":"الترمومتر هو أداة قياس درجة الحرارة."},
{"q":"أي جزء من النبات يمتص الماء غالبًا من التربة؟","a":["الزهرة","الجذر","الثمرة","البتلة"],"c":1,"why":"الجذور تمتص الماء والأملاح المعدنية من التربة."},
{"q":"أي كوكب يشتهر بحلقاته الواضحة؟","a":["زحل","الأرض","المريخ","عطارد"],"c":0,"why":"زحل أشهر الكواكب بحلقاته الواسعة والبارزة."},
{"q":"ما العملية التي تصنع بها النباتات غذاءها باستخدام الضوء؟","a":["التبخر","البناء الضوئي","التكاثف","التعرق"],"c":1,"why":"تستخدم النباتات الضوء في عملية البناء الضوئي."},
{"q":"ما عاصمة إيطاليا؟","a":["روما","ميلانو","البندقية","فلورنسا"],"c":0,"why":"روما هي عاصمة إيطاليا."},
{"q":"ما وحدة قياس شدة التيار الكهربائي؟","a":["الفولت","الأمبير","الواط","الأوم"],"c":1,"why":"تقاس شدة التيار الكهربائي بالأمبير."},
{"q":"ما أكبر غابة مطيرة استوائية في العالم؟","a":["الأمازون","الغابة السوداء","تايغا سيبيريا","غابة الأرز"],"c":0,"why":"غابة الأمازون هي أكبر غابة مطيرة استوائية."}
];
var tracks={
funk:[['Bum Bum Tam Tam','MC Fioti · Brazilian funk','Bum Bum Tam Tam MC Fioti official'],['Dançarina','Pedro Sampaio · Funk pop','Pedro Sampaio Dançarina official'],['Tipo Gin','MC Kevin o Chris · Funk carioca','MC Kevin o Chris Tipo Gin official'],['Tá OK','DENNIS & Kevin O Chris · Funk','DENNIS Kevin O Chris Ta OK official'],['Brazilian Funk Mix','إيقاع حماسي','Brazilian funk best tracks']],
montage:[['Montagem Coral','Brazilian phonk / montagem','Montagem Coral Brazilian phonk'],['Montagem Vozes Profundas','Montagem / phonk','Montagem Vozes Profundas'],['Montagem Tomada','Montagem / bass-heavy','Montagem Tomada'],['Montagem PR Funk','Montagem / Brazilian funk','Montagem PR Funk'],['Montagem Mysterious Game','Montagem / phonk','Montagem Mysterious Game']],
aurora:[['Runaway','AURORA · dreamy electropop','AURORA Runaway official music video'],['Cure For Me','AURORA · playful synth-pop','AURORA Cure For Me official'],['The Seed','AURORA · cinematic pop','AURORA The Seed official'],['Queendom','AURORA · uplifting art-pop','AURORA Queendom official'],['Exist for Love','AURORA · soft orchestral pop','AURORA Exist For Love official']]
};
var hadiths=[
['إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.','صحيح البخاري','bukhari:1'],
['بُني الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمدًا رسول الله، وإقام الصلاة، وإيتاء الزكاة، والحج، وصوم رمضان.','صحيح البخاري','bukhari:8'],
['المسلم من سلم المسلمون من لسانه ويده.','صحيح البخاري','bukhari:10'],
['لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.','صحيح البخاري','bukhari:13'],
['لا يؤمن أحدكم حتى أكون أحب إليه من والده وولده والناس أجمعين.','صحيح البخاري','bukhari:15'],
['ثلاث من كن فيه وجد حلاوة الإيمان: أن يكون الله ورسوله أحب إليه مما سواهما…','صحيح البخاري','bukhari:16'],
['آية المنافق ثلاث: إذا حدث كذب، وإذا وعد أخلف، وإذا اؤتمن خان.','صحيح البخاري','bukhari:33'],
['الحلال بيّن والحرام بيّن، وبينهما أمور مشتبهات لا يعلمهن كثير من الناس.','صحيح البخاري','bukhari:52'],
['يسّروا ولا تعسّروا، وبشّروا ولا تنفّروا.','صحيح البخاري','bukhari:69'],
['من يرد الله به خيرًا يفقهه في الدين.','صحيح البخاري','bukhari:71'],
['كلكم راعٍ وكلكم مسؤول عن رعيته.','صحيح البخاري','bukhari:893'],
['اتقوا النار ولو بشق تمرة.','صحيح البخاري','bukhari:1417'],
['الصيام جُنّة.','صحيح البخاري','bukhari:1894'],
['الكلمة الطيبة صدقة.','صحيح البخاري','bukhari:2989'],
['خيركم من تعلّم القرآن وعلّمه.','صحيح البخاري','bukhari:5027'],
['يا غلام، سمِّ الله، وكل بيمينك، وكل مما يليك.','صحيح البخاري','bukhari:5376'],
['من كان يؤمن بالله واليوم الآخر فليقل خيرًا أو ليصمت.','صحيح البخاري','bukhari:6018'],
['من كان يؤمن بالله واليوم الآخر فليكرم جاره.','صحيح البخاري','bukhari:6019'],
['ليس الشديد بالصُّرَعة، إنما الشديد الذي يملك نفسه عند الغضب.','صحيح البخاري','bukhari:6114'],
['لا تغضب.','صحيح البخاري','bukhari:6116'],
['من لا يَرحم لا يُرحم.','صحيح البخاري','bukhari:5997'],
['أحب الأعمال إلى الله أدومها وإن قل.','صحيح البخاري','bukhari:6464'],
['من أحب أن يُبسط له في رزقه ويُنسأ له في أثره فليصل رحمه.','صحيح البخاري','bukhari:5986'],
['لا يدخل الجنة قاطع.','صحيح البخاري','bukhari:5984'],
['المؤمن للمؤمن كالبنيان يشد بعضه بعضًا.','صحيح البخاري','bukhari:481'],
['الدين النصيحة. قلنا: لمن؟ قال: لله، ولكتابه، ولرسوله، ولأئمة المسلمين وعامتهم.','صحيح مسلم','muslim:55a'],
['من كان في قلبه مثقال ذرة من كِبر لا يدخل الجنة.','صحيح مسلم','muslim:91'],
['الطُّهور شطر الإيمان.','صحيح مسلم','muslim:223'],
['إن الله لا ينظر إلى صوركم وأموالكم، ولكن ينظر إلى قلوبكم وأعمالكم.','صحيح مسلم','muslim:2564'],
['ما نقصت صدقة من مال.','صحيح مسلم','muslim:2588'],
['الرفق لا يكون في شيء إلا زانه، ولا يُنزع من شيء إلا شانه.','صحيح مسلم','muslim:2594'],
['إن الله رفيق يحب الرفق.','صحيح مسلم','muslim:2593'],
['من غشّنا فليس منا.','صحيح مسلم','muslim:101'],
['من سلك طريقًا يلتمس فيه علمًا سهّل الله له به طريقًا إلى الجنة.','صحيح مسلم','muslim:2699'],
['من دلّ على خير فله مثل أجر فاعله.','صحيح مسلم','muslim:1893'],
['مثل المؤمنين في توادهم وتراحمهم وتعاطفهم مثل الجسد؛ إذا اشتكى منه عضو تداعى له سائر الجسد بالسهر والحمّى.','صحيح مسلم','muslim:2586'],
['المسلم أخو المسلم، لا يظلمه ولا يخذله ولا يحقره.','صحيح مسلم','muslim:2580'],
['لا تحاسدوا، ولا تباغضوا، ولا تدابروا، وكونوا عباد الله إخوانًا.','صحيح مسلم','muslim:2563'],
['اتقوا الظلم؛ فإن الظلم ظلمات يوم القيامة.','صحيح مسلم','muslim:2578'],
['لا يدخل الجنة نمّام.','صحيح مسلم','muslim:105'],
['إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة: صدقة جارية، أو علم ينتفع به، أو ولد صالح يدعو له.','صحيح مسلم','muslim:1631'],
['من صلّى عليّ واحدة صلى الله عليه بها عشرًا.','صحيح مسلم','muslim:408'],
['المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف، وفي كل خير.','صحيح مسلم','muslim:2664'],
['من نفّس عن مؤمن كربة من كرب الدنيا نفّس الله عنه كربة من كرب يوم القيامة.','صحيح مسلم','muslim:2699'],
['من ستر مسلمًا ستره الله في الدنيا والآخرة.','صحيح مسلم','muslim:2699'],
['الدنيا سجن المؤمن وجنة الكافر.','صحيح مسلم','muslim:2956'],
['المرء مع من أحب.','صحيح مسلم','muslim:2640'],
['لا يلدغ المؤمن من جحر واحد مرتين.','صحيح البخاري','bukhari:6133'],
['إن الله كتب الإحسان على كل شيء.','صحيح مسلم','muslim:1955'],
['إذا جاء رمضان فُتحت أبواب الجنة، وغُلّقت أبواب النار، وصُفّدت الشياطين.','صحيح مسلم','muslim:1079']
];
var dhikrData=[
{id:'dh1',text:'اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك عليّ، وأبوء بذنبي، فاغفر لي؛ فإنه لا يغفر الذنوب إلا أنت.',title:'سيد الاستغفار',count:1,source:'صحيح البخاري 6306'},
{id:'dh2',text:'سبحان الله وبحمده.',title:'تسبيح',count:100,source:'صحيح مسلم 2692'},
{id:'dh3',text:'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.',title:'التهليل',count:100,source:'ورد في أحاديث صحيحة متعددة'},
{id:'dh4',text:'بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.',title:'ذكر الحفظ',count:3,source:'سنن أبي داود والترمذي'},
{id:'dh5',text:'أعوذ بكلمات الله التامات من شر ما خلق.',title:'الاستعاذة',count:3,source:'صحيح مسلم 2708'},
{id:'dh6',text:'رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.',title:'ذكر الرضا',count:3,source:'سنن أبي داود والترمذي'},
{id:'dh7',text:'أستغفر الله وأتوب إليه.',title:'الاستغفار',count:100,source:'صحيح البخاري 6307'},
{id:'dh8',text:'اللهم صلِّ وسلم على نبينا محمد.',title:'الصلاة على النبي ﷺ',count:10,source:'فضل الصلاة على النبي ثابت في صحيح مسلم 408'}
],dhikrCounts={};
function lookupAudioPreview(query,title){return new Promise(function(resolve,reject){var cb='hcItunesCb'+Date.now()+Math.floor(Math.random()*100000),script=document.createElement('script'),done=false,timer=setTimeout(function(){finish(new Error('audio catalog timeout'));},10000);function finish(err,value){if(done)return;done=true;clearTimeout(timer);try{delete window[cb];}catch(e){window[cb]=undefined;}if(script.parentNode)script.parentNode.removeChild(script);if(err)reject(err);else resolve(value);}window[cb]=function(data){var items=(data&&data.results||[]).filter(function(x){return x.previewUrl;});var norm=function(x){return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,'');};var wanted=norm(title);var match=items.find(function(x){var t=norm(x.trackName);return wanted&&(t===wanted||t.indexOf(wanted)>=0||wanted.indexOf(t)>=0);})||items[0]||null;finish(null,match);};script.onerror=function(){finish(new Error('audio catalog network error'));};script.src='https://itunes.apple.com/search?term='+encodeURIComponent(String(query||title||'').trim())+'&entity=song&limit=20&callback='+cb;document.head.appendChild(script);});}
function playAudioPreview(query,title){var audio=document.getElementById('hcAudio'),name=document.getElementById('hcAudioTitle'),status=document.getElementById('hcAudioStatus');if(!audio||!status)return;var request=++audioLookupId;if(name)name.textContent=title||'اختيار موسيقي';status.textContent='جارٍ البحث عن معاينة صوتية…';audio.pause();audio.removeAttribute('src');audio.load();audio.controls=true;audio.muted=false;audio.volume=1;audio.oncanplay=function(){if(request===audioLookupId)status.textContent='المقطع جاهز. اضغط ▶ في شريط الصوت نفسه لبدء السماع.';};audio.onerror=function(){if(request===audioLookupId)status.textContent='المصدر لم يسمح بتشغيل المعاينة. جرّب اختيارًا آخر أو تحقق من اتصال الإنترنت.';};lookupAudioPreview(query,title).then(function(track){if(request!==audioLookupId)return;if(!track){status.textContent='لم نجد معاينة متاحة لهذا الاختيار. جرّب اسمًا أو أغنية أخرى.';return;}audio.src=track.previewUrl;audio.load();var artist=track.artistName?' · '+track.artistName:'';status.textContent='تم العثور على معاينة'+artist+'. انتظر ظهور مدة المقطع ثم اضغط ▶ في شريط الصوت.';}).catch(function(){if(request!==audioLookupId)return;status.textContent='تعذر جلب المعاينة. تأكد من الإنترنت، أو جرّب أغنية أخرى.';});}
function trackCard(t){return '<div class="hc-track"><div class="hc-track-icon">♫</div><div class="hc-track-meta"><strong>'+esc(t[0])+'</strong><small>'+esc(t[1])+'</small></div><button type="button" class="hc-track-play" data-audio-play="yes" data-audio-title="'+esc(t[0])+'" data-audio-query="'+esc(t[2])+'">▶ تشغيل صوتي</button></div>';}
function fallbackBooks(){var b=[['Dracula','Bram Stoker',345],['Frankenstein','Mary Shelley',84],['The Invisible Man','H. G. Wells',5230],['Dr Jekyll and Mr Hyde','R. L. Stevenson',43],['The Time Machine','H. G. Wells',35],['The Legend of Sleepy Hollow','Washington Irving',41],['The Island of Doctor Moreau','H. G. Wells',159],['The Wonderful Wizard of Oz','L. Frank Baum',55]];return b.map(function(x){return '<article class="hc-book"><div class="hc-book-mark">CURATED CLASSIC</div><span class="hc-tag">رعب / فانتازيا</span><h3>'+esc(x[0])+'</h3><p>'+esc(x[1])+' · كلاسيكية مفتوحة</p><a class="hc-btn small" target="_blank" rel="noopener noreferrer" href="https://www.gutenberg.org/ebooks/'+x[2]+'">افتح النص ↗</a></article>';}).join('');}
function bookCard(b){var author=(b.authors||[]).map(function(a){return a.name;}).join('، ')||'مؤلف غير محدد',f=b.formats||{},link=f['text/html']||f['text/html; charset=utf-8']||f['text/plain; charset=utf-8']||f['text/plain']||f['application/epub+zip']||('https://www.gutenberg.org/ebooks/'+b.id);return '<article class="hc-book"><div class="hc-book-mark">OPEN CATALOG</div><span class="hc-tag">'+esc((b.bookshelves||[])[0]||'كلاسيكيات')+'</span><h3>'+esc(b.title)+'</h3><p>'+esc(author)+(b.download_count?' · '+Number(b.download_count).toLocaleString('en-US')+' تحميل':'')+'</p><a class="hc-btn small" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">افتح النص ↗</a></article>';}
var localStories=[
{title:'البيت الذي لا يظهر في الصور',genre:'رعب وغموض',keywords:'رعب horror ghost haunted house mystery',blurb:'بيت قديم لا يظهر في أي صورة، لكن نافذته تضيء كل ليلة.',body:'في آخر الشارع بيت مهجور، وكلما حاول أحد تصويره ظهر مكانه في الصورة فراغ رمادي. لم يصدق آدم الحكاية، فرفع هاتفه نحو البيت والتقط صورة. حين فتحها وجد الشارع كما هو، إلا نافذة صغيرة مضيئة في الطابق العلوي.~~في تلك الليلة عاد إلى الصورة قبل النوم. كانت النافذة ما تزال مضيئة، لكن خلف الزجاج وقف شخص يشبهه تمامًا. اقترب من الشاشة فرأى انعكاس غرفته في الزجاج، والنسخة الأخرى ترفع يدها ببطء، كأنها تطلب منه ألا يقترب.~~في الصباح عاد آدم إلى المكان. لم يجد بيتًا ولا سورًا؛ وجد قطعة أرض خالية. وحين فتح الصورة للمرة الأخيرة، كانت النافذة قد اختفت، وبقي على شاشة الهاتف انعكاس غرفته… مع ظل يقف خلف كرسيه.'},
{title:'مدينة تحت القمر الأزرق',genre:'فانتازيا ومغامرة',keywords:'فانتازيا fantasy magic moon city adventure',blurb:'خريطة قديمة تقود فتاة إلى مدينة لا تظهر إلا مرة كل مئة عام.',body:'وجدت ليلى خريطة بين صفحات كتاب ورثته عن جدتها. لم يكن عليها اسم مدينة، بل قمر أزرق وثلاثة أبواب مرسومة بالحبر الفضي. عند منتصف الليل، ظهر ضوء أزرق على أطراف الورقة، وقادها عبر ممر بين الجبال لم تره من قبل.~~خلف الممر امتدت مدينة معلّقة فوق بحيرة هادئة. كانت مصابيحها تطفو في الهواء، والطيور تتكلم بأصوات تشبه الأجراس. أخبرها حارس البوابة أن المدينة تختفي عند الفجر، وأن مفتاح بقائها ليس حجرًا سحريًا، بل أمنية صادقة يقدمها زائر لم يعد يفكر في نفسه وحدها.~~تذكرت ليلى القرية التي جفّ نبعها، فتمنت أن تعود المياه إلى أهلها. أضاء القمر، وانهمرت قطرات دافئة على البحيرة. وحين فتحت عينيها كانت على الجبل من جديد، وفي جيبها حجر أزرق صغير، وصوت ماء بعيد يصعد من الوادي.'},
{title:'المكتبة التي تتنفس',genre:'رعب هادئ',keywords:'رعب horror library mystery books whisper',blurb:'في مكتبة المدرسة، كتاب واحد يغيّر مكانه كلما أُغلق الباب.',body:'كانت المكتبة تغلق أبوابها في الخامسة، لكن نور لاحظت كتابًا أسود ينتقل كل يوم إلى رف مختلف. لم يحمل عنوانًا ولا اسم مؤلف. في المرة الثالثة فتحت صفحته فوجدت جملة واحدة: لا تقرئي الصفحة الأخيرة وحدك.~~عادت في اليوم التالي ومعها صديقتها مريم. كان الكتاب مفتوحًا على حكاية عن مكتبة لا يخرج منها أحد إلا إذا أعاد كل كتاب إلى مكانه. بين السطور سمعتا صوتًا خافتًا يشبه تنفس شخص نائم. لم يكن الصوت خلف الرفوف؛ كان يصدر من الجدران نفسها.~~وصلتا إلى الصفحة الأخيرة معًا. لم تجدا نهاية للحكاية، بل خريطة صغيرة للمكتبة وعلامة عند رف مهمل. خلفه وجدتا كتبًا قديمة تبرع بها الطلاب ولم يفهرسها أحد. ومنذ ذلك اليوم توقف الكتاب الأسود عن التحرك، كأن المكتبة كانت تنتظر فقط من يتذكر الكتب المنسية.'},
{title:'التنين الذي نسي اسمه',genre:'فانتازيا',keywords:'فانتازيا fantasy dragon kingdom courage',blurb:'تنّين صغير يفقد اسمه، ومعه تختفي قدرته على إشعال النجوم.',body:'في مملكة فوق السحاب، كان لكل تنين اسم يضيء على صدره مثل نجمة. استيقظ ريان ذات صباح فوجد مكان اسمه علامة باهتة، ولم يعد قادرًا على إشعال النجوم التي تهدي المسافرين في الليل. قال له الحارس إن الاسم لا يعود بالقوة، بل بفعل شيء يستحق أن يتذكره العالم.~~طار ريان نحو الوادي حيث ضلّت قافلة صغيرة طريقها وسط الضباب. كان يستطيع العودة إلى القصر وطلب المساعدة، لكنه نشر جناحيه فوق القافلة، وراح يطلق شرارات دافئة ليصنع طريقًا في السماء. سار الناس خلف الضوء حتى وصلوا إلى بيوتهم.~~حين عاد إلى الجبل لم يجد اسمه مكتوبًا على صدره، بل وجده يلمع فوق القرية؛ فقد أطلق الناس على النجم الجديد اسم ريان. فهم أن اسمه لم يختفِ، بل انتقل إلى المكان الذي احتاج إليه أكثر.'},
{title:'الرسالة عند منتصف الليل',genre:'غموض ورعب نفسي',keywords:'غموض mystery horror message midnight clock',blurb:'رسالة تصل إلى هاتف مهجور، وتخبر صاحبه بما سيحدث بعد دقيقة.',body:'عثر يوسف على هاتف قديم في درج مكتب جده. لم تكن فيه شريحة اتصال، ومع ذلك أضاءت الشاشة عند الساعة 12:00 تمامًا. ظهرت رسالة قصيرة: لا تفتح الباب حين تسمع الطرقات الثلاث. ضحك يوسف، ثم سمع طرقة واحدة من باب الشقة.~~بعد دقيقة جاءت الطرقة الثانية. أمسك الهاتف وبدأ يعد الثواني. لم تكن هناك ريح ولا صوت في السلم، لكن الطرقة الثالثة جاءت من باب غرفته، لا من الباب الخارجي. تراجع خطوة، ثم تذكر أن جده كان يكتب ألغازًا ليعلّمه الانتباه قبل التصرف.~~فتح يوسف درج المكتب مرة أخرى فوجد ورقة خلف الهاتف: إذا وصلت إلى هذه المرحلة، فقد نجحت في الاختبار. كان جده قد سجّل تنبيهًا مؤقتًا على الهاتف القديم. لكنه لم يفهم كيف عرفت الرسالة أن الطرقة الثالثة ستأتي من باب الغرفة… إلى أن لمح القطة تقف خلفه وتضرب الباب بذيلها.'},
{title:'الباب السابع',genre:'فانتازيا وغموض',keywords:'فانتازيا fantasy portal magic door puzzle',blurb:'سبعة أبواب، وستة مفاتيح فقط؛ على سليم اكتشاف معنى المفتاح الأخير.',body:'في أسفل برج مهجور وجد سليم صفًا من سبعة أبواب. ستة منها تحمل نقوشًا لبحر وغابة ونجمة وطائر وجبل ونهر، أما الأخير فكان بلا نقش ولا قفل. في يده ستة مفاتيح، وعلى الجدار عبارة: ما لا تحمله في يدك قد يكون معك بالفعل.~~جرّب مفاتيح البحر والغابة والنجمة، فانفتحت خلفها غرف صغيرة مليئة بالضوء. أما الباب السابع فظل ساكنًا. جلس سليم يفكر، ثم تذكر الرسالة التي كتبها لأخته قبل رحيله وتركها في البيت: سأعود عندما أجد الطريق. لم يكن يحمل المفتاح، بل كان يحمل وعدًا.~~وضع كفه على الباب وقال إنه سيعود ليصلح ما أفسده. انفتح الباب بلا صوت، وخلفه ظهر الطريق إلى البيت. فهم سليم أن بعض الأبواب لا تحتاج معدنًا؛ تحتاج شجاعة للاعتراف وخطوة للرجوع.'}
];
function localStoryCard(s,i){return '<article class="hc-book hc-original-story"><div class="hc-book-mark">HALAL COMMUNITY · ORIGINAL</div><span class="hc-tag">'+esc(s.genre)+'</span><h3>'+esc(s.title)+'</h3><p>'+esc(s.blurb)+'</p><button type="button" class="hc-btn primary small" data-story-open="'+i+'">اقرأ داخل الموقع ↗</button></article>';}
function showLocalStory(i){var s=localStories[i];if(!s)return;var overlay=document.getElementById('hcStoryReader');if(!overlay){overlay=document.createElement('div');overlay.id='hcStoryReader';overlay.className='hc-reader-overlay';document.body.appendChild(overlay);}overlay.innerHTML='<article class="hc-reader-dialog" role="dialog" aria-modal="true" aria-label="'+esc(s.title)+'"><div class="hc-reader-top"><span class="hc-tag">'+esc(s.genre)+'</span><button type="button" class="hc-btn" id="hcStoryReaderClose">إغلاق ✕</button></div><h2>'+esc(s.title)+'</h2><div class="hc-reader-body">'+s.body.split('~~').map(function(p){return '<p>'+esc(p)+'</p>';}).join('')+'</div><div class="hc-reader-foot">قصة أصلية قصيرة من مكتبة Halal Community.</div></article>';overlay.classList.add('open');document.body.style.overflow='hidden';}
function closeLocalStory(){var overlay=document.getElementById('hcStoryReader');if(overlay)overlay.classList.remove('open');document.body.style.overflow='';}
function mapStoryQuery(q){var low=String(q||'').toLowerCase();var map=[['رعب','horror'],['مرعب','horror'],['فانتازيا','fantasy'],['خيال','fantasy'],['تنين','dragon'],['تنانين','dragon'],['شبح','ghost'],['أشباح','ghost'],['غموض','mystery'],['سحر','fantasy'],['مصاص','vampire'],['مغامرة','adventure']];for(var i=0;i<map.length;i++)if(low.indexOf(map[i][0])>=0)return map[i][1];return q;}
function openLibraryCard(b){var author=(b.author_name||[]).slice(0,2).join('، ')||'مؤلف غير محدد',year=b.first_publish_year?' · '+b.first_publish_year:'';return '<article class="hc-book"><div class="hc-book-mark">OPEN LIBRARY</div><span class="hc-tag">رعب / فانتازيا</span><h3>'+esc(b.title||'قصة')+'</h3><p>'+esc(author)+esc(year)+'</p><a class="hc-btn small" target="_blank" rel="noopener noreferrer" href="https://openlibrary.org'+esc(b.key||'')+'">افتح صفحة الكتاب ↗</a></article>';}
async function loadStories(query){var n=++storyRequest,grid=document.getElementById('hcStoryGrid'),note=document.getElementById('hcStoryNote');if(!grid)return;var raw=String(query||'').trim(),q=mapStoryQuery(raw),terms=['ghost stories','fantasy','horror','vampire','dragon','mystery','gothic','adventure'];if(!q)q=terms[Math.floor(Math.random()*terms.length)];var local=raw?localStories.map(function(s,i){return {s:s,i:i};}).filter(function(x){var hay=(x.s.title+' '+x.s.genre+' '+x.s.keywords+' '+x.s.blurb).toLowerCase();return hay.indexOf(raw.toLowerCase())>=0||hay.indexOf(String(q).toLowerCase())>=0;}):shuffledCopy(localStories).slice(0,4).map(function(s){return {s:s,i:localStories.indexOf(s)};});if(!local.length)local=shuffledCopy(localStories).slice(0,2).map(function(s){return {s:s,i:localStories.indexOf(s)};});grid.innerHTML=local.map(function(x){return localStoryCard(x.s,x.i);}).join('');note.textContent='القصص الداخلية جاهزة؛ جارٍ تحديث العناوين من مصدرين ثابتين…';var controller=null,timer=null;try{controller=typeof AbortController==='function'?new AbortController():null;if(controller)timer=setTimeout(function(){controller.abort();},9000);var opts={headers:{Accept:'application/json'}};if(controller)opts.signal=controller.signal;var gUrl='https://gutendex.com/books/?languages=en&copyright=false&search='+encodeURIComponent(q);var oUrl='https://openlibrary.org/search.json?q='+encodeURIComponent(q)+'&has_fulltext=true&limit=8&fields=key,title,author_name,first_publish_year';var settled=await Promise.allSettled([fetch(gUrl,opts),fetch(oUrl,opts)]);if(n!==storyRequest)return;var extras=[],messages=[];if(settled[0].status==='fulfilled'&&settled[0].value.ok){var gd=await settled[0].value.json(),seenG={},books=(gd.results||[]).filter(function(x){return x.title&&x.formats&&(x.formats['text/html']||x.formats['text/html; charset=utf-8']||x.formats['text/plain; charset=utf-8']||x.formats['text/plain']||x.formats['application/epub+zip']);}).filter(function(x){var k=x.id||x.title;if(seenG[k])return false;seenG[k]=true;return true;}).slice(0,4);extras=extras.concat(books.map(bookCard));if(books.length)messages.push('Project Gutenberg');}if(settled[1].status==='fulfilled'&&settled[1].value.ok){var od=await settled[1].value.json(),seenO={},openBooks=(od.docs||[]).filter(function(x){return x.key&&x.title;}).filter(function(x){var k=x.key;if(seenO[k])return false;seenO[k]=true;return true;}).slice(0,4);extras=extras.concat(openBooks.map(openLibraryCard));if(openBooks.length)messages.push('Open Library');}if(timer)clearTimeout(timer);if(n!==storyRequest)return;if(extras.length){grid.innerHTML=local.map(function(x){return localStoryCard(x.s,x.i);}).join('')+extras.join('');note.textContent='تم تحديث الاختيارات من '+messages.join(' و ')+'. الروابط تفتح صفحات الكتب الأصلية؛ اضغط «قصص جديدة» لتحديث الاختيارات.';}else{note.textContent='المكتبة الداخلية جاهزة. لم ترد الفهارس بنتائج الآن؛ جرّب بعد قليل أو ابحث عن horror أو fantasy.';}}catch(e){if(timer)clearTimeout(timer);if(n!==storyRequest)return;note.textContent='القصص الأصلية متاحة داخل الموقع، لكن تعذر تحديث الفهارس الآن. جرّب اتصال الإنترنت أو قصص جديدة لاحقًا.';}}
function showQuiz(){var run=questionRun.length?questionRun:questions,q=run[quizIndex%run.length],box=document.getElementById('hcQuizBody');if(!box)return;box.innerHTML='<div class="hc-scoreline"><span>السؤال <b>'+(quizIndex+1)+'</b> من <b>'+run.length+'</b></span><span>درجتك <b>'+quizScore+'</b></span></div><div class="hc-quiz-question">'+esc(q.q)+'</div><div class="hc-choice-grid">'+q.a.map(function(a,i){return '<button class="hc-choice" data-quiz-answer="'+i+'">'+esc(a)+'</button>';}).join('')+'</div><div class="hc-feedback" id="hcQuizFeedback">اختار إجابة واحدة.</div><button class="hc-btn primary" id="hcQuizNext" style="display:none">السؤال التالي ←</button>';}
function resetQuiz(){questionRun=shuffledCopy(questions).slice(0,10).map(function(q){var opts=shuffledCopy(q.a.map(function(answer,index){return {answer:answer,index:index};}));return {q:q.q,a:opts.map(function(x){return x.answer;}),c:opts.findIndex(function(x){return x.index===q.c;}),why:q.why};});quizIndex=0;quizScore=0;showQuiz();}
function answerQuiz(i){var run=questionRun.length?questionRun:questions,q=run[quizIndex%run.length],buttons=root.querySelectorAll('[data-quiz-answer]');buttons.forEach(function(b,j){b.disabled=true;if(j===q.c)b.classList.add('correct');if(j===i&&i!==q.c)b.classList.add('wrong');});if(i===q.c)quizScore++;document.getElementById('hcQuizFeedback').textContent=(i===q.c?'إجابة صحيحة! ':'مش دي الإجابة. ')+q.why;var next=document.getElementById('hcQuizNext');next.style.display='inline-flex';next.textContent=quizIndex===run.length-1?'اعرض النتيجة':'السؤال التالي ←';}
function startMemory(){var g=document.getElementById('hcMemoryGrid');if(!g)return;var pool=['🌙','📚','🦊','🗝️','🪐','🧩','🦉','🔮','🍄','🐉','🧙','🪄','🕯️','🦋','🌊','💎','🧭','🪶','⭐','🗺️','🦄','🛡️','🏰','⚡','🌿','🧿','🐈‍⬛','🎭','🌋','🪷'];var faces=shuffledCopy(pool).slice(0,6),cards=shuffledCopy(faces.concat(faces));memFirst=null;memLock=false;memMatches=0;if(memTimer)clearTimeout(memTimer);g.innerHTML=cards.map(function(c,i){return '<button class="hc-memory-tile" data-mem="'+i+'" data-face="'+c+'" aria-label="بطاقة مخفية">?</button>';}).join('');document.getElementById('hcMemoryFeedback').textContent='اقلب بطاقتين وحاول تجمع كل زوج؛ الرموز بتتغيّر مع كل جولة.';document.getElementById('hcMemoryScore').textContent='الأزواج: 0 / 6';}
function pickMemory(button){if(memLock||button.classList.contains('matched')||button.classList.contains('flipped'))return;button.classList.add('flipped');button.textContent=button.dataset.face;if(!memFirst){memFirst=button;return;}var first=memFirst;memFirst=null;if(first.dataset.face===button.dataset.face){first.classList.add('matched');button.classList.add('matched');memMatches++;document.getElementById('hcMemoryScore').textContent='الأزواج: '+memMatches+' / 6';if(memMatches===6){document.getElementById('hcMemoryFeedback').textContent='برافو! ذاكرتك كسبت الجولة 🎉';toast('جمعت كل الأزواج!');}return;}memLock=true;memTimer=setTimeout(function(){[first,button].forEach(function(b){b.classList.remove('flipped');b.textContent='?';});memLock=false;},780);}
function resetReaction(){clearTimeout(reactionDelay);reactionState='idle';var pad=document.getElementById('hcReactionPad');if(pad){pad.className='hc-reaction-pad';pad.textContent='اضغط لبدء التحدي';}document.getElementById('hcReactionFeedback').textContent='استنى الإشارة الخضراء، وبعدها اضغط بأسرع ما تقدر.';}
function reactionTap(){var pad=document.getElementById('hcReactionPad'),f=document.getElementById('hcReactionFeedback');if(reactionState==='idle'){reactionState='waiting';pad.className='hc-reaction-pad waiting';pad.textContent='استنى اللون الأخضر…';f.textContent='ممنوع تضغط دلوقتي!';reactionDelay=setTimeout(function(){if(reactionState!=='waiting')return;reactionState='go';reactionStart=performance.now();pad.className='hc-reaction-pad go';pad.textContent='اضغط الآن!';f.textContent='يلا!';},900+Math.random()*2600);return;}if(reactionState==='waiting'){clearTimeout(reactionDelay);reactionState='idle';pad.className='hc-reaction-pad';pad.textContent='اتسرعت! جرّب من جديد';f.textContent='ضغطت قبل الإشارة. حاول تاني.';return;}if(reactionState==='go'){var ms=Math.round(performance.now()-reactionStart);reactionState='result';pad.className='hc-reaction-pad';pad.textContent=ms+' ms';f.textContent=ms<220?'سرعة ممتازة!':'زمنك '+ms+' مللي ثانية. جرّب تكسّره.';document.getElementById('hcReactionAgain').textContent='جولة جديدة';return;}resetReaction();}
function renderHadiths(){var list=document.getElementById('hcHadithList'),q=hadithFilter.toLowerCase().trim();if(!list)return;var found=hadiths.map(function(h,i){return {h:h,i:i};}).filter(function(x){return !q||x.h[0].toLowerCase().indexOf(q)>=0||x.h[1].toLowerCase().indexOf(q)>=0;});list.innerHTML=found.map(function(x){return '<article class="hc-hadith"><blockquote>«'+esc(x.h[0])+'»</blockquote><div class="hc-hadith-meta"><span>'+esc(x.h[1])+' · '+(x.i+1)+' / 50</span><a target="_blank" rel="noopener noreferrer" href="https://sunnah.com/'+esc(x.h[2])+'">راجع النص والمصدر ↗</a></div></article>';}).join('');document.getElementById('hcHadithCount').textContent=found.length+' حديث';}
function dhikrCard(d){var n=dhikrCounts[d.id]||0;return '<article class="hc-dhikr"><div class="hc-card-top"><span class="hc-tag">'+esc(d.title)+'</span><span class="hc-tag">المطلوب: '+d.count+'</span></div><div class="hc-arabic">'+esc(d.text)+'</div><p>'+esc(d.source)+'</p><div class="hc-counter"><b id="'+d.id+'count">'+n+' / '+d.count+'</b><button class="hc-count-btn" data-dhikr="'+d.id+'">سبّح +1</button><button class="hc-count-btn" data-dhikr-reset="'+d.id+'">إعادة</button></div></article>';}
function renderDhikr(){document.getElementById('hcMorningList').innerHTML=dhikrData.map(dhikrCard).join('');document.getElementById('hcEveningList').innerHTML=dhikrData.map(dhikrCard).join('');}
function readSurah(){var box=document.getElementById('hcSurahText');box.innerHTML='<div class="hc-loading">جارٍ تحميل نص سورة الملك من واجهة القرآن الكريم…</div>';fetch('https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=67').then(function(r){if(!r.ok)throw Error('quran');return r.json();}).then(function(d){if(!d.verses||!d.verses.length)throw Error('empty');box.innerHTML=d.verses.map(function(v,i){return '<span>'+esc(v.text_uthmani||v.text||'')+' <span class="hc-ayah-num">۞ '+(i+1)+'</span> </span>';}).join('');}).catch(function(){box.innerHTML='<div class="hc-loading">تعذّر تحميل النص الآن. افتح السورة من مصدرها الموثوق: <a style="color:var(--hc-teal)" href="https://quran.com/67" target="_blank" rel="noopener">سورة الملك على Quran.com ↗</a></div>';});}

var HC_NOTES_KEY='halal_community_notes_v1',hcNotes=[],hcActiveNoteId=null,hcAiBusy=false;
function hcLoadNotes(){try{var raw=JSON.parse(localStorage.getItem(HC_NOTES_KEY)||'[]');if(!Array.isArray(raw))return [];return raw.filter(function(n){return n&&typeof n.id==='string';}).map(function(n){return {id:n.id,title:String(n.title||'نوتة بدون عنوان'),body:String(n.body||''),updatedAt:Number(n.updatedAt)||Date.now()};});}catch(e){return [];}}
function hcStoreNotes(){try{localStorage.setItem(HC_NOTES_KEY,JSON.stringify(hcNotes));var state=document.getElementById('hcNoteSaveState');if(state)state.textContent='اتحفظت على الجهاز ✓';}catch(e){var state=document.getElementById('hcNoteSaveState');if(state)state.textContent='تعذر الحفظ؛ قد تكون مساحة التخزين ممتلئة.';}}
function hcActiveNote(){return hcNotes.find(function(n){return n.id===hcActiveNoteId;})||null;}
function hcNewId(){return 'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function hcSyncEditor(){var n=hcActiveNote();if(!n)return;var title=document.getElementById('hcNoteTitle'),body=document.getElementById('hcNoteBody');if(title)n.title=title.value.trim()||'نوتة بدون عنوان';if(body)n.body=body.value;n.updatedAt=Date.now();hcStoreNotes();}
function hcRenderNoteList(){var list=document.getElementById('hcNoteList');if(!list)return;if(!hcNotes.length){list.innerHTML='<div class="hc-notes-list-empty">مفيش نوتس لسه. اضغط «نوتة جديدة» للبدء.</div>';return;}list.innerHTML=hcNotes.slice().sort(function(a,b){return b.updatedAt-a.updatedAt;}).map(function(n){var active=n.id===hcActiveNoteId;return '<button class="hc-note-item'+(active?' active':'')+'" type="button" data-note-open="'+esc(n.id)+'"><strong>'+esc(n.title||'نوتة بدون عنوان')+'</strong><span>'+esc((n.body||'').replace(/\s+/g,' ').slice(0,76)||'نوتة فارغة')+'</span></button>';}).join('');}
function hcRenderNotes(){var editor=document.getElementById('hcNotesEditor'),empty=document.getElementById('hcNotesEmpty'),n=hcActiveNote();if(editor)editor.style.display=n?'block':'none';if(empty)empty.style.display=n?'none':'block';hcRenderNoteList();if(n){var title=document.getElementById('hcNoteTitle'),body=document.getElementById('hcNoteBody');if(title)title.value=n.title==='نوتة بدون عنوان'?'':n.title;if(body)body.value=n.body;}}
function hcInitNotes(){hcNotes=hcLoadNotes();hcActiveNoteId=hcNotes.length?hcNotes.slice().sort(function(a,b){return b.updatedAt-a.updatedAt;})[0].id:null;hcRenderNotes();}
function hcHandleNoteInput(target){var n=hcActiveNote();if(!n)return;if(target.id==='hcNoteTitle')n.title=target.value.trim()||'نوتة بدون عنوان';if(target.id==='hcNoteBody')n.body=target.value;n.updatedAt=Date.now();hcStoreNotes();hcRenderNoteList();}

function setCommunityMode(on){app.classList.toggle('community-mode',on);document.querySelectorAll('.bottom-nav .nav-item').forEach(function(b){b.classList.toggle('active',on?b.hasAttribute('data-hubnav'):b.getAttribute('data-nav')==='home');});if(on)window.scrollTo({top:0,behavior:'smooth'});}
root.innerHTML=`
<section class="hc-hero">
  <div class="hc-hero-copy">
    <div class="hc-kicker">HALAL COMMUNITY · مساحة شخصية</div>
    <h1 class="hc-title">مكانك للذكر<br><span>والتعلّم والكتابة</span></h1>
    <p class="hc-desc">مساحة هادئة تجمع قنواتك، والقرآن والأذكار والأحاديث، ونوتس خاصة تحتفظ بأفكارك وملاحظاتك على جهازك.</p>
    <div class="hc-actions"><a class="hc-btn primary" href="#hcNotes">افتح النوتس ✎</a><a class="hc-btn purple" href="#hcSpiritual">الأذكار والقرآن ☾</a><button class="hc-btn" id="hcOpenChannels" type="button">افتح القنوات ↗</button></div>
    <div class="hc-pill-row"><span class="hc-pill">✦ نوتس تُحفظ على جهازك</span><span class="hc-pill">✦ نوتس لأفكارك</span><span class="hc-pill">✦ قرآن وأذكار وأحاديث</span></div>
  </div><div class="hc-hero-art"><div class="hc-orbit"><div class="hc-moon"></div><div class="hc-core"><b>☾</b><span>WRITE · REFLECT · GROW</span></div></div></div>
</section>
<nav class="hc-jumpbar" aria-label="أقسام المجتمع"><a href="#hcNotes">✎ النوتس والمساعد</a><a href="#hcSpiritual">☾ الأذكار والقرآن</a><a href="#hcHadith">📜 الأحاديث</a><a href="#hcChannels" id="hcJumpChannels">▶ القنوات</a></nav>
<section class="hc-section" id="hcNotes">
  <div class="hc-section-head"><div><h2 class="hc-heading">دفتر النوتس ✎</h2><div class="hc-sub">اكتب أفكارك وملاحظاتك ودروسك، ورتبها في نوتات منفصلة.</div></div><span class="hc-count">NOTES</span></div>
  <div class="hc-notes-layout">
    <aside class="hc-notes-sidebar"><button class="hc-btn primary hc-note-new" id="hcNoteNew" type="button">＋ نوتة جديدة</button><div class="hc-notes-list" id="hcNoteList"></div><p class="hc-mini-note">النوتس محفوظة على هذا الجهاز والمتصفح فقط.</p></aside>
    <div class="hc-notes-main">
      <div class="hc-card hc-notes-empty" id="hcNotesEmpty"><div class="hc-icon">✎</div><h3>ابدأ بنوتة جديدة</h3><p>اكتب ملاحظاتك، درسًا، فكرة، خطة، أو أي شيء تحب ترجع له.</p><button class="hc-btn primary" id="hcNoteNewEmpty" type="button">إنشاء أول نوتة</button></div>
      <div class="hc-notes-editor" id="hcNotesEditor" style="display:none">
        <div class="hc-note-title-row"><input id="hcNoteTitle" class="hc-input hc-note-title" maxlength="160" placeholder="عنوان النوتة"><button class="hc-btn danger" id="hcNoteDelete" type="button">حذف</button></div>
        <textarea id="hcNoteBody" class="hc-input hc-note-body" placeholder="اكتب ملاحظاتك هنا…&#10;&#10;تقدر تكتب درس، فكرة، خطة، أو أي شيء تحب ترجع له." rows="9"></textarea>
        <div class="hc-note-toolbar"><span id="hcNoteSaveState" class="hc-mini-note">يُحفظ تلقائيًا</span><button class="hc-btn" id="hcNoteSave" type="button">حفظ الآن ✓</button></div>
      </div>
    </div>
  </div>
</section>
<section class="hc-section" id="hcSpiritual">
  <div class="hc-section-head"><div><h2 class="hc-heading">الأذكار والقرآن ☾</h2><div class="hc-sub">اقرأ الأذكار، وتابع عدّادك، واقرأ سورة الملك من النص المتاح.</div></div><span class="hc-count">ذكر وقرآن</span></div>
  <div class="hc-spiritual-grid"><div class="hc-card"><div class="hc-card-top"><div><h3 style="margin:0">أذكار الصباح</h3><p>اقرأ الذكر واضغط على العدّاد بعد كل مرة.</p></div><div class="hc-icon">🌅</div></div><div id="hcMorningList"></div><button class="hc-btn" data-reset-dhikr="all" type="button">إعادة عدّادات الصباح</button></div><div class="hc-card"><div class="hc-card-top"><div><h3 style="margin:0">أذكار المساء</h3><p>خذ دقيقة هدوء قبل نهاية اليوم.</p></div><div class="hc-icon">🌙</div></div><div id="hcEveningList"></div><button class="hc-btn" data-reset-dhikr="all" type="button">إعادة عدّادات المساء</button></div></div>
  <div class="hc-quran-wrap"><div class="hc-quran"><div class="hc-card-top"><div><h3 style="margin:0">سورة الملك · 67</h3><p>النص يُحمّل من واجهة القرآن الكريم، ويمكن فتح المصدر مباشرة.</p></div><div class="hc-icon">📖</div></div><div class="hc-actions" style="margin:12px 0"><a class="hc-btn gold" href="https://quran.com/67" target="_blank" rel="noopener noreferrer">اقرأ واستمع للسورة ↗</a><button class="hc-btn" id="hcReloadSurah" type="button">إعادة تحميل النص</button></div><div id="hcSurahText" class="hc-quran-text"><div class="hc-loading">جارٍ تجهيز السورة…</div></div></div></div>
  <div class="hc-sub">المصادر مذكورة مع الأذكار، ويمكن مراجعة النص الكامل من المصدر الأصلي.</div>
</section>
<section class="hc-section" id="hcHadith">
  <div class="hc-section-head"><div><h2 class="hc-heading">أحاديث للتذكّر 📜</h2><div class="hc-sub">ابحث في مجموعة الأحاديث وافتح المصدر للتحقق من النص والسياق.</div></div><span class="hc-count" id="hcHadithCount">50 حديث</span></div>
  <div class="hc-hadith-tools"><input class="hc-input" id="hcHadithSearch" placeholder="ابحث في نص الحديث أو المصدر…"><button class="hc-btn" id="hcHadithClear" type="button">عرض الكل ↻</button></div><div class="hc-hadith-list" id="hcHadithList"></div>
</section>
<section class="hc-section" id="hcChannels"><div class="hc-card hc-channels-card"><div class="hc-card-top"><div><h2 class="hc-heading">قنواتك ومكتبة الفيديوهات ▶</h2><div class="hc-sub">القنوات والمحفوظات والمشغّل الأصلي متاحون من تبويبات الموقع الرئيسية.</div></div><div class="hc-icon">▶</div></div><div class="hc-actions"><button class="hc-btn primary" id="hcOpenChannelsBottom" type="button">افتح القنوات ↗</button><button class="hc-btn" id="hcOpenVideos" type="button">افتح مكتبة الفيديوهات ↗</button></div></div></section>
<footer class="hc-footer"><span>Halal Community · نوتس وذكر وقنوات</span><span>النوتس محفوظة على هذا الجهاز والمتصفح.</span></footer>
`;

var nav=document.querySelector('.bottom-nav');if(nav&&!nav.querySelector('[data-hubnav]'))nav.insertAdjacentHTML('beforeend','<button class="nav-item" data-hubnav="true" aria-label="Halal Community"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A7 7 0 0 1 12 3.5Z"/><path d="m17.5 2 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></svg><span>المجتمع</span></button>');
var brand=document.querySelector('.brandname'),hint=document.querySelector('.brandhint');if(brand)brand.textContent='Halal Community';if(hint)hint.remove();document.title='Halal Community';var desc=document.querySelector('meta[name="description"]');if(desc)desc.content='Halal Community: نوتس ذكية، قنوات، أذكار، قرآن وأحاديث.';
app.classList.add('community-mode');
root.innerHTML=`
<section class="hc-hero">
  <div class="hc-hero-copy">
    <div class="hc-kicker">HALAL COMMUNITY · مساحة شخصية</div>
    <h1 class="hc-title">مكانك للذكر<br><span>والتعلّم والكتابة</span></h1>
    <p class="hc-desc">مساحة هادئة تجمع قنواتك، والقرآن والأذكار والأحاديث، ونوتس خاصة تحتفظ بأفكارك وملاحظاتك على جهازك.</p>
    <div class="hc-actions"><a class="hc-btn primary" href="#hcNotes">افتح النوتس ✎</a><a class="hc-btn purple" href="#hcSpiritual">الأذكار والقرآن ☾</a><button class="hc-btn" id="hcOpenChannels" type="button">افتح القنوات ↗</button></div>
    <div class="hc-pill-row"><span class="hc-pill">✦ نوتس تُحفظ على جهازك</span><span class="hc-pill">✦ نوتس لأفكارك</span><span class="hc-pill">✦ قرآن وأذكار وأحاديث</span></div>
  </div><div class="hc-hero-art"><div class="hc-orbit"><div class="hc-moon"></div><div class="hc-core"><b>☾</b><span>WRITE · REFLECT · GROW</span></div></div></div>
</section>
<nav class="hc-jumpbar" aria-label="أقسام المجتمع"><a href="#hcNotes">✎ النوتس والمساعد</a><a href="#hcSpiritual">☾ الأذكار والقرآن</a><a href="#hcHadith">📜 الأحاديث</a><a href="#hcChannels" id="hcJumpChannels">▶ القنوات</a></nav>
<section class="hc-section" id="hcNotes">
  <div class="hc-section-head"><div><h2 class="hc-heading">دفتر النوتس ✎</h2><div class="hc-sub">اكتب أفكارك وملاحظاتك ودروسك، ورتبها في نوتات منفصلة.</div></div><span class="hc-count">NOTES</span></div>
  <div class="hc-notes-layout">
    <aside class="hc-notes-sidebar"><button class="hc-btn primary hc-note-new" id="hcNoteNew" type="button">＋ نوتة جديدة</button><div class="hc-notes-list" id="hcNoteList"></div><p class="hc-mini-note">النوتس محفوظة على هذا الجهاز والمتصفح فقط.</p></aside>
    <div class="hc-notes-main">
      <div class="hc-card hc-notes-empty" id="hcNotesEmpty"><div class="hc-icon">✎</div><h3>ابدأ بنوتة جديدة</h3><p>اكتب ملاحظاتك، درسًا، فكرة، خطة، أو أي شيء تحب ترجع له.</p><button class="hc-btn primary" id="hcNoteNewEmpty" type="button">إنشاء أول نوتة</button></div>
      <div class="hc-notes-editor" id="hcNotesEditor" style="display:none">
        <div class="hc-note-title-row"><input id="hcNoteTitle" class="hc-input hc-note-title" maxlength="160" placeholder="عنوان النوتة"><button class="hc-btn danger" id="hcNoteDelete" type="button">حذف</button></div>
        <textarea id="hcNoteBody" class="hc-input hc-note-body" placeholder="اكتب ملاحظاتك هنا…&#10;&#10;تقدر تكتب درس، فكرة، خطة، أو أي شيء تحب ترجع له." rows="9"></textarea>
        <div class="hc-note-toolbar"><span id="hcNoteSaveState" class="hc-mini-note">يُحفظ تلقائيًا</span><button class="hc-btn" id="hcNoteSave" type="button">حفظ الآن ✓</button></div>
      </div>
    </div>
  </div>
</section>
<section class="hc-section" id="hcSpiritual">
  <div class="hc-section-head"><div><h2 class="hc-heading">الأذكار والقرآن ☾</h2><div class="hc-sub">اقرأ الأذكار، وتابع عدّادك، واقرأ سورة الملك من النص المتاح.</div></div><span class="hc-count">ذكر وقرآن</span></div>
  <div class="hc-spiritual-grid"><div class="hc-card"><div class="hc-card-top"><div><h3 style="margin:0">أذكار الصباح</h3><p>اقرأ الذكر واضغط على العدّاد بعد كل مرة.</p></div><div class="hc-icon">🌅</div></div><div id="hcMorningList"></div><button class="hc-btn" data-reset-dhikr="all" type="button">إعادة عدّادات الصباح</button></div><div class="hc-card"><div class="hc-card-top"><div><h3 style="margin:0">أذكار المساء</h3><p>خذ دقيقة هدوء قبل نهاية اليوم.</p></div><div class="hc-icon">🌙</div></div><div id="hcEveningList"></div><button class="hc-btn" data-reset-dhikr="all" type="button">إعادة عدّادات المساء</button></div></div>
  <div class="hc-quran-wrap"><div class="hc-quran"><div class="hc-card-top"><div><h3 style="margin:0">سورة الملك · 67</h3><p>النص يُحمّل من واجهة القرآن الكريم، ويمكن فتح المصدر مباشرة.</p></div><div class="hc-icon">📖</div></div><div class="hc-actions" style="margin:12px 0"><a class="hc-btn gold" href="https://quran.com/67" target="_blank" rel="noopener noreferrer">اقرأ واستمع للسورة ↗</a><button class="hc-btn" id="hcReloadSurah" type="button">إعادة تحميل النص</button></div><div id="hcSurahText" class="hc-quran-text"><div class="hc-loading">جارٍ تجهيز السورة…</div></div></div></div>
  <div class="hc-sub">المصادر مذكورة مع الأذكار، ويمكن مراجعة النص الكامل من المصدر الأصلي.</div>
</section>
<section class="hc-section" id="hcHadith">
  <div class="hc-section-head"><div><h2 class="hc-heading">أحاديث للتذكّر 📜</h2><div class="hc-sub">ابحث في مجموعة الأحاديث وافتح المصدر للتحقق من النص والسياق.</div></div><span class="hc-count" id="hcHadithCount">50 حديث</span></div>
  <div class="hc-hadith-tools"><input class="hc-input" id="hcHadithSearch" placeholder="ابحث في نص الحديث أو المصدر…"><button class="hc-btn" id="hcHadithClear" type="button">عرض الكل ↻</button></div><div class="hc-hadith-list" id="hcHadithList"></div>
</section>
<section class="hc-section" id="hcChannels"><div class="hc-card hc-channels-card"><div class="hc-card-top"><div><h2 class="hc-heading">قنواتك ومكتبة الفيديوهات ▶</h2><div class="hc-sub">القنوات والمحفوظات والمشغّل الأصلي متاحون من تبويبات الموقع الرئيسية.</div></div><div class="hc-icon">▶</div></div><div class="hc-actions"><button class="hc-btn primary" id="hcOpenChannelsBottom" type="button">افتح القنوات ↗</button><button class="hc-btn" id="hcOpenVideos" type="button">افتح مكتبة الفيديوهات ↗</button></div></div></section>
<footer class="hc-footer"><span>Halal Community · نوتس وذكر وقنوات</span><span>النوتس محفوظة على هذا الجهاز والمتصفح.</span></footer>
`;

var nav=document.querySelector('.bottom-nav');if(nav&&!nav.querySelector('[data-hubnav]'))nav.insertAdjacentHTML('beforeend','<button class="nav-item" data-hubnav="true" aria-label="Halal Community"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A7 7 0 0 1 12 3.5Z"/><path d="m17.5 2 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></svg><span>المجتمع</span></button>');
var brand=document.querySelector('.brandname'),hint=document.querySelector('.brandhint');if(brand)brand.textContent='Halal Community';if(hint)hint.textContent='متعة. معرفة. طمأنينة.';
document.title='Halal Community — نوتس وذكر وقنوات';var desc=document.querySelector('meta[name="description"]');if(desc)desc.content='Halal Community: نوتس ذكية، قنوات، أذكار، قرآن وأحاديث.';
app.classList.add('community-mode');
root.innerHTML=`
<section class="hc-hero">
  <div class="hc-hero-copy">
    <div class="hc-kicker">HALAL COMMUNITY · مساحة شخصية</div>
    <h1 class="hc-title">مكانك للذكر<br><span>والتعلّم والكتابة</span></h1>
    <p class="hc-desc">مساحة هادئة تجمع قنواتك، والقرآن والأذكار والأحاديث، ونوتس خاصة تحتفظ بأفكارك وملاحظاتك على جهازك.</p>
    <div class="hc-actions"><a class="hc-btn primary" href="#hcNotes">افتح النوتس ✎</a><a class="hc-btn purple" href="#hcSpiritual">الأذكار والقرآن ☾</a><button class="hc-btn" id="hcOpenChannels" type="button">افتح القنوات ↗</button></div>
    <div class="hc-pill-row"><span class="hc-pill">✦ نوتس تُحفظ على جهازك</span><span class="hc-pill">✦ نوتس لأفكارك</span><span class="hc-pill">✦ قرآن وأذكار وأحاديث</span></div>
  </div><div class="hc-hero-art"><div class="hc-orbit"><div class="hc-moon"></div><div class="hc-core"><b>☾</b><span>WRITE · REFLECT · GROW</span></div></div></div>
</section>
<nav class="hc-jumpbar" aria-label="أقسام المجتمع"><a href="#hcNotes">✎ النوتس والمساعد</a><a href="#hcSpiritual">☾ الأذكار والقرآن</a><a href="#hcHadith">📜 الأحاديث</a><a href="#hcChannels" id="hcJumpChannels">▶ القنوات</a></nav>
<section class="hc-section" id="hcNotes">
  <div class="hc-section-head"><div><h2 class="hc-heading">دفتر النوتس ✎</h2><div class="hc-sub">اكتب أفكارك وملاحظاتك ودروسك، ورتبها في نوتات منفصلة.</div></div><span class="hc-count">NOTES</span></div>
  <div class="hc-notes-layout">
    <aside class="hc-notes-sidebar"><button class="hc-btn primary hc-note-new" id="hcNoteNew" type="button">＋ نوتة جديدة</button><div class="hc-notes-list" id="hcNoteList"></div><p class="hc-mini-note">النوتس محفوظة على هذا الجهاز والمتصفح فقط.</p></aside>
    <div class="hc-notes-main">
      <div class="hc-card hc-notes-empty" id="hcNotesEmpty"><div class="hc-icon">✎</div><h3>ابدأ بنوتة جديدة</h3><p>اكتب ملاحظاتك، درسًا، فكرة، خطة، أو أي شيء تحب ترجع له.</p><button class="hc-btn primary" id="hcNoteNewEmpty" type="button">إنشاء أول نوتة</button></div>
      <div class="hc-notes-editor" id="hcNotesEditor" style="display:none">
        <div class="hc-note-title-row"><input id="hcNoteTitle" class="hc-input hc-note-title" maxlength="160" placeholder="عنوان النوتة"><button class="hc-btn danger" id="hcNoteDelete" type="button">حذف</button></div>
        <textarea id="hcNoteBody" class="hc-input hc-note-body" placeholder="اكتب ملاحظاتك هنا…&#10;&#10;تقدر تكتب درس، فكرة، خطة، أو أي شيء تحب ترجع له." rows="9"></textarea>
        <div class="hc-note-toolbar"><span id="hcNoteSaveState" class="hc-mini-note">يُحفظ تلقائيًا</span><button class="hc-btn" id="hcNoteSave" type="button">حفظ الآن ✓</button></div>
      </div>
    </div>
  </div>
</section>
<section class="hc-section" id="hcSpiritual">
  <div class="hc-section-head"><div><h2 class="hc-heading">الأذكار والقرآن ☾</h2><div class="hc-sub">اقرأ الأذكار، وتابع عدّادك، واقرأ سورة الملك من النص المتاح.</div></div><span class="hc-count">ذكر وقرآن</span></div>
  <div class="hc-spiritual-grid"><div class="hc-card"><div class="hc-card-top"><div><h3 style="margin:0">أذكار الصباح</h3><p>اقرأ الذكر واضغط على العدّاد بعد كل مرة.</p></div><div class="hc-icon">🌅</div></div><div id="hcMorningList"></div><button class="hc-btn" data-reset-dhikr="all" type="button">إعادة عدّادات الصباح</button></div><div class="hc-card"><div class="hc-card-top"><div><h3 style="margin:0">أذكار المساء</h3><p>خذ دقيقة هدوء قبل نهاية اليوم.</p></div><div class="hc-icon">🌙</div></div><div id="hcEveningList"></div><button class="hc-btn" data-reset-dhikr="all" type="button">إعادة عدّادات المساء</button></div></div>
  <div class="hc-quran-wrap"><div class="hc-quran"><div class="hc-card-top"><div><h3 style="margin:0">سورة الملك · 67</h3><p>النص يُحمّل من واجهة القرآن الكريم، ويمكن فتح المصدر مباشرة.</p></div><div class="hc-icon">📖</div></div><div class="hc-actions" style="margin:12px 0"><a class="hc-btn gold" href="https://quran.com/67" target="_blank" rel="noopener noreferrer">اقرأ واستمع للسورة ↗</a><button class="hc-btn" id="hcReloadSurah" type="button">إعادة تحميل النص</button></div><div id="hcSurahText" class="hc-quran-text"><div class="hc-loading">جارٍ تجهيز السورة…</div></div></div></div>
  <div class="hc-sub">المصادر مذكورة مع الأذكار، ويمكن مراجعة النص الكامل من المصدر الأصلي.</div>
</section>
<section class="hc-section" id="hcHadith">
  <div class="hc-section-head"><div><h2 class="hc-heading">أحاديث للتذكّر 📜</h2><div class="hc-sub">ابحث في مجموعة الأحاديث وافتح المصدر للتحقق من النص والسياق.</div></div><span class="hc-count" id="hcHadithCount">50 حديث</span></div>
  <div class="hc-hadith-tools"><input class="hc-input" id="hcHadithSearch" placeholder="ابحث في نص الحديث أو المصدر…"><button class="hc-btn" id="hcHadithClear" type="button">عرض الكل ↻</button></div><div class="hc-hadith-list" id="hcHadithList"></div>
</section>
<section class="hc-section" id="hcChannels"><div class="hc-card hc-channels-card"><div class="hc-card-top"><div><h2 class="hc-heading">قنواتك ومكتبة الفيديوهات ▶</h2><div class="hc-sub">القنوات والمحفوظات والمشغّل الأصلي متاحون من تبويبات الموقع الرئيسية.</div></div><div class="hc-icon">▶</div></div><div class="hc-actions"><button class="hc-btn primary" id="hcOpenChannelsBottom" type="button">افتح القنوات ↗</button><button class="hc-btn" id="hcOpenVideos" type="button">افتح مكتبة الفيديوهات ↗</button></div></div></section>
<footer class="hc-footer"><span>Halal Community · نوتس وذكر وقنوات</span><span>النوتس محفوظة على هذا الجهاز والمتصفح.</span></footer>
`;
function refreshCounts(){document.querySelectorAll('[id$="count"]').forEach(function(e){var d=dhikrData.find(function(x){return e.id===x.id+'count';});if(d)e.textContent=(dhikrCounts[d.id]||0)+' / '+d.count;});}
var nav=document.querySelector('.bottom-nav');if(nav&&!nav.querySelector('[data-hubnav]'))nav.insertAdjacentHTML('beforeend','<button class="nav-item" data-hubnav="true" aria-label="Halal Community"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A7 7 0 0 1 12 3.5Z"/><path d="m17.5 2 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/></svg><span>المجتمع</span></button>');
var brand=document.querySelector('.brandname'),hint=document.querySelector('.brandhint');if(brand)brand.textContent='Halal Community';if(hint)hint.textContent='متعة. معرفة. طمأنينة.';
document.title='Halal Community — نوتس وذكر وقنوات';var desc=document.querySelector('meta[name="description"]');if(desc)desc.content='Halal Community: نوتس ذكية، قنوات، أذكار، قرآن وأحاديث.';
app.classList.add('community-mode');hcInitNotes();renderDhikr();renderHadiths();readSurah();
function setMode(on){app.classList.toggle('community-mode',on);document.querySelectorAll('.bottom-nav .nav-item').forEach(function(b){b.classList.toggle('active',on?b.hasAttribute('data-hubnav'):b.getAttribute('data-nav')==='home');});if(on)window.scrollTo({top:0,behavior:'smooth'});}
document.addEventListener('click',function(e){
 var target=e.target.closest('[data-hubnav]');if(target){e.preventDefault();setMode(true);return;}
 var old=e.target.closest('[data-nav]');if(old){setMode(false);return;}
 target=e.target.closest('#hcNoteNew,#hcNoteNewEmpty');if(target){hcCreateNote();return;}
 target=e.target.closest('[data-note-open]');if(target){hcSelectNote(target.dataset.noteOpen);return;}
 if(e.target.closest('#hcNoteSave')){hcSyncEditor();hcRenderNoteList();toast('تم حفظ النوتة على هذا الجهاز');return;}
 if(e.target.closest('#hcNoteDelete')){hcDeleteNote();return;}




 if(e.target.closest('#hcHadithClear')){hadithFilter='';var search=document.getElementById('hcHadithSearch');if(search)search.value='';renderHadiths();return;}
 if(e.target.closest('#hcReloadSurah')){readSurah();return;}
 if(e.target.closest('#hcOpenChannels')||e.target.closest('#hcOpenChannelsBottom')||e.target.closest('#hcJumpChannels')||e.target.closest('#hcOpenVideos')){setMode(false);var channelButton=document.querySelector('[data-nav="channels"]');if(channelButton)channelButton.click();else{var homeButton=document.querySelector('[data-nav="home"]');if(homeButton)homeButton.click();}return;}
 if(e.target.closest('[data-dhikr]')){var dbutton=e.target.closest('[data-dhikr]'),dhikrId=dbutton.dataset.dhikr,d=dhikrData.find(function(x){return x.id===dhikrId;});if(!d)return;dhikrCounts[dhikrId]=(dhikrCounts[dhikrId]||0)+1;document.querySelectorAll('#'+dhikrId+'count').forEach(function(el){el.textContent=dhikrCounts[dhikrId]+' / '+d.count;});if(dhikrCounts[dhikrId]===d.count)toast('أحسنت، أتممت العدد المختار.');return;}
 target=e.target.closest('[data-dhikr-reset]');if(target){dhikrCounts[target.dataset.dhikrReset]=0;refreshCounts();return;}
 if(e.target.closest('[data-reset-dhikr="all"]')){dhikrCounts={};refreshCounts();return;}
},false);
document.addEventListener('input',function(e){if(e.target&&e.target.id==='hcHadithSearch'){hadithFilter=e.target.value;renderHadiths();return;}if(e.target&&(e.target.id==='hcNoteTitle'||e.target.id==='hcNoteBody')){hcHandleNoteInput(e.target);}});
document.addEventListener('click',function(e){if(e.target.closest('button,.hc-btn,.bottom-nav .nav-item'))playClick();},true);
})();
