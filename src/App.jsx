import { useState, useEffect, useRef } from "react";

var DEFAULT_PILLARS = ["Faith / Spirit","Financial","Health","Relationships","Family","Purpose / Career","Personal Growth"];
var PRIORITY_XP = { S: 100, A: 60, B: 30, C: 10 };
var PRIORITY_COLORS = { S: "#ff003c", A: "#ff6b00", B: "#00e5ff", C: "#555" };
var CATEGORIES = ["Money","Health","Relationships","Spirit","Career","Growth","Family"];
var NEON_PALETTE = ["#00e5ff","#ff003c","#39ff14","#ff6b00","#bf00ff","#ffea00","#ff0099","#00ff88"];
var HOURS = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
var DAYNAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
var MNAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var FOREX_PAIRS = ["EUR/USD","GBP/USD","USD/JPY","GBP/JPY","EUR/JPY","AUD/USD","USD/CHF","NZD/USD","USD/CAD","EUR/GBP","EUR/AUD","GBP/AUD","AUD/JPY","CAD/JPY","CHF/JPY","NZD/JPY","GBP/NZD","EUR/NZD","XAU/USD","XAG/USD","NAS100","NQ1/MNQ","US30/YM","S&P500/ES","DE40/DAX","USTEC","BTC/USD","ETH/USD","US OIL/WTI","UK OIL/BRENT"];
var TRADE_SETUPS = ["Breakout","Retracement","Trend Continuation","Reversal","Range Play","News/Fundamental","Liquidity Grab","Order Block","Fair Value Gap","Supply/Demand","Other"];
var TIMEFRAMES = ["M1","M5","M15","M30","H1","H4","D1","W1"];
var QUOTES = ["You don't chase reality. You command it.","Discipline is the shortcut manifestation responds to.","God rewards structure.","You either drift or you design.","Momentum compounds.","Move like the future already agreed with you.","Your identity is your algorithm. Upgrade it.","Silence is where power reloads.","Operator mode activated. Distractions denied.","Faith without structure is just a wish.","The version of you that wins already exists. Sync up.","Cold discipline. Warm results.","Your rituals are your runway.","Stop reacting. Start architecting.","Every day you delay the old version gets comfortable.","You are the mission. Everything else is a tool.","Wealth whispers to the disciplined.","Energy is currency. Spend it like a CEO.","Alignment over hustle. Always.","The grind is not the goal. The system is.","Power moves only. Everything else is noise.","Your morning sets the algorithm for your day.","Comfort is the enemy of momentum.","Manifestation respects precision.","Design your days or someone else will.","The operator does not hope. The operator executes.","Spiritual alignment is a competitive advantage.","Level up in silence. Let results make the noise.","Your future self is watching. Make them proud.","Clarity is the ultimate power move.","You do not need motivation. You need a mission.","The body follows the mind. Train both.","Generational wealth starts with daily discipline.","Control your inputs. The outputs handle themselves.","Rest is a weapon. Use it strategically.","Gratitude multiplies what you already have.","Success is a byproduct of identity alignment.","Stop asking permission to be great.","Execute with silence. Celebrate with results.","S-tier focus creates S-tier outcomes.","Reality bends for the relentless.","Faith is the operating system. Discipline is the code.","A focused hour outperforms a scattered day.","The strongest flex is consistency.","Build in silence. Ship in confidence.","Money follows mastery. Master something daily.","Emotion is data. Not direction.","Legacy is built in the hours no one sees.","Invest in systems not shortcuts.","You are the asset. Appreciate accordingly.","Mental clarity is a non-negotiable.","Small daily upgrades create massive yearly transformations.","Speak your future into the present tense.","Chase alignment not applause.","Stack your wins. Ignore the scoreboard.","Your habits are casting votes for who you become.","Every choice is a brick. Build something.","The future favors the focused.","Surrender the timeline. Trust the system.","Wealth is a spiritual decision backed by daily action.","Your weakest pillar is your biggest opportunity.","Pressure creates diamonds and operators.","The mission is non-negotiable. The method is flexible.","Execute with intention. Rest with purpose.","Winning is a habit. So is losing. Choose.","Strategy without execution is just entertainment.","Command your morning. Conquer your day.","Bet on yourself. The odds always improve.","Consistency is the bridge between goals and results.","The mission is 90 days. The identity is forever.","Daily deposits. Lifetime dividends.","Stack habits. Stack wins. Stack generations.","You are the product. Ship version 2.0.","The blueprint works when the builder shows up.","Manifest through mechanics not magic.","Train your mind harder than you train your body.","Be so disciplined it looks like luck.","Move with purpose.","Your legacy is being written right now.","Burn slow. Build fast. Stay dangerous.","When in doubt execute the next power move.","Momentum is a muscle. Train it daily.","Reality shifts for those who refuse to settle.","Boot sequence complete. Time to build.","Structure is freedom in disguise.","No one is coming to save you. That is your superpower.","Receipts over rhetoric. Always.","What you tolerate you encourage.","Proximity is power. Guard your circle.","Your standards determine your reality.","Operate in silence. Let your results introduce you."];

// --- STORAGE ---
var SP = "auraszn_";
async function sGet(k) { try { var r = await window.storage.get(SP+k); return r && r.value ? JSON.parse(r.value) : null; } catch(e) { return null; } }
async function sSet(k, v) { try { await window.storage.set(SP+k, JSON.stringify(v)); } catch(e) {} }
async function sClear() { try { var keys = await window.storage.list(SP); if(keys && keys.keys) { for(var i=0;i<keys.keys.length;i++) { await window.storage.delete(keys.keys[i]); } } } catch(e) {} }

// --- DATE ---
function ds(d) { if(typeof d==="string") return d; try { return d.toISOString().split("T")[0]; } catch(e) { return new Date().toISOString().split("T")[0]; } }
function todayStr() { return ds(new Date()); }
function isValidDate(s) { if(typeof s !== "string" || s.length !== 10) return false; var d = new Date(s+"T12:00:00"); return !isNaN(d.getTime()); }
function daysBtwn(a,b) { try { var da=new Date(a+"T12:00:00"); var db=new Date(b+"T12:00:00"); if(isNaN(da.getTime())||isNaN(db.getTime())) return 0; return Math.floor((db-da)/86400000); } catch(e) { return 0; } }
function addD(d,n) { try { var dt=new Date(d+"T12:00:00"); if(isNaN(dt.getTime())) return todayStr(); dt.setDate(dt.getDate()+n); return ds(dt); } catch(e) { return todayStr(); } }
function getDOW(d) { try { var dt=new Date(d+"T12:00:00"); return isNaN(dt.getTime()) ? 0 : dt.getDay(); } catch(e) { return 0; } }
function getWeekStart(d) { return addD(d, -getDOW(d)); }
function fmtHour(h) { if(h===12) return "12pm"; if(h>12) return (h-12)+"pm"; return h+"am"; }
function fmtDate(d) { try { var dt=new Date(d+"T12:00:00"); if(isNaN(dt.getTime())) return d; return MNAMES[dt.getMonth()]+" "+dt.getDate(); } catch(e) { return d; } }
function fmtDateFull(d) { try { var dt=new Date(d+"T12:00:00"); if(isNaN(dt.getTime())) return d; return DAYNAMES[dt.getDay()]+", "+MNAMES[dt.getMonth()]+" "+dt.getDate(); } catch(e) { return d; } }
function uid() { return Math.random().toString(36).slice(2,10)+Date.now().toString(36); }

// --- FACTORIES ---
function newMission() { var s=todayStr(); return {id:uid(),start:s,end:addD(s,89),identity:"",targets:{financial:"",health:"",relationship:"",spiritual:"",professional:""},rules:["Show up every day.","No zero days.","Trust the process."]}; }
function newDay(date,mid) { var hm={}; HOURS.forEach(function(h){hm[h]={task:"",done:false};}); var am={}; DEFAULT_PILLARS.forEach(function(p){am[p]=0;}); return {date:date,mid:mid,intention:"",power_moves:[{id:uid(),title:"",priority:"A",category:"Career",est:30,done:false},{id:uid(),title:"",priority:"A",category:"Money",est:30,done:false},{id:uid(),title:"",priority:"B",category:"Health",est:30,done:false}],wealth:"",workout:false,sleep:7,prayer:false,reflection:false,gratitude:"",scores:{focus:5,discipline:5,energy:5},checkpoint:{win:"",lesson:"",trigger:"",reaction:"responded"},alignment:am,hours:hm,completed:false,quote_idx:Math.floor(Math.random()*QUOTES.length)}; }
function newTrade() { return {id:uid(),date:todayStr(),pair:"EUR/USD",direction:"long",entry:"",exit:"",lots:"0.01",pnl:"",setup:"Breakout",timeframe:"H1",conviction:3,notes:"",lesson:"",status:"open"}; }
function newJournalEntry(type) { return {id:uid(),date:todayStr(),type:type,content:"",tags:"",mood:5}; }

// --- CALCS ---
function calcComp(d) { if(!d) return 0; var t=0,dn=0; t++; if(d.intention) dn++; (d.power_moves||[]).forEach(function(pm){if(pm.title){t++;if(pm.done)dn++;}}); t++; if(d.wealth) dn++; t++; if(d.workout) dn++; t++; if(d.prayer) dn++; t++; if(d.scores&&d.scores.focus>0) dn++; t++; if(d.checkpoint&&d.checkpoint.win) dn++; t++; if(d.alignment&&Object.values(d.alignment).some(function(v){return v>0;})) dn++; return t>0 ? Math.round((dn/t)*100) : 0; }
function calcXP(d) { if(!d||!d.power_moves) return 0; return d.power_moves.filter(function(pm){return pm.done&&pm.title;}).reduce(function(s,pm){return s+(PRIORITY_XP[pm.priority]||10);},0); }
function calcHourFill(d) { if(!d||!d.hours) return 0; var f=HOURS.filter(function(h){return d.hours[h]&&d.hours[h].task;}).length; return Math.round((f/HOURS.length)*100); }

