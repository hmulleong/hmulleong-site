(function(){
"use strict";
var S=null;
var app=document.getElementById("app");
var canWrite=false,artifactNs=null,assetsNs=null;
var active=0,giftFilter="전체";
var KIND={notice:"NOTICE",update:"UPDATE",news:"NEWS"};
var KIND_KO={notice:"공지",update:"업데이트",news:"소식"};
var ARROW='<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var ARROW_W='<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var ARROW_L='<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function safeUrl(u){u=String(u||"").trim();return /^https?:\/\//i.test(u)?u:"";}
function src(v){v=String(v||"").trim();if(!v)return"";if(/^https?:\/\//i.test(v))return v;return /^[A-Za-z0-9_\-][A-Za-z0-9_\-.\/ ]*$/.test(v)&&v.indexOf("..")<0?v:"";}
function pad(n){return n<10?"0"+n:String(n);}
function fmt(d){return (d||"").replace(/-/g,".");}
function today(){var n=new Date();return n.getFullYear()+"-"+pad(n.getMonth()+1)+"-"+pad(n.getDate());}
function prose(t){return String(t||"").split(/\n\s*\n/).map(function(p){var h=esc(p.trim()).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>");return h?"<p>"+h+"</p>":"";}).join("");}
function excerpt(t){return String(t||"").replace(/\*\*/g,"").replace(/\s+/g," ").trim();}
function clone(o){return JSON.parse(JSON.stringify(o));}
function find(list,id){for(var i=0;i<list.length;i++)if(list[i].id===id)return list[i];return null;}
function postsSorted(){return S.posts.slice().sort(function(a,b){if(!!a.pinned!==!!b.pinned)return b.pinned?1:-1;return (b.date||"").localeCompare(a.date||"")||(b.created||0)-(a.created||0);});}
function giftsSorted(){return S.gifts.slice().sort(function(a,b){return (b.date||"").localeCompare(a.date||"")||(b.created||0)-(a.created||0);});}

/* ---------- views ---------- */
function header(){
  return '<header class="top"><div class="wrap"><a class="logo" href="#top">'+esc(S.site.name.toLowerCase())+'.</a>'+
    '<nav class="nav" aria-label="주 메뉴"><a href="#characters">Characters</a><a href="#news">Notice &amp; News</a><a href="#gifts">축전 · 선물</a>'+(hasLinks()?'<a href="#links">Links</a>':"")+'</nav></div></header>';
}
function heroMedia(){
  var v=src(S.site.video),p=src(S.site.poster),op=Math.max(.1,Math.min(1,(+S.site.opacity||60)/100));
  var inner=v?(/\.gif(\?|#|$)/i.test(v)?'<img src="'+esc(v)+'" alt="">':'<video src="'+esc(v)+'"'+(p?' poster="'+esc(p)+'"':"")+' autoplay muted loop playsinline aria-hidden="true"></video>'):(p?'<img src="'+esc(p)+'" alt="">':"");
  return '<div class="hero-media" style="opacity:'+op+'">'+inner+'</div>';
}
function hero(){
  var chars=Array.from(S.site.name||"Hmulleong");
  return '<section class="hero" id="top">'+heroMedia()+'<div class="hero-shade" aria-hidden="true"></div>'+header()+
    '<div class="hero-body" style="--n:'+chars.length+'"><span class="eyebrow r1">CHARACTER ARCHIVE</span><h1 class="script">'+esc(S.site.name)+'</h1>'+
    '<a href="#characters" class="pill late" style="margin-top:-8px"><span class="l">캐릭터 보러가기</span></a></div>'+
    '<a href="#characters" class="scroll late" style="--n:'+chars.length+'">SCROLL<i aria-hidden="true"></i></a></section>';
}
function charsSec(){
  var n=S.chars.length;
  var head='<div class="sec-head"><div><h2>Characters</h2><p>카드를 넘겨 오늘 빠져들 사람을 골라보세요. 가운데 카드를 누르면 그 캐릭터로 이동해요.</p></div>'+
    (n?'<span class="count" id="car-count">'+pad(active+1)+'<small> / '+pad(n)+'</small></span>':"")+'</div>';
  if(!n)return '<section class="sec" id="characters"><div class="wrap">'+head+'<div class="empty-g">곧 캐릭터가 올라와요.</div></div></section>';
  var cards=S.chars.map(function(c,i){
    var im=src(c.cover),lk=c.adult&&!isAdult();
    return '<a class="cc'+(i===active?" on":"")+(lk?" lock":"")+'" href="#c-'+esc(c.id)+'" data-i="'+i+'" aria-label="'+esc(c.name)+'">'+
      (im?'<img src="'+esc(im)+'" alt="" loading="lazy">':'<span class="ph" aria-hidden="true">'+esc((c.name||"?").charAt(0))+'</span>')+
      '<span class="sh" aria-hidden="true"></span><span class="num">'+pad(i+1)+'</span>'+(c.adult?'<span class="b19" aria-label="성인 전용">19</span>':"")+
      '<span class="meta"><span style="min-width:0"><h3>'+esc(c.name)+'</h3>'+(c.role?'<span class="role">'+esc(c.role)+'</span>':"")+'</span><span class="go" aria-hidden="true">'+ARROW+'</span></span></a>';
  }).join("");
  return '<section class="sec" id="characters"><div class="wrap">'+head+'</div>'+
    '<div class="car" id="car" aria-roledescription="carousel"><div class="track" id="track">'+cards+'</div></div>'+
    '<div class="car-ctrl"><button type="button" class="round" data-act="prev" aria-label="이전 캐릭터">'+ARROW_L+'</button><button type="button" class="round" data-act="next" aria-label="다음 캐릭터">'+ARROW_W+'</button></div></section>';
}
function newsSec(){
  var list=postsSorted().slice(0,4);
  var cards=list.map(function(p,i){
    var white=i===0,big=i===1;
    return '<a class="nc'+(white?" white":"")+(big?" big":"")+'" href="#p-'+esc(p.id)+'"><span class="top-row"><span class="num">'+pad(i+1)+'</span>'+(p.pinned?'<span class="flag">PINNED</span>':"")+'</span>'+
      '<span><span class="kind">'+(KIND[p.kind]||"NOTICE")+' · '+esc(fmt(p.date))+'</span><h3>'+esc(p.title)+'</h3>'+(p.body&&(white||big)?'<span class="ex">'+esc(excerpt(p.body))+'</span>':"")+'</span></a>';
  }).join("");
  return '<section class="sec" id="news"><div class="wrap"><div class="sec-head"><div><h2>Notice &amp; News</h2><p>공지, 업데이트, 소소한 소식을 한곳에 모아둬요.</p></div>'+
    '<a href="#all-news" class="pill"><span class="l">전체 보기</span><span class="a">'+ARROW+'</span></a></div>'+
    (cards?'<div class="news">'+cards+'</div>':'<div class="empty-g">아직 올라온 소식이 없어요.</div>')+'</div></section>';
}
function giftsGrid(){
  var all=giftsSorted();
  var list=all.filter(function(g){return giftFilter==="전체"||g.kind===giftFilter;});
  var items=list.map(function(g){
    var im=src(g.image);
    return '<a class="gc" href="#g-'+esc(g.id)+'">'+(im?'<img src="'+esc(im)+'" alt="'+esc(g.title||g.kind)+'" loading="lazy">':'<div class="ph">이미지 없음</div>')+
      '<span class="sh" aria-hidden="true"></span><span class="tag '+(g.kind==="축전"?"w":"g")+'">'+esc(g.kind)+'</span>'+
      '<span class="cap">'+(g.title?'<b>'+esc(g.title)+'</b>':"")+(g.from?'<span>from '+esc(g.from)+'</span>':"")+'</span></a>';
  }).join("");
  return '<div class="thanks iri"><span style="font:500 11px var(--f-display);letter-spacing:.14em;color:var(--dim)">THANK YOU</span><b>From you,<br>with love.</b><small>받은 축전과 선물을 모아두는 곳이에요. 마음을 보내주신 분들께 고마워요.</small></div>'+
    (items||'<div class="empty-g">'+(all.length?"이 분류에는 아직 없어요.":"아직 올라온 축전·선물이 없어요.")+'</div>');
}
function giftChips(){
  var all=S.gifts;
  return ["전체","축전","선물"].map(function(l){
    var c=l==="전체"?all.length:all.filter(function(g){return g.kind===l;}).length;
    return '<button type="button" class="chip" data-act="gf" data-v="'+l+'" aria-pressed="'+(l===giftFilter)+'">'+l+'<span>'+c+'</span></button>';
  }).join("");
}
function giftsSec(){
  var list=giftsSorted().filter(function(g){return src(g.image);});
  var head='<div class="wrap"><div class="sec-head"><div><h2>Gifts &amp; Art</h2><p>받은 축전과 선물. 마음을 보내주신 분들께 고마워요.</p></div>'+
    (S.gifts.length?'<a href="#all-gifts" class="pill"><span class="l">전체 보기</span><span class="a">'+ARROW+'</span></a>':"")+'</div></div>';
  if(!list.length)return '<section class="sec" id="gifts">'+head+'<div class="wrap"><div class="mason">'+giftsGrid()+'</div></div></section>';
  var base=list.slice();while(base.length<8)base=base.concat(list);
  function item(g,dup){
    var im=src(g.image);
    return '<a class="mq-item" href="#g-'+esc(g.id)+'"'+(dup?' tabindex="-1" aria-hidden="true"':"")+'><img src="'+esc(im)+'" alt="'+esc(g.title||g.kind)+'" loading="lazy">'+
      '<span class="mq-cap"><span class="tag '+(g.kind==="축전"?"w":"g")+'">'+esc(g.kind)+'</span>'+(g.from?'<span>from '+esc(g.from)+'</span>':"")+'</span></a>';
  }
  var half=base.map(function(g,i){return item(g,i>=list.length);}).join("");
  var dup=base.map(function(g){return item(g,true);}).join("");
  return '<section class="sec" id="gifts">'+head+'<div class="mq" aria-label="받은 축전과 선물"><div class="mq-track" style="--dur:'+(base.length*6)+'s">'+half+dup+'</div></div></section>';
}
function allGifts(){
  return subHeader()+'<main class="wrap detail"><a class="back" href="#gifts">← 메인으로</a><div class="sec-head" style="margin-top:24px"><div><h2>Gifts &amp; Art</h2><p>받은 축전과 선물</p></div>'+
    '<div class="chips" role="group" aria-label="축전 · 선물 분류">'+giftChips()+'</div></div><div class="mason" id="mason">'+giftsGrid()+'</div></main>'+footer();
}
function platforms(){return (S.site.platforms||[]).filter(function(l){return l&&l.label&&safeUrl(l.url);});}
function hasLinks(){return platforms().length>0||!!safeUrl(S.site.pushoong);}
function linksSec(){
  if(!hasLinks())return"";
  var pl=platforms(),pu=safeUrl(S.site.pushoong);
  return '<section class="sec" id="links"><div class="wrap"><div class="sec-head"><div><h2>Links</h2><p>캐릭터를 만날 수 있는 곳, 그리고 하고 싶은 말을 남기는 곳.</p></div></div>'+
    '<div class="lk-grid">'+
    (pu?'<a class="lk lk-ask iri" href="'+esc(pu)+'" target="_blank" rel="noopener"><span class="lk-k">ANONYMOUS · 푸슝</span><span class="lk-t">익명으로 말 걸기 ↗</span><span class="lk-d">궁금한 것, 하고 싶은 말을 익명으로 남겨주세요.</span></a>':"")+
    pl.map(function(l,i){return '<a class="lk" href="'+esc(safeUrl(l.url))+'" target="_blank" rel="noopener"><span class="num">'+pad(i+1)+'</span><span class="lk-t">'+esc(l.label)+' ↗</span>'+(l.note?'<span class="lk-d">'+esc(l.note)+'</span>':"")+'</a>';}).join("")+
    '</div></div></section>';
}
function charLinks(c){
  var ls=(c.links||[]).filter(function(l){return l&&safeUrl(l.url);});
  if(!ls.length&&safeUrl(c.link))ls=[{label:"",url:c.link}];
  if(!ls.length)return"";
  return '<div class="c-links">'+ls.map(function(l){return '<a class="pill" href="'+esc(safeUrl(l.url))+'" target="_blank" rel="noopener"><span class="l">'+(l.label?esc(l.label)+'에서 만나기':"캐릭터 만나러 가기")+' ↗</span></a>';}).join("")+'</div>';
}
function outro(){
  return '<section class="sec wrap outro"><h2><span>No way</span><span>out.</span></h2>'+(S.site.outro?'<p>'+esc(S.site.outro)+'</p>':"")+
    '<a href="#characters" class="pill"><span class="l">들어가기</span><span class="a">'+ARROW+'</span></a></section>';
}
function footer(){return '<footer class="wrap"><div class="foot"><span>© '+esc(S.site.name.toLowerCase())+'.</span><span>No shallow ones, no way out.'+(isAdult()?' · <button type="button" class="unadult" data-act="unadult">성인 인증 해제</button>':"")+'</span></div></footer>';}
function subHeader(){return '<div style="position:relative">'+header()+'</div>';}
function adminRow(type,id,extra){
  if(!canWrite)return"";
  return '<div class="admin-row">'+(extra||"")+'<button class="abtn" data-act="edit" data-t="'+type+'" data-id="'+esc(id)+'">수정</button><button class="abtn danger" data-act="del" data-t="'+type+'" data-id="'+esc(id)+'">삭제</button><span class="status" id="row-status"></span></div>';
}
var adultMem=false;
function isAdult(){try{var v=localStorage.getItem("hm-adult");if(v&&Date.now()-(+v)<30*864e5)return true;}catch(e){}return adultMem;}
function setAdult(on){adultMem=on;try{if(on)localStorage.setItem("hm-adult",String(Date.now()));else localStorage.removeItem("hm-adult");}catch(e){}}
function isMinor(){try{return sessionStorage.getItem("hm-minor")==="1";}catch(e){return false;}}
function gateBox(msg){
  if(isMinor())return '<div class="gate"><span class="b19">19</span><h2>볼 수 없는 내용이에요</h2><p>만 19세 미만은 이 내용을 볼 수 없어요.</p><a class="back" href="#characters">← 다른 캐릭터 보기</a></div>';
  return '<form class="gate" data-gate novalidate><span class="b19">19</span><h2>성인 인증</h2><p>'+msg+'</p>'+
    '<div class="f"><label for="g-year">출생 연도</label><input type="text" id="g-year" inputmode="numeric" maxlength="4" placeholder="예: 1998" autocomplete="bday-year"></div>'+
    '<label class="chk"><input type="checkbox" id="g-agree"> 만 19세 이상이며, 성인 내용 열람에 동의해요.</label>'+
    '<div class="p-actions"><span class="status" id="g-status"></span><button type="submit" class="btn-w">확인</button></div>'+
    '<p style="font-size:12px;color:var(--dim)">확인하면 이 브라우저에서 30일 동안 다시 묻지 않아요.</p></form>';
}
document.addEventListener("submit",function(e){
  var f=e.target;if(!f.hasAttribute||!f.hasAttribute("data-gate"))return;
  e.preventDefault();
  var st=document.getElementById("g-status"),y=+document.getElementById("g-year").value.trim(),now=new Date().getFullYear();
  if(!y||y<1900||y>now){setStatus(st,"출생 연도를 네 자리로 적어주세요.",true);return;}
  if(!document.getElementById("g-agree").checked){setStatus(st,"열람 동의에 체크해 주세요.",true);return;}
  if(now-y<19){try{sessionStorage.setItem("hm-minor","1");}catch(x){}lastMode=null;route();return;}
  setAdult(true);var sy=window.scrollY;lastMode=null;route();window.scrollTo(0,sy);
});
function charView(c){
  var i=S.chars.indexOf(c),n=S.chars.length,im=src(c.cover);
  var prev=S.chars[(i-1+n)%n],next=S.chars[(i+1)%n],ok=isAdult(),locked=c.adult&&!ok;
  var move=canWrite&&n>1?'<button class="abtn" data-act="move" data-d="-1" data-id="'+esc(c.id)+'">← 앞으로</button><button class="abtn" data-act="move" data-d="1" data-id="'+esc(c.id)+'">뒤로 →</button>':"";
  return subHeader()+'<main class="wrap detail"><a class="back" href="#characters">← Characters</a><div class="d-grid">'+
    '<div class="d-media iri'+(locked?" lock":"")+'">'+(im?'<img src="'+esc(im)+'" alt="'+esc(c.name)+'">':'<div class="ph" aria-hidden="true">'+esc((c.name||"?").charAt(0))+'</div>')+'</div>'+
    '<div class="d-body"><span class="d-meta"><span class="num">'+pad(i+1)+'</span>CHARACTER '+pad(i+1)+' / '+pad(n)+'</span><h1>'+esc(c.name)+'</h1>'+(c.role?'<p class="sub">'+esc(c.role)+'</p>':"")+
    ((c.tags||[]).length?'<div class="chips">'+c.tags.map(function(t){return'<span class="tag g">#'+esc(t)+'</span>';}).join("")+'</div>':"")+
    (locked?gateBox("이 캐릭터는 성인 설정과 서사가 중심이라 만 19세 이상만 볼 수 있어요."):
    (c.body?'<div class="prose">'+prose(c.body)+'</div>':"")+
    '<a class="pill more" href="#cd-'+esc(c.id)+'"><span class="l">캐릭터 상세 보러가기</span><span class="a">'+ARROW+'</span></a>'+
    (c.adultBody?(ok?'<section class="adult-sec"><h2><span class="b19" style="position:static;width:28px;height:28px;font-size:11px">19</span>성인 설정 · 서사</h2><div class="prose">'+prose(c.adultBody)+'</div></section>':gateBox("아래에 성인 설정과 서사가 있어요. 만 19세 이상만 볼 수 있어요.")):"")+
    charLinks(c))+
    (n>1?'<div class="d-nav"><a class="abtn" style="display:inline-flex;align-items:center;text-decoration:none" href="#c-'+esc(prev.id)+'">← '+esc(prev.name)+'</a><a class="abtn" style="display:inline-flex;align-items:center;text-decoration:none" href="#c-'+esc(next.id)+'">'+esc(next.name)+' →</a></div>':"")+
    adminRow("char",c.id,move)+'</div></div></main>'+footer();
}
function soon(t){return '<div class="soon"><span class="soon-dot" aria-hidden="true"></span>'+(t||"준비 중이에요")+'</div>';}
function block(no,title,inner){return '<section class="cd-sec"><div class="cd-h"><span class="num">'+no+'</span><h2>'+title+'</h2></div>'+inner+'</section>';}
function mediaTag(v,alt){
  var u=src(v);if(!u)return"";
  if(/\.(mp4|webm|mov)(\?|#|$)/i.test(u))return '<video src="'+esc(u)+'" autoplay muted loop playsinline aria-label="'+esc(alt)+'"></video>';
  return '<img src="'+esc(u)+'" alt="'+esc(alt)+'">';
}
function charDetail(c){
  var i=S.chars.indexOf(c),locked=c.adult&&!isAdult();
  var head='<a class="back" href="#c-'+esc(c.id)+'">← '+esc(c.name)+'</a>';
  if(locked)return subHeader()+'<main class="wrap detail">'+head+'<div style="margin-top:28px">'+gateBox("이 캐릭터의 상세 설정은 만 19세 이상만 볼 수 있어요.")+'</div></main>'+footer();
  var media=mediaTag(c.media||c.cover,c.name);
  var prof=(c.profile||[]).filter(function(r){return r&&r.k;});
  var top='<div class="cd-top"><div class="cd-media iri">'+(media||'<div class="ph" aria-hidden="true">'+esc((c.name||"?").charAt(0))+'</div>')+'</div>'+
    '<div class="cd-prof"><span class="d-meta"><span class="num">'+pad(i+1)+'</span>CHARACTER FILE</span><h1>'+esc(c.name)+'</h1>'+(c.role?'<p class="sub">'+esc(c.role)+'</p>':"")+
    (prof.length?'<dl class="ptable">'+prof.map(function(r){return'<div><dt>'+esc(r.k)+'</dt><dd>'+esc(r.v||"—")+'</dd></div>';}).join("")+'</dl>':soon("프로필 준비 중이에요"))+
    ((c.tags||[]).length?'<div class="chips">'+c.tags.map(function(t){return'<span class="tag g">#'+esc(t)+'</span>';}).join("")+'</div>':"")+'</div></div>';
  var intros=(c.intros||[]).filter(function(x){return x&&(x.title||x.body);});
  var introHtml=intros.length?'<div class="intros">'+intros.map(function(x,k){
      return '<button type="button" class="intro-card" data-act="intro" data-c="'+esc(c.id)+'" data-k="'+k+'"><span class="intro-no">도입부 '+(k+1)+'</span><span class="intro-t">'+esc(x.title||("도입부 "+(k+1)))+'</span>'+(x.hook?'<span class="intro-h">'+esc(x.hook)+'</span>':"")+'<span class="intro-go">읽어보기 →</span></button>';
    }).join("")+'</div>':soon("도입부는 준비 중이에요");
  var lore=(c.lore||[]).filter(function(x){return x&&x.title;});
  var loreHtml='<div class="lore">'+lore.map(function(x){return '<article class="lore-card"><h3>'+esc(x.title)+'</h3><div class="prose">'+prose(x.body)+'</div></article>';}).join("")+'</div>';
  var bc=(c.bcuts||[]).filter(function(b){return src(typeof b==="string"?b:b&&b.image);});
  var gallery=bc.length?'<div class="bcuts">'+bc.map(function(b,k){var u=typeof b==="string"?b:b.image,cap=typeof b==="string"?"":(b.caption||"");
      return '<button type="button" class="bc" data-act="lb" data-c="'+esc(c.id)+'" data-k="'+k+'" aria-label="B컷 '+(k+1)+' 크게 보기">'+(/\.(mp4|webm|mov)/i.test(u)?'<video src="'+esc(src(u))+'" muted loop autoplay playsinline></video>':'<img src="'+esc(src(u))+'" alt="" loading="lazy">')+(cap?'<span class="bc-cap">'+esc(cap)+'</span>':"")+'</button>';}).join("")+'</div>':soon();
  var sec=Array.isArray(c.secret)?c.secret.filter(function(x){return x&&(x.title||x.body);}):(c.secret?[{title:"",body:c.secret}]:[]);
  var secret=sec.length?'<p class="spoil-warn">⚠ 스포일러예요. 플레이 후 보는 걸 추천해요.</p><div class="spoils">'+sec.map(function(x){return '<details class="spoil"><summary><span class="spoil-n">'+esc(x.title||"비설")+'</span><span class="spoil-t">펼쳐 보기</span></summary><div class="prose">'+prose(x.body)+'</div></details>';}).join("")+'</div>':soon();
  var tips=(c.tips||[]).filter(Boolean);
  var tipHtml=tips.length?'<ol class="tips">'+tips.map(function(t){return'<li>'+esc(t)+'</li>';}).join("")+'</ol>':soon();
  var mates=c.world?S.chars.filter(function(x){return x!==c&&x.world===c.world;}):[];
  var mateHtml=mates.length?'<div class="mates">'+mates.map(function(x){var im=src(x.cover),lk=x.adult&&!isAdult();
      return '<a class="mate'+(lk?" lock":"")+'" href="#c-'+esc(x.id)+'">'+(im?'<img src="'+esc(im)+'" alt="" loading="lazy">':'<span class="ph">'+esc((x.name||"?").charAt(0))+'</span>')+'<span class="mate-n">'+esc(x.name)+'</span></a>';}).join("")+'</div>':soon("같은 세계관 캐릭터는 준비 중이에요");
  return subHeader()+'<main class="wrap detail">'+head+top+
    (function(){var parts=[["도입부",introHtml]];if(lore.length)parts.push(["세계관",loreHtml]);parts.push(["B컷",gallery],["비설",secret],["플레이 팁",tipHtml],["같은 세계관"+(c.world?' <small>'+esc(c.world)+'</small>':""),mateHtml]);
      return parts.map(function(pt,k){return block(pad(k+1),pt[0],pt[1]);}).join("");})()+
    '<div class="cd-end">'+charLinks(c)+'<a class="abtn" style="display:inline-flex;align-items:center;text-decoration:none" href="#c-'+esc(c.id)+'">← 소개로 돌아가기</a></div>'+
    '</main>'+footer();
}
function openIntro(c,k){
  var list=(c.intros||[]).filter(function(x){return x&&(x.title||x.body);});var x=list[k];if(!x)return;
  var last=document.activeElement,link=safeUrl(x.link);
  var ov=document.createElement("div");ov.className="reader";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label",x.title||"도입부");
  ov.innerHTML='<article class="reader-in"><button type="button" class="reader-x" aria-label="닫기">✕</button><span class="intro-no">'+esc(c.name)+' · 도입부 '+(k+1)+'</span><h2>'+esc(x.title||("도입부 "+(k+1)))+'</h2><div class="prose">'+prose(x.body)+'</div>'+
    (link?'<a class="pill" href="'+esc(link)+'" target="_blank" rel="noopener"><span class="l">이 도입부로 시작하기 ↗</span></a>':"")+'</article>';
  function close(){ov.remove();document.removeEventListener("keydown",key);document.body.style.overflow="";if(last&&last.focus)last.focus();}
  function key(e){if(e.key==="Escape")close();}
  ov.addEventListener("click",function(e){if(e.target===ov||e.target.closest(".reader-x"))close();});
  document.addEventListener("keydown",key);document.body.appendChild(ov);document.body.style.overflow="hidden";ov.querySelector(".reader-x").focus();
}
function openLightbox(c,k){
  var list=(c.bcuts||[]).filter(function(b){return src(typeof b==="string"?b:b&&b.image);}).map(function(b){return typeof b==="string"?{image:b,caption:""}:b;});
  if(!list.length)return;
  var cur=k,last=document.activeElement;
  var ov=document.createElement("div");ov.className="lb";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","B컷 보기");
  function draw(){var it=list[cur],u=src(it.image);
    ov.innerHTML='<button type="button" class="lb-x" aria-label="닫기">✕</button>'+(list.length>1?'<button type="button" class="lb-p" aria-label="이전">←</button><button type="button" class="lb-n" aria-label="다음">→</button>':"")+
      '<figure>'+(/\.(mp4|webm|mov)/i.test(u)?'<video src="'+esc(u)+'" autoplay loop muted playsinline controls></video>':'<img src="'+esc(u)+'" alt="">')+'<figcaption>'+(it.caption?esc(it.caption)+' · ':"")+(cur+1)+' / '+list.length+'</figcaption></figure>';
    ov.querySelector(".lb-x").focus();}
  function close(){ov.remove();document.removeEventListener("keydown",key);if(last&&last.focus)last.focus();}
  function go(d){cur=(cur+d+list.length)%list.length;draw();}
  function key(e){if(e.key==="Escape")close();else if(e.key==="ArrowRight")go(1);else if(e.key==="ArrowLeft")go(-1);}
  ov.addEventListener("click",function(e){var t=e.target;if(t===ov||t.closest(".lb-x"))close();else if(t.closest(".lb-n"))go(1);else if(t.closest(".lb-p"))go(-1);});
  document.addEventListener("keydown",key);document.body.appendChild(ov);draw();
}
function postView(p){
  var im=src(p.cover),link=safeUrl(p.link);
  return subHeader()+'<main class="wrap detail"><article class="post"><a class="back" href="#news">← Notice &amp; News</a>'+
    '<div class="d-meta" style="margin-top:20px">'+(p.pinned?'<span class="tag w">PINNED</span>':"")+(KIND[p.kind]||"NOTICE")+' · '+esc(fmt(p.date))+'</div>'+
    '<h1>'+esc(p.title)+'</h1>'+(im?'<figure><img src="'+esc(im)+'" alt=""></figure>':"")+'<div class="prose">'+prose(p.body)+'</div>'+
    (link?'<a class="pill" href="'+esc(link)+'" target="_blank" rel="noopener"><span class="l">링크 열기 ↗</span><span class="a">'+ARROW+'</span></a>':"")+
    adminRow("post",p.id)+'</article></main>'+footer();
}
function giftView(g){
  var im=src(g.image);
  return subHeader()+'<main class="wrap detail"><a class="back" href="#gifts">← Gifts &amp; Art</a><div class="d-grid">'+
    '<div class="d-media" style="max-width:680px;flex-basis:480px">'+(im?'<img src="'+esc(im)+'" alt="'+esc(g.title||g.kind)+'">':'<div class="ph" aria-hidden="true">♡</div>')+'</div>'+
    '<div class="d-body"><span class="d-meta"><span class="tag '+(g.kind==="축전"?"w":"g")+'">'+esc(g.kind)+'</span>'+esc(fmt(g.date))+'</span>'+
    '<h1 style="font-size:clamp(36px,4.6vw,64px)">'+esc(g.title||g.kind)+'</h1>'+(g.from?'<p class="sub">from '+esc(g.from)+'</p>':"")+
    (g.note?'<div class="prose">'+prose(g.note)+'</div>':"")+adminRow("gift",g.id)+'</div></div></main>'+footer();
}
function allNews(){
  var list=postsSorted();
  return subHeader()+'<main class="wrap detail"><div class="post"><a class="back" href="#news">← 메인으로</a><h1>Notice &amp; News</h1>'+
    (list.length?'<ul class="list">'+list.map(function(p){return'<li><a href="#p-'+esc(p.id)+'"><time datetime="'+esc(p.date)+'">'+esc(fmt(p.date))+'</time><h3>'+esc(p.title)+'</h3><span class="kind">'+(p.pinned?"PINNED":(KIND[p.kind]||"NOTICE"))+'</span></a></li>';}).join("")+'</ul>':'<div class="empty-g" style="margin-top:32px">아직 올라온 소식이 없어요.</div>')+
    '</div></main>'+footer();
}
function dock(){
  if(!canWrite)return"";
  return '<div class="dock" role="toolbar" aria-label="관리"><button data-act="new" data-t="char">+ 캐릭터</button><button data-act="new" data-t="post">+ 공지·소식</button><button data-act="new" data-t="gift">+ 축전·선물</button><button class="lead" data-act="hero">첫 화면</button></div>';
}

var lastMode=null;
function route(){
  if(!S)return;
  var h=decodeURIComponent((location.hash||"").slice(1)),html,mode="home",anchor=null;
  var m=/^(c|p|g)-(.+)$/.exec(h),cd=/^cd-(.+)$/.exec(h);
  if(cd){var cc=find(S.chars,cd[1]);if(cc){mode=h;html=charDetail(cc);}}
  else if(m){
    var item=m[1]==="c"?find(S.chars,m[2]):m[1]==="p"?find(S.posts,m[2]):find(S.gifts,m[2]);
    if(item){mode=h;html=m[1]==="c"?charView(item):m[1]==="p"?postView(item):giftView(item);}
  }else if(h==="all-news"){mode=h;html=allNews();}
  else if(h==="all-gifts"){mode=h;html=allGifts();}
  if(mode==="home"){anchor=h||null;if(lastMode!=="home"){html=hero()+charsSec()+newsSec()+giftsSec()+linksSec()+outro()+footer();}}
  if(html!=null){app.innerHTML=html+dock();if(mode==="home")bindCarousel();}
  if(mode!=="home"){window.scrollTo(0,0);}
  else if(lastMode!=="home"&&anchor){var el=document.getElementById(anchor);if(el)el.scrollIntoView();}
  lastMode=mode;
  if(mode.indexOf("c-")===0){var ci=S.chars.indexOf(find(S.chars,mode.slice(2)));if(ci>=0)active=ci;}
}
function rerenderHome(){lastMode=null;route();}
window.addEventListener("hashchange",route);

/* ---------- carousel ---------- */
function setActive(i){
  var n=S.chars.length;if(!n)return;
  active=(i+n)%n;
  var track=document.getElementById("track");if(!track)return;
  track.style.transform="translateX(calc(-1 * ("+active+" * (var(--cw) + var(--gap)) + var(--cw) / 2)))";
  var cards=track.children;for(var k=0;k<cards.length;k++){cards[k].classList.toggle("on",k===active);cards[k].setAttribute("tabindex",k===active?"0":"-1");}
  var cnt=document.getElementById("car-count");if(cnt)cnt.innerHTML=pad(active+1)+"<small> / "+pad(n)+"</small>";
}
function bindCarousel(){
  var car=document.getElementById("car");if(!car)return;
  setActive(active);
  car.addEventListener("click",function(e){
    var a=e.target.closest(".cc");if(!a)return;
    var i=+a.dataset.i;if(i!==active){e.preventDefault();setActive(i);}
  });
  var sx=null,sy=null;
  car.addEventListener("pointerdown",function(e){sx=e.clientX;sy=e.clientY;});
  car.addEventListener("pointerup",function(e){
    if(sx==null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){setActive(active+(dx<0?1:-1));car.dataset.swiped="1";setTimeout(function(){car.dataset.swiped="";},0);}
  });
  car.addEventListener("click",function(e){if(car.dataset.swiped==="1"){e.preventDefault();e.stopPropagation();}},true);
  car.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){setActive(active+1);e.preventDefault();var t=document.getElementById("track");t&&t.children[active]&&t.children[active].focus();}else if(e.key==="ArrowLeft"){setActive(active-1);e.preventDefault();var t2=document.getElementById("track");t2&&t2.children[active]&&t2.children[active].focus();}});
}

/* ---------- actions ---------- */
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-act]");if(!b||!app.contains(b))return;
  var act=b.dataset.act;
  if(act==="intro"){var ic=find(S.chars,b.dataset.c);if(ic)openIntro(ic,+b.dataset.k);return;}
  if(act==="lb"){var lc=find(S.chars,b.dataset.c);if(lc)openLightbox(lc,+b.dataset.k);return;}
  if(act==="unadult"){setAdult(false);var sy=window.scrollY;lastMode=null;route();window.scrollTo(0,sy);return;}
  if(act==="prev"){setActive(active-1);return;}
  if(act==="next"){setActive(active+1);return;}
  if(act==="gf"){giftFilter=b.dataset.v;document.querySelectorAll('[data-act="gf"]').forEach(function(x){x.setAttribute("aria-pressed",String(x.dataset.v===giftFilter));});var m=document.getElementById("mason");if(m)m.innerHTML=giftsGrid();return;}
});

fetch("data.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(d){
  S=d||{};S.site=S.site||{};S.site.name=S.site.name||"Hmulleong";S.chars=S.chars||[];S.posts=S.posts||[];S.gifts=S.gifts||[];
  route();
}).catch(function(){app.innerHTML='<div class="wrap" style="padding-block:120px;color:#BDBDBD">data.json을 불러오지 못했어요. 파일 이름과 쉼표·따옴표를 확인해 주세요.</div>';});
})();
