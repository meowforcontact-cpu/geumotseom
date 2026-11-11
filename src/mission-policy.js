// Mission policies recovered from the latest project decision record.
// Client selection is local until the existing Discord MissionStore bridge is connected.
const MISSION_CHOICES=[
 {id:'chat',name:'인정 채팅',detail:'서버의 인정된 채팅 활동'},
 {id:'voice',name:'음성 채널',detail:'음성 참여 활동'},
 {id:'attendance',name:'출석',detail:'출석 활동'},
 {id:'stream',name:'오버워치 방송',detail:'방송 활동'},
 {id:'party',name:'확정 파티',detail:'확정된 파티 참여'},
 {id:'partners',name:'동행자',detail:'서로 다른 동행자와 활동'},
 {id:'mixed',name:'혼합 활동',detail:'여러 서버 활동 조합'}
];
const ECONOMY_ARCHIVE={
 daily:[['놀이 3회',1000],['밥 3회',1000],['인정 채팅 20회',1000],['음성 30분',2000],['확정 파티 1회',3000],['3개 완료 추가',1000]],
 weekly:[['채팅 100회',10000],['음성 3시간',15000],['확정 파티 3회',15000],['놀이 15회',5000],['밥 15회',5000],['3개 완료 추가',5000]],
 season:[['일일 3개 완료 누적 30일',100000],['채팅 1,000회',80000],['음성 40시간',120000],['확정 파티 20회',150000],['서로 다른 동행자 15명',100000]]
};
function missionWeekStart(){
 const date=day(),d=new Date(date+'T00:00:00Z'),weekday=(d.getUTCDay()+6)%7;
 d.setUTCDate(d.getUTCDate()-weekday);
 return d.toISOString().slice(0,10);
}
function missionPlan(period){
 if(!state.missionPlans)state.missionPlans={};
 const name=period==='weekly'?'weekly':'daily',stamp=name==='weekly'?missionWeekStart():day();
 const plan=state.missionPlans[name];
 if(!plan||plan.period!==stamp)state.missionPlans[name]={period:stamp,choices:[]};
 return state.missionPlans[name];
}
function missionPick(period,id){
 if(!MISSION_CHOICES.some(m=>m.id===id))return;
 const plan=missionPlan(period),index=plan.choices.indexOf(id);
 if(index>=0)plan.choices.splice(index,1);
 else if(plan.choices.length>=3)return say('미션은 3개까지만 선택할 수 있어요.');
 else plan.choices.push(id);
 persist();render();
}
function missionArchiveView(){
 return '<div class="mission-economy-note">2026-11-06 승인 경제안 · 최신 일일/주간 7개 선택과 목표·보상은 아직 통합되지 않았습니다. 이 금액으로 자동 지급하지 않습니다.</div>'
  +Object.entries(ECONOMY_ARCHIVE).map(([period,rows])=>'<div class="mission-economy-list"><strong>'+({daily:'일일',weekly:'주간',season:'시즌'}[period])+'</strong>'+rows.map(([name,n])=>'<div>'+name+' <span>'+fmt(n)+' 냐냐냥 / '+fmt(n)+' XP</span></div>').join('')+'</div>').join('');
}
function missionNotebookView(s){
 if(s.notebookTab==='history')return notebookHistoryView(s);
 const tab=['daily','weekly','season','economy'].includes(s.missionTab)?s.missionTab:'daily';
 const tabs=[['daily','일일'],['weekly','주간'],['season','시즌'],['economy','보상안']];
 let panel='';
 if(tab==='economy')panel=missionArchiveView();
 else if(tab==='season')panel='<div class="mission-note">시즌 미션</div><div class="mission-line">첫 출격 <span>목표 확인 중</span></div><div class="mission-note">천사냥: 일일 미션 3개 완수 누적 15일 보상 · 연속일 조건 없음. 운영 지급은 미연동입니다.</div>';
 else{
  const plan=missionPlan(tab),count=plan.choices.length;
  panel='<div class="mission-summary">선택 '+count+'/3 · '+(tab==='daily'?'매일 0시(KST) 갱신':'매주 월요일 갱신')+'</div>'
   +'<div class="mission-choice-scroll">'+MISSION_CHOICES.map(m=>{
    const checked=plan.choices.includes(m.id);
    return '<button type="button" class="mission-choice'+(checked?' picked':'')+'" data-mission-pick="'+m.id+'" data-mission-period="'+tab+'" aria-pressed="'+checked+'" aria-label="'+m.name+(checked?' 선택됨':' 선택하기')+'"><span class="mission-check">'+(checked?'✓':'□')+'</span><span>'+m.name+'</span><span class="mission-hint">'+(checked?'선택됨':'선택')+'</span></button>';
   }).join('')+'</div>'
   +'<div class="mission-note">선택은 이 기기에 저장됩니다. Discord 인정 활동 집계 및 실제 지급은 서버 연결이 확인될 때까지 표시하지 않습니다.</div>';
 }
 return '<section class="mission-config" aria-label="그못섬 미션"><nav class="mission-period-tabs">'+tabs.map(([key,label])=>'<button type="button" data-mission-tab="'+key+'" aria-pressed="'+(key===tab)+'">'+label+'</button>').join('')+'</nav><div class="mission-content">'+panel+'</div></section>';
}
dailyNotebookView=missionNotebookView;
SCR.daily={title:'미션',pages:()=>1,view:missionNotebookView,ok:()=>{}};
document.addEventListener('click',e=>{
 if(scr().id!=='daily'||e.defaultPrevented)return;
 const tab=e.target.closest?.('[data-mission-tab]');
 if(tab){e.preventDefault();e.stopImmediatePropagation();scr().missionTab=tab.dataset.missionTab;render();return;}
 const choice=e.target.closest?.('[data-mission-pick]');
 if(choice){e.preventDefault();e.stopImmediatePropagation();missionPick(choice.dataset.missionPeriod,choice.dataset.missionPick);}
},true);