// --- INTEL ---
function generateIntel(daysMap,mission,pillars) {
  var allDays=Object.values(daysMap).sort(function(a,b){return a.date.localeCompare(b.date);});
  if(allDays.length<2) return [{type:"welcome",msg:"Welcome to Intel. Start logging your days and I'll learn your patterns. After 3+ days, I'll start giving you real insights based on YOUR data. Show up tomorrow. I'll be watching.",icon:"🧠"}];
  var ins=[]; var td=todayStr();
  var last7=allDays.filter(function(d){var diff=daysBtwn(d.date,td);return diff>=0&&diff<7;});
  var last14=allDays.filter(function(d){var diff=daysBtwn(d.date,td);return diff>=0&&diff<14;});
  var streak=0; var sd=td; while(daysMap[sd]&&daysMap[sd].completed){streak++;sd=addD(sd,-1);}
  var dayNum=mission?Math.min(90,Math.max(1,daysBtwn(mission.start,td)+1)):1;
  var totalDays=allDays.length;

  // === STREAK & CONSISTENCY ===
  if(streak>=21) ins.push({type:"win",msg:""+streak+"-day streak. You're not the same person who started this. The compound effect is working and everyone around you can feel it. Keep going — you're proving that consistency IS the cheat code.",icon:"👑"});
  else if(streak>=14) ins.push({type:"win",msg:""+streak+" days running. Two weeks of showing up. This is where most people quit. The fact that you're still here? That's not luck — that's identity.",icon:"🔥"});
  else if(streak>=7) ins.push({type:"win",msg:""+streak+"-day streak. A full week locked in. You're building real momentum now. The habits are hardening. Don't let anyone or anything break this chain.",icon:"⚡"});
  else if(streak>=3) ins.push({type:"momentum",msg:""+streak+" days in a row. Good start but don't celebrate yet — the real test is days 5-7. That's when life tries to pull you back. Stay locked.",icon:"📈"});
  else if(streak===0&&totalDays>3) ins.push({type:"reset",msg:"Streak broken. Listen — one missed day is a slip. Two is a pattern. Three is a new identity forming. Reset NOW. Open this app tomorrow morning before anything else. You didn't come this far to only come this far.",icon:"🔄"});

  // === ZERO DAYS CHECK ===
  var zeroDaysLast7=7-last7.length;
  if(zeroDaysLast7>=3&&totalDays>5) ins.push({type:"warning",msg:"You've had "+zeroDaysLast7+" zero days in the last week. That's "+zeroDaysLast7+" days where you gave the old version of yourself permission to run the show. I know life gets busy but even a 60% day beats a zero day. Tomorrow — just open the app, set one intention, do one power move. That's it.",icon:"⚠️"});

  if(last7.length>=3){
    // === PILLAR ANALYSIS ===
    var pAvgs=pillars.map(function(p){var vals=last7.map(function(d){return(d.alignment&&d.alignment[p])||0;});return{name:p,avg:vals.reduce(function(a,b){return a+b;},0)/vals.length};});
    var sorted=pAvgs.slice().sort(function(a,b){return a.avg-b.avg;});
    var weakest=sorted[0];
    var strongest=sorted[sorted.length-1];
    var secondWeak=sorted.length>1?sorted[1]:null;

    if(weakest&&weakest.avg<2) {
      var tips={"Faith / Spirit":"Try starting your day with even 2 minutes of prayer or silence before you check your phone. Spiritual alignment is a competitive advantage.","Financial":"One focused income action per day. Log a trade, study a setup, review a system. Small deposits stack into generational wealth.","Health":"Your body carries your dreams. Skip the gym today, skip your potential tomorrow. Even a 20 minute walk counts.","Relationships":"Send one text to someone who matters. Real wealth is measured in relationships, not just bank accounts.","Family":"Time with family isn't a break from the mission — it IS the mission. What's the point of building if you lose the people who matter?","Purpose / Career":"What did you do today to move the needle on your purpose? If the answer is nothing, that's your assignment for tomorrow.","Personal Growth":"Read 10 pages. Watch one educational video. Have one conversation that stretches your thinking. Growth is a daily habit, not an event."};
      ins.push({type:"alert",msg:weakest.name+" is at "+weakest.avg.toFixed(1)+"/5 this week. This is your biggest growth opportunity right now. "+(tips[weakest.name]||"Focus here tomorrow — your weakest pillar is holding back everything else."),icon:"🎯"});
    }
    if(secondWeak&&secondWeak.avg<2&&weakest.avg<2) ins.push({type:"pattern",msg:"Two pillars running low: "+weakest.name+" and "+secondWeak.name+". When multiple pillars drop at once, it usually means you're over-investing in one area at the expense of others. Balance isn't about being perfect everywhere — it's about not letting anything hit zero.",icon:"⚖️"});
    if(strongest&&strongest.avg>=4) ins.push({type:"win",msg:strongest.name+" is at "+strongest.avg.toFixed(1)+"/5 — you're crushing it here. Now here's the play: transfer that same energy and discipline to your weaker areas. The skills that got you here work everywhere.",icon:"💪"});

    // === PILLAR TREND (compare week 1 vs week 2) ===
    if(last14.length>=10){
      var week1=last14.filter(function(d){var diff=daysBtwn(d.date,td);return diff>=7&&diff<14;});
      var week2=last7;
      if(week1.length>=3){
        pillars.forEach(function(pl){
          var w1Avg=week1.reduce(function(s,d){return s+((d.alignment&&d.alignment[pl])||0);},0)/week1.length;
          var w2Avg=week2.reduce(function(s,d){return s+((d.alignment&&d.alignment[pl])||0);},0)/week2.length;
          if(w2Avg-w1Avg>=1.5) ins.push({type:"trend_up",msg:pl+" jumped from "+w1Avg.toFixed(1)+" to "+w2Avg.toFixed(1)+" this week. Whatever you changed — keep doing it. That's real progress showing up in the data.",icon:"📈"});
          if(w1Avg-w2Avg>=1.5) ins.push({type:"trend_down",msg:pl+" dropped from "+w1Avg.toFixed(1)+" to "+w2Avg.toFixed(1)+" this week. Something shifted. Think back — what changed? Did you skip something? Get distracted? The data doesn't lie. Course correct tomorrow.",icon:"📉"});
        });
      }
    }

    // === OPERATOR SCORES ===
    var avgFocus=+(last7.reduce(function(s,d){return s+d.scores.focus;},0)/last7.length).toFixed(1);
    var avgDisc=+(last7.reduce(function(s,d){return s+d.scores.discipline;},0)/last7.length).toFixed(1);
    var avgEnergy=+(last7.reduce(function(s,d){return s+d.scores.energy;},0)/last7.length).toFixed(1);

    if(avgFocus<4) ins.push({type:"warning",msg:"Focus averaging "+avgFocus+"/10 this week. Distractions are winning. Try this: tomorrow, put your phone in another room for the first 2 hours of your day. Protect your morning focus — it sets the algorithm for everything else.",icon:"🎯"});
    if(avgDisc<4) ins.push({type:"warning",msg:"Discipline at "+avgDisc+"/10. You know what to do — you're just not doing it consistently. The gap between knowing and doing is where most people live forever. Close that gap tomorrow.",icon:"⚔️"});
    if(avgEnergy<4) ins.push({type:"insight",msg:"Energy averaging "+avgEnergy+"/10. Low energy isn't a motivation problem — it's usually sleep, nutrition, or spiritual depletion. Check your sleep hours this week. Are you eating clean? Are you starting the day grounded?",icon:"🔋"});
    if(avgFocus>=8&&avgDisc>=8&&avgEnergy>=8) ins.push({type:"win",msg:"Focus "+avgFocus+", Discipline "+avgDisc+", Energy "+avgEnergy+" — all systems running hot this week. You're in the zone. This is the state where breakthroughs happen. PROTECT this momentum at all costs.",icon:"⚡"});

    // === SLEEP PATTERNS ===
    var avgSleep=+(last7.reduce(function(s,d){return s+(d.sleep||0);},0)/last7.length).toFixed(1);
    if(avgSleep<6) ins.push({type:"insight",msg:"Averaging "+avgSleep+" hours of sleep. That's not grind mode — that's sabotage mode. Your decision-making, your trading, your relationships — everything suffers under 6 hours. Sleep is a weapon. Use it.",icon:"😴"});
    if(avgSleep>=8) ins.push({type:"win",msg:""+avgSleep+" hours average sleep. Recovery game is strong. This is fueling everything else you're doing right. Keep it up.",icon:"🛌"});

    // === WORKOUT CONSISTENCY ===
    var workoutDays=last7.filter(function(d){return d.workout;}).length;
    if(workoutDays===0&&last7.length>=5) ins.push({type:"alert",msg:"Zero workouts logged this week. Your body carries your ambition. You can't operate at peak mental performance with a neglected body. Even 20 minutes tomorrow. No excuses.",icon:"💪"});
    else if(workoutDays>=5) ins.push({type:"win",msg:""+workoutDays+" workouts this week. The discipline you build in the gym transfers to every other area of your life. This is compound interest for your body.",icon:"🏋️"});

    // === SPIRITUAL CONSISTENCY ===
    var prayerDays=last7.filter(function(d){return d.prayer;}).length;
    if(prayerDays===0&&last7.length>=5) ins.push({type:"insight",msg:"No prayer logged this week. Faith isn't separate from the mission — it IS the foundation. Even 60 seconds of gratitude before your first trade changes the energy of your entire day.",icon:"🙏"});
    else if(prayerDays>=6) ins.push({type:"win",msg:"Prayer every day this week. Spiritual alignment is your edge that can't be backtested. Stay connected.",icon:"✨"});

    // === POWER MOVES COMPLETION ===
    var totalPM=0; var donePM=0;
    last7.forEach(function(d){(d.power_moves||[]).forEach(function(pm){if(pm.title){totalPM++;if(pm.done)donePM++;}});});
    var pmRate=totalPM>0?Math.round((donePM/totalPM)*100):0;
    if(pmRate<40&&totalPM>5) ins.push({type:"warning",msg:"Only finishing "+pmRate+"% of your Power Moves. You're setting tasks but not executing. Two options: either you're overloading yourself (set fewer, more important moves) or you're not protecting your execution time. Which one is it?",icon:"📋"});
    else if(pmRate>=80&&totalPM>5) ins.push({type:"win",msg:""+pmRate+"% Power Move completion rate. You say it, you do it. That's operator energy. Your word to yourself is becoming unbreakable.",icon:"✅"});

    // === TRADE JOURNAL PATTERNS ===
    var trades=[];
    allDays.forEach(function(d){if(d.journals&&d.journals.trade)(d.journals.trade).forEach(function(j){if(j.instrument)trades.push(Object.assign({},j,{date:d.date}));});});
    if(trades.length>=5){
      var wins=trades.filter(function(t){return parseFloat(t.pnl||0)>0;});
      var losses=trades.filter(function(t){return parseFloat(t.pnl||0)<0;});
      var winRate=Math.round((wins.length/trades.length)*100);
      var totalPnl=trades.reduce(function(s,t){return s+parseFloat(t.pnl||0);},0);
      if(winRate>=60) ins.push({type:"win",msg:""+winRate+"% win rate across "+trades.length+" logged trades. The system is working. Trust it. Don't fix what isn't broken.",icon:"📊"});
      else if(winRate<40&&trades.length>=10) ins.push({type:"alert",msg:"Win rate at "+winRate+"% across "+trades.length+" trades. Time to review: Are you following your system? Are you revenge trading? Check your last 5 losses — I bet you'll find a pattern.",icon:"📉"});
      if(totalPnl>0) ins.push({type:"momentum",msg:"Net P&L: +$"+totalPnl.toFixed(2)+" across all logged trades. You're profitable. Now the game is risk management and consistency — protect what you've built.",icon:"💰"});

      // Check for revenge trading patterns
      var revengeSigns=0;
      for(var ti=1;ti<trades.length;ti++){
        if(parseFloat(trades[ti-1].pnl||0)<0&&parseFloat(trades[ti].pnl||0)<0&&trades[ti].date===trades[ti-1].date) revengeSigns++;
      }
      if(revengeSigns>=2) ins.push({type:"pattern",msg:"I'm seeing back-to-back losses on the same day "+revengeSigns+" times. That looks like revenge trading. When you take a loss, walk away for at least 30 minutes. The market will be there tomorrow. Your account might not be if you keep chasing.",icon:"🚨"});
    }

    // === COMPLETION PATTERNS ===
    var avgComp=Math.round(last7.reduce(function(s,d){return s+calcComp(d);},0)/last7.length);
    if(avgComp>=85) ins.push({type:"win",msg:"Averaging "+avgComp+"% day completion this week. You're not just going through the motions — you're actually doing the work. This version of you is dangerous.",icon:"🔥"});
    else if(avgComp<50&&last7.length>=5) ins.push({type:"insight",msg:"Completing about "+avgComp+"% of your daily checklist. You don't need to be perfect — but you do need to be consistent. Focus on getting 3 things done every day: intention, one power move, and your checkpoint. Start there.",icon:"📝"});

    // === DAY-OF-WEEK PATTERNS ===
    if(allDays.length>=14){
      var dayOfWeekComps={};
      allDays.forEach(function(d){var dow=new Date(d.date+"T12:00:00").getDay();if(!dayOfWeekComps[dow])dayOfWeekComps[dow]=[];dayOfWeekComps[dow].push(calcComp(d));});
      var dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      var worstDay=null; var worstAvg=100; var bestDay=null; var bestAvg=0;
      Object.keys(dayOfWeekComps).forEach(function(dow){
        var avg=dayOfWeekComps[dow].reduce(function(s,v){return s+v;},0)/dayOfWeekComps[dow].length;
        if(avg<worstAvg&&dayOfWeekComps[dow].length>=2){worstAvg=avg;worstDay=dayNames[dow];}
        if(avg>bestAvg&&dayOfWeekComps[dow].length>=2){bestAvg=avg;bestDay=dayNames[dow];}
      });
      if(worstDay&&worstAvg<50) ins.push({type:"pattern",msg:worstDay+"s are your weakest day — averaging "+Math.round(worstAvg)+"% completion. Knowing this is power. Pre-plan your "+worstDay+"s the night before. Set your intention before you go to sleep.",icon:"📅"});
      if(bestDay&&bestAvg>=80) ins.push({type:"pattern",msg:bestDay+"s are your strongest — "+Math.round(bestAvg)+"% average. What's different about those days? Replicate that energy across the whole week.",icon:"📅"});
    }
  }

  // === MISSION PROGRESS ===
  if(mission){
    if(dayNum<=7) ins.push({type:"insight",msg:"Week 1 of 90. Right now the goal isn't perfection — it's building the habit of showing up. Every day you open this app and log something is a vote for the person you're becoming.",icon:"🚀"});
    else if(dayNum>=80) ins.push({type:"momentum",msg:"Day "+dayNum+" of 90. "+Math.max(0,90-dayNum)+" days left. You're in the final stretch. Finish strong — how you end this defines how you start the next one. The person who finishes is not the person who started.",icon:"🏁"});
    else if(dayNum===45) ins.push({type:"insight",msg:"Halfway point. This is the boring middle — the part nobody posts about on social media. But this is where champions are built. The people who push through the middle are the ones standing at the end.",icon:"⛰️"});
  }

  // === NEXT MOVES ===
  if(last7.length>=3){
    var actionItems=[];
    var wk=pAvgs?pAvgs.slice().sort(function(a,b){return a.avg-b.avg;})[0]:null;
    if(wk&&wk.avg<3) actionItems.push("Invest 15 minutes in "+wk.name+" tomorrow");
    if(avgFocus<5) actionItems.push("Phone-free first 2 hours of your morning");
    if(workoutDays<3) actionItems.push("Move your body — gym, walk, anything");
    if(prayerDays<3) actionItems.push("Start tomorrow with 2 minutes of prayer");
    if(avgSleep<7) actionItems.push("Get to bed 30 minutes earlier tonight");
    if(actionItems.length>0) ins.push({type:"next",msg:"Your next best moves: "+actionItems.slice(0,3).join(" → ")+". Small adjustments. Big results. Trust the system.",icon:"🎯"});
  }

  // Quote based on state
  var stateQuotes={
    great:["You're operating at a level most people dream about. Stay humble. Stay hungry. Stay dangerous.","This is what alignment looks like. Every pillar firing, every day logged. This is the version of you that wins."],
    good:["Solid week. You're building something real. Don't compare your chapter 3 to someone else's chapter 20.","Progress isn't always dramatic. Sometimes it's just showing up one more day than you did last month."],
    struggling:["Tough week — I see it in the data. But here's what I also see: you're still here. You're still opening this app. That matters more than any score.","The comeback is always stronger than the setback. Tomorrow is a clean slate. Use it."],
    new:["The hardest part is starting. You already did that. Now just don't stop.","Every expert was once a beginner. Every streak started with day one."]
  };
  var state=totalDays<5?"new":streak>=5&&avgComp>=70?"great":streak>=2?"good":"struggling";
  var sq=stateQuotes[state]; var rq=sq[Math.floor(Math.random()*sq.length)];
  ins.push({type:"quote",msg:rq,icon:"💭"});

  if(ins.length===0) ins.push({type:"info",msg:"Systems nominal. Keep executing. I'll flag anything important as your data grows.",icon:"✅"});
  return ins;
}


// --- STYLES ---
function Styles(p) { return <style dangerouslySetInnerHTML={{__html:"@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&family=Chakra+Petch:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');:root{--ac:"+p.accent+";--bg:#06060c;--bg2:#0d0d16;--bg3:#14141f;--bg4:#1c1c2a;--brd:#1e1e30;--tx:#d8d8e4;--tx2:#6a6a80;--gw:"+p.accent+"40;--gw2:"+p.accent+"18;}*{box-sizing:border-box;margin:0;padding:0;}html{font-size:15px;}body{background:var(--bg);color:var(--tx);font-family:'Chakra Petch',sans-serif;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:var(--ac);}input,textarea,select{background:var(--bg2);color:var(--tx);border:1px solid var(--brd);border-radius:6px;padding:8px 12px;font-family:'Chakra Petch',sans-serif;font-size:14px;outline:none;transition:border .2s;width:100%;}input:focus,textarea:focus,select:focus{border-color:var(--ac);}textarea{resize:vertical;min-height:50px;}button{cursor:pointer;font-family:'Chakra Petch',sans-serif;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes flick{0%,10%{opacity:0}12%{opacity:1}14%{opacity:0}16%,100%{opacity:1}}.au{animation:fadeUp .4s ease both}"}}/>; }

// --- ICONS ---
function Ic(p) { var d={cal:"M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6c0-1.1.9-2 2-2z",gear:"M12 15a3 3 0 100-6 3 3 0 000 6z",bar:"M18 20V10M12 20V4M6 20v-6",star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",chk:"M20 6L9 17l-5-5",ref:"M1 4v6h6M23 20v-6h-6",x:"M18 6L6 18M6 6l12 12",plus:"M12 5v14M5 12h14",tgt:"M22 12A10 10 0 112 12a10 10 0 0120 0zM18 12a6 6 0 11-12 0 6 6 0 0112 0z",zap:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",hist:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",dl:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",ul:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",brain:"M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.2 6L12 22l-3.8-7A7 7 0 0112 2z",grid:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",week:"M3 4h18v16H3zM3 10h18M9 4v16M15 4v16",back:"M19 12H5M12 19l-7-7 7-7",right:"M9 18l6-6-6-6",left:"M15 18l-6-6 6-6",flag:"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",book:"M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",heart:"M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z",dollar:"M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",candle:"M9 4v16M15 4v16M9 8h6M9 16h6"}; return <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d[p.n]||d.star}/></svg>; }

// --- UI ---
function Btn(p) { var sm=p.sm; var dis=p.disabled; var v=p.v||"def"; var base={padding:sm?"5px 12px":"9px 18px",borderRadius:7,border:"1px solid var(--brd)",fontSize:sm?12:14,fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",transition:"all .2s",display:"inline-flex",alignItems:"center",gap:5,opacity:dis?0.4:1,pointerEvents:dis?"none":"auto"}; var vs={def:{background:"var(--bg3)",color:"var(--tx)"},ac:{background:"var(--ac)",color:"#000",border:"1px solid var(--ac)"},gh:{background:"transparent",color:"var(--tx2)",border:"1px solid transparent"},win:{background:"#39ff1420",color:"#39ff14",border:"1px solid #39ff1440"},lose:{background:"#ff003c20",color:"#ff003c",border:"1px solid #ff003c40"}}; return <button onClick={p.onClick} style={Object.assign({},base,vs[v]||vs.def,p.style||{})}>{p.children}</button>; }
function Card(p) { return <div className="au" onClick={p.onClick} style={Object.assign({background:"var(--bg2)",border:"1px solid var(--brd)",borderRadius:10,padding:16},p.style||{})}>{p.children}</div>; }
function Lbl(p) { return <span style={{fontSize:10,textTransform:"uppercase",letterSpacing:1.8,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace",display:"block",marginBottom:6}}>{p.children}</span>; }
function Bar(p) { var pct=p.pct||0; var h=p.h||5; var c=p.color||"var(--ac)"; return <div style={{background:"var(--bg4)",borderRadius:h/2,height:h,overflow:"hidden",width:"100%"}}><div style={{width:Math.min(100,pct)+"%",height:"100%",borderRadius:h/2,background:c,transition:"width .5s"}}/></div>; }
function Tog(p) { var val=p.value; return <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:5}}><div onClick={function(){p.onChange(!val);}} style={{width:36,height:20,borderRadius:10,background:val?"var(--ac)":"var(--bg4)",border:"1px solid var(--brd)",position:"relative",transition:"all .2s",cursor:"pointer",flexShrink:0}}><div style={{width:14,height:14,borderRadius:"50%",background:val?"#000":"var(--tx2)",position:"absolute",top:2,left:val?19:2,transition:"all .2s"}}/></div><span style={{fontSize:13}}>{p.label}</span></label>; }
function PBadge(p) { var c=PRIORITY_COLORS[p.p]||"#555"; return <span style={{display:"inline-block",padding:"1px 7px",borderRadius:3,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"'Oxanium',sans-serif",color:c,border:"1px solid "+c+"40",background:c+"10"}}>{p.p}</span>; }
function Sld(p) { var pct=((p.value-1)/9)*100; return <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{width:72,fontSize:12,color:"var(--tx2)"}}>{p.label}</span><input type="range" min={1} max={10} value={p.value} onChange={function(e){p.onChange(Number(e.target.value));}} style={{flex:1,height:3,appearance:"none",background:"linear-gradient(to right,var(--ac) "+pct+"%,var(--bg4) 0%)",borderRadius:2,border:"none",cursor:"pointer"}}/><span style={{width:28,textAlign:"center",fontFamily:"'Oxanium',sans-serif",fontSize:13,color:"var(--ac)",fontWeight:700}}>{p.value}</span></div>; }
function TabBar(p) { return <div style={{display:"flex",gap:4,marginBottom:14,flexWrap:"wrap"}}>{p.tabs.map(function(t){var isA=p.active===t.id;return <button key={t.id} onClick={function(){p.onChange(t.id);}} style={{padding:"6px 14px",borderRadius:6,border:"1px solid "+(isA?"var(--ac)":"var(--brd)"),background:isA?"var(--ac)":"var(--bg3)",color:isA?"#000":"var(--tx2)",fontSize:12,fontWeight:600,letterSpacing:0.5,transition:"all .2s",cursor:"pointer"}}>{t.label}</button>;})}</div>; }

// --- BOOT ---
function Boot(p) {
  var [phase,setPhase]=useState("terminal");
  var [lines,setLines]=useState([]);
  var bl=["> Initializing AURASZN Kernel...","> Loading Momentum Core v3.0...","> Syncing Journals Module...","> Forex Trade Engine Online...","> Intel System Ready...","> BOOT COMPLETE"];
  useEffect(function(){
    if(phase!=="terminal") return;
    var i=0;var iv=setInterval(function(){if(i<bl.length){var line=bl[i];setLines(function(prev){return prev.concat([line]);});i++;}else{clearInterval(iv);setTimeout(function(){setPhase("identity");},300);}},180);return function(){clearInterval(iv);};
  },[phase]);
  useEffect(function(){
    if(phase==="identity"){setTimeout(function(){p.onDone();},2200);}
  },[phase]);
  if(phase==="identity"&&p.identity){
    return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",animation:"fadeIn .4s ease"}}><div style={{maxWidth:500,width:"90%",textAlign:"center",padding:20}}><div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--tx2)",letterSpacing:3,marginBottom:16,textTransform:"uppercase"}}>Operator Identity</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:20,fontWeight:600,color:"var(--ac)",lineHeight:1.6,letterSpacing:0.5}}>{'"'+p.identity+'"'}</div><div style={{marginTop:20,width:60,height:2,background:"var(--ac)",margin:"20px auto 0",opacity:0.5}}/><div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--tx2)",marginTop:12,letterSpacing:2}}>DAY {p.dayNum} OF 90</div></div></div>;
  }
  return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontFamily:"'JetBrains Mono',monospace"}}><div style={{maxWidth:480,width:"90%",padding:20}}><div style={{fontSize:26,fontFamily:"'Oxanium',sans-serif",fontWeight:800,color:"var(--ac)",marginBottom:28,letterSpacing:6,animation:"flick .8s ease-out"}}>AURASZN</div>{lines.map(function(l,i){var isLast=i===lines.length-1&&i===bl.length-1;return <div key={i} style={{color:isLast?"var(--ac)":"#445",fontSize:12,lineHeight:2,animation:"fadeIn .15s ease-out"}}>{l}</div>;})}</div></div>;
}

// --- SETUP ---
var TARGET_ICONS = {financial:"dollar",health:"heart",relationship:"heart",spiritual:"star",professional:"tgt"};
var TARGET_LABELS = {financial:"Financial",health:"Health",relationship:"Relationship",spiritual:"Spiritual",professional:"Professional"};
function Setup(p) {
  var [m,setM]=useState(newMission());
  function u(k,v){setM(function(prev){var n=Object.assign({},prev);n[k]=v;return n;});}
  function ut(k,v){setM(function(prev){return Object.assign({},prev,{targets:Object.assign({},prev.targets,{[k]:v})});});}
  return <div style={{maxWidth:560,margin:"0 auto",padding:20}}>
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:20,fontWeight:700,color:"var(--ac)",marginBottom:6,letterSpacing:3}}>NEW 90-DAY MISSION</div>
    <p style={{color:"var(--tx2)",marginBottom:20,fontSize:13}}>Define your mission. 90 days. No excuses.</p>
    <Card style={{marginBottom:14}}><Lbl>Identity Statement</Lbl><textarea value={m.identity} placeholder="I operate as my highest self daily..." onChange={function(e){u("identity",e.target.value);}} style={{minHeight:80}}/></Card>
    <Card style={{marginBottom:14}}><Lbl>Mission Targets</Lbl><div style={{display:"grid",gap:12}}>{Object.keys(m.targets).map(function(k){return <div key={k} style={{background:"var(--bg3)",borderRadius:8,padding:12,border:"1px solid var(--brd)"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><Ic n={TARGET_ICONS[k]||"tgt"} s={14}/><span style={{fontSize:12,fontWeight:600,color:"var(--ac)",textTransform:"uppercase",letterSpacing:1}}>{TARGET_LABELS[k]||k}</span></div><textarea value={m.targets[k]} onChange={function(e){ut(k,e.target.value);}} placeholder={"Your "+k+" targets...\nUse new lines for bullet points..."} style={{minHeight:70,fontSize:13,lineHeight:1.6,background:"var(--bg2)"}}/></div>;})}</div></Card>
    <Card style={{marginBottom:14}}><Lbl>Rules of the Game</Lbl>{m.rules.map(function(r,i){return <div key={i} style={{display:"flex",gap:6,marginBottom:6}}><input value={r} onChange={function(e){var rs=m.rules.slice();rs[i]=e.target.value;u("rules",rs);}} style={{flex:1}}/><Btn v="gh" sm onClick={function(){u("rules",m.rules.filter(function(_,j){return j!==i;}));}}><Ic n="x" s={12}/></Btn></div>;})}<Btn v="gh" sm onClick={function(){u("rules",m.rules.concat([""]));}}><Ic n="plus" s={12}/> Add</Btn></Card>
    <Btn v="ac" onClick={function(){p.onSave(m);}} style={{width:"100%",padding:14,fontSize:15}}><Ic n="zap" s={16}/> ACTIVATE MISSION</Btn>
  </div>;
}

// --- MISSION PAGE (View & Edit) ---
function MissionPage(p) {
  var mission=p.mission; var setMission=p.setMission; var accent=p.accent; var pillars=p.pillars; var setPillars=p.setPillars;
  var [editing,setEditing]=useState(null);
  if(!mission) return null;
  var td=todayStr(); var dayNum=Math.min(90,Math.max(1,daysBtwn(mission.start,td)+1)); var remaining=Math.max(0,90-dayNum); var pct=Math.round((dayNum/90)*100);
  function u(k,v){setMission(function(prev){return Object.assign({},prev,{[k]:v});});}
  function ut(k,v){setMission(function(prev){return Object.assign({},prev,{targets:Object.assign({},prev.targets,{[k]:v})});});}

  function renderText(text) {
    if(!text) return <span style={{color:"var(--tx2)",fontStyle:"italic",fontSize:13}}>Tap to add...</span>;
    return text.split("\n").map(function(line,i) {
      if(!line.trim()) return <div key={i} style={{height:6}}/>;
      var isBullet = line.trim().startsWith("-") || line.trim().startsWith("*") || line.trim().match(/^\d+[.)]/);
      return <div key={i} style={{fontSize:13,lineHeight:1.7,color:"var(--tx)",paddingLeft:isBullet?12:0,position:"relative"}}>
        {isBullet && <span style={{position:"absolute",left:0,color:"var(--ac)"}}>{">"}</span>}
        {isBullet ? line.trim().replace(/^[-*]\s*|^\d+[.)]\s*/,"") : line}
      </div>;
    });
  }

  var targetColors = {financial:"#ffea00",health:"#39ff14",relationship:"#ff0099",spiritual:"#bf00ff",professional:"#00e5ff"};

  return <div style={{maxWidth:660,margin:"0 auto"}}>
    {/* Day Counter */}
    <Card style={{marginBottom:14,textAlign:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,opacity:0.04,background:"radial-gradient(circle at 30% 50%,var(--ac),transparent 60%)"}}/><div style={{position:"relative"}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:42,fontWeight:800,color:"var(--ac)",lineHeight:1}}>DAY {dayNum}</div><div style={{fontSize:13,color:"var(--tx2)",marginTop:3}}>of 90 — {remaining} remaining</div><div style={{marginTop:12}}><Bar pct={pct} h={6}/></div><div style={{fontSize:11,color:"var(--tx2)",marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>{pct}% complete</div></div></Card>

    {/* Identity */}
    <Card style={{marginBottom:14,position:"relative",overflow:"hidden",cursor:"pointer"}} onClick={function(){setEditing(editing==="identity"?null:"identity");}}>
      <div style={{position:"absolute",inset:0,opacity:0.03,background:"radial-gradient(circle at 50% 50%,var(--ac),transparent 70%)"}}/>
      <div style={{position:"relative"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Lbl>Identity Statement</Lbl><span style={{fontSize:10,color:"var(--tx2)"}}>{editing==="identity"?"tap to close":"tap to edit"}</span></div>
        {editing==="identity" ? <textarea value={mission.identity||""} onChange={function(e){u("identity",e.target.value);}} placeholder="Who are you operating as for 90 days?" style={{fontSize:15,fontFamily:"'Oxanium',sans-serif",minHeight:80,lineHeight:1.6}} onClick={function(e){e.stopPropagation();}}/> : <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:500,color:"var(--ac)",lineHeight:1.7}}>{mission.identity ? ('"'+mission.identity+'"') : <span style={{color:"var(--tx2)",fontStyle:"italic"}}>Tap to set your identity...</span>}</div>}
      </div>
    </Card>

    {/* Targets */}
    <div style={{marginBottom:14}}>
      <Lbl>Mission Targets</Lbl>
      <div style={{display:"grid",gap:10,marginTop:4}}>
        {Object.keys(mission.targets||{}).map(function(k) {
          var tc = targetColors[k] || accent;
          var isEditing = editing === k;
          return <Card key={k} style={{padding:14,borderLeft:"3px solid "+tc,cursor:"pointer",background:isEditing?"var(--bg3)":"var(--bg2)"}} onClick={function(){setEditing(isEditing?null:k);}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <Ic n={TARGET_ICONS[k]||"tgt"} s={14}/>
              <span style={{fontSize:12,fontWeight:700,color:tc,textTransform:"uppercase",letterSpacing:1.5,fontFamily:"'Oxanium',sans-serif"}}>{TARGET_LABELS[k]||k}</span>
              <span style={{marginLeft:"auto",fontSize:10,color:"var(--tx2)"}}>{isEditing?"tap to close":"tap to edit"}</span>
            </div>
            {isEditing ? <textarea value={mission.targets[k]||""} onChange={function(e){ut(k,e.target.value);}} placeholder={"Your "+k+" targets...\nUse new lines for each point\n- Like this\n- And this"} style={{minHeight:90,fontSize:13,lineHeight:1.7,background:"var(--bg2)"}} onClick={function(e){e.stopPropagation();}}/> : <div>{renderText(mission.targets[k])}</div>}
          </Card>;
        })}
      </div>
    </div>

    {/* Life Pillars */}
    <Card style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Lbl>Life Pillars</Lbl><span style={{fontSize:10,color:"var(--tx2)"}}>Score these daily on the Day tab (0-2)</span></div>
      {p.pillars.map(function(pl,i){
        return <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,padding:"8px 12px",borderRadius:6,background:"var(--bg3)",border:"1px solid var(--brd)"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:accent,flexShrink:0}}/>
          <input value={pl} onChange={function(e){var np=p.pillars.slice();np[i]=e.target.value;p.setPillars(np);}} style={{flex:1,border:"none",background:"transparent",fontSize:13,fontWeight:500}}/>
          <Btn v="gh" sm onClick={function(){p.setPillars(p.pillars.filter(function(_,j){return j!==i;}));}}><Ic n="x" s={12}/></Btn>
        </div>;
      })}
      <Btn v="gh" sm onClick={function(){p.setPillars(p.pillars.concat(["New Pillar"]));}} style={{marginTop:4}}><Ic n="plus" s={12}/> Add Pillar</Btn>
    </Card>

    {/* Rules */}
    <Card style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Lbl>Rules of the Game</Lbl></div>
      {(mission.rules||[]).map(function(r,i){
        return <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,padding:"8px 10px",borderRadius:6,background:"var(--bg3)"}}>
          <span style={{color:"var(--ac)",fontFamily:"'Oxanium',sans-serif",fontWeight:700,fontSize:12,flexShrink:0}}>{String(i+1).padStart(2,"0")}</span>
          <input value={r} onChange={function(e){var rs=(mission.rules||[]).slice();rs[i]=e.target.value;u("rules",rs);}} style={{flex:1,border:"none",background:"transparent",fontSize:13}}/>
          <Btn v="gh" sm onClick={function(){u("rules",(mission.rules||[]).filter(function(_,j){return j!==i;}));}}><Ic n="x" s={12}/></Btn>
        </div>;
      })}
      <Btn v="gh" sm onClick={function(){u("rules",(mission.rules||[]).concat([""]));}}><Ic n="plus" s={12}/> Add Rule</Btn>
    </Card>

    {/* Meta */}
    <Card style={{padding:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace"}}><span>Started: {fmtDate(mission.start)}</span><span>Ends: {fmtDate(mission.end)}</span></div></Card>
  </div>;
}

// --- HOURLY PLANNER ---
function HourlyPlanner(p) {
  var day=p.day; var setDay=p.setDay; if(!day) return null;
  function updH(h,k,v){setDay(function(d){var nh=Object.assign({},d.hours);nh[h]=Object.assign({},nh[h]||{task:"",done:false});nh[h][k]=v;return Object.assign({},d,{hours:nh});});}
  var fc=HOURS.filter(function(h){return day.hours&&day.hours[h]&&day.hours[h].task;}).length;
  var dc=HOURS.filter(function(h){return day.hours&&day.hours[h]&&day.hours[h].done;}).length;
  return <div style={{display:"grid",gap:1}}>{HOURS.map(function(h){var slot=(day.hours&&day.hours[h])||{task:"",done:false};var isDone=slot.done;return <div key={h} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid var(--brd)"}}><span style={{width:52,fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:isDone?"var(--ac)":"var(--tx2)",flexShrink:0,textAlign:"right",paddingRight:8}}>{fmtHour(h)}</span><div onClick={function(){updH(h,"done",!isDone);}} style={{width:20,height:20,borderRadius:4,border:"1.5px solid "+(isDone?"var(--ac)":"var(--brd)"),display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,background:isDone?"var(--ac)":"transparent",transition:"all .2s"}}>{isDone&&<Ic n="chk" s={12}/>}</div><input value={slot.task} onChange={function(e){updH(h,"task",e.target.value);}} placeholder={"\u2014"} style={{border:"none",background:"transparent",padding:"4px 8px",fontSize:13,textDecoration:isDone?"line-through":"none",opacity:isDone?0.5:1}}/></div>;})}
  <div style={{marginTop:8,fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--tx2)"}}>{fc}/{HOURS.length} filled | {dc} done</div></div>;
}

// --- MOUNTAIN CLIMB ---
function MountainSVG(p) {
  var dayNum=p.dayNum||1; var pct=Math.min(100,(dayNum/90)*100); var accent=p.accent;
  // Points scaled to fit within padded area (leave 25px top, 15px sides, 20px bottom)
  var pts=[[0,88],[4,84],[8,80],[12,75],[16,68],[20,62],[24,55],[27,58],[30,50],[34,44],[37,48],[40,40],[44,35],[47,38],[50,32],[54,27],[57,30],[60,24],[64,20],[67,23],[70,16],[74,13],[77,16],[80,11],[84,9],[87,12],[90,8],[93,10],[96,7],[100,5]];
  function sx(v){return 15+v*4.3;} function sy(v){return 25+v*1.1;}
  var full="M"+pts.map(function(t){return sx(t[0])+" "+sy(t[1]);}).join(" L");
  var ci=Math.min(Math.floor((pct/100)*(pts.length-1)),pts.length-1);
  var done=pts.slice(0,ci+1);
  var doneD=done.length>1?"M"+done.map(function(t){return sx(t[0])+" "+sy(t[1]);}).join(" L"):"";
  var cx=sx(pts[ci][0]); var cy=sy(pts[ci][1]);
  var m30i=Math.floor(0.33*(pts.length-1)); var m60i=Math.floor(0.66*(pts.length-1));
  var m30=pts[m30i]; var m60=pts[m60i];
  var lastPt=pts[pts.length-1]; var lx=sx(lastPt[0]); var ly=sy(lastPt[1]);
  return <svg viewBox="0 0 460 140" style={{width:"100%"}}><defs><linearGradient id="mfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity="0.1"/><stop offset="100%" stopColor={accent} stopOpacity="0"/></linearGradient><filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
  <path d={full+" L"+sx(100)+",135 L"+sx(0)+",135Z"} fill="url(#mfill)"/>
  <path d={full} fill="none" stroke="#1e1e30" strokeWidth="2" strokeLinecap="round"/>
  {doneD&&<path d={doneD} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" filter="url(#gl)"/>}
  <circle cx={sx(m30[0])} cy={sy(m30[1])} r="3.5" fill="none" stroke="#ff6b00" strokeWidth="1.5" opacity="0.5"/>
  <text x={sx(m30[0])} y={sy(m30[1])-8} textAnchor="middle" fill="#ff6b00" fontSize="7" fontFamily="Oxanium" opacity="0.6">DAY 30</text>
  <circle cx={sx(m60[0])} cy={sy(m60[1])} r="3.5" fill="none" stroke="#bf00ff" strokeWidth="1.5" opacity="0.5"/>
  <text x={sx(m60[0])} y={sy(m60[1])-8} textAnchor="middle" fill="#bf00ff" fontSize="7" fontFamily="Oxanium" opacity="0.6">DAY 60</text>
  <circle cx={lx} cy={ly} r="4" fill="none" stroke="#39ff14" strokeWidth="1.5" opacity="0.6"/>
  <text x={lx} y={ly-10} textAnchor="middle" fill="#39ff14" fontSize="7" fontFamily="Oxanium" fontWeight="600" opacity="0.7">SUMMIT</text>
  <circle cx={cx} cy={cy} r="5" fill={accent} filter="url(#gl)"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/></circle>
  <circle cx={cx} cy={cy} r="10" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3"><animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/></circle>
  <text x={cx} y={cy-14} textAnchor="middle" fill={accent} fontSize="8" fontFamily="Oxanium" fontWeight="700">DAY {dayNum}</text>
  <text x={20} y={132} fill="#333" fontSize="7" fontFamily="JetBrains Mono">START</text>
  <text x={440} y={132} fill="#333" fontSize="7" fontFamily="JetBrains Mono" textAnchor="end">DAY 90</text>
  </svg>;
}

// --- PILLAR BALANCE BARS ---
function PillarBars(p) {
  var pillars=p.pillars; var days=p.days; var accent=p.accent;
  var allD=Object.values(days);
  var last7=allD.filter(function(d){var diff=daysBtwn(d.date,todayStr());return diff>=0&&diff<7;});
  var pData=pillars.map(function(pl){
    var vals=last7.map(function(d){return(d.alignment&&d.alignment[pl])||0;});
    var avg=vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:0;
    return{name:pl,avg:avg,pct:Math.round((avg/5)*100)};
  });
  var maxAvg=pData.reduce(function(mx,d){return d.avg>mx?d.avg:mx;},0);
  var pillarColors=["#00e5ff","#ff003c","#39ff14","#ff6b00","#bf00ff","#ffea00","#ff0099","#00ff88"];
  return <div style={{display:"grid",gap:8}}>{pData.map(function(pd,i){
    var c=pillarColors[i%pillarColors.length];
    var isWeak=pd.avg<2&&last7.length>=3;
    var isStrong=pd.avg>=4;
    return <div key={pd.name}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
        <span style={{fontSize:12,color:isWeak?"#ff003c":isStrong?c:"var(--tx2)",fontWeight:isStrong?600:400}}>{pd.name}</span>
        <span style={{fontSize:11,fontFamily:"'Oxanium',sans-serif",color:isWeak?"#ff003c":c,fontWeight:600}}>{pd.avg.toFixed(1)}/5</span>
      </div>
      <div style={{background:"var(--bg4)",borderRadius:4,height:10,overflow:"hidden",position:"relative"}}>
        <div style={{width:pd.pct+"%",height:"100%",borderRadius:4,background:"linear-gradient(90deg,"+c+"80,"+c+")",transition:"width 1s ease",boxShadow:"0 0 10px "+c+"40",position:"relative"}}>
          {isStrong&&<div style={{position:"absolute",right:0,top:0,bottom:0,width:4,background:"#fff",borderRadius:2,opacity:0.4,animation:"fadeIn 1s ease"}}/>}
        </div>
        {isWeak&&<div style={{position:"absolute",right:6,top:0,bottom:0,display:"flex",alignItems:"center",fontSize:9,color:"#ff003c",fontWeight:600}}>!</div>}
      </div>
    </div>;
  })}</div>;
}

// --- WEEK VIEW ---
function WeekView(p) {
  var days=p.days; var accent=p.accent; var mission=p.mission; var pillars=p.pillars||[];
  var [wo,setWo]=useState(0);
  var ws=addD(getWeekStart(todayStr()),wo*7);
  var wd=[0,1,2,3,4,5,6].map(function(i){return addD(ws,i);});
  var wdata=wd.map(function(d){var dy=days[d];return{date:d,day:dy,comp:dy?calcComp(dy):0,fill:dy?calcHourFill(dy):0};});
  var withData=wdata.filter(function(w){return w.day;});
  var ac=withData.length?Math.round(withData.reduce(function(s,w){return s+w.comp;},0)/withData.length):0;
  var af=withData.length?Math.round(withData.reduce(function(s,w){return s+w.fill;},0)/withData.length):0;
  var dayNum=mission?Math.min(90,Math.max(1,daysBtwn(mission.start,todayStr())+1)):1;
  return <div style={{maxWidth:800,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <Btn v="gh" sm onClick={function(){setWo(function(x){return x-1;});}}><Ic n="left" s={14}/></Btn>
      <div style={{textAlign:"center"}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:14,fontWeight:600,color:"var(--ac)",letterSpacing:1}}>{fmtDate(ws)} — {fmtDate(addD(ws,6))}</div><div style={{fontSize:11,color:"var(--tx2)",marginTop:2}}>Completion: {ac}% | Schedule: {af}%</div></div>
      <Btn v="gh" sm onClick={function(){setWo(function(x){return x+1;});}}><Ic n="right" s={14}/></Btn>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:16}}>{wdata.map(function(w){var isT=w.date===todayStr();var isSel=w.date===p.selectedDate;var dt=new Date(w.date+"T12:00:00");return <div key={w.date} onClick={function(){p.onSelectDay(w.date);}} style={{padding:10,borderRadius:8,cursor:"pointer",transition:"all .2s",textAlign:"center",background:isSel?accent+"15":isT?accent+"08":"var(--bg2)",border:"1.5px solid "+(isSel?accent:isT?accent+"60":"var(--brd)")}}><div style={{fontSize:10,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>{DAYNAMES[dt.getDay()]}</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:700,color:w.comp>=80?"var(--ac)":w.comp>0?"var(--tx)":"var(--tx2)"}}>{dt.getDate()}</div>{w.day?<div><div style={{marginTop:6}}><Bar pct={w.comp} h={3}/></div><div style={{fontSize:9,color:"var(--tx2)",marginTop:3,fontFamily:"'JetBrains Mono',monospace"}}>{w.comp}%</div></div>:<div style={{fontSize:9,color:"var(--tx2)",marginTop:6}}>{"\u2014"}</div>}</div>;})}</div>

    {/* Mountain Climb */}
    <Card style={{marginBottom:14,padding:14,overflow:"hidden"}}>
      <Lbl>90-Day Climb</Lbl>
      <MountainSVG dayNum={dayNum} accent={accent}/>
    </Card>

    {/* Pillar Balance */}
    <Card style={{padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><Lbl>Life Balance (7-Day)</Lbl></div>
      <PillarBars pillars={pillars} days={days} accent={accent}/>
    </Card>
  </div>;
}

// --- MONTH VIEW ---
function MonthView(p) {
  var days=p.days; var mission=p.mission; var accent=p.accent; if(!mission) return null;
  var months=[{label:"MONTH 1",start:mission.start,end:addD(mission.start,29)},{label:"MONTH 2",start:addD(mission.start,30),end:addD(mission.start,59)},{label:"MONTH 3",start:addD(mission.start,60),end:mission.end}];

  function buildCalWeeks(startDate, endDate) {
    // Collect all mission days in this block
    var mDays = [];
    var d = startDate;
    while(d <= endDate) { mDays.push(d); d = addD(d, 1); }
    if(mDays.length === 0) return [];

    // Find the calendar month boundaries we need to show
    // Start from the Sunday of the week containing startDate
    var firstDow = getDOW(startDate);
    var calStart = addD(startDate, -firstDow);

    // End at the Saturday of the week containing endDate
    var lastDow = getDOW(endDate);
    var calEnd = addD(endDate, 6 - lastDow);

    // Build weeks as rows of 7 days
    var weeks = [];
    var cur = calStart;
    while(cur <= calEnd) {
      var week = [];
      for(var i = 0; i < 7; i++) {
        var inMission = cur >= startDate && cur <= endDate;
        week.push({ date: cur, inMission: inMission });
        cur = addD(cur, 1);
      }
      weeks.push(week);
    }
    return weeks;
  }

  return <div style={{maxWidth:800,margin:"0 auto"}}>{months.map(function(m, mi) {
    var mDays = [];
    var d = m.start;
    while(d <= m.end) { mDays.push(d); d = addD(d, 1); }
    var logged = mDays.filter(function(dd) { return days[dd]; }).length;
    var avgC = logged ? Math.round(mDays.filter(function(dd) { return days[dd]; }).reduce(function(s, dd) { return s + calcComp(days[dd]); }, 0) / logged) : 0;
    var weeks = buildCalWeeks(m.start, m.end);

    return <Card key={mi} style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div><span style={{fontFamily:"'Oxanium',sans-serif",fontSize:14,fontWeight:700,color:"var(--ac)",letterSpacing:2}}>{m.label}</span><span style={{fontSize:11,color:"var(--tx2)",marginLeft:10}}>{fmtDate(m.start)} — {fmtDate(m.end)}</span></div>
        <div style={{fontSize:11,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace"}}>{logged}/{mDays.length} | {avgC}%</div>
      </div>

      {/* Day of week headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
        {DAYNAMES.map(function(dn) {
          return <div key={dn} style={{textAlign:"center",fontSize:9,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace",padding:"2px 0"}}>{dn}</div>;
        })}
      </div>

      {/* Calendar grid */}
      {weeks.map(function(wk, wi) {
        return <div key={wi} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
          {wk.map(function(cell, ci) {
            var dd = cell.date;
            var inM = cell.inMission;
            var day = inM ? days[dd] : null;
            var comp = day ? calcComp(day) : 0;
            var isT = dd === todayStr();
            var dtObj = new Date(dd + "T12:00:00");
            var dateNum = dtObj.getDate();

            if(!inM) {
              return <div key={ci} style={{aspectRatio:"1",borderRadius:4,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:"#1a1a2a"}}>{dateNum}</div>;
            }

            var alpha = Math.round((comp / 100) * 200 + 20).toString(16).padStart(2, "0");
            return <div key={ci} onClick={function() { p.onSelectDay(dd); }} title={dd + "\n" + comp + "%"} style={{
              aspectRatio:"1", borderRadius:4, cursor:"pointer",
              background: accent + alpha,
              border: isT ? "2px solid " + accent : "1px solid " + (comp > 0 ? accent + "30" : "var(--brd)"),
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:9, fontFamily:"'JetBrains Mono',monospace",
              color: comp > 60 ? "#000" : "var(--tx2)", transition:"all .15s"
            }}>{dateNum}</div>;
          })}
        </div>;
      })}
    </Card>;
  })}</div>;
}

// --- TODAY PAGE ---
function TodayPage(p) {
  var day=p.day; var setDay=p.setDay; var pillars=p.pillars; var accent=p.accent; var favQ=p.favQ; var setFavQ=p.setFavQ;
  var [activated,setActivated]=useState(false);
  if(!day) return null;
  function u(k,v){setDay(function(d){return Object.assign({},d,{[k]:v});});}
  function uPM(i,k,v){setDay(function(d){var pm=d.power_moves.slice();pm[i]=Object.assign({},pm[i],{[k]:v});return Object.assign({},d,{power_moves:pm});});}
  function uS(k,v){setDay(function(d){return Object.assign({},d,{scores:Object.assign({},d.scores,{[k]:v})});});}
  function uC(k,v){setDay(function(d){return Object.assign({},d,{checkpoint:Object.assign({},d.checkpoint,{[k]:v})});});}
  function uA(k,v){setDay(function(d){return Object.assign({},d,{alignment:Object.assign({},d.alignment,{[k]:v})});});}
  var comp=calcComp(day); var q=QUOTES[day.quote_idx%QUOTES.length]; var isFav=favQ.indexOf(day.quote_idx)!==-1;
  return <div style={{maxWidth:660,margin:"0 auto"}}>
    <Card style={{marginBottom:14,textAlign:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",inset:0,opacity:0.04,background:"radial-gradient(circle at 50% 50%,var(--ac),transparent 70%)"}}/><p style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:500,color:"var(--ac)",lineHeight:1.8,position:"relative"}}>{'"'+q+'"'}</p><div style={{display:"flex",justifyContent:"center",gap:6,marginTop:8,position:"relative"}}><Btn v="gh" sm onClick={function(){u("quote_idx",Math.floor(Math.random()*QUOTES.length));}}><Ic n="ref" s={12}/></Btn><Btn v="gh" sm onClick={function(){setFavQ(function(f){return isFav?f.filter(function(x){return x!==day.quote_idx;}):f.concat([day.quote_idx]);});}}><Ic n="star" s={12}/><span style={{color:isFav?"var(--ac)":"var(--tx2)",fontSize:11}}>{isFav?"Saved":"Save"}</span></Btn></div></Card>
    <Card style={{marginBottom:14}}><Lbl>Today I Move This</Lbl><input value={day.intention} onChange={function(e){u("intention",e.target.value);}} placeholder="Primary intention..." style={{fontSize:16,fontWeight:600,fontFamily:"'Oxanium',sans-serif",padding:10}}/></Card>
    <Card style={{marginBottom:14}}><Lbl>Power Moves</Lbl>{day.power_moves.map(function(pm,i){var isDone=pm.done;return <div key={pm.id} style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,padding:8,borderRadius:6,background:isDone?accent+"08":"transparent",border:"1px solid "+(isDone?accent+"30":"var(--brd)"),transition:"all .3s"}}><div onClick={function(){uPM(i,"done",!isDone);}} style={{width:24,height:24,borderRadius:5,border:"2px solid "+(isDone?accent:"var(--brd)"),display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,background:isDone?accent:"transparent",transition:"all .3s"}}>{isDone&&<Ic n="chk" s={14}/>}</div><div style={{flex:1,minWidth:0}}><input value={pm.title} onChange={function(e){uPM(i,"title",e.target.value);}} placeholder={"Power Move "+(i+1)} style={{border:"none",background:"transparent",padding:"2px 4px",fontSize:14,fontWeight:600,textDecoration:isDone?"line-through":"none",opacity:isDone?0.5:1}}/><div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}><select value={pm.priority} onChange={function(e){uPM(i,"priority",e.target.value);}} style={{padding:"1px 6px",fontSize:10,width:"auto"}}>{["S","A","B","C"].map(function(pr){return <option key={pr} value={pr}>{pr}-Tier</option>;})}</select><select value={pm.category} onChange={function(e){uPM(i,"category",e.target.value);}} style={{padding:"1px 6px",fontSize:10,width:"auto"}}>{CATEGORIES.map(function(c){return <option key={c} value={c}>{c}</option>;})}</select></div></div><PBadge p={pm.priority}/></div>;})}{day.power_moves.length<6&&<Btn v="gh" sm onClick={function(){u("power_moves",day.power_moves.concat([{id:uid(),title:"",priority:"B",category:"Career",est:30,done:false}]));}}><Ic n="plus" s={12}/> Add</Btn>}</Card>
    <Card style={{marginBottom:14}}><Lbl>Hourly Planner (6am - 11pm)</Lbl><HourlyPlanner day={day} setDay={setDay}/></Card>
    <Card style={{marginBottom:14}}><Lbl>Wealth Builder</Lbl><input value={day.wealth} onChange={function(e){u("wealth",e.target.value);}} placeholder="One focused income action..."/></Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}><Card><Lbl>Energy + Body</Lbl><Tog value={day.workout} onChange={function(v){u("workout",v);}} label="Workout"/><div style={{marginTop:6}}><span style={{fontSize:11,color:"var(--tx2)"}}>Sleep hrs</span><input type="number" value={day.sleep} onChange={function(e){u("sleep",Number(e.target.value));}} min={0} max={14} style={{marginTop:2}}/></div></Card><Card><Lbl>Spiritual Anchor</Lbl><Tog value={day.prayer} onChange={function(v){u("prayer",v);}} label="Prayer"/><Tog value={day.reflection} onChange={function(v){u("reflection",v);}} label="Reflection"/><div style={{marginTop:4}}><input value={day.gratitude} onChange={function(e){u("gratitude",e.target.value);}} placeholder="Grateful for..." style={{fontSize:12}}/></div></Card></div>
    <Card style={{marginBottom:14}}><Lbl>Operator Scores</Lbl><Sld value={day.scores.focus} onChange={function(v){uS("focus",v);}} label="Focus"/><Sld value={day.scores.discipline} onChange={function(v){uS("discipline",v);}} label="Discipline"/><Sld value={day.scores.energy} onChange={function(v){uS("energy",v);}} label="Energy"/></Card>
    <Card style={{marginBottom:14}}><Lbl>Pillar Alignment</Lbl><div style={{display:"grid",gap:8}}>{pillars.map(function(pl){var val=(day.alignment&&day.alignment[pl])||0;return <div key={pl} style={{padding:"8px 12px",borderRadius:6,background:"var(--bg3)"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12}}>{pl}</span><span style={{fontSize:11,fontFamily:"'Oxanium',sans-serif",fontWeight:700,color:val>=4?accent:val>=2?"var(--tx)":"var(--tx2)"}}>{val}/5</span></div><div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(function(v){var filled=val>=v;var c=v<=2?"#ff003c":v<=3?"#ff6b00":v<=4?accent:"#39ff14";return <div key={v} onClick={function(){uA(pl,val===v?0:v);}} style={{flex:1,height:8,borderRadius:4,cursor:"pointer",background:filled?c:"var(--bg4)",transition:"all .2s",boxShadow:filled?"0 0 6px "+c+"40":"none"}}/>;})}</div></div>;})}</div></Card>
    <Card style={{marginBottom:14}}><Lbl>Reality Checkpoint</Lbl><div style={{display:"grid",gap:8}}>{[["win","Win"],["lesson","Lesson"],["trigger","Trigger"]].map(function(arr){return <div key={arr[0]}><span style={{fontSize:11,color:"var(--tx2)"}}>{arr[1]}</span><input value={day.checkpoint[arr[0]]} onChange={function(e){uC(arr[0],e.target.value);}} placeholder={arr[1]+"..."} style={{marginTop:2}}/></div>;})}<div><span style={{fontSize:11,color:"var(--tx2)"}}>Response</span><div style={{display:"flex",gap:6,marginTop:3}}>{["responded","reacted"].map(function(r){return <Btn key={r} sm v={day.checkpoint.reaction===r?"ac":"def"} onClick={function(){uC("reaction",r);}}>{r==="responded"?"Responded":"Reacted"}</Btn>;})}</div></div></div></Card>
    <Card style={{marginBottom:14,textAlign:"center"}}><Lbl>Day Completion</Lbl><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:34,fontWeight:800,color:comp>=80?"var(--ac)":"var(--tx)",marginBottom:10}}>{comp}%</div><Bar pct={comp} h={8}/>{!day.completed&&comp>=50&&<Btn v="ac" style={{marginTop:14,width:"100%"}} onClick={function(){u("completed",true);setActivated(true);setTimeout(function(){setActivated(false);},2000);}}><Ic n="zap" s={14}/> ACTIVATE DAY COMPLETE</Btn>}{day.completed&&<div style={{marginTop:14,fontFamily:"'Oxanium',sans-serif",fontSize:13,color:"var(--ac)",letterSpacing:2}}>DAY ACTIVATED</div>}</Card>
    {activated&&<div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",background:accent+"10",animation:"fadeIn .3s ease"}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:22,fontWeight:800,color:accent,letterSpacing:5,textShadow:"0 0 30px "+accent}}>DAY ACTIVATED</div></div>}
  </div>;
}

// ============================================================
// JOURNALS
// ============================================================
function TradeJournal(p) {
  var trades=p.trades; var setTrades=p.setTrades; var accent=p.accent;
  var [showForm,setShowForm]=useState(false);
  var [editId,setEditId]=useState(null);
  var sorted=trades.slice().sort(function(a,b){return b.date.localeCompare(a.date);});
  var totalPnl=trades.reduce(function(s,t){return s+(parseFloat(t.pnl)||0);},0);
  var wins=trades.filter(function(t){return parseFloat(t.pnl)>0;}).length;
  var losses=trades.filter(function(t){return parseFloat(t.pnl)<0;}).length;
  var winRate=wins+losses>0?Math.round((wins/(wins+losses))*100):0;

  function addTrade(){var t=newTrade();setTrades(function(prev){return prev.concat([t]);});setEditId(t.id);setShowForm(true);}
  function updateTrade(id,k,v){setTrades(function(prev){return prev.map(function(t){return t.id===id?Object.assign({},t,{[k]:v}):t;});});}
  function deleteTrade(id){setTrades(function(prev){return prev.filter(function(t){return t.id!==id;});});setEditId(null);setShowForm(false);}

  var editing=editId?trades.find(function(t){return t.id===editId;}):null;

  return <div>
    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
      {[{l:"Trades",v:trades.length},{l:"Win Rate",v:winRate+"%"},{l:"Wins/Losses",v:wins+"/"+losses},{l:"Total P&L",v:(totalPnl>=0?"+":"")+totalPnl.toFixed(2)}].map(function(s,i){return <Card key={i} style={{textAlign:"center",padding:10}}><div style={{fontSize:9,color:"var(--tx2)",textTransform:"uppercase",letterSpacing:1,fontFamily:"'JetBrains Mono',monospace"}}>{s.l}</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:700,color:i===3?(totalPnl>=0?"#39ff14":"#ff003c"):"var(--ac)",marginTop:3}}>{s.v}</div></Card>;})}
    </div>

    {!showForm&&<Btn v="ac" onClick={addTrade} style={{width:"100%",marginBottom:14}}><Ic n="plus" s={14}/> NEW TRADE</Btn>}

    {/* Edit Form */}
    {showForm&&editing&&<Card style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><Lbl>Trade Entry</Lbl><Btn v="gh" sm onClick={function(){setShowForm(false);setEditId(null);}}><Ic n="x" s={12}/></Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Date</span><input type="date" value={editing.date} onChange={function(e){updateTrade(editId,"date",e.target.value);}} style={{marginTop:2}}/></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Pair</span><select value={editing.pair} onChange={function(e){updateTrade(editId,"pair",e.target.value);}} style={{marginTop:2}}>{FOREX_PAIRS.map(function(fp){return <option key={fp} value={fp}>{fp}</option>;})}</select></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Direction</span><div style={{display:"flex",gap:4,marginTop:2}}>{["long","short"].map(function(dir){return <Btn key={dir} sm v={editing.direction===dir?(dir==="long"?"win":"lose"):"def"} onClick={function(){updateTrade(editId,"direction",dir);}} style={{flex:1}}>{dir==="long"?"LONG":"SHORT"}</Btn>;})}</div></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Status</span><div style={{display:"flex",gap:4,marginTop:2}}>{["open","closed"].map(function(st){return <Btn key={st} sm v={editing.status===st?"ac":"def"} onClick={function(){updateTrade(editId,"status",st);}} style={{flex:1}}>{st.toUpperCase()}</Btn>;})}</div></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Entry Price</span><input type="number" step="0.00001" value={editing.entry} onChange={function(e){updateTrade(editId,"entry",e.target.value);}} placeholder="0.00000" style={{marginTop:2}}/></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Exit Price</span><input type="number" step="0.00001" value={editing.exit} onChange={function(e){updateTrade(editId,"exit",e.target.value);}} placeholder="0.00000" style={{marginTop:2}}/></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Lot Size</span><input type="number" step="0.01" value={editing.lots} onChange={function(e){updateTrade(editId,"lots",e.target.value);}} style={{marginTop:2}}/></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>P&L ($)</span><input type="number" step="0.01" value={editing.pnl} onChange={function(e){updateTrade(editId,"pnl",e.target.value);}} placeholder="0.00" style={{marginTop:2}}/></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Setup</span><select value={editing.setup} onChange={function(e){updateTrade(editId,"setup",e.target.value);}} style={{marginTop:2}}>{TRADE_SETUPS.map(function(ts){return <option key={ts} value={ts}>{ts}</option>;})}</select></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Timeframe</span><select value={editing.timeframe} onChange={function(e){updateTrade(editId,"timeframe",e.target.value);}} style={{marginTop:2}}>{TIMEFRAMES.map(function(tf){return <option key={tf} value={tf}>{tf}</option>;})}</select></div>
        <div><span style={{fontSize:11,color:"var(--tx2)"}}>Conviction</span><div style={{display:"flex",gap:3,marginTop:4}}>{[1,2,3,4,5].map(function(v){var isA=editing.conviction===v;return <div key={v} onClick={function(){updateTrade(editId,"conviction",v);}} style={{width:30,height:30,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Oxanium',sans-serif",background:isA?accent:"var(--bg4)",color:isA?"#000":"var(--tx2)",border:"1px solid "+(isA?accent:"var(--brd)")}}>{v}</div>;})}</div></div>
      </div>
      <div style={{marginTop:10}}><span style={{fontSize:11,color:"var(--tx2)"}}>Notes</span><textarea value={editing.notes} onChange={function(e){updateTrade(editId,"notes",e.target.value);}} placeholder="What did you see? Why this entry?" style={{marginTop:2}}/></div>
      <div style={{marginTop:8}}><span style={{fontSize:11,color:"var(--tx2)"}}>Lesson</span><input value={editing.lesson} onChange={function(e){updateTrade(editId,"lesson",e.target.value);}} placeholder="What did this trade teach you?" style={{marginTop:2}}/></div>
      <div style={{display:"flex",gap:8,marginTop:12}}><Btn v="ac" onClick={function(){setShowForm(false);setEditId(null);}} style={{flex:1}}>SAVE TRADE</Btn><Btn v="gh" onClick={function(){deleteTrade(editId);}} style={{color:"#ff003c"}}>DELETE</Btn></div>
    </Card>}

    {/* Trade List */}
    <div style={{display:"grid",gap:6}}>{sorted.filter(function(t){return t.id!==editId||!showForm;}).map(function(t){var pnlNum=parseFloat(t.pnl)||0;var isWin=pnlNum>0;var isLoss=pnlNum<0;return <Card key={t.id} style={{padding:12,cursor:"pointer",borderLeft:"3px solid "+(isWin?"#39ff14":isLoss?"#ff003c":"var(--brd)")}} onClick={function(){setEditId(t.id);setShowForm(true);}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontFamily:"'Oxanium',sans-serif",fontSize:14,fontWeight:700}}>{t.pair}</span><span style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:t.direction==="long"?"#39ff1420":"#ff003c20",color:t.direction==="long"?"#39ff14":"#ff003c",fontWeight:600}}>{t.direction.toUpperCase()}</span><span style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:"var(--bg4)",color:"var(--tx2)"}}>{t.status}</span></div>
        <div style={{fontSize:11,color:"var(--tx2)",marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>{fmtDate(t.date)} | {t.setup} | {t.timeframe}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:700,color:isWin?"#39ff14":isLoss?"#ff003c":"var(--tx2)"}}>{pnlNum>=0?"+":""}{pnlNum.toFixed(2)}</div><div style={{fontSize:10,color:"var(--tx2)"}}>{t.lots} lots</div></div>
      </div>{t.lesson&&<div style={{fontSize:11,color:"var(--tx2)",marginTop:6,fontStyle:"italic",borderTop:"1px solid var(--brd)",paddingTop:6}}>{t.lesson}</div>}
    </Card>;})}</div>
    {trades.length===0&&!showForm&&<div style={{textAlign:"center",color:"var(--tx2)",padding:40,fontSize:13}}>No trades logged. Hit New Trade to start tracking.</div>}
  </div>;
}

function SimpleJournal(p) {
  var entries=p.entries; var setEntries=p.setEntries; var type=p.type; var accent=p.accent;
  var placeholder=type==="life"?"What happened today? What are you thinking?":(type==="spiritual"?"What is God showing you? What are you praying for?":"What business moves are you making? Ideas?");
  var sorted=entries.filter(function(e){return e.type===type;}).sort(function(a,b){return b.date.localeCompare(a.date);});

  function addEntry(){var e=newJournalEntry(type);setEntries(function(prev){return prev.concat([e]);});}
  function updateEntry(id,k,v){setEntries(function(prev){return prev.map(function(e){return e.id===id?Object.assign({},e,{[k]:v}):e;});});}
  function deleteEntry(id){setEntries(function(prev){return prev.filter(function(e){return e.id!==id;});});}

  return <div>
    <Btn v="ac" onClick={addEntry} style={{width:"100%",marginBottom:14}}><Ic n="plus" s={14}/> NEW ENTRY</Btn>
    <div style={{display:"grid",gap:10}}>{sorted.map(function(e){return <Card key={e.id} style={{padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"var(--ac)"}}>{fmtDateFull(e.date)}</span>
        <Btn v="gh" sm onClick={function(){deleteEntry(e.id);}}><Ic n="x" s={12}/></Btn>
      </div>
      <textarea value={e.content} onChange={function(ev){updateEntry(e.id,"content",ev.target.value);}} placeholder={placeholder} style={{minHeight:100,fontSize:14,lineHeight:1.7}}/>
      <div style={{marginTop:6}}><input value={e.tags||""} onChange={function(ev){updateEntry(e.id,"tags",ev.target.value);}} placeholder="Tags (comma separated)..." style={{fontSize:12}}/></div>
    </Card>;})}</div>
    {sorted.length===0&&<div style={{textAlign:"center",color:"var(--tx2)",padding:40,fontSize:13}}>No entries yet. Start writing.</div>}
  </div>;
}

function JournalsPage(p) {
  var [tab,setTab]=useState("trade");
  var tabs=[{id:"trade",label:"Trade"},{id:"life",label:"Life"},{id:"spiritual",label:"Spiritual"},{id:"business",label:"Business"}];
  return <div style={{maxWidth:700,margin:"0 auto"}}>
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:700,color:"var(--ac)",letterSpacing:2,marginBottom:10}}>JOURNALS</div>
    <TabBar tabs={tabs} active={tab} onChange={setTab}/>
    {tab==="trade"&&<TradeJournal trades={p.trades} setTrades={p.setTrades} accent={p.accent}/>}
    {tab==="life"&&<SimpleJournal entries={p.journals} setEntries={p.setJournals} type="life" accent={p.accent}/>}
    {tab==="spiritual"&&<SimpleJournal entries={p.journals} setEntries={p.setJournals} type="spiritual" accent={p.accent}/>}
    {tab==="business"&&<SimpleJournal entries={p.journals} setEntries={p.setJournals} type="business" accent={p.accent}/>}
  </div>;
}

// --- DASHBOARD ---
function DashboardPage(p) {
  var mission=p.mission; var days=p.days; var pillars=p.pillars; var accent=p.accent; if(!mission) return null;
  var td=todayStr(); var dayNum=Math.min(90,Math.max(1,daysBtwn(mission.start,td)+1)); var remaining=Math.max(0,90-dayNum);
  var allD=Object.values(days).filter(function(d){return d.mid===mission.id;});
  var streak=0; var sd=td; while(days[sd]&&days[sd].completed){streak++;sd=addD(sd,-1);}
  var last7=allD.filter(function(d){var diff=daysBtwn(d.date,td);return diff>=0&&diff<7;});
  function avgA(arr,fn){return arr.length?Math.round(arr.reduce(function(s,d){return s+fn(d);},0)/arr.length):0;}
  var comp7=avgA(last7,calcComp); var compAll=avgA(allD,calcComp); var totalXP=allD.reduce(function(s,d){return s+calcXP(d);},0); var level=Math.floor(totalXP/500); var xpIn=totalXP%500;
  var pAvgs=pillars.map(function(pl){var vals=allD.map(function(d){return(d.alignment&&d.alignment[pl])||0;});return{name:pl,avg:vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:0};});
  var weakest=pAvgs.reduce(function(mn,pl){return pl.avg<mn.avg?pl:mn;},pAvgs[0]);
  var intel=generateIntel(days,mission,pillars).slice(0,3);
  var ic={win:"#39ff14",warning:"#ff6b00",alert:"#ff003c",momentum:"var(--ac)",pattern:"#bf00ff",info:"var(--tx2)"};
  return <div style={{maxWidth:700,margin:"0 auto"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>{[{l:"Day",v:dayNum+"/90"},{l:"Streak",v:streak+"d"},{l:"7d Avg",v:comp7+"%"},{l:"Level",v:"LVL "+level}].map(function(s,i){return <Card key={i} style={{textAlign:"center",padding:12}}><Lbl>{s.l}</Lbl><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:20,fontWeight:700,color:"var(--ac)",marginTop:3}}>{s.v}</div></Card>;})}</div>
    <Card style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Lbl>XP</Lbl><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"var(--tx2)"}}>{totalXP} XP | {500-xpIn} to next</span></div><Bar pct={(xpIn/500)*100} h={6}/></Card>
    <Card style={{marginBottom:14}}><Lbl>Operator Intel</Lbl><div style={{display:"grid",gap:8,marginTop:6}}>{intel.map(function(ins,i){return <div key={i} style={{padding:"10px 12px",borderRadius:6,background:"var(--bg3)",borderLeft:"3px solid "+(ic[ins.type]||"var(--tx2)"),fontSize:13,lineHeight:1.6}}>{ins.msg}</div>;})}</div></Card>
    <Card style={{marginBottom:14}}><Lbl>Pillar Alignment</Lbl><div style={{display:"grid",gap:6}}>{pAvgs.map(function(pl){var isW=pl===weakest;return <div key={pl.name}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}><span style={{color:isW?"#ff003c":"var(--tx2)"}}>{pl.name}{isW?" !":""}</span><span style={{fontFamily:"'Oxanium',sans-serif",fontSize:11}}>{pl.avg.toFixed(1)}/5</span></div><Bar pct={(pl.avg/5)*100} h={3} color={isW?"#ff003c":accent}/></div>;})}</div></Card>
    <Card><Lbl>Avg Scores (7d)</Lbl>{["focus","discipline","energy"].map(function(k){var v=last7.length?(last7.reduce(function(s,d){return s+d.scores[k];},0)/last7.length).toFixed(1):"0";return <div key={k} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:2}}><span style={{color:"var(--tx2)",textTransform:"capitalize"}}>{k}</span><span style={{fontFamily:"'Oxanium',sans-serif",color:"var(--ac)"}}>{v}</span></div><Bar pct={parseFloat(v)*10} h={3}/></div>;})}</Card>
  </div>;
}

// --- INTEL ---
function IntelPage(p) {
  var intel=generateIntel(p.days,p.mission,p.pillars);
  var colors={win:"#39ff14",warning:"#ff6b00",alert:"#ff003c",momentum:"var(--ac)",pattern:"#bf00ff",info:"var(--tx2)",insight:"#00e5ff",reset:"#ff003c",welcome:"var(--ac)",trend_up:"#39ff14",trend_down:"#ff6b00",next:"#ffea00",quote:"#bf00ff"};
  var labels={win:"WIN",warning:"HEADS UP",alert:"ALERT",momentum:"MOMENTUM",pattern:"PATTERN",info:"STATUS",insight:"INSIGHT",reset:"RESET NOW",welcome:"WELCOME",trend_up:"TRENDING UP",trend_down:"TRENDING DOWN",next:"NEXT MOVES",quote:"REAL TALK"};
  return <div style={{maxWidth:660,margin:"0 auto"}}>
    <Card style={{marginBottom:14,textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,opacity:0.04,background:"radial-gradient(circle at 50% 50%,var(--ac),transparent 70%)"}}/>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:700,color:"var(--ac)",letterSpacing:2,marginBottom:4,position:"relative"}}>OPERATOR INTEL</div>
      <div style={{fontSize:12,color:"var(--tx2)",position:"relative"}}>Your personal pattern analyst. Powered by your data.</div>
    </Card>
    <div style={{display:"grid",gap:10}}>
      {intel.map(function(ins,i){
        var c=colors[ins.type]||"var(--tx2)";
        return <Card key={i} style={{borderLeft:"3px solid "+c,padding:"16px 18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:16}}>{ins.icon||"📡"}</span>
            <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:c,letterSpacing:1.5,fontWeight:600}}>{labels[ins.type]||"INTEL"}</span>
          </div>
          <div style={{fontSize:14,lineHeight:1.8,color:"var(--tx)"}}>{ins.msg}</div>
        </Card>;
      })}
    </div>
  </div>;
}

// --- HISTORY ---
function HistoryPage(p) {
  var [q,setQ]=useState("");
  var sorted=Object.values(p.days).sort(function(a,b){return b.date.localeCompare(a.date);});
  var filtered=sorted.filter(function(d){if(!q) return true; var s=q.toLowerCase(); return (d.intention&&d.intention.toLowerCase().indexOf(s)!==-1)||(d.checkpoint&&d.checkpoint.win&&d.checkpoint.win.toLowerCase().indexOf(s)!==-1);});
  return <div style={{maxWidth:660,margin:"0 auto"}}><Card style={{marginBottom:14}}><input value={q} onChange={function(e){setQ(e.target.value);}} placeholder="Search entries..."/></Card><div style={{display:"grid",gap:6}}>{filtered.slice(0,30).map(function(d){return <Card key={d.date} style={{cursor:"pointer",padding:12}} onClick={function(){p.onOpen(d.date);}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"var(--ac)"}}>{fmtDateFull(d.date)}</div><div style={{fontSize:13,marginTop:2,opacity:0.8}}>{d.intention||"No intention"}</div></div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:700,color:calcComp(d)>=80?"var(--ac)":"var(--tx2)"}}>{calcComp(d)}%</div></div></Card>;})}{filtered.length===0&&<div style={{textAlign:"center",color:"var(--tx2)",padding:40}}>No entries.</div>}</div></div>;
}

// --- GUIDE PAGE ---
function GuidePage(p) {
  var accent = p.accent;
  function S(props) { return <div style={Object.assign({marginTop:40},props.style||{})}>{props.children}</div>; }
  function SL(props) { return <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:2.5,color:"var(--ac)",textTransform:"uppercase",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span style={{width:20,height:1,background:"var(--ac)",display:"inline-block"}}/>{props.children}</div>; }
  function Big(props) { return <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(22px,5vw,28px)",fontWeight:800,color:"#fff",lineHeight:1.3,marginBottom:14}}>{props.children}</div>; }
  function Feat(props) { return <div style={{background:"var(--bg2)",border:"1px solid var(--brd)",borderRadius:8,padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:12,marginBottom:8}}><div style={{width:36,height:36,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,background:props.bg||"#00e5ff20"}}>{props.icon}</div><div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:600,color:"var(--tx)",marginBottom:2}}>{props.title}</div><div style={{fontSize:12,color:"var(--tx2)",lineHeight:1.5}}>{props.desc}</div></div></div>; }
  function Step(props) { return <div style={{display:"flex",gap:14,marginBottom:20,alignItems:"flex-start"}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:14,fontWeight:800,color:"#000",background:"var(--ac)",width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>{props.num}</div><div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:14,fontWeight:600,color:"var(--tx)",marginBottom:3}}>{props.title}</div><div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.6}}>{props.desc}</div></div></div>; }
  function Rule(props) { return <Card style={{marginBottom:10,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,var(--ac),transparent)"}}></div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:28,fontWeight:800,color:"var(--ac)",opacity:0.12,position:"absolute",top:8,right:14}}>{props.num}</div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:600,color:"var(--ac)",marginBottom:6}}>{props.title}</div><div style={{fontSize:13,lineHeight:1.7,color:"var(--tx)"}}>{props.desc}</div></Card>; }
  function Quote(props) { return <div style={{textAlign:"center",padding:"28px 16px",margin:"36px 0",position:"relative"}}><div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:60,height:1,background:"linear-gradient(90deg,transparent,var(--ac),transparent)"}}></div><div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:60,height:1,background:"linear-gradient(90deg,transparent,var(--ac),transparent)"}}></div><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:500,color:"var(--ac)",lineHeight:1.7}}>{props.children}</div><div style={{fontSize:11,color:"var(--tx2)",marginTop:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1}}>{props.by}</div></div>; }
  function Divider() { return <div style={{height:1,background:"linear-gradient(90deg,transparent,var(--brd),transparent)",margin:"36px 0"}}/>; }

  return <div style={{maxWidth:640,margin:"0 auto"}}>
    {/* Hero */}
    <div style={{textAlign:"center",padding:"40px 0 30px",position:"relative"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:250,height:250,background:"radial-gradient(circle,var(--ac),transparent 70%)",opacity:0.05,borderRadius:"50%"}}/>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(30px,7vw,42px)",fontWeight:800,letterSpacing:6,color:"var(--ac)",position:"relative",textShadow:"0 0 30px rgba(0,229,255,.2)"}}>AURASZN</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"var(--tx2)",marginTop:4,textTransform:"uppercase"}}>Momentum OS v3</div>
      <div style={{fontSize:18,color:"var(--tx)",marginTop:20,fontWeight:400,lineHeight:1.6}}><span style={{color:"var(--ac)",fontWeight:600}}>Fast track your desired reality.</span><br/>Take back control of your time, your money,<br/>your mind, and <strong style={{color:"#fff"}}>your life</strong>.</div>
    </div>

    <S><SL>Why I Built This</SL><Big>I built this for <span style={{color:"var(--ac)"}}>us</span>.</Big>
    <p style={{color:"var(--tx2)",fontSize:14,marginBottom:12}}>I got tired of using 10 different apps, 5 notebooks, and still feeling like I wasn't locked in. So I built Momentum OS — <span style={{color:"var(--tx)"}}>one system</span> that holds your mission, your daily plan, your trades, your journals, your spiritual walk, your scores, your streaks — everything. All in one place.</p>
    <p style={{color:"var(--tx2)",fontSize:14,marginBottom:12}}>This isn't another productivity app you download and forget about. <span style={{color:"var(--tx)"}}>This is a 90-day contract with yourself.</span> You set the mission. You set the rules. Then you show up every day and the system holds you accountable.</p>
    <p style={{color:"var(--tx2)",fontSize:14}}>No fluff. No ads. No sign up. Just you and the work.</p></S>

    <Quote by="— AuraSzn">"You either drift or you design. We're done drifting."</Quote>

    <S><SL>What You Get</SL><Big>Your entire life. <span style={{color:"var(--ac)"}}>One screen.</span></Big>
    <Feat icon="🎯" bg="#00e5ff20" title="Mission Command" desc="Your 90-day identity, targets, rules, and life pillars. Loads every time you open the app. So you never forget who you said you'd become."/>
    <Feat icon="⚡" bg="#ff003c20" title="Daily Operator Mode" desc="Hourly planner. Power moves. Focus, discipline, and energy scores. Reality checkpoint. This is how you win the day before the world even wakes up."/>
    <Feat icon="📊" bg="#39ff1420" title="The 90-Day Mountain" desc="A live animated climb showing exactly where you are on your mission. Watch that dot move up every day you show up. Start at the bottom. Finish at the summit."/>
    <Feat icon="📈" bg="#ff6b0020" title="Trade Journal" desc="NAS100, EUR/USD, GBP/JPY, XAU/USD — all of them. Entry, exit, P&L, setup, conviction, and the lesson. Your win rate stares right back at you."/>
    <Feat icon="📓" bg="#bf00ff20" title="Journals That Matter" desc="Life journal. Spiritual journal. Business journal. Write what God's showing you. Write what you're building. Write what you're becoming."/>
    <Feat icon="🧠" bg="#ffea0020" title="Intel Engine" desc="The system reads YOUR patterns and tells you the truth. Which pillars you're neglecting. Where your focus is slipping. What's actually working. Data doesn't lie."/>
    </S>

    <Divider/>

    <S><SL>Getting Started</SL><Big>Stop overthinking. <span style={{color:"var(--ac)"}}>Start operating.</span></Big>
    <Step num="1" title="You're already in" desc="You opened the app. You saw the boot sequence. You set your mission. Step one is done. You're ahead of 99% of people who just talk about changing."/>
    <Step num="2" title="Explore the tabs" desc="Mission is your command center. Day is where you execute. Week shows your progress and mountain climb. Journals is where you log trades, prayers, ideas, and reflections. Stats shows your streaks and XP. Intel reads your patterns. It's all here."/>
    <Step num="3" title="Show up tomorrow. And the day after that." desc="Open this app every morning. Plan your hours. Execute your power moves. Score yourself honestly. Log your wins, your trades, your prayers, your lessons. Do it for 90 days straight and watch what happens to your reality."/>
    <div style={{background:"var(--ac)",color:"#000",borderRadius:8,padding:"14px 18px",marginTop:14,fontSize:13,fontWeight:500}}><strong>Add to home screen:</strong> iPhone — Safari → Share → "Add to Home Screen." Android — Chrome → three dots → "Add to Home Screen." Now it lives on your phone like a real app. Open it every morning like you mean it.</div>
    </S>

    <Divider/>

    <S><SL>Your Data</SL><Big>This is <span style={{color:"var(--ac)"}}>your</span> personal system.</Big>
    <p style={{color:"var(--tx2)",fontSize:14,marginBottom:12}}>Everything you write in here — your mission, your journal entries, your trades, your scores — saves automatically on <span style={{color:"var(--tx)"}}>your device only</span>. Nobody else can see your data. Not me, not anyone. This is 100% private and personal to you.</p>
    <Card><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:600,color:"var(--ac)",marginBottom:6}}>Keep your data safe</div><div style={{fontSize:13,lineHeight:1.8}}>Your data lives in your browser on whatever device you're using right now. So here's what you need to know:<br/><br/><span style={{color:"var(--ac)",fontWeight:600}}>→</span> <span style={{color:"var(--tx)"}}>Always use the same browser.</span> If you opened this in Safari, always come back to Safari. Same with Chrome.<br/><span style={{color:"var(--ac)",fontWeight:600}}>→</span> <span style={{color:"var(--tx)"}}>Don't clear your browser data / cache.</span> That's where your entries live. Clear it and it's gone.<br/><span style={{color:"var(--ac)",fontWeight:600}}>→</span> <span style={{color:"var(--tx)"}}>Back it up every Sunday.</span> Go to Settings → Export Backup. It downloads a small file with everything. If anything ever happens — new phone, cleared cache, whatever — you just import that file and you're right back where you left off.<br/><br/>It takes 2 seconds. Stay on top of it. Protect your work.</div><div style={{color:"var(--tx2)",fontSize:11,marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>Settings tab → Export Backup → Save the file somewhere safe</div></Card>
    </S>

    <Divider/>

    <S><SL>The Code</SL><Big>Rules for the next <span style={{color:"var(--ac)"}}>90 days</span>.</Big>
    <Rule num="01" title="No zero days. Ever." desc="Even on your worst day — open the app. Log one thing. One power move. One journal sentence. One score. The chain is everything. One zero day becomes two. Two becomes a week. A week becomes 'I'll start over next month.' Nah. Not us. Not this time."/>
    <Rule num="02" title="Be brutally honest with yourself." desc="When you score your focus a 3, own it. When your trade was emotional, write that. When you skipped prayer, log it. This system only works if you tell it the truth. You're not performing for anyone. You're building yourself from the inside out."/>
    <Rule num="03" title="Use the journals. Seriously." desc="Your trade journal will reveal patterns that are either costing you money or making you money. Your spiritual journal will show you growth you couldn't feel in the moment. Your life journal is where breakthroughs get documented. The people who write are the people who see clearly."/>
    <Rule num="04" title="Trust the compound effect." desc="Day 3 feels pointless. Day 7 feels forced. Day 14 starts feeling like a habit. Day 30 feels like real momentum. Day 60 feels like a whole new identity. Day 90 — you won't recognize the old version. But you have to get through the boring middle. That's where champions are built."/>
    <Rule num="05" title="Don't compare. Just execute." desc="This isn't a competition. Your 90 days are YOUR 90 days. What matters is you're showing up when nobody's watching. Consistency beats intensity every single time."/>
    </S>

    <Quote by="— Choose wisely">"Hard decisions today. Easy life tomorrow. Easy decisions today. Hard life forever."</Quote>

    <div style={{textAlign:"center",marginTop:40}}>
      <SL style={{justifyContent:"center"}}>Day 1</SL>
      <Big style={{textAlign:"center"}}>Your future self is watching.<br/><span style={{color:"var(--ac)"}}>Make them proud.</span></Big>
      <p style={{color:"var(--tx2)",marginTop:12,fontSize:14}}>The version of you that wins already exists somewhere inside you. It's time to sync up with that person.</p>
      <p style={{color:"var(--tx)",marginTop:12,fontSize:14,fontWeight:500}}>Go to Mission. Set your identity. Activate. I'll see you on the other side of 90 days.</p>
      <p style={{color:"var(--tx2)",marginTop:6,fontSize:12}}>— AuraSzn</p>
      <div style={{marginTop:30,fontFamily:"'Oxanium',sans-serif",fontSize:11,color:"var(--ac)",letterSpacing:3}}>BUILT BY AURASZN. FOR THE 1% WHO ACTUALLY DO THE WORK.</div>
    </div>
  </div>;
}

// --- SETTINGS ---
function SettingsPage(p) {
  var [imp,setImp]=useState("");
  function doExport(){var b=new Blob([JSON.stringify(p.allData,null,2)],{type:"application/json"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="auraszn-"+todayStr()+".json";a.click();URL.revokeObjectURL(u);}
  function doImport(){try{p.onImport(JSON.parse(imp));setImp("");}catch(e){alert("Invalid JSON");}}
  return <div style={{maxWidth:560,margin:"0 auto"}}>
    <Card style={{marginBottom:14}}><Lbl>Accent Color</Lbl><div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>{NEON_PALETTE.map(function(c){return <div key={c} onClick={function(){p.setAccent(c);}} style={{width:36,height:36,borderRadius:6,background:c,cursor:"pointer",border:p.accent===c?"3px solid #fff":"2px solid transparent",transition:"all .2s"}}/>;})}</div></Card>
    <Card style={{marginBottom:14}}><Lbl>Data</Lbl><div style={{marginBottom:10}}><Btn v="def" onClick={doExport}><Ic n="dl" s={12}/> Export Backup</Btn></div><textarea value={imp} onChange={function(e){setImp(e.target.value);}} placeholder="Paste JSON backup..." style={{minHeight:60,marginBottom:6}}/><Btn v="def" sm onClick={doImport} disabled={!imp}><Ic n="ul" s={12}/> Import</Btn></Card>
    <Card><Lbl>Mission Control</Lbl><p style={{fontSize:12,color:"var(--tx2)",marginBottom:10}}>Start a new 90-day mission.</p><Btn v="ac" onClick={p.onNewMission}><Ic n="zap" s={12}/> New Mission</Btn></Card>
  </div>;
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  var [booted,setBooted]=useState(false);
  var [loading,setLoading]=useState(true);
  var [page,setPage]=useState("mission");
  var [mission,setMission]=useState(null);
  var [days,setDays]=useState({});
  var [accent,setAccent]=useState("#00e5ff");
  var [pillars,setPillars]=useState(DEFAULT_PILLARS);
  var [favQ,setFavQ]=useState([]);
  var [viewDate,setViewDate]=useState(todayStr());
  var [trades,setTrades]=useState([]);
  var [journals,setJournals]=useState([]);
  var saveRef=useRef(null);

  useEffect(function(){(async function(){try{
    var m = await sGet("mission");
    if(m && m.start && !isValidDate(m.start)) { await sClear(); m = null; }
    var d = await sGet("days");
    if(d && typeof d === "object") { var keys = Object.keys(d); if(keys.length > 0 && !isValidDate(keys[0])) { await sClear(); d = null; m = null; } }
    var a = await sGet("accent");
    var p = await sGet("pillars");
    var f = await sGet("favQ");
    var t = await sGet("trades");
    var j = await sGet("journals");
    if(m) setMission(m); if(d) setDays(d); if(a) setAccent(a); if(p) setPillars(p); if(f) setFavQ(f);
    if(t) setTrades(t); if(j) setJournals(j);
  }catch(e){ await sClear(); }setLoading(false);})();},[]);

  useEffect(function(){if(loading) return;if(saveRef.current) clearTimeout(saveRef.current);saveRef.current=setTimeout(function(){sSet("mission",mission);sSet("days",days);sSet("accent",accent);sSet("pillars",pillars);sSet("favQ",favQ);sSet("trades",trades);sSet("journals",journals);},400);},[mission,days,accent,pillars,favQ,trades,journals,loading]);

  useEffect(function(){if(!mission||loading) return;var td=todayStr();if(!days[td]) setDays(function(prev){var n=Object.assign({},prev);n[td]=newDay(td,mission.id);return n;});},[mission,loading]);
  useEffect(function(){if(!mission||loading) return;if(!days[viewDate]) setDays(function(prev){var n=Object.assign({},prev);n[viewDate]=newDay(viewDate,mission.id);return n;});},[viewDate,mission,loading]);

  var curDay=days[viewDate];
  function setCurDay(fn){setDays(function(prev){var updated=typeof fn==="function"?fn(prev[viewDate]):fn;var n=Object.assign({},prev);n[viewDate]=updated;return n;});}
  function openDay(d){setViewDate(d);setPage("today");}
  var allData={mission:mission,days:days,accent:accent,pillars:pillars,favQ:favQ,trades:trades,journals:journals};
  function handleImport(d){if(d.mission)setMission(d.mission);if(d.days)setDays(d.days);if(d.accent)setAccent(d.accent);if(d.pillars)setPillars(d.pillars);if(d.favQ)setFavQ(d.favQ);if(d.trades)setTrades(d.trades);if(d.journals)setJournals(d.journals);}

  var bootIdentity = mission ? (mission.identity || "") : "";
  var bootDayNum = mission ? Math.min(90, Math.max(1, daysBtwn(mission.start, todayStr()) + 1)) : 1;

  if(!booted) return <><Styles accent={accent}/><Boot onDone={function(){setBooted(true);}} identity={bootIdentity} dayNum={bootDayNum}/></>;
  if(loading) return <><Styles accent={accent}/><div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'JetBrains Mono',monospace",color:"var(--tx2)"}}>Loading...</div></>;
  if(!mission) return <><Styles accent={accent}/><Setup onSave={function(m){setMission(m);setPage("mission");}}/></>;

  var NAV=[
    {id:"mission",label:"Mission",icon:"flag"},
    {id:"today",label:"Day",icon:"zap"},
    {id:"week",label:"Week",icon:"week"},
    {id:"month",label:"90 Days",icon:"grid"},
    {id:"journals",label:"Journals",icon:"book"},
    {id:"dash",label:"Stats",icon:"tgt"},
    {id:"intel",label:"Intel",icon:"brain"},
    {id:"history",label:"Log",icon:"hist"},
    {id:"guide",label:"Guide",icon:"book"},
    {id:"settings",label:"Set",icon:"gear"},
  ];

  return <><Styles accent={accent}/><div style={{minHeight:"100vh",background:"var(--bg)",paddingBottom:20}}>
    <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.015,backgroundImage:"linear-gradient(var(--ac) 1px,transparent 1px),linear-gradient(90deg,var(--ac) 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>
    <header style={{position:"sticky",top:0,zIndex:100,background:"#06060cee",borderBottom:"1px solid var(--brd)",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(12px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:800,color:"var(--ac)",letterSpacing:4}}>AURASZN</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"var(--tx2)"}}>MOMENTUM OS</span></div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>{viewDate!==todayStr()&&<Btn v="gh" sm onClick={function(){setViewDate(todayStr());setPage("today");}}><Ic n="back" s={12}/><span style={{fontSize:11}}>Today</span></Btn>}<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"var(--tx2)"}}>{viewDate}</span></div>
    </header>
    <nav style={{display:"flex",justifyContent:"center",gap:2,padding:"6px 8px",borderBottom:"1px solid var(--brd)",background:"var(--bg)",overflowX:"auto",flexWrap:"nowrap"}}>{NAV.map(function(n){var isActive=page===n.id;return <button key={n.id} onClick={function(){setPage(n.id);}} style={{padding:"7px 10px",borderRadius:5,border:"none",background:isActive?accent+"18":"transparent",color:isActive?accent:"var(--tx2)",fontSize:11,fontWeight:600,fontFamily:"'Chakra Petch',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:3,transition:"all .2s",textTransform:"uppercase",whiteSpace:"nowrap",flexShrink:0}}><Ic n={n.icon} s={12}/>{n.label}</button>;})}</nav>
    <main style={{padding:"16px 12px",position:"relative"}}>
      {page==="mission"&&<MissionPage mission={mission} setMission={setMission} accent={accent} pillars={pillars} setPillars={setPillars}/>}
      {page==="today"&&<TodayPage day={curDay} setDay={setCurDay} mission={mission} pillars={pillars} accent={accent} favQ={favQ} setFavQ={setFavQ}/>}
      {page==="week"&&<WeekView days={days} mission={mission} accent={accent} pillars={pillars} onSelectDay={openDay} selectedDate={viewDate}/>}
      {page==="month"&&<MonthView days={days} mission={mission} accent={accent} onSelectDay={openDay}/>}
      {page==="journals"&&<JournalsPage trades={trades} setTrades={setTrades} journals={journals} setJournals={setJournals} accent={accent}/>}
      {page==="dash"&&<DashboardPage mission={mission} days={days} pillars={pillars} accent={accent}/>}
      {page==="intel"&&<IntelPage days={days} mission={mission} pillars={pillars}/>}
      {page==="history"&&<HistoryPage days={days} onOpen={openDay}/>}
      {page==="guide"&&<GuidePage accent={accent}/>}
      {page==="settings"&&<SettingsPage accent={accent} setAccent={setAccent} pillars={pillars} setPillars={setPillars} allData={allData} onImport={handleImport} onNewMission={function(){setMission(null);}}/>}
    </main>
  </div></>;
}
