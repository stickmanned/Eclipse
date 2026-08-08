var m=(i=>(i[i.New=0]="New",i[i.Learning=1]="Learning",i[i.Review=2]="Review",i[i.Relearning=3]="Relearning",i))(m||{}),u=(i=>(i[i.Manual=0]="Manual",i[i.Again=1]="Again",i[i.Hard=2]="Hard",i[i.Good=3]="Good",i[i.Easy=4]="Easy",i))(u||{}),p=class i{static card(t){return{...t,state:i.state(t.state),due:i.time(t.due),last_review:t.last_review?i.time(t.last_review):void 0}}static rating(t){if(typeof t=="string"){let n=t.charAt(0).toUpperCase(),e=t.slice(1).toLowerCase(),a=u[`${n}${e}`];if(a===void 0)throw new Error(`Invalid rating:[${t}]`);return a}else if(typeof t=="number")return t;throw new Error(`Invalid rating:[${t}]`)}static state(t){if(typeof t=="string"){let n=t.charAt(0).toUpperCase(),e=t.slice(1).toLowerCase(),a=m[`${n}${e}`];if(a===void 0)throw new Error(`Invalid state:[${t}]`);return a}else if(typeof t=="number")return t;throw new Error(`Invalid state:[${t}]`)}static time(t){if(typeof t=="object"&&t instanceof Date)return t;if(typeof t=="string"){let n=Date.parse(t);if(isNaN(n))throw new Error(`Invalid date:[${t}]`);return new Date(n)}else if(typeof t=="number")return new Date(t);throw new Error(`Invalid date:[${t}]`)}static review_log(t){return{...t,due:i.time(t.due),rating:i.rating(t.rating),state:i.state(t.state),review:i.time(t.review)}}},rn="4.7.1";Date.prototype.scheduler=function(i,t){return sn(this,i,t)},Date.prototype.diff=function(i,t){return ln(this,i,t)},Date.prototype.format=function(){return cn(this)},Date.prototype.dueFormat=function(i,t,n){return un(this,i,t,n)};function sn(i,t,n){return new Date(n?p.time(i).getTime()+t*24*60*60*1e3:p.time(i).getTime()+t*60*1e3)}function ln(i,t,n){if(!i||!t)throw new Error("Invalid date");let e=p.time(i).getTime()-p.time(t).getTime(),a=0;switch(n){case"days":a=Math.floor(e/(1440*60*1e3));break;case"minutes":a=Math.floor(e/(60*1e3));break}return a}function cn(i){let t=p.time(i),n=t.getFullYear(),e=t.getMonth()+1,a=t.getDate(),o=t.getHours(),s=t.getMinutes(),r=t.getSeconds();return`${n}-${A(e)}-${A(a)} ${A(o)}:${A(s)}:${A(r)}`}function A(i){return i<10?`0${i}`:`${i}`}var Z=[60,60,24,31,12],V=["second","min","hour","day","month","year"];function un(i,t,n,e=V){i=p.time(i),t=p.time(t),e.length!==V.length&&(e=V);let a=i.getTime()-t.getTime(),o;for(a/=1e3,o=0;o<Z.length&&!(a<Z[o]);o++)a/=Z[o];return`${Math.floor(a)}${n?e[o]:""}`}var hn=Object.freeze([u.Again,u.Hard,u.Good,u.Easy]),dn=[{start:2.5,end:7,factor:.15},{start:7,end:20,factor:.1},{start:20,end:1/0,factor:.05}];function gn(i,t,n){let e=1;for(let s of dn)e+=s.factor*Math.max(Math.min(i,s.end)-s.start,0);i=Math.min(i,n);let a=Math.max(2,Math.round(i-e)),o=Math.min(Math.round(i+e),n);return i>t&&(a=Math.max(a,t+1)),a=Math.min(a,o),{min_ivl:a,max_ivl:o}}function z(i,t,n){return Math.min(Math.max(i,t),n)}function pn(i,t){let n=Date.UTC(i.getUTCFullYear(),i.getUTCMonth(),i.getUTCDate()),e=Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate());return Math.floor((e-n)/864e5)}var mn=.9,vn=36500,fn=Object.freeze([.40255,1.18385,3.173,15.69105,7.1949,.5345,1.4604,.0046,1.54575,.1192,1.01925,1.9395,.11,.29605,2.2698,.2315,2.9898,.51655,.6621]),yn=!1,bn=!0,oe=`v${rn} using FSRS-5.0`,k=.01,P=100,ft=Object.freeze([Object.freeze([k,P]),Object.freeze([k,P]),Object.freeze([k,P]),Object.freeze([k,P]),Object.freeze([1,10]),Object.freeze([.001,4]),Object.freeze([.001,4]),Object.freeze([.001,.75]),Object.freeze([0,4.5]),Object.freeze([0,.8]),Object.freeze([.001,3.5]),Object.freeze([.001,5]),Object.freeze([.001,.25]),Object.freeze([.001,.9]),Object.freeze([0,4]),Object.freeze([0,1]),Object.freeze([1,6]),Object.freeze([0,2]),Object.freeze([0,2])]),yt=i=>{let t=[...fn];return i?.w&&(i.w.length===19?t=[...i.w]:i.w.length===17&&(t=i?.w.concat([0,0]),t[4]=+(t[5]*2+t[4]).toFixed(8),t[5]=+(Math.log(t[5]*3+1)/3).toFixed(8),t[6]=+(t[6]+.5).toFixed(8),console.debug("[FSRS V5]auto fill w to 19 length"))),t=t.map((n,e)=>z(n,ft[e][0],ft[e][1])),{request_retention:i?.request_retention||mn,maximum_interval:i?.maximum_interval||vn,w:t,enable_fuzz:i?.enable_fuzz??yn,enable_short_term:i?.enable_short_term??bn}};function R(i,t){let n={due:i?p.time(i):new Date,stability:0,difficulty:0,elapsed_days:0,scheduled_days:0,reps:0,lapses:0,state:m.New,last_review:void 0};return t&&typeof t=="function"?t(n):n}var J=class{c;s0;s1;s2;constructor(t){let n=wn();this.c=1,this.s0=n(" "),this.s1=n(" "),this.s2=n(" "),t==null&&(t=+new Date),this.s0-=n(t),this.s0<0&&(this.s0+=1),this.s1-=n(t),this.s1<0&&(this.s1+=1),this.s2-=n(t),this.s2<0&&(this.s2+=1)}next(){let t=2091639*this.s0+this.c*23283064365386963e-26;return this.s0=this.s1,this.s1=this.s2,this.s2=t-(this.c=t|0),this.s2}set state(t){this.c=t.c,this.s0=t.s0,this.s1=t.s1,this.s2=t.s2}get state(){return{c:this.c,s0:this.s0,s1:this.s1,s2:this.s2}}};function wn(){let i=4022871197;return function(t){t=String(t);for(let n=0;n<t.length;n++){i+=t.charCodeAt(n);let e=.02519603282416938*i;i=e>>>0,e-=i,e*=i,i=e>>>0,e-=i,i+=e*4294967296}return(i>>>0)*23283064365386963e-26}}function kn(i){let t=new J(i),n=()=>t.next();return n.int32=()=>t.next()*4294967296|0,n.double=()=>n()+(n()*2097152|0)*11102230246251565e-32,n.state=()=>t.state,n.importState=e=>(t.state=e,n),n}var bt=-.5,wt=19/81;function xn(i,t){return+Math.pow(1+wt*i/t,bt).toFixed(8)}var Q=class{param;intervalModifier;_seed;constructor(t){this.param=new Proxy(yt(t),this.params_handler_proxy()),this.intervalModifier=this.calculate_interval_modifier(this.param.request_retention)}get interval_modifier(){return this.intervalModifier}set seed(t){this._seed=t}calculate_interval_modifier(t){if(t<=0||t>1)throw new Error("Requested retention rate should be in the range (0,1]");return+((Math.pow(t,1/bt)-1)/wt).toFixed(8)}get parameters(){return this.param}set parameters(t){this.update_parameters(t)}params_handler_proxy(){let t=this;return{set:function(n,e,a){return e==="request_retention"&&Number.isFinite(a)&&(t.intervalModifier=t.calculate_interval_modifier(Number(a))),Reflect.set(n,e,a),!0}}}update_parameters(t){let n=yt(t);for(let e in n)if(e in this.param){let a=e;this.param[a]=n[a]}}init_stability(t){return Math.max(this.param.w[t-1],.1)}init_difficulty(t){return this.constrain_difficulty(this.param.w[4]-Math.exp((t-1)*this.param.w[5])+1)}apply_fuzz(t,n){if(!this.param.enable_fuzz||t<2.5)return Math.round(t);let e=kn(this._seed)(),{min_ivl:a,max_ivl:o}=gn(t,n,this.param.maximum_interval);return Math.floor(e*(o-a+1)+a)}next_interval(t,n){let e=Math.min(Math.max(1,Math.round(t*this.intervalModifier)),this.param.maximum_interval);return this.apply_fuzz(e,n)}linear_damping(t,n){return+(t*(10-n)/9).toFixed(8)}next_difficulty(t,n){let e=-this.param.w[6]*(n-3),a=t+this.linear_damping(e,t);return this.constrain_difficulty(this.mean_reversion(this.init_difficulty(u.Easy),a))}constrain_difficulty(t){return Math.min(Math.max(+t.toFixed(8),1),10)}mean_reversion(t,n){return+(this.param.w[7]*t+(1-this.param.w[7])*n).toFixed(8)}next_recall_stability(t,n,e,a){let o=u.Hard===a?this.param.w[15]:1,s=u.Easy===a?this.param.w[16]:1;return+z(n*(1+Math.exp(this.param.w[8])*(11-t)*Math.pow(n,-this.param.w[9])*(Math.exp((1-e)*this.param.w[10])-1)*o*s),k,36500).toFixed(8)}next_forget_stability(t,n,e){return+z(this.param.w[11]*Math.pow(t,-this.param.w[12])*(Math.pow(n+1,this.param.w[13])-1)*Math.exp((1-e)*this.param.w[14]),k,36500).toFixed(8)}next_short_term_stability(t,n){return+z(t*Math.exp(this.param.w[17]*(n-3+this.param.w[18])),k,36500).toFixed(8)}forgetting_curve=xn;next_state(t,n,e){let{difficulty:a,stability:o}=t??{difficulty:0,stability:0};if(n<0)throw new Error(`Invalid delta_t "${n}"`);if(e<0||e>4)throw new Error(`Invalid grade "${e}"`);if(a===0&&o===0)return{difficulty:this.init_difficulty(e),stability:this.init_stability(e)};if(e===0)return{difficulty:a,stability:o};if(a<1||o<k)throw new Error(`Invalid memory state { difficulty: ${a}, stability: ${o} }`);let s=this.forgetting_curve(n,o),r=this.next_recall_stability(a,o,s,e),l=this.next_forget_stability(a,o,s),c=this.next_short_term_stability(o,e),h=r;if(e===1){let[v,d]=[0,0];this.param.enable_short_term&&(v=this.param.w[17],d=this.param.w[18]);let g=o/Math.exp(v*d);h=z(+g.toFixed(8),k,l)}return n===0&&this.param.enable_short_term&&(h=c),{difficulty:this.next_difficulty(a,e),stability:h}}};function kt(){let i=this.review_time.getTime(),t=this.current.reps,n=this.current.difficulty*this.current.stability;return`${i}_${t}_${n}`}var tt=(i=>(i.SCHEDULER="Scheduler",i.SEED="Seed",i))(tt||{}),$=class{last;current;review_time;next=new Map;algorithm;initSeedStrategy;constructor(t,n,e,a={seed:kt}){this.algorithm=e,this.initSeedStrategy=a.seed.bind(this),this.last=p.card(t),this.current=p.card(t),this.review_time=p.time(n),this.init()}init(){let{state:t,last_review:n}=this.current,e=0;t!==m.New&&n&&(e=pn(n,this.review_time)),this.current.last_review=this.review_time,this.current.elapsed_days=e,this.current.reps+=1,this.algorithm.seed=this.initSeedStrategy()}preview(){return{[u.Again]:this.review(u.Again),[u.Hard]:this.review(u.Hard),[u.Good]:this.review(u.Good),[u.Easy]:this.review(u.Easy),[Symbol.iterator]:this.previewIterator.bind(this)}}*previewIterator(){for(let t of hn)yield this.review(t)}review(t){let{state:n}=this.last,e;switch(n){case m.New:e=this.newState(t);break;case m.Learning:case m.Relearning:e=this.learningState(t);break;case m.Review:e=this.reviewState(t);break}if(e)return e;throw new Error("Invalid grade")}buildLog(t){let{last_review:n,due:e,elapsed_days:a}=this.last;return{rating:t,state:this.current.state,due:n||e,stability:this.current.stability,difficulty:this.current.difficulty,elapsed_days:this.current.elapsed_days,last_elapsed_days:a,scheduled_days:this.current.scheduled_days,review:this.review_time}}},U=class extends ${newState(t){let n=this.next.get(t);if(n)return n;let e=p.card(this.current);switch(e.difficulty=this.algorithm.init_difficulty(t),e.stability=this.algorithm.init_stability(t),t){case u.Again:e.scheduled_days=0,e.due=this.review_time.scheduler(1),e.state=m.Learning;break;case u.Hard:e.scheduled_days=0,e.due=this.review_time.scheduler(5),e.state=m.Learning;break;case u.Good:e.scheduled_days=0,e.due=this.review_time.scheduler(10),e.state=m.Learning;break;case u.Easy:{let o=this.algorithm.next_interval(e.stability,this.current.elapsed_days);e.scheduled_days=o,e.due=this.review_time.scheduler(o,!0),e.state=m.Review;break}default:throw new Error("Invalid grade")}let a={card:e,log:this.buildLog(t)};return this.next.set(t,a),a}learningState(t){let n=this.next.get(t);if(n)return n;let{state:e,difficulty:a,stability:o}=this.last,s=p.card(this.current),r=this.current.elapsed_days;switch(s.difficulty=this.algorithm.next_difficulty(a,t),s.stability=this.algorithm.next_short_term_stability(o,t),t){case u.Again:{s.scheduled_days=0,s.due=this.review_time.scheduler(5,!1),s.state=e;break}case u.Hard:{s.scheduled_days=0,s.due=this.review_time.scheduler(10),s.state=e;break}case u.Good:{let c=this.algorithm.next_interval(s.stability,r);s.scheduled_days=c,s.due=this.review_time.scheduler(c,!0),s.state=m.Review;break}case u.Easy:{let c=this.algorithm.next_short_term_stability(o,u.Good),h=this.algorithm.next_interval(c,r),v=Math.max(this.algorithm.next_interval(s.stability,r),h+1);s.scheduled_days=v,s.due=this.review_time.scheduler(v,!0),s.state=m.Review;break}default:throw new Error("Invalid grade")}let l={card:s,log:this.buildLog(t)};return this.next.set(t,l),l}reviewState(t){let n=this.next.get(t);if(n)return n;let e=this.current.elapsed_days,{difficulty:a,stability:o}=this.last,s=this.algorithm.forgetting_curve(e,o),r=p.card(this.current),l=p.card(this.current),c=p.card(this.current),h=p.card(this.current);this.next_ds(r,l,c,h,a,o,s),this.next_interval(r,l,c,h,e),this.next_state(r,l,c,h),r.lapses+=1;let v={card:r,log:this.buildLog(u.Again)},d={card:l,log:super.buildLog(u.Hard)},g={card:c,log:super.buildLog(u.Good)},f={card:h,log:super.buildLog(u.Easy)};return this.next.set(u.Again,v),this.next.set(u.Hard,d),this.next.set(u.Good,g),this.next.set(u.Easy,f),this.next.get(t)}next_ds(t,n,e,a,o,s,r){t.difficulty=this.algorithm.next_difficulty(o,u.Again);let l=s/Math.exp(this.algorithm.parameters.w[17]*this.algorithm.parameters.w[18]),c=this.algorithm.next_forget_stability(o,s,r);t.stability=z(+l.toFixed(8),k,c),n.difficulty=this.algorithm.next_difficulty(o,u.Hard),n.stability=this.algorithm.next_recall_stability(o,s,r,u.Hard),e.difficulty=this.algorithm.next_difficulty(o,u.Good),e.stability=this.algorithm.next_recall_stability(o,s,r,u.Good),a.difficulty=this.algorithm.next_difficulty(o,u.Easy),a.stability=this.algorithm.next_recall_stability(o,s,r,u.Easy)}next_interval(t,n,e,a,o){let s,r;s=this.algorithm.next_interval(n.stability,o),r=this.algorithm.next_interval(e.stability,o),s=Math.min(s,r),r=Math.max(r,s+1);let l=Math.max(this.algorithm.next_interval(a.stability,o),r+1);t.scheduled_days=0,t.due=this.review_time.scheduler(5),n.scheduled_days=s,n.due=this.review_time.scheduler(s,!0),e.scheduled_days=r,e.due=this.review_time.scheduler(r,!0),a.scheduled_days=l,a.due=this.review_time.scheduler(l,!0)}next_state(t,n,e,a){t.state=m.Relearning,n.state=m.Review,e.state=m.Review,a.state=m.Review}},H=class extends ${newState(t){let n=this.next.get(t);if(n)return n;this.current.scheduled_days=0,this.current.elapsed_days=0;let e=p.card(this.current),a=p.card(this.current),o=p.card(this.current),s=p.card(this.current);return this.init_ds(e,a,o,s),this.next_interval(e,a,o,s,0),this.next_state(e,a,o,s),this.update_next(e,a,o,s),this.next.get(t)}init_ds(t,n,e,a){t.difficulty=this.algorithm.init_difficulty(u.Again),t.stability=this.algorithm.init_stability(u.Again),n.difficulty=this.algorithm.init_difficulty(u.Hard),n.stability=this.algorithm.init_stability(u.Hard),e.difficulty=this.algorithm.init_difficulty(u.Good),e.stability=this.algorithm.init_stability(u.Good),a.difficulty=this.algorithm.init_difficulty(u.Easy),a.stability=this.algorithm.init_stability(u.Easy)}learningState(t){return this.reviewState(t)}reviewState(t){let n=this.next.get(t);if(n)return n;let e=this.current.elapsed_days,{difficulty:a,stability:o}=this.last,s=this.algorithm.forgetting_curve(e,o),r=p.card(this.current),l=p.card(this.current),c=p.card(this.current),h=p.card(this.current);return this.next_ds(r,l,c,h,a,o,s),this.next_interval(r,l,c,h,e),this.next_state(r,l,c,h),r.lapses+=1,this.update_next(r,l,c,h),this.next.get(t)}next_ds(t,n,e,a,o,s,r){t.difficulty=this.algorithm.next_difficulty(o,u.Again);let l=this.algorithm.next_forget_stability(o,s,r);t.stability=z(s,k,l),n.difficulty=this.algorithm.next_difficulty(o,u.Hard),n.stability=this.algorithm.next_recall_stability(o,s,r,u.Hard),e.difficulty=this.algorithm.next_difficulty(o,u.Good),e.stability=this.algorithm.next_recall_stability(o,s,r,u.Good),a.difficulty=this.algorithm.next_difficulty(o,u.Easy),a.stability=this.algorithm.next_recall_stability(o,s,r,u.Easy)}next_interval(t,n,e,a,o){let s,r,l,c;s=this.algorithm.next_interval(t.stability,o),r=this.algorithm.next_interval(n.stability,o),l=this.algorithm.next_interval(e.stability,o),c=this.algorithm.next_interval(a.stability,o),s=Math.min(s,r),r=Math.max(r,s+1),l=Math.max(l,r+1),c=Math.max(c,l+1),t.scheduled_days=s,t.due=this.review_time.scheduler(s,!0),n.scheduled_days=r,n.due=this.review_time.scheduler(r,!0),e.scheduled_days=l,e.due=this.review_time.scheduler(l,!0),a.scheduled_days=c,a.due=this.review_time.scheduler(c,!0)}next_state(t,n,e,a){t.state=m.Review,n.state=m.Review,e.state=m.Review,a.state=m.Review}update_next(t,n,e,a){let o={card:t,log:this.buildLog(u.Again)},s={card:n,log:super.buildLog(u.Hard)},r={card:e,log:super.buildLog(u.Good)},l={card:a,log:super.buildLog(u.Easy)};this.next.set(u.Again,o),this.next.set(u.Hard,s),this.next.set(u.Good,r),this.next.set(u.Easy,l)}},nt=class{fsrs;constructor(t){this.fsrs=t}replay(t,n,e){return this.fsrs.next(t,n,e)}handleManualRating(t,n,e,a,o,s,r){if(typeof n>"u")throw new Error("reschedule: state is required for manual rating");let l,c;if(n===m.New)l={rating:u.Manual,state:n,due:r??e,stability:t.stability,difficulty:t.difficulty,elapsed_days:a,last_elapsed_days:t.elapsed_days,scheduled_days:t.scheduled_days,review:e},c=R(e),c.last_review=e;else{if(typeof r>"u")throw new Error("reschedule: due is required for manual rating");let h=r.diff(e,"days");l={rating:u.Manual,state:t.state,due:t.last_review||t.due,stability:t.stability,difficulty:t.difficulty,elapsed_days:a,last_elapsed_days:t.elapsed_days,scheduled_days:t.scheduled_days,review:e},c={...t,state:n,due:r,last_review:e,stability:o||t.stability,difficulty:s||t.difficulty,elapsed_days:a,scheduled_days:h,reps:t.reps+1}}return{card:c,log:l}}reschedule(t,n){let e=[],a=R(t.due);for(let o of n){let s;if(o.review=p.time(o.review),o.rating===u.Manual){let r=0;a.state!==m.New&&a.last_review&&(r=o.review.diff(a.last_review,"days")),s=this.handleManualRating(a,o.state,o.review,r,o.stability,o.difficulty,o.due?p.time(o.due):void 0)}else s=this.replay(a,o.review,o.rating);e.push(s),a=s.card}return e}calculateManualRecord(t,n,e,a){if(!e)return null;let{card:o,log:s}=e,r=p.card(t);return r.due.getTime()===o.due.getTime()?null:(r.scheduled_days=o.due.diff(r.due,"days"),this.handleManualRating(r,o.state,p.time(n),s.elapsed_days,a?o.stability:void 0,a?o.difficulty:void 0,o.due))}},et=class extends Q{strategyHandler=new Map;Scheduler;constructor(t){super(t);let{enable_short_term:n}=this.parameters;this.Scheduler=n?U:H}params_handler_proxy(){let t=this;return{set:function(n,e,a){return e==="request_retention"&&Number.isFinite(a)?t.intervalModifier=t.calculate_interval_modifier(Number(a)):e==="enable_short_term"&&(t.Scheduler=a===!0?U:H),Reflect.set(n,e,a),!0}}}useStrategy(t,n){return this.strategyHandler.set(t,n),this}clearStrategy(t){return t?this.strategyHandler.delete(t):this.strategyHandler.clear(),this}getScheduler(t,n){let e=this.strategyHandler.get(tt.SEED),a=this.strategyHandler.get(tt.SCHEDULER)||this.Scheduler,o=e||kt;return new a(t,n,this,{seed:o})}repeat(t,n,e){let a=this.getScheduler(t,n).preview();return e&&typeof e=="function"?e(a):a}next(t,n,e,a){let o=this.getScheduler(t,n),s=p.rating(e);if(s===u.Manual)throw new Error("Cannot review a manual rating");let r=o.review(s);return a&&typeof a=="function"?a(r):r}get_retrievability(t,n,e=!0){let a=p.card(t);n=n?p.time(n):new Date;let o=a.state!==m.New?Math.max(n.diff(a.last_review,"days"),0):0,s=a.state!==m.New?this.forgetting_curve(o,+a.stability.toFixed(8)):0;return e?`${(s*100).toFixed(2)}%`:s}rollback(t,n,e){let a=p.card(t),o=p.review_log(n);if(o.rating===u.Manual)throw new Error("Cannot rollback a manual rating");let s,r,l;switch(o.state){case m.New:s=o.due,r=void 0,l=0;break;case m.Learning:case m.Relearning:case m.Review:s=o.review,r=o.due,l=a.lapses-(o.rating===u.Again&&o.state===m.Review?1:0);break}let c={...a,due:s,stability:o.stability,difficulty:o.difficulty,elapsed_days:o.last_elapsed_days,scheduled_days:o.scheduled_days,reps:Math.max(0,a.reps-1),lapses:Math.max(0,l),state:o.state,last_review:r};return e&&typeof e=="function"?e(c):c}forget(t,n,e=!1,a){let o=p.card(t);n=p.time(n);let s=o.state===m.New?0:n.diff(o.last_review,"days"),r={rating:u.Manual,state:o.state,due:o.due,stability:o.stability,difficulty:o.difficulty,elapsed_days:0,last_elapsed_days:o.elapsed_days,scheduled_days:s,review:n},l={card:{...o,due:n,stability:0,difficulty:0,elapsed_days:0,scheduled_days:0,reps:e?0:o.reps,lapses:e?0:o.lapses,state:m.New,last_review:o.last_review},log:r};return a&&typeof a=="function"?a(l):l}reschedule(t,n=[],e={}){let{recordLogHandler:a,reviewsOrderBy:o,skipManual:s=!0,now:r=new Date,update_memory_state:l=!1}=e;o&&typeof o=="function"&&n.sort(o),s&&(n=n.filter(f=>f.rating!==u.Manual));let c=new nt(this),h=c.reschedule(e.first_card||R(),n),v=h.length,d=p.card(t),g=c.calculateManualRecord(d,r,v?h[v-1]:void 0,l);return a&&typeof a=="function"?{collections:h.map(a),reschedule_item:g?a(g):null}:{collections:h,reschedule_item:g}}},xt=i=>new et(i||{});var zt=`\u7684	de	1	u	of|~'s|bull's-eye|target|taxi|really and truly
\u4E86	li\u01CEo	1	y	finish|achieve|understand clearly|bright|clear-sighted
\u6211	w\u01D2	1	r	i|me|my
\u662F	sh\xEC	1	v	be|correct|right|true|very well
\u5728	z\xE0i	1	p	exist|be alive|be at
\u4E0D	b\xF9	1	d	no|not so|not|un-
\u6709	y\u01D2u	1	v	have|there is|having|with|-ful|-ed
\u4ED6	t\u0101	1	r	he|him|other
\u8FD9	zh\xE8	1	r	this|these|the
\u5C31	ji\xF9	1	d	in that case|then|as soon as|immediately after|nothing else but|simply|just|precisely
\u4E2A	g\xE8	1	q	individual
\u4EBA	r\xE9n	1	n	person|people
\u548C	h\xE9	1	cc	and|together with|with|sum|make peace|draw|tie|harmonious
\u6211\u4EEC	w\u01D2 men	1	r	we|us|ourselves|our
\u8981	y\xE0o	1	v	want|need|ask for|will|shall|about to|need to|should
\u8BF4	shu\u014D	1	v	speak|talk|say|explain|comment|scold|tell off|theory
\u597D	h\u01CEo	1	a	good|appropriate|proper|all right|easy to|good to|so|close
\u4E00	y\u012B	1	m	one|single|a|as soon as|entire|whole|all|throughout
\u4E5F	y\u011B	1	d	also|both ... and
\u4F1A	hu\xEC	1	v	can|have the skill|know how to|be likely to|be sure to|meet|get together|meeting
\u90FD	d\u014Du	1	d	all|both|entirely|even|already|at all|capital city|metropolis
\u5BF9	du\xEC	1	p	right|correct|towards|at|for|concerning|regarding|treat
\u4E0A	sh\xE0ng	1	f	up|upper|above|previous|first|climb|get onto|go up
\u5230	d\xE0o	1	v	reach|arrive|leave for|go to|to|until|up to|considerate
\u6765	l\xE1i	1	v	come|for the past|coming|in order to|approximately
\u5F88	h\u011Bn	1	d	quite|very|awfully
\u8FD8	h\xE1i	1	d	still|still in progress|still more|yet|even more|in addition|fairly|passably
\u53BB	q\xF9	1	v	go|go to|last|just passed|send|remove|get rid of|reduce
\u5979	t\u0101	1	r	she
\u7740	zh\xE1o	1	u	touch|come in contact with|feel|be affected by|catch fire|burn|fall asleep|hitting the mark
\u60F3	xi\u01CEng	1	v	think|think of|devise|believe|desire|want|miss
\u6CA1\u6709	m\xE9i y\u01D2u	1	v	haven't|hasn't|doesn't exist|not have|not be
\u7ED9	g\u011Bi	1	p	to|for|for the benefit of|give|allow|do sth|supply|provide
\u80FD	n\xE9ng	1	v	can|be able to|might possibly|ability|energy
\u554A	\xE0	2	y	uhm|ah, ok|expression of recognition|oh, it's you|interjection of surprise|ah|oh|eh
\u90A3	n\xE0	1	r	that|the|those|then|many|beautiful|how
\u4ED6\u4EEC	t\u0101 men	1	r	they
\u628A	b\u01CE	3	p	hold|grasp|handlebar|classifier: handful, bundle, bunch|handle
\u770B	k\xE0n	1	v	see|look at|read|watch|visit|call on|consider|regard as
\u505A	zu\xF2	1	v	make|produce|write|compose|do|engage in|hold|be (an intermediary
\u88AB	b\xE8i	3	p	quilt|cover|suffer
\u8BA9	r\xE0ng	2	v	yield|permit|let sb do sth|have sb do sth|make sb
\u4EC0\u4E48	sh\xE9n me	1	r	what|something|anything
\u4F46	d\xE0n	2	c	but|yet|however|still|merely|only|just
\u81EA\u5DF1	z\xEC j\u01D0	2	r	oneself|one's own
\u4E3A	w\xE9i	2	p	as|take sth as|act as|serve as|behave as|become|be|do
\u53EF\u4EE5	k\u011B y\u01D0	2	v	can|may|possible|able to|not bad|pretty good
\u5427	b\u0101	1	y	bar|puff|bang|...right|...ok|...i presume|smack
\u5F97	d\xE9	2	u	obtain|get|gain|catch|proper|suitable|proud|contented
\u70B9	di\u01CEn	1	qt	point|dot|drop|speck|o'clock|draw a dot|check on a list|choose
\u8FC7	gu\xF2	1	u	cross|go over|pass|celebrate|live|get along|excessively|too-
\u6CA1	m\xF2	1	d	drowned|end|die|inundate|have not|not
\u5927	d\xE0	1	a	big|large|great|older|greatly|freely|fully|father
\u4E0B	xi\xE0	1	v	down|downwards|below|lower|later|next|second|decline
\u4ECE	c\xF3ng	1	p	from|through|via|follow|obey|engage in|never|retainer
\u4E2D	zh\u014Dng	1	f	within|among|in|middle|center|while|during|ok
\u800C	\xE9r	4	cc	and|as well as|and so|but|yet
\u91CC	l\u01D0	1	f	lining|interior|inside|internal|li|neighborhood
\u771F	zh\u0113n	1	d	really|truly|indeed|real|true|genuine
\u73B0\u5728	xi\xE0n z\xE0i	1	t	now|at present|at the moment|modern|current|nowadays
\u5E74	ni\xE1n	1	qt	grain|harvest|year
\u7528	y\xF2ng	1	v	use|employ|have to|eat or drink|expense or outlay|usefulness|hence|therefore
\u591A	du\u014D	1	a	many|much|too many|in excess|... odd|how|multi-|poly-
\u4E24	li\u01CEng	1	m	two|both|some|few
\u5417	m\xE1	1	y	what
\u5929	ti\u0101n	1	qt	day|sky|heaven
\u7B49	d\u011Bng	1	v	class|rank|grade|equal to|same as|wait for|await|et cetera
\u51FA	ch\u016B	1	v	go out|come out|occur|produce|go beyond|rise|put forth|happen
\u5DF2\u7ECF	y\u01D0 j\u012Bng	2	d	already
\u8FD9\u6837	zh\xE8 y\xE0ng	2	r	this kind of|so|this way|like this|such
\u592A	t\xE0i	1	d	highest|greatest|too|very|extremely
\u6700	zu\xEC	1	d	most|-est
\u5982\u679C	r\xFA gu\u01D2	2	c	if|in case|in the event that
\u518D	z\xE0i	1	d	again|once more|re-|second|another|then
\u53C8	y\xF2u	2	d	again|also|both... and|and yet|anyway
\u56E0\u4E3A	y\u012Bn w\xE8i	2	p	because|owing to|on account of
\u53EF	k\u011B	5	v	can|may|able to|-able|approve|permit|suit|certainly
\u5462	ne	1	y	particle signaling a pause|particle indicating strong affirmation|woolen material
\u53EA	zh\u01D0	2	d	only|merely|just|but
\u6B21	c\xEC	1	qv	next in sequence|second|secondary|vice-|sub-|infra-|inferior quality|substandard
\u5C06	ji\u0101ng	5	d	will|shall|use|take|checkmate|general|command|lead
\u5C0F	xi\u01CEo	1	a	small|tiny|few|young
\u77E5\u9053	zh\u012B d\xE0o	1	v	know|become aware of|also pr
\u65F6\u5019	sh\xED hou	1	n	time|length of time|moment|period
\u8D70	z\u01D2u	1	v	walk|go|run|move|visit|leave|go away|die
\u95EE\u9898	w\xE8n t\xED	2	n	question|problem|issue|topic
\u5DE5\u4F5C	g\u014Dng zu\xF2	1	vn	work|operate|job|task
\u4E8B	sh\xEC	1	n	matter|thing|item|work|affair
\u5C31\u662F	ji\xF9 sh\xEC	3	v	exactly|precisely|only|simply|just|even if
\u5B83	t\u0101	2	r	it
\u4F46\u662F	d\xE0n sh\xEC	2	c	but|however
\u540E	h\xF2u	1	f	back|behind|rear|afterwards|after|later|post-|empress
\u65F6	sh\xED	3	g	o'clock|time|when|hour|season|period
\u8BE5	g\u0101i	2	v	should|ought to|probably|must be|deserve|owe|that|above-mentioned
\u5BB6	ji\u0101	1	n	home|family|my
\u4F60\u4EEC	n\u01D0 men	1	r	you
\u524D	qi\xE1n	1	f	front|forward|ahead|first|top|future|ago|before
\u53EF\u80FD	k\u011B n\xE9ng	2	v	might|possible|probable|possibility|probability|maybe|perhaps
\u65F6\u95F4	sh\xED ji\u0101n	1	n	time|period
\u66F4	g\xE8ng	2	d	more|even more|further|still|still more|change or replace|experience|watch
\u600E\u4E48	z\u011Bn me	1	r	how|what|why
\u7231	\xE0i	1	v	love|be fond of|like|affection|be inclined|tend to
\u9700\u8981	x\u016B y\xE0o	3	v	need|want|demand|require|needs
\u5730	d\xEC	1	u	earth|ground|field|place|land|-ly
\u5F00\u59CB	k\u0101i sh\u01D0	3	v	begin|beginning|start|initial
\u8FD9\u4E9B	zh\xE8 xi\u0113	1	r	these
\u624D	c\xE1i	2	d	ability|talent|capable individual|then and only then|just now|only
\u8DDF	g\u0113n	1	p	heel|follow closely|go with|marry sb|with|compared with|to|towards
\u559C\u6B22	x\u01D0 huan	1	v	like|be fond of
\u5403	ch\u012B	1	v	eat|consume|eat at|eradicate|destroy|absorb|suffer
\u8C01	sh\xE9i	1	r	who|also pr
\u4E0E	y\u01D4	6	p	and|give|together with|take part in
\u5E76	b\xECng	3	d	and|furthermore|also|together with|at all|simultaneously|combine|join
\u65B0	x\u012Bn	1	a	new|newly|meso-
\u50CF	xi\xE0ng	2	v	resemble|be like|look as if|such as|appearance|image|portrait|image under a mapping
\u627E	zh\u01CEo	1	v	try to find|look for|call on sb|find|seek|return|give change
\u5FEB	ku\xE0i	1	a	rapid|quick|speed|rate|soon|almost|make haste|clever
\u6253	d\u01CE	1	v	beat|strike|hit|break|type|mix up|build|fight
\u8FD8\u6709	h\xE1i y\u01D2u	1	v	furthermore|in addition|still|also
\u4ECA\u5929	j\u012Bn ti\u0101n	1	t	today|at the present|now
\u5F53	d\u0101ng	2	p	be|act as|manage|withstand|when|during|ought|should
\u6BD4	b\u01D0	1	p	compare|more {adj.} than {noun}|ratio|gesture|belgium|belgian
\u6240\u4EE5	su\u01D2 y\u01D0	2	c	therefore|as a result|so|reason why
\u8BDD	hu\xE0	1	n	dialect|language|spoken words|speech|talk|words|conversation|what sb said
\u6240	su\u01D2	3	u	actually|place|that which
\u4E4B	zh\u012B	7	u	him|her|it
\u8FD8\u662F	h\xE1i shi	1	c	still|had better|unexpectedly|or
\u6708	yu\xE8	1	n	moon|month|monthly
\u89C9\u5F97	ju\xE9 de	1	v	think that|feel that|feel
\u90A3\u4E48	n\xE0 me	2	r	like that|in that way|or so|so|so very much|about|in that case
\u5411	xi\xE0ng	2	p	towards|face|turn towards|direction|support|side with|shortly before|formerly
\u4EE5	y\u01D0	7	p	use|by means of|according to|in order to|because of|at
\u8FD9\u4E48	zh\xE8 me	2	r	so much|this much|how much|this way|like this
\u8BA4\u4E3A	r\xE8n w\xE9i	2	v	believe|think|consider|feel
\u770B\u5230	k\xE0n d\xE0o	1	v	see
\u4E00\u8D77	y\u012B q\u01D0	1	s	in the same place|together|with|altogether
\u8D77\u6765	q\u01D0 lai	1	v	stand up|get up|also pr|indicating completion
\u5E94\u8BE5	y\u012Bng g\u0101i	2	v	ought to|should|must
\u8D77	q\u01D0	1	v	rise|raise|get up|set out|start|appear|launch|initiate
\u4F4D	w\xE8i	2	q	position|location|place|seat|potential
\u5E26	d\xE0i	2	v	band|belt|girdle|ribbon|tire|area|zone|region
\u6B7B	s\u01D0	3	v	die|impassable|uncrossable|inflexible|rigid|extremely|damned
\u51E0	j\u01D0	1	m	how much|how many|several|few|small table|almost
\u89C1	ji\xE0n	1	v	see|meet|appear|interview|opinion|view
\u79CD	zh\u01D2ng	3	q	seed|species|kind|type|plant|grow|cultivate
\u5E0C\u671B	x\u012B w\xE0ng	3	v	hope|wish
\u54E6	\xE9	7	o	chant|oh
\u8F66	ch\u0113	1	n	car|vehicle|machine|shape with a lathe|kangxi radical 159|war chariot|rook
\u4E00\u4E9B	y\u012B xi\u0113	1	mq	some|few|little|slightly ...er
\u627E\u5230	zh\u01CEo d\xE0o	1	v	find
\u53D1\u73B0	f\u0101 xi\xE0n	2	v	notice|become aware of|discover|find|detect|discovery
\u5927\u5BB6	d\xE0 ji\u0101	2	r	everyone|influential family|great expert
\u542C	t\u012Bng	1	v	listen to|hear|heed|obey|can|let be|allow|administer
\u624B	sh\u01D2u	1	n	hand|hold|personal|convenient
\u975E\u5E38	f\u0113i ch\xE1ng	1	d	very|really|unusual|extraordinary
\u5F00	k\u0101i	1	v	open|start|turn on|put in operation|operate|run|boil|write out
\u4E00\u5B9A	y\u012B d\xECng	2	d	surely|certainly|necessarily|fixed|certain|given|particular|must
\u5374	qu\xE8	4	d	but|yet|however|while|go back|decline|retreat|nevertheless
\u53EB	ji\xE0o	1	v	shout|call|order|ask|be called|by
\u4E00\u76F4	y\u012B zh\xED	2	d	straight|continuously|always|all the way through
\u751F\u6D3B	sh\u0113ng hu\xF3	2	vn	live|life|livelihood
\u5B69\u5B50	h\xE1i zi	1	n	child
\u8FD9\u91CC	zh\xE8 l\u01D0	1	r	here
\u53D1\u751F	f\u0101 sh\u0113ng	3	v	happen|occur|take place|break out
\u522B	bi\xE9	1	d	leave|part|differentiate|distinguish|other|another|different|don't
\u4E0D\u8FC7	b\xF9 gu\xF2	2	c	only|merely|no more than|but|however|anyway|cannot be more
\u8BF7	q\u01D0ng	1	v	ask|invite|please|treat|request
\u94B1	qi\xE1n	1	n	coin|money
\u516C\u53F8	g\u014Dng s\u012B	2	n	company|firm|corporation
\u4E0D\u8981	b\xF9 y\xE0o	2	d	don't|must not
\u672C	b\u011Bn	1	r	root|stem|origin|source|this|current|original|inherent
\u7B2C\u4E00	d\xEC y\u012B	2	m	first|number one|primary
\u56DE	hu\xED	1	v	circle|go back|turn around|answer|return|revolve|hui ethnic group|time
\u4E1C\u897F	d\u014Dng xi	1	n	thing|stuff|person|east and west
\u6210	ch\xE9ng	2	v	succeed|finish|complete|accomplish|become|turn into|be all right|ok
\u4E3A\u4E86	w\xE8i le	3	p	for|for the purpose of|in order to
\u4E09	s\u0101n	1	m	three
\u540D	m\xEDng	2	q	name|noun|place|famous
\u4E00\u6837	y\u012B y\xE0ng	1	u	same|like|equal to|same as|just like
\u53EA\u662F	zh\u01D0 sh\xEC	3	d	merely|only|just|nothing but|simply|but|however
\u4E16\u754C	sh\xEC ji\xE8	3	n	world
\u6240\u6709	su\u01D2 y\u01D2u	2	b	all|have|possess|own
\u800C\u4E14	\xE9r qi\u011B	2	c	but also|moreover|in addition|furthermore
\u4E70	m\u01CEi	1	v	buy|purchase
\u91CD\u8981	zh\xF2ng y\xE0o	1	a	important|significant|major
\u5FC5\u987B	b\xEC x\u016B	2	d	have to|must|compulsory|necessarily
\u60C5\u51B5	q\xEDng ku\xE0ng	3	n	circumstances|state of affairs|situation
\u4E8E	y\xFA	6	p	in|at|on|to|toward|vis-\xE0-vis|with regard to|for
\u5566	l\u0101	6	y	chat
\u957F	zh\u01CEng	2	a	chief|head|elder|grow|develop|increase|enhance|length
\u95EE	w\xE8n	1	v	ask|inquire
\u544A\u8BC9	g\xE0o su	1	v	tell|inform|let know|press charges|file a complaint
\u51FA\u6765	ch\u016B l\xE1i	1	v	come out|appear|arise
\u5730\u65B9	d\xEC fang	1	n	area|place|space|room|territory|region|regional|local
\u6700\u540E	zu\xEC h\xF2u	1	f	final|last|finally|ultimate
\u5C81	su\xEC	1	qt	year|years old
\u8001	l\u01CEo	1	a	old|venerable|experienced|of long standing|always|all the time|of the past|very
\u5176\u4ED6	q\xED t\u0101	2	r	other|else|rest
\u6210\u4E3A	ch\xE9ng w\xE9i	2	v	become|turn into
\u4E8B\u60C5	sh\xEC qing	2	n	affair|matter|thing|business
\u884C	x\xEDng	1	v	walk|go|travel|visit|temporary|makeshift|current|in circulation
\u611F\u89C9	g\u01CEn ju\xE9	2	n	feeling|impression|sensation|feel|perceive
\u6BD4\u8D5B	b\u01D0 s\xE0i	3	vn	competition|match|compete
\u7136\u540E	r\xE1n h\xF2u	2	c	then|after that|afterwards
\u62C5\u5FC3	d\u0101n x\u012Bn	4	v	anxious|worried|uneasy|worry|be anxious
\u6761	ti\xE1o	2	q	strip|item|article|clause
\u53F7	h\xE0o	1	q	ordinal number|day of a month|mark|sign|business establishment|size|ship suffix|horn
\u4F4F	zh\xF9	1	v	live|dwell|stay|reside|stop
\u653E	f\xE0ng	1	v	put|place|release|free|let go|let out|set off
\u670B\u53CB	p\xE9ng you	1	n	friend
\u7EE7\u7EED	j\xEC x\xF9	3	v	continue|proceed with|go on with
\u573A	ch\u01CEng	2	qv	stage|scene|threshing floor
\u62FF	n\xE1	1	v	hold|seize|catch|apprehend|take
\u9AD8	g\u0101o	1	a	high|tall|above average|loud|your
\u5FC3	x\u012Bn	3	n	heart|mind|intention|center|core
\u4EF6	ji\xE0n	2	q	item|component
\u6B63	zh\xE8ng	1	d	straight|upright|proper|main|principal|correct|rectify|exactly
\u4E3A\u4EC0\u4E48	w\xE8i sh\xE9n me	2	r	why|for what reason
\u8FDB\u884C	j\xECn x\xEDng	2	v	advance|conduct|underway|in progress|do|carry out|carry on|execute
\u4E4B\u540E	zh\u012B h\xF2u	4	f	after|behind|afterwards|since then
\u5DF2	y\u01D0	3	d	already|stop|then|afterwards
\u5148	xi\u0101n	1	d	early|prior|former|in advance|first
\u6216	hu\xF2	2	c	maybe|perhaps|might|possibly|or
\u5F97\u5230	d\xE9 d\xE0o	1	v	get|obtain|receive
\u5F20	zh\u0101ng	3	q	open up|spread|sheet of paper
\u5173\u7CFB	gu\u0101n xi	3	n	relation|relationship|concern|affect|have to do with|guanxi
\u5185	n\xE8i	3	f	inside|inner|internal|within|interior
\u51FA\u73B0	ch\u016B xi\xE0n	2	v	appear|arise|emerge|show up
\u90A3\u4E9B	n\xE0 xi\u0113	1	r	those
\u5934	t\xF3u	2	n	head|hair style|top|end|beginning or end|stub|remnant|chief
\u51C6\u5907	zh\u01D4n b\xE8i	1	v	preparation|prepare|intend|be about to|reserve
\u603B	z\u01D2ng	3	d	general|overall|sum up|in every case|always|invariably|anyway|after all
\u6C34	shu\u01D0	1	n	water|river|liquid|beverage|additional charges or income
\u4E86\u89E3	li\u01CEo ji\u011B	4	v	understand|realize|find out
\u8FDB	j\xECn	1	v	go forward|advance|go in|enter|put in|submit|take in|admit
\u6BCF	m\u011Bi	3	r	each|every
\u89C1\u5230	ji\xE0n d\xE0o	2	v	see
\u7F8E	m\u011Bi	3	b	beautiful|very satisfactory|good|beautify|be pleased with oneself
\u901A\u8FC7	t\u014Dng gu\xF2	2	p	pass through|get through|adopt|pass|by means of|through|via
\u65E0	w\xFA	4	v	not to have|no|none|not|lack|un-|-less
\u4E00\u5207	y\u012B qi\xE8	3	r	everything|every|all
\u5199	xi\u011B	1	v	write
\u5468	zh\u014Du	2	qt	make a circuit|circle|circumference|lap|cycle|complete|all|all over
\u7531	y\xF3u	3	p	follow|from|because of|due to|by|via|through
\u8FC7\u53BB	gu\xF2 q\xF9	2	v	past|former|previous|go over|pass by
\u53C2\u52A0	c\u0101n ji\u0101	2	v	participate|take part|join
\u4EFB\u4F55	r\xE8n h\xE9	3	r	any|whatever|whichever|whatsoever
\u56FD\u5BB6	gu\xF3 ji\u0101	1	n	country|nation|state
\u7535\u8BDD	di\xE0n hu\xE0	1	n	telephone|phone call|phone number
\u5B89\u5168	\u0101n qu\xE1n	2	an	safe|secure|safety|security
\u7ED3\u679C	ji\xE9 gu\u01D2	2	n	outcome|result|conclusion|in the end|as a result|kill|dispatch|bear fruit
\u51B3\u5B9A	ju\xE9 d\xECng	3	v	decide|resolve|decision|certainly
\u5973	n\u01DA	1	b	female|woman|daughter
\u9001	s\xF2ng	1	v	send|deliver|transmit|give|see off|accompany|go along with
\u5206	f\u0113n	1	t	divide|separate|distribute|allocate|distinguish|branch of|fraction|one tenth
\u9009\u62E9	xu\u01CEn z\xE9	4	v	select|pick|choice|option|alternative
\u53EA\u6709	zh\u01D0 y\u01D2u	3	c	only have|there is only
\u6216\u8005	hu\xF2 zh\u011B	2	c	or|possibly|maybe|perhaps
\u7B11	xi\xE0o	1	v	laugh|smile|laugh at
\u5973\u4EBA	n\u01DA r\xE9n	1	n	woman|wife
\u4E0D\u9519	b\xF9 cu\xF2	2	a	correct|right|not bad|pretty good
\u641E	g\u01CEo	5	v	do|make|go in for|set up|get hold of|take care of
\u5C0F\u65F6	xi\u01CEo sh\xED	1	n	hour
\u5982\u4F55	r\xFA h\xE9	3	r	how|what way|what
\u6B64	c\u01D0	4	r	this|these
\u53D7	sh\xF2u	3	v	receive|accept|suffer|subjected to|bear|stand|pleasant
\u5B8C\u5168	w\xE1n qu\xE1n	2	ad	complete|whole|totally|entirely
\u673A\u4F1A	j\u012B hu\xEC	2	n	opportunity|chance|occasion
\u6709\u4E9B	y\u01D2u xi\u0113	1	r	some|somewhat
\u5B8C	w\xE1n	2	v	finish|be over|whole|complete|entire
\u5E2E	b\u0101ng	1	v	help|assist|support|for sb|hired|side|outer layer|upper
\u65E5	r\xEC	1	t	sun|day
\u522B\u4EBA	bi\xE9 ren	1	r	other people|others|other person
\u5982	r\xFA	6	v	as|as if|such as
\u7AD9	zh\xE0n	1	v	station|stand|halt|stop|website
\u4F7F	sh\u01D0	3	v	make|cause|enable|use|employ|send|envoy|messenger
\u53D1	f\u0101	2	v	send out|show|issue|develop|hair|taiwan pr
\u8BA1\u5212	j\xEC hu\xE0	2	n	plan|project|program|map out
\u5168	qu\xE1n	2	d	all|whole|entire|every|complete
\u53EF\u662F	k\u011B sh\xEC	2	c	but|however|indeed
\u4F5C\u4E3A	zu\xF2 w\xE9i	4	p	one's conduct|deed|activity|accomplishment|achievement|act as|as|qua
\u5176\u5B9E	q\xED sh\xED	3	d	actually|in fact|really
\u8FDE	li\xE1n	3	u	link|join|connect|continuously|in succession|including|company
\u4EE5\u540E	y\u01D0 h\xF2u	2	f	after|later|afterwards|following|later on|in the future
\u8981\u6C42	y\u0101o qi\xFA	2	v	request|require|requirement|stake a claim|ask|demand
\u8DEF	l\xF9	1	n	road|journey|route|line|sort|kind
\u73A9	w\xE1n	2	v	play|have fun|trifle with|toy|sth used for amusement|curio or antique|keep sth for entertainment|taiwan pr
\u7537\u4EBA	n\xE1n r\xE9n	1	n	man|male|men
\u4FE1	x\xECn	2	n	letter|mail|trust|believe|profess faith in|truthful|confidence|at will
\u6B63\u5728	zh\xE8ng z\xE0i	1	d	just at|right in
\u95E8	m\xE9n	1	n	gate|door|gateway|doorway|opening|valve|switch|way to do something
\u961F	du\xEC	2	n	squadron|team|group
\u5F53\u7136	d\u0101ng r\xE1n	3	d	only natural|as it should be|certainly|of course|without doubt
\u63A5	ji\u0113	2	v	receive|answer|meet or welcome sb|connect|catch|join|extend|take over for sb
\u552F\u4E00	w\xE9i y\u012B	5	b	only|sole
\u90E8	b\xF9	3	q	ministry|department|section|part|division|troops|board
\u559D	h\u0113	1	g	drink|shout
\u5B66\u6821	xu\xE9 xi\xE0o	1	n	school
\u7A7F	chu\u0101n	1	v	wear|put on|dress|bore through|pierce|perforate|penetrate|pass through
\u76F8\u4FE1	xi\u0101ng x\xECn	2	v	be convinced|believe|accept sth as true
\u5750	zu\xF2	1	v	sit|take a seat|take|bear fruit
\u82B1	hu\u0101	1	v	flower|blossom|fancy pattern|florid|spend|lecherous|lustful|also pr
\u521A	g\u0101ng	2	d	hard|firm|strong|just|barely|exactly
\u867D\u7136	su\u012B r\xE1n	2	c	although
\u539F\u56E0	yu\xE1n y\u012Bn	2	n	cause|origin|root cause|reason
\u540C	t\xF3ng	6	p	like|same|similar|together|alike|with
\u65E9	z\u01CEo	1	ad	early|morning|good morning|long ago|prematurely
\u6D88\u606F	xi\u0101o xi	3	n	news|information
\u53EA\u8981	zh\u01D0 y\xE0o	2	c	if only|so long as
\u8868\u73B0	bi\u01CEo xi\xE0n	3	v	show|show off|display|manifest|expression|manifestation|performance|behavior
\u4E0D\u540C	b\xF9 t\xF3ng	2	a	different|distinct|not the same|not alike
\u89E3\u51B3	ji\u011B ju\xE9	3	v	solve|resolve|settle|eliminate|wipe out
\u8FDB\u5165	j\xECn r\xF9	2	v	enter|join|go into
\u8EAB\u4E0A	sh\u0113n shang	1	s	on the body|at hand|among
\u5E72	g\u0101n	1	v	dry|dried food|empty|hollow|adoptive|foster|futile|in vain
\u6709\u4EBA	y\u01D2u r\xE9n	2	r	someone|people|anyone|there is someone there|occupied
\u8BA4\u8BC6	r\xE8n shi	1	v	know|recognize|be familiar with|get acquainted with sb|knowledge|understanding|awareness|cognition
\u7761	shu\xEC	1	v	sleep|lie down
\u5206\u949F	f\u0113n zh\u014Dng	2	qt	minute
\u63A5\u53D7	ji\u0113 sh\xF2u	2	v	accept|receive
\u660E\u5929	m\xEDng ti\u0101n	1	t	tomorrow
\u5176\u4E2D	q\xED zh\u014Dng	2	r	among|in|included among these
\u4EBA\u4EEC	r\xE9n men	2	n	people
\u4E4B\u95F4	zh\u012B ji\u0101n	4	f	between|among|amid
\u6210\u529F	ch\xE9ng g\u014Dng	3	a	success|succeed
\u5173\u4E8E	gu\u0101n y\xFA	4	p	pertaining to|concerning|with regard to|about|matter of
\u751A\u81F3	sh\xE8n zh\xEC	4	d	even|so much so that
\u9053	d\xE0o	2	qv	road|path|principle|truth|morality|reason|skill|method
\u4E4B\u524D	zh\u012B qi\xE1n	4	f	before|prior to|ago|previously|beforehand
\u56DE\u6765	hu\xED lai	1	v	return|come back
\u56DB	s\xEC	1	m	four
\u80FD\u591F	n\xE9ng g\xF2u	2	v	be capable of|be able to|can
\u65E0\u6CD5	w\xFA f\u01CE	4	v	unable|incapable
\u4F5C	zu\xF2	6	v	do|engage in|write|compose|pretend|feign|regard as|consider to be
\u5757	ku\xE0i	1	q	lump|chunk|piece
\u62C9	l\u0101	2	v	pull|play|drag|draw|chat|empty one's bowels
\u5B8C\u6210	w\xE1n ch\xE9ng	2	v	complete|accomplish
\u5916	w\xE0i	1	f	outside|in addition|foreign|external
\u5BF9\u4E8E	du\xEC y\xFA	4	p	regarding|with regard to
\u5982\u6B64	r\xFA c\u01D0	5	r	like this|so|such
\u80AF\u5B9A	k\u011Bn d\xECng	5	d	be certain|be positive|assuredly|definitely|give recognition|affirm|affirmative
\u6C42	qi\xFA	2	v	seek|look for|request|demand|beseech
\u7ED3\u675F	ji\xE9 sh\xF9	3	v	termination|finish|end|conclude|close
\u5E2E\u52A9	b\u0101ng zh\xF9	2	v	assistance|aid|help|assist
\u8005	zh\u011B	3	k	one who|person involved in|-er|-ist|(used after a term|this
\u53D8	bi\xE0n	2	v	change|become different|transform|vary|rebellion
\u665A\u4E0A	w\u01CEn shang	1	t	evening|night|in the evening
\u52A0	ji\u0101	2	v	add|plus|apply to|give to
\u52AA\u529B	n\u01D4 l\xEC	2	ad	make an effort|try hard|strive|hard-working|conscientious
\u5904	ch\u01D4	4	n	reside|live|dwell|be in|be situated at|stay|get along with|deal with
\u5F53\u65F6	d\u0101ng sh\xED	2	t	then|at that time|while|at once|right away
\u6709\u5173	y\u01D2u gu\u0101n	6	vn	relate to|related to|concern|concerning
\u8F6C	zhu\u01CEn	3	v	turn|change direction|transfer|forward|share|revolve|circle about|walk about
\u8C03\u67E5	di\xE0o ch\xE1	3	v	investigation|inquiry|investigate|survey|poll
\u65B9\u5F0F	f\u0101ng sh\xEC	3	n	way|manner|style|mode|pattern
\u90E8\u5206	b\xF9 fen	2	n	part|share|section|piece
\u7F8E\u5143	M\u011Bi yu\xE1n	3	q	american dollar|us dollar
\u5988	m\u0101	1	n	ma|mom|mother
\u7403	qi\xFA	1	n	ball|sphere|globe|ball game|match
\u8C22\u8C22	xi\xE8 xie	1	v	thank|thanks|thank you
\u4EE5\u524D	y\u01D0 qi\xE1n	2	f	before|formerly|previous|ago
\u5B66	xu\xE9	1	v	learn|study|imitate|science|-ology
\u5904\u7406	ch\u01D4 l\u01D0	3	v	handle|deal with|punish|process|sell at reduced prices
\u591A\u5C11	du\u014D sh\u01CEo	1	r	number|amount|somewhat|how much|how many|what number
\u5988\u5988	m\u0101 ma	1	n	mama|mommy|mother
\u653F\u5E9C	zh\xE8ng f\u01D4	4	n	government
\u7B2C\u4E8C	d\xEC \xE8r	1	m	second|number two|next|secondary
\u5F3A	qi\xE1ng	3	a	strong|powerful|better|slightly more than|vigorous|violent|force|compel
\u9519	cu\xF2	1	v	mistake|wrong|bad|interlocking|complex|grind|polish|alternate
\u80FD\u529B	n\xE9ng l\xEC	3	n	capability|ability
\u4FDD\u62A4	b\u01CEo h\xF9	3	v	protect|defend|safeguard|protection
\u529E\u6CD5	b\xE0n f\u01CE	2	n	means|method|way
\u5C11	sh\u01CEo	1	a	few|less|lack|be missing|stop|seldom|young
\u5176	q\xED	5	r	his|her|its|their|that|such|it
\u53E6	l\xECng	6	r	other|another|separate|separately
\u7279\u522B	t\xE8 bi\xE9	2	d	unusual|special|very|especially|particularly|expressly|for a specific purpose
\u522B\u7684	bi\xE9 de	1	r	else|other
\u771F\u6B63	zh\u0113n zh\xE8ng	2	b	genuine|real|true|really|indeed
\u96BE	n\xE1n	1	ad	difficult|problem|difficulty|not good|disaster|distress|scold
\u66FE	c\xE9ng	4	d	once|already|ever|former|previously|great-
\u7BA1	gu\u01CEn	3	v	take care|control|manage|be in charge of|look after|run|care about|tube
\u652F\u6301	zh\u012B ch\xED	3	v	be in favor of|support|back|backing|stand by
\u7535\u5F71	di\xE0n y\u01D0ng	1	n	movie|film
\u95F4	ji\xE0n	1	q	gap|separate|thin out|sow discontent|between|among|room
\u54EA	n\u01CE	1	r	how|which|taiwan pr
\u6CE8\u610F	zh\xF9 y\xEC	3	v	take note of|pay attention to
\u6389	di\xE0o	2	v	fall|drop|lag behind|lose|go missing|reduce|wag|swing
\u6539\u53D8	g\u01CEi bi\xE0n	2	v	change|alter|transform
\u7CFB\u7EDF	x\xEC t\u01D2ng	4	n	system
\u662F\u5426	sh\xEC f\u01D2u	4	v	whether|if|is or isn't
\u8DD1	p\u01CEo	1	v	run|run away|escape|run around|leak or evaporate|away|off|paw
\u56DE\u5BB6	hu\xED ji\u0101	1	v	return home
\u8BB2	ji\u01CEng	2	v	speak|explain|negotiate|emphasize|be particular about|speech|lecture
\u6D3B	hu\xF3	3	v	live|alive|living|work|workmanship
\u4E07	w\xE0n	2	m	ten thousand|great number
\u6628\u5929	zu\xF3 ti\u0101n	1	t	yesterday
\u6740	sh\u0101	5	v	kill|murder|attack|weaken or reduce|smart|extremely
\u79BB\u5F00	l\xED k\u0101i	2	v	depart|leave
\u4EE5\u53CA	y\u01D0 j\xED	4	cc	as well as|too|and
\u665A	w\u01CEn	1	tg	evening|night|late
\u751F	sh\u0113ng	2	v	be born|give birth|life|grow|raw|uncooked|student
\u4E66	sh\u016B	1	n	book|letter|document|write
\u7247	pi\xE0n	2	q	thin piece|flake|slice|film|tv play|carve thin|partial|incomplete
\u4E94	w\u01D4	1	m	five
\u540C\u65F6	t\xF3ng sh\xED	2	c	at the same time|simultaneously
\u81EA	z\xEC	4	p	self|oneself|from|since|naturally|surely
\u4EE5\u4E3A	y\u01D0 w\xE9i	2	v	think
\u62CD	p\u0101i	3	v	pat|clap|slap|swat|take|shoot|racket|beat
\u63A7\u5236	k\xF2ng zh\xEC	5	v	control
\u6574\u4E2A	zh\u011Bng g\xE8	3	b	whole|entire|total
\u8D8A	yu\xE8	2	d	exceed|climb over|surpass|more... the more
\u6781\u4E86	j\xED le	3	y	extremely|exceedingly
\u58F0	sh\u0113ng	5	qv	sound|voice|tone|noise|reputation
\u65B9\u6CD5	f\u0101ng f\u01CE	2	n	method|way|means
\u7EC4	z\u01D4	2	n	form|organize|group|team
\u7814\u7A76	y\xE1n ji\u016B	4	vn	research|study|look into
\u4FDD\u8BC1	b\u01CEo zh\xE8ng	3	v	guarantee|ensure|safeguard|pledge
\u5148\u751F	xi\u0101n sheng	1	n	teacher|gentleman|sir|mister|husband|doctor
\u5B9A	d\xECng	4	v	set|fix|determine|decide|order
\u7537	n\xE1n	1	b	male
\u52A8	d\xF2ng	1	v	move|set in movement|displace|touch|make use of|stir|alter
\u76F4\u63A5	zh\xED ji\u0113	2	ad	immediate|straightforward
\u5356	m\xE0i	2	v	sell|betray|spare no effort|show off or flaunt
\u7EC4\u7EC7	z\u01D4 zh\u012B	5	n	organize|organization|tissue|weave
\u9009	xu\u01CEn	2	v	choose|pick|select|elect
\u6839\u672C	g\u0113n b\u011Bn	3	d	fundamental|basic|root|simply|absolutely|at all
\u57CE\u5E02	ch\xE9ng sh\xEC	3	n	city|town
\u53E5	j\xF9	2	q	sentence|clause|phrase
\u5F71\u54CD	y\u01D0ng xi\u01CEng	2	v	influence|effect|affect|disturb
\u6C38\u8FDC	y\u01D2ng yu\u01CEn	2	d	forever|eternal
\u4E5F\u8BB8	y\u011B x\u01D4	2	d	perhaps|maybe
\u65B9\u9762	f\u0101ng mi\xE0n	2	n	respect|aspect|field|side
\u6E38\u620F	y\xF3u x\xEC	3	n	game|play
\u76EE\u524D	m\xF9 qi\xE1n	3	t	at the present time|currently
\u9762	mi\xE0n	2	n	face|side|surface|aspect|top|flour|noodles|soft
\u6D3B\u52A8	hu\xF3 d\xF2ng	2	vn	exercise|move about|operate|use connections|loose|shaky|active|movable
\u9A6C	m\u01CE	3	n	horse|knight in western chess
\u6BD4\u8F83	b\u01D0 ji\xE0o	3	d	compare|contrast|comparatively|relatively|quite|comparison
\u8003\u8651	k\u01CEo l\u01DC	4	v	think over|consider|consideration
\u533B\u9662	y\u012B yu\xE0n	1	n	hospital
\u91CD	ch\xF3ng	1	a	repeat|repetition|again|re-|classifier: layer|heavy|serious|attach importance to
\u4E9B	xi\u0113	4	q	few, several
\u4FE1\u606F	x\xECn x\u012B	2	n	information|news|message
\u6700\u8FD1	zu\xEC j\xECn	2	t	recently|soon|nearest
\u561B	m\xE1	6	y	what
\u6362	hu\xE0n	2	v	exchange|change|substitute|switch|convert
\u72D7	g\u01D2u	2	n	dog
\u5B58\u5728	c\xFAn z\xE0i	3	v	exist|be|existence
\u63D0\u4F9B	t\xED g\u014Dng	4	v	offer|supply|provide|furnish
\u771F\u7684	zh\u0113n de	1	d	really, truly, indeed
\u9760	k\xE0o	2	v	lean against or on|come near to|depend on|trust|fuck
\u7EC8\u4E8E	zh\u014Dng y\xFA	3	d	at last|in the end|finally|eventually
\u5B50	z\u01D0	1	g	son|child|seed|egg|small thing|subsidiary|subordinate|sub-
\u73B0\u573A	xi\xE0n ch\u01CEng	3	s	scene|spot|site
\u4E0B\u6765	xi\xE0 lai	3	v	come down|be harvested|be over|go among the masses
\u8138	li\u01CEn	2	n	face
\u8FDC	yu\u01CEn	1	a	far|distant|remote|by far|much|distance oneself from
\u4E2A\u4EBA	g\xE8 r\xE9n	3	n	individual|personal|oneself
\u53E3	k\u01D2u	1	q	mouth
\u5FEB\u4E50	ku\xE0i l\xE8	2	a	happy|joyful
\u533A	q\u016B	3	n	area|region|district|small|distinguish
\u603B\u662F	z\u01D2ng sh\xEC	3	d	always
\u9664\u4E86	ch\xFA le	3	p	besides|apart from|in addition to|except
\u6307	zh\u01D0	3	v	finger|point at or to|indicate or refer to|depend on|count on|stand on end
\u7CBE\u795E	j\u012Bng sh\xE9n	3	n	spirit|mind|consciousness|thought|mental|psychological|essence|gist
\u4F7F\u7528	sh\u01D0 y\xF2ng	2	v	use|employ|apply|make use of
\u53CC	shu\u0101ng	3	m	two|double|pair|both|even
\u4EE3\u8868	d\xE0i bi\u01CEo	3	n	representative|delegate|represent|stand for|on behalf of|in the name of
\u4FDD\u6301	b\u01CEo ch\xED	3	v	keep|maintain|hold|preserve
\u6765\u81EA	l\xE1i z\xEC	2	v	come from|from
\u7A81\u7136	t\u016B r\xE1n	3	ad	sudden|abrupt|unexpected
\u6BB5	du\xE0n	2	q	paragraph|section|segment|stage
\u8D85	ch\u0101o	6	v	exceed|overtake|surpass|transcend|pass|cross|ultra-|super-
\u91CC\u9762	l\u01D0 mi\xE0n	3	f	inside|interior|also pr
\u5B66\u751F	xu\xE9 sheng	1	n	student|schoolchild
\u786E\u5B9A	qu\xE8 d\xECng	3	v	definite|certain|fixed|fix|determine|be sure|ensure|make certain
\u76EE\u6807	m\xF9 bi\u0101o	3	n	target|goal|objective
\u68C0\u67E5	ji\u01CEn ch\xE1	2	v	inspection|examine|inspect
\u4E2D\u5FC3	zh\u014Dng x\u012Bn	2	n	center|heart|core
\u9996	sh\u01D2u	4	m	head|chief|first
\u7C73	m\u01D0	2	n	rice|meter
\u4E8C	\xE8r	1	m	two|stupid
\u4EFB\u52A1	r\xE8n wu	3	n	mission|assignment|task|duty|role
\u5BB9\u6613	r\xF3ng y\xEC	3	a	easy|straightforward|likely|liable to|apt to
\u513F\u5B50	\xE9r zi	1	n	son
\u884C\u52A8	x\xEDng d\xF2ng	2	vn	operation|action|move about|mobile
\u5F00\u5FC3	k\u0101i x\u012Bn	2	a	feel happy|rejoice|have a great time|make fun of sb
\u8054\u7CFB	li\xE1n x\xEC	3	v	connection|contact|relation|get in touch with|integrate|link|touch
\u5408\u4F5C	h\xE9 zu\xF2	3	vn	cooperate|collaborate|work together|cooperation
\u56E0\u6B64	y\u012Bn c\u01D0	3	c	thus|consequently|as a result
\u61C2	d\u01D2ng	2	v	understand|comprehend
\u5361	qi\u01CE	2	n	block|be stuck|be wedged|customs station|clip|fastener|checkpost|taiwan pr
\u4EBA\u5458	r\xE9n yu\xE1n	3	n	staff|crew|personnel
\u54C8	h\u0101	5	b	ha|be infatuated with|adore|pekinese|pug|scold
\u660E\u767D	m\xEDng bai	1	v	clear|obvious|unequivocal|understand|realize
\u5E26\u6765	d\xE0i l\xE1i	2	v	bring|bring about|produce
\u53CA	j\xED	7	cc	and|reach|up to|in time for
\u6309	\xE0n	3	p	press|push|leave aside or shelve|control|restrain|keep one's hand on|check or refer to|according to
\u56E0	y\u012Bn	6	p	cause|reason|because
\u7EBF	xi\xE0n	3	n	thread|string|wire|line|tier
\u62A5\u544A	b\xE0o g\xE0o	3	n	inform|report|make known|speech|talk|lecture
\u676F	b\u0113i	1	q	cup|trophy cup
\u529E	b\xE0n	2	v	do|manage|handle|go about|run|set up|deal with
\u6CBB\u7597	zh\xEC li\xE1o	4	v	treat|medical treatment|therapy
\u62E5\u6709	y\u014Dng y\u01D2u	5	v	have|possess
\u8FC7\u6765	gu\xF2 l\xE1i	2	v	come over|manage|handle
\u6839\u636E	g\u0113n j\xF9	4	p	according to|based on|basis|foundation
\u7279	t\xE8	6	g	special|unique|distinguished|especially|unusual|very
\u53F0	t\xE1i	3	q	platform|stage|terrace|stand|support|station|broadcasting station|desk
\u7B97	su\xE0n	2	v	regard as|figure|calculate|compute
\u8BB0\u5F97	j\xEC de	1	v	remember
\u836F	y\xE0o	2	n	medicine|drug|poison|leaf of the iris
\u83B7\u5F97	hu\xF2 d\xE9	4	v	obtain|receive|get
\u6B4C	g\u0113	1	n	song|sing
\u751F\u547D	sh\u0113ng m\xECng	3	n	life|living being|creature
\u7559	li\xFA	2	v	leave|retain|stay|remain|keep|preserve
\u5BB6\u5EAD	ji\u0101 t\xEDng	2	n	family|household
\u6CD5	f\u01CE	4	n	law|method|way|emulate|dharma|france|french|taiwan pr
\u660E\u663E	m\xEDng xi\u01CEn	3	a	clear|distinct|obvious
\u4EA4	ji\u0101o	2	v	hand over|deliver|pay|turn over|make friends|intersect
\u4F24	sh\u0101ng	3	v	injure|injury|wound
\u5957	t\xE0o	2	q	cover|encase|sheath|overlap|interleave|model after|copy|formula
\u5168\u90E8	qu\xE1n b\xF9	2	m	whole|all
\u521A\u521A	g\u0101ng gang	2	d	just recently|just a moment ago
\u6B63\u5E38	zh\xE8ng ch\xE1ng	2	a	regular|normal|ordinary
\u66FE\u7ECF	c\xE9ng j\u012Bng	3	d	once|already|former|previously|ever
\u9ED1	h\u0113i	2	a	black|dark|sinister|secret|shady|illegal|hide away|vilify
\u53E6\u5916	l\xECng w\xE0i	3	r	additional|in addition|besides|separate|other|moreover|furthermore
\u7B80\u5355	ji\u01CEn d\u0101n	3	a	simple|not complicated
\u8840	xu\xE8	3	n	blood|colloquial pr
\u534A	b\xE0n	1	m	half|semi-|incomplete|and a half
\u4E2D\u56FD	Zh\u014Dng gu\xF3	1	ns	china
\u8EAB\u4F53	sh\u0113n t\u01D0	1	n	body|one's health|in person
\u5E97	di\xE0n	2	n	inn|old-style hotel|shop|store
\u670D\u52A1	f\xFA w\xF9	2	vn	serve|service
\u60F3\u5230	xi\u01CEng d\xE0o	2	v	think of|call to mind|anticipate
\u884C\u4E3A	x\xEDng w\xE9i	2	n	action|conduct|behavior|activity
\u5C40	j\xFA	4	n	office|situation|narrow
\u633A	t\u01D0ng	2	d	straight|erect|stick out|straighten up|support|withstand|outstanding|quite
\u514B	k\xE8	2	g	be able to|subdue|restrain|overcome|gram|overthrow
\u597D\u50CF	h\u01CEo xi\xE0ng	2	v	as if|seem like
\u613F\u610F	yu\xE0n y\xEC	2	v	wish|want|ready|willing
\u5230\u5E95	d\xE0o d\u01D0	3	d	finally|in the end|after all|end|last
\u88C5	zhu\u0101ng	2	v	adornment|adorn|dress|clothing|costume|play a role|pretend|install
\u97F3\u4E50	y\u012Bn yu\xE8	2	n	music
\u5143	yu\xE1n	1	q	currency unit|first|original|primary|fundamental|constituent|part|era
\u7EDD\u5BF9	ju\xE9 du\xEC	3	d	absolute|unconditional
\u611F\u8C22	g\u01CEn xi\xE8	2	v	thanks|gratitude|grateful|thankful
\u54EA\u91CC	n\u01CE l\u01D0	1	r	where|somewhere|anywhere|wherever|nowhere|humble expression denying compliment
\u575A\u6301	ji\u0101n ch\xED	3	v	persevere with|persist in|insist on
\u5EA7	zu\xF2	2	q	seat|base|stand
\u6D3E	p\xE0i	3	v	clique|school|group|faction|dispatch|send|assign|appoint
\u597D\u597D	h\u01CEo h\u01CEo	3	d	well|carefully|nicely|properly
\u672A	w\xE8i	7	d	not yet|did not|have not|not
\u5305	b\u0101o	1	v	cover|wrap|hold|include|take charge of|contract|package|wrapper
\u5165	r\xF9	6	v	enter|go into|join|become a member of|confirm or agree with
\u90A3\u6837	n\xE0 y\xE0ng	2	r	that kind|that sort
\u6280\u672F	j\xEC sh\xF9	3	n	technology|technique|skill
\u5F80	w\u01CEng	2	p	go|to|towards|bound for|past|previous
\u54C7	w\u0101	6	y	wow|sound of vomiting
\u773C	y\u01CEn	2	n	eye|small hole|crux
\u672A\u6765	w\xE8i l\xE1i	4	t	future|tomorrow|approaching|coming|pending
\u697C	l\xF3u	1	n	storied building|floor
\u8BBE\u8BA1	sh\xE8 j\xEC	3	v	design|plan
\u5229\u7528	l\xEC y\xF2ng	3	v	exploit|make use of|use|take advantage of|utilize
\u611F\u5230	g\u01CEn d\xE0o	2	v	feel|sense|perceive
\u6E05\u695A	q\u012Bng chu	2	a	clear|distinct|understand thoroughly|be clear about
\u7167\u7247	zh\xE0o pi\xE0n	2	n	photograph|picture
\u4E3B	zh\u01D4	7	g	owner|master|host|individual or party concerned|god|lord|main|indicate or signify
\u505C	t\xEDng	2	v	stop|halt|park
\u94F6\u884C	y\xEDn h\xE1ng	2	n	bank
\u90A3\u91CC	n\xE0 li	1	r	there|that place
\u6545\u4E8B	g\xF9 shi	2	n	narrative|story|tale|old practice
\u6C14	q\xEC	2	n	gas|air|smell|weather|make angry|annoy|get angry|vital energy
\u770B\u6765	k\xE0n lai	4	v	apparently|it seems that
\u6027	x\xECng	3	g	nature|character|property|quality|attribute|sexuality|sex|gender
\u4EE4	l\xECng	5	v	order|command|warrant|writ|cause|make sth happen|virtuous|honorific title
\u4ECB\u7ECD	ji\xE8 sh\xE0o	1	v	introduce|give a presentation|present|introduction
\u7535\u89C6	di\xE0n sh\xEC	1	n	television|tv
\u98DE	f\u0113i	1	v	fly
\u5012	d\xE0o	2	v	invert|pour out|tip out|dump|inverted|upside down|reversed|go backward
\u4E0B\u5348	xi\xE0 w\u01D4	1	t	afternoon|p.m
\u5EFA\u8BAE	ji\xE0n y\xEC	3	n	propose|suggest|recommend|proposal|suggestion|recommendation
\u51FA\u53BB	ch\u016B q\xF9	1	v	go out
\u4E25\u91CD	y\xE1n zh\xF2ng	4	a	grave|serious|severe|critical
\u5404\u4F4D	g\xE8 w\xE8i	3	r	everybody|all|all of you
\u795E	sh\xE9n	5	n	deity|soul|spirit|unusual|mysterious|lively|expressive|expression
\u5305\u62EC	b\u0101o ku\xF2	4	v	comprise|include|involve|incorporate|consist of
\u9152	ji\u01D4	2	n	wine|liquor|spirits|alcoholic beverage
\u5B66\u4E60	xu\xE9 x\xED	1	v	learn|study
\u539F\u6765	yu\xE1n l\xE1i	2	d	original|former|originally|formerly|at first
\u5B83\u4EEC	t\u0101 men	2	r	they
\u7EA2	h\xF3ng	2	a	red|popular|revolutionary|bonus
\u6B22\u8FCE	hu\u0101n y\xEDng	2	v	welcome
\u6293	zhu\u0101	3	v	grab|catch|arrest|snatch|scratch
\u7EA6	yu\u0113	3	d	make an appointment|invite|approximately|pact|treaty|economize|restrict|reduce
\u4E00\u822C	y\u012B b\u0101n	2	a	same|ordinary|so-so|common|general|generally|in general
\u53EF\u7231	k\u011B \xE0i	2	a	adorable|cute|lovely
\u8001\u5E08	l\u01CEo sh\u012B	1	n	teacher
\u5149	gu\u0101ng	3	n	light|ray|bright|shiny|only|merely|used up|finished
\u516D	li\xF9	1	m	six
\u8FB9	bi\u0101n	2	k	side|edge|margin|border|boundary|simultaneously
\u65B0\u95FB	x\u012Bn w\xE9n	2	n	news
\u610F\u4E49	y\xEC y\xEC	3	n	sense|meaning|significance|importance
\u4FBF	bi\xE0n	6	d	plain|informal|suitable|convenient|opportune|urinate or defecate|in that case|even if
\u5531	ch\xE0ng	1	v	sing|call loudly|chant
\u5927\u5B66	d\xE0 xu\xE9	1	n	university|college
\u773C\u775B	y\u01CEn jing	2	n	eye
\u6CD5\u5F8B	f\u01CE l\u01DC	4	n	law
\u7236\u4EB2	f\xF9 q\u012Bn	3	n	father|also pr
\u505A\u5230	zu\xF2 d\xE0o	2	v	accomplish|achieve
\u8FD1	j\xECn	2	a	near|close to|approximately
\u600E\u6837	z\u011Bn y\xE0ng	2	r	how|what kind
\u533B\u751F	y\u012B sh\u0113ng	1	n	doctor
\u5E76\u4E14	b\xECng qi\u011B	3	c	and|besides|moreover|furthermore|in addition
\u75C5	b\xECng	1	n	illness|disease|fall ill|defect
\u91D1	j\u012Bn	3	b	gold|chemical element au|money|golden|highly respected|jurchen jin dynasty
\u540D\u5B57	m\xEDng zi	1	n	name
\u6536	sh\u014Du	2	v	receive|accept|collect|put away|restrain|stop|in care of
\u5979\u4EEC	t\u0101 men	1	r	they|them
\u793E\u4F1A	sh\xE8 hu\xEC	3	n	society
\u9879	xi\xE0ng	4	q	back of neck|item|thing|term|sum
\u4E0B\u53BB	xi\xE0 q\xF9	3	v	go down|descend|go on|continue|withdraw
\u8BC1\u660E	zh\xE8ng m\xEDng	3	v	proof|certificate|identification|testimonial|prove|testify|confirm the truth of
\u58F0\u97F3	sh\u0113ng y\u012Bn	2	n	voice|sound
\u8BB0\u8005	j\xEC zh\u011B	3	n	reporter|journalist
\u9A6C\u4E0A	m\u01CE sh\xE0ng	1	d	at once|right away|immediately|on horseback
\u5E95	d\u01D0	4	f	background|bottom|base|end|remnants|radix
\u786E\u5B9E	qu\xE8 sh\xED	3	ad	indeed|really|reliable|real|true
\u4ECA\u5E74	j\u012Bn ni\xE1n	1	t	this year
\u529B	l\xEC	3	n	power|force|strength|ability|strenuously
\u6570	sh\u01D4	2	m	count|count as|regard as|enumerate|list|number|figure|several
\u53D8\u6210	bi\xE0n ch\xE9ng	2	v	change into|turn into|become
\u4E0D\u7BA1	b\xF9 gu\u01CEn	4	c	not to be concerned|regardless of|no matter
\u8868\u793A	bi\u01CEo sh\xEC	3	v	express|show|say|state|indicate|mean
\u624B\u673A	sh\u01D2u j\u012B	1	n	cell phone|mobile phone
\u53D7\u5230	sh\xF2u d\xE0o	2	v	receive (praise|education, punishment etc)|be ...ed
\u53D1\u5C55	f\u0101 zh\u01CEn	3	v	development|growth|develop|grow|expand
\u5FD9	m\xE1ng	1	v	busy|hurriedly|hurry|rush
\u8C08	t\xE1n	3	v	speak|talk|converse|chat|discuss
\u5341	sh\xED	1	m	ten
\u7ECF\u8FC7	j\u012Bng gu\xF2	2	p	pass|go through|process|course
\u81F3\u5C11	zh\xEC sh\u01CEo	3	d	at least|least
\u770B\u89C1	k\xE0n ji\xE0n	1	v	see|catch sight of
\u89E3\u91CA	ji\u011B sh\xEC	4	v	explanation|explain|interpret|resolve
\u53EA\u80FD	zh\u01D0 n\xE9ng	2	v	can only|obliged to do sth|have no other choice
\u8D1F\u8D23	f\xF9 z\xE9	3	v	be in charge of|take responsibility for|be to blame|conscientious
\u542C\u5230	t\u012Bng d\xE0o	1	v	hear
\u9996\u5148	sh\u01D2u xi\u0101n	3	d	first|in the first place
\u5973\u513F	n\u01DA \xE9r	1	n	daughter
\u4EA4\u6613	ji\u0101o y\xEC	3	n	deal|trade|transact|transaction
\u8BF4\u8BDD	shu\u014D hu\xE0	1	v	speak|say|talk|gossip|tell stories|word
\u5386\u53F2	l\xEC sh\u01D0	4	n	history
\u7406\u89E3	l\u01D0 ji\u011B	3	v	comprehend|understand
\u62A5\u9053	b\xE0o d\xE0o	3	v	report
\u7236\u6BCD	f\xF9 m\u01D4	3	n	father and mother|parents
\u57CE	ch\xE9ng	3	n	city walls|city|town
\u4E4B\u4E00	zh\u012B y\u012B	4	r	one of|one
\u6700\u7EC8	zu\xEC zh\u014Dng	6	d	final|ultimate
\u54ED	k\u016B	2	v	cry|weep
\u6C7D\u8F66	q\xEC ch\u0113	1	n	car|automobile|bus
\u6015	p\xE0	2	v	be afraid|fear|dread|be unable to endure|perhaps
\u529B\u91CF	l\xEC liang	3	n	power|force|strength
\u5B89\u6392	\u0101n p\xE1i	3	v	arrange|plan|set up|arrangements|plans
\u6562	g\u01CEn	3	v	dare|daring|may i venture
\u7238\u7238	b\xE0 ba	1	n	father|dad
\u9879\u76EE	xi\xE0ng m\xF9	4	n	item|project|event
\u9020\u6210	z\xE0o ch\xE9ng	3	v	bring about|create|cause
\u79BB	l\xED	2	v	leave|part from|be away from|from|without|independent of|mythical beast
\u5B57	z\xEC	1	n	letter|symbol|character|word
\u67D0	m\u01D2u	3	r	some|certain|sb or sth indefinite|such-and-such
\u68A6	m\xE8ng	4	n	dream
\u652F	zh\u012B	3	q	support|sustain|erect|raise|branch|division|draw money
\u6F02\u4EAE	pi\xE0o liang	2	a	pretty|beautiful
\u91CD\u65B0	ch\xF3ng x\u012Bn	2	d	again|once more|re-
\u968F	su\xED	3	p	follow|comply with|varying according to|allow|subsequently
\u63D0	t\xED	2	v	carry|lift|put forward|mention|raise|upwards character stroke|lifting brush stroke|scoop for measuring liquid
\u9AD8\u5174	g\u0101o x\xECng	1	a	happy|glad|willing|in a cheerful mood
\u5EA6	d\xF9	2	qv	pass|spend|measure|limit|extent|degree of intensity|degree|kilowatt-hour
\u4EBA\u751F	r\xE9n sh\u0113ng	3	n	life
\u4F1A\u8BAE	hu\xEC y\xEC	3	n	meeting|conference
\u5E78\u798F	x\xECng f\xFA	3	a	happiness|happy|blessed
\u81EA\u7136	z\xEC r\xE1n	3	n	nature|natural|naturally
\u767D	b\xE1i	1	a	white|snowy|pure|bright|empty|blank|plain|clear
\u5355	d\u0101n	4	d	bill|list|form|single|only|sole|odd number
\u53BB\u5E74	q\xF9 ni\xE1n	1	t	last year
\u8D23\u4EFB	z\xE9 r\xE8n	3	n	responsibility|blame|duty
\u70ED	r\xE8	1	a	warm up|heat up|hot|heat|fervent
\u8BD5	sh\xEC	1	v	test|try|experiment|examination
\u611F	g\u01CEn	7	g	feel|move|touch|affect|feeling|emotion|sense of
\u7ECF\u5E38	j\u012Bng ch\xE1ng	2	d	frequently|constantly|regularly|often|day-to-day|everyday|daily
\u81F3	zh\xEC	5	p	arrive|most|to|until
\u6765\u5230	l\xE1i d\xE0o	1	v	arrive|come
\u7761\u89C9	shu\xEC ji\xE0o	1	v	go to bed|sleep
\u7535\u8111	di\xE0n n\u01CEo	1	n	computer
\u9762\u524D	mi\xE0n qi\xE1n	2	f	in front of|facing|presence
\u5931\u53BB	sh\u012B q\xF9	3	v	lose
\u975E	f\u0113i	4	b	not be|not|wrong|incorrect|non-|un-|in-|de-
\u4F4E	d\u012B	2	a	low|beneath|lower|let droop|hang down|incline
\u8282\u76EE	ji\xE9 m\xF9	2	n	program|item
\u4E0D\u518D	b\xF9 z\xE0i	6	d	no more|no longer
\u5065\u5EB7	ji\xE0n k\u0101ng	2	a	health|healthy
\u5F04	n\xF2ng	2	v	do|manage|handle|play with|fool with|mess with|fix|toy with
\u8D62	y\xEDng	3	v	beat|win|profit
\u4F5C\u7528	zu\xF2 y\xF2ng	2	n	act on|affect|action|function|activity|impact|result|effect
\u6B7B\u4EA1	s\u01D0 w\xE1ng	6	v	die|death
\u7968	pi\xE0o	1	n	ticket|ballot|banknote|person held for ransom
\u897F	X\u012B	1	f	west|spanish
\u5E8A	chu\xE1ng	1	n	bed|couch
\u6EE1	m\u01CEn	2	a	fill|full|filled|packed|fully|completely|quite|reach the limit
\u56DE\u5230	hu\xED d\xE0o	1	v	return to
\u7B2C	d\xEC	1	m	but|however|only|just
\u5219	z\xE9	7	d	but|then|standard|norm|principle|imitate|follow
\u60C5	q\xEDng	7	n	feeling|emotion|passion|situation
\u62A5	b\xE0o	3	n	announce|inform|report|newspaper|recompense|revenge
\u5DEE	ch\xE0	1	a	different|wrong|mistaken|fall short|lack|not up to standard|inferior|taiwan pr
\u8BF4\u660E	shu\u014D m\xEDng	2	v	explain|illustrate|indicate|show|prove|explanation|directions|caption
\u8BB8\u591A	x\u01D4 du\u014D	2	m	many|lot of|much
\u4EBA\u6C11	r\xE9n m\xEDn	3	n	people
\u540C\u6837	t\xF3ng y\xE0ng	2	b	same|equal|equivalent
\u6B65	b\xF9	3	qv	step|pace|walk|march|stages in a process|situation
\u4E8B\u4EF6	sh\xEC ji\xE0n	3	n	event|happening|incident
\u5BB6\u91CC	ji\u0101 l\u01D0	1	s	home
\u9762\u5BF9	mi\xE0n du\xEC	3	v	face|confront
\u538B\u529B	y\u0101 l\xEC	3	n	pressure
\u7531\u4E8E	y\xF3u y\xFA	3	p	due to|as a result of|thanks to|owing to|since|because
\u7ED3\u5A5A	ji\xE9 h\u016Bn	3	v	marry|get married
\u8D8A\u6765\u8D8A	yu\xE8 l\xE1i yu\xE8	2	d	more and more
\u8EAB\u8FB9	sh\u0113n bi\u0101n	2	s	at one's side|on hand
\u518D\u6B21	z\xE0i c\xEC	5	d	one more time|again|one more|once again
\u6BCD\u4EB2	m\u01D4 q\u012Bn	3	n	mother|also pr
\u77ED	du\u01CEn	2	a	short|brief|lack|weak point|fault
\u540C\u610F	t\xF3ng y\xEC	3	v	agree|consent|approve
\u8BAD\u7EC3	x\xF9n li\xE0n	3	vn	train|drill|training
\u603B\u7EDF	z\u01D2ng t\u01D2ng	4	n	president
\u610F\u601D	y\xEC si	2	n	idea|opinion|meaning|wish|desire|interest|fun
\u6559	ji\xE0o	1	v	religion|teaching|make|cause|tell|teach
\u5565	sh\xE1	6	r	also pr
\u90E8\u95E8	b\xF9 m\xE9n	3	n	department|branch|section|division
\u653E\u5F03	f\xE0ng q\xEC	5	v	renounce|abandon|give up
\u610F\u89C1	y\xEC ji\xE0n	2	n	idea|opinion|suggestion|objection|complaint
\u4F3C\u4E4E	s\xEC h\u016B	4	d	it seems|seemingly|as if
\u5E94	y\u012Bng	4	v	agree|should|ought to|must|shall|answer|respond|comply with
\u636E	j\xF9	6	p	according to|act in accordance with|depend on|seize|occupy
\u51E0\u4E4E	j\u012B h\u016B	4	d	almost|nearly|practically
\u8FC7\u7A0B	gu\xF2 ch\xE9ng	3	n	course of events|process
\u4F4D\u7F6E	w\xE8i zhi	4	n	position|place|seat
\u5B9D\u8D1D	b\u01CEo b\xE8i	4	n	treasured object|treasure|darling|baby|cowry|good-for-nothing or queer character
\u5373\u4F7F	j\xED sh\u01D0	5	c	even if|even though
\u67E5	ch\xE1	2	v	research|check|investigate|examine|refer to|look up
\u65B9	f\u0101ng	4	q	square|power or involution|upright|honest|fair and square|direction|side|party
\u4E0D\u7528	b\xF9 y\xF2ng	1	d	need not
\u8BFB	d\xFA	1	v	read out|read aloud|read|attend|study|pronounce|comma|phrase marked by pause
\u5C3D\u7BA1	j\u01D0n gu\u01CEn	5	c	despite|although|even though|in spite of|unhesitatingly|do not hesitate|without hesitating
\u6DF1	sh\u0113n	3	a	deep
\u5FD8	w\xE0ng	1	v	forget|overlook|neglect
\u6E05	q\u012Bng	6	a	clear|clean|quiet|still|pure|uncorrupted|distinct|settle
\u8BA4\u771F	r\xE8n zh\u0113n	1	a	conscientious|earnest|serious|take seriously|take to heart
\u9644\u8FD1	f\xF9 j\xECn	4	f	nearby|neighboring|vicinity|neighborhood
\u5404	g\xE8	3	r	each|every
\u811A	ji\u01CEo	2	n	foot|leg|base
\u9009\u624B	xu\u01CEn sh\u01D2u	3	n	athlete|contestant
\u51B7	l\u011Bng	1	a	cold
\u53C2\u4E0E	c\u0101n y\xF9	4	v	participate
\u623F\u5B50	f\xE1ng zi	1	n	house|building|apartment|room
\u7535	di\xE0n	1	n	lightning|electricity|electric|get an electric shock
\u4ECD\u7136	r\xE9ng r\xE1n	3	d	still|as before|yet
\u5C71	sh\u0101n	1	n	mountain|hill
\u663E\u793A	xi\u01CEn sh\xEC	3	v	show|illustrate|display|demonstrate
\u4E3B\u8981	zh\u01D4 y\xE0o	2	b	main|principal|major|primary
\u800C\u662F	\xE9r sh\xEC	4	c	rather
\u79D2	mi\u01CEo	5	t	second|arc second|instantly
\u5C5E\u4E8E	sh\u01D4 y\xFA	3	v	be classified as|belong to|be part of
\u503C\u5F97	zh\xED de	3	v	be worth|deserve
\u4EBA\u7C7B	r\xE9n l\xE8i	3	n	humanity|human race|mankind
\u738B	w\xE1ng	4	n	king or monarch|grand|great|rule|reign over
\u5E02	sh\xEC	2	n	market|city
\u624B\u672F	sh\u01D2u sh\xF9	4	n	operation|surgery
\u4EB2	q\u012Bn	3	v	parent|one's own|relative|related|marriage|bride|close|intimate
\u4E0D\u5C11	b\xF9 sh\u01CEo	2	m	many|lot|not few
\u7ECF\u5386	j\u012Bng l\xEC	3	v	experience|go through
\u8BA8\u8BBA	t\u01CEo l\xF9n	2	v	discuss|talk over
\u8D85\u8FC7	ch\u0101o gu\xF2	2	v	surpass|exceed|outstrip
\u4ECD	r\xE9ng	3	d	still|yet|remain|frequently|often
\u6BD4\u5982	b\u01D0 r\xFA	2	v	for example|for instance|such as
\u5047	ji\u01CE	2	a	fake|false|artificial|borrow|if|suppose|vacation
\u540E\u6765	h\xF2u l\xE1i	2	t	afterwards|later|newly arrived
\u52A0\u5165	ji\u0101 r\xF9	4	v	become a member|join|mix into|participate in|add in
\u5E38	ch\xE1ng	1	d	always|ever|often|frequently|common|general|constant
\u5634	zu\u01D0	2	n	mouth|beak|nozzle|spout
\u5144\u5F1F	xi\u014Dng d\xEC	4	n	brothers|younger brother|i, me|brotherly|fraternal
\u9047\u5230	y\xF9 d\xE0o	4	v	meet|run into|come across
\u8F6E	l\xFAn	4	qv	wheel|disk|ring|steamship|take turns|rotate
\u5730\u5740	d\xEC zh\u01D0	4	n	address
\u81EA\u7531	z\xEC y\xF3u	2	a	freedom|liberty|free|unrestricted
\u98DE\u673A	f\u0113i j\u012B	1	n	airplane
\u65E0\u8BBA	w\xFA l\xF9n	4	c	regardless of whether
\u6539	g\u01CEi	2	v	change|alter|transform|correct
\u7D27\u5F20	j\u01D0n zh\u0101ng	3	a	nervous|keyed up|intense|tense|strained|in short supply|scarce
\u5C31\u8981	ji\xF9 y\xE0o	2	d	will|shall|be going to
\u52A0\u6CB9	ji\u0101 y\xF3u	2	v	add oil|top up with gas|refuel|accelerate|step on the gas|make an extra effort|cheer sb on
\u6295	t\xF3u	4	v	cast|send|throw oneself|seek refuge
\u7701	sh\u011Bng	2	n	save|economize|be frugal|omit|delete|leave out|province|provincial capital
\u591C	y\xE8	2	tg	night
\u6D77	h\u01CEi	2	n	ocean|sea|numerous
\u4EC5	j\u01D0n	3	d	barely|only|merely
\u5341\u5206	sh\xED f\u0113n	2	d	very|completely|utterly|extremely|absolutely|hundred percent
\u6295\u7968	t\xF3u pi\xE0o	6	v	vote
\u966A	p\xE9i	5	v	accompany|keep sb company|assist
\u4E8B\u5B9E	sh\xEC sh\xED	3	n	fact
\u6302	gu\xE0	3	v	hang or suspend|hang up|be dead|be worried or concerned|make a phone call|register or record|kill|die
\u65E9\u4E0A	z\u01CEo shang	1	t	early morning
\u672C\u6765	b\u011Bn l\xE1i	3	d	original|originally|at first|it goes without saying|of course
\u57FA\u672C	j\u012B b\u011Bn	3	a	basic|fundamental|main|elementary
\u5BA2\u6237	k\xE8 h\xF9	5	n	client|customer
\u5C45\u7136	j\u016B r\xE1n	5	d	unexpectedly|one's surprise
\u4E13\u5BB6	zhu\u0101n ji\u0101	3	n	expert|specialist
\u7C7B	l\xE8i	3	q	kind|type|class|category|similar|like|resemble
\u8DF3	ti\xE0o	3	v	jump|hop|skip over|bounce|palpitate
\u56DE\u7B54	hu\xED d\xE1	1	v	reply|answer
\u5E74\u8F7B	ni\xE1n q\u012Bng	2	a	young
\u79F0	ch\u0113ng	2	v	weigh|state|name|appellation|praise|fit|balanced|suitable
\u5206\u6790	f\u0113n x\u012B	5	v	analyze|analysis
\u4EAB\u53D7	xi\u01CEng sh\xF2u	5	v	enjoy|live it up|pleasure
\u4E45	ji\u01D4	3	a	time|duration of time
\u6761\u4EF6	ti\xE1o ji\xE0n	2	n	condition|circumstance|term|factor|requirement|prerequisite|qualification|situation
\u72AF\u7F6A	f\xE0n zu\xEC	6	vn	commit a crime|crime|offense
\u665A\u5B89	w\u01CEn \u0101n	2	v	good night|good evening
\u4EE5\u6765	y\u01D0 l\xE1i	3	f	since
\u53CD\u5E94	f\u01CEn y\xECng	3	vn	react|respond|reaction|response|reply|chemical reaction
\u753B	hu\xE0	2	n	draw|paint|picture|painting
\u5E7F\u544A	gu\u01CEng g\xE0o	2	n	advertise|commercial|advertisement
\u903C	b\u012B	6	v	force|compel|press for|extort|press on towards|press up to|close in on|pressure
\u5730\u533A	d\xEC q\u016B	3	n	local|regional|district|region|area
\u8BB0	j\xEC	1	v	record|note|memorize|remember|mark|sign
\u5173\u6CE8	gu\u0101n zh\xF9	3	v	pay attention to|follow sth closely|follow|concern|interest|attention
\u63D0\u51FA	t\xED ch\u016B	2	v	raise|propose|put forward|suggest|post|withdraw
\u8868\u6F14	bi\u01CEo y\u01CEn	3	vn	play|show|performance|exhibition|perform|act|demonstrate
\u8B66\u5BDF	j\u01D0ng ch\xE1	3	n	police|police officer
\u5173	gu\u0101n	1	v	mountain pass|close|shut|turn off|confine|lock up|concern|involve
\u8D44\u6599	z\u012B li\xE0o	4	n	material|resources|data|information|profile
\u5173\u952E	gu\u0101n ji\xE0n	5	n	crucial point|crux|key|crucial|pivotal
\u54E5	g\u0113	1	n	elder brother
\u51A0\u519B	gu\xE0n j\u016Bn	5	n	champion
\u4EF7\u503C	ji\xE0 zh\xED	3	n	value|worth|fig. values
\u8FD0\u52A8	y\xF9n d\xF2ng	2	vn	move|exercise|sports|motion|movement|campaign
\u76F8\u5F53	xi\u0101ng d\u0101ng	3	d	equivalent to|appropriate|considerably|certain extent|fairly|quite
\u6837\u5B50	y\xE0ng zi	2	n	appearance|manner|pattern|model
\u56F0\u96BE	k\xF9n nan	3	a	difficult|challenging|straitened circumstances|difficult situation
\u7238	b\xE0	1	n	father|dad|pa|papa
\u5B9E\u73B0	sh\xED xi\xE0n	2	v	achieve|implement|realize|bring about
\u4E13\u4E1A	zhu\u0101n y\xE8	3	n	specialty|specialized field|main field of study|major|professional
\u96BE\u9053	n\xE1n d\xE0o	3	d	don't tell me|could it be that
\u725B	ni\xFA	3	n	ox|cow|bull|awesome
\u521A\u624D	g\u0101ng c\xE1i	2	t	just now|moment ago
\u732B	m\u0101o	2	n	cat|hide oneself|modem
\u98CE	f\u0113ng	1	n	wind|news|style|custom|manner
\u4E8E\u662F	y\xFA sh\xEC	4	cc	thereupon|as a result|consequently|thus|hence
\u89C4\u5B9A	gu\u012B d\xECng	3	n	stipulate|specify|prescribe|fix|set|regulations|rules|provisions
\u4EA7\u751F	ch\u01CEn sh\u0113ng	3	v	arise|come into being|come about|give rise to|bring into being|bring about|produce|engender
\u901A	t\u014Dng	2	v	go through|know well|expert|connect|communicate|open|clear
\u5BF9\u65B9	du\xEC f\u0101ng	3	n	other person|other side|other party
\u72B6\u6001	zhu\xE0ng t\xE0i	3	n	condition|state|state of affairs
\u56DE\u53BB	hu\xED qu	1	v	return|go back
\u5FC3\u7406	x\u012Bn l\u01D0	4	n	psychology|mentality
\u529E\u516C\u5BA4	b\xE0n g\u014Dng sh\xEC	2	n	office|business premises|bureau
\u6B63\u786E	zh\xE8ng qu\xE8	2	a	correct|sound|right|proper
\u7231\u60C5	\xE0i q\xEDng	2	n	romance|love
\u7167	zh\xE0o	3	v	according to|in accordance with|shine|illuminate|reflect|look at|take|photo
\u7FA4	q\xFAn	3	q	group|crowd|flock, herd, pack etc
\u6536\u5230	sh\u014Du d\xE0o	2	v	receive
\u73AF\u5883	hu\xE1n j\xECng	3	n	environment|circumstances|surroundings|ambient
\u591F	g\xF2u	2	v	enough|really|reach by stretching out
\u5FB7	d\xE9	7	n	virtue|goodness|morality|ethics|kindness|favor|character|kind
\u539F	yu\xE1n	6	b	former|original|primary|raw|level|cause|source|hara
\u6B63\u662F	zh\xE8ng sh\xEC	2	v	is precisely
\u6839	g\u0113n	4	q	root|basis|radical
\u706B	hu\u01D2	3	n	fire|urgent|ammunition|fiery or flaming|internal heat|hot|kangxi radical 86
\u8D5B	s\xE0i	6	vn	compete|competition|match|surpass|better than|superior to|excel
\u5EFA\u7ACB	ji\xE0n l\xEC	3	v	establish|set up|found
\u505C\u4E0B	t\xEDng xi\xE0	4	v	stop
\u65B9\u5411	f\u0101ng xi\xE0ng	2	n	direction|orientation
\u66F4\u52A0	g\xE8ng ji\u0101	3	d	more|even more
\u8001\u677F	l\u01CEo b\u01CEn	3	n	boss|business proprietor|robam
\u59BB\u5B50	q\u012B z\u01D0	4	n	wife and children|wife
\u6392	p\xE1i	2	v	row|line|set in order|arrange|line up|eliminate|drain|push open
\u9C7C	y\xFA	2	n	fish
\u5173\u5FC3	gu\u0101n x\u012Bn	2	v	be concerned about|care about
\u5E02\u573A	sh\xEC ch\u01CEng	3	n	marketplace|market
\u96C6	j\xED	6	q	gather|collect|collected works
\u5FC5\u8981	b\xEC y\xE0o	3	a	necessary|essential|indispensable|required
\u62A2	qi\u01CEng	5	v	fight over|rush|scramble|grab|rob|snatch|knock against|opposite in direction
\u7559\u4E0B	li\xFA xi\xE0	2	v	leave behind|stay behind|remain|keep|not to let go
\u8282	ji\xE9	2	n	joint|node|section|segment|solar term|seasonal festival|economize|save
\u50BB	sh\u01CE	5	a	foolish
\u6559\u80B2	ji\xE0o y\xF9	2	vn	educate|teach|education
\u65E5\u5B50	r\xEC zi	2	n	day|date|days of one's life
\u795D	zh\xF9	3	v	pray for|wish
\u7D2F	l\xE8i	1	a	tired|weary|strain|wear out|work hard|accumulate|involve or implicate|continuous
\u53D6	q\u01D4	2	v	take|get|choose|fetch
\u6743	qu\xE1n	6	n	authority|power|right|weigh|expedient|temporary
\u6253\u5F00	d\u01CE k\u0101i	1	v	open|show|turn on|switch on
\u5371\u9669	w\u0113i xi\u01CEn	3	a	danger|dangerous
\u4EB2\u7231	q\u012Bn \xE0i	4	a	dear|beloved|darling
\u5C42	c\xE9ng	2	qv	layer|stratum|floor|story|sheaf
\u7BA1\u7406	gu\u01CEn l\u01D0	3	vn	supervise|manage|administer|management|administration
\u4E71	lu\xE0n	3	d	in confusion or disorder|disorder|upheaval|riot|illicit sexual relations|throw into disorder|mix up|indiscriminate
\u5F85	d\xE0i	5	v	wait|treat|deal with|need|going to|about to|intending to|stay
\u75C5\u4EBA	b\xECng r\xE9n	1	n	sick person|patient|invalid
\u9002\u5408	sh\xEC h\xE9	3	v	fit|suit
\u5FC3\u91CC	x\u012Bn li	2	s	chest|heart|mind
\u6B63\u5F0F	zh\xE8ng sh\xEC	3	ad	formal|official
\u8089	r\xF2u	1	n	meat|flesh|pulp|squashy|flabby|irresolute|kangxi radical 130
\u5F15\u8D77	y\u01D0n q\u01D0	4	v	give rise to|lead to|cause|arouse
\u817F	tu\u01D0	2	n	leg|hip bone
\u6551	ji\xF9	3	v	save|assist|rescue
\u6253\u7535\u8BDD	d\u01CE di\xE0n hu\xE0	1	v	make a telephone call
\u6062\u590D	hu\u012B f\xF9	5	v	reinstate|resume|restore|recover|regain|rehabilitate
\u4ECE\u6765	c\xF3ng l\xE1i	3	d	always|at all times|never
\u4F11\u606F	xi\u016B xi	1	v	rest
\u5171	g\xF2ng	4	d	common|general|share|together|total|altogether
\u5168\u56FD	qu\xE1n gu\xF3	2	n	whole nation|nationwide|countrywide|national
\u540C\u5FD7	t\xF3ng zh\xEC	7	n	comrade|homosexual
\u5C3D	j\xECn	6	v	use up|exhaust|end|finish|utmost|exhausted|finished|limit
\u6216\u8BB8	hu\xF2 x\u01D4	4	d	perhaps|maybe
\u68D2	b\xE0ng	5	a	stick|club|cudgel|smart|capable|strong|wonderful
\u56FE	t\xFA	3	n	diagram|picture|drawing|chart|map|plan|scheme|attempt
\u5B9E\u9645\u4E0A	sh\xED j\xEC sh\xE0ng	3	d	in fact|in reality|in practice
\u8857	ji\u0113	2	n	street
\u8FBE\u5230	d\xE1 d\xE0o	3	v	reach|achieve|attain
\u6295\u8D44	t\xF3u z\u012B	4	vn	investment|invest
\u73B0\u5B9E	xi\xE0n sh\xED	3	n	reality|actuality|real|actual|realistic|pragmatic|materialistic|self-interested
\u62B1	b\xE0o	4	v	hold|carry|hug|embrace|surround|cherish|fit nicely
\u73ED	b\u0101n	1	n	team|class|grade|squad|work shift
\u5229	l\xEC	6	n	sharp|favorable|advantage|benefit|profit|interest|do good to
\u574F	hu\xE0i	1	a	bad|spoiled|broken|break down|utmost
\u4E00\u8FB9	y\u012B bi\u0101n	1	d	one side|either side|on the one hand|on the other hand|doing while
\u4E0D\u65AD	b\xF9 du\xE0n	3	d	unceasing|uninterrupted|continuous|constant
\u7B14	b\u01D0	2	q	pen|pencil|writing brush|write or compose|strokes of chinese characters
\u5185\u5BB9	n\xE8i r\xF3ng	3	n	content|substance|details
\u5A92\u4F53	m\xE9i t\u01D0	3	n	media, esp. news media
\u5F8B\u5E08	l\u01DC sh\u012B	4	n	lawyer
\u901A\u77E5	t\u014Dng zh\u012B	2	n	notify|inform|notice|notification
\u4E0A\u9762	sh\xE0ng mi\xE0n	3	f	on top of|above-mentioned|also pr
\u978B	xi\xE9	2	n	shoe
\u4E60\u60EF	x\xED gu\xE0n	2	n	habit|custom|usual practice|be used to
\u75DB	t\xF2ng	3	a	ache|pain|sorrow|deeply|thoroughly
\u611F\u60C5	g\u01CEn q\xEDng	3	n	emotion|sentiment|affection|feelings between two persons
\u76EE\u7684	m\xF9 d\xEC	2	n	purpose|aim|goal|target|objective
\u89C2\u4F17	gu\u0101n zh\xF2ng	3	n	spectators|audience|visitors
\u53D8\u5316	bi\xE0n hu\xE0	3	vn	change|vary|variation
\u56FD\u9645	gu\xF3 j\xEC	2	n	international
\u7F8E\u4E3D	m\u011Bi l\xEC	3	a	beautiful
\u610F\u8BC6	y\xEC sh\xED	5	n	consciousness|awareness|be aware|realize
\u8FFD	zhu\u012B	3	v	chase|pursue|look into|investigate|reminisce|recall|court|binge-watch
\u5BFC\u81F4	d\u01CEo zh\xEC	4	v	lead to|create|cause|bring about
\u5468\u672B	zh\u014Du m\xF2	2	t	weekend
\u7ECF\u9A8C	j\u012Bng y\xE0n	3	n	experience
\u96C6\u4E2D	j\xED zh\u014Dng	3	v	concentrate|centralize|focus|centralized|concentrated|put together
\u7834	p\xF2	3	v	broken|damaged|worn out|lousy|rotten|break, split or cleave|get rid of|destroy
\u6218\u4E89	zh\xE0n zh\u0113ng	4	n	war|conflict
\u63A8	tu\u012B	2	v	push|cut|refuse|reject|decline|shirk|put off|delay
\u7406\u7531	l\u01D0 y\xF3u	3	n	reason|grounds|justification
\u542C\u8BF4	t\u012Bng shu\u014D	2	v	hear|one hears|hearsay|listening and speaking
\u5200	d\u0101o	3	n	knife|blade|single-edged sword|cutlass|dollar
\u611F\u53D7	g\u01CEn sh\xF2u	3	v	sense|perception|feel|experience|feeling|impression
\u673A\u6784	j\u012B g\xF2u	4	n	mechanism|structure|organization|agency|institution
\u53CD	f\u01CEn	4	v	contrary|in reverse|reverse|return|oppose|opposite|against|anti-
\u6CB9	y\xF3u	2	n	oil|fat|grease|petroleum|oily|greasy|glib|cunning
\u5B8C\u7F8E	w\xE1n m\u011Bi	3	a	perfect
\u76F4\u5230	zh\xED d\xE0o	3	v	until
\u4F20	chu\xE1n	3	v	pass on|spread|transmit|infect|transfer|circulate|conduct|biography
\u4F24\u5BB3	sh\u0101ng h\xE0i	4	v	injure|harm
\u6D17	x\u01D0	1	v	wash|bathe|develop|shuffle|erase
\u771F\u5B9E	zh\u0113n sh\xED	3	a	true|real
\u79D1\u5B66	k\u0113 xu\xE9	2	n	science|scientific knowledge|scientific|rational
\u540E\u9762	h\xF2u mian	3	f	back|rear|last bit|behind|near the end|at the back|later|afterwards
\u6709\u7684	y\u01D2u de	1	r	some
\u5582	w\xE8i	2	v	hey|feed|hello
\u5FC3\u60C5	x\u012Bn q\xEDng	2	n	mood|frame of mind
\u8BB0\u5F55	j\xEC l\xF9	3	n	record|note-taker
\u9519\u8BEF	cu\xF2 w\xF9	3	n	mistaken|false|wrong|error|mistake
\u7A7A\u95F4	k\u014Dng ji\u0101n	4	n	space|room|scope|leeway|outer space
\u51B2	ch\u014Dng	4	v	dash against|mix with water|infuse|rinse|flush|develop|rise in the air|clash
\u671F\u5F85	q\u012B d\xE0i	4	v	look forward to|await|expectation
\u6574	zh\u011Bng	3	m	exactly|in good order|whole|complete|entire|in order|orderly|repair
\u6807\u51C6	bi\u0101o zh\u01D4n	3	n	standard|norm|criterion|good|correct|conforming to a standard
\u804C\u4E1A	zh\xED y\xE8	3	n	occupation|profession|vocation|professional
\u6BDB	m\xE1o	1	nr	hair|feather|down|wool|mildew|mold|coarse or semifinished|young
\u653F\u6CBB	zh\xE8ng zh\xEC	4	n	politics|political
\u7CBE\u5F69	j\u012Bng c\u01CEi	3	a	wonderful|marvelous|brilliant
\u671D	ch\xE1o	3	p	imperial or royal court|government|dynasty|make a pilgrimage to|facing|towards|morning
\u503C	zh\xED	3	v	value|worth|happen to|be on duty
\u4E00\u65E6	y\u012B d\xE0n	5	d	in case|if|once|when|in a short time|in one day
\u526F	f\xF9	6	b	secondary|auxiliary|deputy|assistant|vice-
\u8303\u56F4	f\xE0n w\xE9i	3	n	range|scope|limit|extent
\u4E8B\u4E1A	sh\xEC y\xE8	3	n	undertaking|project|activity|cause|career|occupation
\u627F\u8BA4	ch\xE9ng r\xE8n	4	v	admit|concede|recognize|recognition|acknowledge
\u6267\u884C	zh\xED x\xEDng	5	v	implement|carry out|execute|run
\u602A	gu\xE0i	4	v	bewildering|odd|strange|uncanny|devil|monster|wonder at|blame
\u63A5\u7740	ji\u0113 zhe	2	c	catch and hold on|continue|follow|carry on|then|after that|subsequently|proceed
\u5FD8\u8BB0	w\xE0ng j\xEC	1	v	forget
\u75DB\u82E6	t\xF2ng k\u01D4	3	an	pain|suffering|painful
\u6D41	li\xFA	2	v	flow|disseminate|circulate or spread|move or drift|degenerate|class, rate or grade
\u901F\u5EA6	s\xF9 d\xF9	3	n	speed|rate|velocity|tempo
\u5B9E\u5728	sh\xED z\xE0i	2	d	really|actually|indeed|true|real|honest|dependable|reality
\u6587\u4EF6	w\xE9n ji\xE0n	3	n	document|file
\u8868	bi\u01CEo	2	n	exterior surface|family relationship via females|show|model|table|form|meter|watch
\u663E\u7136	xi\u01CEn r\xE1n	3	a	clearly|evidently|obviously
\u7A7A	k\xF2ng	3	a	empty|vacant|unoccupied|space|leisure|free time|air|sky
\u517B	y\u01CEng	2	v	raise|bring up|keep|support|give birth
\u8239	chu\xE1n	2	n	boat|vessel|ship
\u82E5	ru\xF2	6	c	seem|like|as|if
\u5DE6\u53F3	zu\u01D2 y\xF2u	3	m	left and right|nearby|approximately|attendant|control|influence
\u5916\u9762	w\xE0i mi\xE0n	3	f	outside|surface|exterior|external appearance
\u6548\u679C	xi\xE0o gu\u01D2	3	n	result|effect|efficacy|sound or visual effects
\u9E21	j\u012B	2	n	fowl|chicken|prostitute
\u623F\u95F4	f\xE1ng ji\u0101n	1	n	room
\u904D	bi\xE0n	2	qv	everywhere|all over
\u578B	x\xEDng	4	k	mold|type|style|model
\u516B	b\u0101	1	m	eight
\u4F20\u7EDF	chu\xE1n t\u01D2ng	4	n	tradition|traditional|convention|conventional
\u76D8	p\xE1n	4	qv	plate|dish|tray|board|hard drive|build|coil|check
\u600E\u4E48\u6837	z\u011Bn me y\xE0ng	2	r	how|how about|how was it|how are things
\u72B6\u51B5	zhu\xE0ng ku\xE0ng	3	n	condition|state|situation
\u666E\u901A	p\u01D4 t\u014Dng	2	a	common|ordinary|general|average
\u74F6	p\xEDng	2	q	bottle|vase|pitcher
\u6253\u7B97	d\u01CE su\xE0n	2	v	plan|intend|calculate|intention|calculation
\u5206\u4EAB	f\u0113n xi\u01CEng	5	v	share
\u67B6	ji\xE0	3	qv	support|frame|rack|framework
\u4E08\u592B	zh\xE0ng fu	4	n	husband
\u7ECF\u6D4E	j\u012Bng j\xEC	3	n	economy|economic
\u800C\u5DF2	\xE9r y\u01D0	7	y	that's all|nothing more
\u6309\u7167	\xE0n zh\xE0o	3	p	according to|in accordance with|in the light of|on the basis of
\u7FFB	f\u0101n	4	v	turn over|flip over|overturn|rummage through|translate|decode|double|climb over or into
\u5973\u6027	n\u01DA x\xECng	5	n	woman|female sex
\u6709\u6548	y\u01D2u xi\xE0o	3	a	effective|in effect|valid
\u4E4B\u7C7B	zh\u012B l\xE8i	6	r	and so on|and such
\u4F5C\u54C1	zu\xF2 p\u01D0n	3	n	work|opus
\u53CD\u5BF9	f\u01CEn du\xEC	3	v	oppose|be against|object to
\u91CD\u70B9	zh\xF2ng di\u01CEn	2	n	important point|main point|focus|key|focus on|put the emphasis on|recount|re-evaluate
\u7ADF\u7136	j\xECng r\xE1n	4	d	unexpectedly|one's surprise|in spite of everything|in that crazy way|actually
\u5BA4	sh\xEC	3	n	room|work unit|grave|scabbard|family or clan
\u5DE6	zu\u01D2	1	f	left|east|unorthodox|queer|wrong|differing|opposite
\u65F6\u4EE3	sh\xED d\xE0i	3	n	age|era|epoch|period
\u4F1F\u5927	w\u011Bi d\xE0	3	a	huge|great|grand|important
\u54C8\u54C8	h\u0101 h\u0101	3	o	laughing out loud
\u55EF	\xE8n	6	e	ok, yeah|what
\u6587	w\xE9n	7	g	language|culture|writing|formal|literary|gentle|classifier for coins|kangxi radical 67
\u7684\u786E	d\xED qu\xE8	4	d	really|indeed
\u500D	b\xE8i	4	q	-fold|times|double|increase or multiply
\u51C6	zh\u01D4n	3	a	accurate|standard|definitely|certainly|about to become|quasi-|para-|allow
\u9192	x\u01D0ng	4	v	wake up|be awake|become aware|sober up|come to
\u8BA8\u538C	t\u01CEo y\xE0n	5	v	dislike|loathe|disagreeable|troublesome|annoying
\u8EAB\u4EFD	sh\u0113n f\xE8n	4	n	identity|aspect of one's identity|role|status|position|rank
\u8F93	sh\u016B	3	v	lose|be beaten|transport|donate|contribute|enter
\u6781	j\xED	4	d	extremely|pole|utmost|top
\u5145\u6EE1	ch\u014Dng m\u01CEn	3	v	full of|brimming with|very full|permeated
\u54B1\u4EEC	z\xE1n men	2	r	i or me|you|also pr
\u76AE	p\xED	3	n	leather|skin|fur|pico-|naughty
\u4EBA\u7269	r\xE9n w\xF9	5	n	person|personage|figure|character|figure painting
\u7ECF	j\u012Bng	7	p	classics|sacred book|scripture|pass through|undergo|bear|endure|warp
\u5C0F\u5FC3	xi\u01CEo x\u012Bn	2	a	be careful|take care
\u8981\u662F	y\xE0o shi	3	c	if
\u5403\u996D	ch\u012B f\xE0n	1	v	have a meal|eat|make a living
\u7CFB	x\xEC	3	v	connect|relate to|tie up|bind|be|system|department|faculty
\u514D\u8D39	mi\u01CEn f\xE8i	4	v	free
\u5426\u5219	f\u01D2u z\xE9	4	c	otherwise|if not|or
\u724C	p\xE1i	4	n	mahjong tile|playing card|game pieces|signboard|plate|tablet|medal
\u52A8\u4F5C	d\xF2ng zu\xF2	1	n	movement|motion|action|act|move
\u4E03	q\u012B	1	m	seven
\u4E0D\u591F	b\xF9 g\xF2u	2	a	not enough|insufficient|inadequate
\u4FE9	li\u01CE	4	m	both|some
\u589E\u52A0	z\u0113ng ji\u0101	3	v	raise|increase
\u76F4	zh\xED	3	d	straight|straighten|fair and reasonable|frank|straightforward|vertical
\u4EA7\u54C1	ch\u01CEn p\u01D0n	4	n	goods|merchandise|product
\u600E\u4E48\u529E	z\u011Bn me b\xE0n	2	r	what's to be done
\u6210\u5458	ch\xE9ng yu\xE1n	3	n	member
\u67AA	qi\u0101ng	5	n	gun|firearm|rifle|spear|knock
\u4FDD\u9669	b\u01CEo xi\u01CEn	3	n	insurance|insure|safe|secure|be sure|be bound to
\u5E74\u4EE3	ni\xE1n d\xE0i	3	n	decade of a century|age|era|period
\u6D4B\u8BD5	c\xE8 sh\xEC	4	vn	test|beta
\u4E3E\u884C	j\u01D4 x\xEDng	2	v	hold
\u60F3\u6CD5	xi\u01CEng f\u01CE	2	n	way of thinking|opinion|notion|think of a way
\u9886\u5BFC	l\u01D0ng d\u01CEo	3	n	lead|leading|leadership|leader
\u843D	lu\xF2	4	v	fall or drop|set|go out|lower|decline or sink|lag or fall behind|fall onto|rest with
\u8457\u540D	zh\xF9 m\xEDng	4		famous|noted|well-known|celebrated
\u52A8\u7269	d\xF2ng w\xF9	2	n	animal
\u4E0D\u884C	b\xF9 x\xEDng	2	a	won't do|be no good|not work|not be capable
\u62D2\u7EDD	j\xF9 ju\xE9	5	v	refuse|decline|reject
\u5BFB\u627E	x\xFAn zh\u01CEo	4	v	seek|look for
\u80DC\u5229	sh\xE8ng l\xEC	3	v	victory
\u68A6\u60F3	m\xE8ng xi\u01CEng	4	n	dream of|dream
\u75AF	f\u0113ng	5	v	insane|mad|wild
\u83DC	c\xE0i	1	n	dish|vegetable|cuisine|type|weak|poor
\u5E05	shu\xE0i	4	nr	commander-in-chief|lead|command|handsome|graceful|dashing|elegant|cool
\u660E\u661F	m\xEDng x\u012Bng	2	n	star|celebrity
\u53D7\u4F24	sh\xF2u sh\u0101ng	3	v	sustain injuries|wounded|harmed
\u7EA7	j\xED	2	q	level|grade|rank|step|classifier: step, level
\u7A0B\u5EA6	ch\xE9ng d\xF9	3	n	degree|level|extent
\u4EE3	d\xE0i	3	v	substitute|replace|generation|dynasty|age|period|era|eon
\u4E0B\u9762	xi\xE0 mi\xE0n	3	f	below|under|next|following|also pr|boil noodles
\u7406\u8BBA	l\u01D0 l\xF9n	3	n	theory|argue|take notice of
\u7F51\u7EDC	W\u01CEng lu\xF2	4	n	internet|network
\u5F0F	sh\xEC	5	k	type|form|pattern|style
\u4E0D\u4EC5	b\xF9 j\u01D0n	3	c	not just|not limited to|not only
\u5BA3\u5E03	xu\u0101n b\xF9	3	v	declare|announce|proclaim
\u8863\u670D	y\u012B fu	1	n	clothes
\u671F	q\u012B	3	qv	period of time|phase|stage|time|term|period|hope|taiwan pr
\u59D1\u5A18	g\u016B niang	3	n	girl|young woman|young lady|daughter|paternal aunt
\u987A\u5229	sh\xF9n l\xEC	2	a	smoothly|without a hitch
\u521B\u9020	chu\xE0ng z\xE0o	3	v	create|bring about|produce|set
\u997F	\xE8	1	v	be hungry|hungry|starve
\u53F3	y\xF2u	1	f	right|right-hand side|right of center|west
\u6811	sh\xF9	1	n	tree|cultivate|set up
\u8C03	di\xE0o	3	v	transfer|move|investigate|enquire into|accent|view|argument|key
\u547D	m\xECng	6	n	life|fate|order or command
\u961F\u4F0D	du\xEC w\u01D4	6	n	ranks|troops|queue|line|procession
\u5446	d\u0101i	5	v	foolish|stupid|expressionless|blank|stay
\u4E0D\u77E5	b\xF9 zh\u012B	7	v	not to know|unaware|unknowingly|fig. not to admit
\u70E7	sh\u0101o	4	v	burn|cook|stew|bake|roast|heat|boil|fever
\u827A\u672F	y\xEC sh\xF9	3	n	art
\u6C34\u5E73	shu\u01D0 p\xEDng	2	n	level|standard|horizontal
\u7F51	w\u01CEng	2	n	net|network
\u9EBB\u70E6	m\xE1 fan	3	an	trouble|inconvenience|inconvenient|troublesome|annoying|bother sb|put sb to trouble
\u4E8B\u6545	sh\xEC g\xF9	3	n	accident
\u96F7	l\xE9i	5	n	thunder|shock|stun|astound|spoiler|reveal plot details to
\u4E0A\u73ED	sh\xE0ng b\u0101n	1	v	go to work|be on duty|start work|go to the office
\u501F	ji\xE8	2	v	lend|borrow|by means of|take
\u6570\u636E	sh\xF9 j\xF9	4	n	data
\u9B3C	gu\u01D0	5	n	disembodied spirit|ghost|devil|sly|crafty
\u6293\u4F4F	zhu\u0101 zh\xF9	3	v	grab hold of|capture
\u7533\u8BF7	sh\u0113n q\u01D0ng	4	v	apply for sth|application form
\u7F8E\u597D	m\u011Bi h\u01CEo	3	a	beautiful|fine
\u6B66\u5668	w\u01D4 q\xEC	3	n	weapon|arms
\u5B89	\u0101n	4	v	calm|peaceful|set at ease|safe|secure|in good health|content|install
\u751F\u65E5	sh\u0113ng r\xEC	1	n	birthday
\u4E1C	d\u014Dng	1	f	east|host|landlord
\u5404\u79CD	g\xE8 zh\u01D2ng	3	r	every kind of|all kinds of|various
\u59D0\u59D0	ji\u011B jie	1	n	older sister
\u5708	qu\u0101n	4	qv	circle|ring|loop|surround|livestock enclosure|pen|fold|sty
\u8BFE	k\xE8	1	n	subject|course|class|lesson|levy|tax|form of divination
\u62DB	zh\u0101o	6	v	recruit|provoke|beckon|incur|infect|contagious|move|maneuver
\u601D\u60F3	s\u012B xi\u01CEng	3	n	thought|thinking|idea|ideology
\u56FD	gu\xF3	1	n	country|nation|state|national
\u7834\u574F	p\xF2 hu\xE0i	3	v	destruction|damage|wreck|break|destroy
\u5373	j\xED	7	v	namely|that is|i.e|prompt|at once|at present|even if|prompted
\u6D88\u5931	xi\u0101o sh\u012B	3	v	disappear|fade away
\u996D	f\xE0n	1	n	cooked rice|meal|fan|devotee
\u957F\u5927	zh\u01CEng d\xE0	2	v	grow up
\u4EA4\u7ED9	ji\u0101o g\u011Bi	2	v	give|deliver|hand over
\u5934\u53D1	t\xF3u fa	2	n	hair
\u5C01	f\u0113ng	2	q	confer|grant|bestow a title|seal
\u5BB3\u6015	h\xE0i p\xE0	3	v	be afraid|be scared
\u7A33\u5B9A	w\u011Bn d\xECng	4	a	steady|stable|stability|stabilize|pacify
\u86CB	d\xE0n	2	n	egg|oval-shaped thing
\u5DE8\u5927	j\xF9 d\xE0	4	a	huge|immense|very large|tremendous|gigantic|enormous
\u79D1	k\u0113	2	n	branch of study|administrative section|division|field|branch|stage directions|family|rules
\u85CF	c\xE1ng	6	v	conceal|hide away|harbor|store|collect|storehouse|depository|buddhist or taoist scripture
\u7248	b\u01CEn	5	n	register|block of printing|edition|version|page
\u9F99	l\xF3ng	3	n	dragon|imperial
\u82F1\u96C4	y\u012Bng xi\xF3ng	6	n	hero
\u4E00\u534A	y\u012B b\xE0n	1	m	half
\u534F\u8BAE	xi\xE9 y\xEC	5	n	agreement|pact|protocol
\u6EE1\u8DB3	m\u01CEn z\xFA	3	v	satisfy|meet|satisfied|content
\u552F	w\xE9i	7	d	only|alone|-ism (in chinese|yes
\u914D	p\xE8i	3	v	join|fit|mate|mix|match|deserve|make up|allocate
\u4E1D	s\u012B	7	n	silk|thread|trace|shreds or julienne strips|classifier: a thread|bit|iota|hint etc
\u5BB6\u4EBA	ji\u0101 r\xE9n	1	n	family member|servant
\u571F\u5730	t\u01D4 d\xEC	4	n	land|soil|territory|local god|genius loci
\u5A01\u80C1	w\u0113i xi\xE9	6	v	threaten|menace
\u8001\u5A46	l\u01CEo p\xF3	4	n	wife
\u7B49\u5F85	d\u011Bng d\xE0i	3	v	wait|wait for
\u6709\u65F6	y\u01D2u sh\xED	1	d	sometimes|now and then
\u6F14\u51FA	y\u01CEn ch\u016B	3	v	act|perform|put on|performance|concert|show
\u5360	zh\xE0n	2	v	take possession of|occupy|take up|observe|divine
\u6311\u6218	ti\u01CEo zh\xE0n	4	vn	challenge
\u4E50	l\xE8	3	a	happy|cheerful|laugh|music
\u8BCD	c\xED	2	n	word|statement|speech|lyrics
\u5C0F\u59D0	xi\u01CEo jie	1	n	young lady|miss|prostitute
\u4E8B\u5B9E\u4E0A	sh\xEC sh\xED sh\xE0ng	3	l	in fact|in reality|actually|de facto|ipso facto
\u5BF9\u4E0D\u8D77	du\xEC bu q\u01D0	1	v	i'm sorry|excuse me|i beg your pardon|let down|disappoint
\u79D8\u5BC6	m\xEC m\xEC	4	n	secret|private|confidential|clandestine
\u653B\u51FB	g\u014Dng j\u012B	6	v	attack|accuse|charge
\u8D85\u7EA7	ch\u0101o j\xED	3	b	super-|ultra-|hyper-
\u732A	zh\u016B	3	n	hog|pig|swine
\u9547	zh\xE8n	6	n	press down|calm|subdue|suppress|guard|garrison|small town|cool or chill
\u7ADE\u4E89	j\xECng zh\u0113ng	5	vn	compete|competition
\u4F30\u8BA1	g\u016B j\xEC	5	v	estimate|reckon|suppose
\u5931\u8D25	sh\u012B b\xE0i	4	v	be defeated|lose|fail|failure|defeat
\u5B63	j\xEC	4	q	season
\u8BBE\u5907	sh\xE8 b\xE8i	3	n	equipment|facilities|installations
\u9E1F	ni\u01CEo	2	n	bird|pay attention to|damned|goddamn|penis
\u610F\u5473\u7740	y\xEC w\xE8i zhe	5	v	signify|mean|imply
\u4FDD	b\u01CEo	3	v	defend|protect|keep|guarantee|ensure|bulgaria|bulgarian
\u56E2	tu\xE1n	3	n	round|lump|ball|roll into a ball|gather|regiment|group|society
\u4E16\u7EAA	sh\xEC j\xEC	3	n	century
\u5236\u9020	zh\xEC z\xE0o	3	v	manufacture|make
\u7D27	j\u01D0n	3	a	tight|strict|close at hand|near|urgent|tense|hard up|short of money
\u4FF1\u4E50\u90E8	j\xF9 l\xE8 b\xF9	5	n	club
\u5BF9\u624B	du\xEC sh\u01D2u	3	n	opponent|rival|competitor|adversary|match
\u62BD	ch\u014Du	4	v	draw out|sprout or bud|whip or thrash
\u8BC1	zh\xE8ng	3	n	certificate|proof|prove|demonstrate|confirm|admonish
\u4E0D\u5F97\u4E0D	b\xF9 d\xE9 b\xF9	3	d	cannot but|have to|can't help it|can't avoid
\u60F3\u8C61	xi\u01CEng xi\xE0ng	4	v	imagine|envision|imagination
\u53D6\u5F97	q\u01D4 d\xE9	2	v	acquire|get|obtain
\u5F53\u5730	d\u0101ng d\xEC	3	s	local
\u5141\u8BB8	y\u01D4n x\u01D4	6	v	permit|allow
\u5927\u6982	d\xE0 g\xE0i	3	d	roughly|probably|rough|approximate|about|general idea
\u60F3\u8D77	xi\u01CEng q\u01D0	2	v	recall|think of|call to mind
\u6559\u6388	ji\xE0o sh\xF2u	4	n	professor|instruct|lecture on
\u6F14	y\u01CEn	3	v	develop|evolve|practice|perform|play|act
\u84DD	l\xE1n	2	a	blue|indigo plant
\u6240\u8C13	su\u01D2 w\xE8i	7	v	so-called|what is called
\u9519\u8FC7	cu\xF2 gu\xF2	6	v	miss
\u5438\u5F15	x\u012B y\u01D0n	4	v	attract|appeal to|fascinate
\u6848\u4EF6	\xE0n ji\xE0n	7	n	case|instance
\u987F	d\xF9n	3	qv	stop|pause|arrange|lay out|kowtow|stamp|at once
\u4E4B\u4E2D	zh\u012B zh\u014Dng	5	f	inside|among|in the midst of|during
\u7EB8	zh\u01D0	2	n	paper
\u5171\u540C	g\xF2ng t\xF3ng	3	d	common|joint|jointly|together|collaborative
\u6050\u6016	k\u01D2ng b\xF9	7	a	terrible|frightful|frightening|terror|terrorist
\u80CC	b\xE8i	2	v	turn one's back|hide something from|learn by heart|recite from memory|unlucky|hard of hearing|be burdened
\u9876	d\u01D0ng	4	v	apex|crown of the head|top|roof|most|carry on the head|push to the top|go against
\u8FDB\u53BB	j\xECn q\xF9	1	v	go in
\u4E00\u751F	y\u012B sh\u0113ng	2	n	all one's life|throughout one's life
\u6742\u5FD7	z\xE1 zh\xEC	3	n	magazine
\u65E2\u7136	j\xEC r\xE1n	4	c	since|as|this being the case
\u7167\u987E	zh\xE0o gu	2	v	take care of|show consideration|attend to|look after
\u8D27	hu\xF2	4	n	goods|money|commodity
\u9700	x\u016B	7	v	require|need|want|necessity
\u505C\u6B62	t\xEDng zh\u01D0	3	v	stop|halt|cease
\u6587\u5316	w\xE9n hu\xE0	3	n	culture|civilization|cultural
\u7279\u6B8A	t\xE8 sh\u016B	4	a	special|particular|unusual|extraordinary
\u63D0\u9192	t\xED x\u01D0ng	4	v	remind|call attention to|warn of
\u81EA\u6211	z\xEC w\u01D2	6	r	self-|ego
\u6025	j\xED	2	v	urgent|pressing|rapid|hurried|worried|make anxious
\u72AF	f\xE0n	6	v	violate|offend|assault|criminal|crime|make a mistake|recurrence
\u5177\u4F53	j\xF9 t\u01D0	3	a	concrete|definite|specific
\u75BC	t\xE9ng	2	v	hurts|sore|love dearly
\u5408	h\xE9	3	v	close|join|fit|be equal to|whole|together|round|conjunction
\u6F14\u5458	y\u01CEn yu\xE1n	3	n	actor or actress|performer
\u98CE\u683C	f\u0113ng g\xE9	4	n	style
\u6001\u5EA6	t\xE0i du	2	n	manner|bearing|attitude|approach
\u5468\u56F4	zh\u014Du w\xE9i	3	f	environs|surroundings|periphery
\u5EFA\u7B51	ji\xE0n zh\xF9	5	n	construct|building
\u5C0F\u7EC4	xi\u01CEo z\u01D4	2	n	group
\u7F57	lu\xF3	7	b	gauze|collect|gather|catch|sift
\u4E22	di\u016B	5	v	lose|put aside|throw
\u54E5\u54E5	g\u0113 ge	1	n	older brother
\u5947\u602A	q\xED gu\xE0i	3	v	strange|odd|marvel|be baffled
\u89D2\u8272	ju\xE9 s\xE8	4	n	role|character in a novel|persona|also pr
\u590D\u6742	f\xF9 z\xE1	3	a	complicated|complex
\u75AF\u72C2	f\u0113ng ku\xE1ng	5	a	crazy|frenzied|wild
\u59D4\u5458\u4F1A	w\u011Bi yu\xE1n hu\xEC	7	n	committee
\u5F7B\u5E95	ch\xE8 d\u01D0	4	ad	thorough|thoroughly|complete
\u6CA1\u4EC0\u4E48	m\xE9i sh\xE9n me	1	v	nothing|it doesn't matter|it's nothing|never mind
\u8868\u8FBE	bi\u01CEo d\xE1	3	v	express|convey
\u6295\u5165	t\xF3u r\xF9	4	v	throw into|put into|throw oneself into|participate in|invest in|absorbed|engrossed
\u80DC	sh\xE8ng	3	v	victory|success|beat|defeat|surpass|victorious|superior to|get the better of
\u6162\u6162	m\xE0n m\xE0n	3	d	slowly
\u5E45	f\xFA	5	q	width|roll
\u8DEF\u4E0A	l\xF9 shang	1	s	on the road|on a journey|road surface
\u6570\u5B57	sh\xF9 z\xEC	2	n	numeral|digit|number|figure|amount|digital
\u538B	y\u0101	3	v	press|push down|keep under|pressure
\u793C\u7269	l\u01D0 w\xF9	2	n	gift|present
\u683C	g\xE9	7	n	square|frame|rule|case|style|character|standard|pattern
\u786E\u4FDD	qu\xE8 b\u01CEo	3	v	ensure|guarantee
\u5929\u6C14	ti\u0101n q\xEC	1	n	weather
\u821E	w\u01D4	5	v	dance|wield|brandish
\u6709\u6240	y\u01D2u su\u01D2	7	v	somewhat|some extent
\u5EFA	ji\xE0n	3	v	establish|found|set up|build|construct
\u9152\u5E97	ji\u01D4 di\xE0n	2	n	wine shop|pub|hotel|restaurant|hostess club
\u670D	f\xFA	6	v	clothes|dress|garment|serve (in the military|prison sentence etc)|obey|be convinced|convince
\u9080\u8BF7	y\u0101o q\u01D0ng	5	v	invite|invitation
\u52A0\u4E0A	ji\u0101 sh\xE0ng	5	v	plus|put in|add|add on|add into|in addition|on top of that
\u4EA4\u901A	ji\u0101o t\u014Dng	2	n	be connected|traffic|transportation|communications|liaison
\u961F\u5458	du\xEC yu\xE1n	3	n	team member
\u4F18\u79C0	y\u014Du xi\xF9	4	a	outstanding|excellent
\u4EAE	li\xE0ng	2	v	bright|clear|resonant|shine|show|reveal
\u7BC7	pi\u0101n	2	q	sheet|piece of writing
\u513F\u7AE5	\xE9r t\xF3ng	4	n	child
\u8DB3\u591F	z\xFA g\xF2u	3	v	enough|sufficient
\u51FA\u53E3	ch\u016B k\u01D2u	2	v	exit|speak|export|leave port
\u5E03	b\xF9	3	n	cloth|declare|announce|spread|make known
\u6743\u5229	qu\xE1n l\xEC	4	n	right|power and wealth
\u62CD\u6444	p\u0101i sh\xE8	5	v	take|shoot
\u5496\u5561	k\u0101 f\u0113i	3	n	coffee
\u65E2	j\xEC	4	c	already|since|both
\u6837	y\xE0ng	6	q	manner|pattern|way|appearance|shape|classifier: kind, type
\u533A\u57DF	q\u016B y\xF9	5	n	area|region|district
\u91C7\u53D6	c\u01CEi q\u01D4	3	v	adopt or carry out|take
\u610F\u5916	y\xEC w\xE0i	3	a	unexpected|accident|mishap
\u671F\u95F4	q\u012B ji\u0101n	4	f	period of time|time|time period|period
\u6700\u597D	zu\xEC h\u01CEo	1	d	best|had better
\u5473\u9053	w\xE8i dao	2	n	flavor|taste|feeling|sense|hint|interest|delight|smell
\u624B\u91CC	sh\u01D2u l\u01D0	4	s	in hand|in sb's hands
\u65F6\u523B	sh\xED k\xE8	3	n	time|juncture|moment|period of time|constantly|always
\u98CE\u9669	f\u0113ng xi\u01CEn	3	n	risk|hazard
\u5E73	p\xEDng	2	a	flat|level|equal|tie|draw|calm|peaceful
\u65AD	du\xE0n	3	v	break|snap|cut off|judge|absolutely|definitely|decidedly
\u5343\u4E07	qi\u0101n w\xE0n	3	m	ten million|countless|many
\u89C2\u5BDF	gu\u0101n ch\xE1	3	v	observe|watch|survey
\u5357	n\xE1n	1	b	south
\u613F	yu\xE0n	5	v	hope|wish|desire|hoped-for|ready|willing|honest|prudent
\u51FA\u53D1	ch\u016B f\u0101	2	v	set off|start
\u7406	l\u01D0	6	v	texture|grain|inner essence|intrinsic order|reason|logic|truth|science
\u949F	zh\u014Dng	3	n	handleless cup|goblet|concentrate|clock|o'clock|bell
\u6068	h\xE8n	5	v	hate|regret
\u63A5\u5230	ji\u0113 d\xE0o	2	v	receive
\u96BE\u4EE5	n\xE1n y\u01D0	5	d	hard to
\u5C04	sh\xE8	5	v	shoot|launch|allude to|radio-
\u8003\u8BD5	k\u01CEo sh\xEC	1	vn	take an exam|exam
\u63A5\u8FD1	ji\u0113 j\xECn	3	v	approach|get close to
\u80A1	g\u01D4	6	q	thigh|part of a whole|portion of a sum|share|strand of a thread
\u63D0\u9AD8	t\xED g\u0101o	2	v	raise|increase|improve
\u6709\u65F6\u5019	y\u01D2u sh\xED hou	1	d	sometimes
\u8DDD\u79BB	j\xF9 l\xED	4	n	distance|be apart from
\u5343	qi\u0101n	2	m	thousand
\u8F7B\u677E	q\u012Bng s\u014Dng	4	a	light|gentle|relaxed|effortless|uncomplicated|relax|take things less seriously
\u8FD0	y\xF9n	5	v	move|transport|use|apply|fortune|luck|fate
\u654C\u4EBA	d\xED r\xE9n	4	n	enemy
\u91CD\u5927	zh\xF2ng d\xE0	3	a	great|important|major|significant
\u8868\u660E	bi\u01CEo m\xEDng	3	v	make clear|make known|state clearly|indicate|known
\u8BF4\u5B9E\u8BDD	shu\u014D sh\xED hu\xE0	6	v	speak the truth|truth to tell|frankly
\u5899	qi\xE1ng	2	n	wall
\u65F6\u5C1A	sh\xED sh\xE0ng	7	n	fashion|fad|fashionable
\u7A0B\u5E8F	ch\xE9ng x\xF9	4	n	procedures|sequence|order|computer program
\u5177\u6709	j\xF9 y\u01D2u	3	v	have|possess
\u5251	ji\xE0n	6	n	double-edged sword
\u533B\u7597	y\u012B li\xE1o	4	n	medical treatment
\u6301\u7EED	ch\xED x\xF9	3	v	continue|persist|last|sustainable|preservation
\u548C\u5E73	h\xE9 p\xEDng	3	n	peace|peaceful
\u6BD5\u4E1A	b\xEC y\xE8	4	v	graduation|graduate|finish school
\u5207	qi\xE8	4	v	definitely|absolutely|yeah, right|tut|grind|close to|eager|correspond to
\u5BB6\u4F19	ji\u0101 huo	7	n	domestic animal|guy|chap|weapon
\u677F	b\u01CEn	3	g	board|plank|plate|shutter|table tennis bat|clappers|hard|stiff
\u6EE1\u610F	m\u01CEn y\xEC	2	v	satisfied|pleased|one's satisfaction
\u6000\u7591	hu\xE1i y\xED	4	v	doubt|be skeptical of|have one's doubts|harbor suspicions|suspect that
\u620F	x\xEC	5	n	trick|drama|play|show
\u5408\u540C	h\xE9 tong	4	n	contract
\u98DF\u7269	sh\xED w\xF9	2	n	food
\u6162	m\xE0n	1	a	slow
\u53D1\u8868	f\u0101 bi\u01CEo	3	v	issue|publish
\u5904\u4E8E	ch\u01D4 y\xFA	4	v	be in
\u7206\u70B8	b\xE0o zh\xE0	6	v	explosion|explode|blow up|detonate
\u5783\u573E	l\u0101 j\u012B	4	n	trash|refuse|garbage|of poor quality|taiwan pr
\u4FEE	xi\u016B	3	v	decorate|embellish|repair|build|write|cultivate|study|take
\u76F8\u5173	xi\u0101ng gu\u0101n	3	vn	related|relevant|pertinent|be interrelated|correlation
\u4EF7\u683C	ji\xE0 g\xE9	3	n	price
\u65E7	ji\xF9	3	a	old|former|worn
\u524D\u9762	qi\xE1n mi\xE0n	3	f	ahead|in front|preceding|above|also pr
\u5077	t\u014Du	5	v	steal|pilfer|snatch|thief|stealthily
\u7B80\u76F4	ji\u01CEn zh\xED	3	d	simply|really
\u5C55\u793A	zh\u01CEn sh\xEC	5	v	reveal|display|show|exhibit
\u57FA\u5730	j\u012B d\xEC	5	n	base|industrial or military base|al-qaeda
\u6234	d\xE0i	4	v	put on or wear|respect|bear|support
\u53F8\u673A	s\u012B j\u012B	2	n	chauffeur|driver
\u5927\u91CF	d\xE0 li\xE0ng	2	m	great amount|large quantity|bulk|numerous|generous|magnanimous
\u9000	tu\xEC	3	v	retreat|withdraw|reject|return|decline
\u9EC4	hu\xE1ng	2	nr	yellow|pornographic|fall through
\u60C5\u7EEA	q\xEDng x\xF9	6	n	mood|state of mind|moodiness
\u7A76\u7ADF	ji\u016B j\xECng	4	d	after all|finally|outcome|result
\u5F3A\u5927	qi\xE1ng d\xE0	3	a	large|formidable|powerful|strong
\u8F7B	q\u012Bng	2	a	light|easy|gentle|soft|reckless|unimportant|frivolous|small in number
\u4FE1\u53F7	x\xECn h\xE0o	2	n	signal
\u65C1\u8FB9	p\xE1ng bi\u0101n	1	f	side|adjacent place
\u5C9B	d\u01CEo	6	n	island
\u7136\u800C	r\xE1n \xE9r	4	c	however|yet|but
\u8D62\u5F97	y\xEDng d\xE9	4	v	win|gain
\u6218\u6597	zh\xE0n d\xF2u	4	v	fight|engage in combat|struggle|battle
\u5B98	gu\u0101n	4	n	government official|governmental|official|public|organ of the body
\u638C\u63E1	zh\u01CEng w\xF2	5	v	grasp|control|seize|master|know well|fluency
\u66FF	t\xEC	4	p	substitute for|take the place of|replace|for|on behalf of|stand in for
\u8BC1\u636E	zh\xE8ng j\xF9	3	n	evidence|proof|testimony
\u4EA4\u6D41	ji\u0101o li\xFA	3	vn	exchange|communication|interaction|have social contact
\u540C\u5B66	t\xF3ng xu\xE9	1	n	fellow student|classmate
\u5E78\u8FD0	x\xECng y\xF9n	3	a	fortunate|lucky|fortune|luck
\u6700\u4F73	zu\xEC ji\u0101	6	z	optimum|optimal|peak|best
\u5236\u4F5C	zh\xEC zu\xF2	3	v	make|manufacture
\u5317	b\u011Bi	1	f	north|be defeated
\u597D\u591A	h\u01CEo du\u014D	2	m	many|quite a lot|much better
\u6559\u7EC3	ji\xE0o li\xE0n	3	n	instructor|sports coach|trainer
\u7ECF\u7406	j\u012Bng l\u01D0	2	n	manager|director
\u5174\u594B	x\u012Bng f\xE8n	4	v	excited|excitement|excitation
\u8BB0\u5FC6	j\xEC y\xEC	5	n	remember|recall|memory
\u4ED8	f\xF9	3	v	pay|hand over to
\u516C\u5F00	g\u014Dng k\u0101i	3	v	open|overt|public|make public|release
\u5174\u8DA3	x\xECng q\xF9	4	n	interest|hobby
\u5269\u4E0B	sh\xE8ng xi\xE0	5	v	remain|be left over
\u6DF7	h\xF9n	6	v	mix|mingle|muddled|drift along|muddle along|pass for|get along with sb|thoughtless
\u4EBA\u5BB6	r\xE9n ji\u0101	4	r	household|dwelling|family|sb else's house|household business|house of woman's husband-to-be|other people|sb else
\u8D44\u91D1	z\u012B j\u012Bn	3	n	funds|capital
\u5458\u5DE5	yu\xE1n g\u014Dng	3	n	staff|personnel|employee
\u5927\u90E8\u5206	d\xE0 b\xF9 fen	2	m	in large part|greater part|majority
\u6446	b\u01CEi	4	v	arrange|exhibit|move to and fro|pendulum
\u5413	h\xE8	5	v	scare|intimidate|threaten|tut-tut|frighten
\u5168\u7403	qu\xE1n qi\xFA	3	n	entire|total|global|world|worldwide
\u5E2E\u5FD9	b\u0101ng m\xE1ng	1	v	help|lend a hand|do a favor|do a good turn
\u7ACB\u5373	l\xEC j\xED	4	d	immediately
\u5347	sh\u0113ng	3	v	ascend|promote|hoist|liter
\u8272	s\xE8	4	g	color|look|appearance|sex
\u5185\u90E8	n\xE8i b\xF9	4	f	interior|inside|internal
\u7ECF\u8425	j\u012Bng y\xEDng	3	v	engage in|run|operate
\u519B\u961F	j\u016Bn du\xEC	6	n	armed forces|troops
\u56F0	k\xF9n	3	v	trap|surround|hard-pressed|stranded|destitute|sleepy|tired
\u5728\u4E8E	z\xE0i y\xFA	4	v	be in|lie in|consist in|depend on|rest with
\u521D	ch\u016B	3	f	at first|beginning|first|junior|basic
\u53D1\u6325	f\u0101 hu\u012B	4	v	display|exhibit|express|develop|elaborate
\u7B26\u5408	f\xFA h\xE9	4	v	in keeping with|in accordance with|tallying with|in line with|agree with|accord with|conform to|correspond with
\u8FDB\u6765	j\xECn l\xE1i	1	v	come in
\u5458	yu\xE1n	3	g	person|employee|member
\u57FA\u91D1	j\u012B j\u012Bn	5	n	fund
\u7535\u5B50	di\xE0n z\u01D0	3	n	electronic|electron
\u7ACB\u523B	l\xEC k\xE8	3	d	forthwith|immediate|prompt|promptly|straightway|thereupon|at once
\u7F16	bi\u0101n	4	v	weave|plait|organize|group|arrange|edit|compile|write
\u72EC\u7ACB	d\xFA l\xEC	4	a	independent|independence|stand alone
\u89C1\u9762	ji\xE0n mi\xE0n	1	v	meet|see each other
\u597D\u770B	h\u01CEo k\xE0n	1	a	good-looking|nice-looking|good|embarrassed|humiliated
\u5B9E\u9A8C	sh\xED y\xE0n	3	vn	experiment|test|experimental
\u53D6\u6D88	q\u01D4 xi\u0101o	3	v	cancel|cancellation
\u5439	chu\u012B	2	v	blow|play a wind instrument|blast|puff|boast|brag|end in failure|fall through
\u989C\u8272	y\xE1n s\xE8	2	n	color|countenance|appearance|facial expression|pigment|dyestuff
\u8868\u60C5	bi\u01CEo q\xEDng	4	n	expression|express one's feelings
\u793E\u533A	sh\xE8 q\u016B	5	n	community|neighborhood
\u6210\u7EE9	ch\xE9ng j\xEC	2	n	achievement|performance records|grades
\u4E2D\u95F4	zh\u014Dng ji\u0101n	1	f	middle|inside|in the middle|within|between|among|during|in the meantime
\u624B\u6BB5	sh\u01D2u du\xE0n	5	n	method|means|strategy|trick
\u8EBA	t\u01CEng	4	v	recline|lie down
\u5B66\u4F1A	xu\xE9 hu\xEC	6	v	learn|master|institute|learned society|association
\u91C7\u8BBF	c\u01CEi f\u01CEng	4	v	interview|gather news|hunt for and collect|cover
\u5973\u751F	n\u01DA sh\u0113ng	1	n	schoolgirl|female student|girl
\u901A\u5E38	t\u014Dng ch\xE1ng	3	d	regular|usual|normal|usually|normally
\u9488\u5BF9	zh\u0113n du\xEC	4	p	target|focus on|in response to
\u5373\u5C06	j\xED ji\u0101ng	4	d	on the eve of|be about to
\u89D2\u5EA6	ji\u01CEo d\xF9	2	n	angle|point of view
\u5B9D	b\u01CEo	4	n	jewel|gem|treasure|precious
\u9057\u61BE	y\xED h\xE0n	6	a	regret|be sorry that
\u90E8\u961F	b\xF9 du\xEC	6	n	army|armed forces|troops|force|unit
\u8336	ch\xE1	1	n	tea|tea plant
\u5BF9\u8C61	du\xEC xi\xE0ng	3	n	target|object|partner|boyfriend|girlfriend
\u63A5\u89E6	ji\u0113 ch\xF9	5	v	touch|contact|access|in touch with
\u7B54\u6848	d\xE1 \xE0n	4	n	answer|solution
\u806A\u660E	c\u014Dng ming	5	a	intelligent|clever|bright|smart|acute
\u5730\u70B9	d\xEC di\u01CEn	1	n	place|site|location|venue
\u76AE\u80A4	p\xED f\u016B	5	n	skin
\u6D6A\u8D39	l\xE0ng f\xE8i	3	v	waste|squander
\u89C4\u5219	gu\u012B z\xE9	4	n	rule|regulation|rules and regulations
\u5389\u5BB3	l\xEC hai	5	a	terrible|intense|severe|devastating|amazing|awesome|outstanding|stern
\u5C0A\u91CD	z\u016Bn zh\xF2ng	5	v	esteem|respect|honor|value|eminent|serious|proper
\u96E8	y\xF9	1	n	rain|fall|precipitate|wet
\u635F\u5931	s\u01D4n sh\u012B	5	n	loss|damage|lose|suffer damage
\u6FC0\u52A8	j\u012B d\xF2ng	4	a	move emotionally|stir up|excite
\u5408\u7406	h\xE9 l\u01D0	3	a	rational|reasonable|sensible|fair
\u9A97	pi\xE0n	5	v	cheat|swindle|deceive
\u591A\u4E48	du\u014D me	2	d	how|what|however|what extent
\u53EF\u601C	k\u011B li\xE1n	5	v	pitiful|pathetic|have pity on
\u4EFB	r\xE8n	3	v	assign|appoint|take up a post|office|responsibility|let|allow|give free rein to
\u4F9D\u7136	y\u012B r\xE1n	4	d	still|as before
\u9636\u6BB5	ji\u0113 du\xE0n	4	n	stage|section|phase|period
\u4EC0\u4E48\u6837	sh\xE9n me y\xE0ng	2	r	what kind|what sort
\u4E3A\u4F55	w\xE8i h\xE9	6	r	why
\u8BED\u8A00	y\u01D4 y\xE1n	2	n	language
\u64E6	c\u0101	4	v	rub|scratch|towel|wipe with a towel|apply|touch|brush|shred
\u7206	b\xE0o	6	v	explode or burst
\u9999	xi\u0101ng	3	n	fragrant|sweet smelling|aromatic|savory or appetizing|with relish|sound|perfume or spice|joss or incense stick
\u6210\u719F	ch\xE9ng sh\xFA	3	a	mature|ripe|ripen|taiwan pr
\u65E0\u804A	w\xFA li\xE1o	4	a	bored|boring|senseless
\u661F\u671F	x\u012Bng q\u012B	1	n	week|day of the week|sunday
\u4E00\u81F4	y\u012B zh\xEC	4	a	unanimous|identical
\u5410	t\u01D4	5	v	spit|send out|say|pour out|vomit|throw up
\u6587\u7AE0	w\xE9n zh\u0101ng	3	n	article|essay|literary works|writings|hidden meaning
\u6BD2	d\xFA	5	n	poison|poisonous|malicious|cruel|fierce|narcotics
\u4E2D\u592E	zh\u014Dng y\u0101ng	5	n	central|middle|center|central authorities
\u4FE1\u4EFB	x\xECn r\xE8n	3	v	trust|have confidence in
\u7F51\u7AD9	w\u01CEng zh\xE0n	2	n	website|network station|node
\u523A\u6FC0	c\xEC j\u012B	4	v	provoke|irritate|upset|stimulate|excite|irritant
\u53CD\u6B63	f\u01CEn zh\xE8ng	3	d	anyway|in any case
\u5B9D\u5B9D	b\u01CEo bao	4	n	darling|baby
\u5DDE	zh\u014Du	6	n	prefecture|province|administrative division|state|oblast|canton
\u5730\u7403	d\xEC qi\xFA	2	n	earth
\u89E3	ji\u011B	6	v	divide|break up|split|separate|dissolve|solve|melt|remove
\u8D34	ti\u0113	4	v	stick|paste|post|keep close to|fit snugly|subsidize|allowance|sticker
\u96EA	xu\u011B	2	n	snow|wipe away
\u5185\u5FC3	n\xE8i x\u012Bn	3	n	heart|innermost being|incenter
\u53D1\u51FA	f\u0101 ch\u016B	3	v	issue|send out|dispatch|produce|let out
\u7F6A	zu\xEC	6	n	guilt|crime|fault|blame|sin
\u90A3\u65F6	n\xE0 sh\xED	2	r	then|at that time|in those days
\u5B9E\u9645	sh\xED j\xEC	2	n	reality|practice|practical|realistic|real|actual
\u663E\u8457	xi\u01CEn zh\xF9	4		outstanding|notable|remarkable|statistically significant
\u7F8E\u5973	m\u011Bi n\u01DA	4	n	beautiful woman
\u5FC3\u4E2D	x\u012Bn zh\u014Dng	2	s	central point|in one's thoughts|in one's heart
\u89C9	ju\xE9	6	v	feel|find that|thinking|awake|aware|nap|sleep
\u5C4B	w\u016B	5	n	house|room
\u88AD\u51FB	x\xED j\u012B	7	v	attack|raid
\u627F\u8BFA	ch\xE9ng nu\xF2	6	v	promise|undertake to do something|commitment
\u5C3D\u5FEB	j\u01D0n ku\xE0i	4	d	as quickly as possible|as soon as possible
\u836F\u7269	y\xE0o w\xF9	4	n	medicaments|pharmaceuticals|medication|medicine|drug
\u8D76\u7D27	g\u01CEn j\u01D0n	3	d	hurriedly|without delay
\u8FDB\u4E00\u6B65	j\xECn y\u012B b\xF9	3	d	go a step further|more|further
\u79FB\u52A8	y\xED d\xF2ng	4	vn	move|movement|migration|mobile|portable
\u8D39	f\xE8i	3	n	cost|spend|fee|wasteful|expenses
\u8F66\u4E0A	ch\u0113 sh\xE0ng	1	s	car
\u9500\u552E	xi\u0101o sh\xF2u	4	vn	sell|market|sales
\u592A\u9633	t\xE0i yang	2	n	sun
\u706F	d\u0113ng	2	n	lamp|light|lantern
\u547C\u5438	h\u016B x\u012B	4	v	breathe
\u53EF\u6015	k\u011B p\xE0	2	a	awful|dreadful|fearful|formidable|frightful|scary|hideous|horrible
\u611F\u67D3	g\u01CEn r\u01CEn	7	v	infect|infection|influence
\u786E\u8BA4	qu\xE8 r\xE8n	4	v	confirm|verify|confirmation
\u9632	f\xE1ng	3	v	protect|defend|guard against|prevent
\u542F\u52A8	q\u01D0 d\xF2ng	5	v	start|set in motion|launch|activate
\u5E74\u9F84	ni\xE1n l\xEDng	5	n	age
\u65B9\u4FBF	f\u0101ng bi\xE0n	2	v	convenient|suitable|facilitate|make things easy|having money to spare|relieve oneself
\u4E00\u4E00	y\u012B y\u012B	7	d	one by one|one after another
\u722C	p\xE1	2	v	crawl|climb
\u821E\u53F0	w\u01D4 t\xE1i	3	n	stage|arena
\u5DEE\u4E0D\u591A	ch\xE0 bu du\u014D	2	l	almost|nearly|more or less|about the same|good enough|not bad
\u9AD8\u4E2D	g\u0101o zh\u014Dng	2	n	senior high school|pass brilliantly
\u7075	l\xEDng	7	a	quick|alert|efficacious|effective|come true|spirit|departed soul|coffin
\u5316	hu\xE0	3	v	make into|change into|-ization|... -ize|transform
\u51FA\u8272	ch\u016B s\xE8	4	a	remarkable|outstanding
\u4E0D\u5FC5	b\xF9 b\xEC	3	d	need not|does not have to|not necessarily
\u73B0\u91D1	xi\xE0n j\u012Bn	3	n	cash
\u8003	k\u01CEo	1	v	check|verify|test|examine|take an exam|deceased father|beat|hit
\u7B97\u662F	su\xE0n sh\xEC	6	v	considered to be|at last
\u8C03\u6574	ti\xE1o zh\u011Bng	3	v	adjust|adjustment|revision
\u53EF\u60DC	k\u011B x\u012B	5	v	it is a pity|what a pity|unfortunately
\u6EF4	d\u012B	6	v	drop|drip
\u51B0	b\u012Bng	4	n	ice|chill sth|feel cold|cold|unfriendly|methamphetamine
\u7CD6	t\xE1ng	3	n	sugar|sweets|candy
\u7838	z\xE1	7	v	smash|pound|fail|muck up|bungle
\u8BB8	x\u01D4	7	v	allow|permit|promise|praise|somewhat|perhaps
\u82F1\u8BED	Y\u012Bng y\u01D4	2	nz	english
\u4E5D	ji\u01D4	1	m	nine
\u9633\u5149	y\xE1ng gu\u0101ng	3	n	sunshine|upbeat|energetic|transparent
\u9886	l\u01D0ng	3	v	neck|collar|lead|receive
\u6EDA	g\u01D4n	5	v	boil|roll|take a hike|get lost
\u515A	d\u01CEng	6	n	party|association|club|society
\u7ED3	ji\xE9	4	v	knot|sturdy|bond|tie|bind|check out|produce|taiwan pr
\u56DE\u5FC6	hu\xED y\xEC	5	v	recall|memories
\u7A7A\u6C14	k\u014Dng q\xEC	2	n	air|atmosphere
\u9003	t\xE1o	5	v	escape|run away|flee
\u4EE5\u4E0B	y\u01D0 xi\xE0	2	f	that level or lower|that amount or less|following
\u5A5A\u59FB	h\u016Bn y\u012Bn	7	n	matrimony|wedding|marriage
\u6253\u51FB	d\u01CE j\u012B	5	v	hit|strike|attack|crack down on sth|blow|shock|percussion
\u558A	h\u01CEn	2	v	yell|shout|call out for
\u8BB2\u8BDD	ji\u01CEng hu\xE0	2	n	speech|speak|talk|address
\u5927\u591A\u6570	d\xE0 du\u014D sh\xF9	2	m	majority
\u4E4B\u5916	zh\u012B w\xE0i	5	f	outside|excluding
\u6750\u6599	c\xE1i li\xE0o	4	n	material|data
\u719F\u6089	sh\xFA x\u012B	5	v	be familiar with|know well
\u968F\u4FBF	su\xED bi\xE0n	2	ad	as one wishes|as one pleases|at random|negligent|casual|wanton
\u5BA3\u4F20	xu\u0101n chu\xE1n	3	vn	disseminate|give publicity to|propaganda
\u7D27\u6025	j\u01D0n j\xED	3	a	urgent|emergency
\u649E	zhu\xE0ng	5	v	knock against|bump into|run into|meet by accident
\u4F18\u52BF	y\u014Du sh\xEC	3	n	superiority|dominance|advantage
\u8F6C\u79FB	zhu\u01CEn y\xED	4	v	shift|relocate|transfer|change|metastasize
\u5370	y\xECn	6	v	print|mark|engrave|seal|stamp|trace|image
\u70E6	f\xE1n	4	v	feel vexed|bother|trouble|superfluous and confusing|edgy
\u968F\u65F6	su\xED sh\xED	2	d	at any time|at all times|at the right time|whenever necessary
\u4ED8\u51FA	f\xF9 ch\u016B	4	v	pay|expend|invest
\u5377	ju\xE0n	4	q	scroll|book|volume|chapter|examination paper|roll up|sweep up|carry along
\u65F6\u671F	sh\xED q\u012B	6	n	period|phase
\u4E92\u76F8	h\xF9 xi\u0101ng	3	d	each other|mutually|mutual
\u54CE	\u0101i	7	e	hey
\u59B9\u59B9	m\xE8i mei	1	n	younger sister|young woman
\u5267	j\xF9	6	n	theatrical work|dramatic|acute|severe
\u79D1\u6280	k\u0113 j\xEC	3	n	science and technology
\u900F	t\xF2u	4	a	penetrate|seep through|tell secretly|leak|thoroughly|through and through|appear|show
\u597D\u8FD0	h\u01CEo y\xF9n	5	n	good luck
\u6CBB	zh\xEC	4	v	rule|govern|manage|control|harness|treat|wipe out|punish
\u63AA\u65BD	cu\xF2 sh\u012B	4	n	measure|step
\u5408\u9002	h\xE9 sh\xEC	2	a	suitable|fitting|appropriate
\u5931\u671B	sh\u012B w\xE0ng	4	a	disappointed|lose hope|despair
\u72C2	ku\xE1ng	5	g	mad|wild|violent
\u5370\u8C61	y\xECn xi\xE0ng	3	n	impression|memory
\u5BFC\u6F14	d\u01CEo y\u01CEn	3		direct|director
\u53F7\u7801	h\xE0o m\u01CE	4	n	number
\u70DF	y\u0101n	3	n	cigarette or pipe tobacco|smoke|mist|vapour|tobacco plant|be irritated by smoke
\u76F8\u540C	xi\u0101ng t\xF3ng	2	a	identical|same
\u9177	k\xF9	6	g	ruthless|strong|cool|hip
\u51FA\u751F	ch\u016B sh\u0113ng	2	v	be born
\u751F\u610F	sh\u0113ng y\xEC	3	n	life force|vitality|business
\u751F\u6C14	sh\u0113ng q\xEC	1	a	get angry|take offense|angry|vitality|liveliness
\u8D76	g\u01CEn	3	v	overtake|catch up with|hurry|rush|try to catch|drive forward|drive away|avail oneself of
\u5B58	c\xFAn	3	v	exist|deposit|store|keep|survive
\u5229\u76CA	l\xEC y\xEC	4	n	benefit|interest
\u751F\u7269	sh\u0113ng w\xF9	7	n	organism|living creature|life form|biological
\u8BC4\u4EF7	p\xEDng ji\xE0	3	v	evaluate|assess
\u6865	qi\xE1o	3	n	bridge
\u8FF7	m\xED	3	v	bewilder|crazy about|fan|enthusiast|lost|confused
\u4EE5\u4E0A	y\u01D0 sh\xE0ng	2	f	that level or higher|that amount or more|above-mentioned|that is all
\u5F62\u8C61	x\xEDng xi\xE0ng	3	n	image|form|figure|visualization|vivid
\u540D\u5355	m\xEDng d\u0101n	2	n	list of names
\u65B9\u6848	f\u0101ng \xE0n	4	n	plan|program|proposal|proposed bill
\u6B20	qi\xE0n	5	v	owe|lack|be deficient in|yawn|raise slightly
\u4E0A\u53BB	sh\xE0ng q\xF9	3	v	go up
\u4E3B\u9898	zh\u01D4 t\xED	4	n	theme|subject
\u4EC5\u4EC5	j\u01D0n j\u01D0n	3	d	barely|only|merely
\u4EBA\u58EB	r\xE9n sh\xEC	5	n	person|figure|public figure
\u5546\u4E1A	sh\u0101ng y\xE8	3	n	business|trade|commerce
\u62D6	tu\u014D	6	v	drag|tow|trail|hang down|mop|delay|drag on
\u7B54\u5E94	d\u0101 ying	2	v	answer|respond|answer positively|agree|accept|promise
\u5230\u8FBE	d\xE0o d\xE1	3	v	reach|arrive
\u5A18	ni\xE1ng	7	n	mother|young lady|effeminate
\u4E3B\u4EFB	zh\u01D4 r\xE8n	3	n	director|head
\u516C\u56ED	g\u014Dng yu\xE1n	2	n	park
\u96C6\u56E2	j\xED tu\xE1n	5	n	group|bloc|corporation|conglomerate
\u57FA\u7840	j\u012B ch\u01D4	3	n	base|foundation|basis|basic|fundamental
\u4E3A\u6B62	w\xE9i zh\u01D0	5	u	until
\u529F\u80FD	g\u014Dng n\xE9ng	3	n	function|capability
\u907F\u514D	b\xEC mi\u01CEn	4	v	avert|prevent|avoid|refrain from
\u4E14	qi\u011B	7	c	and|moreover|yet|for the time being|be about to|both
\u751F\u4EA7	sh\u0113ng ch\u01CEn	3	vn	produce|manufacture
\u7EA2\u8272	h\xF3ng s\xE8	2	n	red|revolutionary
\u9002\u5E94	sh\xEC y\xECng	3	v	adapt|fit|suit
\u91CF	li\xE0ng	4	n	capacity|quantity|amount|estimate|measure word|measure
\u70ED\u60C5	r\xE8 q\xEDng	2	an	cordial|enthusiastic|passion|passionate|passionately
\u8BD5\u9A8C	sh\xEC y\xE0n	3	vn	experiment|test|experimental
\u8FDB\u5C55	j\xECn zh\u01CEn	3	vn	make headway|make progress
\u5973\u58EB	n\u01DA sh\xEC	4	n	lady|madam|miss|ms
\u6027\u611F	x\xECng g\u01CEn	6	a	sex appeal|eroticism|sexuality|sexy
\u6210\u957F	ch\xE9ng zh\u01CEng	3	v	mature|grow|growth
\u95F9	n\xE0o	4	v	noisy|cacophonous|make noise|disturb|vent|fall ill|have an attack|go in
\u585E	s\u0101i	6	v	stop up|squeeze in|stuff|cork|stopper|cope with|serbia|serbian
\u8D5A	zhu\xE0n	6	v	earn|make a profit|cheat|swindle
\u6E38	y\xF3u	3	v	walk|tour|roam|travel|swim
\u5F7C\u6B64	b\u01D0 c\u01D0	5	r	each other|one another
\u63A8\u8350	tu\u012B ji\xE0n	7	v	recommend|recommendation
\u731C	c\u0101i	5	v	guess
\u5230\u5904	d\xE0o ch\xF9	2	d	everywhere
\u6307\u5BFC	zh\u01D0 d\u01CEo	3	v	guide|give directions|direct|coach|guidance|tuition
\u7CFB\u5217	x\xEC li\xE8	4	q	series|set
\u98DF\u54C1	sh\xED p\u01D0n	3	n	foodstuff|food|provisions
\u54C1\u724C	p\u01D0n p\xE1i	6	n	brand name|trademark
\u653E\u4E0B	f\xE0ng xi\xE0	2	v	lay down|put down|let go of|relinquish|set aside|lower
\u5730\u4E0A	d\xEC shang	1	s	on the ground|on the floor
\u5927\u7EA6	d\xE0 yu\u0113	3	d	approximately|probably
\u4E0A\u5348	sh\xE0ng w\u01D4	1	t	morning
\u539F\u5219	yu\xE1n z\xE9	4	n	principle|doctrine
\u76D6	g\xE0i	4	v	lid|top|cover|canopy|conceal|build
\u8054\u5408	li\xE1n h\xE9	3	v	combine|join|unite|alliance
\u68C0\u6D4B	ji\u01CEn c\xE8	4	vn	detect|test|detection|sensing
\u94C1	ti\u011B	3	n	iron|arms|weapons|hard|strong|violent|unshakeable|determined
\u6CE8	zh\xF9	7	v	inject|pour into|concentrate|pay attention|stake|register|annotate|note
\u7092	ch\u01CEo	6	v	saut\xE9|stir-fry|speculate|hype|fire
\u5854	t\u01CE	6	n	pagoda|tower|minaret|stupa
\u5956	ji\u01CEng	4	n	prize|award|encouragement
\u5F55	l\xF9	3	v	diary|record|hit|copy|carve wood
\u89C6\u9891	sh\xEC p\xEDn	5	n	video
\u63D0\u524D	t\xED qi\xE1n	3	v	in advance
\u4E00\u4F1A\u513F	y\u012B hu\xEC r	1	mq	moment|while|in a moment|now...now|also pr
\u5FAE\u7B11	w\u0113i xi\xE0o	4	v	smile
\u771F\u76F8	zh\u0113n xi\xE0ng	5	n	truth about sth|actual facts
\u7EC4\u5408	z\u01D4 h\xE9	3	v	assemble|combine|compose|combination|association|set|compilation|combinatorial
\u5217	li\xE8	4	v	arrange|line up|file|series|column|row
\u6682\u65F6	z\xE0n sh\xED	5	d	temporary|provisional|for the time being
\u60CA\u559C	j\u012Bng x\u01D0	6	a	nice surprise|be pleasantly surprised
\u89C2\u70B9	gu\u0101n di\u01CEn	2	n	point of view|viewpoint|standpoint
\u5F3A\u70C8	qi\xE1ng li\xE8	3	a	strong|intense
\u79EF\u6781	j\u012B j\xED	3	a	active|energetic|vigorous|positive|proactive
\u4E89\u53D6	zh\u0113ng q\u01D4	3	v	fight for|strive for|win over
\u516C\u5E73	g\u014Dng p\xEDng	2	a	fair|impartial
\u642D	d\u0101	6	v	put up|build|hang|connect|join|arrange in pairs|match|add
\u9AD8\u7EA7	g\u0101o j\xED	2	a	high level|high grade|advanced|high-ranking
\u6709\u7740	y\u01D2u zhe	5	v	have|possess
\u6D1E	d\xF2ng	5	n	cave|hole|zero
\u7684\u8BDD	de hu\xE0	2	u	if
\u75C5\u6BD2	b\xECng d\xFA	5	n	virus
\u826F\u597D	li\xE1ng h\u01CEo	4	a	good|favorable|well|fine
\u6743\u529B	qu\xE1n l\xEC	6	n	power|authority
\u601D\u8003	s\u012B k\u01CEo	4	v	reflect on|ponder over
\u9A91	j\xEC	2	v	saddle horse|mounted soldier|sit astride|ride
\u62A5\u7EB8	b\xE0o zh\u01D0	2	n	newspaper|newsprint
\u592B\u4EBA	f\u016B ren	4	n	lady|madam|mrs
\u54CD	xi\u01CEng	2	v	echo|sound|noise|make a sound|ring|loud
\u6C64	t\u0101ng	3	n	soup|hot or boiling water|decoction of medicinal herbs|rushing current
\u8D35	gu\xEC	1	a	expensive|noble|precious|your
\u6536\u5165	sh\u014Du r\xF9	2	n	take in|income|revenue
\u6BEB\u65E0	h\xE1o w\xFA	7	v	not in the least|completely lack
\u7B7E	qi\u0101n	5	v	inscribed bamboo stick|small wood sliver|label|tag|sign one's name|visa
\u5236	zh\xEC	7	v	system|control|regulate|manufacture|make
\u6050\u6015	k\u01D2ng p\xE0	3	d	fear|dread|i'm afraid that|perhaps|maybe
\u6CB3	h\xE9	2	n	river
\u642C	b\u0101n	3	v	move|shift|copy indiscriminately
\u7EC3	li\xE0n	2	v	practice|train|drill|perfect|exercise|white silk
\u81EA\u4ECE	z\xEC c\xF3ng	3	p	since|ever since
\u4EF7	jie	5	n	great|good|middleman|servant|price|value|valence
\u6CE1	p\xE0o	6	v	bubble|foam|blister|soak|steep|infuse|dawdle|loiter
\u5C1D\u8BD5	ch\xE1ng sh\xEC	5	v	try|attempt
\u723D	shu\u01CEng	6	g	bright|clear|crisp|open|frank|straightforward|feel well|fine
\u6237	h\xF9	4	g	household|door|family
\u8BB0\u4F4F	j\xEC zhu	1	v	remember|bear in mind|learn by heart
\u4E0B\u6B21	xi\xE0 c\xEC	1	t	next time
\u547D\u8FD0	m\xECng y\xF9n	3	n	fate|destiny
\u75BE\u75C5	j\xED b\xECng	6	n	disease|sickness|ailment
\u5973\u5B50	n\u01DA z\u01D0	3	n	woman|female
\u4ED4\u7EC6	z\u01D0 x\xEC	5	ad	careful|attentive|cautious|be careful|look out
\u4F9B	g\u014Dng	7	v	provide|supply|sacrificial offering|confess
\u7C7B\u4F3C	l\xE8i s\xEC	3	a	similar|analogous
\u51ED	p\xEDng	5	p	lean against|rely on|on the basis of|no matter|proof
\u5F52	gu\u012B	4	v	return|go back to|give back to|belong to|gather together|despite|marry
\u4E25\u683C	y\xE1n g\xE9	4	a	strict|stringent|tight|rigorous
\u5C3D\u91CF	j\u01D0n li\xE0ng	3	d	as much as possible|greatest extent
\u53CA\u65F6	j\xED sh\xED	3	ad	timely|at the right time|promptly|without delay
\u5A31\u4E50	y\xFA l\xE8	6	vn	entertain|amuse|entertainment|recreation|amusement|hobby|fun|joy
\u77E5\u8BC6	zh\u012B shi	1	n	knowledge|intellectual
\u4E0D\u7136	b\xF9 r\xE1n	4	c	not so|no|or else|otherwise|if not|how about
\u4E13\u95E8	zhu\u0101n m\xE9n	3	d	specialist|specialized|customized
\u8D44\u683C	z\u012B g\xE9	3	n	qualifications|seniority
\u80F8	xi\u014Dng	5	g	chest|bosom|heart|mind|thorax
\u4F01\u4E1A	q\u01D0 y\xE8	4	n	company|firm|enterprise|corporation
\u63A2	t\xE0n	7	v	explore|search out|scout|visit|stretch forward
\u5DE5\u5177	g\u014Dng j\xF9	3	n	tool|instrument|utensil|means
\u5AC1	ji\xE0	7	v	marry|marry off a daughter|shift
\u804A	li\xE1o	6	v	chat|depend upon|temporarily|just|slightly
\u8FFD\u6C42	zhu\u012B qi\xFA	4	v	pursue stubbornly|seek after|woo
\u8131	tu\u014D	4	v	shed|take off|escape|get away from
\u547D\u4EE4	m\xECng l\xECng	5	n	order|command
\u653F\u7B56	zh\xE8ng c\xE8	6	n	policy
\u6B23\u8D4F	x\u012Bn sh\u01CEng	5	v	appreciate|enjoy|admire
\u795E\u7ECF	sh\xE9n j\u012Bng	5	n	nerve|mental state|unhinged|nutjob
\u673A\u573A	j\u012B ch\u01CEng	1	n	airport|airfield
\u9AD8\u5EA6	g\u0101o d\xF9	5	d	height|altitude|elevation|high degree|highly
\u5FEB\u901F	ku\xE0i s\xF9	3	d	fast|high-speed|rapid
\u6311	ti\u01CEo	4	v	raise|dig up|poke|prick|incite|stir up|choose|pick
\u4E3E	j\u01D4	2	v	lift|hold up|cite|enumerate|act|raise|choose|elect
\u653E\u677E	f\xE0ng s\u014Dng	4	v	relax|slacken|loosen
\u788E	su\xEC	5	a	break into pieces|shatter|crumble|broken|fragmentary|scattered|garrulous
\u8FDE\u7EED	li\xE1n x\xF9	3	a	continuous|in a row|serial|consecutive
\u963B\u6B62	z\u01D4 zh\u01D0	4	v	prevent|block
\u8001\u516C	l\u01CEo g\u014Dng	4	n	husband|eunuch
\u8D44\u6E90	z\u012B yu\xE1n	4	n	natural resource|resource
\u591A\u4E45	du\u014D ji\u01D4	2	r	how long|long time
\u51B3\u8D5B	ju\xE9 s\xE0i	3	vn	finals
\u5382	ch\u01CEng	3	n	factory|yard|depot|workhouse|works|plant
\u6CD5\u5EAD	f\u01CE t\xEDng	6	n	court of law
\u4E3B\u5E2D	zh\u01D4 x\xED	4	n	chairperson|premier|chairman
\u8E22	t\u012B	6	v	kick|play|butch
\u82E6	k\u01D4	4	a	bitter|hardship|pain|suffer|bring suffering to|painstakingly
\u79DF	z\u016B	2	v	hire|rent|charter|rent out|lease out|land tax
\u4E00\u8F88\u5B50	y\u012B b\xE8i zi	5	mq	lifetime
\u5F62\u6210	x\xEDng ch\xE9ng	3	v	form|take shape
\u5168\u4E16\u754C	qu\xE1n sh\xEC ji\xE8	5	n	worldwide|entire world
\u540C\u4E8B	t\xF3ng sh\xEC	2	n	colleague|co-worker
\u8054\u76DF	li\xE1n m\xE9ng	6	n	alliance|union|coalition
\u5438	x\u012B	4	v	breathe|suck in|absorb|inhale
\u7403\u961F	qi\xFA du\xEC	2	n	sports team
\u8212\u670D	sh\u016B fu	2	a	comfortable|feeling well
\u7BB1	xi\u0101ng	4	g	box|trunk|chest
\u884C\u4E1A	h\xE1ng y\xE8	4	n	trade|profession|industry|business
\u4E0A\u5468	sh\xE0ng zh\u014Du	2	t	last week
\u58EB\u5175	sh\xEC b\u012Bng	4	n	soldier
\u80CC\u540E	b\xE8i h\xF2u	3	f	behind|at the back|in the rear|behind sb's back
\u914D\u5408	p\xE8i h\xE9	3	v	matching|fitting in with|compatible with|correspond|fit|conform to|rapport|coordinate with
\u5355\u4F4D	d\u0101n w\xE8i	2	n	unit|work unit
\u8BF4\u6CD5	shu\u014D fa	5	n	way of speaking|wording|formulation|one's version|statement|theory|hypothesis|interpretation
\u6BCD	m\u01D4	6	b	mother|elderly female relative|origin|source|female
\u8BC4\u8BBA	p\xEDng l\xF9n	5	n	comment on|discuss|comment|commentary
\u663E\u5F97	xi\u01CEn de	3	v	seem|look|appear
\u4EB2\u81EA	q\u012Bn z\xEC	3	d	personally|in person|oneself
\u7269\u8D28	w\xF9 zh\xEC	5	n	matter|substance|material|materialistic
\u4F53\u80B2	t\u01D0 y\xF9	2	n	sports|physical education
\u516C\u5171	g\u014Dng g\xF2ng	3	b	public|common|communal
\u5B66\u9662	xu\xE9 yu\xE0n	1	n	college|educational institute|school|faculty
\u9ED1\u8272	h\u0113i s\xE8	2	n	black
\u627F\u62C5	ch\xE9ng d\u0101n	4	v	undertake|assume
\u9762\u4E34	mi\xE0n l\xEDn	4	v	face sth|be confronted with
\u795E\u79D8	sh\xE9n m\xEC	4	a	mysterious|mystery
\u8D39\u7528	f\xE8i y\xF2ng	3	n	cost|expenditure|expense
\u81EA\u52A8	z\xEC d\xF2ng	3	d	automatic|voluntarily
\u9053\u8DEF	d\xE0o l\xF9	2	n	road|path|way
\u5927\u4EBA	d\xE0 ren	2	n	adult|grownup
\u660E\u786E	m\xEDng qu\xE8	3	a	clear-cut|definite|explicit|clarify|specify|make definite
\u89D2	ji\u01CEo	2	n	angle|corner|horn|horn-shaped|role|compete
\u4EEA\u5F0F	y\xED sh\xEC	6	n	ceremony
\u7ED3\u5408	ji\xE9 h\xE9	3	v	combine|link|integrate|binding
\u5F53\u4E2D	d\u0101ng zh\u014Dng	3	f	among|in the middle|in the center
\u80FD\u5426	n\xE9ng f\u01D2u	6	v	whether or not|is it possible
\u4E0B\u964D	xi\xE0 ji\xE0ng	4	v	decline|drop|fall|go down|decrease
\u7537\u5B50	n\xE1n z\u01D0	3	n	man|male
\u767B\u8BB0	d\u0113ng j\xEC	4	v	register
\u8EB2	du\u01D2	5	v	hide|dodge|avoid
\u5192	m\xE0o	5	v	emit|give off|send out|brave|face|reckless|falsely adopt|feign
\u8FDB\u653B	j\xECn g\u014Dng	6	v	attack|assault|go on the offensive|offense
\u6765\u6E90	l\xE1i yu\xE1n	4	n	source|origin
\u7EFF\u8272	l\u01DC s\xE8	2	n	green
\u65C5\u884C	l\u01DA x\xEDng	2	v	travel|journey|trip
\u70C2	l\xE0n	5	a	soft|mushy|well-cooked and soft|rot|decompose|rotten|worn out|chaotic
\u516C\u8DEF	g\u014Dng l\xF9	2	n	highway|road
\u751F\u5B58	sh\u0113ng c\xFAn	3	v	exist|survive
\u5145\u5206	ch\u014Dng f\xE8n	4	a	ample|sufficient|adequate|full|fully
\u518D\u8BF4	z\xE0i shu\u014D	6	v	say again|moreover|what's more|besides
\u8001\u4EBA	l\u01CEo r\xE9n	1	n	old man or woman|elderly
\u80D6	p\xE1n	3	a	healthy|at ease|fat|plump
\u6279	p\u012B	4	q	ascertain|act on|criticize|pass on|tier
\u9664	ch\xFA	6	p	get rid of|remove|exclude|eliminate|wipe out|divide|except|not including
\u4E3B\u4EBA	zh\u01D4 r\xE9n	2	n	master|host|owner
\u571F	t\u01D4	3	n	earth|dust|clay|local|indigenous|crude opium|unsophisticated|tu
\u5C24\u5176	y\xF3u q\xED	5	d	especially|particularly
\u7ECF\u5178	j\u012Bng di\u01CEn	4	n	classics|scriptures|classical|classic|typical
\u6CD5\u9662	f\u01CE yu\xE0n	4	n	court of law|court
\u9189	zu\xEC	5	v	intoxicated
\u5E76\u975E	b\xECng f\u0113i	7	v	really isn't
\u8D1F	f\xF9	6	v	bear|carry|turn one's back on|be defeated|negative
\u975E\u6CD5	f\u0113i f\u01CE	7	b	illegal
\u9875	y\xE8	1	q	page|leaf|head
\u4FE1\u5FC3	x\xECn x\u012Bn	2	n	confidence|faith
\u5DE5\u4EBA	g\u014Dng r\xE9n	1	n	worker
\u6254	r\u0113ng	5	v	throw|throw away
\u672C\u8EAB	b\u011Bn sh\u0113n	6	r	itself|in itself|per se
\u5FF5	ni\xE0n	3	v	read|study|attend|read aloud|give a tongue-lashing|miss|idea|remembrance
\u4E0A\u5E1D	Sh\xE0ng d\xEC	6	n	god
\u65F6\u5149	sh\xED gu\u0101ng	5	n	time|era|period of time
\u7AEF	du\u0101n	6	v	end|extremity|item|port|carry|regular|start|origin
\u793C	l\u01D0	5	n	gift|rite|ceremony|propriety|etiquette|courtesy
\u90A3\u8FB9	n\xE0 bian	1	r	over there|yonder
\u80CC\u666F	b\xE8i j\u01D0ng	4	n	background|backdrop|context|powerful backer
\u4E0D\u89C1	b\xF9 ji\xE0n	6	v	not to see|not to meet|have disappeared|be missing
\u6263	k\xF2u	6	v	fasten|button|buckle|knot|arrest|confiscate|deduct|discount
\u72FC	l\xE1ng	7	n	wolf
\u5F1F\u5F1F	d\xEC di	1	n	younger brother
\u535A\u58EB	b\xF3 sh\xEC	5	n	doctor|court academician|ph.d
\u8FDB\u6B65	j\xECn b\xF9	3	vn	progress|improvement|improve
\u6545\u610F	g\xF9 y\xEC	2	d	deliberately|on purpose
\u95FB	w\xE9n	2	v	hear|news|well-known|famous|reputation|fame|smell|sniff at
\u5BF9\u5F85	du\xEC d\xE0i	3	v	treat|treatment
\u5E72\u51C0	g\u0101n j\xECng	1	a	clean|neat
\u5927\u4F1A	d\xE0 hu\xEC	4	n	general assembly|general meeting|convention
\u6751	c\u016Bn	3	n	village
\u770B\u6CD5	k\xE0n f\u01CE	2	n	view|opinion
\u6216\u662F	hu\xF2 sh\xEC	5	c	or
\u6D6A\u6F2B	l\xE0ng m\xE0n	5	a	romantic
\u73B0\u8C61	xi\xE0n xi\xE0ng	3	n	phenomenon|appearance
\u51CF\u5C11	ji\u01CEn sh\u01CEo	4	v	lessen|decrease|reduce|lower
\u5728\u5BB6	z\xE0i ji\u0101	1	v	be at home
\u5B9E\u529B	sh\xED l\xEC	3	n	strength
\u7403\u5458	qi\xFA yu\xE1n	6	n	player|team member
\u9053\u5FB7	d\xE0o d\xE9	5	n	virtue|morality|ethics
\u7F16\u8F91	bi\u0101n j\xED	5	n	edit|compile|editor|compiler
\u7F3A	qu\u0113	3	v	deficiency|lack|scarce|vacant post|run short of
\u6316	w\u0101	6	v	dig|excavate|scoop out
\u79C1\u4EBA	s\u012B r\xE9n	5	n	private|personal|interpersonal|member of one's clique
\u8BC1\u5B9E	zh\xE8ng sh\xED	5	v	confirm|verify
\u8F9B\u82E6	x\u012Bn k\u01D4	5	a	exhausting|hard|tough|arduous|work hard|hardship
\u4E00\u8DEF	y\u012B l\xF9	5	mq	whole journey|all the way|going the same way|of the same kind
\u5269	sh\xE8ng	5	v	remain|be left|have as remainder
\u8981\u4E48	y\xE0o me	6	c	or
\u767E	b\u01CEi	1	m	hundred|numerous|all kinds of
\u653E\u5FC3	f\xE0ng x\u012Bn	2	v	feel relieved|feel reassured|be at ease
\u9886\u57DF	l\u01D0ng y\xF9	7	n	domain|sphere|field|territory|area
\u62FC	p\u012Bn	5	v	piece together|join together|stake all|adventurous|spell
\u6076\u5FC3	\u011B x\u012Bn	4	a	nausea|feel sick|disgust|nauseating|embarrass|bad habit|vicious habit|vice
\u76EF	d\u012Bng	7	v	watch attentively|fix one's attention on|stare at|gaze at
\u5C06\u519B	ji\u0101ng j\u016Bn	6	n	general|high-ranking military officer|check or checkmate|fig. to embarrass|challenge
\u8349	c\u01CEo	2	n	grass|straw|manuscript|draft|careless|rough
\u900F\u9732	t\xF2u l\xF9	6	v	leak out|divulge|reveal
\u6E56	h\xFA	2	n	lake
\u5175	b\u012Bng	4	n	soldiers|force|army|weapons|arms|military|warlike
\u6B63\u597D	zh\xE8ng h\u01CEo	2	z	just|just right|just enough|happen to|chance to|by chance
\u4E3B\u52A8	zh\u01D4 d\xF2ng	3	ad	take the initiative|spontaneous|active|drive
\u9662	yu\xE0n	2	n	courtyard|institution
\u751C	ti\xE1n	3	a	sweet
\u7F51\u4E0A	w\u01CEng sh\xE0ng	1	s	online
\u670D\u88C5	f\xFA zhu\u0101ng	3	n	dress|clothing|costume|clothes
\u5F62\u5F0F	x\xEDng sh\xEC	3	n	outer appearance|form|shape|formality
\u786C	y\xECng	5	a	hard|stiff|solid|strong|firm|resolutely|uncompromisingly|laboriously
\u56DE\u590D	hu\xED f\xF9	4	v	reply|recover|return|re: in reply to
\u6BD5\u7ADF	b\xEC j\xECng	5	d	after all|all in all|in the final analysis
\u5C45\u6C11	j\u016B m\xEDn	4	n	resident|inhabitant
\u9650\u5236	xi\xE0n zh\xEC	4	v	restrict|limit|confine|restriction
\u5224\u65AD	p\xE0n du\xE0n	3	v	judge|determine|judgment
\u606D\u559C	g\u014Dng x\u01D0	7	v	congratulate|congratulations
\u4E07\u4E00	w\xE0n y\u012B	4	c	just in case|if by any chance|contingency
\u5C38\u4F53	sh\u012B t\u01D0	7	n	dead body|corpse|carcass
\u597D\u5403	h\u01CEo ch\u012B	1	a	tasty|delicious|be fond of eating|be gluttonous
\u518D\u89C1	z\xE0i ji\xE0n	1	v	goodbye
\u5982\u4ECA	r\xFA j\u012Bn	4	t	nowadays|now
\u660E\u5E74	m\xEDng ni\xE1n	1	t	next year
\u524D\u5F80	qi\xE1n w\u01CEng	3	v	leave for|proceed towards|go to
\u76F8\u4E92	xi\u0101ng h\xF9	3	d	each other|mutual
\u4FA7	c\xE8	6	v	side|incline towards|lean|inclined|lateral|lean on one side
\u5206\u624B	f\u0113n sh\u01D2u	4	v	part company|split up|break up
\u59B9	m\xE8i	1	n	younger sister
\u604B\u7231	li\xE0n \xE0i	5	v	love|in love|have an affair
\u6210\u7ACB	ch\xE9ng l\xEC	3	v	establish|set up|be tenable|hold water
\u53EA\u4E0D\u8FC7	zh\u01D0 bu gu\xF2	5	d	only|merely|nothing but|no more than|it's just that
\u56E2\u961F	tu\xE1n du\xEC	6	n	team
\u6B4C\u66F2	g\u0113 q\u01D4	5	n	song
\u5B89\u9759	\u0101n j\xECng	2	a	quiet|peaceful|calm
\u6A21\u5F0F	m\xF3 sh\xEC	5	n	mode|method|pattern
\u95ED	b\xEC	6	v	close|stop up|shut|obstruct
\u5F02\u5E38	y\xEC ch\xE1ng	6	a	unusual|abnormal|extremely|exceptionally
\u7259	y\xE1	4	n	tooth|ivory
\u7C89	f\u011Bn	7	n	powder|cosmetic face powder|food prepared from starch|turn to powder|whitewash|white|pink|be a fan of
\u7EC6\u8282	x\xEC ji\xE9	4	n	details|particulars
\u8DB3	z\xFA	6	a	foot|be sufficient|ample|excessive
\u66F2	q\u016B	7	g	bent|crooked|wrong|yeast|aspergillus|taiwan pr|tune|song
\u5509	\xE0i	7	e	alas|oh dear|sigh
\u6863\u6848	d\xE0ng \xE0n	6	n	file|record|archive
\u73B0\u4EE3	xi\xE0n d\xE0i	3	t	modern times|modern age|modern era|hyundai, south korean company
\u8BBE	sh\xE8	7	v	set up|put in place|given|suppose|if
\u7EF4\u6301	w\xE9i ch\xED	4	v	keep|maintain|preserve
\u534F\u4F1A	xi\xE9 hu\xEC	6	n	association|society
\u516C	g\u014Dng	6	g	public|collectively owned|common|international|make public|fair|just|honorable
\u5F39	t\xE1n	5	v	pluck|play|spring or leap|shoot|fluff or tease|flick|flip|accuse
\u9053\u7406	d\xE0o li	2	n	reason|argument|sense|principle|basis|justification
\u8FD9\u513F	zh\xE8 r	1	r	here
\u6709\u8DA3	y\u01D2u q\xF9	4	a	interesting|fascinating|amusing
\u8FC5\u901F	x\xF9n s\xF9	4	ad	rapid|speedy|fast
\u4F3C\u7684	sh\xEC de	4	u	seems as if|rather like|taiwan pr
\u516C\u91CC	g\u014Dng l\u01D0	2	q	kilometer
\u5DE5\u8D44	g\u014Dng z\u012B	3	n	wages|pay
\u5FC5	b\xEC	5	d	certainly|must|will|necessarily
\u7EC6\u80DE	x\xEC b\u0101o	6	n	cell
\u6258	tu\u014D	6	v	prop|support|rest|thanks to|hold in one's hand|support in one's palm|give|base
\u54EA\u513F	n\u01CE r	1	r	where|wherever|anywhere|somewhere|how can|how could
\u597D\u5904	h\u01CEo chu	2	n	benefit|advantage|merit|gain|profit|also pr
\u65C5\u6E38	l\u01DA y\xF3u	2	vn	trip|journey|tourism|travel|tour
\u4E00\u9762	y\u012B mi\xE0n	7	n	one side|one aspect|simultaneously|one's whole face
\u51FA\u5E2D	ch\u016B x\xED	4	v	attend|participate|present
\u75C7\u72B6	zh\xE8ng zhu\xE0ng	6	n	symptom
\u8BD5\u56FE	sh\xEC t\xFA	5	v	attempt|try
\u60A3\u8005	hu\xE0n zh\u011B	6	n	patient|sufferer
\u62E8	b\u014D	7	v	stick etc|dial|allocate|set aside|poke|pluck|turn round|classifier: group, batch
\u6DF1\u523B	sh\u0113n k\xE8	3	a	profound|deep|deep-going
\u4F24\u5FC3	sh\u0101ng x\u012Bn	3	a	grieve|be broken-hearted|feel deeply hurt
\u5E86\u795D	q\xECng zh\xF9	3	v	celebrate
\u5A5A\u793C	h\u016Bn l\u01D0	4	n	wedding ceremony|wedding
\u8258	s\u014Du	7	q	taiwan pr
\u773C\u524D	y\u01CEn qi\xE1n	3	s	before one's eyes|now|at present
\u8DB3\u7403	z\xFA qi\xFA	3	n	soccer ball|football|soccer
\u5168\u9762	qu\xE1n mi\xE0n	3	ad	all-around|comprehensive|total|overall
\u4F53\u9A8C	t\u01D0 y\xE0n	3	v	experience for oneself
\u8D22\u4EA7	c\xE1i ch\u01CEn	4	n	property|assets|estate
\u575A\u5F3A	ji\u0101n qi\xE1ng	3	a	staunch|strong
\u73BB\u7483	b\u014D li	5	n	glass|male homosexual
\u8BDD\u9898	hu\xE0 t\xED	3	n	subject|topic
\u53E4	g\u01D4	3	a	ancient|old|paleo-
\u519B\u4E8B	j\u016Bn sh\xEC	6	n	military affairs|military
\u6746	g\u01CEn	6	g	stick|pole|lever
\u82F9\u679C	p\xEDng gu\u01D2	3	n	apple
\u54AC	y\u01CEo	5	v	bite|nip
\u94F6	y\xEDn	3	b	silver|silver-colored
\u523A	c\xEC	4	v	thorn|sting|thrust|prick|pierce|stab|assassinate|murder
\u533A\u522B	q\u016B bi\xE9	3	n	difference|distinguish|discriminate|make a distinction
\u7C89\u4E1D	f\u011Bn s\u012B	7	n	bean vermicelli|mung bean starch noodles|chinese vermicelli|cellophane noodles|fan
\u5408\u6CD5	h\xE9 f\u01CE	3	a	lawful|legitimate|legal
\u81F3\u4E8E	zh\xEC y\xFA	6	p	as for|as to
\u6240\u5728	su\u01D2 z\xE0i	5	n	place|location
\u4F5C\u4E1A	zu\xF2 y\xE8	2	n	school assignment|homework|work|task|operation|operate
\u7F8A	y\xE1ng	3	n	sheep|goat
\u5BB6\u957F	ji\u0101 zh\u01CEng	2	n	head of a household|family head|patriarch
\u5DE5\u7A0B	g\u014Dng ch\xE9ng	4	n	engineering|engineering project|project|undertaking
\u7075\u9B42	l\xEDng h\xFAn	7	n	soul|spirit
\u80A5	f\xE9i	4	n	fat|fertile|loose-fitting or large|fertilize|fertilizer|manure
\u60A3	hu\xE0n	7	v	suffer|contract|misfortune|trouble|danger|worry
\u955C\u5934	j\xECng t\xF3u	4	n	camera lens|camera shot|scene
\u5B9E\u65BD	sh\xED sh\u012B	4	v	implement|carry out
\u6E7F	sh\u012B	4	a	moist|wet
\u8D37\u6B3E	d\xE0i ku\u01CEn	5	n	loan|provide a loan|raise a loan
\u679A	m\xE9i	7	q	tree trunk|whip
\u7F3A\u4E4F	qu\u0113 f\xE1	5	v	lack|be short of
\u6697	\xE0n	4	a	dark|turn dark|secret|hidden|confused|ignorant|close|eclipse
\u8BD7	sh\u012B	4	n	poem|poetry|verse|book of songs
\u51CC\u6668	l\xEDng ch\xE9n	7	t	in the wee hours
\u7626	sh\xF2u	5	a	thin|lose weight|tight|lean|unproductive
\u7EDD	ju\xE9	6	d	cut short|extinct|disappear|vanish|absolutely|by no means
\u4E0D\u5BF9	b\xF9 du\xEC	1	a	incorrect|wrong|amiss|abnormal|queer
\u7C7B\u578B	l\xE8i x\xEDng	4	n	type|kind|category
\u4E2D\u5348	zh\u014Dng w\u01D4	1	t	noon|midday
\u5C06\u6765	ji\u0101ng l\xE1i	3	t	in the future|future
\u52D2	l\xE8	7	v	rein in|compel|force|carve|engrave|command|lead|bridle
\u9501	su\u01D2	5	v	lock|lock up
\u7EFF	l\u01DC	2	a	green
\u9020	z\xE0o	3	v	make|build|manufacture|invent|fabricate|go to|party|crop
\u91CD\u590D	ch\xF3ng f\xF9	2	v	repeat|duplicate
\u804A\u5929	li\xE1o ti\u0101n	4	v	chat|gossip
\u81EA\u4FE1	z\xEC x\xECn	4	v	have confidence in oneself|self-confidence
\u4E2A\u6027	g\xE8 x\xECng	3	n	individuality|personality
\u6279\u51C6	p\u012B zh\u01D4n	3	v	approve|ratify
\u5BB3	h\xE0i	5	v	do harm to|cause trouble to|harm|evil|calamity
\u4ED6\u4EBA	t\u0101 r\xE9n	7	r	another person|sb else|other people
\u524D\u8FDB	qi\xE1n j\xECn	3	v	go forward|forge ahead|advance|onward
\u7D20	s\xF9	7	g	raw silk|white|plain, unadorned|vegetarian|essence|nature|element|constituent
\u6DD8\u6C70	t\xE1o t\xE0i	7	v	wash out|cull|weed out|eliminate|die out|phase out
\u5564\u9152	p\xED ji\u01D4	3	n	beer
\u7ACB	l\xEC	5	v	stand|set up|establish|lay down|draw up|at once|immediately
\u9A82	m\xE0	5	v	scold|abuse|curse
\u5C0F\u8BF4	xi\u01CEo shu\u014D	2	n	novel|fiction
\u673A\u5668	j\u012B q\xEC	3	n	machine
\u6599	li\xE0o	6	n	material|stuff|grain|feed|expect|anticipate|guess
\u516C\u4F17	g\u014Dng zh\xF2ng	6	n	public
\u91CA\u653E	sh\xEC f\xE0ng	7	v	release|set free|liberate|discharge
\u7A0D	sh\u0101o	5	d	somewhat|little
\u6559\u5E08	ji\xE0o sh\u012B	2	n	teacher
\u83B7\u80DC	hu\xF2 sh\xE8ng	7	v	victorious|win|triumph
\u5B88	sh\u01D2u	4	v	guard|defend|keep watch|abide by the law|observe|nearby|adjoining
\u6ED1	hu\xE1	5	v	slip|slide|slippery|smooth|sly|not to be trusted
\u64CD\u4F5C	c\u0101o zu\xF2	4	v	work|operate|manipulate
\u767D\u8272	b\xE1i s\xE8	2	n	white|fig. reactionary|anti-communist
\u8FBE\u6210	d\xE1 ch\xE9ng	5	v	reach|accomplish
\u8D77\u5E8A	q\u01D0 chu\xE1ng	1	v	get out of bed|get up
\u9F13\u52B1	g\u01D4 l\xEC	5	v	encourage
\u86CB\u7CD5	d\xE0n g\u0101o	5	n	cake
\u65B0\u9C9C	x\u012Bn xi\u0101n	4	a	fresh|freshness|novel|uncommon
\u6807\u5FD7	bi\u0101o zh\xEC	4	n	sign|mark|symbol|logo|symbolize|indicate
\u516C\u5E03	g\u014Dng b\xF9	3	v	announce|make public|publish
\u662F\u4E0D\u662F	sh\xEC b\xF9 sh\xEC	1	v	is or isn't|yes or no|whether or not
\u5DE5\u5382	g\u014Dng ch\u01CEng	3	n	factory
\u672C\u4EBA	b\u011Bn r\xE9n	5	r	i|me|myself|oneself|yourself|himself|herself|person concerned
\u6307\u51FA	zh\u01D0 ch\u016B	3	v	indicate|point out
\u7406\u60F3	l\u01D0 xi\u01CEng	2	n	ideal|dream|perfect
\u6492	s\u0101	7	v	let go|cast|let loose|discharge|give expression to|pee|scatter|sprinkle
\u5FC3\u810F	x\u012Bn z\xE0ng	6	n	heart
\u55E8	h\u0101i	6	e	oh alas|hey|hi|high
\u540E\u6094	h\xF2u hu\u01D0	5	v	regret|feel remorse
\u4E3E\u529E	j\u01D4 b\xE0n	3	v	conduct|hold
\u5F00\u8F66	k\u0101i ch\u0113	1	v	drive a car
\u5BB6\u65CF	ji\u0101 z\xFA	7	n	family|clan
\u6597\u4E89	d\xF2u zh\u0113ng	6	vn	struggle|fight|battle
\u4EBA\u624D	r\xE9n c\xE1i	3	n	talent|talented person|looks|attractive looks
\u770B\u4E0A\u53BB	k\xE0n shang qu	3	v	it would appear|it seems
\u611F\u52A8	g\u01CEn d\xF2ng	2	v	move|touch|moving
\u9EC4\u91D1	hu\xE1ng j\u012Bn	4	n	gold|golden|prime
\u51FA\u79DF\u8F66	ch\u016B z\u016B ch\u0113	2	n	taxi|rental car
\u9B45\u529B	m\xE8i l\xEC	7	n	charm|fascination|glamor|charisma
\u597D\u4E8B	h\u01CEo sh\xEC	2	n	charity|happy occasion|be meddlesome
\u7ED9\u4E88	j\u01D0 y\u01D4	6	v	give|accord|render
\u63D0\u5230	t\xED d\xE0o	2	v	mention|raise|refer to
\u83B7	hu\xF2	4	v	catch|capture|get|obtain|win|reap|harvest
\u4E0D\u5982	b\xF9 r\xFA	2	v	not equal to|not as good as|inferior to
\u821E\u8E48	w\u01D4 d\u01CEo	6	n	dance|dancing
\u6307\u6325	zh\u01D0 hu\u012B	4	v	conduct|command|direct|conductor
\u9898	t\xED	2	n	topic|problem for discussion|exam question|subject|inscribe|mention
\u4F19\u4F34	hu\u01D2 b\xE0n	4	n	partner|companion|comrade
\u7A81\u7834	t\u016B p\xF2	5	v	break through|make a breakthrough|surmount
\u9732	l\xF9	6	v	dew|syrup|nectar|outdoors|show|reveal|betray|expose
\u56E0\u7D20	y\u012Bn s\xF9	6	n	element|factor
\u4E3A\u6B64	w\xE8i c\u01D0	6	d	for this reason|with regards to this|in this respect|this end
\u987E\u5BA2	g\xF9 k\xE8	2	n	customer|client
\u5355\u8EAB	d\u0101n sh\u0113n	7	n	unmarried|single
\u53D1\u5E03	f\u0101 b\xF9	5	v	release|issue|announce|distribute
\u5FCD	r\u011Bn	5	v	bear|endure|tolerate|restrain oneself
\u73AF	hu\xE1n	3	n	ring|hoop|loop|link|surround|encircle|hem in
\u53CC\u65B9	shu\u0101ng f\u0101ng	3	n	bilateral|both sides|both parties involved
\u5E72\u4EC0\u4E48	g\xE0n sh\xE9n me	1	v	what are you doing|what's he up to
\u96BE\u8FC7	n\xE1n gu\xF2	2	a	feel sad|feel unwell|be difficult
\u6478	m\u014D	4	v	feel with the hand|touch|stroke|grope|steal|abstract
\u56DE\u5934	hu\xED t\xF3u	5	d	turn round|turn one's head|later|by and by
\u7EC4\u6210	z\u01D4 ch\xE9ng	2	v	form|make up|constitute
\u79BB\u5A5A	l\xED h\u016Bn	3	v	divorce
\u9000\u51FA	tu\xEC ch\u016B	3	v	withdraw|abort|quit|log out
\u652F\u4ED8	zh\u012B f\xF9	3	v	pay
\u6D41\u884C	li\xFA x\xEDng	2	v	spread|propagate|popular|fashionable
\u6CD5\u5B98	f\u01CE gu\u0101n	4	n	judge
\u563F	h\u0113i	7	e	hey
\u8D76\u5FEB	g\u01CEn ku\xE0i	3	d	quickly|at once
\u80A1\u7968	g\u01D4 pi\xE0o	6	n	share certificate|stock
\u54FC	h\u0113ng	7	e	groan|snort|hum|croon|humph
\u9001\u7ED9	s\xF2ng g\u011Bi	2	v	send|give as a present
\u771F\u5FC3	zh\u0113n x\u012Bn	7	d	sincere|heartfelt
\u8111\u888B	n\u01CEo dai	4	n	head|skull|brains|mental capability
\u8840\u6DB2	xu\xE8 y\xE8	6	n	blood
\u4E3B\u7BA1	zh\u01D4 gu\u01CEn	5	vn	in charge|responsible for|person in charge|manager
\u5E93	k\xF9	5	n	warehouse|storehouse|library
\u6574\u7406	zh\u011Bng l\u01D0	3	v	arrange|tidy up|sort out|straighten out|list systematically|collate|pack
\u5435	ch\u01CEo	3	v	quarrel|make a noise|noisy
\u4E0D\u4E45	b\xF9 ji\u01D4	2	m	not long|before too long|soon|soon after
\u4E30\u5BCC	f\u0113ng f\xF9	3	a	enrich|rich|plentiful|abundant
\u52A8\u529B	d\xF2ng l\xEC	3	n	motive power|force|motivation|impetus
\u7B54	d\xE1	5	v	answer|reply|respond
\u5F62	x\xEDng	6	g	appear|look|form|shape
\u5956\u52B1	ji\u01CEng l\xEC	5	vn	reward
\u4E4B\u4E0B	zh\u012B xi\xE0	5	f	under|beneath|less than
\u718A	xi\xF3ng	5	n	bear|scold|rebuke|weak|incapable
\u5BA2\u4EBA	k\xE8 r\xE9n	2	n	visitor|guest|customer|client
\u6E29\u6696	w\u0113n nu\u01CEn	3	an	warm
\u539F\u8C05	yu\xE1n li\xE0ng	6	v	excuse|forgive|pardon
\u795D\u798F	zh\xF9 f\xFA	4	v	blessings|wish sb well
\u5976	n\u01CEi	1	n	breast|milk|breastfeed|mother
\u627F\u53D7	ch\xE9ng sh\xF2u	4	v	bear|support|inherit
\u95E8\u53E3	m\xE9n k\u01D2u	1	s	doorway|gate
\u809A\u5B50	d\xF9 zi	4	n	belly|abdomen|stomach
\u9F50	q\xED	3	a	neat|even|level with|identical|simultaneous|all together|even sth out
\u516C\u4E3B	g\u014Dng zh\u01D4	6	n	princess
\u5E02\u6C11	sh\xEC m\xEDn	6	n	city resident
\u4EBA\u53E3	r\xE9n k\u01D2u	2	n	population|people
\u54A8\u8BE2	z\u012B x\xFAn	6	vn	consult|seek advice|consultation|inquiry
\u677E	s\u014Dng	4	v	loose|loosen|relax|floss|pine
\u5730\u4F4D	d\xEC w\xE8i	4	n	position|status|place
\u8868\u9762	bi\u01CEo mi\xE0n	3	n	surface|face|outside|appearance
\u5242	j\xEC	7	q	dose
\u5E38\u5E38	ch\xE1ng ch\xE1ng	1	d	frequently|often
\u8FD9\u8FB9	zh\xE8 bi\u0101n	1	r	this side|here
\u57CB	m\xE1i	6	v	bury
\u5927\u8D5B	d\xE0 s\xE0i	6	vn	grand contest
\u5E73\u65F6	p\xEDng sh\xED	2	t	ordinarily|in normal times|in peacetime
\u9752	q\u012Bng	5	a	green|blue|black|youth|young
\u987A	sh\xF9n	6	v	obey|follow|arrange|make reasonable|along|favorable
\u767B	d\u0113ng	4	v	scale|ascend|mount|publish or record|enter|step or tread on|put on
\u4E0D\u5E78	b\xF9 x\xECng	5	a	misfortune|adversity|unfortunate|sad|unfortunately
\u7537\u751F	n\xE1n sh\u0113ng	1	n	schoolboy|male student|boy|guy
\u6BD4\u5982\u8BF4	b\u01D0 r\xFA shu\u014D	2	v	for example
\u7387	shu\xE0i	7	v	lead|command|rash|hasty|frank|straightforward|generally|usually
\u7ED3\u6784	ji\xE9 g\xF2u	4	n	structure|composition|makeup|architecture
\u80FD\u91CF	n\xE9ng li\xE0ng	5	n	energy|capabilities
\u5987\u5973	f\xF9 n\u01DA	6	n	woman
\u706B\u8F66	hu\u01D2 ch\u0113	1	n	train
\u8FA3	l\xE0	4	a	hot|pungent|sting|burn
\u9886\u5148	l\u01D0ng xi\u0101n	3	v	lead|be in front
\u534A\u573A	b\xE0n ch\u01CEng	7		half-court
\u77DB\u76FE	m\xE1o d\xF9n	5	an	contradiction|conflicting views|contradictory
\u91CE	y\u011B	6	b	field|plain|open space|limit|boundary|rude|feral
\u4F5C\u8005	zu\xF2 zh\u011B	3	n	author|writer
\u543B	w\u011Bn	7	v	kiss|mouth
\u4E3B\u4E49	zh\u01D4 y\xEC	7	n	-ism|ideology
\u4E0D\u597D\u610F\u601D	b\xF9 h\u01CEo y\xEC si	2	v	feel embarrassed|find it embarrassing|be sorry
\u8D28\u91CF	zh\xEC li\xE0ng	4	n	quality|mass
\u5230\u6765	d\xE0o l\xE1i	5	v	arrive|arrival|advent
\u6E05\u7406	q\u012Bng l\u01D0	5	v	clear up|tidy up|dispose of
\u5976\u5976	n\u01CEi nai	1	n	grandma|mistress of the house|boobies|breasts
\u4E0A\u5347	sh\xE0ng sh\u0113ng	3	v	rise|go up|ascend
\u58F0\u660E	sh\u0113ng m\xEDng	3	n	state|declare|statement|declaration
\u4FBF\u5B9C	pi\xE1n yi	2	a	cheap|inexpensive|small advantages|let sb off lightly|convenient
\u56F4	w\xE9i	3	v	encircle|surround|all around|wear by wrapping around
\u6FC0\u60C5	j\u012B q\xEDng	6	n	passion|fervor|enthusiasm|strong emotion
\u4ECE\u672A	c\xF3ng w\xE8i	7	d	never
\u6109\u5FEB	y\xFA ku\xE0i	6	a	cheerful|cheerily|delightful|pleasant|pleasantly|pleasing|happy|delighted
\u5B8C\u6574	w\xE1n zh\u011Bng	3	a	complete|intact
\u8DEF\u7EBF	l\xF9 xi\xE0n	3	n	itinerary|route|political line
\u4E0A\u6B21	sh\xE0ng c\xEC	1	t	last time
\u716E	zh\u01D4	6	v	cook|boil
\u78B0	p\xE8ng	2	v	touch|meet with|bump
\u8C08\u5224	t\xE1n p\xE0n	3	vn	negotiate|negotiation|talks|conference
\u4E1A	y\xE8	7	g	line of business|industry|occupation|job|employment|school studies|enterprise|property
\u6210\u4EA4	ch\xE9ng ji\u0101o	5	v	complete a contract|reach a deal
\u5728\u4E4E	z\xE0i hu	4	v	care about
\u7801	m\u01CE	7	q	weight|number|code|pile|stack
\u9047	y\xF9	4	v	meet|encounter|treat|receive|opportunity|chance
\u98DE\u884C	f\u0113i x\xEDng	3	vn	fly|flying|flight|aviation
\u8F83	ji\xE0o	3	d	compare|dispute|compared to|relatively|comparatively|rather|also pr
\u8BF7\u6C42	q\u01D0ng qi\xFA	2	v	request|ask
\u5BC4	j\xEC	4	v	send|mail|entrust|depend on|attach oneself to|live|lodge|foster
\u7EAA\u5FF5	j\xEC ni\xE0n	3	v	commemorate|honor the memory of|memento|keepsake|souvenir
\u9020\u578B	z\xE0o x\xEDng	4	n	model|shape|appearance|style|design|form|pose
\u4E00\u53E5\u8BDD	y\u012B j\xF9 hu\xE0	5		in a word|in short
\u798F	f\xFA	3	n	good fortune|happiness|luck
\u9910	c\u0101n	6	g	meal|eat
\u8865	b\u01D4	3	v	repair|patch|mend|make up for|fill|supplement
\u65CF	z\xFA	6	g	race|nationality|ethnicity|clan
\u88C5\u5907	zhu\u0101ng b\xE8i	6	n	equipment|equip|outfit
\u5723\u8BDE\u8282	Sh\xE8ng d\xE0n ji\xE9	6	t	christmas time|christmas season|christmas
\u969C\u788D	zh\xE0ng \xE0i	6	n	barrier|obstruction|hindrance|impediment|obstacle
\u8D76\u5230	g\u01CEn d\xE0o	3	v	hurry
\u5168\u65B0	qu\xE1n x\u012Bn	6	b	all new|completely new
\u51C6\u786E	zh\u01D4n qu\xE8	2	a	accurate|exact|precise
\u81EA\u6740	z\xEC sh\u0101	5	v	kill oneself|commit suicide|attempt suicide
\u7897	w\u01CEn	2	n	bowl|cup
\u5371\u673A	w\u0113i j\u012B	6	n	crisis
\u8D1F\u8D23\u4EBA	f\xF9 z\xE9 r\xE9n	5	n	person in charge
\u65C1	p\xE1ng	5	f	one side|other|different
\u63D2	ch\u0101	5	v	insert|stick in|pierce|take part in|interfere|interpose
\u8BE6\u7EC6	xi\xE1ng x\xEC	5	a	detailed|in detail|minute
\u5531\u6B4C	ch\xE0ng g\u0113	1	v	sing a song
\u516C\u6C11	g\u014Dng m\xEDn	3	n	citizen
\u60CA	j\u012Bng	7	v	startle|be frightened|be scared|alarm
\u78B0\u5230	p\xE8ng d\xE0o	2	v	come across|run into|meet|hit
\u5F53\u521D	d\u0101ng ch\u016B	3	t	at that time|originally
\u5206\u522B	f\u0113n bi\xE9	3	d	part|leave each other|distinguish|tell apart|difference|distinction|in different ways|differently
\u60C5\u62A5	q\xEDng b\xE0o	7	n	information|intelligence
\u613F\u671B	yu\xE0n w\xE0ng	3	n	desire|wish
\u7EBF\u7D22	xi\xE0n su\u01D2	5	n	trail|clues|thread
\u5F15	y\u01D0n	4	v	draw|pull|stretch sth|extend|lengthen|involve or implicate in|attract|lead
\u84DD\u8272	l\xE1n s\xE8	2	n	blue
\u7981\u6B62	j\xECn zh\u01D0	4	v	prohibit|forbid|ban
\u964D	ji\xE0ng	4	v	drop|fall|come down|descend|surrender|capitulate|subdue|tame
\u5706	yu\xE1n	4	g	circle|round|circular|spherical|full|unit of chinese currency|tactful|make consistent and whole
\u5C3F	ni\xE0o	7	n	urinate|urine
\u61C2\u5F97	d\u01D2ng de	2	v	understand|know|comprehend
\u5E7F\u573A	gu\u01CEng ch\u01CEng	2	n	public square|plaza
\u7761\u7740	shu\xEC zh\xE1o	4	v	fall asleep
\u5EA6\u8FC7	d\xF9 gu\xF2	4	v	pass|spend|survive|get through
\u53F3\u8FB9	y\xF2u bian	1	f	right side|right
\u51B7\u9759	l\u011Bng j\xECng	4	a	calm|cool-headed|dispassionate|deserted|quiet
\u5730\u4E0B	d\xEC xi\xE0	4	s	underground|subterranean|covert
\u597D\u4E45	h\u01CEo ji\u01D4	2	m	quite a while
\u62A4	h\xF9	6	v	protect
\u81ED	ch\xF2u	5	a	stench|smelly|smell|repulsive|loathsome|terrible|bad|severely
\u91D1\u5C5E	j\u012Bn sh\u01D4	7	n	metal
\u95EA	sh\u01CEn	4	v	dodge|beat it|shaken|sprain|pull a muscle|lightning|spark|flash
\u8FDD\u6CD5	w\xE9i f\u01CE	5	v	illegal|break the law
\u773C\u795E	y\u01CEn sh\xE9n	7	n	meaningful glance|wink|eyesight
\u957F\u671F	ch\xE1ng q\u012B	3	b	long term|long time|long range
\u888B	d\xE0i	4	g	pouch|bag|sack|pocket
\u8D2D\u7269	g\xF2u w\xF9	4	v	shopping
\u7070	hu\u012B	7	g	ash|dust|lime|gray|discouraged|dejected
\u5806	du\u012B	5	q	pile up|heap up|mass|pile|heap|stack|large amount
\u6570\u91CF	sh\xF9 li\xE0ng	3	n	amount|quantity|quantitative
\u7537\u6027	n\xE1n x\xECng	5	n	male sex|male
\u4FDD\u7559	b\u01CEo li\xFA	3	v	keep|retain|have reservations|hold back|put aside for later
\u54C1	p\u01D0n	5	g	article|commodity|product|goods|grade|rank|kind|type
\u6536\u96C6	sh\u014Du j\xED	5	v	gather|collect
\u590F\u5929	xi\xE0 ti\u0101n	2	t	summer
\u8BA1	j\xEC	7	v	calculate|compute|count|regard as important|plan|ruse|meter|gauge
\u63A5\u4E0B\u6765	ji\u0113 xi\xE0 l\xE1i	2	v	accept|take|next|following
\u7CBE	j\u012Bng	6	a	essence|extract|vitality|energy|semen|sperm|mythical goblin spirit|highly perfected
\u65E9\u9910	z\u01CEo c\u0101n	2	n	breakfast
\u6BC1	hu\u01D0	6	v	destroy|ruin|defame|slander|destroy by fire
\u52C7\u6562	y\u01D2ng g\u01CEn	4	a	brave|courageous
\u56FE\u7247	t\xFA pi\xE0n	2	n	picture|photograph
\u76F8\u6BD4	xi\u0101ng b\u01D0	3	v	compare
\u6DF1\u5165	sh\u0113n r\xF9	3	v	penetrate deeply|thorough
\u77F3\u6CB9	sh\xED y\xF3u	3	n	oil|petroleum
\u9891\u9053	p\xEDn d\xE0o	5	n	frequency|channel
\u60C5\u611F	q\xEDng g\u01CEn	3	n	feeling|emotion|move
\u79F0\u4E3A	ch\u0113ng w\xE9i	3	v	be called|be known as|call it "..."
\u8F66\u8F86	ch\u0113 li\xE0ng	2	n	vehicle
\u4F7F\u5F97	sh\u01D0 de	5	v	usable|workable|feasible|doable|make|cause
\u5F53\u5E74	d\u0101ng ni\xE1n	5	t	in those days|then|in those years|during that time|that very same year
\u6597	d\xF2u	7	v	fight|struggle|condemn|censure|contend|put together|coming together|decaliter
\u516C\u5BD3	g\u014Dng y\xF9	7	n	apartment building|block of flats
\u76D2	h\xE9	5	g	small box|case
\u4E0A\u5B66	sh\xE0ng xu\xE9	1	v	go to school|attend school
\u6563	s\u01CEn	4	v	scattered|loose|come loose|fall apart|leisurely|powdered medicine|scatter|break up
\u4EBA\u7FA4	r\xE9n q\xFAn	3	n	crowd
\u4F9D\u9760	y\u012B k\xE0o	4	v	rely on sth|depend on
\u5F31	ru\xF2	4	a	weak|feeble|young|inferior|not as good as|slightly less than
\u4EA7	ch\u01CEn	7	v	give birth|reproduce|produce|product|resource|estate|property
\u4E0D\u8DB3	b\xF9 z\xFA	5	v	insufficient|lacking|deficiency|not enough|inadequate|not worth|cannot|should not
\u8B66\u544A	j\u01D0ng g\xE0o	5	v	warn|admonish
\u4E1A\u52A1	y\xE8 w\xF9	5	n	business|professional work|service
\u62A5\u8B66	b\xE0o j\u01D0ng	5	v	sound an alarm
\u8D2D\u4E70	g\xF2u m\u01CEi	4	v	purchase|buy
\u6218\u58EB	zh\xE0n sh\xEC	4	n	fighter|soldier|warrior
\u9A7E\u9A76	ji\xE0 sh\u01D0	5	v	pilot|drive
\u8BA1\u7B97	j\xEC su\xE0n	3	v	count|calculate|compute
\u5F00\u53D1	k\u0101i f\u0101	3	v	exploit|open up|develop
\u4E58	ch\xE9ng	5	v	ride|mount|make use of|avail oneself of|take advantage of|multiply|buddhist sect or creed|four horse military chariot
\u57FA\u56E0	j\u012B y\u012Bn	7	n	gene
\u6655	y\u016Bn	6	v	confused|dizzy|giddy|faint|swoon|lose consciousness|pass out|halo
\u6709\u610F\u601D	y\u01D2u y\xEC si	2	l	interesting|meaningful|enjoyable|fun
\u59CB\u7EC8	sh\u01D0 zh\u014Dng	3	d	from beginning to end|all along
\u7532	ji\u01CE	5	n	first|armor plating|shell or carapace|nail
\u5C31\u7B97	ji\xF9 su\xE0n	6	d	even if
\u725B\u5976	ni\xFA n\u01CEi	1	n	cow's milk
\u9769\u547D	g\xE9 m\xECng	7	vn	revolution|revolutionary|revolt|revolutionize
\u5B64\u72EC	g\u016B d\xFA	6	a	lonely|solitary
\u4E89	zh\u0113ng	3	v	strive for|vie for|argue or debate|deficient or lacking|how or what
\u9488	zh\u0113n	4	n	needle|pin|injection|stitch
\u5B98\u5458	gu\u0101n yu\xE1n	7	n	official|administrator
\u88C5\u7F6E	zhu\u0101ng zh\xEC	4	n	install|installation|equipment|system|unit|device
\u8BA2	d\xECng	3	v	agree|conclude|draw up|subscribe to|order
\u8D21\u732E	g\xF2ng xi\xE0n	6	n	contribute|dedicate|devote|contribution
\u8D4C	d\u01D4	6	v	bet|gamble
\u5212	hu\xE1	4	v	row|paddle|profitable|worth|it pays|delimit|transfer|assign
\u8499	m\xE9ng	6	v	cover|ignorant|suffer|receive|cheat|deceive|hoodwink|make a wild guess
\u51FA\u7248	ch\u016B b\u01CEn	5	v	publish
\u65E9\u6668	z\u01CEo ch\xE9n	2	t	early morning|also pr
\u66B4\u529B	b\xE0o l\xEC	6	n	violence|force|violent
\u51FA\u95E8	ch\u016B m\xE9n	2	v	go out|leave home|go on a journey|away from home|get married
\u536B\u751F	w\xE8i sh\u0113ng	3	an	health|hygiene|sanitation
\u795E\u5947	sh\xE9n q\xED	5	a	magical|mystical|miraculous
\u79FB	y\xED	4	v	move|shift|change|alter|remove
\u5DE7\u514B\u529B	qi\u01CEo k\xE8 l\xEC	4	n	chocolate
\u6D4B	c\xE8	4	v	survey|measure|conjecture
\u5973\u670B\u53CB	n\u01DA p\xE9ng you	1	n	girlfriend
\u8BCA\u65AD	zh\u011Bn du\xE0n	5	v	diagnose
\u526A	ji\u01CEn	5	v	scissors|shears|clippers|cut with scissors|trim|wipe out or exterminate
\u5C34\u5C2C	g\u0101n g\xE0	7	a	awkward|embarrassed
\u4EE5\u5916	y\u01D0 w\xE0i	2	f	apart from|other than|except for|external|outside of|beyond
\u4E34\u65F6	l\xEDn sh\xED	4	b	at the last moment|temporary|interim|ad hoc
\u5BCC	f\xF9	3	g	rich|abundant|wealthy
\u7269\u54C1	w\xF9 p\u01D0n	6	n	articles|goods
\u505A\u6CD5	zu\xF2 f\u01CE	2	n	way of handling sth|method for making|work method|recipe|practice
\u52A0\u5F3A	ji\u0101 qi\xE1ng	3	v	reinforce|strengthen|enhance
\u5355\u72EC	d\u0101n d\xFA	4	d	alone|by oneself|on one's own
\u53D1\u5C04	f\u0101 sh\xE8	5	v	shoot|fire|launch|emit|discharge|emanation|emission
\u9A84\u50B2	ji\u0101o \xE0o	6	an	pride|arrogance|conceited|proud of sth
\u6570\u5B66	sh\xF9 xu\xE9	3	n	mathematics|mathematical
\u7A7F\u7740	chu\u0101n zhu\xF3	7	n	attire|clothes|dress
\u6B62	zh\u01D0	6	v	stop|prohibit|until|only
\u8111\u5B50	n\u01CEo zi	5	n	brains|mind
\u754C	ji\xE8	6	n	boundary|border|realm
\u4FDD\u5B89	b\u01CEo \u0101n	3	b	ensure public security|ensure safety|public security|security guard
\u5B9E\u9A8C\u5BA4	sh\xED y\xE0n sh\xEC	3	n	laboratory
\u6B4C\u624B	g\u0113 sh\u01D2u	3	n	singer
\u4EE3\u4EF7	d\xE0i ji\xE0	5	n	price|cost|consideration
\u4F5C\u5BB6	zu\xF2 ji\u0101	2	n	author
\u5E73\u8861	p\xEDng h\xE9ng	6	a	balance|equilibrium
\u5168\u4F53	qu\xE1n t\u01D0	2	n	all|entire
\u5F00\u653E	k\u0101i f\xE0ng	3	v	bloom|open|be open|open up|be open-minded|unrestrained by convention|unconstrained in one's sexuality
\u5C40\u957F	j\xFA zh\u01CEng	5	n	bureau chief
\u5A74\u513F	y\u012Bng \xE9r	7	n	infant|baby|lead
\u4E0A\u8BFE	sh\xE0ng k\xE8	1	v	go to class|attend class
\u6324	j\u01D0	5	v	crowd in|cram in|force others aside|press|squeeze|find
\u533B\u5B66	y\u012B xu\xE9	4	n	medicine|medical science|study of medicine
\u5404\u5730	g\xE8 d\xEC	3	r	in all parts of|various regions
\u5730\u94C1	d\xEC ti\u011B	2	n	underground railway|subway|subway train
\u77A7	qi\xE1o	5	v	look at|see|visit
\u719F	sh\xFA	2	a	ripe|mature|thoroughly cooked|done|familiar|acquainted|experienced|skilled
\u504F	pi\u0101n	6	d	lean|slant|oblique|prejudiced|deviate from average|stubbornly|contrary to expectations
\u5927\u578B	d\xE0 x\xEDng	4	b	large|large-scale
\u6027\u683C	x\xECng g\xE9	3	n	nature|disposition|temperament|character
\u964D\u4F4E	ji\xE0ng d\u012B	4	v	reduce|lower|bring down
\u4E3B\u6301\u4EBA	zh\u01D4 ch\xED r\xE9n	6	n	tv or radio presenter|host|anchor
\u4F5C\u51FA	zu\xF2 ch\u016B	4	v	put out|come up with|make|issue|draw|deliver|devise|extract
\u5237	shu\u0101	4	v	brush|paint|daub|paste up|skip class|fire from a job|select
\u56E2\u7ED3	tu\xE1n ji\xE9	3	v	unite|unity|solidarity|united
\u641C\u7D22	s\u014Du su\u01D2	5	v	search|search for
\u6D89\u53CA	sh\xE8 j\xED	6	v	involve|touch upon
\u70B8	zh\xE0	6	v	burst|explode|blow up|fly into a rage|deep fry|taiwan pr
\u5C55\u5F00	zh\u01CEn k\u0101i	3	v	unfold|spread out|open up|launch|carry out
\u5C0F\u65F6\u5019	xi\u01CEo sh\xED hou	2	t	in one's childhood
\u628A\u63E1	b\u01CE w\xF2	3	v	grasp|seize|hold|assurance|certainty|sure
\u800D	shu\u01CE	7	v	play with|wield|act|display
\u9152\u5427	ji\u01D4 b\u0101	4	n	bar|pub|saloon
\u80C3	w\xE8i	5	n	stomach
\u6210\u5C31	ch\xE9ng ji\xF9	3	n	accomplishment|success|achievement|achieve|create|bring about
\u53A8\u623F	ch\xFA f\xE1ng	5	n	kitchen
\u7F6E	zh\xEC	7	v	install|place|put|buy
\u8BFE\u7A0B	k\xE8 ch\xE9ng	3	n	course|academic program
\u5168\u8EAB	qu\xE1n sh\u0113n	2	n	whole body|em
\u7EC3\u4E60	li\xE0n x\xED	2	v	practice|exercise|drill
\u770B\u8D77\u6765	k\xE0n q\u01D0 lai	3	v	seemingly|apparently|looks as if|appear to be|gives the impression that
\u8E29	c\u01CEi	6	v	step on|tread|stamp|press a pedal|pedal|downvote
\u6FC0\u70C8	j\u012B li\xE8	4	a	intense|fierce|acute|impassioned|vehement|drastic|extreme
\u4E4B\u5185	zh\u012B n\xE8i	5	f	inside|within
\u53D1\u52A8	f\u0101 d\xF2ng	3	v	start|launch|unleash|mobilize|arouse
\u60F3\u5FF5	xi\u01CEng ni\xE0n	4	v	miss|remember with longing|long to see again
\u544A	g\xE0o	7	v	say|tell|announce|report|denounce|file a lawsuit|sue
\u9884\u6D4B	y\xF9 c\xE8	4	v	forecast|predict
\u52C7\u6C14	y\u01D2ng q\xEC	4	n	courage|valor
\u56FA\u5B9A	g\xF9 d\xECng	4	a	fix|fasten|set rigidly in place|fixed|set|regular
\u7B56\u7565	c\xE8 lu:\xE8	6	n	strategy|tactics|crafty|adroit
\u6CE8\u518C	zh\xF9 c\xE8	5	v	register|enroll
\u7237\u7237	y\xE9 ye	1	n	father's father|paternal grandfather
\u727A\u7272	x\u012B sh\u0113ng	6	v	sacrifice one's life|sacrifice
\u5385	t\u012Bng	5	n	hall|living room|office|provincial government department
\u679C\u7136	gu\u01D2 r\xE1n	3	d	really|sure enough|as expected|if indeed
\u9009\u4E3E	xu\u01CEn j\u01D4	6	v	elect|election
\u968F\u7740	su\xED zhe	5	p	along with|in the wake of|following
\u653E\u5230	f\xE0ng d\xE0o	3	v	put in
\u4F4D\u4E8E	w\xE8i y\xFA	4	v	be located at|be situated at|lie
\u9677\u5165	xi\xE0n r\xF9	6	v	sink into|get caught up in|land in
\u6863	d\xE0ng	6	g	official records|grade|file|records|shelves|slot|gap|crosspiece
\u9759	j\xECng	3	a	still|calm|quiet|not moving
\u542C\u89C1	t\u012Bng ji\xE0n	1	v	hear
\u80AF	k\u011Bn	6	v	agree|consent|be willing to
\u54B1	z\xE1n	2	r	i or me|we
\u56DE\u62A5	hu\xED b\xE0o	5	v	return|reciprocation|payback|retaliation|report back|reciprocate
\u6447	y\xE1o	4	v	shake|rock|row|crank
\u9700\u6C42	x\u016B qi\xFA	3	n	requirement|require|demand
\u5C55\u73B0	zh\u01CEn xi\xE0n	5	v	unfold before one's eyes|emerge|reveal|display
\u6124\u6012	f\xE8n n\xF9	6	a	angry|indignant|wrath|ire
\u8BC4\u4F30	p\xEDng g\u016B	5	vn	evaluate|assess|assessment|evaluation
\u5168\u90FD	qu\xE1n d\u014Du	5	d	all|without exception
\u53EA\u597D	zh\u01D0 h\u01CEo	3	d	have to|be forced to
\u57F9\u517B	p\xE9i y\u01CEng	4	v	cultivate|breed|foster|nurture|educate|groom|education|fostering
\u5BC6\u7801	m\xEC m\u01CE	4	n	cipher|secret code|password|pin
\u56FD\u5185	gu\xF3 n\xE8i	3	s	domestic|internal|civil
\u5E73\u9759	p\xEDng j\xECng	4	a	tranquil|undisturbed|serene
\u8C08\u8BDD	t\xE1n hu\xE0	3	vn	talk|have a conversation|conversation
\u5E73\u5B89	p\xEDng \u0101n	2	a	safe and sound|well|without mishap|quiet and safe|at peace
\u4F20\u8BF4	chu\xE1n shu\u014D	3	n	legend|folk tale|they say that
\u4EBA\u6570	r\xE9n sh\xF9	2	n	number of people
\u539F\u672C	yu\xE1n b\u011Bn	7	d	originally|original
\u73AF\u8282	hu\xE1n ji\xE9	5	n	segment
\u5BAB	g\u014Dng	6	g	palace|temple|castration
\u8F6C\u53D8	zhu\u01CEn bi\xE0n	3	v	change|transform|shift|transformation
\u6B66\u88C5	w\u01D4 zhu\u0101ng	7	n	arms|equipment|arm|military|armed
\u80FD\u4E0D\u80FD	n\xE9ng b\xF9n\xE9ng	3		can you
\u81F3\u4ECA	zh\xEC j\u012Bn	3	d	so far|this day|until now
\u65E0\u6570	w\xFA sh\xF9	4	m	countless|numberless|innumerable
\u7EF4\u62A4	w\xE9i h\xF9	4	v	defend|safeguard|protect|uphold|maintain
\u9910\u5385	c\u0101n t\u012Bng	5	n	dining hall|dining room|restaurant
\u540E\u679C	h\xF2u gu\u01D2	3	n	consequences|aftermath
\u6253\u7834	d\u01CE p\xF2	3	v	break|smash
\u4E0A\u6765	sh\xE0ng l\xE1i	3	v	come up|approach
\u65B0\u5E74	x\u012Bn ni\xE1n	1	t	new year
\u6C14\u6C1B	q\xEC f\u0113n	6	n	atmosphere|mood
\u8FDD\u53CD	w\xE9i f\u01CEn	5	v	violate
\u8DDF\u8E2A	g\u0113n z\u014Dng	7	v	follow sb's tracks|tail|shadow|tracking
\u5168\u529B	qu\xE1n l\xEC	6	d	with all one's strength|full strength|all-out|fully
\u671B	w\xE0ng	7	v	full moon|hope|expect|visit|gaze|look towards|towards|15th day of month
\u5FC3\u7075	x\u012Bn l\xEDng	6	n	bright|smart|quick-witted|heart|thoughts|spirit
\u6D3B\u529B	hu\xF3 l\xEC	5	n	energy|vitality|vigor|vital force
\u9053\u6B49	d\xE0o qi\xE0n	6	v	apologize
\u5BF9\u4ED8	du\xEC fu	4	v	handle|deal with|tackle|get by with|make do|get along with
\u77F3\u5934	sh\xED tou	3	n	stone
\u59D4\u6258	w\u011Bi tu\u014D	5	vn	entrust|trust|commission
\u8D9F	t\u0101ng	6	qv	wade|trample|turn the soil|time|trip
\u4E3B\u6301	zh\u01D4 ch\xED	3	v	take charge of|manage or direct|preside over|uphold|stand for|host|anchor
\u7537\u670B\u53CB	n\xE1n p\xE9ng you	1	n	boyfriend
\u961F\u957F	du\xEC zh\u01CEng	2	n	captain|team leader
\u5173\u95ED	gu\u0101n b\xEC	4	v	close|shut|shut down
\u8F6F	ru\u01CEn	5	a	soft|flexible
\u8BBF\u95EE	f\u01CEng w\xE8n	3	v	visit|call on|interview
\u8FD0\u52A8\u5458	y\xF9n d\xF2ng yu\xE1n	4	n	athlete
\u5929\u5802	ti\u0101n t\xE1ng	6	n	paradise|heaven
\u59D0\u59B9	ji\u011B m\xE8i	4	n	sisters|siblings|sister
\u60F9	r\u011B	7	v	provoke|irritate|vex|stir up|anger|attract|cause
\u68EE\u6797	s\u0113n l\xEDn	4	n	forest
\u7B7E\u540D	qi\u0101n m\xEDng	5	v	sign|autograph|signature
\u822A\u7A7A	h\xE1ng k\u014Dng	4	n	aviation
\u5916\u5957	w\xE0i t\xE0o	4	n	coat|jacket
\u5148\u8FDB	xi\u0101n j\xECn	3	a	advanced|advance
\u5357\u65B9	n\xE1n f\u0101ng	2	s	south
\u6444\u5F71	sh\xE8 y\u01D0ng	5	v	take a photograph|photography|shoot
\u7528\u4E8E	y\xF2ng y\xFA	5	v	use in|use on|use for
\u805A\u4F1A	j\xF9 hu\xEC	4	v	party|gathering|meet|get together
\u901A\u9053	t\u014Dng d\xE0o	6	n	channel|thoroughfare|passage
\u7530	ti\xE1n	6	n	field|farm
\u4EA4\u6362	ji\u0101o hu\xE0n	4	v	exchange|swap|switch|commutative|commute
\u63CF\u8FF0	mi\xE1o sh\xF9	4	v	describe|description
\u4ECA\u65E5	j\u012Bn r\xEC	5	t	today
\u4E5F\u5C31\u662F\u8BF4	y\u011B ji\xF9 sh\xEC shu\u014D	7	v	in other words|that is to say|so|thus
\u624D\u80FD	c\xE1i n\xE9ng	3	n	talent|ability|capacity
\u6587\u660E	w\xE9n m\xEDng	3	n	civilized|civilization|culture
\u5076\u50CF	\u01D2u xi\xE0ng	5	n	idol
\u5C41\u80A1	p\xEC gu	6	n	buttocks|bottom|butt|back part
\u4E0B\u73ED	xi\xE0 b\u0101n	1	v	finish work|get off work
\u897F\u90E8	x\u012B b\xF9	3	f	western part
\u6DF7\u4E71	h\xF9n lu\xE0n	6	a	confusion|chaos|disorder
\u53CB\u597D	y\u01D2u h\u01CEo	2	a	friendly|amicable|close friend
\u4E01	d\u012Bng	7	nr	male adult|fourth|encounter|butyl
\u5C4A	ji\xE8	5	q	arrive at|period|become due
\u6321	d\u01CEng	5	v	resist|obstruct|hinder|keep off|block|cover|gear|arrange
\u5C1D	ch\xE1ng	5	v	taste|try|experience|ever|once
\u8BA4	r\xE8n	5	v	recognize|know|admit
\u805A	j\xF9	4	v	congregate|assemble|mass|gather together|amass|polymerize
\u521B\u610F	chu\xE0ng y\xEC	6	n	creative|creativity
\u4EBF	y\xEC	2	m	100 million
\u706B\u7BAD	hu\u01D2 ji\xE0n	6	n	rocket
\u9ED1\u6697	h\u0113i \xE0n	4	a	dark|darkly|darkness
\u5BF9\u8BDD	du\xEC hu\xE0	2	vn	talk|dialogue|conversation
\u505C\u8F66	t\xEDng ch\u0113	2	v	pull up|park|stop working|stall
\u6CE8\u5C04	zh\xF9 sh\xE8	5	v	injection|inject
\u51B2\u7A81	ch\u014Dng t\u016B	5	vn	conflict|clash of opposing forces|collision|contention
\u60CA\u8BB6	j\u012Bng y\xE0	7	a	amazed|astonished|surprise|amazing|astonishment|awe
\u5728\u573A	z\xE0i ch\u01CEng	5	v	be present|be on the scene
\u80BF\u7624	zh\u01D2ng li\xFA	7	n	tumor
\u5927\u5E08	d\xE0 sh\u012B	6	n	great master|master
\u654F\u611F	m\u01D0n g\u01CEn	5	a	sensitive|susceptible
\u6838	h\xE9	7	n	pit|stone|nucleus|nuclear|examine|check|verify|investigate
\u6D77\u519B	h\u01CEi j\u016Bn	6	n	navy
\u8D77\u8BC9	q\u01D0 s\xF9	6	v	sue|bring a lawsuit against|prosecute
\u8FD0\u6C14	y\xF9n qi	4	n	luck
\u73A9\u5177	w\xE1n j\xF9	3	n	plaything|toy
\u9F20	sh\u01D4	5	g	rat|mouse
\u5F97\u77E5	d\xE9 zh\u012B	7	v	find out|learn of
\u63D0\u793A	t\xED sh\xEC	5	v	point out|remind|suggest|suggestion|tip|reminder|notice
\u9632\u6B62	f\xE1ng zh\u01D0	3	v	prevent|guard against|take precautions
\u62F3	qu\xE1n	7	n	fist|boxing
\u5E74\u7EAA	ni\xE1n j\xEC	3	n	age
\u667A\u6167	zh\xEC hu\xEC	6	n	wisdom|knowledge|intelligent|intelligence
\u8BBE\u7F6E	sh\xE8 zh\xEC	4	v	set up|install
\u542B	h\xE1n	4	v	keep in the mouth|contain
\u7ED3\u5C40	ji\xE9 j\xFA	7	n	conclusion|ending
\u5178\u578B	di\u01CEn x\xEDng	4	n	model|typical case|archetype|typical|representative
\u521B	chu\xE0ng	7	g	begin|initiate|inaugurate|start|create|wound|cut|injury
\u7ADF	j\xECng	7	d	unexpectedly|actually|indeed
\u91C7\u7528	c\u01CEi y\xF2ng	3	v	adopt|employ|use
\u4E4B\u6240\u4EE5	zh\u012B su\u01D2 y\u01D0	7	c	reason why n p
\u592B\u5987	f\u016B f\xF9	4	n	couple|husband and wife
\u81F4	zh\xEC	7	v	send|devote|deliver|cause|convey|fine|delicate|exquisite
\u9192\u6765	x\u01D0ng l\xE1i	7	v	waken
\u70E4	k\u01CEo	7	v	roast|bake|broil
\u6454	shu\u0101i	5	v	throw down|fall|drop and break
\u6559\u8BAD	ji\xE0o xun	4	n	provide guidance|lecture sb|upbraid|talking-to|bitter lesson
\u624B\u6307	sh\u01D2u zh\u01D0	3	n	finger
\u6536\u62FE	sh\u014Du shi	5	v	put in order|tidy up|pack|repair|sort sb out|fix sb
\u6C9F\u901A	g\u014Du t\u014Dng	5	v	join|connect|link up|communicate
\u7ED3\u8BBA	ji\xE9 l\xF9n	4	n	conclusion|verdict|conclude|reach a verdict
\u6C34\u679C	shu\u01D0 gu\u01D2	1	n	fruit
\u9664\u975E	ch\xFA f\u0113i	5	c	only if|only when|unless
\u63D0\u5347	t\xED sh\u0113ng	6	v	promote|lift|hoist|elevate|raise|improve
\u6218\u7565	zh\xE0n lu:\xE8	6	n	strategy
\u6E05\u9192	q\u012Bng x\u01D0ng	4	a	clear-headed|sober|awake
\u7AE0	zh\u0101ng	6	q	chapter|section|clause|movement|seal|badge|regulation|order
\u5316\u5B66	hu\xE0 xu\xE9	5	n	chemistry|chemical
\u603B\u4E4B	z\u01D2ng zh\u012B	4	c	in a word|in short|in brief
\u4E58\u5BA2	ch\xE9ng k\xE8	5	n	passenger
\u8BFB\u4E66	d\xFA sh\u016B	1	v	read a book|study|attend school
\u8270\u96BE	ji\u0101n n\xE1n	5	a	difficult|hard|challenging
\u5730\u9762	d\xEC mi\xE0n	4	n	floor|ground|surface
\u51AC\u5929	d\u014Dng ti\u0101n	2	t	winter
\u5929\u7A7A	ti\u0101n k\u014Dng	3	n	sky
\u7EAF	ch\xFAn	4	a	pure|simple|unmixed|genuine
\u5929\u4F7F	ti\u0101n sh\u01D0	7	n	angel
\u8001\u5927	l\u01CEo d\xE0	7	n	old age|very|leader of a group|boss|captain of a boat
\u4E13\u8F91	zhu\u0101n j\xED	5	n	album|record
\u6000\u5B55	hu\xE1i y\xF9n	7	v	pregnant|have conceived|gestation|pregnancy
\u7528\u6765	y\xF2ng l\xE1i	5	v	be used for
\u4E00\u9635	y\u012B zh\xE8n	7	mq	burst|fit|peal|spell
\u5B9A\u4F4D	d\xECng w\xE8i	6	v	orientate|position|categorize|characterize|positioning|niche
\u6491	ch\u0113ng	6	v	support|prop up|maintain|open or unfurl|fill to bursting point|brace|stay
\u7A33	w\u011Bn	4	a	settled|steady|stable
\u7EDF\u4E00	t\u01D2ng y\u012B	4	v	unify|integrate|unified|integrated
\u5236\u5EA6	zh\xEC d\xF9	3	n	system|institution
\u864E	h\u01D4	5	n	tiger
\u7ED5	r\xE0o	5	v	wind|coil|rotate around|spiral|move around|go round|by-pass|make a detour
\u5373\u4FBF	j\xED bi\xE0n	7	c	even if|even though|right away|immediately
\u7389\u7C73	y\xF9 m\u01D0	4	n	corn|maize
\u5DE5\u4E1A	g\u014Dng y\xE8	3	n	industry
\u8EAB\u6750	sh\u0113n c\xE1i	4	n	stature|build|figure
\u5E55	m\xF9	7	q	curtain or screen|canopy or tent|headquarters of a general|act|curtain|screen
\u5E7F\u64AD	gu\u01CEng b\u014D	3	vn	broadcast|broadcasting|propagate|publicize
\u906D\u5230	z\u0101o d\xE0o	6	v	suffer|meet with
\u55B7	p\u0113n	5	v	puff|spout|spray|spurt|strong|peak season
\u8BBE\u65BD	sh\xE8 sh\u012B	4	n	facilities|installation
\u8170	y\u0101o	4	n	waist|lower back|pocket|middle|loins
\u804C\u8D23	zh\xED z\xE9	6	n	duty|responsibility|obligation
\u8FDC\u8FDC	yu\u01CEn yu\u01CEn	6	d	distant|by far
\u62B1\u6028	b\xE0o yu\xE0n	5	v	complain|grumble|harbor a complaint|feel dissatisfied
\u5931\u8E2A	sh\u012B z\u014Dng	7	v	be missing|disappear|unaccounted for
\u6267\u6CD5	zh\xED f\u01CE	7	vn	enforce a law|law enforcement
\u4E91	y\xFAn	2	n	say|cloud
\u9752\u5E74	q\u012Bng ni\xE1n	2	n	youth|youthful years|young person|young
\u4ECE\u4E8B	c\xF3ng sh\xEC	3	v	go for|engage in|undertake|deal with|handle|do
\u76D1\u63A7	ji\u0101n k\xF2ng	7	vn	monitor
\u62A2\u52AB	qi\u01CEng ji\xE9	7	v	rob|looting
\u536B\u661F	w\xE8i x\u012Bng	5	n	satellite|moon
\u65E0\u5173	w\xFA gu\u0101n	6	v	unrelated|having nothing to do
\u4E49\u52A1	y\xEC w\xF9	4	n	duty|obligation|volunteer
\u5947\u8FF9	q\xED j\xEC	7	n	miracle|miraculous|wonder|marvel
\u8FD0\u7528	y\xF9n y\xF2ng	4	v	use|put to use
\u9010\u6E10	zh\xFA ji\xE0n	4	d	gradually
\u6539\u9020	g\u01CEi z\xE0o	3	v	transform|reform|remodel|remold
\u597D\u4EBA	h\u01CEo r\xE9n	2	n	good person|healthy person
\u80BA	f\xE8i	6	n	lung
\u86EE	m\xE1n	7	d	barbarian|bullying|very|quite|rough|reckless
\u94A5\u5319	y\xE0o shi	7	n	key
\u52A8\u624B	d\xF2ng sh\u01D2u	5	v	set about|hit|punch|touch
\u5927\u58F0	d\xE0 sh\u0113ng	2	d	loud voice|in a loud voice|loudly
\u9760\u8FD1	k\xE0o j\xECn	5	v	be close to|approach|draw near
\u90BB\u5C45	l\xEDn j\u016B	5	n	neighbor|next door
\u9178	su\u0101n	4	a	sour|tart|sick at heart|grieved|sore|aching|pedantic|impractical
\u6C11\u4E3B	m\xEDn zh\u01D4	6	a	democracy
\u5236\u5B9A	zh\xEC d\xECng	3	v	draw up|formulate
\u5206\u5F00	f\u0113n k\u0101i	2	v	separate|part
\u6821\u957F	xi\xE0o zh\u01CEng	2	n	president|headmaster
\u5E02\u957F	sh\xEC zh\u01CEng	2	n	mayor
\u6C89\u9ED8	ch\xE9n m\xF2	4	an	taciturn|uncommunicative|silent
\u680B	d\xF2ng	7	q	ridgepole
\u76F4\u64AD	zh\xED b\u014D	3	v	broadcast live|live broadcast|livestream|direct seeding
\u72EC\u7279	d\xFA t\xE8	4	a	unique|distinctive
\u6C61\u67D3	w\u016B r\u01CEn	5	vn	pollute|contaminate
\u76D1\u7763	ji\u0101n d\u016B	6	vn	control|supervise|inspect
\u5E94\u5F53	y\u012Bng d\u0101ng	3	v	should|ought to
\u5395\u6240	c\xE8 su\u01D2	6	n	toilet|lavatory
\u7F5A	f\xE1	5	v	punish|penalize
\u4EA4\u5F80	ji\u0101o w\u01CEng	3	vn	associate|have contact|hang out|date|relationship|association|contact
\u906D\u9047	z\u0101o y\xF9	6	n	meet with|encounter|experience
\u5404\u81EA	g\xE8 z\xEC	3	r	each|respective|apiece
\u731B	m\u011Bng	6	a	ferocious|fierce|violent|brave|suddenly|abrupt|awesome
\u81EA\u884C\u8F66	z\xEC x\xEDng ch\u0113	2	n	bicycle|bike
\u76F8\u673A	xi\xE0ng j\u012B	2	n	at the opportune moment|as the circumstances allow
\u65F6\u673A	sh\xED j\u012B	5	n	opportunity|opportune moment
\u6CBB\u5B89	zh\xEC \u0101n	5	n	law and order|public security
\u7CDF\u7CD5	z\u0101o g\u0101o	5	a	too bad|how terrible|what bad luck|terrible|bad
\u82B1\u56ED	hu\u0101 yu\xE1n	2	n	garden
\u5F15\u53D1	y\u01D0n f\u0101	7	v	lead to|trigger|initiate|cause|evoke
\u4E0D\u8BBA	b\xF9 l\xF9n	3	c	whatever|no matter what|regardless of|not to discuss
\u9047\u89C1	y\xF9 ji\xE0n	4	v	meet
\u7A7A\u4E2D	k\u014Dng zh\u014Dng	5	s	in the sky|in the air
\u6050\u60E7	k\u01D2ng j\xF9	7	an	be frightened|fear|dread
\u9669	xi\u01CEn	6	a	danger|dangerous|rugged
\u90A3\u513F	n\xE0 r	1	r	there
\u6298	zh\xE9	4	v	break|fracture|snap|suffer loss|bend|twist|turn|change direction
\u6E34\u671B	k\u011B w\xE0ng	5	v	thirst for|long for
\u780D	k\u01CEn	7	v	chop|cut down|throw sth at sb
\u6446\u8131	b\u01CEi tu\u014D	4	v	break away from|cast off|get rid of|break away|break out|free oneself from|extricate oneself
\u8FDE\u63A5	li\xE1n ji\u0113	5	v	link|join|connect
\u592B\u59BB	f\u016B q\u012B	4	n	husband and wife|married couple
\u836F\u54C1	y\xE0o p\u01D0n	6	n	medicaments|medicine|drug
\u5F71\u7247	y\u01D0ng pi\xE0n	2	n	copy of a film|film|motion picture|movie
\u5B8C\u6BD5	w\xE1n b\xEC	7	v	finish|end|complete
\u62C6	ch\u0101i	5	v	tear open|tear down|tear apart|open
\u626F	ch\u011B	7	v	pull|tear|buy|chat|gossip|ridiculous|hokey
\u6E29\u5EA6	w\u0113n d\xF9	2	n	temperature
\u8D22\u5BCC	c\xE1i f\xF9	4	n	wealth|riches
\u8E0F	t\xE0	6	v	tread|stamp|step on|press a pedal|investigate on the spot
\u9000\u4F11	tu\xEC xi\u016B	3	v	retire|go into retirement
\u5F53\u4F5C	d\xE0ng zu\xF2	6	v	treat as|regard as
\u6B64\u65F6	c\u01D0 sh\xED	5	r	now|this moment
\u76D1\u72F1	ji\u0101n y\xF9	7	n	prison
\u6210\u679C	ch\xE9ng gu\u01D2	3	n	result|achievement|gain|profit
\u86C7	sh\xE9	5	n	snake|serpent
\u8FD0\u4F5C	y\xF9n zu\xF2	6	v	operate|operations|workings|activities|thread
\u773C\u6CEA	y\u01CEn l\xE8i	4	n	tears|crying
\u8033\u6735	\u011Br duo	5	n	ear|handle
\u5224	p\xE0n	6	v	judge|sentence|discriminate|discern|clearly distinguishable
\u6A21\u578B	m\xF3 x\xEDng	4	n	model|mold|matrix|pattern
\u70B8\u5F39	zh\xE0 d\xE0n	6	n	bomb
\u753B\u9762	hu\xE0 mi\xE0n	5	n	scene|tableau|picture|image|screen|frame|field of view
\u7206\u53D1	b\xE0o f\u0101	6	v	break out|erupt|explode|burst out
\u7CBE\u529B	j\u012Bng l\xEC	4	n	energy
\u5B64\u5355	g\u016B d\u0101n	7	a	lone|lonely|loneliness
\u5B97\u6559	z\u014Dng ji\xE0o	6	n	religion
\u593A	du\xF3	6	v	seize|take away forcibly|wrest control of|compete or strive for|force one's way through|leave out|lose
\u623F\u5730\u4EA7	f\xE1ng d\xEC ch\u01CEn	7	n	real estate
\u9694	g\xE9	4	v	separate|partition|stand or lie between|at a distance from
\u996E\u6599	y\u01D0n li\xE0o	5	n	drink|beverage
\u7B49\u4E8E	d\u011Bng y\xFA	2	v	equal|be tantamount to
\u6982\u5FF5	g\xE0i ni\xE0n	3	n	concept|idea
\u80FD\u6E90	n\xE9ng yu\xE1n	7	n	energy|power source
\u5468\u5E74	zh\u014Du ni\xE1n	2	q	anniversary|annual
\u5BBD	ku\u0101n	4	a	wide|broad|loose|relaxed|lenient
\u626E\u6F14	b\xE0n y\u01CEn	5	v	play the role of|act
\u7EDF\u8BA1	t\u01D2ng j\xEC	4	v	statistics|count|add up
\u521B\u4F5C	chu\xE0ng zu\xF2	3	v	create|produce|write|creative work|creation
\u672C\u5730	b\u011Bn d\xEC	6	r	local|this locality
\u8282\u65E5	ji\xE9 r\xEC	2	n	holiday|festival
\u5927\u8111	d\xE0 n\u01CEo	5	n	brain|cerebrum
\u5546\u5E97	sh\u0101ng di\xE0n	1	n	store|shop
\u6838\u5FC3	h\xE9 x\u012Bn	6	n	core|nucleus
\u9F3B\u5B50	b\xED zi	5	n	nose
\u6301	ch\xED	7	v	hold|grasp|support|maintain|persevere|manage|run|control
\u4F8B\u5982	l\xEC r\xFA	2	v	for example|for instance|such as
\u636E\u8BF4	j\xF9 shu\u014D	3	v	it is said that|reportedly
\u624E	z\u0101	6	v	tie|bind|taiwan pr|prick|run or stick into|be stationed
\u81EA\u8EAB	z\xEC sh\u0113n	3	r	itself|oneself|one's own
\u4FDD\u969C	b\u01CEo zh\xE0ng	7	vn	ensure|guarantee|safeguard
\u543C	h\u01D2u	7	v	roar|howl|shriek|bellow of rage
\u6574\u5929	zh\u011Bng ti\u0101n	3	d	all day long|whole day
\u8D44\u4EA7	z\u012B ch\u01CEn	5	n	property|assets
\u7279\u5F81	t\xE8 zh\u0113ng	4	n	characteristic|diagnostic property|distinctive feature|trait
\u6C41	zh\u012B	7	g	juice
\u7686	ji\u0113	7	d	all|each and every|in all cases
\u795D\u8D3A	zh\xF9 h\xE8	5	v	congratulate|congratulations
\u9E21\u86CB	j\u012B d\xE0n	1	n	egg|hen's egg
\u53BB\u4E16	q\xF9 sh\xEC	3	v	pass away|die
\u5927\u4E8B	d\xE0 sh\xEC	5	n	major event|major political event|major social event|in a big way
\u6279\u8BC4	p\u012B p\xEDng	3	v	criticize|criticism
\u8FD0\u884C	y\xF9n x\xEDng	5	v	move along one's course|function|be in operation|operate|run
\u91CD\u89C6	zh\xF2ng sh\xEC	2	v	attach importance to sth|value
\u5C40\u9762	j\xFA mi\xE0n	5	n	aspect|phase|situation
\u53D4\u53D4	sh\u016B shu	4	n	father's younger brother|uncle|taiwan pr
\u5584	sh\xE0n	7	g	good|benevolent|well-disposed|good at sth|improve or perfect
\u671F\u671B	q\u012B w\xE0ng	5	v	have expectations|earnestly hope|expectation|hope
\u6D17\u6FA1	x\u01D0 z\u01CEo	2	v	bathe|take a shower
\u53BF	xi\xE0n	4	n	county
\u5E73\u5747	p\xEDng j\u016Bn	4	a	average|on average|evenly|in equal proportions
\u4F9B\u5E94	g\u014Dng y\xECng	4	vn	supply|provide|offer
\u8BE2\u95EE	x\xFAn w\xE8n	5	v	inquire
\u5F53\u4E8B\u4EBA	d\u0101ng sh\xEC r\xE9n	7	n	persons involved or implicated|party
\u4ECA\u540E	j\u012Bn h\xF2u	2	t	hereafter|henceforth|in the future|from now on
\u589E\u957F	z\u0113ng zh\u01CEng	3	v	grow|increase
\u4E8B\u7269	sh\xEC w\xF9	4	n	thing|object
\u5F00\u53E3	k\u0101i k\u01D2u	7	v	open one's mouth|start to talk
\u76F8\u53CD	xi\u0101ng f\u01CEn	4	v	opposite|contrary
\u6F14\u8BB2	y\u01CEn ji\u01CEng	4	vn	lecture|make a speech
\u4E00\u65F6	y\u012B sh\xED	6	t	period of time|while|for a short while|temporary|momentary|at the same time
\u8FD9\u65F6	zh\xE8 sh\xED	2	r	at this time|at this moment
\u6E29\u67D4	w\u0113n r\xF3u	7	a	gentle and soft|tender|sweet
\u6076	\xE8	7	a	evil|fierce|vicious|ugly|coarse|harm|hate|loathe
\u4F34	b\xE0n	7	v	partner|companion|comrade|associate|accompany
\u5C4F\u5E55	p\xEDng m\xF9	6	n	screen
\u8865\u507F	b\u01D4 ch\xE1ng	5	vn	compensate|make up
\u90E8\u957F	b\xF9 zh\u01CEng	3	n	head of a department|section chief|section head|secretary|minister
\u629B	p\u0101o	7	v	throw|toss|fling|cast|abandon
\u8F6F\u4EF6	ru\u01CEn ji\xE0n	5	n	software
\u6CA1\u5173\u7CFB	m\xE9i gu\u0101n xi	1	v	it doesn't matter
\u663E	xi\u01CEn	5	v	make visible|reveal|prominent|conspicuous|phanero-
\u6CE8\u5B9A	zh\xF9 d\xECng	7	v	foreordain|be bound to|be destined to|be doomed to|inevitably
\u5730\u56FE	d\xEC t\xFA	1	n	map
\u8BC9\u8BBC	s\xF9 s\xF2ng	7	vn	lawsuit
\u770B\u51FA	k\xE0n ch\u016B	5	v	make out|see
\u5927\u5927	d\xE0 d\xE0	2	d	greatly|enormously|dad|uncle
\u79D1\u5B66\u5BB6	k\u0113 xu\xE9 ji\u0101	2	n	scientist
\u4E25\u8083	y\xE1n s\xF9	5	a	solemn|grave|serious|earnest|severe
\u5E3D\u5B50	m\xE0o zi	4	n	hat|cap|label|bad name
\u8116\u5B50	b\xF3 zi	7	n	neck
\u8D1F\u62C5	f\xF9 d\u0101n	4	n	bear (an expense|responsibility etc)|burden
\u5426\u8BA4	f\u01D2u r\xE8n	3	v	declare to be untrue|deny
\u591C\u665A	y\xE8 w\u01CEn	7	t	night
\u808C\u8089	j\u012B r\xF2u	5	n	muscle|flesh
\u968F\u540E	su\xED h\xF2u	5	d	soon after
\u5B89\u6170	\u0101n w\xE8i	5	v	comfort|console
\u60E8	c\u01CEn	6	a	miserable|wretched|cruel|inhuman|disastrous|tragic|dim|gloomy
\u6BD2\u54C1	d\xFA p\u01D0n	6	n	drugs|narcotics|poison
\u6218\u80DC	zh\xE0n sh\xE8ng	4	v	prevail over|defeat|surmount
\u5E74\u5EA6	ni\xE1n d\xF9	5	n	year|annual
\u62AC	t\xE1i	5	v	lift|raise|carry
\u8054\u90A6	li\xE1n b\u0101ng	7	n	federal|federation|commonwealth|federal union|federal state|union
\u59D0	ji\u011B	1	n	older sister
\u59D3	x\xECng	2	v	family name|surname|be surnamed
\u8FC7\u5206	gu\xF2 f\xE8n	4	a	excessive|undue|overly
\u5BC2\u5BDE	j\xEC m\xF2	7	a	lonely|lonesome|quiet|silent
\u68C0\u9A8C	ji\u01CEn y\xE0n	5	v	inspect|examine|test
\u8463\u4E8B\u4F1A	d\u01D2ng sh\xEC hu\xEC	7	n	board of directors
\u6392\u9664	p\xE1i ch\xFA	5	v	eliminate|remove|exclude|rule out
\u4E3B\u610F	zh\u01D4 yi	3	n	plan|idea|decision|beijing pr
\u5347\u7EA7	sh\u0113ng j\xED	6	v	be promoted|escalate|upgrade
\u56FD\u738B	gu\xF3 w\xE1ng	6	n	king
\u5802	t\xE1ng	7	q	hall|of the same clan
\u52A0\u901F	ji\u0101 s\xF9	5	v	speed up|expedite
\u53D1\u884C	f\u0101 x\xEDng	5	v	publish|issue|release|distribute
\u5BC6	m\xEC	4	a	secret|confidential|close|thick|dense
\u4EBA\u4F53	r\xE9n t\u01D0	7	n	human body
\u53CD\u800C	f\u01CEn \xE9r	4	d	on the contrary|instead
\u6876	t\u01D2ng	7	n	bucket|can|barrel
\u7BEE\u7403	l\xE1n qi\xFA	2	n	basketball
\u6E2F	g\u01CEng	7	n	harbor|port
\u5750\u4E0B	zu\xF2 xia	1	v	sit down
\u8857\u9053	ji\u0113 d\xE0o	4	n	street|subdistrict|residential district
\u4F53\u4F1A	t\u01D0 hu\xEC	3	v	know from experience|learn through experience|realize|understanding|experience
\u5BFB	x\xFAn	7	v	search|look for|seek
\u64AD	b\u014D	6	v	sow|scatter|spread|broadcast|taiwan pr
\u665A\u9910	w\u01CEn c\u0101n	2	n	evening meal|dinner
\u4F5C\u6218	zu\xF2 zh\xE0n	6	v	combat|fight
\u793E	sh\xE8	5	n	society|organization|agency|god of the land
\u8C6A\u534E	h\xE1o hu\xE1	7	a	luxurious
\u57F9\u8BAD	p\xE9i x\xF9n	4	vn	cultivate|train|groom|training
\u5927\u95E8	d\xE0 m\xE9n	2	n	entrance|door|gate|large and influential family|doors, us rock band
\u665A\u4F1A	w\u01CEn hu\xEC	2	n	evening party
\u611F\u5192	g\u01CEn m\xE0o	3	v	catch cold|cold|be interested in|detest|can't stand
\u96F6	l\xEDng	1	m	zero|nought|zero sign|fractional|fragmentary|odd|fraction|remainder
\u7A0E	shu\xEC	6	n	taxes|duties
\u5F53\u5929	d\u0101ng ti\u0101n	6	t	on that day|same day
\u4E95	j\u01D0ng	6	n	well|neat|orderly
\u8D5A\u94B1	zhu\xE0n qi\xE1n	6	v	earn money|moneymaking
\u738B\u5B50	w\xE1ng z\u01D0	6	n	prince|son of a king
\u72EC\u81EA	d\xFA z\xEC	4	d	alone
\u6269\u5927	ku\xF2 d\xE0	4	v	expand|enlarge|broaden one's scope
\u72EC	d\xFA	7	d	alone|independent|single|sole|only
\u9AD8\u901F	g\u0101o s\xF9	3	b	high speed
\u5224\u51B3	p\xE0n ju\xE9	7	vn	judgment|pass judgment on|sentence
\u684C\u5B50	zhu\u014D zi	1	n	table|desk
\u7C98	zh\u0101n	7	v	glue|paste|adhere|stick to
\u5927\u5C0F	d\xE0 xi\u01CEo	2	n	dimension|magnitude|size|measurement|large and small|at any rate|adults and children|consideration of seniority
\u94BB	zu\u0101n	6	v	drill|bore|get into|make one's way into|enter|thread one's way through|study intensively|dig into
\u88AB\u544A	b\xE8i g\xE0o	6	n	defendant
\u89C2\u770B	gu\u0101n k\xE0n	3	v	watch|view
\u767D\u5929	b\xE1i ti\u0101n	1	t	daytime|during the day|day
\u5927\u54E5	d\xE0 g\u0113	4	n	eldest brother|big brother|gang leader|boss
\u4E0D\u4E00\u5B9A	b\xF9 y\u012B d\xECng	2		not necessarily|maybe
\u6B64\u5916	c\u01D0 w\xE0i	4	c	besides|in addition|moreover|furthermore
\u5956\u91D1	ji\u01CEng j\u012Bn	4	n	premium|award money|bonus
\u63A8\u8FDB	tu\u012B j\xECn	3	v	impel|carry forward|push on|advance|drive forward
\u5B89\u88C5	\u0101n zhu\u0101ng	3	v	install|erect|fix|mount|installation
\u641C	s\u014Du	5	v	search
\u76D0	y\xE1n	4	n	salt
\u5927\u8857	d\xE0 ji\u0113	6	n	street|main street
\u6B22\u4E50	hu\u0101n l\xE8	3	a	gaiety|gladness|glee|merriment|pleasure|happy|joyous|gay
\u5927\u4F17	d\xE0 zh\xF2ng	4	n	masses|popular|volkswagen
\u8FDF\u5230	ch\xED d\xE0o	4	v	arrive late
\u6000\u5FF5	hu\xE1i ni\xE0n	4	v	cherish the memory of|think of|reminisce
\u8363\u8A89	r\xF3ng y\xF9	7	n	honor|credit|glory|reputation|honorary
\u6536\u85CF	sh\u014Du c\xE1ng	6	v	collect|put away for safekeeping|bookmark|collection
\u89E3\u653E	ji\u011B f\xE0ng	5	v	liberate|emancipate|liberation
\u4F5B	F\xF3	6	n	buddha|seemingly|head ornament
\u5047\u5982	ji\u01CE r\xFA	4	c	if
\u5E7B\u60F3	hu\xE0n xi\u01CEng	6	n	delusion|fantasy
\u7529	shu\u01CEi	7	v	throw|fling|swing|leave behind|throw off|dump
\u76F8\u5BF9	xi\u0101ng du\xEC	7	d	relatively|opposite|resist|oppose|relative|vis-a-vis|counterpart
\u6539\u5584	g\u01CEi sh\xE0n	4	v	make better|improve
\u529F\u592B	g\u014Dng fu	3	n	skill|art|kung fu|labor|effort
\u56E2\u4F53	tu\xE1n t\u01D0	3	n	group|organization|team
\u5C11\u5E74	sh\xE0o ni\xE1n	2	n	early youth|youngster|youth|young man
\u62E5\u62B1	y\u014Dng b\xE0o	5	v	embrace|hug
\u6652	sh\xE0i	4	v	shine on|bask in|dry in the sun
\u60B2\u5267	b\u0113i j\xF9	5	n	tragedy
\u4E00\u756A	y\xEC f\u0101n	6	mq	some
\u8BA1\u7B97\u673A	j\xEC su\xE0n j\u012B	2	n	computer|calculator
\u57FA\u4E8E	j\u012B y\xFA	7	p	because of|on the basis of|in view of|on account of
\u6D88\u9632	xi\u0101o f\xE1ng	5	b	firefighting|fire control
\u592A\u7A7A	t\xE0i k\u014Dng	5	s	outer space
\u611F\u6FC0	g\u01CEn j\u012B	7	v	be grateful|appreciate|thankful
\u623F\u5C4B	f\xE1ng w\u016B	3	n	house|building
\u5939	ji\u0101	5	v	press from either side|place in between|sandwich|carry sth under armpit|wedged between|between|intersperse|mix
\u5F97\u5206	d\xE9 f\u0113n	3	v	score
\u51CF	ji\u01CEn	4	v	lower|decrease|reduce|subtract|diminish
\u6E38\u6CF3	y\xF3u y\u01D2ng	3	v	swimming|swim
\u6D82	t\xFA	7	v	apply|smear|daub|blot out|scribble|scrawl|mud|street
\u6307\u793A	zh\u01D0 sh\xEC	5	n	point out|indicate|instruct|directives|instructions
\u96BE\u53D7	n\xE1n sh\xF2u	2	a	feel unwell|suffer pain|be difficult to bear
\u66B4\u9732	b\xE0o l\xF9	6	v	expose|reveal|lay bare|also pr
\u51FA\u4E8E	ch\u016B y\xFA	5	v	due to|stem from
\u5B98\u65B9	gu\u0101n f\u0101ng	4	n	government|official
\u4E56	gu\u0101i	7	a	obedient, well-behaved|clever|shrewd|alert|perverse|contrary to reason|irregular|abnormal
\u57FA\u672C\u4E0A	j\u012B b\u011Bn shang	3	d	basically|on the whole
\u902E\u6355	d\xE0i b\u01D4	7	v	arrest|apprehend
\u4F24\u53E3	sh\u0101ng k\u01D2u	6	n	wound|cut
\u519C\u6C11	n\xF3ng m\xEDn	3	n	peasant|farmer
\u673A\u68B0	j\u012B xi\xE8	6	n	machine|machinery|mechanical|cunning|scheming
\u77AC\u95F4	sh\xF9n ji\u0101n	7	t	in an instant|in a flash
\u7535\u529B	di\xE0n l\xEC	6	n	electrical power|electricity
\u8BBE\u8BA1\u5E08	sh\xE8 j\xEC sh\u012B	6	n	designer|architect
\u53CC\u624B	shu\u0101ng sh\u01D2u	5	n	both hands
\u5F97\u4E86	d\xE9 le	5	v	all right|that's enough|possible
\u4E70\u5356	m\u01CEi m\xE0i	5	vn	buying and selling|business|business transactions
\u74E6	w\u01CE	7	n	roof tile
\u4F9D	y\u012B	7	v	depend on|according to|in the light of
\u5F15\u5BFC	y\u01D0n d\u01CEo	4	v	guide|lead|conduct|boot|introduction|primer
\u6740\u624B	sh\u0101 sh\u01D2u	7	n	killer|murderer|hit man|formidable player
\u534F\u52A9	xi\xE9 zh\xF9	6	v	provide assistance|aid
\u6C11\u65CF	m\xEDn z\xFA	3	n	nationality|ethnic group
\u822A\u73ED	h\xE1ng b\u0101n	4	n	flight|sailing
\u5076\u5C14	\u01D2u \u011Br	5	d	occasionally|once in a while|sometimes
\u7EA6\u4F1A	yu\u0113 hu\xEC	4	v	appointment|engagement|date|arrange to meet
\u8F7F\u8F66	ji\xE0o ch\u0113	7	n	motor carriage|car or bus|limousine
\u5546\u54C1	sh\u0101ng p\u01D0n	3	n	commodity|goods|merchandise
\u672B	m\xF2	4	f	tip|end|final stage|latter part|inessential detail|powder|dust
\u5C5E	sh\u01D4	3	v	category|genus|family members|dependents|belong to|subordinate to|affiliated with|be
\u60B2\u4F24	b\u0113i sh\u0101ng	5	a	sad|sorrowful
\u9632\u5B88	f\xE1ng sh\u01D2u	6	v	defend|protect
\u54EA\u4E9B	n\u01CE xi\u0113	1	r	which ones|who|what
\u5BA1\u5224	sh\u011Bn p\xE0n	7	vn	trial|try sb
\u5F62\u52BF	x\xEDng sh\xEC	4	n	circumstances|situation|terrain
\u7EC6	x\xEC	4	a	thin or slender|finely particulate|thin and soft|fine|delicate|trifling|quiet|frugal
\u529D	qu\xE0n	5	v	advise|urge|try to persuade|exhort|console|soothe
\u8D22\u52A1	c\xE1i w\xF9	7	n	financial affairs
\u635F\u4F24	s\u01D4n sh\u0101ng	7	vn	harm|damage|injure|impairment|loss|disability
\u4E3B\u89D2	zh\u01D4 ju\xE9	6	n	leading role|lead|protagonist
\u987E\u95EE	g\xF9 w\xE8n	5	n	adviser|consultant
\u6807	bi\u0101o	7	v	mark|sign|label|bear|prize|award|bid|target
\u5A36	q\u01D4	7	v	take a wife|marry
\u52A9\u7406	zh\xF9 l\u01D0	5	n	assistant
\u523B	k\xE8	2	v	quarter|moment|carve|engrave|cut|oppressive
\u53D7\u4E0D\u4E86	sh\xF2u b\xF9 li\u01CEo	4	l	unbearable|unable to endure|can't stand
\u51FA\u552E	ch\u016B sh\xF2u	4	v	sell|offer for sale|put on the market
\u539A	h\xF2u	4	a	thick|deep or profound|kind|generous|favor|stress
\u6F5C\u529B	qi\xE1n l\xEC	6	n	potential|capacity
\u953B\u70BC	du\xE0n li\xE0n	4	v	toughen|temper|engage in physical exercise|work out|develop one's skills|train oneself
\u88E4\u5B50	k\xF9 zi	3	n	trousers|pants
\u603B\u90E8	z\u01D2ng b\xF9	6	n	general headquarters
\u5206\u79BB	f\u0113n l\xED	5	v	separate
\u8FD0\u8F93	y\xF9n sh\u016B	3	vn	transport|carry|transportation
\u53D1\u578B	f\xE0 x\xEDng	7	n	hairstyle|coiffure|hairdo
\u6247	sh\u0101n	5	q	fan
\u7B11\u5BB9	xi\xE0o r\xF3ng	6	n	smile|smiling expression
\u5229\u6DA6	l\xEC r\xF9n	5	n	profits
\u5835	d\u01D4	4	v	block up|stop up|wall
\u6298\u78E8	zh\xE9 m\xF3	7	v	torment|torture
\u62A4\u58EB	h\xF9 shi	4	n	nurse
\u62CD\u7167	p\u0101i zh\xE0o	4	v	take a picture
\u6148\u5584	c\xED sh\xE0n	7	a	benevolent|charitable
\u73CD\u60DC	zh\u0113n x\u012B	5	v	treasure|value|cherish
\u5730\u677F	d\xEC b\u01CEn	6	n	floor
\u6D88\u9664	xi\u0101o ch\xFA	5	v	eliminate|remove
\u4F20\u64AD	chu\xE1n b\u014D	3	v	disseminate|propagate|spread
\u53C2\u89C2	c\u0101n gu\u0101n	2	v	look around|tour|visit
\u5339	p\u01D0	5	q	taiwan pr|ordinary person|horsepower|mate|one of a pair
\u665A\u996D	w\u01CEn f\xE0n	1	n	evening meal|dinner|supper
\u968F\u610F	su\xED y\xEC	5	ad	as one wishes|according to one's wishes|at will|voluntary|conscious
\u987A\u4FBF	sh\xF9n bi\xE0n	7	d	conveniently|in passing|without much extra effort
\u597D\u5947	h\xE0o q\xED	3	a	inquisitive|curious|inquisitiveness|curiosity
\u53CB\u8C0A	y\u01D2u y\xEC	5	n	companionship|fellowship|friendship
\u62D4	b\xE1	5	v	pull up|pull out|draw out by suction|select|pick|stand out|surpass|seize
\u96C6\u4F53	j\xED t\u01D0	3	n	collective|joint|group|team|en masse|as a group
\u7B28	b\xE8n	4	a	stupid|foolish|silly|slow-witted|clumsy
\u7F62\u4E86	b\xE0 le	6	y	modal particle indicating
\u8D3C	z\xE9i	7	n	thief|traitor|wily|deceitful|evil|extremely
\u5566\u5566\u961F	l\u0101 l\u0101 du\xEC	7	n	cheerleading squad
\u5BFB\u6C42	x\xFAn qi\xFA	5	v	seek|look for
\u9884\u8BA1	y\xF9 j\xEC	3	v	forecast|predict|estimate
\u6536\u83B7	sh\u014Du hu\xF2	4	n	harvest|reap|gain|crop|profit|bonus|reward
\u88C5\u9970	zhu\u0101ng sh\xEC	5	n	decorate|decoration|decorative|ornamental
\u901A\u8BAF	t\u014Dng x\xF9n	6	n	communications|news story|dispatch
\u9505	gu\u014D	5	n	pot|pan|wok|cauldron|pot-shaped thing
\u5C1A	sh\xE0ng	7	d	still|yet|value|esteem
\u5C0F\u5B66	xi\u01CEo xu\xE9	1	n	elementary school|primary school
\u9690\u85CF	y\u01D0n c\xE1ng	6	v	hide|conceal|mask|shelter|harbor|hide oneself|lie low|nestle
\u592A\u592A	t\xE0i tai	2	n	married woman|mrs|madam|wife
\u843D\u540E	lu\xF2 h\xF2u	3	a	fall behind|lag|backward|retrogress
\u6388\u6743	sh\xF2u qu\xE1n	7	v	authorize
\u590F	xi\xE0	3	tg	summer
\u7B97\u4E86	su\xE0n le	6		let it be|let it pass|forget about it
\u6C99\u53D1	sh\u0101 f\u0101	3	n	sofa
\u72E0	h\u011Bn	6	a	ruthless|fierce|ferocious|determined|harden
\u7B56\u5212	c\xE8 hu\xE0	6	v	plot|scheme|bring about|engineer|planning|producer|planner
\u56FE\u4E66\u9986	t\xFA sh\u016B gu\u01CEn	1	n	library
\u8E72	d\u016Bn	6	v	crouch|squat|stay
\u8F7B\u6613	q\u012Bng y\xEC	4	d	easily|lightly|rashly
\u5927\u5385	d\xE0 t\u012Bng	5	n	hall|lounge
\u5F3A\u8C03	qi\xE1ng di\xE0o	3	v	emphasize|stress
\u9884\u7B97	y\xF9 su\xE0n	7	n	budget
\u4E11	ch\u01D2u	5	a	shameful|ugly|disgraceful|clown
\u5192\u9669	m\xE0o xi\u01CEn	7	v	take risks|take chances|foray|adventure
\u884C\u653F	x\xEDng zh\xE8ng	7	n	administration|administrative|executive
\u5927\u697C	d\xE0 l\xF3u	4	n	building
\u8010\u5FC3	n\xE0i x\u012Bn	5	a	be patient|patience
\u53F8\u6CD5	s\u012B f\u01CE	7	n	judicial|justice
\u52A0\u5FEB	ji\u0101 ku\xE0i	3	v	accelerate|speed up
\u7275	qi\u0101n	6	v	lead along|pull|involve|draw in
\u51B2\u52A8	ch\u014Dng d\xF2ng	5	an	have an urge|be impetuous|impulse|urge
\u8003\u9A8C	k\u01CEo y\xE0n	3	vn	test|put to the test|trial|ordeal
\u5206\u914D	f\u0113n p\xE8i	3	v	distribute|assign|allocate|partition
\u8D26\u6237	zh\xE0ng h\xF9	6	n	bank account|online account
\u5F53\u6210	d\xE0ng ch\xE9ng	6	v	consider as|take to be
\u6280\u5DE7	j\xEC qi\u01CEo	4	n	skill|technique
\u8FDC\u79BB	yu\u01CEn l\xED	6	v	be far from|keep away from
\u5927\u9646	d\xE0 l\xF9	4	n	continent|mainland|mainland china
\u5929\u4E0B	ti\u0101n xi\xE0	6	n	land under heaven|whole world|whole of china|realm|rule
\u4E50\u961F	yu\xE8 du\xEC	3	n	band|pop group
\u6F14\u5531\u4F1A	y\u01CEn ch\xE0ng hu\xEC	3	n	vocal recital or concert
\u9002\u5F53	sh\xEC d\xE0ng	6	a	suitable|appropriate
\u5982\u540C	r\xFA t\xF3ng	5	v	like|as
\u4FEE\u6539	xi\u016B g\u01CEi	3	v	amend|alter|modify
\u5B87\u5B99	y\u01D4 zh\xF2u	7	n	universe|cosmos
\u63D0\u8D77	t\xED q\u01D0	5	v	mention|speak of|lift|pick up|arouse|raise (a topic
\u4F20\u5947	chu\xE1n q\xED	7	n	legendary|fantasy saga|romance
\u5F00\u73A9\u7B11	k\u0101i w\xE1n xi\xE0o	1	v	play a joke|make fun of|joke
\u540D\u4EBA	m\xEDng r\xE9n	4	n	personage|celebrity
\u516C\u6B63	g\u014Dng zh\xE8ng	5	a	just|fair|equitable
\u5404\u4E2A	g\xE8 g\xE8	4	r	every|various|separately, one by one
\u51BB	d\xF2ng	5	v	freeze|feel very cold|aspic or jelly
\u548C\u8C10	h\xE9 xi\xE9	6	a	harmonious|harmony|censor
\u8981\u4E0D	y\xE0o b\xF9	7	c	otherwise|or else|how about|either
\u9AD8\u624B	g\u0101o sh\u01D2u	6	n	expert|past master|dab hand
\u8F9E\u804C	c\xED zh\xED	5	v	resign
\u5448\u73B0	ch\xE9ng xi\xE0n	7	v	appear|emerge|present|demonstrate
\u7535\u68AF	di\xE0n t\u012B	4	n	elevator|escalator
\u9075\u5B88	z\u016Bn sh\u01D2u	5	v	comply with|abide by|respect
\u65E0\u6BD4	w\xFA b\u01D0	7	z	incomparable|matchless
\u53C2\u8D5B	c\u0101n s\xE0i	6	v	compete
\u56FD\u5916	gu\xF3 w\xE0i	1	s	abroad|external|overseas|foreign
\u6293\u7D27	zhu\u0101 j\u01D0n	4	v	pay close attention to|lose no time in
\u6696	nu\u01CEn	5	a	warm
\u6F14\u5531	y\u01CEn ch\xE0ng	3	v	sung performance|sing for an audience
\u76F8\u5904	xi\u0101ng ch\u01D4	4	v	be in contact|associate|interact|get along
\u5EFA\u9020	ji\xE0n z\xE0o	5	v	construct|build
\u6212	ji\xE8	5	v	guard against|exhort|admonish or warn|buddhist monastic discipline|ring
\u522E	gu\u0101	6	v	scrape|blow|shave|plunder|extort
\u4FE1\u4EF0	x\xECn y\u01CEng	6	vn	believe in|firm belief|conviction
\u53CD\u6620	f\u01CEn y\xECng	4	v	mirror|reflect|mirror image|reflection|report|make known|render
\u601D\u7EF4	s\u012B w\xE9i	5	n	thought|thinking
\u690D\u7269	zh\xED w\xF9	4	n	plant|vegetation
\u89C4\u5212	gu\u012B hu\xE0	5	n	draw up a plan|map out a program|plan|program
\u4E0D\u8BB8	b\xF9 x\u01D4	5	d	not to allow|must not|can't
\u4FDD\u5B58	b\u01CEo c\xFAn	3	v	conserve|preserve|keep|save
\u997C	b\u01D0ng	5	n	round flat cake|cookie|cake|pastry
\u8DF3\u821E	ti\xE0o w\u01D4	3	v	dance
\u9635	zh\xE8n	4	g	disposition of troops|wave|spate|burst|spell|short period of time
\u4E0D\u6B62	b\xF9 zh\u01D0	5	v	incessantly|without end|more than|not limited to
\u8BC4\u59D4	p\xEDng w\u011Bi	7	n	evaluation committee|judging panel|judging panel member
\u4E0D\u51C6	b\xF9 zh\u01D4n	7	v	not to allow|forbid|prohibit
\u5F55\u50CF	l\xF9 xi\xE0ng	6	n	videotape|videorecord|video recording
\u5C11\u5973	sh\xE0o n\u01DA	7	n	girl|young lady
\u65E5\u671F	r\xEC q\u012B	1	n	date
\u514D	mi\u01CEn	7	v	excuse sb|exempt|avoid|avert|escape|be prohibited
\u67E5\u770B	ch\xE1 k\xE0n	6	v	look over|examine|check up|ferret out
\u778E	xi\u0101	7	d	blind|groundlessly|foolishly|no purpose
\u8F6C\u8EAB	zhu\u01CEn sh\u0113n	4	v	turn round|face about|remarry
\u5927\u9053	d\xE0 d\xE0o	6	n	main street|avenue
\u4ECE\u6B64	c\xF3ng c\u01D0	4	d	from now on|since then|henceforth
\u7B14\u8BB0\u672C	b\u01D0 j\xEC b\u011Bn	2	n	notebook
\u5730\u9707	d\xEC zh\xE8n	5	n	earthquake
\u9707\u60CA	zh\xE8n j\u012Bng	5	v	shock|astonish
\u5BF9\u9762	du\xEC mi\xE0n	2	f	opposite|across|directly in front|be face to face
\u8D54\u507F	p\xE9i ch\xE1ng	5	v	compensate
\u7535\u89C6\u53F0	di\xE0n sh\xEC t\xE1i	3	n	television station
\u53D1\u660E	f\u0101 m\xEDng	3	v	invent|invention
\u75BC\u75DB	t\xE9ng t\xF2ng	6	an	pain|be painful|be sore|hurt|be in pain
\u6DF7\u5408	h\xF9n h\xE9	6	vn	mix|blend|hybrid|composite
\u64AD\u653E	b\u014D f\xE0ng	3	v	broadcast|transmit
\u77EE	\u01CEi	4	a	low|short
\u8FD4\u56DE	f\u01CEn hu\xED	5	v	return to|come back
\u5751	k\u0113ng	7	n	pit|depression|hollow|tunnel|hole in the ground|bury alive|hoodwink|cheat
\u5BFC\u5F39	d\u01CEo d\xE0n	7	n	missile
\u52CB\u7AE0	x\u016Bn zh\u0101ng	7	n	medal|decoration
\u9886\u8896	l\u01D0ng xi\xF9	6	n	leader
\u4F1A\u89C1	hu\xEC ji\xE0n	6	v	meet with
\u4FE1\u7528\u5361	x\xECn y\xF2ng k\u01CE	2	n	credit card
\u5408\u7EA6	h\xE9 yu\u0113	6	n	treaty|contract
\u73AB\u7470	m\xE9i gu\u012B	7	n	rugosa rose|rose flower
\u4EE3\u7406	d\xE0i l\u01D0	5	vn	surrogate|proxy
\u5934\u90E8	t\xF3u b\xF9	7	n	head
\u8FC7\u5EA6	gu\xF2 d\xF9	5	v	excessive|over-|excess|going too far|extravagant|intemperate|overdue
\u6325	hu\u012B	7	v	wave|brandish|command|conduct|scatter|disperse
\u4EA6	y\xEC	7	d	also
\u56DE\u5F52	hu\xED gu\u012B	7	v	return to|retreat|regression
\u660E\u660E	m\xEDng m\xEDng	5	d	obviously|plainly|undoubtedly|definitely
\u673A\u5173	j\u012B gu\u0101n	6	n	mechanism|gear|machine-operated|office|agency|organ|organization|establishment
\u90AE\u4EF6	y\xF3u ji\xE0n	3	n	mail|post|email
\u7FA4\u4F17	q\xFAn zh\xF2ng	5	n	mass|multitude|masses
\u7A81\u51FA	t\u016B ch\u016B	3	a	prominent|outstanding|give prominence to|protrude|project
\u6295\u8BC9	t\xF3u s\xF9	4	v	complaint|complain|register a complaint
\u65E0\u7591	w\xFA y\xED	5	d	undoubtedly|without doubt|for sure
\u51CF\u80A5	ji\u01CEn f\xE9i	4	v	lose weight
\u5BCC\u6709	f\xF9 y\u01D2u	6	v	rich|wealthy|affluent|be rich in|be replete with
\u6309\u6469	\xE0n m\xF3	5	vn	massage
\u5B97	z\u014Dng	7	q	school|sect|purpose|model|ancestor|clan|take as one's model
\u7ED1\u67B6	b\u01CEng ji\xE0	7	v	kidnap|abduct|hijack|kidnapping|abduction|staking
\u503E\u5411	q\u012Bng xi\xE0ng	6	n	trend|tendency|orientation
\u7535\u6C60	di\xE0n ch\xED	5	n	battery
\u8BF1\u60D1	y\xF2u hu\xF2	7	vn	entice|lure|induce|attract
\u5176\u6B21	q\xED c\xEC	3	c	next|secondly
\u773C\u955C	y\u01CEn j\xECng	4	n	spectacles|eyeglasses
\u996D\u5E97	f\xE0n di\xE0n	1	n	restaurant|hotel
\u4E50\u89C2	l\xE8 gu\u0101n	3	a	optimistic|hopeful
\u4F53\u91CD	t\u01D0 zh\xF2ng	4	n	body weight
\u5B9E\u8BDD	sh\xED hu\xE0	7	n	truth
\u4EA7\u4E1A	ch\u01CEn y\xE8	5	n	industry|estate|property|industrial
\u9762\u8BD5	mi\xE0n sh\xEC	4	v	be interviewed|interview
\u9752\u5C11\u5E74	q\u012Bng sh\xE0o ni\xE1n	2	n	adolescent|youth|teenager
\u6551\u547D	ji\xF9 m\xECng	6	v	save sb's life|help|save me
\u6572	qi\u0101o	5	v	hit|strike|tap|rap|knock|rip sb off|overcharge
\u8FDF	ch\xED	5	a	late|delayed|slow
\u65E0\u6240\u8C13	w\xFA su\u01D2 w\xE8i	4	v	be indifferent|not to matter
\u8001\u9F20	l\u01CEo sh\u01D4	5	n	rat|mouse
\u813E\u6C14	p\xED qi	5	n	character|temperament|disposition|bad temper
\u6DA8	zh\xE0ng	5	v	swell|distend|rise
\u4F1A\u5458	hu\xEC yu\xE1n	3	n	member
\u70ED\u70C8	r\xE8 li\xE8	3	a	enthusiastic|ardent|warm
\u5428	d\u016Bn	5	q	ton|taiwan pr
\u5C45\u4F4F	j\u016B zh\xF9	4	v	reside|dwell|live in a place|resident in
\u76F8\u4F3C	xi\u0101ng s\xEC	3	a	similar|alike
\u79FB\u6C11	y\xED m\xEDn	4	n	immigrate|migrate|emigrant|immigrant
\u7FFB\u8BD1	f\u0101n y\xEC	4		translate|interpret|translator|interpreter|translation|interpretation
\u62C5\u4EFB	d\u0101n r\xE8n	4	v	assume office of|take charge of|serve as
\u5E7F	gu\u01CEng	5	a	wide|numerous|spread
\u8054\u5408\u56FD	Li\xE1n h\xE9 gu\xF3	3	nt	united nations
\u60C5\u4EBA	q\xEDng r\xE9n	7	n	lover|sweetheart
\u60C5\u5F62	q\xEDng xing	5	n	circumstances|situation
\u70E6\u607C	f\xE1n n\u01CEo	7	an	be worried|be distressed|worries
\u6301\u6709	ch\xED y\u01D2u	6	v	hold
\u7279\u70B9	t\xE8 di\u01CEn	2	n	characteristic|trait|feature
\u8D77\u7801	q\u01D0 m\u01CE	5	d	at the minimum|at the very least
\u4E2D\u5B66	zh\u014Dng xu\xE9	1	n	middle school
\u6CBF\u7740	y\xE1n zhe	6	p	go along|follow
\u8D81	ch\xE8n	7	p	avail oneself of|take advantage of
\u5BBF\u820D	s\xF9 sh\xE8	5	n	dormitory|dorm room|living quarters|hostel
\u5408\u5E76	h\xE9 b\xECng	5	v	merge|annex
\u5F80\u5F80	w\u01CEng w\u01CEng	3	d	usually|in many cases|more often than not
\u5AC9\u5992	j\xED d\xF9	7	v	be jealous of|envy
\u5E26\u9886	d\xE0i l\u01D0ng	3	v	guide|lead
\u9634	y\u012Bn	2	a	overcast|cloudy|shady|yin|negative|feminine|moon|implicit
\u4E0A\u7F51	sh\xE0ng w\u01CEng	1	v	go online|connect to the internet
\u63A2\u7D22	t\xE0n su\u01D2	6	v	explore|probe
\u8D22\u653F	c\xE1i zh\xE8ng	7	n	finances|financial
\u5BF9\u6297	du\xEC k\xE0ng	6	v	withstand|resist|stand off|antagonism|confrontation
\u6625	ch\u016Bn	3	tg	spring|gay|joyful|youthful|love|lust|life
\u706D	mi\xE8	6	v	extinguish or put out|go out|exterminate or wipe out|drown
\u8FF9\u8C61	j\xEC xi\xE0ng	7	n	sign|indication|mark|indicator
\u79E9\u5E8F	zh\xEC x\xF9	7	n	order|social order|state
\u98CE\u666F	f\u0113ng j\u01D0ng	4	n	scenery|landscape
\u652F\u63F4	zh\u012B yu\xE1n	6	v	provide assistance|support|back
\u7EBF\u8DEF	xi\xE0n l\xF9	6	n	line|circuit|wire|road|track|route
\u8840\u7BA1	xu\xE8 gu\u01CEn	6	n	vein|artery
\u6C89	ch\xE9n	4	v	submerge|immerse|sink|keep down|lower|drop|deep|profound
\u5584\u826F	sh\xE0n li\xE1ng	4	a	good and honest|kindhearted
\u7B11\u8BDD	xi\xE0o hua	2	n	joke|jest|laugh at|mock
\u8D31	ji\xE0n	7	a	inexpensive|lowly|despicable|my
\u53EF\u9760	k\u011B k\xE0o	3	a	reliable
\u5176\u4F59	q\xED y\xFA	4	r	rest|others|remaining|remainder|apart from them
\u517C	ji\u0101n	7	v	double|twice|simultaneous
\u4EE5\u5F80	y\u01D0 w\u01CEng	5	t	in the past|formerly
\u5A03\u5A03	w\xE1 wa	6	n	baby|small child|doll
\u70ED\u7EBF	r\xE8 xi\xE0n	6	n	hotline
\u5173\u8054	gu\u0101n li\xE1n	6	vn	be related|be connected|relationship|connection
\u51C9	li\xE1ng	2	a	cool|cold|let sth cool down
\u89C4\u6A21	gu\u012B m\xF3	4	n	scale|scope|extent
\u51B3\u5FC3	ju\xE9 x\u012Bn	3	n	determination|resolution|determined|firm and resolute|make up one's mind
\u5546\u573A	sh\u0101ng ch\u01CEng	1	n	shopping mall|shopping center|department store|emporium|business world
\u4E61\u6751	xi\u0101ng c\u016Bn	5	n	rustic|village|countryside
\u5FCD\u4E0D\u4F4F	r\u011Bn bu zh\xF9	5	v	cannot help|unable to bear
\u7403\u8FF7	qi\xFA m\xED	3	n	fan
\u4F55\u65F6	h\xE9 sh\xED	7	r	when
\u6361	ji\u01CEn	6	v	pick up|collect|gather
\u91D1\u94B1	j\u012Bn qi\xE1n	6	n	money|currency
\u852C\u83DC	sh\u016B c\xE0i	5	n	vegetables
\u6D88\u706D	xi\u0101o mi\xE8	6	v	put an end to|annihilate|cause to perish|perish|annihilation
\u72AC	qu\u01CEn	6	g	dog|kangxi radical 94
\u7B7E\u7F72	qi\u0101n sh\u01D4	7	v	sign
\u54EA\u6015	n\u01CE p\xE0	4	c	even|even if|even though|no matter how
\u8865\u5145	b\u01D4 ch\u014Dng	3	v	replenish|supplement|complement|additional|supplementary
\u6B3A\u9A97	q\u012B pi\xE0n	7	v	deceive|cheat
\u4F19	hu\u01D2	4	q	companion|partner|group|combine|together
\u8857\u5934	ji\u0113 t\xF3u	6	s	street
\u60CA\u4EBA	j\u012Bng r\xE9n	6	a	astonishing
\u6700\u521D	zu\xEC ch\u016B	4	b	first|primary|initial|original|at first|initially|originally
\u8DEF\u8FC7	l\xF9 gu\xF2	6	v	pass by or through
\u514B\u670D	k\xE8 f\xFA	3	v	overcome|conquer|put up with|endure
\u8D28\u7591	zh\xEC y\xED	7	v	call into question|question
\u90FD\u4F1A	d\u016B hu\xEC	7	n	city|metropolis
\u6D77\u6D0B	h\u01CEi y\xE1ng	6	n	ocean
\u6469\u6258\u8F66	m\xF3 tu\u014D ch\u0113	5	n	motorbike|motorcycle
\u91D1\u878D	j\u012Bn r\xF3ng	6	n	banking|finance|financial
\u8584	b\xF3	4	a	meager|slight|weak|ungenerous or unkind|frivolous|despise|belittle|look down on
\u8D38\u6613	m\xE0o y\xEC	5	vn	trade
\u7A97\u6237	chu\u0101ng hu	4	n	window
\u697C\u4E0B	l\xF3u xi\xE0	1	s	downstairs
\u5B50\u5F39	z\u01D0 d\xE0n	5	n	bullet
\u88C5\u4FEE	zhu\u0101ng xi\u016B	4	v	decorate|interior decoration|fit up|renovate
\u9762\u5305	mi\xE0n b\u0101o	1	n	bread
\u586B	ti\xE1n	4	v	fill or stuff|fill in
\u9996\u5E2D	sh\u01D2u x\xED	6	n	chief
\u6210\u5206	ch\xE9ng f\xE8n	6	n	composition|ingredient|element|component|one's social status
\u540C\u4E00	t\xF3ng y\u012B	6	b	identical|same
\u53EC\u5F00	zh\xE0o k\u0101i	4	v	convene|convoke|call together
\u5916\u56FD	w\xE0i gu\xF3	1	n	foreign
\u5531\u7247	ch\xE0ng pi\xE0n	4	n	gramophone record|lp|music cd|musical album
\u5E73\u5E38	p\xEDng ch\xE1ng	2	a	ordinary|common|usually|ordinarily
\u653B	g\u014Dng	7	v	attack|accuse|study
\u75D5\u8FF9	h\xE9n j\xEC	7	n	vestige|mark|trace
\u79FB\u690D	y\xED zh\xED	7	vn	transplant
\u6709\u9650	y\u01D2u xi\xE0n	4	a	limited|finite
\u4E0D\u4F46	b\xF9 d\xE0n	2	c	not only
\u4E8B\u52A1\u6240	sh\xEC w\xF9 su\u01D2	7	n	office|firm
\u4EE3\u66FF	d\xE0i t\xEC	4	v	replace|take the place of
\u51B0\u7BB1	b\u012Bng xi\u0101ng	4	n	icebox|freezer cabinet|refrigerator
\u6587\u5B57	w\xE9n z\xEC	3	n	character|script|writing|written language|writing style|phraseology
\u8FC7\u4E8E	gu\xF2 y\xFA	5	d	too much|excessively
\u501F\u53E3	ji\xE8 k\u01D2u	7	n	use as an excuse|excuse|pretext
\u6709\u5229	y\u01D2u l\xEC	3	a	advantageous|favorable
\u67D3	r\u01CEn	5	v	dye|catch|acquire|contaminate
\u80BE	sh\xE8n	7	n	kidney
\u6E05\u6670	q\u012Bng x\u012B	7	a	clear|distinct
\u535A\u7269\u9986	b\xF3 w\xF9 gu\u01CEn	5	n	museum
\u7801\u5934	m\u01CE t\xF3u	5	n	dock|pier|wharf
\u4F53\u73B0	t\u01D0 xi\xE0n	3	v	embody|reflect|incarnate
\u70ED\u7231	r\xE8 \xE0i	3	v	love ardently|adore
\u548B	zh\xE0	6	r	loud noise|shout|suddenly|gnaw
\u62EF\u6551	zh\u011Bng ji\xF9	7	v	save|rescue
\u5BB6\u5177	ji\u0101 j\xF9	3	n	furniture
\u5B8C\u4E86	w\xE1n le	5	v	be finished|be done for|ruined|gone to the dogs|oh no
\u751F\u957F	sh\u0113ng zh\u01CEng	3	v	grow|grow up|be brought up
\u5D29\u6E83	b\u0113ng ku\xEC	7	v	collapse|crumble|fall apart
\u5FAA\u73AF	x\xFAn hu\xE1n	6	vn	cycle|circulate|circle|loop
\u6C47\u62A5	hu\xEC b\xE0o	4	v	report|give an account of
\u4ECE\u6CA1	c\xF3ng m\xE9i	6	d	never|never did
\u603B\u88C1	z\u01D2ng c\xE1i	5	n	chairman|director-general
\u534F\u8C03	xi\xE9 ti\xE1o	6	v	coordinate|harmonize|fit together|match|harmonious|concerted
\u9274\u5B9A	ji\xE0n d\xECng	6	vn	appraise|identify|evaluate
\u8D85\u8D8A	ch\u0101o yu\xE8	5	v	surpass|exceed|transcend
\u8BBA\u6587	l\xF9n w\xE9n	4	n	paper|treatise|thesis
\u819C	m\xF3	6	n	membrane|film
\u94FA	p\xF9	6	v	plank bed|place to sleep|shop|store|relay station|spread|display|set up
\u6CE5	n\xED	6	n	mud|clay|paste|pulp|restrained
\u534A\u591C	b\xE0n y\xE8	2	t	midnight
\u7279\u8272	t\xE8 s\xE8	3	n	characteristic|distinguishing feature or quality
\u7528\u6237	y\xF2ng h\xF9	5	n	user|consumer|subscriber|customer
\u773C\u91CC	y\u01CEnli	4	s	in the eyes
\u6B63\u4E49	zh\xE8ng y\xEC	5	n	justice|righteousness|just|righteous
\u6C11\u4F17	m\xEDn zh\xF2ng	7	n	populace|masses|common people
\u4E0D\u5728\u4E4E	b\xF9 z\xE0i hu	4	v	not to care
\u7535\u89C6\u5267	di\xE0n sh\xEC j\xF9	3	n	tv series|tv drama
\u4ECE\u800C	c\xF3ng \xE9r	5	c	thus|thereby
\u6574\u4F53	zh\u011Bng t\u01D0	3	n	whole entity|entire body|synthesis|as a whole|global|macrocosm|integral|holistic
\u7C97	c\u016B	4	a	coarse|rough|thick|unfinished|vulgar|rude|crude|remote
\u7EFC\u5408	z\u014Dng h\xE9	4	vn	comprehensive|composite|synthesized|mixed|sum up|integrate|synthesize
\u8EAB\u4EFD\u8BC1	sh\u0113n f\xE8n zh\xE8ng	3	n	identity card|id
\u7A7F\u8D8A	chu\u0101n yu\xE8	7	v	pass through|traverse|cross
\u629B\u5F03	p\u0101o q\xEC	7	v	abandon|discard|renounce|dump
\u5546\u91CF	sh\u0101ng liang	2	v	consult|talk over|discuss
\u573A\u666F	ch\u01CEng j\u01D0ng	6	n	scene|scenario|situation|setting
\u591A\u5E74	du\u014D ni\xE1n	4	mq	many years|for many years|longstanding
\u6536\u8D39	sh\u014Du f\xE8i	3	vn	charge a fee
\u8DE8	ku\xE0	6	v	step across|stride over|straddle|span
\u5F62\u5BB9	x\xEDng r\xF3ng	4	v	describe|countenance|appearance
\u9752\u6625	q\u012Bng ch\u016Bn	4	n	youth|youthfulness
\u5217\u8F66	li\xE8 ch\u0113	4	n	train
\u6218\u672F	zh\xE0n sh\xF9	6	n	tactics
\u4E34\u5E8A	l\xEDn chu\xE1ng	7	vn	clinical
\u6551\u63F4	ji\xF9 yu\xE1n	6	vn	save|support|help|assist
\u9EC4\u8272	hu\xE1ng s\xE8	2	n	yellow|pornographic
\u559C\u7231	x\u01D0 \xE0i	4	v	like|love|be fond of|favorite
\u5438\u6536	x\u012B sh\u014Du	4	v	absorb|assimilate|ingest|recruit
\u4F18\u96C5	y\u014Du y\u01CE	7	a	grace|graceful
\u6B32\u671B	y\xF9 w\xE0ng	7	n	desire|longing|appetite|craving
\u8D25	b\xE0i	4	v	defeat|damage|lose|fail|wither
\u8FCE\u63A5	y\xEDng ji\u0113	3	v	welcome|greet
\u6539\u8FDB	g\u01CEi j\xECn	3	v	improve|make better|improvement
\u7ACB\u573A	l\xEC ch\u01CEng	5	n	position|standpoint
\u5C0F\u4F19\u5B50	xi\u01CEo hu\u01D2 zi	4	n	young man|young guy|lad|youngster
\u6D6A	l\xE0ng	7	n	wave|breaker|unrestrained|dissipated|stroll|ramble
\u8212\u9002	sh\u016B sh\xEC	4	a	cozy|snug
\u706B\u707E	hu\u01D2 z\u0101i	5	n	serious fire
\u8BA4\u5B9A	r\xE8n d\xECng	5	v	maintain|determine|determination|of the firm opinion|believe firmly|set one's mind on|identify with
\u5EFA\u8BBE	ji\xE0n sh\xE8	3	vn	build|construct|establish|develop|institute
\u6587\u5B66	w\xE9n xu\xE9	3	n	literature
\u7F8E\u5473	m\u011Bi w\xE8i	7	n	delicious|delicious food|delicacy
\u4F1A\u8BA1	ku\xE0i j\xEC	4	n	accountant|accountancy|accounting
\u8DCC	di\u0113	6	v	fall|tumble|trip|drop|taiwan pr
\u4EFF\u4F5B	f\u01CEng f\xFA	6	d	seem|as if|alike|similar
\u59D3\u540D	x\xECng m\xEDng	2	n	full name
\u4E0D\u5229	b\xF9 l\xEC	5	a	unfavorable|disadvantageous|harmful|detrimental
\u6F0F	l\xF2u	5	v	leak|divulge|leave out by mistake|waterclock or hourglass
\u5999	mi\xE0o	6	a	clever|wonderful
\u5934\u8111	t\xF3u n\u01CEo	3	n	brains|mind|skull|gist|leader|boss
\u72EE\u5B50	Sh\u012B z\u01D0	7	n	leo|lion
\u96BE\u5EA6	n\xE1n d\xF9	3	n	degree of difficulty
\u5348\u9910	w\u01D4 c\u0101n	2	n	lunch|luncheon
\u5C4B\u5B50	w\u016B zi	3	n	house|room
\u5012\u662F	d\xE0o shi	5	d	actually|contrariwise|why don't you
\u597D\u53CB	h\u01CEo y\u01D2u	4	n	close friend|pal|friend
\u8BAE\u5458	y\xEC yu\xE1n	7	n	member|representative
\u6392\u961F	p\xE1i du\xEC	2	v	line up
\u6B64\u523B	c\u01D0 k\xE8	5	r	this moment|now|at present
\u90AA\u6076	xi\xE9 \xE8	7	a	sinister|vicious|wicked|evil
\u6821\u56ED	xi\xE0o yu\xE1n	2	n	campus
\u8DB3\u4EE5	z\xFA y\u01D0	6	d	sufficient to|so much so that|so that
\u5C3A	ch\u01D0	4	q	chinese foot|one-third of a meter|ruler|tape-measure
\u7A0D\u5FAE	sh\u0101o w\u0113i	5	d	little bit
\u7B49\u5230	d\u011Bng d\xE0o	2	v	wait until|by the time when
\u5E94\u4ED8	y\xECng fu	7	v	deal with|cope
\u80D6\u5B50	p\xE0ng zi	4	n	fat person|fatty
\u6C57	h\xE0n	5	n	perspiration|sweat|be speechless
\u94C1\u8DEF	ti\u011B l\xF9	3	n	railroad|railway
\u5411\u524D	xi\xE0ng qi\xE1n	5	v	forward|onward
\u901A\u4FE1	t\u014Dng x\xECn	3	vn	correspond|communicate|communication
\u8D2D	g\xF2u	7	g	buy|purchase
\u573A\u9762	ch\u01CEng mi\xE0n	5	n	scene|spectacle|occasion|situation
\u4E00\u4E0B\u5B50	y\u012B xi\xE0 zi	5	mq	in a short while|all at once|all of a sudden
\u76EE\u5149	m\xF9 gu\u0101ng	5	n	gaze|attention|expression in one's eyes|look|sight|vision
\u7F3A\u5C11	qu\u0113 sh\u01CEo	3	v	lack|shortage of|shortfall|be short
\u73AF\u4FDD	hu\xE1n b\u01CEo	3	n	environmental protection|environmentally friendly
\u96FE	w\xF9	7	n	fog|mist
\u5BB6\u4E61	ji\u0101 xi\u0101ng	3	n	hometown|native place
\u7956\u56FD	z\u01D4 gu\xF3	6	n	motherland
\u82AF\u7247	x\u012Bn pi\xE0n	7	n	computer chip|microchip
\u751F\u75C5	sh\u0113ng b\xECng	1	v	fall ill
\u4F38	sh\u0113n	5	v	stretch|extend
\u4E00\u90E8\u5206	y\u012B b\xF9 fen	2	m	portion|part of|subset
\u653E\u624B	f\xE0ng sh\u01D2u	6	v	let go one's hold|give up|have a free hand
\u9605\u8BFB	yu\xE8 d\xFA	4	v	read|reading
\u53D1\u9001	f\u0101 s\xF2ng	3	v	transmit|dispatch|issue
\u6709\u529B	y\u01D2u l\xEC	5	a	powerful|forceful|vigorous
\u8131\u79BB	tu\u014D l\xED	5	v	separate oneself from|break away from|diastasis|abscission|abjunction
\u89E3\u9664	ji\u011B ch\xFA	5	v	remove|sack|get rid of|relieve|free|lift|rescind
\u60E9\u7F5A	ch\xE9ng f\xE1	7	v	penalty|punishment|punish
\u597D\u542C	h\u01CEo t\u012Bng	1	a	pleasant to hear
\u7A77	qi\xF3ng	4	a	poor|destitute|use up|exhaust|thoroughly|extremely|persistently and pointlessly
\u963F\u59E8	\u0101 y\xED	4	n	maternal aunt|step-mother|childcare worker|nursemaid
\u9644	f\xF9	7	v	add|attach|be close to|be attached
\u4E8B\u52A1	sh\xEC w\xF9	7	n	affairs|work|transaction
\u5C3D\u53EF\u80FD	j\u01D0n k\u011B n\xE9ng	5	d	as far as possible|do one's utmost
\u51F6	xi\u014Dng	6	a	vicious|fierce|ominous|inauspicious|famine|terrible|fearful
\u594B\u6597	f\xE8n d\xF2u	4	v	strive|struggle
\u64AD\u51FA	b\u014D ch\u016B	3	v	broadcast|air
\u7231\u4EBA	\xE0i ren	2	n	spouse|lover
\u8BFB\u8005	d\xFA zh\u011B	3	n	reader
\u5728\u610F	z\xE0i y\xEC	7	v	care about|mind
\u7EA6\u5B9A	yu\u0113 d\xECng	6	v	agree on sth|conclude a bargain|arrange|promise|stipulate|make an appointment|stipulated|arrangement
\u6280\u80FD	j\xEC n\xE9ng	5	n	technical ability|skill
\u591A\u6570	du\u014D sh\xF9	2	m	majority|most
\u5BF8	c\xF9n	5	q	unit of length|inch|thumb
\u6D88\u8D39	xi\u0101o f\xE8i	3	vn	consume|spend
\u5B9E\u884C	sh\xED x\xEDng	3	v	implement|carry out|put into practice
\u62B5\u6297	d\u01D0 k\xE0ng	6	v	resist|resistance
\u52A8\u673A	d\xF2ng j\u012B	5	n	motive|motivation
\u60C5\u8282	q\xEDng ji\xE9	5	n	circumstances|plot|storyline
\u9A7E	ji\xE0	7	v	harness|draw|drive|pilot|sail|ride|your good self
\u897F\u65B9	X\u012B f\u0101ng	2	s	west|occident|western countries
\u63F4\u52A9	yu\xE1n zh\xF9	6	vn	help|support|aid|assistance
\u867D	su\u012B	6	c	although|even though
\u8BA8	t\u01CEo	7	v	invite|provoke|demand or ask for|denounce or condemn|marry|discuss or study
\u9884\u671F	y\xF9 q\u012B	5	v	expect|anticipate
\u4FB5\u72AF	q\u012Bn f\xE0n	6	v	infringe on|encroach on|violate|assault
\u6253\u626E	d\u01CE ban	5	v	decorate|dress|make up|adorn|manner of dressing|style of dress
\u5F00\u4F1A	k\u0101i hu\xEC	1	v	hold a meeting|attend a meeting
\u751F\u6DAF	sh\u0113ng y\xE1	7	n	career|life|period of one's life
\u4E50\u8DA3	l\xE8 q\xF9	4	n	delight|pleasure|joy
\u6218\u573A	zh\xE0n ch\u01CEng	6	n	battlefield
\u77E5\u540D	zh\u012B m\xEDng	6	a	well-known|famous
\u6625\u5929	ch\u016Bn ti\u0101n	2	t	spring
\u94B1\u5305	qi\xE1n b\u0101o	1	n	purse|wallet
\u5154	t\xF9	5	g	rabbit
\u5435\u67B6	ch\u01CEo ji\xE0	3	v	quarrel|have a row
\u71AC	\xE1o	7	v	extract by heating|decoct|endure|boil|simmer
\u8D27\u8F66	hu\xF2 ch\u0113	7	n	truck|van|freight wagon
\u63A8\u51FA	tu\u012B ch\u016B	6	v	push out|release|launch|publish|recommend
\u5927\u5B66\u751F	d\xE0 xu\xE9 sh\u0113ng	1	n	university student|college student
\u5DE7	qi\u01CEo	3	a	opportunely|coincidentally|as it happens|skillful|timely
\u51FA\u573A	ch\u016B ch\u01CEng	6	v	enter the scene|leave the venue
\u591A\u6B21	du\u014D c\xEC	4	mq	many times|repeatedly
\u4E00\u5411	y\u012B xi\xE0ng	5	d	always
\u5929\u624D	ti\u0101n c\xE1i	5	n	talent|gift|genius|talented|gifted
\u7537\u5973	n\xE1n n\u01DA	4	n	male-female|male and female
\u7EDD\u671B	ju\xE9 w\xE0ng	5	a	despair|give up all hope|desperate|desperation
\u8FF7\u4EBA	m\xED r\xE9n	5	a	fascinating|enchanting|charming|tempting
\u6536\u56DE	sh\u014Du hu\xED	4	v	regain|retake|take back|withdraw|revoke
\u804C\u4F4D	zh\xED w\xE8i	5	n	position|post|job
\u62CD\u5356	p\u0101i m\xE0i	7	v	auction|auction sale
\u5316\u5986	hu\xE0 zhu\u0101ng	7	v	put on makeup
\u7403\u573A	qi\xFA ch\u01CEng	2	n	stadium|sports ground|court|pitch|field|golf course
\u5916\u79D1	w\xE0i k\u0113	6	n	surgery
\u8282\u594F	ji\xE9 z\xF2u	6	n	rhythm|tempo|musical pulse|cadence|beat
\u9A97\u5B50	pi\xE0n zi	5	n	swindler|cheat
\u540D\u4E49	m\xEDng y\xEC	6	n	name|titular|nominal|in name|ostensible purpose
\u4ECE\u4E0D	c\xF3ng b\xF9	6	d	never
\u6869	zhu\u0101ng	7	q	stump|stake|pile
\u88C1\u5224	c\xE1i p\xE0n	5	n	judgment|referee|umpire|judge
\u89D2\u843D	ji\u01CEo lu\xF2	7	n	nook|corner
\u6E10\u6E10	ji\xE0n ji\xE0n	4	d	gradually
\u5267\u672C	j\xF9 b\u011Bn	5	n	screenplay|scenario
\u53E3\u5473	k\u01D2u w\xE8i	7	n	person's preferences|tastes|flavor
\u4EB2\u5BC6	q\u012Bn m\xEC	4	a	intimate|close
\u7740\u6025	zh\xE1o j\xED	4	a	worry|feel anxious|be in a hurry|taiwan pr
\u5177\u5907	j\xF9 b\xE8i	4	v	possess|have|equipped with|able to fulfill
\u4F4F\u9662	zh\xF9 yu\xE0n	2	v	be in hospital|be hospitalized
\u59FF\u52BF	z\u012B sh\xEC	7	n	posture|position
\u7248\u672C	b\u01CEn b\u011Bn	6	n	version|edition|release
\u6559\u5B66	ji\xE0o xu\xE9	2	vn	teaching|instruction|teach
\u5E72\u6270	g\u0101n r\u01CEo	5	v	disturb|interfere|perturbation|interference
\u5E72\u8106	g\u0101n cu\xEC	5	d	candid|simply|just|might as well
\u8054\u7EDC	li\xE1n lu\xF2	5	v	get in touch with|contact|stay in contact|liaison|connection
\u80BF	zh\u01D2ng	6	v	swell|swelling|swollen
\u589E\u5F3A	z\u0113ng qi\xE1ng	5	v	increase|strengthen
\u9014\u5F84	t\xFA j\xECng	6	n	way|means|channel
\u4E0D\u5B89	b\xF9 \u0101n	3	a	unpeaceful|unstable|uneasy|disturbed|restless|worried
\u6905\u5B50	y\u01D0 zi	2	n	chair
\u4F53\u7CFB	t\u01D0 x\xEC	7	n	system|setup
\u5EA7\u4F4D	zu\xF2 w\xE8i	2	n	seat
\u8F66\u7AD9	ch\u0113 zh\xE0n	1	n	rail station|bus stop
\u906D\u53D7	z\u0101o sh\xF2u	6	v	suffer|sustain
\u5EB7\u590D	k\u0101ng f\xF9	6	v	recuperate|recover|convalesce
\u8C28\u614E	j\u01D0n sh\xE8n	7	a	cautious|prudent
\u9996\u90FD	sh\u01D2u d\u016B	3	n	capital
\u63E1	w\xF2	5	v	hold|grasp|clench|have in one's control|classifier: a handful
\u5C3D\u529B	j\xECn l\xEC	4	d	strive one's hardest|spare no effort
\u964C\u751F	m\xF2 sh\u0113ng	7	a	strange|unfamiliar
\u7A7F\u8FC7	chu\u0101n gu\xF2	7	v	pass through
\u8F68\u9053	gu\u01D0 d\xE0o	6	n	track|orbit|desired trajectory|orbital
\u57CE\u9547	ch\xE9ng zh\xE8n	6	n	town|cities and towns
\u5FCD\u53D7	r\u011Bn sh\xF2u	5	v	bear|endure
\u65B0\u5A18	x\u012Bn ni\xE1ng	4	n	bride
\u4F01\u56FE	q\u01D0 t\xFA	6	v	attempt|try
\u6276	f\xFA	5	v	support with the hand|help sb up|help
\u8F66\u7978	ch\u0113 hu\xF2	7	n	traffic accident|car crash
\u8106\u5F31	cu\xEC ru\xF2	7	a	weak|frail
\u4E0B\u8F7D	xi\xE0 z\u01CEi	4	v	download|also pr
\u5F15\u64CE	y\u01D0n q\xEDng	7	n	engine
\u7239	di\u0113	7	n	dad
\u7EF4\u4FEE	w\xE9i xi\u016B	4	vn	maintenance|protect and maintain
\u6574\u6574	zh\u011Bng zh\u011Bng	3	d	whole|full
\u6F2B\u753B	m\xE0n hu\xE0	5	n	caricature|cartoon|japanese manga
\u6784\u6210	g\xF2u ch\xE9ng	4	v	constitute|form|compose|make up|configure
\u7A9D	w\u014D	7	n	nest|lair|den|place|harbor or shelter|hold in check|bend
\u53E3\u888B	k\u01D2u d\xE0i	4	n	pocket|bag|sack
\u4E0D\u826F	b\xF9 li\xE1ng	5	a	bad|harmful|unhealthy
\u65E0\u9650	w\xFA xi\xE0n	4	v	unlimited|unbounded
\u8D70\u8DEF	z\u01D2u l\xF9	1	v	walk|go on foot
\u5403\u60CA	ch\u012B j\u012Bng	4	a	be startled|be shocked|be amazed
\u5FFD\u7136	h\u016B r\xE1n	2	d	suddenly|all of a sudden
\u80A9\u8180	ji\u0101n b\u01CEng	7	n	shoulder
\u4E0A\u573A	sh\xE0ng ch\u01CEng	7	v	on stage|go on stage|take the field
\u53D1\u8A00	f\u0101 y\xE1n	3	v	make a speech|statement|utterance
\u771F\u8BDA	zh\u0113n ch\xE9ng	5	a	sincere|genuine|true
\u7EE7\u627F	j\xEC ch\xE9ng	5	v	inherit|succeed to|carry on
\u524D\u6765	qi\xE1n l\xE1i	6	v	come|before|previously
\u5E73\u53F0	p\xEDng t\xE1i	6	n	platform|terrace|flat-roofed building
\u4F9D\u636E	y\u012B j\xF9	5	n	according to|basis|foundation
\u7948\u7977	q\xED d\u01CEo	7	v	pray|say one's prayers|prayer
\u5C0F\u670B\u53CB	xi\u01CEo p\xE9ng y\u01D2u	1	n	child
\u56FD\u4F1A	Gu\xF3 hu\xEC	6	n	parliament|congress|diet|legislative yuan
\u6323	zh\xE8ng	5	v	struggle to get free|strive to acquire|make
\u6682\u505C	z\xE0n t\xEDng	5	v	suspend|time-out|stoppage|pause
\u7FA1\u6155	xi\xE0n m\xF9	7	v	envy|admire
\u5F25\u8865	m\xED b\u01D4	7	v	complement
\u89C2\u5FF5	gu\u0101n ni\xE0n	3	n	notion|thought|concept|sense|views|ideology|general impressions
\u6B8B	c\xE1n	7	a	destroy|spoil|ruin|injure|cruel|oppressive|savage|brutal
\u6251	p\u016B	6	v	throw oneself at|pounce on|devote one's energies|flap|flutter|dab|pat|bend over
\u5929\u751F	ti\u0101n sh\u0113ng	7	d	nature|disposition|innate|natural
\u987B	x\u016B	7	d	beard|mustache|feeler|tassel|must|have to|wait
\u50AC	cu\u012B	7	v	urge|press|prompt|rush sb|hasten sth|expedite
\u5927\u80C6	d\xE0 d\u01CEn	5	a	brazen|audacious|outrageous|bold|daring|fearless
\u62B5\u8FBE	d\u01D0 d\xE1	6	v	arrive|reach
\u6539\u9769	g\u01CEi g\xE9	5	vn	reform
\u5047\u671F	ji\xE0 q\u012B	2	t	vacation
\u6E38\u5BA2	y\xF3u k\xE8	2	n	traveler|tourist|guest player
\u809D	g\u0101n	6	n	liver|grindy
\u602A\u7269	gu\xE0i wu	7	n	monster|freak|eccentric person
\u5634\u5DF4	zu\u01D0 ba	4	n	mouth|slap in the face
\u4E5F\u597D	y\u011B h\u01CEo	5	y	that's fine|may as well
\u7559\u8A00	li\xFA y\xE1n	6	n	leave a message|leave one's comments|message
\u767B\u9646	d\u0113ng l\xF9	7	v	land|come ashore|make landfall
\u5DE6\u8FB9	zu\u01D2 bian	1	f	left|left side|left of
\u626B	s\u01CEo	4	v	sweep|broom
\u5077\u5077	t\u014Du t\u014Du	5	d	stealthily|secretly|covertly|furtively|on the sly
\u544A\u522B	g\xE0o bi\xE9	3	v	leave|part from|bid farewell to|say goodbye to
\u7075\u611F	l\xEDng g\u01CEn	7	n	inspiration|insight
\u79D8\u4E66	m\xEC sh\u016B	4	n	secretary
\u62B9	m\u01D2	7	v	smear|wipe|erase|plaster|go around|skirt
\u5FFD\u7565	h\u016B lu:\xE8	6	v	neglect|overlook|ignore
\u62A5\u540D	b\xE0o m\xEDng	2	v	sign up|enter one's name|apply|register|enroll|enlist
\u6350	ju\u0101n	6	v	relinquish|abandon|contribute|donate|tax|levy
\u4F17\u591A	zh\xF2ng du\u014D	5	m	numerous
\u5367\u5BA4	w\xF2 sh\xEC	5	n	bedroom
\u5047\u88C5	ji\u01CE zhu\u0101ng	7	v	feign|pretend
\u5931\u8BEF	sh\u012B w\xF9	5	vn	lapse|mistake|make a mistake|fault|service fault
\u542B\u91CF	h\xE1n li\xE0ng	4	n	content|quantity contained
\u51B3\u4E0D	ju\xE9 b\xF9	5	d	not at all|simply not
\u62FF\u5230	n\xE1 d\xE0o	2	v	get|obtain
\u6B64\u6B21	c\u01D0 c\xEC	6	r	this time
\u810F	z\u0101ng	2	a	dirty|filthy|get dirty|viscera|organ
\u71C3\u70E7	r\xE1n sh\u0101o	4	v	ignite|combust|burn|combustion|flaming
\u9171	ji\xE0ng	6	n	marinated in soy paste|paste|jam
\u53CD\u590D	f\u01CEn f\xF9	3	d	repeatedly|over and over|upend|unstable|come and go|return
\u7259\u9F7F	y\xE1 ch\u01D0	7	n	tooth|dental
\u652F\u6491	zh\u012B ch\u0113ng	6	v	prop up|support|strut|brace
\u6781\u5176	j\xED q\xED	4	d	extremely
\u5C0A\u656C	z\u016Bn j\xECng	5	v	respect|revere|esteem|honorable|distinguished
\u4F9D\u65E7	y\u012B ji\xF9	5	z	as before|still
\u5168\u5BB6	qu\xE1n ji\u0101	2	n	whole family
\u6765\u4E34	l\xE1i l\xEDn	7	v	approach|come closer
\u5305\u88C5	b\u0101o zhu\u0101ng	5	n	pack|package|wrap|packaging
\u8FB9\u7F18	bi\u0101n yu\xE1n	6	n	edge|fringe|verge|brink|periphery|marginal|borderline
\u5143\u7D20	yu\xE1n s\xF9	6	n	element
\u65E5\u8BB0	r\xEC j\xEC	4	n	diary
\u5F3A\u8FEB	qi\u01CEng p\xF2	5	v	compel|force
\u656C	j\xECng	7	v	respectful|respect|offer politely
\u5F00\u901A	k\u0101i t\u014Dng	6	v	open|set up|launch|subscribe to|open-minded
\u522B\u5885	bi\xE9 sh\xF9	7	n	villa
\u589E	z\u0113ng	5	v	increase|augment|add to
\u5BA0\u7269	ch\u01D2ng w\xF9	6	n	house pet
\u56DB\u5904	s\xEC ch\xF9	6	d	all over the place|everywhere and all directions
\u6D6E	f\xFA	6	v	float|superficial|floating|unstable|movable|provisional|temporary|transient
\u9AD8\u6F6E	g\u0101o ch\xE1o	4	n	high tide|high water|upsurge|peak of activity|climax (of a story|competition etc)|have an orgasm
\u4ECE\u5C0F	c\xF3ng xi\u01CEo	2	d	from childhood|from a young age
\u7F1D	f\xE8ng	7	v	seam|crack|narrow slit|sew|stitch
\u5956\u54C1	ji\u01CEng p\u01D0n	7	n	award|prize
\u94BB\u77F3	zu\xE0n sh\xED	7	n	diamond
\u76F4\u5347\u673A	zh\xED sh\u0113ng j\u012B	6	n	helicopter
\u4ED3\u5E93	c\u0101ng k\xF9	6	n	depot|storehouse|warehouse
\u6709\u610F	y\u01D2u y\xEC	7	d	intend|intentionally|interested in
\u56DE\u987E	hu\xED g\xF9	5	v	look back|review
\u80A9	ji\u0101n	5	n	shoulder
\u540C\u60C5	t\xF3ng q\xEDng	4	v	sympathize with|sympathy
\u75C5\u60C5	b\xECng q\xEDng	6	n	state of an illness|patient's condition
\u524D\u63D0	qi\xE1n t\xED	5	n	premise|precondition|prerequisite
\u5C97\u4F4D	g\u01CEng w\xE8i	6	n	post|job
\u6A21\u4EFF	m\xF3 f\u01CEng	5	v	imitate|copy|emulate|mimic|model
\u78E8	m\xF3	6	v	rub|grind|polish|sharpen|wear down|die out|waste time|pester
\u7834\u4EA7	p\xF2 ch\u01CEn	4	v	go bankrupt|become impoverished|bankruptcy
\u6E05\u6D01	q\u012Bng ji\xE9	6	a	clean
\u5185\u8863	n\xE8i y\u012B	6	n	undergarment|underwear
\u70EB	t\xE0ng	7	v	scald|burn|blanch|perm|iron|scalding hot
\u8BF4\u4E0D\u5B9A	shu\u014D bu d\xECng	4	v	can't say for sure|maybe
\u7EDF\u6CBB	t\u01D2ng zh\xEC	7	vn	rule|govern|regime
\u88F8	lu\u01D2	7	g	naked
\u573A\u6240	ch\u01CEng su\u01D2	3	n	location|place
\u751C\u871C	ti\xE1n m\xEC	7	a	sweet|happy
\u7126\u70B9	ji\u0101o di\u01CEn	6	n	focal point|focus
\u81EA\u8C6A	z\xEC h\xE1o	5	a	proud
\u798F\u5229	f\xFA l\xEC	5	n	material benefit|benefit in kind|welfare
\u56DE\u5E94	hu\xED y\xECng	6	v	respond|response
\u4E0D\u53EF\u601D\u8BAE	b\xF9 k\u011B s\u012B y\xEC	7	l	inconceivable|unimaginable|unfathomable
\u5B81\u613F	n\xECng yu\xE0n	7	d	would rather
\u6545\u969C	g\xF9 zh\xE0ng	6	n	malfunction|breakdown|defect|shortcoming|fault|failure|impediment|error
\u8054\u8D5B	li\xE1n s\xE0i	6	n	league|league tournament
\u624B\u6CD5	sh\u01D2u f\u01CE	5	n	technique|trick|skill
\u6307\u8D23	zh\u01D0 z\xE9	5	v	criticize|find fault with|denounce
\u6311\u9009	ti\u0101o xu\u01CEn	4	v	choose|select
\u6210\u672C	ch\xE9ng b\u011Bn	5	n	costs
\u95EF	chu\u01CEng	5	v	rush|charge|dash|break through|temper oneself
\u4EB2\u4EBA	q\u012Bn r\xE9n	3	n	one's close relatives
\u62FC\u547D	p\u012Bn m\xECng	7	d	do one's utmost|with all one's might|at all costs
\u514D\u75AB	mi\u01CEn y\xEC	7	vn	immunity
\u6212\u6307	ji\xE8 zhi	7	n	ring
\u5904\u5728	ch\u01D4 z\xE0i	5	v	be situated at|find oneself at
\u901B	gu\xE0ng	4	v	stroll|visit
\u4E0A\u6F14	sh\xE0ng y\u01CEn	6	v	screen|stage|screening|staging
\u9AA8\u6298	g\u01D4 zh\xE9	7	v	suffer a fracture|break|fracture
\u5355\u7EAF	d\u0101n ch\xFAn	4	a	simple|pure|unsophisticated|merely|purely
\u65E9\u5DF2	z\u01CEo y\u01D0	3	d	for a long time|long since|in the past
\u7761\u7720	shu\xEC mi\xE1n	5	v	sleep|enter sleep mode
\u5272	g\u0113	7	v	cut|cut apart
\u521D\u6B65	ch\u016B b\xF9	3	d	initial|preliminary|tentative
\u6E23	zh\u0101	6	g	slag|dregs
\u6BD4\u4F8B	b\u01D0 l\xEC	3	n	proportion|scale
\u5B63\u8282	j\xEC ji\xE9	4	n	time|season|period
\u8F93\u5165	sh\u016B r\xF9	3	v	import|input
\u5047\u8BBE	ji\u01CE sh\xE8	7	v	suppose|presume|assume|supposing that|if|hypothesis|conjecture
\u56F0\u6270	k\xF9n r\u01CEo	5	v	perplex|disturb|cause complications
\u4FDD\u4F51	b\u01CEo y\xF2u	7	v	bless and protect|blessing
\u5207\u9664	qi\u0113 ch\xFA	7	v	excise|cut out
\u5E03\u7F6E	b\xF9 zh\xEC	4	v	put in order|arrange|decorate|fix up|deploy
\u6B3A\u8D1F	q\u012B fu	6	v	bully
\u706F\u5149	d\u0113ng gu\u0101ng	4	n	lighting|light
\u4F18\u5148	y\u014Du xi\u0101n	5	v	have priority|take precedence
\u8272\u5F69	s\xE8 c\u01CEi	4	n	tint|coloring|coloration|flavor|character
\u597D\u7B11	h\u01CEo xi\xE0o	7	a	laughable|funny|ridiculous
\u7D27\u7D27	j\u01D0n j\u01D0n	5	d	closely|tightly
\u540A	di\xE0o	6	v	suspend|hang up|hang a person|string of 100 cash|lament|condole with
\u624B\u81C2	sh\u01D2u b\xEC	7	n	arm|helper
\u9003\u907F	t\xE1o b\xEC	7	v	escape|evade|avoid|shirk
\u7EA7\u522B	j\xED bi\xE9	7	n	rank|level|grade
\u643A\u5E26	xi\xE9 d\xE0i	7	v	carry|support|taiwan pr
\u9971	b\u01CEo	2	a	eat till full|satisfied
\u5065\u8EAB	ji\xE0n sh\u0113n	4	vn	exercise|keep fit|work out|physical exercise
\u51CF\u8F7B	ji\u01CEn q\u012Bng	5	v	lighten|ease|alleviate
\u52B3\u52A8	l\xE1o d\xF2ng	5	vn	work|toil|physical labor
\u521B\u65B0	chu\xE0ng x\u012Bn	3	v	bring forth new ideas|blaze new trails|innovation
\u805A\u96C6	j\xF9 j\xED	7	v	assemble|gather
\u603B\u7ED3	z\u01D2ng ji\xE9	3	v	sum up|conclude|summary|r\xE9sum\xE9
\u6307\u5B9A	zh\u01D0 d\xECng	6	v	appoint|assign|designated
\u4E8B\u5148	sh\xEC xi\u0101n	4	d	in advance|before the event|beforehand|prior
\u5931\u4E1A	sh\u012B y\xE8	4	v	unemployment|lose one's job
\u65E0\u6548	w\xFA xi\xE0o	6	v	not valid|ineffective|in vain
\u764C\u75C7	\xE1i zh\xE8ng	7	n	cancer
\u878D\u5165	r\xF3ng r\xF9	6	v	blend into|integrate|assimilate|merge
\u7A7A\u8C03	k\u014Dng ti\xE1o	3	n	air conditioning|air conditioner
\u4E00\u5171	y\u012B g\xF2ng	2	d	altogether
\u732E	xi\xE0n	5	v	offer|present|dedicate|donate|show|put on display|worthy person
\u5357\u90E8	n\xE1n b\xF9	3	f	southern part
\u610F\u5FD7	y\xEC zh\xEC	5	n	will|willpower|determination
\u65B0\u4EBA	x\u012Bn r\xE9n	6	n	newcomer|fresh talent|newlywed, esp. new bride|bride and groom|homo sapiens
\u6FC0\u52B1	j\u012B l\xEC	7	v	encourage|urge|motivation|incentive
\u575A\u5B9A	ji\u0101n d\xECng	5	a	firm|steady|staunch|resolute
\u6708\u4EAE	yu\xE8 liang	2	n	moon
\u7C92	l\xEC	7	q	grain|granule
\u521A\u597D	g\u0101ng h\u01CEo	6	d	just|exactly|happen to be
\u516C\u65A4	g\u014Dng j\u012Bn	2	q	kilogram
\u89C4\u5F8B	gu\u012B l\u01DC	4	n	rule|law of behavior|regular pattern|rhythm|discipline
\u5F85\u9047	d\xE0i y\xF9	4	n	treatment|pay|salary|status|rank
\u6BD4\u5206	b\u01D0 f\u0113n	4	n	score
\u6DE1	d\xE0n	4	a	insipid|diluted|weak|mild|light in color|tasteless|indifferent
\u8BB8\u53EF	x\u01D4 k\u011B	5	vn	allow|permit
\u9AD8\u5C42	g\u0101o c\xE9ng	6	n	high-rise|high level|high class
\u707E\u96BE	z\u0101i n\xE0n	5	n	disaster|catastrophe
\u98DE\u8239	f\u0113i chu\xE1n	6	n	spaceship|spacecraft|dirigible|airship
\u5B64\u513F	g\u016B \xE9r	6	n	orphan
\u4EE5\u4FBF	y\u01D0 bi\xE0n	5	d	so that|so as to|in order to
\u4E0E\u6B64\u540C\u65F6	y\u01D4 c\u01D0 t\xF3ng sh\xED	7	c	at the same time|meanwhile
\u6253\u6270	d\u01CE r\u01CEo	5	v	disturb|bother|trouble
\u6C5F	ji\u0101ng	4	nr	river
\u4E0A\u4E0B	sh\xE0ng xi\xE0	5	f	up and down|top and bottom|old and young|length|about
\u5E7D\u9ED8	y\u014Du m\xF2	5	a	humor|humorous
\u65E0\u8BBA\u5982\u4F55	w\xFA l\xF9n r\xFA h\xE9	7	l	whatever the case|in any event|no matter what|by all possible means
\u519B\u4EBA	j\u016Bn r\xE9n	5	n	serviceman|soldier|military personnel
\u529E\u4E8B	b\xE0n sh\xEC	4	v	handle|work
\u5B9A\u4E49	d\xECng y\xEC	7	n	definition|define
\u5851\u6599	s\xF9 li\xE0o	4	n	plastics
\u505A\u68A6	zu\xF2 m\xE8ng	4	v	dream|have a dream|fig. illusion|fantasy|pipe dream
\u56FE\u50CF	t\xFA xi\xE0ng	7	n	image|picture|graphic
\u6B63\u5F53	zh\xE8ng d\xE0ng	6	a	honest|reasonable|fair|sensible|timely|just
\u9017	d\xF2u	7	v	tease|entice|joke|funny|amusing|stay|sojourn
\u4FEE\u590D	xi\u016B f\xF9	5	v	restore|renovate|repair
\u98D8	pi\u0101o	7	v	float
\u6709\u7528	y\u01D2u y\xF2ng	1	a	useful
\u6E05\u9664	q\u012Bng ch\xFA	7	v	clear away|eliminate|get rid of
\u6323\u624E	zh\u0113ng zh\xE1	7	v	struggle
\u5E38\u89C4	ch\xE1ng gu\u012B	6	n	code of conduct|conventions|common practice|routine
\u4F9D\u8D56	y\u012B l\xE0i	6	v	depend on|be dependent on
\u6B64\u4E8B	c\u01D0 sh\xEC	6	r	this matter
\u6CA1\u7528	m\xE9i y\xF2ng	3	v	useless
\u7269\u7406	w\xF9 l\u01D0	5	n	physics|physical
\u673A\u5668\u4EBA	j\u012B q\xEC r\xE9n	5	n	robot|android
\u5206\u6563	f\u0113n s\xE0n	4	v	scatter|disperse|distribute
\u8BEF	w\xF9	6	v	mistake|error|miss|harm|delay|neglect|mistakenly
\u53E6\u4E00\u65B9\u9762	l\xECng y\u012B f\u0101ng mi\xE0n	3	c	on the other hand|another aspect
\u6DFB	ti\u0101n	6	v	add|increase|replenish
\u5C65\u884C	l\u01DA x\xEDng	7	v	fulfill|carry out|implement|perform
\u524D\u9014	qi\xE1n t\xFA	4	n	prospects|future outlook|journey
\u5668\u5B98	q\xEC gu\u0101n	4	n	organ|apparatus
\u634F	ni\u0113	7	v	pinch|mold|hold|join together|fabricate (a story|report, etc)
\u7ADE\u8D5B	j\xECng s\xE0i	5	vn	compete|race|contest|competition|match
\u4E89\u593A	zh\u0113ng du\xF3	6	v	fight over|contest|vie over
\u88AB\u8FEB	b\xE8i p\xF2	4	d	be compelled|be forced
\u5206\u88C2	f\u0113n li\xE8	6	v	split up|divide|break up|fission|schism
\u626B\u63CF	s\u01CEo mi\xE1o	7	vn	scan
\u8425\u517B	y\xEDng y\u01CEng	3	n	nutrition|nourishment
\u7A7A\u519B	k\u014Dng j\u016Bn	6	n	air force
\u7406\u5FF5	l\u01D0 ni\xE0n	7	n	idea|concept|philosophy|theory
\u6392\u540D	p\xE1i m\xEDng	3	v	rank|ranking
\u51FA\u4E8B	ch\u016B sh\xEC	6	v	have an accident|meet with a mishap
\u9891\u7387	p\xEDn l\u01DC	7	n	frequency
\u4E92\u8054\u7F51	H\xF9 li\xE1n w\u01CEng	3	n	internet
\u9003\u8DD1	t\xE1o p\u01CEo	5	v	flee from sth|run away|escape
\u5317\u65B9	b\u011Bi f\u0101ng	2	s	north|northern part a country
\u5E73\u7B49	p\xEDng d\u011Bng	2	a	equal|equality
\u62A5\u590D	b\xE0o f\xF9	7	v	make reprisals|retaliate|revenge|retaliation
\u7EA4\u7EF4	xi\u0101n w\xE9i	7	n	fiber
\u8BEF\u4F1A	w\xF9 hu\xEC	4	v	misunderstand|mistake|misunderstanding
\u62A4\u7406	h\xF9 l\u01D0	7	vn	nurse|tend and protect
\u7F50	gu\xE0n	7	g	can|jar|pot
\u91C7	c\u01CEi	7	v	pick|pluck|collect|select|choose|gather|color|complexion
\u884C\u674E	x\xEDng li	3	n	luggage
\u63D0\u8BAE	t\xED y\xEC	7	n	proposal|suggestion|propose|suggest
\u8BF4\u670D	shu\u014D f\xFA	4	v	persuade|convince|talk sb over|taiwan pr
\u53F0\u4E0A	t\xE1i sh\xE0ng	4	s	on stage
\u4F17\u4EBA	zh\xF2ng r\xE9n	7	n	everyone
\u4FDD\u5B88	b\u01CEo sh\u01D2u	4	a	conservative|guard|keep
\u5F53\u665A	d\u0101ng w\u01CEn	7	t	on that evening|same evening
\u7231\u597D	\xE0i h\xE0o	1	n	like|be fond of|take pleasure in|be keen on|interest|hobby
\u81EA\u613F	z\xEC yu\xE0n	5	v	voluntary
\u661F\u661F	x\u012Bng xing	2	n	star|stars in the sky
\u83B7\u53D6	hu\xF2 q\u01D4	4	v	gain|get|acquire
\u62B1\u6B49	b\xE0o qi\xE0n	6	a	be sorry|feel apologetic|sorry
\u53D6\u51B3\u4E8E	q\u01D4 ju\xE9 y\xFA	7	v	hinge on|be decided by|depend on
\u6297\u8BAE	k\xE0ng y\xEC	6	v	protest
\u5E08\u5085	sh\u012B fu	5	n	master|qualified worker
\u8F6E\u80CE	l\xFAn t\u0101i	7	n	tire|pneumatic tire
\u4E0D\u5927	b\xF9 d\xE0	1	d	not very|not too|not often
\u94DC	t\xF3ng	7	n	copper
\u6697\u793A	\xE0n sh\xEC	4	v	hint|suggest|suggestion
\u5C16	ji\u0101n	6	a	pointed|tapering|sharp|shrill|piercing|acute|keen|make shrill
\u6735	du\u01D2	5	q	flower|earlobe
\u7BAD	ji\xE0n	6	n	arrow
\u6210\u4EBA	ch\xE9ng r\xE9n	4	n	adult
\u8DDD	j\xF9	7	p	at a distance of|distance|be apart
\u539F\u59CB	yu\xE1n sh\u01D0	5	a	first|original|primitive
\u52AB	ji\xE9	7	v	rob|plunder|seize by force|coerce|calamity
\u76D1\u7BA1	ji\u0101n gu\u01CEn	7	vn	oversee|take charge of|supervise|administer|supervisory|supervision
\u603B\u7B97	z\u01D2ng su\xE0n	5	d	at long last|finally|on the whole
\u6C7D\u6CB9	q\xEC y\xF3u	4	n	gasoline
\u8C08\u8BBA	t\xE1n l\xF9n	7	v	discuss|talk about
\u94A2\u7434	g\u0101ng q\xEDn	5	n	piano
\u6761\u4F8B	ti\xE1o l\xEC	7	n	regulations|rules|code of conduct|ordinances|statutes
\u4F20\u9012	chu\xE1n d\xEC	5	v	transmit|transitive
\u626D	ni\u01D4	6	v	turn|twist|wring|sprain|swing one's hips
\u6D53	n\xF3ng	4	a	concentrated|dense|strong
\u591A\u4E91	du\u014D y\xFAn	2		cloudy
\u76D1\u89C6	ji\u0101n sh\xEC	7	v	monitor|surveillance
\u8F6C\u6362	zhu\u01CEn hu\xE0n	5	v	change|switch|convert|transform
\u642D\u914D	d\u0101 p\xE8i	6	v	pair up|match|arrange in pairs
\u51C0	j\xECng	6	a	clean|completely|only|net|painted face male role
\u6D3B\u8DC3	hu\xF3 yu\xE8	6	v	active|lively|excited|enliven|brighten up
\u871C	m\xEC	7	n	honey
\u7126	ji\u0101o	7	a	burnt|scorched|charred|worried|anxious|coke
\u6BDB\u75C5	m\xE1o b\xECng	3	n	fault|defect|shortcomings|ailment
\u6CBF	y\xE1n	6	p	along|follow|carry on|trim|border|edge
\u8BDE\u751F	d\xE0n sh\u0113ng	6	v	be born
\u573A\u5408	ch\u01CEng h\xE9	3	n	situation|occasion|context|setting|location|venue
\u903B\u8F91	lu\xF3 ji	5	n	logic
\u8138\u8272	li\u01CEn s\xE8	5	n	complexion|look
\u7528\u54C1	y\xF2ng p\u01D0n	6	n	articles for use|products|goods
\u62C5\u4FDD	d\u0101n b\u01CEo	4	vn	guarantee|vouch for
\u5348\u996D	w\u01D4 f\xE0n	1	n	lunch
\u886C\u886B	ch\xE8n sh\u0101n	3	n	shirt|blouse
\u9EBB	m\xE1	7	n	sesame|rough or coarse|pocked|pitted|feel numb|hemp
\u6536\u8D2D	sh\u014Du g\xF2u	5	v	purchase|acquire
\u5BBE\u9986	b\u012Bn gu\u01CEn	5	n	guesthouse|lodge|hotel
\u5019\u9009\u4EBA	h\xF2u xu\u01CEn r\xE9n	7	n	candidate
\u91CD\u5EFA	ch\xF3ng ji\xE0n	6	v	rebuild|reestablish|reconstruction|rebuilding
\u64C5\u957F	sh\xE0n ch\xE1ng	7	v	be good at|be expert in
\u5154\u5B50	t\xF9 zi	5	n	hare|rabbit
\u7ED1	b\u01CEng	7	v	tie|bind or fasten together|kidnap
\u4E0D\u6EE1	b\xF9 m\u01CEn	2	an	resentful|discontented|dissatisfied
\u544A\u77E5	g\xE0o zh\u012B	7	v	inform
\u9634\u8C0B	y\u012Bn m\xF3u	6	n	conspire|plot|conspiracy
\u5F2F	w\u0101n	4	v	bend|bent|turn
\u4E32	chu\xE0n	6	q	string together|skewer|connect wrongly|gang up|rove|string|bunch|move across
\u4FDD\u536B	b\u01CEo w\xE8i	5	v	defend|safeguard
\u65E0\u8F9C	w\xFA g\u016B	7	n	innocent|innocence|not guilty
\u6A2A	h\xE9ng	6	g	horizontal|across|crosswise|horizontal stroke|place flat|cross|in a jumble|chaotic
\u78C5	b\xE0ng	7	q	scale|weigh|pound|point
\u770B\u597D	k\u0101n h\u01CEo	6	v	keep an eye on
\u8C0E\u8A00	hu\u01CEng y\xE1n	7	n	lie
\u955C\u5B50	j\xECng zi	4	n	mirror
\u58F0\u79F0	sh\u0113ng ch\u0113ng	7	v	claim|state|proclaim|assert
\u80CC\u53DB	b\xE8i p\xE0n	7	v	betray
\u5FFD\u89C6	h\u016B sh\xEC	4	v	neglect|overlook|disregard|ignore
\u5BC6\u5207	m\xEC qi\xE8	4	ad	close|familiar|intimate|closely|foster close ties|pay close attention
\u773C\u5149	y\u01CEn gu\u0101ng	5	n	gaze|insight|foresight|vision
\u5E1D\u56FD	d\xEC gu\xF3	7	n	empire|imperial
\u5360\u636E	zh\xE0n j\xF9	6	v	occupy|hold
\u54F2\u5B66	zh\xE9 xu\xE9	6	n	philosophy
\u5938\u5F20	ku\u0101 zh\u0101ng	7	v	exaggerate|overstated|exaggerated|hyperbole|excessive|ridiculous|outrageous
\u5149\u660E	gu\u0101ng m\xEDng	3	n	light|radiance|bright|openhearted
\u4ECB\u5165	ji\xE8 r\xF9	7	v	intervene|get involved
\u4F8B\u5B50	l\xEC zi	2	n	case|instance|example
\u4E00\u6D41	y\u012B li\xFA	5	b	top quality|front ranking
\u7247\u5B50	pi\u0101n zi	7	n	film|movie|film reel|phonograph record|x-ray image|thin flake|small piece
\u7BA1\u9053	gu\u01CEn d\xE0o	6	n	tubing|pipeline|channel|means
\u80A1\u4EFD	g\u01D4 f\xE8n	7	n	share|stock
\u5F00\u5DE5	k\u0101i g\u014Dng	7	v	begin work|start a construction job
\u85AF\u6761	sh\u01D4 ti\xE1o	6	n	french fries|french fried potatoes|chips
\u4F4E\u8C03	d\u012B di\xE0o	7	n	low pitch|quiet|subdued|low-key|low-profile
\u5149\u8363	gu\u0101ng r\xF3ng	5	a	honor and glory|glorious
\u51F6\u624B	xi\u014Dng sh\u01D2u	6	n	murderer|assassin
\u5361\u8F66	k\u01CE ch\u0113	7	n	truck
\u62DB\u547C	zh\u0101o hu	4	v	call out to|greet|say hello to|inform|take care of
\u8D76\u4E0A	g\u01CEn sh\xE0ng	6	v	keep up with|catch up with|overtake|chance upon|in time for
\u5609\u5BBE	ji\u0101 b\u012Bn	6	n	esteemed guest|honored guest|guest
\u5408\u683C	h\xE9 g\xE9	3	v	meet the standard required|qualified|eligible
\u65F6\u88C5	sh\xED zhu\u0101ng	6	n	fashion|fashionable clothes
\u8C61\u5F81	xi\xE0ng zh\u0113ng	5	n	emblem|symbol|token|badge|symbolize|signify|stand for
\u6548\u5E94	xi\xE0o y\xECng	7	n	effect
\u4F18	y\u014Du	7	g	excellent|superior
\u5C0F\u578B	xi\u01CEo x\xEDng	4	b	small scale|small size
\u5C04\u51FB	sh\xE8 j\u012B	5	v	shoot|fire
\u7B79	ch\xF3u	7	v	chip|token|ticket|prepare|plan|raise|resource|way
\u8F90\u5C04	f\xFA sh\xE8	7	v	radiation
\u529F	g\u014Dng	7	n	meritorious deed or service|achievement|result|service|accomplishment|work
\u4E1C\u90E8	d\u014Dng b\xF9	3	f	east|eastern part
\u638F	t\u0101o	6	v	fish out|scoop
\u8DB4	p\u0101	7	v	lie on one's stomach|percent
\u8D4C\u535A	d\u01D4 b\xF3	6	v	gamble
\u4EB2\u621A	q\u012Bn qi	7	n	relative
\u80F8\u90E8	xi\u014Dng b\xF9	4	n	chest|bosom
\u8BA4\u53EF	r\xE8n k\u011B	3	v	approve|approval|acknowledgment|ok
\u5230\u4F4D	d\xE0o w\xE8i	7	v	be in place|be in position|precise|well
\u6D89\u5ACC	sh\xE8 xi\xE1n	7	v	be a suspect|be suspected of
\u6559\u5BA4	ji\xE0o sh\xEC	2	n	classroom
\u59DC	ji\u0101ng	7	nr	ginger
\u672C\u8D28	b\u011Bn zh\xEC	6	n	essence|nature|innate character|intrinsic quality
\u63D0\u95EE	t\xED w\xE8n	3	vn	question|quiz|grill
\u5F55\u53D6	l\xF9 q\u01D4	4	v	admit|hire
\u80A1\u4E1C	g\u01D4 d\u014Dng	6	n	shareholder|stockholder
\u4E0A\u8F66	sh\xE0ng ch\u0113	1	v	get on or into
\u6B8B\u9177	c\xE1n k\xF9	6	a	cruel|cruelty
\u5BA2\u6C14	k\xE8 qi	5	a	polite|courteous|formal|modest
\u6CBB\u6108	zh\xEC y\xF9	7	v	cure|restore to health|uplifting|heartwarming
\u6D45	qi\u01CEn	4	a	shallow|light|sound of moving water
\u7434	q\xEDn	5	n	musical instrument in general
\u6643	hu\xE0ng	7	v	sway|shake|wander about|dazzle|flash past
\u72B9\u8C6B	y\xF3u y\xF9	5	a	hesitate
\u4E2D\u6BD2	zh\xF2ng d\xFA	5	v	be poisoned
\u5B9E\u8DF5	sh\xED ji\xE0n	6	v	practice|put into practice|live up to|carry out
\u597D\u8F6C	h\u01CEo zhu\u01CEn	6	v	improve|improvement
\u5F53\u524D	d\u0101ng qi\xE1n	5	t	present time|be faced with
\u95F7	m\xE8n	7	v	bored|depressed|melancholy|sealed|airtight|tightly closed|stuffy|shut indoors
\u5C0F\u5077	xi\u01CEo t\u014Du	5	n	thief
\u6233	chu\u014D	7	v	jab|poke|stab|sprain|blunt|fuck|stand|stand upright
\u66DD\u5149	b\xE0o gu\u0101ng	7	v	expose|exposure|taiwan pr
\u5BB6\u5C5E	ji\u0101 sh\u01D4	3	n	family member|dependent
\u6D51\u8EAB	h\xFAn sh\u0113n	7	n	all over|from head to foot
\u9A6C\u8DEF	m\u01CE l\xF9	1	n	street|road
\u575A\u51B3	ji\u0101n ju\xE9	3	ad	firm|resolute|determined
\u65E9\u671F	z\u01CEo q\u012B	5	t	early period|early phase|early stage
\u5BAA\u6CD5	xi\xE0n f\u01CE	7	n	constitution
\u96BE\u5F97	n\xE1n d\xE9	5	a	seldom|rare|hard to come by
\u9489	d\xECng	7	v	nail|pin|staple|sew on|follow closely|keep at sb
\u4F20\u6765	chu\xE1n l\xE1i	3	v	come through|be heard|arrive
\u8BB2\u8FF0	ji\u01CEng sh\xF9	7	v	talk about|narrate|give an account
\u5FEB\u8981	ku\xE0i y\xE0o	2	d	about to
\u4E1C\u65B9	D\u014Dng f\u0101ng	2	s	east|orient|two-character surname dongfang
\u9632\u5FA1	f\xE1ng y\xF9	7	vn	defense|defend
\u5916\u8868	w\xE0i bi\u01CEo	7	n	external|outside|outward appearance
\u8D5B\u8F66	s\xE0i ch\u0113	7	n	auto race|cycle race|race car
\u95E8\u7968	m\xE9n pi\xE0o	1	n	ticket
\u4EBA\u683C	r\xE9n g\xE9	7	n	personality|integrity|dignity
\u4ECE\u524D	c\xF3ng qi\xE1n	3	t	previously|formerly|once upon a time
\u65E5\u5E38	r\xEC ch\xE1ng	3	b	day-to-day|daily|everyday
\u5341\u8DB3	sh\xED z\xFA	5	z	ample|complete|hundred percent|pure shade
\u5FE0\u8BDA	zh\u014Dng ch\xE9ng	7	a	devoted|loyal|fidelity|loyalty
\u6740\u5BB3	sh\u0101 h\xE0i	7	v	murder
\u8150\u8D25	f\u01D4 b\xE0i	7	an	corruption|corrupt|rot|rotten
\u6DF1\u5904	sh\u0113n ch\xF9	5	s	abyss|depths
\u529B\u6C14	l\xEC qi	4	n	strength
\u53D1\u4F5C	f\u0101 zu\xF2	7	v	flare up|break out
\u9707\u64BC	zh\xE8n h\xE0n	7	v	shake|shock|stun|shocking|stunning
\u9274\u4E8E	ji\xE0n y\xFA	7	p	in view of|seeing that|considering|whereas
\u7A97\u53E3	chu\u0101ng k\u01D2u	6	s	window|opening providing restricted access|computer operating system window|fig. medium|intermediary|showpiece|testing ground
\u5E38\u89C1	ch\xE1ng ji\xE0n	2	a	commonly seen|common|see sth frequently
\u697C\u68AF	l\xF3u t\u012B	4	n	stair|staircase
\u5C40\u52BF	j\xFA sh\xEC	7	n	situation|state
\u8001\u5B9E	l\u01CEo shi	4	ad	honest|sincere|well-behaved|naive|gullible
\u9B42	h\xFAn	7	n	soul|spirit|immortal soul
\u96A7\u9053	su\xEC d\xE0o	7	n	tunnel
\u503A	zh\xE0i	6	n	debt
\u635F\u5BB3	s\u01D4n h\xE0i	5	v	harm|damage|impair
\u52BF\u529B	sh\xEC li	5	n	power|influence|force
\u54C1\u8D28	p\u01D0n zh\xEC	4	n	character|intrinsic quality|quality
\u5C1A\u672A	sh\xE0ng w\xE8i	7	d	not yet|still not
\u7F3A\u70B9	qu\u0113 di\u01CEn	3	n	weak point|fault|shortcoming|disadvantage
\u8BBE\u7ACB	sh\xE8 l\xEC	3	v	set up|establish
\u6291\u5236	y\xEC zh\xEC	7	v	inhibit|keep down|suppress
\u6307\u6570	zh\u01D0 sh\xF9	6	n	index|exponent|exponential
\u9884\u9632	y\xF9 f\xE1ng	3	v	prevent|take precautions against|protect|guard against|precautionary|prophylactic
\u7CBE\u5FC3	j\u012Bng x\u012Bn	7	ad	with utmost care|fine|meticulous|detailed
\u6548\u7387	xi\xE0o l\u01DC	4	n	efficiency
\u63D0\u540D	t\xED m\xEDng	7	v	nominate
\u6781\u7AEF	j\xED du\u0101n	6	n	extreme
\u7406\u6027	l\u01D0 x\xECng	7	n	reason|rationality|rational
\u8010	n\xE0i	7	v	bear|endure|withstand
\u9E70	y\u012Bng	7	n	eagle|falcon|hawk
\u60C5\u666F	q\xEDng j\u01D0ng	4	n	scene|spectacle|circumstances|situation
\u670D\u7528	f\xFA y\xF2ng	7	v	take
\u5FC5\u7136	b\xEC r\xE1n	3	d	inevitable|certain|necessity
\u6D41\u6C13	li\xFA m\xE1ng	7	n	rogue|hoodlum|gangster|immoral behavior
\u5F71\u50CF	y\u01D0ng xi\xE0ng	7	n	image
\u73CD\u8D35	zh\u0113n gu\xEC	5	a	precious
\u8D54	p\xE9i	5	v	compensate for loss|indemnify|suffer a financial loss
\u7565	lu:\xE8	7	d	brief|sketchy|outline|summary|omit|bit|somewhat|slightly
\u673A\u7968	j\u012B pi\xE0o	1	n	air ticket|passenger ticket
\u9057\u4EA7	y\xED ch\u01CEn	4	n	heritage|legacy|inheritance|bequest
\u7ADE\u9009	j\xECng xu\u01CEn	7	vn	run for office
\u7406\u667A	l\u01D0 zh\xEC	6	n	reason|intellect|rationality|rational
\u98CE\u66B4	f\u0113ng b\xE0o	6	n	storm|violent commotion|fig. crisis
\u6458	zh\u0101i	5	v	take|borrow|pick|pluck|select|remove|take off
\u6241	bi\u01CEn	6	a	flat|beat up|small boat
\u5199\u4F5C	xi\u011B zu\xF2	3	v	write|compose|writing|written works
\u5546\u4EBA	sh\u0101ng r\xE9n	2	n	merchant|businessman
\u64A4	ch\xE8	7	v	remove|take away
\u6350\u8D60	ju\u0101n z\xE8ng	6	v	contribute|donate|benefaction
\u7CDF	z\u0101o	5	a	dregs|draff|pickled in wine|rotten|messy|ruined
\u5475	h\u0113	6	y	expel breath|my goodness
\u7740\u624B	zhu\xF3 sh\u01D2u	7	v	set out
\u6307\u671B	zh\u01D0 w\xE0ng	7	v	count on|hope for|prospect|hope
\u7687\u5E1D	hu\xE1ng d\xEC	6	n	emperor
\u4E1A\u4F59	y\xE8 y\xFA	4	b	in one's spare time|outside working hours|amateur
\u642D\u6863	d\u0101 d\xE0ng	6	n	cooperate|partner
\u5C11\u6570	sh\u01CEo sh\xF9	2	m	small number|few|minority
\u5B66\u8005	xu\xE9 zh\u011B	5	n	scholar
\u53E4\u8001	g\u01D4 l\u01CEo	5	a	ancient|old|age-old
\u4F7F\u547D	sh\u01D0 m\xECng	7	n	mission|calling
\u6CA1\u9519	m\xE9i cu\xF2	4	v	that's right|sure|rest assured|that's good|can't go wrong
\u8BAE\u4F1A	y\xEC hu\xEC	7	n	parliament|legislative assembly
\u4EA4\u8C08	ji\u0101o t\xE1n	7	v	discuss|converse|chat|discussion
\u6B8B\u5FCD	c\xE1n r\u011Bn	7	a	cruel|mean|merciless|ruthless
\u6DF1\u6DF1	sh\u0113n sh\u0113n	6	d	deep|profound
\u8EAB\u9AD8	sh\u0113n g\u0101o	4	n	height
\u5012\u9709	d\u01CEo m\xE9i	7	a	have bad luck|be out of luck
\u53D6\u4EE3	q\u01D4 d\xE0i	7	v	replace|supersede|supplant|substitution
\u80F3\u818A	g\u0113 bo	7	n	arm
\u6A21\u62DF	m\xF3 n\u01D0	7	vn	imitation|simulate|imitate|analog
\u4F4F\u5B85	zh\xF9 zh\xE1i	6	n	residence|dwelling|abode
\u5371\u5BB3	w\u0113i h\xE0i	3	v	jeopardize|harm|endanger|harmful effect|damage
\u5BF9\u6BD4	du\xEC b\u01D0	4	vn	contrast|ratio
\u624B\u7EED	sh\u01D2u x\xF9	3	n	procedure|formalities
\u5B63\u5EA6	j\xEC d\xF9	4	n	quarter of a year|season
\u6444\u5F71\u5E08	sh\xE8 y\u01D0ng sh\u012B	5	n	photographer|cameraman
\u697C\u4E0A	l\xF3u sh\xE0ng	1	s	upstairs
\u4E27\u5931	s\xE0ng sh\u012B	6	v	lose|forfeit
\u56DB\u5468	s\xEC zh\u014Du	5	f	all around
\u4E89\u8BBA	zh\u0113ng l\xF9n	4	v	argue|debate|contend|argument|contention|controversy
\u51AC	d\u014Dng	3	tg	beating a drum|rat-a-tat|winter
\u50BB\u74DC	sh\u01CE gu\u0101	7	n	idiot|fool
\u8FFD\u8E2A	zhu\u012B z\u014Dng	7	v	follow a trail|trace|pursue
\u4F11\u95F2	xi\u016B xi\xE1n	5	vn	leisure|relaxation|not working|idle|enjoy leisure|lie fallow
\u8D70\u8FC7	z\u01D2u gu\xF2	2	v	walk past|pass by
\u4FDD\u5BC6	b\u01CEo m\xEC	4	v	keep sth confidential|maintain secrecy
\u65CB\u8F6C	xu\xE1n zhu\u01CEn	6	v	rotate|revolve|spin|whirl
\u541E	t\u016Bn	6	v	swallow|take
\u81F4\u547D	zh\xEC m\xECng	7	v	fatal|mortal|deadly|sacrifice one's life
\u53CD\u6297	f\u01CEn k\xE0ng	6	v	resist|rebel
\u7B49\u7EA7	d\u011Bng j\xED	5	n	grade|rank|status
\u7B7E\u5B57	qi\u0101n z\xEC	5	v	sign|signature
\u620F\u5267	x\xEC j\xF9	5	n	drama|play|theater|script of a play
\u8D44\u52A9	z\u012B zh\xF9	5	v	subsidize|provide financial aid|subsidy
\u8D5E\u52A9	z\xE0n zh\xF9	4	v	support|assist|sponsor
\u6B63\u9762	zh\xE8ng mi\xE0n	7	d	front|obverse side|right side|positive|direct|open
\u96BE\u602A	n\xE1n gu\xE0i	7	d	no wonder|not surprising
\u5305\u56F4	b\u0101o w\xE9i	5	v	surround|encircle|hem in
\u7389	y\xF9	4	n	jade
\u56F4\u7ED5	w\xE9i r\xE0o	5	v	revolve around|center on
\u9694\u79BB	g\xE9 l\xED	7	vn	separate|isolate
\u4EBA\u6027	r\xE9n x\xECng	7	n	human nature|humanity|human|totality of human attributes
\u4EBA\u9009	r\xE9n xu\u01CEn	7	n	choice of person|candidate
\u6BEB\u4E0D	h\xE1o b\xF9	7	d	hardly|not in the least|not at all
\u9694\u58C1	g\xE9 b\xEC	5	s	next door|neighbor
\u4F5C\u98CE	zu\xF2 f\u0113ng	7	n	style|style of work|way
\u6B6A	w\u0101i	7	a	askew|at a crooked angle|devious|noxious|lie on one's side|sprain
\u7F8E\u5999	m\u011Bi mi\xE0o	7	a	beautiful|wonderful|splendid
\u529E\u516C	b\xE0n g\u014Dng	6	vn	handle official business|work
\u5728\u5185	z\xE0i n\xE8i	5	u	in it|among them
\u8DEA	gu\xEC	6	v	kneel
\u4E3E\u52A8	j\u01D4 d\xF2ng	5	n	act|action|activity|move|movement
\u51FA\u8840	ch\u016B xu\xE8	7	v	bleed|bleeding
\u7EC6\u83CC	x\xEC j\u016Bn	6	n	bacterium|germ
\u5916\u4EA4	w\xE0i ji\u0101o	3	n	diplomacy|diplomatic|foreign affairs
\u6253\u8D25	d\u01CE b\xE0i	4	v	defeat|overpower|beat|be defeated
\u68C9	mi\xE1n	6	g	cotton
\u7F29\u5C0F	su\u014D xi\u01CEo	4	v	reduce|decrease|shrink
\u60C5\u4FA3	q\xEDng l\u01DA	7	n	sweethearts|lovers
\u542B\u6709	h\xE1n y\u01D2u	4	v	contain|including
\u672C\u4E8B	b\u011Bn sh\xEC	3	n	source material|original story|ability|skill
\u62BD\u70DF	ch\u014Du y\u0101n	4	v	smoke
\u7EAF\u7CB9	ch\xFAn cu\xEC	7	d	pure|unadulterated|purely|completely
\u6653\u5F97	xi\u01CEo de	6	v	know
\u6536\u76CA	sh\u014Du y\xEC	4	n	earnings|profit
\u5E9F	f\xE8i	7	g	abolish|abandon|abrogate|discard|depose|oust|crippled|abandoned
\u7F20	ch\xE1n	7	v	wind around|wrap round|coil|tangle|involve|bother|annoy
\u987E	g\xF9	6	v	look after|take into consideration|attend to
\u6F6E	ch\xE1o	4	n	tide|damp|moist|humid|fashionable|trendy|inferior|substandard
\u82F1\u9551	Y\u012Bng b\xE0ng	7	q	pound sterling
\u5076\u7136	\u01D2u r\xE1n	5	a	incidentally|occasional|occasionally|by chance|randomly
\u62BC	y\u0101	7	v	mortgage|pawn|detain in custody|escort and protect|sign
\u638C\u58F0	zh\u01CEng sh\u0113ng	6	n	applause
\u56F0\u5883	k\xF9n j\xECng	7	n	predicament|plight
\u670D\u52A1\u5668	f\xFA w\xF9 q\xEC	7	n	server
\u89C4\u77E9	gu\u012B ju	7	n	fig. established standard|rule|customs|practices|fig. upright and honest|well-behaved
\u62C9\u5F00	l\u0101 k\u0101i	4	v	pull open|pull apart|space out|increase
\u77ED\u6682	du\u01CEn z\xE0n	7	a	of short duration|brief|momentary
\u63A5\u6536	ji\u0113 sh\u014Du	6	v	reception|receive|accept|admit|take over|expropriate
\u5927\u89C4\u6A21	d\xE0 gu\u012B m\xF3	4	b	large scale|extensive|wide scale|broad scale
\u8BC4\u5BA1	p\xEDng sh\u011Bn	7	v	appraise|evaluate|judge
\u9AD8\u901F\u516C\u8DEF	g\u0101o s\xF9 g\u014Dng l\xF9	3	n	expressway|highway|freeway
\u9E7F	l\xF9	7	n	deer
\u79CD\u5B50	zh\u01D2ng zi	3	n	seed
\u5E62	chu\xE1ng	7	q	banner|carriage curtain
\u6570\u636E\u5E93	sh\xF9 j\xF9 k\xF9	7	n	database
\u5927\u4F7F	d\xE0 sh\u01D0	6	n	ambassador|envoy
\u5D07\u62DC	ch\xF3ng b\xE0i	6	v	worship|adoration
\u6A21\u7CCA	m\xF3 hu	5	a	vague|indistinct|fuzzy
\u4FE1\u5FF5	x\xECn ni\xE0n	5	n	faith|belief|conviction
\u5DEE\u522B	ch\u0101 bi\xE9	5	n	difference|distinction|disparity
\u62C5	d\u0101n	7	v	undertake|carry|shoulder|take responsibility|picul|two buckets full
\u51FA\u624B	ch\u016B sh\u01D2u	7	v	dispose of|spend|undertake a task
\u8D5E\u6210	z\xE0n ch\xE9ng	4	v	approve|endorse|assist
\u4FDD\u59C6	b\u01CEo m\u01D4	7	n	nanny|housekeeper
\u66F4\u65B0	g\u0113ng x\u012Bn	5	v	renew|renovate|upgrade|update|regenerate
\u9881\u5956	b\u0101n ji\u01CEng	7	vn	confer an award
\u6A21\u6837	m\xFA y\xE0ng	5	n	look|style|appearance|approximation|about|also pr
\u5F53\u573A	d\u0101ng ch\u01CEng	5	d	at the scene|on the spot
\u7279\u5B9A	t\xE8 d\xECng	5	b	special|specific|designated|particular
\u590D\u5236	f\xF9 zh\xEC	4	v	duplicate|make a copy of|copy|reproduce|clone
\u5179	z\u012B	7	Rg	now|here|this|time|year
\u5211\u4E8B	x\xEDng sh\xEC	6	b	criminal|penal
\u6D88\u5316	xi\u0101o hu\xE0	4	v	digest|absorb|assimilate|process
\u867E	xi\u0101	7	n	shrimp|prawn
\u7FD8	qi\xE0o	7	v	stick up|rise on one end|tilt|outstanding|raise
\u5F97\u51FA	d\xE9 ch\u016B	2	v	obtain|arrive at
\u9501\u5B9A	su\u01D2 d\xECng	7	v	lock|close with a latch|lock into place|latch|lock a computer file|focus attention on|target
\u5730\u72F1	d\xEC y\xF9	7	n	hell|infernal|underworld|naraka
\u5F55\u97F3	l\xF9 y\u012Bn	3	vn	record|sound recording
\u9910\u9986	c\u0101n gu\u01CEn	5	n	restaurant
\u63A5\u5F85	ji\u0113 d\xE0i	3	v	receive|admit
\u6D88	xi\u0101o	7	v	diminish|subside|consume|reduce|idle away|require|take
\u770B\u5F85	k\xE0n d\xE0i	5	v	look upon|regard
\u6253\u67B6	d\u01CE ji\xE0	5	v	fight|scuffle|come to blows
\u4E3E\u62A5	j\u01D4 b\xE0o	7	v	report|denounce
\u63A8\u52A8	tu\u012B d\xF2ng	3	v	push|promote|give impetus to
\u6C14\u606F	q\xEC x\u012B	7	n	breath|smell|odor|flavor
\u7591\u95EE	y\xED w\xE8n	4	n	question|interrogation|doubt
\u8D77\u98DE	q\u01D0 f\u0113i	2	v	take off
\u5317\u90E8	b\u011Bi b\xF9	3	f	northern part
\u6253\u9020	d\u01CE z\xE0o	6	v	create|build|develop|forge
\u5F71\u54CD\u529B	y\u01D0ng xi\u01CEng l\xEC	6	n	influence|impact
\u6F5C\u5728	qi\xE1n z\xE0i	7	b	hidden|potential|latent
\u9002\u7528	sh\xEC y\xF2ng	3	v	be applicable
\u7F51\u7403	w\u01CEng qi\xFA	2	n	tennis|tennis ball
\u52A9\u624B	zh\xF9 sh\u01D2u	5	n	assistant|helper
\u5EA6\u5047	d\xF9 ji\xE0	7	v	go on holidays|spend one's vacation
\u6F14\u7ECE	y\u01CEn y\xEC	7	v	unfold|play out|develop|enact|deduce|infer
\u5305\u88F9	b\u0101o gu\u01D2	4	n	wrap up|bind up|bundle|parcel|package
\u60F3\u4E0D\u5230	xi\u01CEng bu d\xE0o	6	v	unexpected|hard to imagine
\u5F97\u4EE5	d\xE9 y\u01D0	5	v	able to|so that sb can|enabling|in order to|with sth in view
\u952E	ji\xE0n	5	n	key|button|chemical bond|linchpin
\u9996\u76F8	sh\u01D2u xi\xE0ng	6	n	prime minister
\u95F2	xi\xE1n	5	v	enclosure|unoccupied|leisure|idle
\u4E0A\u5E02	sh\xE0ng sh\xEC	6	v	hit the market|float
\u771F\u7406	zh\u0113n l\u01D0	5	n	truth
\u5B54	k\u01D2ng	6	n	hole
\u704C	gu\xE0n	7	v	irrigate|pour|install|record
\u5584\u4E8E	sh\xE0n y\xFA	4	v	be good at|be adept at
\u5BA2\u89C2	k\xE8 gu\u0101n	3	a	objective|impartial
\u9707	zh\xE8n	7	v	shake|vibrate|jolt|quake|excited|shocked
\u543B\u5408	w\u011Bn h\xE9	7	v	be a good fit|be identical with|adjust oneself to|fit in
\u731C\u6D4B	c\u0101i c\xE8	5	v	guess|conjecture|surmise
\u8001\u864E	l\u01CEo h\u01D4	4	n	tiger
\u505C\u8F66\u573A	t\xEDng ch\u0113 ch\u01CEng	2	n	parking lot|car park
\u968F\u673A	su\xED j\u012B	7	d	according to the situation|pragmatic|random
\u5178\u793C	di\u01CEn l\u01D0	5	n	celebration|ceremony
\u53D1\u8D77	f\u0101 q\u01D0	6	v	originate|initiate|launch (an attack|initiative etc)|start|propose sth
\u751F\u7406	sh\u0113ng l\u01D0	7	n	physiology
\u62DC\u6258	b\xE0i tu\u014D	7	v	please
\u573A\u5730	ch\u01CEng d\xEC	6	n	space|site|place|sports pitch
\u6ECB\u5473	z\u012B w\xE8i	7	n	taste|flavor|feeling
\u88D9\u5B50	q\xFAn zi	3	n	skirt
\u4EBA\u95F4	r\xE9n ji\u0101n	5	n	human world|earth
\u8102\u80AA	zh\u012B f\xE1ng	7	n	fat
\u9999\u8549	xi\u0101ng ji\u0101o	3	n	banana
\u5BA1\u67E5	sh\u011Bn ch\xE1	6	v	examine|investigate|censor out|censorship
\u6253\u7403	d\u01CE qi\xFA	1	v	play ball|play with a ball
\u6E2F\u53E3	g\u01CEng k\u01D2u	6	n	port|harbor
\u4E1D\u6BEB	s\u012B h\xE1o	7	m	slightest amount or degree|bit
\u5E94\u7528	y\xECng y\xF2ng	3	vn	put to use|apply|practical|applied|application|practical use|app
\u724C\u5B50	p\xE1i zi	3	n	sign|trademark|brand
\u8F6C\u5411	zhu\xE0n xi\xE0ng	5	v	get lost|lose one's way|change direction
\u8457\u4F5C	zh\xF9 zu\xF2	4		write|literary work|book|article|writings
\u653E\u5927	f\xE0ng d\xE0	5	v	enlarge|magnify
\u5927\u6D77	d\xE0 h\u01CEi	2	n	sea|ocean
\u6316\u6398	w\u0101 ju\xE9	7	v	excavate|dig|unearth
\u6743\u5A01	qu\xE1n w\u0113i	7	n	authority|authoritative|power and prestige
\u503A\u52A1	zh\xE0i w\xF9	7	n	debt|liability|amount due|indebtedness
\u8C31	p\u01D4	7	g	chart|list|table|register|score|spectrum|set to music
\u4E58\u5750	ch\xE9ng zu\xF2	5	v	ride
\u6C38\u6052	y\u01D2ng h\xE9ng	7	z	eternal|everlasting
\u8986\u76D6	f\xF9 g\xE0i	7	v	cover
\u9A7B	zh\xF9	6	v	halt|stay|be stationed
\u53CD\u51FB	f\u01CEn j\u012B	7	v	strike back|beat back|counterattack
\u6E20\u9053	q\xFA d\xE0o	6	n	irrigation ditch|channel|means
\u51E1	f\xE1n	7	d	ordinary|commonplace|mundane|temporal|of the material world|every|all|whatever
\u6C14\u8D28	q\xEC zh\xEC	7	n	temperament|personality traits|manners
\u82B1\u8D39	hu\u0101 f\xE8i	6	v	expense|cost|spend|expenditure
\u5C0A\u4E25	z\u016Bn y\xE1n	7	n	dignity|sanctity|honor|majesty
\u518D\u5EA6	z\xE0i d\xF9	7	d	once more|once again|one more time
\u4F24\u4EA1	sh\u0101ng w\xE1ng	6	vn	casualties|injuries and deaths
\u666F	j\u01D0ng	6	g	scenery|circumstance|situation|scene|sunlight
\u9F13	g\u01D4	5	v	drum|strike|rouse|bulge|swell
\u505A\u996D	zu\xF2 f\xE0n	2	v	prepare a meal|cook
\u4E0B\u624B	xi\xE0 sh\u01D2u	7	v	start|put one's hand to|set about
\u5927\u591A	d\xE0 du\u014D	4	d	for the most part|many|most|greater part|mostly
\u89C1\u8BC6	ji\xE0n shi	7	n	experience for oneself|knowledge|experience|insight
\u6B4C\u8BCD	g\u0113 c\xED	6	n	song lyric|lyrics
\u5305\u542B	b\u0101o h\xE1n	4	v	contain|embody|include
\u5BB0	z\u01CEi	7	v	slaughter|butcher|kill|fleece|rip off|overcharge|govern|rule
\u8FC7\u654F	gu\xF2 m\u01D0n	5	v	oversensitive|allergic|allergy
\u8BDA\u5B9E	ch\xE9ng sh\xED	4	a	honest
\u670D\u52A1\u5458	f\xFA w\xF9 yu\xE1n	3	n	waiter|waitress|attendant|customer service personnel
\u4EA4\u53C9	ji\u0101o ch\u0101	7	v	cross|intersect|overlap
\u7F3A\u9677	qu\u0113 xi\xE0n	6	n	defect|flaw
\u73B0\u72B6	xi\xE0n zhu\xE0ng	5	n	current situation
\u7535\u53F0	di\xE0n t\xE1i	3	n	transmitter-receiver|broadcasting station|radio station
\u6BDB\u8863	m\xE1o y\u012B	4	n	sweater
\u51FA\u79DF	ch\u016B z\u016B	2	v	rent
\u9152\u7CBE	ji\u01D4 j\u012Bng	7	n	alcohol|ethanol ch3ch2oh|ethyl alcohol|grain alcohol
\u7537\u58EB	n\xE1n sh\xEC	4	n	man|gentleman
\u8FD9\u65F6\u5019	zh\xE8 sh\xEDh\xF2u	2	r	at this moment
\u67E5\u51FA	ch\xE1 ch\u016B	6	v	find out|discover
\u6CBE	zh\u0101n	7	v	moisten|be infected by|touch
\u603B\u7406	z\u01D2ng l\u01D0	4	n	premier|prime minister
\u8001\u662F	l\u01CEo shi	2	d	always
\u9650	xi\xE0n	7	v	limit|restrict|bound
\u53EF\u7B11	k\u011B xi\xE0o	7	a	funny|ridiculous
\u9AA8\u5934	g\u01D4 tou	4	n	bone|moral character|bitterness|taiwan pr
\u4E0A\u95E8	sh\xE0ng m\xE9n	4	v	drop in|visit|lock a door|close
\u635E	l\u0101o	7	v	fish up|dredge up
\u96C6\u5408	j\xED h\xE9	4	v	gather|assemble|set
\u4E0A\u7EA7	sh\xE0ng j\xED	5	n	higher authorities|superiors
\u52A8\u8109	d\xF2ng m\xE0i	7	n	artery
\u5B9D\u8D35	b\u01CEo gu\xEC	4	a	valuable|precious|value|treasure|set store by
\u9876\u7EA7	d\u01D0ng j\xED	7	b	top-notch|first-rate
\u7AE5\u5E74	t\xF3ng ni\xE1n	4	t	childhood
\u8822	ch\u01D4n	7	a	stupid|sluggish|clumsy|wiggle
\u51E4\u51F0	f\xE8ng hu\xE1ng	7	n	phoenix
\u7741	zh\u0113ng	7	v	open
\u8FDB\u53E3	j\xECn k\u01D2u	4	v	import|imported|entrance|inlet
\u6269\u6563	ku\xF2 s\xE0n	7	v	spread|proliferate|diffuse
\u6761\u6B3E	ti\xE1o ku\u01CEn	7	n	clause
\u5FC3\u601D	x\u012Bn si	7	n	mind|thoughts|inclination|mood
\u8D3F\u8D42	hu\xEC l\xF9	7	v	bribe
\u9634\u5F71	y\u012Bn y\u01D0ng	6	n	shadow
\u786C\u76D8	y\xECng p\xE1n	7	n	hard disk
\u70AE	b\u0101o	6	n	saut\xE9|fry|dry by heating|cannon|firecracker
\u91D1\u724C	j\u012Bn p\xE1i	3	n	gold medal
\u4F8B\u5916	l\xEC w\xE0i	5	v	exception|be an exception
\u6C89\u91CD	ch\xE9n zh\xF2ng	4	a	heavy|hard|serious|critical
\u4ECE\u4E2D	c\xF3ng zh\u014Dng	5	d	from within|therefrom
\u4EEA\u5668	y\xED q\xEC	6	n	instrument|apparatus
\u65E0\u7EBF	w\xFA xi\xE0n	7	b	wireless
\u5E02\u533A	sh\xEC q\u016B	4	s	urban district|downtown|city center
\u79CB	qi\u016B	3	tg	autumn|fall|harvest time
\u5DE5\u7A0B\u5E08	g\u014Dng ch\xE9ng sh\u012B	3	n	engineer
\u5C01\u9501	f\u0113ng su\u01D2	7	v	blockade|seal off|lock down
\u73B0\u6709	xi\xE0n y\u01D2u	5	v	currently existing|currently available
\u547D\u540D	m\xECng m\xEDng	7	v	give a name to|dub|christen|designate|named after|naming
\u90E8\u7F72	b\xF9 sh\u01D4	7	v	dispose|deploy|deployment
\u571F\u8C46	t\u01D4 d\xF2u	5	n	potato|peanut
\u6837\u672C	y\xE0ng b\u011Bn	7	n	sample|specimen
\u6708\u4EFD	yu\xE8 f\xE8n	2	t	month
\u4E25\u5389	y\xE1n l\xEC	5	a	severe|strict
\u793A\u8303	sh\xEC f\xE0n	5	vn	demonstrate|demonstration|model example
\u8D4B\u4E88	f\xF9 y\u01D4	7	v	assign|entrust|give|bestow
\u8FDB\u7A0B	j\xECn ch\xE9ng	7	n	course of events|process
\u5C01\u95ED	f\u0113ng b\xEC	4	v	close|seal off|close down|closed
\u5C55\u89C8	zh\u01CEn l\u01CEn	5	vn	put on display|exhibit|exhibition|show
\u6D41\u611F	li\xFA g\u01CEn	6	n	flu|influenza
\u6C27	y\u01CEng	7	n	oxygen
\u5904\u7F5A	ch\u01D4 f\xE1	5	vn	penalize|punish
\u89C1\u8BC1	ji\xE0n zh\xE8ng	7	n	be witness to|witness|evidence
\u8840\u538B	xu\xE8 y\u0101	7	n	blood pressure
\u9057\u4F20	y\xED chu\xE1n	4	vn	heredity|inherit|pass on
\u5B59\u5B50	s\u016Bn zi	4	n	grandson|son's son
\u94A9	g\u014Du	7	n	hook|sew|crochet|check mark or tick|window catch
\u76D7	d\xE0o	7	g	steal|rob|plunder|thief|bandit|robber
\u884C\u9A76	x\xEDng sh\u01D0	5	v	travel along a route
\u4F18\u70B9	y\u014Du di\u01CEn	3	n	merit|benefit|strong point|advantage
\u8D85\u51FA	ch\u0101o ch\u016B	6	v	exceed|overstep|go too far|encroach
\u6559\u5802	ji\xE0o t\xE1ng	6	n	church|chapel
\u8BC6\u522B	sh\xED bi\xE9	7	vn	distinguish|discern|identify|recognize
\u5F02\u6027	y\xEC x\xECng	7	n	opposite sex|of the opposite sex|heterosexual|different in nature
\u7EA0\u6B63	ji\u016B zh\xE8ng	6	v	correct|make right
\u5BA2\u5385	k\xE8 t\u012Bng	5	n	drawing room|living room
\u4E0B\u96E8	xi\xE0 y\u01D4	1	v	rain
\u96BE\u5FD8	n\xE1n w\xE0ng	6	a	unforgettable
\u996E\u98DF	y\u01D0n sh\xED	5	n	eating and drinking|food and drink|diet
\u811A\u6B65	ji\u01CEo b\xF9	5	n	footstep|step
\u9887	p\u014D	7	d	rather|quite|considerably|oblique|inclined|slanting|taiwan pr
\u5F00\u67AA	k\u0101i qi\u0101ng	7	v	open fire|shoot a gun
\u94A2	g\u0101ng	7	n	steel
\u6E9C	li\u016B	7	v	slip away|escape in stealth|skate
\u519C\u573A	n\xF3ng ch\u01CEng	7	n	farm
\u5B8C\u5584	w\xE1n sh\xE0n	3	v	comprehensive|well-developed|excellent|refine|improve
\u6447\u6EDA	y\xE1o g\u01D4n	7	n	rock 'n' roll|rock|fall off
\u9B54\u9B3C	m\xF3 gu\u01D0	7	n	devil
\u7334\u5B50	h\xF3u zi	4	n	monkey
\u966A\u4F34	p\xE9i b\xE0n	7	v	accompany
\u671F\u9650	q\u012B xi\xE0n	4	n	time limit|deadline|allotted time
\u5F00\u542F	k\u0101i q\u01D0	7	v	open|start|enable
\u53C2\u8003	c\u0101n k\u01CEo	4	v	consultation|reference|consult|refer
\u75AF\u5B50	f\u0113ng zi	7	n	madman|lunatic
\u5E95\u7EBF	d\u01D0 xi\xE0n	7	n	bottom line|baseline|under thread|spy|informer|plant
\u6467\u6BC1	cu\u012B hu\u01D0	7	v	destroy|wreck
\u7528\u5FC3	y\xF2ng x\u012Bn	6	ad	motive|intention|be diligent or attentive|careful
\u6D41\u52A8	li\xFA d\xF2ng	5	vn	flow|circulate|be mobile|liquid
\u62E6	l\xE1n	7	v	block sb's path|obstruct|flag down
\u5916\u754C	w\xE0i ji\xE8	5	n	outside world|external
\u5E26\u6709	d\xE0i y\u01D2u	5	v	have an element of|carry
\u56FD\u571F	gu\xF3 t\u01D4	7	n	country's territory|national land
\u574F\u4EBA	hu\xE0i r\xE9n	2	n	bad person|villain
\u5949\u732E	f\xE8ng xi\xE0n	6	v	offer respectfully|consecrate|dedicate|devote
\u6F2B\u957F	m\xE0n ch\xE1ng	5	a	very long|endless
\u65C5\u9986	l\u01DA gu\u01CEn	3	n	hotel
\u6807\u8BB0	bi\u0101o j\xEC	6	n	sign|mark|symbol|mark up|token
\u69FD	c\xE1o	7	g	trough|manger|groove|channel|hard drive
\u756A	f\u0101n	6	qv	foreign|barbarian
\u76F8\u9047	xi\u0101ng y\xF9	7	v	meet|encounter|come across
\u5FD7\u613F\u8005	zh\xEC yu\xE0n zh\u011B	3	n	volunteer
\u4F46\u613F	d\xE0n yu\xE0n	7	v	if only|i wish
\u6E29\u99A8	w\u0113n x\u012Bn	7	a	comfort|soft and fragrant|warm
\u559C\u5267	x\u01D0 j\xF9	5	n	comedy
\u6CEA	l\xE8i	4	n	tears
\u6328	\xE1i	6	v	suffer|endure|pull through|delay|stall|play for time|dawdle|in order
\u91CD\u91CF	zh\xF2ng li\xE0ng	4	n	weight
\u5FC3\u810F\u75C5	x\u012Bn z\xE0ng b\xECng	6	n	heart disease
\u7F13\u89E3	hu\u01CEn ji\u011B	4	v	bring relief|alleviate|dull
\u89C6\u89C9	sh\xEC ju\xE9	7	n	sight|vision|visual
\u5C01\u9762	f\u0113ng mi\xE0n	7	n	cover
\u8FA9\u62A4	bi\xE0n h\xF9	7	v	speak in defense of|argue in favor of|defend|plead
\u5E78\u597D	x\xECng h\u01CEo	7	d	fortunately
\u9999\u6C34	xi\u0101ng shu\u01D0	7	n	perfume|cologne
\u591A\u4F59	du\u014D y\xFA	7	a	superfluous|unnecessary|surplus
\u6551\u52A9	ji\xF9 zh\xF9	6	v	help sb in trouble|aid|assistance
\u6D4B\u91CF	c\xE8 li\xE1ng	4	vn	survey|measure|gauge|determine
\u8D27\u7269	hu\xF2 w\xF9	7	n	goods|commodity|merchandise
\u5965\u8FD0\u4F1A	A\xF2 y\xF9n hu\xEC	7	n	olympic games|olympics
\u8D70\u5ECA	z\u01D2u l\xE1ng	7	n	corridor|aisle|hallway|passageway|veranda
\u4EBA\u8D28	r\xE9n zh\xEC	7	n	hostage
\u5634\u5507	zu\u01D0 ch\xFAn	7	n	lip
\u6C47	hu\xEC	4	v	remit|converge|exchange|class|collection
\u4E00\u540C	y\u012B t\xF3ng	6	d	together
\u7FA4\u4F53	q\xFAn t\u01D0	5	n	community|colony
\u57CE\u91CC	ch\xE9ngl\u01D0	5	s	in the city
\u8BAD	x\xF9n	7	v	teach|train|admonish|instruction|teachings|rule
\u53D1\u8FBE	f\u0101 d\xE1	3	a	well-developed|flourishing|develop|promote|expand|achieve fame and fortune|prosper
\u5F3A\u5236	qi\xE1ng zh\xEC	7	v	force|compel|coerce|forced|compulsory|taiwan pr
\u611A\u8822	y\xFA ch\u01D4n	7	a	silly|stupid
\u73E0\u5B9D	zh\u016B b\u01CEo	6	n	pearls|jewels|precious stones
\u63D0\u4EA4	t\xED ji\u0101o	6	v	submit|refer to sb
\u6765\u4E0D\u53CA	l\xE1i bu j\xED	4	v	there's not enough time|it's too late
\u76D7\u7A83	d\xE0o qi\xE8	7	v	steal
\u8BBE\u5B9A	sh\xE8 d\xECng	7	v	set|set up|install|setting|preferences
\u4EBA\u5DE5	r\xE9n g\u014Dng	3	b	artificial|manpower|manual work
\u6E38\u884C	y\xF3u x\xEDng	6	vn	march|parade|demonstrate|procession|demonstration|travel around|roam
\u8D56	l\xE0i	6	v	depend on|bad|renege|disclaim|rat|rascally|blame|put the blame on
\u5954	b\u0113n	7	v	hurry|rush|run quickly|elope|go to|head for|towards|taiwan pr
\u6D0B	y\xE1ng	6	g	ocean|vast|foreign|silver dollar or coin
\u81EA\u79C1	z\xEC s\u012B	7	a	selfish|selfishness
\u51D1	c\xF2u	7	v	happen by chance|move close to|exploit an opportunity
\u51B2\u51FB	ch\u014Dng j\u012B	6	vn	attack|batter|pound against|shock|impact
\u80C6	d\u01CEn	5	n	gall bladder|courage|guts|gall|inner container
\u6C34\u6CE5	shu\u01D0 n\xED	6	n	cement
\u8B66\u60D5	j\u01D0ng t\xEC	7	v	be on the alert|vigilant|alert|on guard|warn
\u4FE1\u7528	x\xECn y\xF2ng	6	n	trustworthiness|credit|trust and appoint
\u5171\u4EAB	g\xF2ng xi\u01CEng	5	v	share|enjoy together
\u964D\u4E34	ji\xE0ng l\xEDn	7	v	descend|arrive|come
\u804C\u52A1	zh\xED w\xF9	5	n	post|position|job|duties
\u622A	ji\xE9	7	v	cut off|stop|intercept|section|chunk|length
\u4E61	xi\u0101ng	5	n	country or countryside|native place|home village or town|township
\u751F\u6B7B	sh\u0113ng s\u01D0	7	n	life or death
\u6101	ch\xF3u	5	v	worry about
\u666E\u904D	p\u01D4 bi\xE0n	3	a	universal|general|widespread|common
\u819D\u76D6	x\u012B g\xE0i	7	n	knee|kneel down
\u90FD\u5E02	d\u016B sh\xEC	6	n	city|metropolis
\u5165\u4FB5	r\xF9 q\u012Bn	7	v	invade
\u72C2\u6B22	ku\xE1ng hu\u0101n	7	v	party|carousal|hilarity|merriment|whoopee|carouse
\u91CD\u7EC4	ch\xF3ng z\u01D4	6	v	reorganize|recombine|restructure
\u5929\u4E0A	ti\u0101n sh\xE0ng	2	s	celestial|heavenly
\u7231\u5FC3	\xE0i x\u012Bn	3	n	compassion|kindness|care for others|love|charity|heart
\u5546\u52A1	sh\u0101ng w\xF9	4	n	commercial affairs|commercial|commerce|business
\u4E43	n\u01CEi	7	v	be|thus|so|therefore|then|only|thereupon
\u4E13\u7528	zhu\u0101n y\xF2ng	6	vn	special|dedicated
\u53D1\u89C9	f\u0101 ju\xE9	5	v	become aware|detect|realize|perceive
\u6495	s\u012B	7	v	tear
\u65C5\u5BA2	l\u01DA k\xE8	2	n	traveler|tourist
\u7B28\u86CB	b\xE8n d\xE0n	7	n	fool|idiot
\u56DE\u6536	hu\xED sh\u014Du	5	v	recycle|reclaim|retrieve|recover|recall
\u5927\u8863	d\xE0 y\u012B	2	n	overcoat|topcoat|cloak
\u5929\u771F	ti\u0101n zh\u0113n	4	a	naive|innocent|artless
\u6C99\u6F20	sh\u0101 m\xF2	5	n	desert
\u5B58\u6B3E	c\xFAn ku\u01CEn	5	n	deposit money|bank savings|bank deposit
\u8BED\u6C14	y\u01D4 q\xEC	7	n	tone|manner of speaking|mood
\u71C3\u6599	r\xE1n li\xE0o	4	n	fuel
\u9762\u5B50	mi\xE0n zi	5	n	outer surface|outside of sth|social prestige|face|powder
\u6781\u5EA6	j\xED d\xF9	7	d	extremely
\u53D1\u70E7	f\u0101 sh\u0101o	4	v	have a high temperature|have a fever
\u8231	c\u0101ng	7	n	cabin
\u5F62\u72B6	x\xEDng zhu\xE0ng	3	n	form|shape
\u66FF\u4EE3	t\xEC d\xE0i	4	v	substitute for|replace|supersede
\u77ED\u671F	du\u01CEn q\u012B	3	b	short term|short-term
\u5B89\u7F6E	\u0101n zh\xEC	4	v	find a place for|help settle down|arrange for|get into bed|placement
\u62AB	p\u012B	5	v	drape over one's shoulders|open|unroll|split open|spread out
\u5168\u573A	qu\xE1n ch\u01CEng	3	n	everyone present|whole audience|across-the-board|unanimously|whole duration
\u5904\u7F6E	ch\u01D4 zh\xEC	7	v	handle|take care of|punish
\u6DF1\u5EA6	sh\u0113n d\xF9	5	n	depth|profundity|advanced stage of development
\u7F8E\u91D1	M\u011Bi j\u012Bn	4	q	us dollar|usd
\u4EF7\u94B1	ji\xE0 qian	3	n	price
\u7BB1\u5B50	xi\u0101ng zi	4	n	suitcase|chest|box|case|trunk
\u601D\u8DEF	s\u012B l\xF9	7	n	line of thought|way of thinking
\u8BA4\u540C	r\xE8n t\xF3ng	6	v	approve of|endorse|acknowledge|recognize|identify oneself with
\u589E\u4EA7	z\u0113ng ch\u01CEn	5		increase production
\u5FF5\u5934	ni\xE0n tou	7	n	thought|idea|intention
\u5B66\u671F	xu\xE9 q\u012B	2	n	term|semester
\u535A\u5BA2	b\xF3 k\xE8	5	nz	blog|weblog|blogger
\u5916\u51FA	w\xE0i ch\u016B	6	v	go out|go away
\u6BCF\u5F53	m\u011Bi d\u0101ng	7	p	whenever|every time
\u7687\u540E	hu\xE1ng h\xF2u	7	n	empress|imperial consort
\u4E25	y\xE1n	4	a	tight|stern|strict|rigorous|severe|father
\u4E86\u4E0D\u8D77	li\u01CEo bu q\u01D0	4	a	amazing|terrific|extraordinary
\u505C\u7559	t\xEDng li\xFA	5	v	stay somewhere temporarily|stop over
\u8BC1\u4EF6	zh\xE8ng ji\xE0n	3	n	certificate|papers|credentials|document|id
\u89C6\u7EBF	sh\xEC xi\xE0n	7	n	line of sight
\u4FEE\u7406	xi\u016B l\u01D0	4	v	repair|fix|prune|trim|sort sb out|fix sb
\u8DEF\u8FB9	l\xF9 bi\u0101n	2	s	curb|roadside|wayside
\u95F4\u8C0D	ji\xE0n di\xE9	7	n	spy
\u9996\u6279	sh\u01D2u p\u012B	7		first batch
\u5C3A\u5BF8	ch\u01D0 cun	4	n	size|dimensions|measurements|propriety
\u865A	x\u016B	7	a	emptiness|void|empty or unoccupied|diffident or timid|false|humble or modest|weak|virtual
\u5E7C\u513F\u56ED	y\xF2u \xE9r yu\xE1n	4	n	kindergarten|nursery school
\u58F3	qi\xE0o	7	g	shell|carapace|crust|also pr
\u7A7F\u4E0A	chu\u0101n shang	4		put on
\u7F6A\u72AF	zu\xEC f\xE0n	7	n	criminal
\u6295\u964D	t\xF3u xi\xE1ng	7	v	surrender
\u5DE1\u903B	x\xFAn lu\xF3	7	v	patrol
\u714E	ji\u0101n	7	v	pan fry|saut\xE9
\u6D3E\u51FA	p\xE0i ch\u016B	6	v	send|dispatch
\u8FB9\u5883	bi\u0101n j\xECng	5	s	frontier|border
\u7EE7	j\xEC	7	g	continue|follow after|go on with|succeed|inherit|then|afterwards
\u5438\u70DF	x\u012B y\u0101n	4	v	smoke
\u75AB\u82D7	y\xEC mi\xE1o	7	n	vaccine
\u96BE\u9898	n\xE1n t\xED	2	n	difficult problem
\u5220	sh\u0101n	7	v	delete
\u5F71\u5B50	y\u01D0ng zi	4	n	shadow|reflection|hint|indication|influence
\u5165\u53E3	r\xF9 k\u01D2u	2	n	entrance|import
\u5EF6\u957F	y\xE1n ch\xE1ng	4	v	prolong|extend|delay
\u5589\u5499	h\xF3u l\xF3ng	7	n	throat
\u77FF	ku\xE0ng	6	n	mineral deposit|ore deposit|ore|mine
\u8EAB\u5B50	sh\u0113n zi	7	n	body|pregnancy|health
\u90AA	xi\xE9	7	a	demonic|iniquitous|nefarious|evil|strange|abnormal
\u519B\u5B98	j\u016Bn gu\u0101n	7	n	officer
\u6D77\u5CB8	h\u01CEi \xE0n	7	n	coastal|seacoast
\u610F\u613F	y\xEC yu\xE0n	6	n	aspiration|wish|desire
\u9690\u7792	y\u01D0n m\xE1n	7	v	conceal|hide|cover up the truth
\u5DE5\u4F1A	g\u014Dng hu\xEC	7	n	labor union|trade union
\u52A0\u73ED	ji\u0101 b\u0101n	4	v	work overtime
\u7EC7	zh\u012B	6	v	weave
\u5F81\u670D	zh\u0113ng f\xFA	4	v	conquer|subdue|vanquish
\u9648\u8FF0	ch\xE9n sh\xF9	7	v	assertion|declare|state
\u5171\u6709	g\xF2ng y\u01D2u	3	v	have altogether|in all
\u5730\u9053	d\xEC dao	7	a	authentic|genuine|proper|tunnel|causeway
\u5C06\u8981	ji\u0101ng y\xE0o	5	d	will|shall|be going to
\u5982\u4E0B	r\xFA xi\xE0	5	v	as follows
\u901A\u8BDD	t\u014Dng hu\xE0	6	v	hold a conversation|talk over the telephone|phone call
\u5934\u75BC	t\xF3u t\xE9ng	6	a	headache
\u7CBE\u82F1	j\u012Bng y\u012Bng	7	n	cream|elite|essence|quintessence
\u8FC8	m\xE0i	7	v	take a step|stride
\u5916\u5A46	w\xE0i p\xF3	7	n	mother's mother|maternal grandmother
\u62C5\u5FE7	d\u0101n y\u014Du	6	v	worry|be concerned
\u57AB	di\xE0n	7	v	pad|cushion|mat|pad out|fill a gap|pay for sb|advance
\u5E2D	x\xED	7	qt	woven mat|seat|banquet
\u98DE\u884C\u5458	f\u0113i x\xEDng yu\xE1n	6	n	pilot|aviator
\u5ACC	xi\xE1n	6	v	dislike|suspicion|resentment|enmity
\u8D5E\u540C	z\xE0n t\xF3ng	7	v	approve of|endorse|in favor
\u786E\u5207	qu\xE8 qi\xE8	7	a	definite|exact|precise
\u4E0D\u60DC	b\xF9 x\u012B	7	v	not stint|not spare|not hesitate|not scruple
\u63ED\u6653	ji\u0113 xi\u01CEo	7	v	announce publicly|publish|make known|disclose
\u8F66\u5C55	ch\u0113 zh\u01CEn	6		motor show
\u53D1\u8A93	f\u0101 sh\xEC	7	v	vow|pledge|swear
\u6C38\u4E0D	y\u01D2ng b\xF9	7	d	never|will never
\u4FBF\u5229	bi\xE0n l\xEC	5	a	convenient|easy|facilitate
\u5B89\u5FC3	\u0101n x\u012Bn	7	a	at ease|feel relieved
\u574F\u4E8B	hu\xE0i sh\xEC	7	n	bad thing|misdeed|ruin things
\u5E95\u4E0B	d\u01D0 xia	3	f	location below sth|afterwards
\u72AF\u89C4	f\xE0n gu\u012B	6	v	break the rules|illegality|foul
\u7F29	su\u014D	7	v	withdraw|pull back|contract|shrink|reduce|abbreviation|also pr
\u5A5A\u7EB1	h\u016Bn sh\u0101	7	n	wedding dress
\u878D\u5408	r\xF3ng h\xE9	6	v	mixture|amalgam|fusion|welding together|be in harmony with|harmonize with|fit in
\u9014\u4E2D	t\xFA zh\u014Dng	4	s	en route
\u56F0\u60D1	k\xF9n hu\xF2	7	a	bewildered|perplexed|confused|difficult problem|perplexity
\u7126\u8651	ji\u0101o l\u01DC	7	a	anxious|worried|apprehensive
\u76DB\u5927	sh\xE8ng d\xE0	7	b	grand|majestic|magnificent
\u5171\u548C\u56FD	g\xF2ng h\xE9 gu\xF3	6	n	republic
\u7262	l\xE1o	6	a	firm|sturdy|fold|sacrifice|prison
\u5E73\u6C11	p\xEDng m\xEDn	7	n	ordinary people|commoner|civilian
\u6570\u7801	sh\xF9 m\u01CE	4	n	number|numerals|figures|digital|amount|numerical code
\u5EF6\u7EED	y\xE1n x\xF9	4	v	continue|go on|last
\u5929\u8D4B	ti\u0101n f\xF9	7	n	gift|innate skill
\u7A7A\u767D	k\xF2ng b\xE1i	7	n	blank space
\u7597\u6CD5	li\xE1o f\u01CE	7	n	therapy|treatment
\u5B9E\u4E60	sh\xED x\xED	2	vn	practice|field work|intern|internship
\u76C6	p\xE9n	5	n	basin|flower pot
\u6027\u8D28	x\xECng zh\xEC	4	n	nature|characteristic
\u7535\u6E90	di\xE0n yu\xE1n	4	n	electric power source
\u540C\u80DE	t\xF3ng b\u0101o	6	n	sibling|fellow citizen|compatriot
\u5B66\u4F4D	xu\xE9 w\xE8i	5	n	academic degree|place in school
\u6545	g\xF9	7	c	happening|instance|reason|cause|intentional|former|old|friend
\u53D8\u5F62	bi\xE0n x\xEDng	6	v	become deformed|change shape|morph
\u5927\u529B	d\xE0 l\xEC	6	d	energetically|vigorously
\u65E0\u529B	w\xFA l\xEC	7	v	powerless|lacking strength
\u5730\u6B65	d\xEC b\xF9	7	n	stage|degree|situation|leeway
\u5C81\u6708	su\xEC yu\xE8	5	n	years|time
\u8003\u5BDF	k\u01CEo ch\xE1	4	v	inspect|observe and study|on-the-spot investigation
\u5F00\u5C55	k\u0101i zh\u01CEn	3	v	launch|develop|unfold|open
\u5360\u9886	zh\xE0n l\u01D0ng	5	v	capture|seize|occupy by force
\u79CD\u79CD	zh\u01D2ng zh\u01D2ng	6	q	all kinds of
\u9A7E\u8F66	ji\xE0 ch\u0113	7	v	drive a vehicle
\u795E\u8BDD	sh\xE9n hu\xE0	4	n	legend|fairy tale|myth|mythology
\u7F8E\u98DF	m\u011Bi sh\xED	3	n	culinary delicacy|fine food|gourmet food
\u987A\u7740	sh\xF9n zhe	7	p	follow|following|along
\u4F34\u968F	b\xE0n su\xED	7	v	accompany|follow|occur together with|concomitant
\u626C	y\xE1ng	7	g	raise|hoist|scattering|flutter|propagate
\u9C9C	xi\u0101n	4	a	fresh|bright|delicious|tasty|delicacy|aquatic foods|few|rare
\u60B2\u54C0	b\u0113i \u0101i	7	an	grieved|sorrowful
\u4E89\u8BAE	zh\u0113ng y\xEC	5	vn	controversy|dispute
\u7D2B	z\u01D0	5	a	purple|violet
\u6B22\u547C	hu\u0101n h\u016B	7	v	cheer for|acclaim
\u80A0	ch\xE1ng	5	n	intestines
\u907F	b\xEC	4	v	avoid|shun|flee|escape|keep away from|leave|hide from
\u9633\u6027	y\xE1ng x\xECng	7	n	positive|masculine
\u58EE	zhu\xE0ng	7	v	strengthen|strong|robust
\u957F\u4E45	ch\xE1ng ji\u01D4	6	a	long time
\u51B3\u7B56	ju\xE9 c\xE8	6	n	strategic decision|decision-making|policy decision|determine policy
\u70ED\u95F9	r\xE8 nao	4	a	lively
\u8F9E	c\xED	7	v	resign|dismiss|decline|take leave|ballad
\u7EC8\u8EAB	zh\u014Dng sh\u0113n	5	n	lifelong|all one's life|marriage
\u9884\u5B9A	y\xF9 d\xECng	7	v	schedule in advance
\u5BA1	sh\u011Bn	7	v	examine|investigate|carefully|try
\u79F0\u547C	ch\u0113ng hu	7	v	call|address as|form of address|appellation
\u5012\u6570	d\xE0o sh\u01D4	7	v	count backwards|count down|from the bottom|from the back|inverse number|reciprocal
\u5C4B\u9876	w\u016B d\u01D0ng	7	n	roof
\u8BF4\u9053	shu\u014D d\xE0o	7	v	state|say|discuss|reason
\u4E34	l\xEDn	7	v	face|overlook|arrive|be about to|just before
\u673A\u9047	j\u012B y\xF9	4	n	opportunity|favorable circumstance|stroke of luck
\u63A8\u5E7F	tu\u012B gu\u01CEng	3	v	extend|spread|popularize|generalization|promotion
\u6307\u5F15	zh\u01D0 y\u01D0n	7	v	guide|show|point|directions|guidance|guidelines
\u5632\u7B11	ch\xE1o xi\xE0o	7	v	jeer at|deride|ridicule|mockery|derision
\u4F1E	s\u01CEn	4	n	umbrella|parasol|damask silk
\u516C\u79EF\u91D1	g\u014Dng j\u012B j\u012Bn	7		official reserves|accumulated fund
\u8425\u4E1A	y\xEDng y\xE8	4	vn	do business|trade
\u7F69	zh\xE0o	7	v	cover|fish trap|shade
\u8D2B\u56F0	p\xEDn k\xF9n	6	a	impoverished|poverty
\u56DE\u907F	hu\xED b\xEC	5	v	shun|avoid|skirt|evade|step back|withdraw|recuse
\u5BB6\u56ED	ji\u0101 yu\xE1n	6	n	home|homeland
\u65B0\u751F	x\u012Bn sh\u0113ng	7	n	new|newborn|emerging|nascent|rebirth|regeneration|new life|new student
\u7235\u58EB	ju\xE9 sh\xEC	7	n	knight|sir|jazz
\u542B\u4E49	h\xE1n y\xEC	4	n	meaning|implied meaning|hidden meaning|hint|connotation
\u53E4\u4EE3	g\u01D4 d\xE0i	3	t	ancient times
\u6E05\u6D17	q\u012Bng x\u01D0	6	v	wash|clean|purge
\u95EE\u5019	w\xE8n h\xF2u	4	vn	give one's respects|send a greeting|make offensive reference to
\u4E2D\u534E\u6C11\u65CF	Zh\u014Dng hu\xE1 m\xEDn z\xFA	3		chinese nation|chinese people
\u7559\u610F	li\xFA y\xEC	7	v	be mindful|pay attention to|take note of
\u9065\u8FDC	y\xE1o yu\u01CEn	7	a	distant|remote
\u7D27\u5BC6	j\u01D0n m\xEC	4	a	inseparably close
\u68C9\u82B1	mi\xE1n hua	7	n	cotton
\u4E0A\u53F0	sh\xE0ng t\xE1i	6	v	rise to power|go on stage
\u4F20\u51FA	chu\xE1n ch\u016B	6	v	transmit outwards|disseminate|efferent
\u6307\u7532	zh\u01D0 jia	5	n	fingernail
\u4F53\u529B	t\u01D0 l\xEC	5	n	physical strength|physical power
\u94C3	l\xEDng	5	o	bell
\u795E\u5723	sh\xE9n sh\xE8ng	7	a	divine|hallow|holy|sacred
\u70B9\u5934	di\u01CEn t\xF3u	2	v	nod
\u6076\u5316	\xE8 hu\xE0	7	v	worsen
\u6C14\u4F53	q\xEC t\u01D0	5	n	gas
\u53E3\u6C14	k\u01D2u q\xEC	7	n	tone of voice|way one speaks|manner of expression|tone
\u6367	p\u011Bng	7	v	clasp|cup the hands|offer|praise|flatter
\u5C42\u6B21	c\xE9ng c\xEC	5	n	layer|level|gradation|arrangement of ideas|standing
\u56FD\u6C11	gu\xF3 m\xEDn	5	n	nationals|citizens|people of a nation
\u6563\u6B65	s\xE0n b\xF9	3	v	take a walk|go for a walk
\u519C\u4E1A	n\xF3ng y\xE8	3	n	agriculture|farming
\u6307\u4EE4	zh\u01D0 l\xECng	7	n	order|command|instruction
\u52FE	g\u014Du	7	v	attract|arouse|tick|strike out|delineate|collude
\u51FA\u5C40	ch\u016B j\xFA	7	v	be put out|be dismissed|be weeded out|get the chop
\u676F\u5B50	b\u0113i zi	1	n	cup|glass
\u4E0D\u4EC5\u4EC5	b\xF9 j\u01D0n j\u01D0n	6	d	not only|not just
\u89C6\u4E3A	sh\xEC w\xE9i	5	v	view as|see as|consider to be|deem
\u8BD7\u4EBA	sh\u012B r\xE9n	4	n	bard|poet
\u8D35\u65CF	gu\xEC z\xFA	7	n	lord|nobility|nobleman|noblewoman|aristocrat|aristocracy
\u5236\u670D	zh\xEC f\xFA	7	n	subdue|check|bring under control|uniform|livery
\u5BF9\u5916	du\xEC w\xE0i	6	v	external|foreign
\u670D\u4ECE	f\xFA c\xF3ng	5	v	obey|comply|defer
\u5409\u4ED6	j\xED t\u0101	7	n	guitar
\u6E21	d\xF9	6	v	cross|pass through|ferry
\u764C	\xE1i	7	n	cancer|carcinoma|also pr
\u52C9\u5F3A	mi\u01CEn qi\u01CEng	7	ad	do with difficulty|reluctant|barely enough
\u987A\u5E8F	sh\xF9n x\xF9	4	n	sequence|order
\u624B\u8868	sh\u01D2u bi\u01CEo	2	n	wristwatch
\u8BC1\u4EBA	zh\xE8ng r\xE9n	7	n	witness
\u5927\u5730	d\xE0 d\xEC	7	n	earth|mother earth
\u8DEF\u53E3	l\xF9 k\u01D2u	1	n	crossing|intersection
\u7816	zhu\u0101n	7	n	brick
\u6E05\u65B0	q\u012Bng x\u012Bn	7	a	fresh and clean
\u5F81	zh\u0113ng	7	v	invite|recruit|levy|draft|phenomenon|symptom|characteristic sign|evidence
\u6848\u4F8B	\xE0n l\xEC	6	n	case|instance|example
\u6CE8\u5165	zh\xF9 r\xF9	7	v	pour into|empty into
\u6742	z\xE1	6	a	mixed|miscellaneous|various|mix
\u6349	zhu\u014D	6	v	clutch|grab|capture
\u6253\u65AD	d\u01CE du\xE0n	6	v	interrupt|break off|break
\u4F4E\u4E8E	d\u012B y\xFA	5	v	be lower than
\u5766\u514B	t\u01CEn k\xE8	7	n	tank
\u74DC	gu\u0101	4	n	melon|gourd|squash
\u6D12	s\u01CE	5	v	sprinkle|spray|spill|shed
\u81EA\u79F0	z\xEC ch\u0113ng	7	v	call oneself|claim to be|profess|claim a title
\u6BC1\u706D	hu\u01D0 mi\xE8	7	v	perish|ruin|destroy
\u6709\u540D	y\u01D2u m\xEDng	1	a	famous|well-known
\u88AB\u6355	b\xE8i b\u01D4	7	v	be arrested|under arrest
\u4E50\u610F	l\xE8 y\xEC	7	v	content|satisfied
\u8BED\u97F3	y\u01D4 y\u012Bn	4	n	speech sounds|pronunciation|phonetic|audio|voice|voice chat|voice message
\u54ED\u6CE3	k\u016B q\xEC	7	v	weep
\u7B79\u7801	ch\xF3u m\u01CE	7	n	bargaining chip|gaming chip|casino token
\u6C34\u6676	shu\u01D0 j\u012Bng	7	n	crystal
\u7784\u51C6	mi\xE1o zh\u01D4n	7	v	take aim at|target
\u8111\u6D77	n\u01CEo h\u01CEi	7	n	mind|brain
\u6CE8\u91CD	zh\xF9 zh\xF2ng	5	v	pay attention to|emphasize
\u591C\u95F4	y\xE8 ji\u0101n	5	t	nighttime|evening or night
\u4F1A\u8C08	hu\xEC t\xE1n	5	v	talks|discussions
\u61D2	l\u01CEn	6	a	lazy
\u53CC\u91CD	shu\u0101ng ch\xF3ng	7	b	double
\u6709\u52A9\u4E8E	y\u01D2u zh\xF9 y\xFA	7	v	contribute to|promote
\u9662\u957F	yu\xE0n zh\u01CEng	2	n	chair of a board|president of a university|department head|dean
\u4F20\u8FBE	chu\xE1n d\xE1	5	v	pass on|convey|relay|transmit|transmission
\u56FE\u6848	t\xFA \xE0n	4	n	design|pattern
\u51C6\u65F6	zh\u01D4n sh\xED	4	ad	on time|punctual|on schedule
\u5927\u592B	d\xE0i fu	3	n	doctor|physician|senior official
\u7B49\u5019	d\u011Bng h\xF2u	5	v	wait|wait for
\u6345	t\u01D2ng	7	v	stab|poke|prod|nudge|disclose
\u76D2\u5B50	h\xE9 zi	5	n	box|case
\u7EAA\u5F8B	j\xEC l\u01DC	4	n	discipline
\u64A4\u9500	ch\xE8 xi\u0101o	6	v	repeal|revoke|undo
\u9762\u79EF	mi\xE0n j\u012B	3	n	area|surface area|tract of land
\u63A9\u9970	y\u01CEn sh\xEC	7	v	cover up|conceal|mask|gloss over
\u7EC8\u6B62	zh\u014Dng zh\u01D0	5	v	stop|terminate
\u95EA\u7535	sh\u01CEn di\xE0n	4	n	lightning
\u63A9\u76D6	y\u01CEn g\xE0i	7	v	conceal|hide behind|cover up
\u6253\u626B	d\u01CE s\u01CEo	4	v	clean|sweep
\u6807\u7B7E	bi\u0101o qi\u0101n	7	n	label|tag|tab
\u4E0A\u4E2A\u6708	sh\xE0ng g\xE8 yu\xE8	4	t	last month
\u6F14\u4E60	y\u01CEn x\xED	7	vn	maneuver|exercise|practice
\u5F69\u7968	c\u01CEi pi\xE0o	5	n	lottery ticket
\u6843	t\xE1o	5	n	peach
\u827E\u6ECB\u75C5	\xE0i z\u012B b\xECng	7	n	aids
\u9677\u9631	xi\xE0n j\u01D0ng	7	n	pitfall|snare|trap
\u7528\u529B	y\xF2ng l\xEC	7	ad	exert oneself physically
\u524D\u540E	qi\xE1n h\xF2u	3	f	around|from beginning to end|all around|front and rear
\u6CD5\u89C4	f\u01CE gu\u012B	5	n	legislation|statute
\u5E7F\u6CDB	gu\u01CEng f\xE0n	5	a	extensive|wide range
\u7AE5\u8BDD	t\xF3ng hu\xE0	4	n	children's fairy tales
\u5F97\u610F	d\xE9 y\xEC	4	a	proud of oneself|pleased with oneself|complacent
\u62E8\u6253	b\u014D d\u01CE	6	v	call|dial
\u80CE	t\u0101i	7	g	fetus|padding|womb carrying a fetus|origin|source|tire
\u6765\u7535	l\xE1i di\xE0n	7	v	incoming telephone call|phone in|send in a telegram|come back
\u7B52	t\u01D2ng	7	g	tube|cylinder|encase in sth cylindrical
\u5E72\u6D89	g\u0101n sh\xE8	6	v	interfere|meddle|interference
\u7EC4\u5EFA	z\u01D4 ji\xE0n	7	v	organize|set up|establish
\u52A0\u5DE5	ji\u0101 g\u014Dng	3	v	process|processing|working
\u5236\u6B62	zh\xEC zh\u01D0	7	v	curb|put a stop to|stop|check|limit
\u8D27\u5E01	hu\xF2 b\xEC	7	n	currency|monetary|money
\u963B\u788D	z\u01D4 \xE0i	5	v	obstruct|hinder|block|obstruction|hindrance
\u534E\u4E3D	hu\xE1 l\xEC	7	a	gorgeous
\u64CD\u7EB5	c\u0101o z\xF2ng	6	v	operate|control|rig|manipulate
\u6FC0\u53D1	j\u012B f\u0101	7	v	arouse|stimulate|excite
\u9057\u5FD8	y\xED w\xE0ng	7	v	forget
\u884C\u7A0B	x\xEDng ch\xE9ng	6	n	journey|course of a journey|distance traveled|trajectory|itinerary|route|course|stroke
\u624B\u5957	sh\u01D2u t\xE0o	4	n	glove|mitten
\u5B66\u8D39	xu\xE9 f\xE8i	3	n	tuition fee|tuition
\u76F8\u5E94	xi\u0101ng y\xECng	5	v	correspond|answering|agree|corresponding|relevant|appropriate|accordingly
\u8FD1\u6765	j\xECn l\xE1i	5	d	recently|lately
\u540C\u4F34	t\xF3ng b\xE0n	7	n	companion|comrade|fellow
\u6C9F	g\u014Du	5	n	ditch|gutter|groove|gully|ravine
\u79EF	j\u012B	7	v	amass|accumulate|store|measured quantity|product|integrate|old|long-standing
\u4E0D\u5DF2	b\xF9 y\u01D0	7	v	endlessly|incessantly
\u524D\u65B9	qi\xE1n f\u0101ng	6	s	ahead|front
\u5730\u5E26	d\xEC d\xE0i	5	n	zone
\u51C6\u5219	zh\u01D4n z\xE9	7	n	norm|standard|criterion
\u53CA\u5176	j\xED q\xED	7	cc	and its|and their|and his|and her
\u62A5\u916C	b\xE0o chou	7	n	reward|remuneration
\u5929\u7136	ti\u0101n r\xE1n	6	b	natural
\u53EF\u7591	k\u011B y\xED	7	a	suspicious|dubious
\u8FDD\u89C4	w\xE9i gu\u012B	5	v	violate the rules
\u4E2B\u5934	y\u0101 tou	7	n	girl|servant girl
\u6405	ji\u01CEo	7	v	disturb|annoy|mix|stir
\u54C1\u79CD	p\u01D0n zh\u01D2ng	5	n	breed|variety
\u7F6A\u6076	zu\xEC \xE8	6	n	crime|evil|sin
\u793C\u8C8C	l\u01D0 m\xE0o	5	an	courtesy|politeness|manners|courteous|polite
\u8BB0\u8F7D	j\xEC z\u01CEi	4	v	write down|record|written account
\u6781\u9650	j\xED xi\xE0n	7	n	limit|extreme boundary
\u4E1C\u5317	D\u014Dng b\u011Bi	2	s	northeast china|manchuria|northeast
\u6BD5\u4E1A\u751F	b\xEC y\xE8 sh\u0113ng	4	n	graduate
\u91D1\u989D	j\u012Bn \xE9	6	n	sum of money|monetary value
\u8BBD\u523A	f\u011Bng c\xEC	7	v	satirize|mock|irony|satire|sarcasm
\u8D50	c\xEC	7	v	confer|bestow|grant|taiwan pr
\u661F\u5EA7	x\u012Bng zu\xF2	7	n	constellation|astrological sign
\u6084\u6084	qi\u0101o qi\u0101o	5	d	quiet|surreptitious|stealthy|anxious|worried|taiwan pr
\u5DEE\u8DDD	ch\u0101 j\xF9	5	n	disparity|gap
\u820C\u5934	sh\xE9 tou	6	n	tongue
\u8FDD\u80CC	w\xE9i b\xE8i	7	v	go against|be contrary to|violate
\u4E2D\u90E8	zh\u014Dng b\xF9	3	f	middle part|central section
\u603B\u5171	z\u01D2ng g\xF2ng	4	d	altogether|in sum|in all|in total
\u6B4C\u58F0	g\u0113 sh\u0113ng	3	n	singing voice
\u5DE5\u5730	g\u014Dng d\xEC	7	n	construction site
\u5455\u5410	\u01D2u t\xF9	7	v	vomit
\u539F\u544A	yu\xE1n g\xE0o	6	n	complainant|plaintiff
\u5E05\u54E5	shu\xE0i g\u0113	4	nr	handsome guy|lady-killer|handsome
\u7CAE\u98DF	li\xE1ng shi	4	n	foodstuff|cereals
\u7F8E\u5BB9	m\u011Bi r\xF3ng	6	vn	improve one's appearance|make oneself more attractive|beautify
\u5468\u8FB9	zh\u014Du bi\u0101n	7	n	periphery|rim|surroundings|all around|perimeter|peripheral|spin-offs
\u63CD	z\xF2u	7	v	hit|beat|smash
\u7CD6\u5C3F\u75C5	t\xE1ng ni\xE0o b\xECng	7	n	diabetes|diabetes mellitus
\u5206\u6210	f\u0113n ch\xE9ng	5	v	divide|split a bonus|break into|tenths|percentage allotment
\u4E13\u5229	zhu\u0101n l\xEC	5	n	patent|monopoly
\u8BC1\u4E66	zh\xE8ng sh\u016B	5	n	credentials|certificate
\u6027\u547D	x\xECng m\xECng	7	n	life
\u7279\u610F	t\xE8 y\xEC	6	d	specially|intentionally
\u4E3B\u6F14	zh\u01D4 y\u01CEn	7		act the leading role|star|lead actor
\u6350\u6B3E	ju\u0101n ku\u01CEn	6	v	donate money|contribute funds|donation|contribution
\u7CCA\u6D82	h\xFA tu	7	a	muddled|silly|confused
\u5408\u6210	h\xE9 ch\xE9ng	5	vn	compose|constitute|compound|synthesis|mixture|synthetic
\u614C	hu\u0101ng	5	a	get panicky|lose one's head|terribly
\u8C46\u8150	d\xF2u fu	4	n	tofu|bean curd
\u540C\u6B65	t\xF3ng b\xF9	7	v	synchronous|synchronize|keep step with
\u9884\u6599	y\xF9 li\xE0o	7	v	forecast|anticipate|expectation
\u63A8\u8FDF	tu\u012B ch\xED	4	v	postpone|put off|defer
\u8001\u5BB6	l\u01CEo ji\u0101	4	n	native place|place of origin|home state or region
\u997C\u5E72	b\u01D0ng g\u0101n	5	n	biscuit|cracker|cookie
\u4FC3\u8FDB	c\xF9 j\xECn	4	v	promote|advance|boost
\u4F55\u5FC5	h\xE9 b\xEC	7	d	there is no need|why should
\u7EA6\u675F	yu\u0113 sh\xF9	5	vn	restrict|limit to|constrain|restriction|constraint
\u56E2\u4F19	tu\xE1n hu\u01D2	7	n	gang|gang member|accomplice|crony
\u9EBB\u9189	m\xE1 zu\xEC	7	v	anesthesia|anesthetize|corrupt|enervate|numb the mind
\u75C5\u623F	b\xECng f\xE1ng	6	n	ward|sickroom
\u8461\u8404	p\xFA tao	5	n	grape
\u5BA1\u7406	sh\u011Bn l\u01D0	6	v	hear
\u80E1\u5B50	h\xFA zi	5	n	beard|mustache or whiskers|facial hair|bandit
\u5171\u8BC6	g\xF2ng sh\xED	7	n	common understanding|consensus
\u5185\u5728	n\xE8i z\xE0i	5	b	inner|internal|intrinsic|innate
\u7814\u53D1	y\xE1n f\u0101	6	v	research and development|develop
\u62B5\u62BC	d\u01D0 y\u0101	7	vn	put up collateral
\u897F\u88C5	x\u012B zhu\u0101ng	5	n	suit|western-style clothes
\u7334	h\xF3u	5	g	monkey
\u7C89\u8272	f\u011Bn s\xE8	6	n	pink|white|erotic|beautiful woman|powdered
\u9996\u8981	sh\u01D2u y\xE0o	7	b	most important|of chief importance
\u4F18\u60E0	y\u014Du hu\xEC	5	vn	privilege|favorable|preferential|discount
\u4F2A\u88C5	w\u011Bi zhu\u0101ng	7	v	pretend to be|disguise oneself as|pretense|disguise|camouflage
\u516C\u544A	g\u014Dng g\xE0o	5	n	post|announcement
\u66F2\u7EBF	q\u016B xi\xE0n	7	n	curve|curved line|indirect|in a roundabout way
\u5598	chu\u01CEn	7	v	gasp|pant|asthma
\u5438\u6BD2	x\u012B d\xFA	6	v	take drugs
\u62AC\u5934	t\xE1i t\xF3u	5	v	raise one's head|gain ground
\u62FF\u8D70	n\xE1 z\u01D2u	6	v	take away
\u72EC\u5BB6	d\xFA ji\u0101	7	d	exclusive
\u6076\u52A3	\xE8 li\xE8	7	a	vile|nasty|of very poor quality
\u8FC7\u540E	gu\xF2 h\xF2u	6	t	after the event
\u4EFB\u610F	r\xE8n y\xEC	7	d	any|arbitrary|at will|at random
\u5B57\u6BCD	z\xEC m\u01D4	4	n	letter
\u4E2D\u6587	Zh\u014Dng w\xE9n	1	nz	chinese language
\u591C\u91CC	y\xE8 li	2	t	during the night|at night|nighttime
\u5F00\u9664	k\u0101i ch\xFA	7	v	expel|fire
\u62FD	y\xE8	7	v	drag|haul|throw|fling|pull|tug at
\u7B54\u590D	d\xE1 f\xF9	5	v	answer|reply|reply to
\u5893	m\xF9	6	n	grave|tomb|mausoleum
\u5FD9\u788C	m\xE1ng l\xF9	7	a	busy|bustling
\u97F3\u4E50\u4F1A	y\u012Bn yu\xE8 hu\xEC	2	n	concert
\u4F20\u8F93	chu\xE1n sh\u016B	6	vn	transmit|transmission
\u611F\u4EBA	g\u01CEn r\xE9n	6	a	touching|moving
\u7070\u8272	hu\u012B s\xE8	5	n	gray|ash gray|grizzly|pessimistic|gloomy|dispirited|ambiguous
\u9677	xi\xE0n	7	v	pitfall|trap|get stuck|sink|cave in|frame|capture|fall
\u540C\u884C	t\xF3ng x\xEDng	6	n	journey together
\u9AD8\u6863	g\u0101o d\xE0ng	6	b	superior quality|high grade|top grade
\u4E2D\u5E74	zh\u014Dng ni\xE1n	2	t	middle age
\u5E9F\u8BDD	f\xE8i hu\xE0	7	n	nonsense|rubbish|superfluous words|you don't say|no kidding
\u6FC0\u5149	j\u012B gu\u0101ng	7	n	laser
\u56FD\u52A1\u9662	Gu\xF3 w\xF9 yu\xE0n	6	nt	state council|state department
\u675F	sh\xF9	3	q	bind|bunch|bundle|control
\u4E2A\u522B	g\xE8 bi\xE9	4	a	individually|one by one|just one or two|exceptional|rare
\u6296	d\u01D2u	7	v	tremble|shake out|reveal
\u627E\u51FA	zh\u01CEo ch\u016B	2		find|search out
\u9662\u5B50	yu\xE0n zi	2	n	courtyard|garden|yard|patio|servant
\u635F	s\u01D4n	7	g	decrease|lose|damage|harm|ridicule|deride|caustic|sarcastic
\u65F6\u7A7A	sh\xED k\u014Dng	7	n	time and place|space-time
\u8774\u8776	h\xFA di\xE9	5	n	butterfly
\u971C	shu\u0101ng	7	n	frost|frosting|cream
\u6D41\u8840	li\xFA xu\xE8	7	v	bleed|shed blood
\u5229\u606F	l\xEC x\u012B	4	n	interest
\u5E94\u6025	y\xECng j\xED	6	vn	respond to an emergency|meet a contingency|emergency
\u5426\u5B9A	f\u01D2u d\xECng	3	v	negate|deny|reject|negative|negation
\u6025\u6551	j\xED ji\xF9	6	vn	give emergency treatment|first aid
\u9500\u91CF	xi\u0101o li\xE0ng	7	n	sales volume
\u516B\u5366	b\u0101 gu\xE0	7	n	gossip|gossipy
\u662F\u975E	sh\xEC f\u0113i	7	n	right and wrong|quarrel
\u7075\u6D3B	l\xEDng hu\xF3	6	a	flexible|nimble|agile
\u8A00\u8BBA	y\xE1n l\xF9n	7	n	expression of opinion|views|remarks|arguments
\u4E3B\u5F20	zh\u01D4 zh\u0101ng	3	v	advocate|stand for|view|position|stand|proposition|viewpoint|assertion
\u8FA3\u6912	l\xE0 ji\u0101o	7	n	hot pepper|chili
\u65E0\u654C	w\xFA d\xED	7	v	unequalled|without rival|paragon
\u8DDF\u968F	g\u0113n su\xED	5	v	follow
\u8BA4\u51FA	r\xE8n ch\u016B	3	v	recognition|recognize
\u660F\u8FF7	h\u016Bn m\xED	7	v	lose consciousness|be in a coma|stupor|coma|stunned|disoriented
\u7F55\u89C1	h\u01CEn ji\xE0n	7	a	rare|rarely seen
\u8FD0\u8F6C	y\xF9n zhu\u01CEn	7	v	work|operate|revolve|turn around
\u5B98\u53F8	gu\u0101n si	6	n	lawsuit
\u6CA1\u6536	m\xF2 sh\u014Du	6	v	confiscate|seize
\u6027\u522B	x\xECng bi\xE9	3	n	gender|sex
\u5AE9	n\xE8n	7	a	young and tender|tender|lightly cooked|light|inexperienced|unskilled
\u8F89\u714C	hu\u012B hu\xE1ng	7	a	splendid|glorious
\u6F6E\u6D41	ch\xE1o li\xFA	4	n	tide|current|trend
\u5206\u7C7B	f\u0113n l\xE8i	5	vn	classify
\u6C99\u6EE9	sh\u0101 t\u0101n	7	n	beach|sandy shore
\u6D41\u6D6A	li\xFA l\xE0ng	7	v	drift about|wander|roam|nomadic|homeless|unsettled|vagrant
\u624B\u67AA	sh\u01D2u qi\u0101ng	7	n	pistol
\u6070\u6070	qi\xE0 qi\xE0	6	d	exactly|just|precisely
\u611F\u6069	g\u01CEn \u0113n	7	v	be grateful
\u6751\u5E84	c\u016Bn zhu\u0101ng	6	n	village|hamlet
\u826F\u5FC3	li\xE1ng x\u012Bn	7	n	conscience
\u5916\u90E8	w\xE0i b\xF9	6	f	outside|external|exterior|surface
\u706B\u70AC	hu\u01D2 j\xF9	7	n	torch
\u4EB2\u5207	q\u012Bn qi\xE8	3	a	amiable|cordial|close and dear|familiar
\u53CB\u60C5	y\u01D2u q\xEDng	7	n	friendly feelings|friendship
\u51FA\u5356	ch\u016B m\xE0i	7	v	offer for sale|sell|sell out|betray
\u53D1\u5E03\u4F1A	f\u0101 b\xF9 hu\xEC	7	n	news conference|briefing
\u9884\u8BA2	y\xF9 d\xECng	4	v	place an order|book ahead
\u68A6\u5E7B	m\xE8ng hu\xE0n	7	n	dream|illusion|reverie
\u6253\u52A8	d\u01CE d\xF2ng	6	v	move|arousing|touching
\u9C9C\u8840	xi\u0101n xu\xE8	7	n	blood
\u4E89\u5435	zh\u0113ng ch\u01CEo	7	v	quarrel|dispute
\u5145\u8DB3	ch\u014Dng z\xFA	5	a	adequate|sufficient|abundant
\u9B54\u672F	m\xF3 sh\xF9	7	n	magic
\u540D\u79F0	m\xEDng ch\u0113ng	2	n	name
\u5730\u6BEF	d\xEC t\u01CEn	7	n	carpet|rug
\u5411\u4E0A	xi\xE0ng sh\xE0ng	5	v	upward|up|advance|try to improve oneself|make progress
\u889C\u5B50	w\xE0 zi	4	n	socks|stockings
\u63A8\u9500	tu\u012B xi\u0101o	4	v	market|sell
\u5F1F	d\xEC	1	n	younger brother|junior male|i
\u6C14\u5019	q\xEC h\xF2u	3	n	climate|prevailing conditions
\u6BDB\u5DFE	m\xE1o j\u012Bn	4	n	towel
\u9884\u7EA6	y\xF9 yu\u0113	6	v	booking|reservation|book|make an appointment
\u529E\u7406	b\xE0n l\u01D0	3	v	handle|transact|conduct
\u8D8B\u52BF	q\u016B sh\xEC	4	n	trend|tendency
\u673A\u5236	j\u012B zh\xEC	5	n	machine-processed|machine-made|mechanism
\u6DF1\u591C	sh\u0113n y\xE8	7	t	very late at night
\u62A2\u6551	qi\u01CEng ji\xF9	5	v	rescue
\u8270\u82E6	ji\u0101n k\u01D4	5	a	difficult|hard|arduous
\u900F\u8FC7	t\xF2u gu\xF2	7	v	pass through|penetrate|by means of|via
\u751C\u7F8E	ti\xE1n m\u011Bi	7	a	sweet|pleasant|happy
\u53D7\u5BB3\u4EBA	sh\xF2u h\xE0i r\xE9n	7	n	victim
\u96C7	g\xF9	7	v	employ|hire|rent
\u6444\u50CF\u673A	sh\xE8 xi\xE0ng j\u012B	5	n	video camera
\u4E00\u5E26	y\u012B d\xE0i	5	n	region|district
\u4E50\u56ED	l\xE8 yu\xE1n	7	n	paradise
\u53D1\u80B2	f\u0101 y\xF9	7	v	develop|mature|growth|development
\u5413\u4EBA	xi\xE0 r\xE9n	7	a	scare|scary|frightening
\u5149\u8292	gu\u0101ng m\xE1ng	7	n	rays of light|brilliant rays|radiance
\u6D77\u6EE9	h\u01CEi t\u0101n	7	n	beach
\u70ED\u95E8	r\xE8 m\xE9n	5	a	popular|hot|in vogue
\u7EC8\u70B9	zh\u014Dng di\u01CEn	5	n	end|end point|finishing line|destination|terminus
\u989D\u5916	\xE9 w\xE0i	7	b	extra|added|additional
\u94A2\u94C1	g\u0101ng ti\u011B	5	n	steel
\u540D\u724C	m\xEDng p\xE1i	5	n	famous brand|nameplate|name tag
\u7CBE\u786E	j\u012Bng qu\xE8	7	a	accurate|precise
\u66F4\u6362	g\u0113ng hu\xE0n	5	v	replace|change
\u9762\u90E8	mi\xE0n b\xF9	7	n	face
\u538B\u6291	y\u0101 y\xEC	7	v	constrain or repress emotions|oppressive|stifling|depressing|repression
\u4E22\u5931	di\u016B sh\u012B	7	v	lose|misplace
\u4F2A\u9020	w\u011Bi z\xE0o	7	v	forge|fake|counterfeit
\u89C4\u8303	gu\u012B f\xE0n	3	v	norm|standard|specification|regulation|rule|within the rules|fix rules|regulate
\u4E2D\u65AD	zh\u014Dng du\xE0n	5	v	cut short|break off|discontinue|interrupt
\u53EC\u96C6	zh\xE0o j\xED	7	v	convene|gather
\u4EB2\u773C	q\u012Bn y\u01CEn	6	d	with one's own eyes|personally
\u62DC\u8BBF	b\xE0i f\u01CEng	5	v	pay a visit|call on
\u9A9A\u6270	s\u0101o r\u01CEo	7	v	disturb|cause a commotion|harass
\u9F13\u638C	g\u01D4 zh\u01CEng	5	v	applaud|clap
\u533B\u836F	y\u012B y\xE0o	6	n	medical care and medicines|medicine|medical|pharmaceutical
\u5B66\u672F	xu\xE9 sh\xF9	4	n	learning|science|academic
\u539F\u6599	yu\xE1n li\xE0o	4	n	raw material
\u52A8\u6001	d\xF2ng t\xE0i	5	n	movement|motion|development|trend|dynamic
\u53EF\u4E50	k\u011B l\xE8	3	n	amusing|entertaining|cola
\u900F\u660E	t\xF2u m\xEDng	4	a	transparent|open to scrutiny
\u82B1\u6837	hu\u0101 y\xE0ng	7	n	pattern|way of doing sth|trick|ruse
\u8C03\u8282	ti\xE1o ji\xE9	5	v	adjust|regulate|harmonize|reconcile
\u4EB2\u624B	q\u012Bn sh\u01D2u	7	d	personally|with one's own hands
\u9891\u7E41	p\xEDn f\xE1n	5	a	frequently|often
\u603B\u76D1	z\u01D2ng ji\u0101n	6	n	head|director|commissioner|inspector-general
\u4F9B\u7ED9	g\u014Dng j\u01D0	6	vn	furnish|provide|supply
\u5206\u6570	f\u0113n sh\xF9	2	n	grade|mark|score|fraction
\u6FC0\u6D3B	j\u012B hu\xF3	7	v	activate
\u7535\u89C6\u673A	di\xE0n sh\xEC j\u012B	1	n	television set
\u4E0A\u8BC9	sh\xE0ng s\xF9	7	v	appeal
\u672A\u7ECF	w\xE8i j\u012Bng	7	d	not having undergone|without
\u8FD1\u671F	j\xECn q\u012B	3	t	near in time|in the near future|very soon|recent
\u618B	bi\u0113	7	v	choke|stifle|restrain|hold back|hold in|hold
\u644A	t\u0101n	7	g	spread out|vendor's stand
\u4EFB\u547D	r\xE8n m\xECng	7	v	appoint|appointment
\u73AF\u7403	hu\xE1n qi\xFA	7	n	around the world|worldwide
\u7A81\u53D1	t\u016B f\u0101	7	vn	occur suddenly
\u8F70	h\u014Dng	7	v	explosion|bang|boom|rumble|attack|shoo away|expel
\u64A4\u79BB	ch\xE8 l\xED	6	v	withdraw from|evacuate
\u542C\u53D6	t\u012Bng q\u01D4	6	v	hear|listen to
\u5730\u7406	d\xEC l\u01D0	7	n	geography
\u65E0\u60C5	w\xFA q\xEDng	7	a	pitiless|ruthless|merciless|heartless
\u4E3A\u4EBA	w\xE9i r\xE9n	7	n	conduct oneself|behavior|conduct|personal character|for sb|for others' interest
\u7FC5\u8180	ch\xEC b\u01CEng	7	n	wing
\u6570\u76EE	sh\xF9 m\xF9	5	n	amount|number
\u5F00\u573A	k\u0101i ch\u01CEng	7	v	begin|open|start|beginning of an event
\u5F53\u9009	d\u0101ng xu\u01CEn	5	v	be elected|be selected
\u5BB9\u5FCD	r\xF3ng r\u011Bn	7	v	put up with|tolerate
\u6743\u76CA	qu\xE1n y\xEC	7	n	rights|interests|rights and benefits
\u9633\u53F0	y\xE1ng t\xE1i	4	n	balcony|porch
\u6563\u53D1	s\xE0n f\u0101	7	v	distribute|emit|issue
\u9080	y\u0101o	7	v	invite|request|intercept|solicit|seek
\u4E38	w\xE1n	7	g	ball|pellet|pill
\u9632\u62A4	f\xE1ng h\xF9	7	vn	defend|protect
\u827A\u4EBA	y\xEC r\xE9n	6	n	performing artist|actor
\u575A\u4FE1	ji\u0101n x\xECn	7	v	believe firmly|without any doubt
\u51FA\u540D	ch\u016B m\xEDng	6	a	well-known for sth|become well known|make one's mark|lend one's name
\u6298\u817E	zh\u0113 teng	7	v	torment sb|play crazy|squander
\u5BFB\u5E38	x\xFAn ch\xE1ng	7	a	usual|common|ordinary
\u4FAE\u8FB1	w\u01D4 r\u01D4	7	v	insult|humiliate|dishonor
\u9879\u94FE	xi\xE0ng li\xE0n	7	n	necklace
\u4E00\u65E9	y\u012B z\u01CEo	7	t	early in the morning|at dawn
\u6770\u51FA	ji\xE9 ch\u016B	6	a	outstanding|distinguished|remarkable|prominent|illustrious
\u9F13\u821E	g\u01D4 w\u01D4	7	v	heartening|boost
\u6284	ch\u0101o	4	v	make a copy|plagiarize|search and seize|raid|grab|go off with|take a shortcut|make a turning move
\u515C	d\u014Du	7	v	pocket|bag|move in a circle|canvas or solicit|take responsibility for|disclose in detail|combat armor
\u68CD	g\xF9n	7	g	stick|rod|truncheon
\u4F69\u670D	p\xE8i f\xFA	7	v	admire
\u5BD2\u51B7	h\xE1n l\u011Bng	4	a	cold|frigid|very cold
\u8BB8\u53EF\u8BC1	x\u01D4 k\u011B zh\xE8ng	7	n	license|authorization|permit
\u81F4\u529B\u4E8E	zh\xECl\xECy\xFA	7		dedicate
\u6811\u7ACB	sh\xF9 l\xEC	7	v	set up|establish
\u793C\u62DC	l\u01D0 b\xE0i	5	n	attend a religious service|week|sunday
\u9C9C\u82B1	xi\u0101n hu\u0101	4	n	flower|fresh flowers
\u626E	b\xE0n	7	v	disguise oneself as|dress up|play|put on
\u610F\u56FE	y\xEC t\xFA	7	n	intent|intention|intend
\u706B\u7130	hu\u01D2 y\xE0n	7	n	blaze|flame
\u74F6\u5B50	p\xEDng zi	2	n	bottle
\u59A8\u788D	f\xE1ng \xE0i	7	v	hinder|obstruct
\u6D88\u8017	xi\u0101o h\xE0o	6	v	use up|consume
\u4EE5\u514D	y\u01D0 mi\u01CEn	7	c	in order to avoid|so as not to
\u540D\u7247	m\xEDng pi\xE0n	4	n	card
\u5E73\u51E1	p\xEDng f\xE1n	6	a	commonplace|ordinary|mediocre
\u65E9\u996D	z\u01CEo f\xE0n	1	n	breakfast
\u82B1\u751F	hu\u0101 sh\u0113ng	6	n	peanut|groundnut
\u6076\u610F	\xE8 y\xEC	7	d	malice|evil intention
\u542C\u8BDD	t\u012Bng hu\xE0	7	a	obedient
\u76FC	p\xE0n	7	v	hope for|long for|expect
\u8BC4	p\xEDng	6	v	discuss|comment|criticize|judge|choose
\u4E0A\u53F8	sh\xE0ng si	7	n	boss|superior
\u8363\u5E78	r\xF3ng x\xECng	7	a	honored
\u9AD8\u8D35	g\u0101o gu\xEC	7	a	grandeur|noble
\u51AC\u5B63	d\u014Dng j\xEC	4	t	winter
\u8702\u871C	f\u0113ng m\xEC	7	n	honey
\u6028	yu\xE0n	5	v	blame|resentment|hatred|grudge
\u8A00\u8BED	y\xE1n y\u01D4	5	n	words|speech|language|speak|tell
\u7F13\u6162	hu\u01CEn m\xE0n	7	a	slow
\u518D\u4E5F	z\xE0i y\u011B	5	d	any more
\u5904\u5883	ch\u01D4 j\xECng	7	n	situation
\u521B\u4F24	chu\u0101ng sh\u0101ng	7	n	wound|injury|trauma
\u53D1\u8A00\u4EBA	f\u0101 y\xE1n r\xE9n	6	n	spokesperson
\u884C\u8D70	x\xEDng z\u01D2u	7	v	walk
\u524D\u666F	qi\xE1n j\u01D0ng	5	n	foreground|vista|prospects|perspective
\u54C4	h\xF2ng	7	v	tumult|uproar|commotion|disturbance|roar of laughter|hubbub|roar|deceive
\u8BF4\u8C0E	shu\u014D hu\u01CEng	7	v	lie|tell an untruth
\u56DE\u60F3	hu\xED xi\u01CEng	7	v	recall|recollect|think back
\u4F20\u771F	chu\xE1n zh\u0113n	5	n	fax|facsimile
\u7247\u523B	pi\xE0n k\xE8	6	m	short period of time|moment
\u796D	j\xEC	7	v	offer a sacrifice to|memorial ceremony|wield
\u8B66\u5B98	j\u01D0ng gu\u0101n	7	n	constable|police officer
\u5E55\u540E	m\xF9 h\xF2u	7	s	behind the scenes
\u6CAE\u4E27	j\u01D4 s\xE0ng	7	a	dispirited|dejected|dismayed
\u9690\u79C1	y\u01D0n s\u012B	6	n	secrets|private business|privacy
\u4E3E\u624B	j\u01D4 sh\u01D2u	2	v	raise a hand|put up one's hand
\u5012\u4E0B	d\u01CEo xi\xE0	7	v	collapse|topple over
\u5E9E\u5927	p\xE1ng d\xE0	7	a	huge|enormous|tremendous
\u6781\u4E3A	j\xED w\xE9i	7	d	extremely|exceedingly
\u7CD6\u679C	t\xE1ng gu\u01D2	7	n	candy
\u53D1\u6398	f\u0101 ju\xE9	7	v	excavate|explore|unearth|tap into
\u50A8\u5907	ch\u01D4 b\xE8i	7	vn	reserves|store up
\u667A\u529B	zh\xEC l\xEC	4	n	intelligence|intellect
\u901A\u62A5	t\u014Dng b\xE0o	6	v	inform|notify|announce|circular|bulletin|journal
\u6DB2\u4F53	y\xE8 t\u01D0	7	n	liquid
\u8461\u8404\u9152	p\xFA tao ji\u01D4	5	n	wine
\u8D44\u672C	z\u012B b\u011Bn	5	n	capital
\u5BB3\u7F9E	h\xE0i xi\u016B	7	a	shy|embarrassed|bashful
\u5360\u7528	zh\xE0n y\xF2ng	7	v	occupy
\u51FA\u8DEF	ch\u016B l\xF9	6	n	way out|opportunity for advancement|way forward|outlet
\u7096	d\xF9n	7	v	stew
\u5238	qu\xE0n	6	g	bond|contract|deed|ticket|voucher|certificate
\u809D\u810F	g\u0101n z\xE0ng	7	n	liver
\u76F2\u76EE	m\xE1ng m\xF9	7	a	blind|blindly|ignorant|lacking understanding
\u8FDF\u65E9	ch\xED z\u01CEo	7	d	sooner or later
\u51FA\u81EA	ch\u016B z\xEC	7	v	come from
\u8C1C	m\xED	7	n	riddle
\u5145	ch\u014Dng	7	v	sufficient|full|fill|serve as|act as|act falsely as|pose as
\u6108	y\xF9	6	d	more|recover|heal|better
\u4F34\u4FA3	b\xE0n l\u01DA	7	n	companion|mate|partner
\u8BEF\u89E3	w\xF9 ji\u011B	5	v	misunderstand|misunderstanding
\u7792	m\xE1n	7	v	conceal from|keep in the dark
\u81EA\u4E3B	z\xEC zh\u01D4	3	v	independent|act for oneself|autonomous
\u964D\u843D	ji\xE0ng lu\xF2	4	v	descend|land
\u516C\u8F66	g\u014Dng ch\u0113	7	n	bus
\u5BB4\u4F1A	y\xE0n hu\xEC	6	n	banquet|feast|dinner party
\u4E66\u9762	sh\u016B mi\xE0n	7	b	in writing|written
\u4EA4\u4EE3	ji\u0101o d\xE0i	5	v	transfer|give instructions|tell|explain|give an account|brief|confess|account for oneself
\u590D\u4E60	f\xF9 x\xED	2	v	review|revision
\u5CB8	\xE0n	5	n	bank|shore|beach|coast
\u6B65\u4F10	b\xF9 f\xE1	7	n	pace|step|march
\u5BBD\u5BB9	ku\u0101n r\xF3ng	7	v	lenient|tolerant|indulgent|charitable|forgive
\u7F8E\u4EBA	m\u011Bi r\xE9n	7	n	beauty|belle
\u9999\u70DF	xi\u0101ng y\u0101n	7	n	cigarette|smoke from burning incense
\u5F3A\u884C	qi\xE1ng x\xEDng	7	d	do sth by force|taiwan pr
\u5267\u9662	j\xF9 yu\xE0n	7	n	theater
\u624B\u811A	sh\u01D2u ji\u01CEo	7	n	hand and foot|movement of limbs|action|trick|step in a procedure
\u6709\u673A	y\u01D2u j\u012B	7	b	organic
\u6B21\u6570	c\xEC sh\xF9	6	n	number of times|frequency|order number|power|degree of a polynomial
\u7531\u6B64	y\xF3u c\u01D0	5	d	hereby|from this
\u666E\u901A\u4EBA	p\u01D4 t\u014Dng r\xE9n	7	n	ordinary person|private citizen|people|person in the street
\u59FF\u6001	z\u012B t\xE0i	7	n	attitude|posture|stance
\u54CD\u8D77	xi\u01CEng q\u01D0	7	v	come forth|ring out|sound|go off
\u5C3E\u5DF4	w\u011Bi ba	4	n	tail|colloquial pr
\u7D20\u8D28	s\xF9 zh\xEC	6	n	inner quality|basic essence
\u671D\u7740	ch\xE1o zhe	7	p	towards
\u7ECF\u8D39	j\u012Bng f\xE8i	5	n	funds|expenditure
\u793E\u4EA4	sh\xE8 ji\u0101o	7	n	interaction|social contact
\u8054\u60F3	li\xE1n xi\u01CEng	5	v	associate|make an associative connection|mental association|lenovo
\u6D74\u5BA4	y\xF9 sh\xEC	7	n	bathroom
\u7EA0\u7EB7	ji\u016B f\u0113n	6	n	dispute
\u901A\u5F80	t\u014Dng w\u01CEng	7	v	lead to
\u8D77\u70B9	q\u01D0 di\u01CEn	6	n	starting point
\u699C\u6837	b\u01CEng y\xE0ng	7	n	example|model
\u5E7C\u7A1A	y\xF2u zh\xEC	7	a	young|childish|puerile
\u968F\u8EAB	su\xED sh\u0113n	7	d	on one's person|with one
\u521B\u5EFA	chu\xE0ng ji\xE0n	6	v	found|establish
\u540E\u8005	h\xF2u zh\u011B	7	r	latter
\u8D70\u79C1	z\u01D2u s\u012B	6	v	smuggle|have an illicit affair
\u8BC8\u9A97	zh\xE0 pi\xE0n	7	vn	defraud|swindle|blackmail
\u5C3D\u5934	j\xECn t\xF3u	7	f	end|extremity|limit
\u6B4C\u8FF7	g\u0113 m\xED	3	n	fan of a singer
\u633D\u6551	w\u01CEn ji\xF9	7	v	save|remedy|rescue
\u6269\u5F20	ku\xF2 zh\u0101ng	7	v	expansion|dilation|expand|broaden
\u7F5A\u6B3E	f\xE1 ku\u01CEn	5	v	fine|penalty
\u773C\u4E0B	y\u01CEn xi\xE0	7	t	now|at present|subocular
\u63E1\u624B	w\xF2 sh\u01D2u	3	v	shake hands
\u4E00\u70B9\u513F	y\u012B di\u01CEn r	1	mq	bit|little bit|least bit|bit more
\u6447\u5934	y\xE1o t\xF3u	5	v	shake one's head
\u4E0D\u987E	b\xF9 g\xF9	5	v	in spite of|regardless of
\u5269\u4F59	sh\xE8ng y\xFA	7	vn	remainder|surplus
\u79DF\u91D1	z\u016B j\u012Bn	6	n	rent
\u6B67\u89C6	q\xED sh\xEC	7	vn	discriminate against|discrimination
\u653E\u8FC7	f\xE0ng gu\xF2	7	v	let off|let slip by
\u6DA6	r\xF9n	7	v	moist|glossy|sleek|moisten|lubricate|embellish|enhance|profit
\u5DEE\u5F02	ch\u0101 y\xEC	6	n	difference|discrepancy
\u667A\u80FD	zh\xEC n\xE9ng	4	n	intelligent|able|smart
\u624B\u5DE5	sh\u01D2u g\u014Dng	4	n	handwork|manual
\u8BFE\u5802	k\xE8 t\xE1ng	2	n	classroom
\u65E0\u610F	w\xFA y\xEC	7	v	inadvertent|accidental|have no intention of
\u6C14\u5473	q\xEC w\xE8i	7	n	odor|scent
\u88C2	li\xE8	6	v	split|crack|break open|rend
\u63A8\u6D4B	tu\u012B c\xE8	7	v	speculation|conjecture|surmise|speculate
\u6548\u529B	xi\xE0o l\xEC	7	n	effectiveness|positive effect|serve
\u70B9\u71C3	di\u01CEn r\xE1n	5	v	ignite|set on fire|aflame
\u601D\u5FF5	s\u012B ni\xE0n	7	v	think of|long for|miss
\u5239\u8F66	sh\u0101 ch\u0113	7	n	brake|stop|switch off|check
\u9664\u6B64\u4E4B\u5916	ch\xFA c\u01D0 zh\u012B w\xE0i	7	l	apart from this|in addition to this
\u5FC3\u6001	x\u012Bn t\xE0i	5	n	attitude|state of one's psyche|way of thinking|mentality
\u6B47	xi\u0113	5	v	rest|take a break|stop|halt|sleep|moment|short while
\u4FB5\u7565	q\u012Bn lu:\xE8	7	v	invade|invasion
\u7CA5	zh\u014Du	6	n	congee|gruel|porridge
\u8179\u90E8	f\xF9 b\xF9	7	n	abdomen|belly|flank
\u6765\u4FE1	l\xE1i x\xECn	5	n	incoming letter|send us a letter
\u5BA3\u79F0	xu\u0101n ch\u0113ng	7	v	assert|claim
\u603B\u4F53	z\u01D2ng t\u01D0	5	n	completely|totally|total|entire|overall|population
\u539F\u7406	yu\xE1n l\u01D0	5	n	principle|theory
\u5A01\u529B	w\u0113i l\xEC	7	n	might|formidable power
\u6765\u5F97\u53CA	l\xE1i de j\xED	4	v	have enough time|can still make it
\u8D26	zh\xE0ng	6	n	account|bill|debt
\u5C0F\u533A	xi\u01CEo q\u016B	7	n	neighborhood|district
\u6709\u4E8B	y\u01D2u sh\xEC	6	v	be occupied with sth
\u522B\u8BF4	bi\xE9 shu\u014D	7		say nothing of|not to mention|let alone
\u767B\u5F55	d\u0113ng l\xF9	4	v	register|log in
\u5C42\u9762	c\xE9ng mi\xE0n	6	n	aspect|facet|level|bedding plane
\u7A77\u4EBA	qi\xF3ng r\xE9n	4	n	poor people|poor
\u7B26\u53F7	f\xFA h\xE0o	4	n	symbol|mark|sign
\u65BD\u5DE5	sh\u012B g\u014Dng	7	v	construction
\u7FFC	y\xEC	6	g	wing|assist
\u51FA\u56FD	ch\u016B gu\xF3	2	v	go abroad|leave the country
\u52FF	w\xF9	7	d	do not
\u6FC0\u7D20	j\u012B s\xF9	7	n	hormone
\u9686\u91CD	l\xF3ng zh\xF2ng	7	a	grand|prosperous|ceremonious|solemn
\u7834\u88C2	p\xF2 li\xE8	7	v	burst|rupture|break down
\u76DB	sh\xE8ng	7	v	flourishing|vigorous|magnificent|extensively|hold|contain|ladle
\u4F53\u5236	t\u01D0 zh\xEC	7	n	system|organization
\u5E9F\u7269	f\xE8i w\xF9	7	n	rubbish|waste material|useless person
\u8FF7\u5931	m\xED sh\u012B	7	v	lose|get lost
\u5B88\u62A4	sh\u01D2u h\xF9	7	v	guard|protect
\u6E05\u6668	q\u012Bng ch\xE9n	5	t	early morning
\u534F\u5546	xi\xE9 sh\u0101ng	6	v	consult with|talk things over|agreement
\u6C11\u95F4	m\xEDn ji\u0101n	3	n	among the people|popular|folk|non-governmental
\u59D4\u5458	w\u011Bi yu\xE1n	7	n	committee member
\u89C6\u91CE	sh\xEC y\u011B	7	n	field of view|outlook|perspective
\u54B3\u55FD	k\xE9 sou	7	v	cough
\u5E94\u5BF9	y\xECng du\xEC	6	v	answer|reply|handle|deal with|response
\u9898\u76EE	t\xED m\xF9	3	n	subject|title|topic
\u8E66	b\xE8ng	7	v	jump|bounce|hop
\u8282\u7701	ji\xE9 sh\u011Bng	4	v	saving|save|use sparingly|cut down on
\u7814\u7A76\u751F	y\xE1n ji\u016B sh\u0113ng	4	n	graduate student|postgraduate student|research student
\u5360\u6709	zh\xE0n y\u01D2u	5	v	have|own|hold|occupy|possess|account for
\u6837\u54C1	y\xE0ng p\u01D0n	7	n	sample|specimen
\u96F7\u8FBE	l\xE9i d\xE1	6	n	radar
\u5173\u8282	gu\u0101n ji\xE9	7	n	joint|key point|critical phase
\u5916\u6765	w\xE0i l\xE1i	6	b	external|foreign|outside
\u8FB9\u754C	bi\u0101n ji\xE8	7	n	boundary|border
\u5ACC\u7591	xi\xE1n y\xED	7	n	suspicion|have suspicions
\u56F4\u5DFE	w\xE9i j\u012Bn	4	n	scarf|shawl
\u54CE\u54DF	\u0101i y\u014D	6	e	hey|ow|ouch
\u6CE2\u52A8	b\u014D d\xF2ng	6	vn	undulate|fluctuate|wave motion|rise and fall
\u6D77\u76D7	h\u01CEi d\xE0o	7	n	pirate
\u79CB\u5929	qi\u016B ti\u0101n	2	t	autumn
\u5BFC\u5E08	d\u01CEo sh\u012B	7	n	tutor|teacher|academic advisor
\u4E0E\u5426	y\u01D4 f\u01D2u	7	u	whether or not
\u5F80\u4E8B	w\u01CEng sh\xEC	7	n	past events|former happenings
\u4F20\u8A00	chu\xE1n y\xE1n	6	n	rumor|hearsay
\u4F55\u51B5	h\xE9 ku\xE0ng	7	c	let alone|say nothing of|besides|what's more
\u503E\u542C	q\u012Bng t\u012Bng	7	v	listen attentively
\u5F00\u5934	k\u0101i t\xF3u	6	n	beginning|start
\u4F20\u95FB	chu\xE1n w\xE9n	7	n	rumor
\u7B80\u79F0	ji\u01CEn ch\u0113ng	7	v	be abbreviated to|abbreviation|short form
\u53D1\u6CC4	f\u0101 xi\xE8	7	v	give vent to
\u6D88\u6BD2	xi\u0101o d\xFA	5	v	disinfect|sterilize
\u9884\u8A00	y\xF9 y\xE1n	7	v	predict|prophecy
\u5931\u63A7	sh\u012B k\xF2ng	7	v	go out of control
\u566A\u97F3	z\xE0o y\u012Bn	7	n	rumble|noise|static
\u5149\u7EBF	gu\u0101ng xi\xE0n	5	n	light ray|light|illumination|lighting
\u51FA\u52A8	ch\u016B d\xF2ng	6	v	dispatch troops
\u539F\u5148	yu\xE1n xi\u0101n	5	d	originally|original|former
\u5220\u9664	sh\u0101n ch\xFA	7	v	delete|cancel
\u59A5\u534F	tu\u01D2 xi\xE9	7	v	compromise|reach terms
\u5B81\u9759	n\xEDng j\xECng	4	a	tranquil|tranquility|serenity
\u5F3A\u5EA6	qi\xE1ng d\xF9	5	n	strength|intensity
\u6795\u5934	zh\u011Bn tou	7	n	pillow
\u6811\u6797	sh\xF9 l\xEDn	4	n	woods|grove|forest
\u89E3\u5F00	ji\u011B k\u0101i	3	v	untie|undo|solve
\u77AA	d\xE8ng	7	v	open wide|stare at|glare at
\u9AD8\u4E8E	g\u0101o y\xFA	5	v	greater than|exceed
\u63A2\u8BA8	t\xE0n t\u01CEo	6	v	investigate|probe
\u6765\u56DE	l\xE1i hu\xED	7	v	make a round trip|return journey|back and forth|and fro|repeatedly
\u7EC8\u7ED3	zh\u014Dng ji\xE9	7	v	end|conclusion|come to an end|terminate
\u53EF\u6076	k\u011B w\xF9	7	a	repulsive|vile|hateful|abominable
\u4E3B\u5BFC	zh\u01D4 d\u01CEo	5	n	leading|dominant|prevailing|lead|direct|dominate
\u6CE1\u6CAB	p\xE0o m\xF2	7	n	foam|bubble
\u4E00\u6B21\u6027	y\u012B c\xEC x\xECng	6	b	one-off|one-time|single-use|disposable
\u8F66\u53A2	ch\u0113 xi\u0101ng	7	n	carriage
\u8C34\u8D23	qi\u01CEn z\xE9	7	v	denounce|condemn|criticize|condemnation|criticism
\u718A\u732B	xi\xF3ng m\u0101o	3	n	panda
\u53D8\u52A8	bi\xE0n d\xF2ng	5	vn	change|fluctuate|fluctuation
\u8BBA\u575B	l\xF9n t\xE1n	7	n	forum
\u4EE5\u5185	y\u01D0 n\xE8i	4	f	within|less than
\u529B\u5EA6	l\xEC d\xF9	7	n	strength|vigor|efforts|dynamics
\u5206\u6B67	f\u0113n q\xED	7	n	divergent|difference|disagreement|bifurcation
\u76EE\u7684\u5730	m\xF9 d\xEC d\xEC	7	n	destination
\u57CE\u5821	ch\xE9ng b\u01CEo	6	n	castle|rook
\u5931\u7720	sh\u012B mi\xE1n	7	v	suffer from insomnia
\u70DF\u82B1	y\u0101n hu\u0101	6	n	fireworks|prostitute
\u70E7\u70E4	sh\u0101o k\u01CEo	7	vn	barbecue|roast
\u591A\u79CD	du\u014D zh\u01D2ng	4	m	many kinds of|multiple|diverse|multi-
\u7EA0\u7F20	ji\u016B ch\xE1n	7	v	be in a tangle|nag
\u6D77\u62A5	h\u01CEi b\xE0o	6	n	poster|playbill|notice
\u62D0	gu\u01CEi	6	v	turn|kidnap|swindle|misappropriate|cane|walking stick|crutch|old man's staff
\u62A4\u7167	h\xF9 zh\xE0o	2	n	passport
\u578B\u53F7	x\xEDng h\xE0o	4	n	model|type
\u5907\u7528	b\xE8i y\xF2ng	7	vn	reserve|spare|alternate|backup
\u673A\u5BC6	j\u012B m\xEC	7	n	secret|classified
\u53D1\u653E	f\u0101 f\xE0ng	6	v	provide|give|grant
\u5B66\u5458	xu\xE9 yu\xE1n	6	n	student|officer cadet
\u5F31\u70B9	ru\xF2 di\u01CEn	7	n	weak point|failing
\u6392\u7EC3	p\xE1i li\xE0n	7	v	rehearse|rehearsal
\u6CC9	qu\xE1n	5	g	spring|mouth of a spring|coin
\u4E13\u6CE8	zhu\u0101n zh\xF9	7	v	focus|concentrate|give one's full attention
\u6F0F\u6D1E	l\xF2u d\xF2ng	5	n	leak|hole|gap|loophole
\u7EF3\u5B50	sh\xE9ng zi	7	n	cord|string|rope
\u5267\u60C5	j\xF9 q\xEDng	7	n	story line|plot|drama
\u5FEB\u9012	ku\xE0i d\xEC	4	v	express delivery
\u707F\u70C2	c\xE0n l\xE0n	7	a	glitter|brilliant|splendid
\u635F\u574F	s\u01D4n hu\xE0i	7	v	damage|injure
\u65B0\u578B	x\u012Bn x\xEDng	4	b	new type|new kind
\u624D\u534E	c\xE1i hu\xE1	7	n	talent
\u81EA\u884C	z\xEC x\xEDng	7	d	voluntary|autonomous|by oneself|self-
\u4E66\u5E97	sh\u016B di\xE0n	1	n	bookstore
\u9A8C\u8BC1	y\xE0n zh\xE8ng	7	v	inspect and verify|experimental verification|validate|authenticate
\u62D8\u7559	j\u016B li\xFA	7	v	detain|keep sb in custody
\u9178\u5976	su\u0101n n\u01CEi	4	n	yogurt
\u5B55\u5987	y\xF9n f\xF9	7	n	pregnant woman
\u6C34\u9762	shu\u01D0 mi\xE0n	7	n	water surface
\u680F	l\xE1n	7	n	fence|railing|hurdle|column or box
\u4E92\u52A8	h\xF9 d\xF2ng	6	vn	interact|interactive
\u4E0B\u96EA	xi\xE0 xu\u011B	2	v	snow
\u4F18\u7F8E	y\u014Du m\u011Bi	4	a	graceful|fine|elegant
\u4F20\u67D3	chu\xE1n r\u01CEn	7	v	infect|contagious
\u6000\u7740	hu\xE1izhe	7	v	be with
\u8154	qi\u0101ng	7	g	cavity|tune|accent
\u67E5\u8BE2	ch\xE1 x\xFAn	5	v	check|inquire|consult|inquiry|query
\u70ED\u6C34	r\xE8 shu\u01D0	6	n	hot water
\u5207\u65AD	qi\u0113 du\xE0n	7	v	cut off|sever
\u590D\u5408	f\xF9 h\xE9	7	v	complex|compound|composite|hybrid|combine|be reconciled|get back together
\u8033\u673A	\u011Br j\u012B	4	n	headphones|earphones|telephone receiver
\u4E0B\u573A	xi\xE0 ch\u01CEng	7	n	leave (the stage|exam room|playing field etc)|take an examination|end|conclude
\u82F1\u6587	Y\u012Bng w\xE9n	2	nz	english
\u8DD1\u6B65	p\u01CEo b\xF9	3	v	run|jog|march at the double
\u6B4C\u5531	g\u0113 ch\xE0ng	6	v	sing
\u6C14\u6E29	q\xEC w\u0113n	2	n	air temperature
\u5339\u914D	p\u01D0 p\xE8i	7	v	mate or marry|match|matching|compatible
\u6C14\u8C61	q\xEC xi\xE0ng	5	n	meteorological feature|meteorology|atmosphere|ambience|scene
\u50B2	\xE0o	7	g	proud|arrogant|despise|unyielding|defy
\u4ECB\u610F	ji\xE8 y\xEC	7	v	care about|take offense|mind
\u4E24\u8FB9	li\u01CEng bian	4	f	either side|both sides
\u94C3\u58F0	l\xEDng sh\u0113ng	5	n	ring|ringtone|bell stroke|tintinnabulation
\u753B\u5BB6	hu\xE0 ji\u0101	2	n	painter
\u7F16\u53F7	bi\u0101n h\xE0o	7	n	number|numbering|serial number
\u4E00\u4F53	y\u012B t\u01D0	7	n	integral whole|all concerned|everybody
\u6C42\u52A9	qi\xFA zh\xF9	7	v	request help|appeal
\u539F\u5730	yu\xE1n d\xEC	7	n	original place|place of origin|local
\u5C06\u8FD1	ji\u0101ng j\xECn	3	d	almost|nearly|close to
\u8FA9	bi\xE0n	7	g	dispute|debate|argue|discuss
\u86CB\u767D\u8D28	d\xE0n b\xE1i zh\xEC	7	n	protein
\u5DE7\u5408	qi\u01CEo h\xE9	7	v	coincidence|coincidental|coincide
\u53E4\u602A	g\u01D4 gu\xE0i	7	a	strange|weird|eccentric|bizarre
\u9003\u8D70	t\xE1o z\u01D2u	5	v	escape|flee|run away
\u6309\u65F6	\xE0n sh\xED	4	d	on time|before deadline|on schedule
\u5173\u4E0A	gu\u0101n sh\xE0ng	1	v	close|turn off
\u5CA9\u77F3	y\xE1n sh\xED	7	n	rock
\u9A91\u8F66	q\xED ch\u0113	2	v	ride a bike
\u897F\u5357	x\u012B n\xE1n	2	s	southwest
\u7EF4\u751F\u7D20	w\xE9i sh\u0113ng s\xF9	6	n	vitamin
\u514B\u9686	k\xE8 l\xF3ng	7	v	clone
\u88F9	gu\u01D2	7	v	wrap around|bundle|parcel|package|press into service|pressgang|make off with
\u76B1	zh\xF2u	7	v	wrinkle|wrinkled|crease
\u5206\u5E03	f\u0113n b\xF9	4	v	scatter|distribute|be distributed|distribution
\u8C79	b\xE0o	7	n	leopard|panther
\u6691\u5047	sh\u01D4 ji\xE0	4	t	summer vacation
\u8FDB\u5EA6	j\xECn d\xF9	7	n	rate of progress
\u5FC5\u9700	b\xEC x\u016B	5	v	need|require|essential|indispensable
\u7B11\u58F0	xi\xE0o sh\u0113ng	6	n	laughter
\u6D41\u6CEA	li\xFA l\xE8i	7	v	shed tears
\u7CBE\u81F4	j\u012Bng zh\xEC	7	a	delicate|fine|exquisite|refined
\u76F4\u81F3	zh\xED zh\xEC	7	v	lasting until|up till
\u51FA\u8EAB	ch\u016B sh\u0113n	7	v	be born of|come from|family background|class origin
\u67D4\u8F6F	r\xF3u ru\u01CEn	7	a	soft
\u4F55\u5904	h\xE9 ch\xF9	7	r	whence|where
\u5934\u53F7	t\xF3u h\xE0o	7	b	first rate|top rank|number one
\u738B\u56FD	w\xE1ng gu\xF3	7	n	kingdom|realm
\u897F\u5317	X\u012B b\u011Bi	2	s	northwest china|northwest
\u503C\u73ED	zh\xED b\u0101n	5	v	work a shift|on duty
\u58A8	m\xF2	7	n	ink stick|china ink
\u4E22\u6389	di\u016B di\xE0o	7	v	lose|throw away|discard|cast away
\u706B\u8F66\u7AD9	hu\u01D2 ch\u0113 zh\xE0n	1	n	train station
\u7814\u7A76\u6240	y\xE1n ji\u016B su\u01D2	5	n	research institute|graduate studies|graduate school
\u52A8\u9759	d\xF2ng j\xECng	7	n	movement|activity|movement and stillness
\u6388\u4E88	sh\xF2u y\u01D4	7	v	award|confer
\u6D77\u8FB9	h\u01CEi bi\u0101n	2	s	coast|seaside|seashore|beach
\u6D77\u5E95	h\u01CEi d\u01D0	6	n	seabed|seafloor|bottom of the ocean
\u8D74	f\xF9	7	v	go|visit|attend
\u8D5B\u573A	s\xE0i ch\u01CEng	6	n	racetrack|field
\u4E0B\u4EE4	xi\xE0 l\xECng	7	v	give an order|command
\u76F4\u89C9	zh\xED ju\xE9	7	n	intuition
\u81C2	b\xEC	6	g	arm
\u8BCA\u6240	zh\u011Bn su\u01D2	7	n	clinic
\u6390	qi\u0101	7	v	pick|pinch|nip|pinch off|clutch|fight
\u524D\u7EBF	qi\xE1n xi\xE0n	7	s	front line|military front|workface|cutting edge
\u8FD0\u8425	y\xF9n y\xEDng	7	vn	be in operation|do business|be in service|operation|service
\u5FE0\u5B9E	zh\u014Dng sh\xED	7	a	faithful
\u73A9\u513F	w\xE1n r	1	v	play|have fun|hang out
\u4E00\u8D2F	y\u012B gu\xE0n	6	d	consistent|constant|from start to finish|all along|persistent
\u4EB2\u8FD1	q\u012Bn j\xECn	7	v	intimate|get close to
\u4FDD\u7BA1	b\u01CEo gu\u01CEn	7	v	hold in safekeeping|have in one's care|guarantee|certainly|surely|custodian|curator
\u5361\u7247	k\u01CE pi\xE0n	7	n	card
\u5EF6	y\xE1n	7	g	prolong|extend|delay
\u6218\u5F79	zh\xE0n y\xEC	6	n	military campaign
\u89C6\u529B	sh\xEC l\xEC	7	n	vision|eyesight
\u5766\u767D	t\u01CEn b\xE1i	7	v	honest|forthcoming|confess
\u7F13	hu\u01CEn	7	v	slow|unhurried|sluggish|gradual|not tense|relaxed|postpone|defer
\u68A6\u89C1	m\xE8ng ji\xE0n	4	v	dream about|see in a dream
\u536B\u751F\u95F4	w\xE8i sh\u0113ng ji\u0101n	3	n	bathroom|toilet|wc
\u4EBA\u529B	r\xE9n l\xEC	5	n	manpower|labor power
\u4E0D\u5149	b\xF9 gu\u0101ng	3	c	not the only one|not only
\u63A9\u62A4	y\u01CEn h\xF9	7	v	screen|shield|cover|protection
\u793E\u4F1A\u4E3B\u4E49	sh\xE8 hu\xEC zh\u01D4 y\xEC	7	n	socialism
\u80CE\u513F	t\u0101i \xE9r	7	n	unborn child|fetus|embryo
\u9012	d\xEC	5	v	hand over|pass on|deliver|progressively|in the proper order
\u4F4E\u5934	d\u012B t\xF3u	6	v	bow the head|yield|give in
\u653F\u6743	zh\xE8ng qu\xE1n	6	n	regime|political power
\u8650\u5F85	nu:\xE8 d\xE0i	7	v	mistreat|maltreat|abuse|mistreatment|maltreatment
\u5BA3\u8A00	xu\u0101n y\xE1n	7	n	declaration|manifesto
\u5FC3\u76EE	x\u012Bn m\xF9	7	n	mind
\u6ED1\u96EA	hu\xE1 xu\u011B	7	vn	ski|skiing
\u80C3\u53E3	w\xE8i k\u01D2u	7	n	appetite|liking
\u763E	y\u01D0n	7	n	addiction|craving
\u9AD8\u5C1A	g\u0101o sh\xE0ng	4	a	noble|lofty|refined|exquisite
\u590F\u5B63	xi\xE0 j\xEC	4	t	summer
\u7A92\u606F	zh\xEC x\u012B	7	v	choke|stifle|suffocate
\u8D1F\u9762	f\xF9 mi\xE0n	7	b	negative|negative side
\u5B50\u5973	z\u01D0 n\u01DA	3	n	children|sons and daughters
\u83B7\u5956	hu\xF2 ji\u01CEng	4	v	win an award
\u6F06	q\u012B	7	n	paint|lacquer
\u718F	x\u016Bn	7	v	fragrance|warm|educate|smoke|fumigate|assail the nostrils|perfume
\u8D5E\u7F8E	z\xE0n m\u011Bi	7	v	admire|praise|eulogize
\u865A\u5047	x\u016B ji\u01CE	7	a	false|phony|pretense
\u6C38\u4E45	y\u01D2ng ji\u01D4	7	b	everlasting|perpetual|lasting|forever|permanent
\u73CD\u73E0	zh\u0113n zh\u016B	5	n	pearl
\u5F3A\u52BF	qi\xE1ng sh\xEC	6	n	strong|powerful|emphatic|intensive
\u4E00\u77AC\u95F4	y\u012B sh\xF9n ji\u0101n	7	t	split second
\u4F38\u624B	sh\u0113n sh\u01D2u	7	v	hold out a hand|beg|get involved|meddle
\u79CD\u65CF	zh\u01D2ng z\xFA	7	n	race|ethnicity
\u8F85\u52A9	f\u01D4 zh\xF9	5	vn	assist|aid|supplementary|auxiliary
\u91C7\u96C6	c\u01CEi j\xED	7	v	gather|collect|harvest
\u9762\u5411	mi\xE0n xi\xE0ng	6	v	face|turn towards|incline to|geared towards|catering for|-oriented|facial feature|appearance
\u626D\u66F2	ni\u01D4 q\u016B	7	v	twist|warp|distort
\u6D88\u8D39\u8005	xi\u0101o f\xE8i zh\u011B	5	n	consumer
\u751F\u6001	sh\u0113ng t\xE0i	7	n	ecology
\u5EF6\u4F38	y\xE1n sh\u0113n	5	v	extend|spread
\u4EBA\u60C5	r\xE9n q\xEDng	7	n	human emotions|social relationship|friendship|favor|good turn
\u6C11\u529E	m\xEDn b\xE0n	7		privately operated
\u7F16\u5267	bi\u0101n j\xF9	7	n	write a play|scenario|dramatist|screenwriter
\u8FCE\u6765	y\xEDng l\xE1i	6	v	welcome|usher in
\u52A0\u4EE5	ji\u0101 y\u01D0	5	v	in addition|moreover|apply to|give to
\u75D2	y\u01CEng	7	a	itch|tickle
\u5904\u65B9	ch\u01D4 f\u0101ng	7	n	medical prescription|write out a prescription|recommendation|advice
\u4E0D\u505C	b\xF9 t\xEDng	5	v	incessant
\u78B0\u4E0A	p\xE8ng sh\xE0ng	7	v	run into|come upon|meet
\u8BBE\u60F3	sh\xE8 xi\u01CEng	5	v	imagine|assume|envisage|tentative plan|have consideration for
\u5B89\u5B9A	\u0101n d\xECng	7	a	stable|calm|settled|stabilize|valium|diazepam
\u79CD\u690D	zh\xF2ng zh\xED	4	v	plant|grow|cultivate
\u9ED8\u5951	m\xF2 q\xEC	7	a	tacit understanding|mutual understanding|rapport|well coordinated|tight
\u7EED	x\xF9	7	v	continue|replenish
\u54B8	xi\xE1n	4	a	all|everyone|each|widespread|harmonious|salted|salty|stingy
\u54B3	h\u0101i	5	v	sound of sighing|oh|damn|wow|cough
\u793C\u670D	l\u01D0 f\xFA	7	n	ceremonial robe|formal attire
\u8214	ti\u01CEn	7	v	lick|lap
\u518D\u751F	z\xE0i sh\u0113ng	6	v	be reborn|regenerate|be a second so-and-so|recycling|regeneration
\u5D2D\u65B0	zh\u01CEn x\u012Bn	7	b	brand new
\u9AD8\u5CF0	g\u0101o f\u0113ng	6	n	peak|summit|height
\u53E0	di\xE9	7	v	fold|fold over in layers|furl|layer|pile up|repeat|duplicate
\u4E00\u7EBF	y\u012B xi\xE0n	7	n	front line
\u8017	h\xE0o	7	v	waste|spend|consume|squander|news|delay|dilly-dally
\u667A\u5546	zh\xEC sh\u0101ng	7	n	iq
\u6F2B	m\xE0n	7	v	free|unrestrained|inundate
\u4F4F\u623F	zh\xF9 f\xE1ng	2	n	housing
\u7247\u6BB5	pi\xE0n du\xE0n	7	n	fragment|extract|episode
\u6708\u7403	yu\xE8 qi\xFA	5	n	moon
\u8001\u592A\u592A	l\u01CEo t\xE0i tai	3	n	elderly lady|esteemed mother
\u51FA\u9662	ch\u016B yu\xE0n	2	v	leave hospital|be discharged from hospital
\u75B2\u52B3	p\xED l\xE1o	7	a	fatigue|wearily|weariness|weary
\u8EB2\u907F	du\u01D2 b\xEC	7	v	hide|evade|dodge|take shelter|avoid
\u9A97\u4EBA	pi\xE0n r\xE9n	7	v	cheat sb|scam
\u6323\u94B1	zh\xE8ng qi\xE1n	5	v	make money
\u6E29\u6CC9	w\u0113n qu\xE1n	7	n	hot spring|spa|onsen
\u526F\u4F5C\u7528	f\xF9 zu\xF2 y\xF2ng	7	n	side effect
\u62FE	sh\xED	5	v	pick up|collate or arrange|ten|ascend in light steps
\u53F0\u9636	t\xE1i ji\u0113	4	n	steps|flight of steps|step|bench
\u6E29\u548C	w\u0113n h\xE9	5	a	mild|gentle|moderate|lukewarm
\u76EE\u5F55	m\xF9 l\xF9	7	n	catalog|table of contents|directory|list|contents
\u8FFD\u9010	zhu\u012B zh\xFA	7	v	chase|pursue vigorously
\u6D8C	y\u01D2ng	7	v	bubble up|rush forth
\u803D\u8BEF	d\u0101n wu	7	v	delay|hold up|waste time|interfere with
\u666F\u8C61	j\u01D0ng xi\xE0ng	5	n	scene|sight
\u6DCB	l\xECn	7	v	filter|strain|drain|gonorrhea|strangury|sprinkle|drip|pour
\u8239\u957F	chu\xE1n zh\u01CEng	6	n	captain|skipper
\u5947\u5999	q\xED mi\xE0o	6	a	fantastic|wonderful
\u5F52\u6765	gu\u012B l\xE1i	7	v	return|come back
\u5974\u96B6	n\xFA l\xEC	7	n	slave
\u5F69\u8679	c\u01CEi h\xF3ng	7	n	rainbow
\u4E0A\u65B9	sh\xE0ng f\u0101ng	7	f	place above|upper part
\u534A\u5929	b\xE0n ti\u0101n	1	mq	half of the day|long time|quite a while|midair
\u540E\u9000	h\xF2u tu\xEC	7	v	recoil|draw back|fall back|retreat
\u4F53\u80B2\u9986	t\u01D0 y\xF9 gu\u01CEn	2	n	gym|gymnasium|stadium
\u5E72\u9884	g\u0101n y\xF9	5	v	meddle|intervene|intervention
\u4E89\u6267	zh\u0113ng zh\xED	7	vn	dispute|disagree|argue opinionatedly|wrangle
\u5367	w\xF2	7	v	lie|crouch
\u5267\u7EC4	j\xF9 z\u01D4	7	n	cast and crew|performers and production team
\u96C6\u4F1A	j\xED hu\xEC	7	vn	gather|assembly|meeting
\u65E0\u77E5	w\xFA zh\u012B	7	a	ignorant|ignorance
\u5265\u593A	b\u014D du\xF3	7	v	deprive|expropriate|strip
\u6A61\u80F6	xi\xE0ng ji\u0101o	7	n	rubber|caoutchouc
\u4E07\u5206	w\xE0n f\u0113n	7	d	very much|extremely|one ten thousandth part
\u6307\u5411	zh\u01D0 xi\xE0ng	7	v	point towards|aimed at|facing|direction indicated
\u4E0A\u8863	sh\xE0ng y\u012B	3	n	jacket|upper outer garment
\u679D	zh\u012B	6	q	branch
\u534F\u5B9A	xi\xE9 d\xECng	7	n	agreement|accord|reach an agreement
\u79C1\u4E0B	s\u012B xi\xE0	7	d	in private
\u65D7\u5E1C	q\xED zh\xEC	7	n	ensign|flag
\u60AC	xu\xE1n	6	v	hang or suspend|worry|public announcement|unresolved|baseless|without foundation
\u6C34\u51C6	shu\u01D0 zh\u01D4n	7	n	level|standard
\u5EFA\u6210	ji\xE0n ch\xE9ng	3	v	establish|build
\u67DC\u53F0	gu\xEC t\xE1i	7	n	sales counter|front desk|bar|otc
\u7EAF\u6D01	ch\xFAn ji\xE9	7	a	pure|clean and honest|purify
\u63ED\u9732	ji\u0113 l\xF9	7	v	expose|unmask|ferret out|disclose|disclosure
\u8001\u670B\u53CB	l\u01CEo p\xE9ng you	2	n	old friend|period|menstruation
\u6253\u542C	d\u01CE ting	3	v	ask about|make some inquiries|ask around
\u6B64\u540E	c\u01D0 h\xF2u	5	t	after this|afterwards|hereafter
\u6253\u5305	d\u01CE b\u0101o	5	v	wrap|pack|package
\u83DC\u5355	c\xE0i d\u0101n	2	n	menu
\u5429\u5490	f\u0113n f\xF9	7	v	tell|instruct|command
\u8F66\u724C	ch\u0113 p\xE1i	6	n	license plate
\u7269\u4F53	w\xF9 t\u01D0	7	n	object|body|substance
\u804C\u5458	zh\xED yu\xE1n	7	n	office worker|staff member
\u4FC3\u4F7F	c\xF9 sh\u01D0	4	v	induce|promote|urge|impel|bring about|provoke|drive|catalyze
\u5BFC\u822A	d\u01CEo h\xE1ng	7	vn	navigation
\u5F3A\u52B2	qi\xE1ng j\xECng	7	a	strong|powerful|robust
\u633D\u56DE	w\u01CEn hu\xED	7	v	retrieve|redeem
\u5265	b\u0101o	7	v	peel|skin|shell|shuck|flay
\u5546\u6807	sh\u0101ng bi\u0101o	5	n	trademark|logo
\u7231\u56FD	\xE0i gu\xF3	4	a	love one's country|patriotic
\u65C5\u9014	l\u01DA t\xFA	7	n	journey|trip
\u4E09\u89D2	s\u0101n ji\u01CEo	7	n	triangle
\u5E86\u5E78	q\xECng x\xECng	7	v	rejoice|be glad
\u6761\u7EA6	ti\xE1o yu\u0113	7	n	treaty|pact
\u5B9A\u671F	d\xECng q\u012B	3	d	at set dates|at regular intervals|periodic|fixed term
\u4EAB	xi\u01CEng	7	g	enjoy|benefit|have the use of
\u672C\u80FD	b\u011Bn n\xE9ng	7	n	instinct
\u9646\u519B	l\xF9 j\u016Bn	6	n	army|ground forces
\u5851\u9020	s\xF9 z\xE0o	7	v	model|mold|create (a character|market|image etc)|portray
\u5347\u9AD8	sh\u0113ng g\u0101o	5	v	raise|ascend
\u6050\u614C	k\u01D2ng hu\u0101ng	7	an	panic|panicky|panic-stricken
\u65FA	w\xE0ng	7	a	prosperous|flourishing|blooming|roaring
\u8FDE\u9501	li\xE1n su\u01D2	7	vn	interlock|be linked|chain
\u4F24\u611F	sh\u0101ng g\u01CEn	7	a	sad|emotional|sentimental|pathos
\u8F7B\u5FAE	q\u012Bng w\u0113i	7	a	slight|light|trivial|small extent
\u8FA9\u8BBA	bi\xE0n l\xF9n	4	vn	debate|argument|argue over
\u85AA\u6C34	x\u012Bn shu\u01D0	6	n	salary|wage
\u75B2\u60EB	p\xED b\xE8i	7	a	beaten|exhausted|tired
\u62E7	n\xEDng	7	v	pinch|wring|mistake|twist|stubborn
\u83AB\u540D\u5176\u5999	m\xF2 m\xEDng q\xED mi\xE0o	7	l	baffling|bizarre|without rhyme or reason|inexplicable
\u5EC9\u4EF7	li\xE1n ji\xE0	7	a	cheaply-priced|low-cost
\u8861\u91CF	h\xE9ng li\xE1ng	6	v	weigh|examine|consider
\u5E08\u7236	sh\u012B fu	6	n	master|qualified worker
\u675F\u7F1A	sh\xF9 f\xF9	7	v	bind|restrict|tie|commit|fetters
\u5065\u5168	ji\xE0n qu\xE1n	5	a	robust|sound
\u4E00\u5927\u65E9	y\u012B d\xE0 z\u01CEo	7	t	at dawn|at first light
\u4E00\u65B9\u9762	y\u012B f\u0101ng mi\xE0n	3	c	on the one hand
\u649E\u51FB	zhu\xE0ng j\u012B	7	v	strike|hit|ram
\u8FDC\u5904	yu\u01CEn ch\xF9	5	s	distant place
\u661F\u671F\u5929	X\u012Bng q\u012B ti\u0101n	1	t	sunday
\u52A8\u4EBA	d\xF2ng r\xE9n	3	a	touching|moving
\u5148\u524D	xi\u0101n qi\xE1n	5	t	before|previously
\u503A\u5238	zh\xE0i qu\xE0n	6	n	bond|debenture
\u57AE	ku\u01CE	7	v	collapse
\u5F53\u771F	d\xE0ng zh\u0113n	7	d	take seriously|serious|no joking, really
\u590D\u6D3B	f\xF9 hu\xF3	7	v	revive|come back to life|resurrection
\u5FC3\u7231	x\u012Bn \xE0i	7	b	beloved
\u6EAA	x\u012B	6	g	creek|rivulet
\u4F53\u6E29	t\u01D0 w\u0113n	7	n	temperature
\u602A\u4E0D\u5F97	gu\xE0i bu de	7	d	no wonder|so that's why
\u79CD\u7C7B	zh\u01D2ng l\xE8i	4	n	kind|genus|type|category|variety|species|sort|class
\u7A81\u51FB	t\u016B j\u012B	7	v	sudden and violent attack|assault|fig. rushed job
\u538B\u8FEB	y\u0101 p\xF2	6	vn	oppress|repress|constrict|oppression|stress
\u68CB	q\xED	7	n	chess|chess-like game|game of chess|chess piece
\u597D\u4E0D\u5BB9\u6613	h\u01CEo b\xF9 r\xF3ng y\xEC	6	l	with great difficulty|very difficult
\u829D\u58EB	zh\u012B sh\xEC	7	nr	cheese
\u8513\u5EF6	m\xE0n y\xE1n	7	v	extend|spread
\u5DE8\u4EBA	j\xF9 r\xE9n	7	n	giant
\u6A21\u8303	m\xF3 f\xE0n	5	n	model|fine example
\u6709\u6BD2	y\u01D2u d\xFA	5	v	poisonous
\u8BBE\u6CD5	sh\xE8 f\u01CE	7	v	try|make an attempt|think of a way
\u5F3A\u786C	qi\xE1ng y\xECng	7	a	tough|unyielding|hard-line
\u8001\u767E\u59D3	l\u01CEo b\u01CEi x\xECng	3	n	ordinary people|"person in the street"
\u5FC3\u610F	x\u012Bn y\xEC	7	n	intention|regard|kindly feelings
\u9053\u5177	d\xE0o j\xF9	7	n	prop|paraphernalia|item|artifact
\u8C03\u52A8	di\xE0o d\xF2ng	5	v	transfer|maneuver|movement of personnel|mobilize|bring into play
\u78B3	t\xE0n	7	n	carbon
\u4E0D\u59A8	b\xF9 f\xE1ng	7	d	might as well
\u7EDD\u5927\u591A\u6570	ju\xE9 d\xE0 du\u014D sh\xF9	6	m	vast majority
\u6709\u76CA	y\u01D2u y\xEC	7	a	useful|beneficial|profitable
\u9774\u5B50	xu\u0113 zi	7	n	boots
\u9ED8\u9ED8	m\xF2 m\xF2	4	d	in silence|not speaking
\u7EC8\u7A76	zh\u014Dng ji\u016B	7	d	in the end
\u8F85\u5BFC	f\u01D4 d\u01CEo	7	v	give guidance|mentor|counsel|coach|tutor
\u6237\u5916	h\xF9 w\xE0i	6	s	outdoor
\u5E74\u7EA7	ni\xE1n j\xED	2	n	grade|year
\u4F1A\u9762	hu\xEC mi\xE0n	7	v	meet with|meeting
\u5931\u843D	sh\u012B lu\xF2	7	v	lose|drop|frustrated|disappointment|loss
\u672A\u5FC5	w\xE8i b\xEC	4	d	not necessarily|maybe not
\u6025\u9700	j\xED x\u016B	7	v	urgently need|urgent need
\u5EFA\u7B51\u7269	ji\xE0n zh\xF9 w\xF9	7	n	building|structure|edifice
\u89E3\u8131	ji\u011B tu\u014D	7	v	untie|free|absolve of|get free of|extirpate oneself
\u53D7\u76CA	sh\xF2u y\xEC	7	v	benefit from|profit
\u91C7\u8D2D	c\u01CEi g\xF2u	5	v	procure|purchase
\u5C0F\u4EBA	xi\u01CEo r\xE9n	7	n	i, me|nasty person|vile character
\u65C5\u7A0B	l\u01DA ch\xE9ng	7	n	journey|trip
\u70B8\u836F	zh\xE0 y\xE0o	6	n	explosive
\u672C\u571F	b\u011Bn t\u01D4	6	n	one's native country|native|local|metropolitan territory
\u725B\u4ED4\u88E4	ni\xFA z\u01CEi k\xF9	5	n	jeans
\u8868\u51B3	bi\u01CEo ju\xE9	7	v	decide by vote|vote
\u4EAB\u6709	xi\u01CEng y\u01D2u	7	v	enjoy
\u963B\u6321	z\u01D4 d\u01CEng	7	v	stop|resist|obstruct
\u6070\u5F53	qi\xE0 d\xE0ng	6	a	appropriate|suitable
\u7591\u60D1	y\xED hu\xF2	7	v	doubt|distrust|unconvincing|puzzle over|misgivings|suspicions
\u4EC7\u6068	ch\xF3u h\xE8n	7	n	hate|hatred|enmity|hostility
\u6CE8\u89C6	zh\xF9 sh\xEC	5	v	look attentively at|closely watch|gaze at
\u540E\u5907	h\xF2u b\xE8i	7	b	reserve|backup
\u51ED\u501F	p\xEDng ji\xE8	7	p	rely on|depend on|by means of|thanks to
\u5F00\u652F	k\u0101i zh\u012B	7	n	expenditures|expenses|spend money|pay wages
\u64C5\u81EA	sh\xE0n z\xEC	7	d	without permission
\u76D1\u6D4B	ji\u0101n c\xE8	6	vn	monitor
\u8F66\u7968	ch\u0113 pi\xE0o	1	n	ticket
\u770B\u75C5	k\xE0n b\xECng	1	v	visit a doctor|see a patient
\u79F0\u53F7	ch\u0113ng h\xE0o	5	n	name|term of address|title
\u6D4F\u89C8	li\xFA l\u01CEn	7	v	skim over|browse
\u53C9	ch\u0101	5	n	fork|pitchfork|prong|pick|cross|intersect|"x"|be stuck
\u8FFD\u7A76	zhu\u012B ji\u016B	6	v	investigate|look into
\u76EE\u7779	m\xF9 d\u01D4	7	v	witness|see at first hand
\u9632\u8303	f\xE1ng f\xE0n	6	v	be on guard|wariness|guard against|preventive
\u624B\u8155	sh\u01D2u w\xE0n	7	n	wrist|trickery|finesse|ability|skill
\u7A0E\u6536	shu\xEC sh\u014Du	7	n	taxation
\u6E05\u5355	q\u012Bng d\u0101n	7	n	list of items
\u9A6C\u8F66	m\u01CE ch\u0113	6	n	cart|chariot|carriage|buggy
\u660E\u667A	m\xEDng zh\xEC	7	a	sensible|wise|judicious|sagacious
\u94C5	qi\u0101n	7	n	lead
\u975E\u51E1	f\u0113i f\xE1n	7	z	out of the ordinary|unusually
\u520A\u767B	k\u0101n d\u0113ng	7	v	carry a story|publish
\u6CC4\u9732	xi\xE8 l\xF9	7	v	leak|divulge|also pr
\u62D6\u5EF6	tu\u014D y\xE1n	7	v	delay|put off|procrastinate
\u65E0\u803B	w\xFA ch\u01D0	6	a	unembarrassed|shameless
\u6587\u7269	w\xE9n w\xF9	7	n	cultural relic|historical relic
\u4E2A\u4F53	g\xE8 t\u01D0	4	n	individual
\u5899\u58C1	qi\xE1ng b\xEC	5	n	wall
\u770B\u4F5C	k\xE0n zu\xF2	6	v	look upon as|regard as
\u5F00\u5173	k\u0101i gu\u0101n	6	n	power switch|gas valve|open the city gate|open and close|switch on and off
\u8BF1\u4EBA	y\xF2u r\xE9n	7	a	attractive|alluring|captivating
\u9E45	\xE9	7	n	goose
\u4EC7	ch\xF3u	7	n	hatred|animosity|enmity|foe|enemy|feel animosity toward|spouse|companion
\u8D70\u5F00	z\u01D2u k\u0101i	2	v	leave|walk away|beat it|move aside
\u4ECD\u65E7	r\xE9ng ji\xF9	5	d	still|remain|yet
\u6602\u8D35	\xE1ng gu\xEC	7	a	expensive|costly
\u5706\u6EE1	yu\xE1n m\u01CEn	4	a	satisfactory|consummate|perfect
\u53E4\u5178	g\u01D4 di\u01CEn	6	b	classical
\u6A58\u5B50	j\xFA zi	7	n	tangerine
\u51B7\u6F20	l\u011Bng m\xF2	7	a	lack of regard|indifference|neglect
\u9884\u5907	y\xF9 b\xE8i	5	vn	prepare|make ready|preparation|preparatory
\u5FD8\u6389	w\xE0ng di\xE0o	7	v	forget
\u5927\u65B9	d\xE0 fang	4	a	generous|magnanimous|stylish|in good taste|easy-mannered|natural and relaxed|expert|scholar
\u5361\u901A	k\u01CE t\u014Dng	7	n	cartoon
\u5708\u5B50	qu\u0101n zi	7	n	circle|ring
\u5929\u5730	ti\u0101n d\xEC	7	n	heaven and earth|world|scope|field of activity
\u5267\u573A	j\xF9 ch\u01CEng	3	n	theater
\u679C\u6C41	gu\u01D2 zh\u012B	3	n	fruit juice
\u659C	xi\xE9	5	ad	inclined|slanting|oblique|tilting
\u538C\u5026	y\xE0n ju\xE0n	7	v	be weary of|be fed up with|be bored with
\u6709\u5BB3	y\u01D2u h\xE0i	5	a	destructive|harmful|damaging
\u5956\u5B66\u91D1	ji\u01CEng xu\xE9 j\u012Bn	4	n	scholarship
\u770B\u6210	k\xE0n ch\xE9ng	5	v	regard as
\u9976	r\xE1o	7	v	rich|abundant|exuberant|add for free|throw in as bonus|spare|forgive|despite
\u624B\u518C	sh\u01D2u c\xE8	7	n	manual|handbook
\u542F\u53D1	q\u01D0 f\u0101	5	v	enlighten|explain|stimulate|enlightenment|revelation|motivation
\u8FDB\u51FA	j\xECn ch\u016B	7	v	enter or exit|go through
\u8F6C\u5316	zhu\u01CEn hu\xE0	5	v	change|transform|isomerization
\u5954\u9A70	b\u0113n ch\xED	6	nz	run quickly|speed|gallop|benz|mercedes-benz, german car maker
\u4F53\u8D34	t\u01D0 ti\u0113	7	v	considerate
\u642C\u5BB6	b\u0101n ji\u0101	3	v	move house|relocate|remove
\u751F\u6548	sh\u0113ng xi\xE0o	7	v	take effect|go into effect
\u4E0D\u901A	b\xF9 t\u014Dng	6	a	be obstructed|be blocked up|be impassable|make no sense|be illogical
\u670D\u9970	f\xFA sh\xEC	7	n	apparel|clothing and personal adornment
\u58F6	h\xFA	6	g	pot
\u540D\u8A89	m\xEDng y\xF9	6	n	fame|reputation|honor|honorary|emeritus
\u5F00\u4E1A	k\u0101i y\xE8	3	v	open a business|open a practice|open
\u6D47	ji\u0101o	7	v	pour liquid|irrigate|water|cast|mold
\u56FE\u4E66	t\xFA sh\u016B	6	n	books
\u751F\u52A8	sh\u0113ng d\xF2ng	3	a	vivid|lively
\u6CEA\u6C34	l\xE8i shu\u01D0	4	n	teardrop|tears
\u5782	chu\xED	7	v	hang|droop|dangle|bend down|hand down|bequeath|nearly|almost
\u9000\u5F79	tu\xEC y\xEC	7	v	retire|be decommissioned
\u5151\u73B0	du\xEC xi\xE0n	7	v	cash|honor a commitment
\u808C\u80A4	j\u012B f\u016B	7	n	skin|flesh|fig. close physical relationship
\u4E59	y\u01D0	5	m	second in order|ethyl|bent|winding|radical in chinese characters
\u6B65\u9AA4	b\xF9 zh\xF2u	7	n	procedure|step
\u8BA2\u5355	d\xECng d\u0101n	7	n	order
\u53A8\u5E08	ch\xFA sh\u012B	6	n	cook|chef
\u62F3\u5934	qu\xE1n tou	7	n	fist|clenched fist|competitive
\u7535\u5668	di\xE0n q\xEC	6	n	appliance|device
\u9075\u5FAA	z\u016Bn x\xFAn	7	v	follow|abide by|comply with
\u8FDC\u7A0B	yu\u01CEn ch\xE9ng	7	b	remote|long distance|long range
\u6297\u751F\u7D20	k\xE0ng sh\u0113ng s\xF9	7	n	antibiotic
\u68A8	l\xED	5	n	pear
\u4E0B\u5C5E	xi\xE0 sh\u01D4	7	v	subordinate|underling
\u9009\u62D4	xu\u01CEn b\xE1	6	v	select the best
\u82F1\u52C7	y\u012Bng y\u01D2ng	4	a	heroic|gallant|valiant
\u52A0\u6CB9\u7AD9	ji\u0101 y\xF3u zh\xE0n	4	n	gas station
\u4EBA\u6743	r\xE9n qu\xE1n	6	n	human rights
\u4EBA\u4E8B	r\xE9n sh\xEC	7	n	personnel|human resources|human affairs|ways of the world|sexuality|facts of life
\u6B65\u884C	b\xF9 x\xEDng	4	v	go on foot|walk
\u5F53\u4ECA	d\u0101ng j\u012Bn	7	t	current|present|now|nowadays
\u51FA\u7248\u793E	ch\u016B b\u01CEn sh\xE8	7	n	publishing house
\u53EF\u884C	k\u011B x\xEDng	7	a	feasible
\u559C\u60A6	x\u01D0 yu\xE8	7	an	happy|joyous
\u70ED\u5FC3	r\xE8 x\u012Bn	4	a	enthusiastic|ardent|zealous
\u5927\u6C14	d\xE0 q\xEC	7	n	atmosphere|imposing|impressive|stylish
\u5F15\u7528	y\u01D0n y\xF2ng	7	v	quote|cite|recommend|appoint|reference
\u90CA\u533A	ji\u0101o q\u016B	5	s	suburban district|outskirts|suburbs
\u67E5\u660E	ch\xE1 m\xEDng	7	v	investigate and find out|ascertain
\u5C31\u4E1A	ji\xF9 y\xE8	3	v	get a job|employment
\u8981\u4E0D\u7136	y\xE0o b\xF9 r\xE1n	6	c	otherwise|or else|or
\u4E00\u624B	y\u012B sh\u01D2u	7	d	skill|mastery of a trade|by oneself|without outside help
\u602A\u5F02	gu\xE0i y\xEC	7	a	monstrous|strange|strange phenomenon
\u8BA4\u8BC1	r\xE8n zh\xE8ng	7	vn	authenticate|approve
\u4F5C\u5F0A	zu\xF2 b\xEC	7	v	practice fraud|cheat|engage in corrupt practices
\u6070\u597D	qi\xE0 h\u01CEo	6	d	as it turns out|by lucky coincidence|just right
\u8721\u70DB	l\xE0 zh\xFA	7	n	candle
\u6709\u5229\u4E8E	y\u01D2u l\xEC y\xFA	5	v	be advantageous to|be beneficial for
\u53EF\u60B2	k\u011B b\u0113i	7	a	lamentable
\u60CA\u5947	j\u012Bng q\xED	7	a	be amazed|be surprised|wonder
\u65F6\u5E38	sh\xED ch\xE1ng	5	d	often|frequently
\u7CBE\u795E\u75C5	j\u012Bng sh\xE9n b\xECng	7	n	mental disorder|psychosis
\u538C\u6076	y\xE0n w\xF9	6	v	loathe|hate|disgusted with sth
\u5F69\u8272	c\u01CEi s\xE8	3	b	color|multicolored
\u4ECE\u6765\u4E0D	c\xF3ng l\xE1i b\xF9	7	d	never
\u7EB7\u7EB7	f\u0113n f\u0113n	4	d	one after another|in succession|one by one|continuously|diverse|in profusion|numerous and confused|pell-mell
\u548C\u5C1A	h\xE9 shang	7	n	buddhist monk
\u8FDB\u5316	j\xECn hu\xE0	5	v	evolution
\u4FBF\u662F	bi\xE0n sh\xEC	6	v	precisely|exactly|even|if|just like
\u8B66\u8F66	j\u01D0ng ch\u0113	7	n	police car
\u9AD8\u8DDF\u978B	g\u0101o g\u0113n xi\xE9	5	n	high-heeled shoes
\u625B	k\xE1ng	7	v	carry on one's shoulder|take on|carry sth together
\u51FA\u793A	ch\u016B sh\xEC	7	v	show|display
\u6D2A\u6C34	h\xF3ng shu\u01D0	6	n	deluge|flood
\u507F\u8FD8	ch\xE1ng hu\xE1n	7	v	repay|reimburse
\u9A8C	y\xE0n	7	v	examine|test|check
\u70AB\u8000	xu\xE0n y\xE0o	7	v	dazzling|show off|flaunt
\u8282\u7EA6	ji\xE9 yu\u0113	3	v	economize|conserve|economy|frugal
\u4EBA\u8EAB	r\xE9n sh\u0113n	7	n	person|personal|human body
\u98CE\u5149	f\u0113ng gu\u0101ng	5	n	scene|view|sight|landscape|be well-regarded|be well-off|grand|impressive
\u4E00\u65C1	y\u012B p\xE1ng	7	f	aside|side of
\u4E3A\u96BE	w\xE9i n\xE1n	5	v	feel embarrassed or awkward|make things difficult|find things difficult
\u7B14\u8BB0	b\u01D0 j\xEC	2	n	take down|notes
\u505C\u7535	t\xEDng di\xE0n	7	v	have a power failure|power cut
\u4E0A\u6DA8	sh\xE0ng zh\u01CEng	5	v	rise|go up
\u540E\u53F0	h\xF2u t\xE1i	7	n	backstage area|behind-the-scenes supporter|back-end|background
\u5355\u5143	d\u0101n yu\xE1n	3	n	unit|element|entrance or staircase
\u81EA\u5728	z\xEC zai	6	a	comfortable|at ease
\u6253\u62DB\u547C	d\u01CE zh\u0101o hu	7	v	give prior notice
\u5543	k\u011Bn	7	v	gnaw|nibble|bite
\u6539\u7F16	g\u01CEi bi\u0101n	7	v	adapt|rearrange|revise
\u5438\u53D6	x\u012B q\u01D4	7	v	absorb|draw|assimilate
\u5BFA	s\xEC	6	g	buddhist temple|mosque|government office
\u5E10\u7BF7	zh\xE0ng peng	7	n	tent
\u4F4E\u4F30	d\u012B g\u016B	7	v	underestimate|underrate
\u7F18\u6545	yu\xE1n g\xF9	6	n	reason|cause
\u7535\u5F71\u9662	di\xE0n y\u01D0ng yu\xE0n	1	n	cinema|movie theater
\u504F\u504F	pi\u0101n pi\u0101n	7	d	unfortunately|as it happened|stubbornly|contrarily|against reason|precisely|only|of all people
\u8BDD\u8BED	hu\xE0 y\u01D4	7	n	words|speech|utterance|discourse
\u4F11\u5047	xi\u016B ji\xE0	2	v	go on vacation|have a holiday|take leave
\u5FC3\u613F	x\u012Bn yu\xE0n	6	n	cherished desire|dream|craving|wish|aspiration
\u6D41\u4F20	li\xFA chu\xE1n	4	v	spread|circulate|hand down
\u4E0A\u6620	sh\xE0ng y\xECng	7	v	screen|show
\u80A1\u5E02	g\u01D4 sh\xEC	7	n	stock market
\u6D77\u5173	h\u01CEi gu\u0101n	3	n	customs
\u4E3B\u7F16	zh\u01D4 bi\u0101n	7	n	editor in chief
\u5C0F\u58F0	xi\u01CEo sh\u0113ng	2	v	in a low voice|in whispers
\u7EDF\u7EDF	t\u01D2ng t\u01D2ng	7	d	totally
\u6D88\u6781	xi\u0101o j\xED	5	a	negative|passive|inactive
\u81F3\u5173\u91CD\u8981	zh\xEC gu\u0101n zh\xF2ng y\xE0o	7	l	extremely important|vital|crucial|essential
\u8981\u547D	y\xE0o m\xECng	7	v	cause sb's death|extremely|terribly|be a nuisance
\u98A4\u6296	ch\xE0n d\u01D2u	7	v	shudder|shiver|shake|tremble
\u6253\u5012	d\u01CE d\u01CEo	7	v	overthrow|knock down|down with ...
\u5145\u5B9E	ch\u014Dng sh\xED	7	v	rich|full|substantial|enrich|augment|substantiate
\u8463\u4E8B	d\u01D2ng sh\xEC	7	n	board member
\u89E3\u5256	ji\u011B p\u014Du	7	v	dissect|analyze|anatomy
\u8BC6	sh\xED	6	v	know|knowledge|taiwan pr|record|write a footnote
\u98CE\u60C5	f\u0113ng q\xEDng	7	n	mien|bearing|grace|amorous feelings|flirtatious expressions|local conditions and customs|wind force, direction etc
\u7B80\u5386	ji\u01CEn l\xEC	4	n	curriculum vitae|r\xE9sum\xE9|biographical notes
\u81EA\u89C9	z\xEC ju\xE9	3	a	conscious|aware|on one's own initiative|conscientious
\u5F80\u540E	w\u01CEng h\xF2u	6	t	from now on|in the future|time to come
\u96D5\u5851	di\u0101o s\xF9	7	n	statue|buddhist image|sculpture|carve
\u5904\u5904	ch\xF9 ch\xF9	6	d	everywhere|in all respects
\u4E0D\u81F3\u4E8E	b\xF9 zh\xEC y\xFA	6	d	not as bad as
\u540C\u7C7B	t\xF3ng l\xE8i	7	n	similar|same type|alike
\u6536\u770B	sh\u014Du k\xE0n	3	v	watch
\u56FD\u9632	gu\xF3 f\xE1ng	7	n	national defense
\u6D77\u5916	h\u01CEi w\xE0i	6	s	overseas|abroad
\u641C\u67E5	s\u014Du ch\xE1	7	v	search
\u6838\u6B66\u5668	h\xE9 w\u01D4 q\xEC	7	n	nuclear weapon
\u918B	c\xF9	6	n	vinegar|jealousy
\u6454\u5012	shu\u0101i d\u01CEo	5	v	fall down|slip and fall
\u7740\u60F3	zhu\xF3 xi\u01CEng	7	v	give thought|consider|also pr
\u7F62\u5DE5	b\xE0 g\u014Dng	6	vn	strike|go on strike
\u4E0D\u4FBF	b\xF9 bi\xE0n	6	an	inconvenient|inappropriate|unsuitable|short of cash
\u9881\u53D1	b\u0101n f\u0101	7	v	issue|promulgate|award
\u62DB\u8058	zh\u0101o p\xECn	6	v	recruit
\u8EAB\u5FC3	sh\u0113n x\u012Bn	7	n	body and mind|mental and physical
\u817E	t\xE9ng	7	v	gallop|prance|soar|hover|make room|clear out|vacate
\u5938	ku\u0101	7	v	boast|exaggerate|praise
\u6D3B\u6CFC	hu\xF3 po	5	a	lively|vivacious|brisk|active|reactive
\u547C\u5401	h\u016B y\xF9	7	v	call on|appeal
\u5E72\u71E5	g\u0101n z\xE0o	7	a	dry|desiccation|dull|uninteresting|arid
\u652F\u914D	zh\u012B p\xE8i	5	v	control|dominate|allocate
\u94DD	l\u01DA	7	n	aluminum
\u5815\u843D	du\xF2 lu\xF2	7	v	degrade|degenerate|become depraved|corrupt|fall from grace
\u5927\u81EA\u7136	d\xE0 z\xEC r\xE1n	2	n	nature
\u89E3\u6551	ji\u011B ji\xF9	7	v	rescue|help out of difficulties|save the situation
\u4E0D\u7981	b\xF9 j\u012Bn	6	d	can't help|can't refrain from
\u59A5	tu\u01D2	7	a	suitable|adequate|ready|settled
\u51E0\u7387	j\u012B l\u01DC	7	n	probability|odds
\u55D3\u5B50	s\u01CEng zi	7	n	throat|voice
\u4E13\u5FC3	zhu\u0101n x\u012Bn	4	ad	focus one's attention|concentrate on
\u4F7F\u52B2	sh\u01D0 j\xECn	4	v	exert all one's strength
\u652F\u51FA	zh\u012B ch\u016B	5	n	spend|pay out|expenses|expenditure
\u6B79\u5F92	d\u01CEi t\xFA	7	n	evildoer|malefactor|gangster|hoodlum
\u516C\u52A1\u5458	g\u014Dng w\xF9 yu\xE1n	3	n	functionary|office-bearer
\u91CE\u86EE	y\u011B m\xE1n	7	a	barbarous|uncivilized
\u4E2D\u5956	zh\xF2ng ji\u01CEng	4	v	win a prize
\u5206\u89E3	f\u0113n ji\u011B	5	v	resolve|decompose|break down
\u4E2D\u4ECB	zh\u014Dng ji\xE8	4	n	act as intermediary|link|intermediate|inter-|agency|agent
\u770B\u671B	k\xE0n w\xE0ng	4	v	pay a visit to|see
\u655E\u5F00	ch\u01CEng k\u0101i	7	v	open wide|unrestrictedly
\u5F81\u6C42	zh\u0113ng qi\xFA	4	v	solicit|seek|request|petition
\u8BD7\u6B4C	sh\u012B g\u0113	5	n	poem
\u5168\u7A0B	qu\xE1n ch\xE9ng	7	n	whole distance|from beginning to end
\u8BA4\u77E5	r\xE8n zh\u012B	7	vn	cognition|cognitive|understanding|perception|awareness|be cognizant of|recognize|realize
\u70ED\u91CF	r\xE8 li\xE0ng	5	n	heat|quantity of heat|calorific value
\u4EE3\u7406\u4EBA	d\xE0i l\u01D0 r\xE9n	7	n	agent
\u540D\u58F0	m\xEDng sh\u0113ng	7	n	reputation
\u5DE8\u661F	j\xF9 x\u012Bng	7	n	giant star|superstar
\u632A	nu\xF3	7	v	shift|move
\u4E11\u95FB	ch\u01D2u w\xE9n	7	n	scandal
\u65E9\u665A	z\u01CEo w\u01CEn	6	d	morning and evening|some day
\u7B7E\u8BC1	qi\u0101n zh\xE8ng	5	n	visa|issue a visa
\u5378	xi\xE8	7	v	unload|unhitch|remove or strip|get rid of
\u5468\u671F	zh\u014Du q\u012B	5	n	period|cycle
\u4E8F	ku\u012B	5	v	deficiency|deficit|luckily|it's lucky that|fancy that
\u6F5C\u8247	qi\xE1n t\u01D0ng	7	n	submarine
\u516C\u5173	g\u014Dng gu\u0101n	7	n	public relations
\u4EE5\u81F3\u4E8E	y\u01D0 zh\xEC y\xFA	7	c	down to|up to|extent that
\u5761	p\u014D	6	n	slope|sloping|slanted
\u4E1A\u7EE9	y\xE8 j\xEC	7	n	achievement|accomplishment|performance|results
\u6C1B\u56F4	f\u0113n w\xE9i	7	n	ambience|atmosphere
\u6C42\u5A5A	qi\xFA h\u016Bn	7	v	propose marriage
\u76F4\u7EBF	zh\xED xi\xE0n	5	n	straight line|sharply
\u6307\u5357	zh\u01D0 n\xE1n	7	n	guide|guidebook
\u9762\u5BF9\u9762	mi\xE0n du\xEC mi\xE0n	6	l	face to face
\u9001\u5230	s\xF2ng d\xE0o	2	v	deliver
\u524D\u5929	qi\xE1n ti\u0101n	1	t	day before yesterday
\u6696\u548C	nu\u01CEn huo	3	a	warm|nice and warm
\u878D	r\xF3ng	7	v	melt|thaw|blend|merge|be in harmony
\u4FE1\u8D56	x\xECn l\xE0i	7	v	trust|have confidence in|have faith in|rely on
\u6F84\u6E05	ch\xE9ng q\u012Bng	7	v	clear|limpid|clarify|make sth clear|be clear|settle|become clear|precipitate
\u5916\u661F\u4EBA	w\xE0i x\u012Bng r\xE9n	7	n	space alien|extraterrestrial
\u5927\u4E0D\u4E86	d\xE0 b\xF9 li\u01CEo	6	v	at worst|serious|alarming
\u7236\u5B50	f\xF9 z\u01D0	6	n	father and son
\u88C2\u7F1D	li\xE8 f\xE8ng	7	n	crack|crevice
\u4E0A\u7A7A	sh\xE0ng k\u014Dng	7	s	overhead|in the sky
\u53E3\u53F7	k\u01D2u h\xE0o	5	n	slogan|catchphrase
\u5883\u754C	j\xECng ji\xE8	7	n	boundary|state|realm
\u4F24\u75D5	sh\u0101ng h\xE9n	7	n	scar|bruise
\u6551\u62A4\u8F66	ji\xF9 h\xF9 ch\u0113	7	n	ambulance
\u751F\u80B2	sh\u0113ng y\xF9	7	vn	bear|give birth|grow|rear|bring up|fertility
\u6CC4\u6F0F	xi\xE8 l\xF2u	7	v	leak|divulge
\u952E\u76D8	ji\xE0n p\xE1n	5	n	keyboard
\u5288	p\u012B	7	v	hack|chop|split open|strike|split in two|divide
\u62C6\u9664	ch\u0101i ch\xFA	5	v	tear down|demolish|dismantle|remove
\u871C\u8702	m\xEC f\u0113ng	7	n	bee|honeybee
\u5B9E\u7528	sh\xED y\xF2ng	4	a	practical|functional|pragmatic|applied
\u884C\u4F7F	x\xEDng sh\u01D0	7	v	exercise
\u64A4\u9000	ch\xE8 tu\xEC	6	v	retreat
\u60B2\u60E8	b\u0113i c\u01CEn	6	a	miserable|tragic
\u65E9\u65E5	z\u01CEo r\xEC	7	d	soon|at an early date|early days|past
\u54C1\u5C1D	p\u01D0n ch\xE1ng	7	v	taste a small amount|sample
\u7E41\u8363	f\xE1n r\xF3ng	5	an	prosperous|booming
\u9012\u7ED9	d\xEC g\u011Bi	5	v	hand it to
\u52A8\u7528	d\xF2ng y\xF2ng	7	v	utilize|put sth to use
\u7C89\u788E	f\u011Bn su\xEC	7	v	crush|smash|shatter
\u6492\u8C0E	s\u0101 hu\u01CEng	7	v	tell lies
\u5FE7\u90C1	y\u014Du y\xF9	7	a	sullen|depressed|melancholy|dejected
\u518C	c\xE8	5	q	book|booklet
\u865A\u62DF	x\u016B n\u01D0	7	vn	imagine|make up|fictitious|theoretical|hypothetical|emulate|virtual
\u957F\u5EA6	ch\xE1ng d\xF9	5	n	length
\u660F	h\u016Bn	6	v	muddle-headed|twilight|faint|lose consciousness
\u6536\u517B	sh\u014Du y\u01CEng	6	v	dog etc)|adopt|adoption
\u4E00\u6A21\u4E00\u6837	y\u012B m\xFA y\u012B y\xE0ng	6	l	exactly the same|carbon copy|also pr
\u88AB\u5B50	b\xE8i zi	3	n	quilt
\u6B8B\u75BE\u4EBA	c\xE1n j\xED r\xE9n	6	n	disabled person
\u6380\u8D77	xi\u0101n q\u01D0	7	v	lift|raise|surge|stir up|trigger|controversy etc)
\u754C\u9650	ji\xE8 xi\xE0n	7	n	boundary
\u524D\u6240\u672A\u6709	qi\xE1n su\u01D2 w\xE8i y\u01D2u	7	v	unprecedented
\u54C1\u4F4D	p\u01D0n w\xE8i	7	n	rank|grade|quality|taste
\u7164	m\xE9i	5	n	coal
\u8F66\u5E93	ch\u0113 k\xF9	5	n	garage
\u5C11\u89C1	sh\u01CEo ji\xE0n	7	a	rare|seldom seen
\u65CB\u5F8B	xu\xE1n l\u01DC	7	n	melody
\u6536\u53D6	sh\u014Du q\u01D4	6	v	receive|collect
\u56FA\u6267	g\xF9 zh\xED	7	a	obstinate|stubborn|fixate on|cling to
\u5F3A\u5316	qi\xE1ng hu\xE0	6	v	strengthen|intensify
\u501F\u52A9	ji\xE8 zh\xF9	7	v	draw support from|with the help of
\u523B\u610F	k\xE8 y\xEC	7	d	intentionally|deliberately|purposely|painstakingly|meticulously
\u5F62\u6001	x\xEDng t\xE0i	5	n	shape|form|pattern|morphology
\u6469\u64E6	m\xF3 c\u0101	5	vn	friction|rubbing|chafing|fig. disharmony|conflict
\u6DD8	t\xE1o	7	v	wash|clean out|cleanse|eliminate|dredge
\u6E90\u5934	yu\xE1n t\xF3u	7	n	source|fountainhead
\u4E00\u5EA6	y\u012B d\xF9	7	d	for a time|at one time|one time|once
\u5BDF\u89C9	ch\xE1 ju\xE9	7	v	sense|perceive|become aware of|detect
\u593A\u53D6	du\xF3 q\u01D4	6	v	seize|capture|wrest control of
\u6253\u5370	d\u01CE y\xECn	2	v	affix a seal|stamp|print out
\u5B81\u53EF	n\xECng k\u011B	7	d	preferably|one would prefer to|would rather|be better to|lesser of two evils
\u4FA7\u9762	c\xE8 mi\xE0n	7	f	lateral side|side|aspect|profile
\u4E0D\u66FE	b\xF9 c\xE9ng	5	d	hasn't yet|hasn't ever
\u6444\u50CF	sh\xE8 xi\xE0ng	5	v	videotape
\u5185\u9601	n\xE8i g\xE9	7	n	cabinet
\u5C40\u90E8	j\xFA b\xF9	7	n	part|local
\u7B7E\u8BA2	qi\u0101n d\xECng	5	v	agree to and sign
\u6E17\u900F	sh\xE8n t\xF2u	7	v	permeate|seep into|penetrate|infiltrate|osmosis
\u8FCE	y\xEDng	7	v	welcome|meet|forge ahead|meet face to face
\u9ED1\u5BA2	h\u0113i k\xE8	7	n	hacker
\u4ED8\u8D39	f\xF9 f\xE8i	7	v	pay|cover the costs
\u9E2D\u5B50	y\u0101 zi	5	n	duck|male prostitute
\u95F4\u63A5	ji\xE0n ji\u0113	5	b	indirect
\u80CC\u5305	b\u0113i b\u0101o	5	n	knapsack|rucksack|infantry pack|field pack|blanket roll
\u584C	t\u0101	7	v	collapse|droop|settle down
\u65A4	j\u012Bn	2	q	catty|slightly over 604 g
\u4FD7	s\xFA	7	a	custom|convention|popular|common|coarse|vulgar|secular
\u88C1\u51B3	c\xE1i ju\xE9	7	vn	ruling|adjudication
\u8FD0\u9001	y\xF9n s\xF2ng	7	v	transport|carry
\u4F7F\u8005	sh\u01D0 zh\u011B	7	n	emissary|envoy
\u8F66\u4E3B	ch\u0113 zh\u01D4	5	n	vehicle owner
\u8D4F	sh\u01CEng	4	v	bestow|give|hand down|reward|appreciate
\u6253\u4ED7	d\u01CE zh\xE0ng	7	v	fight a battle|go to war
\u7279\u5730	t\xE8 d\xEC	6	d	specially|for a special purpose
\u51B3\u8BAE	ju\xE9 y\xEC	7	n	resolution|pass a resolution
\u671F\u76FC	q\u012B p\xE0n	7	v	expect|await
\u9F9F	gu\u012B	7	n	tortoise|turtle
\u4F59	y\xFA	7	m	extra|surplus|remaining|remainder after division|or more|in excess of|residue|after
\u628A\u624B	b\u01CE shou	7	n	handle|grip|knob|shake hands
\u8FC7\u9519	gu\xF2 cu\xF2	7	n	mistake|fault|responsibility
\u5F3A\u58EE	qi\xE1ng zhu\xE0ng	6	a	strong|sturdy|robust
\u8F6F\u5F31	ru\u01CEn ru\xF2	7	a	weak|feeble|flabby
\u51FA\u5165	ch\u016B r\xF9	6	v	entrance and exit|expenditure and income|discrepancy|inconsistent
\u548C\u89E3	h\xE9 ji\u011B	7	v	settle|reconcile|settlement|conciliation|become reconciled
\u533A\u5206	q\u016B f\u0113n	6	v	differentiate|draw a distinction|divide into categories
\u6291\u90C1	y\xEC y\xF9	7	a	depressed|despondent|gloomy
\u62A5\u793E	b\xE0o sh\xE8	7	n	newspaper
\u89E3\u6563	ji\u011B s\xE0n	7	v	dissolve|disband
\u7B79\u5907	ch\xF3u b\xE8i	7	v	preparations|get ready for sth
\u519C\u6751	n\xF3ng c\u016Bn	3	n	rural area|village
\u88C5\u626E	zhu\u0101ng b\xE0n	7	v	decorate|adorn|dress up|disguise oneself
\u826F	li\xE1ng	7	g	good|very|very much
\u5DF4\u58EB	b\u0101 sh\xEC	4	n	bus|motor coach
\u7ED3\u5C3E	ji\xE9 w\u011Bi	7	n	ending|coda|wind up
\u5F15\u8FDB	y\u01D0n j\xECn	4	v	recommend|introduce
\u4E25\u5BC6	y\xE1n m\xEC	7	a	strict|tight
\u5217\u5165	li\xE8 r\xF9	4	v	include on a list
\u9898\u6750	t\xED c\xE1i	5	n	subject matter
\u6392\u65A5	p\xE1i ch\xEC	7	v	reject|exclude|eliminate|remove|repel
\u957F\u76F8	zh\u01CEng xi\xE0ng	7	n	appearance|looks|profile|countenance
\u62A5\u4EC7	b\xE0o ch\xF3u	7	v	take revenge|avenge
\u6536\u7F29	sh\u014Du su\u014D	7	v	pull back|shrink|contract|systole
\u901A\u7528	t\u014Dng y\xF2ng	5	nz	use anywhere, anytime|be used by everyone|interchangeable
\u6392\u5217	p\xE1i li\xE8	4	v	arrange in order|permutation
\u5E16\u5B50	ti\u011B zi	7		card|invitation|message|post
\u9493\u9C7C	di\xE0o y\xFA	7	v	fish|dupe
\u7528\u4E0D\u7740	y\xF2ng bu zh\xE1o	5	l	not need|have no use for
\u56BC	ji\xE1o	7	v	chew|also pr
\u724C\u7167	p\xE1i zh\xE0o	7	n	license|vehicle license|car registration|license plate
\u5145\u7535	ch\u014Dng di\xE0n	4	v	recharge|recharge one's batteries
\u641C\u5BFB	s\u014Du x\xFAn	7	v	search|look for
\u8FEB\u5207	p\xF2 qi\xE8	4	ad	urgent|pressing
\u629A\u517B	f\u01D4 y\u01CEng	7	v	foster|bring up|raise
\u6253\u4EA4\u9053	d\u01CE ji\u0101o d\xE0o	7	v	come into contact with|have dealings
\u7528\u9014	y\xF2ng t\xFA	4	n	use|application
\u4E07\u80FD	w\xE0n n\xE9ng	7	b	omnipotent|all-purpose|universal
\u5BCC\u4EBA	f\xF9 r\xE9n	6	n	rich person|rich
\u517C\u804C	ji\u0101n zh\xED	7	v	hold concurrent posts|concurrent job|moonlighting
\u5927\u81F4	d\xE0 zh\xEC	5	d	more or less|roughly|approximately
\u5BA0	ch\u01D2ng	7	v	love|pamper|spoil|favor
\u8F83\u91CF	ji\xE0o li\xE0ng	7	vn	pit oneself against sb|compete with sb|contest|battle|haggle|quibble
\u8C23\u8A00	y\xE1o y\xE1n	7	n	rumor
\u91CD\u8FD4	ch\xF3ng f\u01CEn	7	v	return to
\u4E16\u754C\u676F	Sh\xEC ji\xE8 b\u0113i	3	n	world cup
\u5F53\u4EE3	d\u0101ng d\xE0i	5	t	present age|contemporary era
\u8FC7\u8282	gu\xF2 ji\xE9	7	v	celebrate a festival|after the celebrations
\u6355	b\u01D4	6	v	catch|seize|capture
\u597D\u611F	h\u01CEo g\u01CEn	7	n	good opinion|favorable impression
\u641C\u96C6	s\u014Du j\xED	7	v	gather|collect
\u63A2\u6D4B	t\xE0n c\xE8	7	v	probe|survey
\u4F4D\u5B50	w\xE8i zi	7	n	place|seat
\u8001\u5E74	l\u01CEo ni\xE1n	2	t	elderly|old age|autumn of one's years
\u6F14\u620F	y\u01CEn x\xEC	7	v	put on a play|perform|fig. to pretend|feign
\u96F6\u4EF6	l\xEDng ji\xE0n	7	n	part|component
\u593A\u51A0	du\xF3 gu\xE0n	7	v	seize the crown|win gold medal
\u81EA\u5C0A	z\xEC z\u016Bn	7	v	self-respect|self-esteem|ego|pride
\u762B\u75EA	t\u0101n hu\xE0n	7	v	paralysis|be paralyzed
\u5149\u8F89	gu\u0101ng hu\u012B	6	a	radiance|glory|brilliant|magnificent
\u96C7\u4F63	g\xF9 y\u014Dng	7	v	employ|hire
\u5206\u4E3A	f\u0113n w\xE9i	4	v	divide sth into|subdivide
\u902E	d\xE0i	7	v	arrest|seize|overtake|until|catch
\u4E0A\u62A5	sh\xE0ng b\xE0o	7	v	report to one's superiors|appear in the news|reply to a letter
\u4F4E\u4E0B	d\u012B xi\xE0	7	a	low status|lowly|lower
\u8239\u5458	chu\xE1n yu\xE1n	6	n	sailor|crew member
\u5927\u81E3	d\xE0 ch\xE9n	7	n	chancellor|cabinet minister
\u8FEB\u4F7F	p\xF2 sh\u01D0	7	v	force|compel
\u9634\u6027	y\u012Bn x\xECng	7	n	negative|feminine
\u914D\u5907	p\xE8i b\xE8i	5	v	allocate|provide|outfit with
\u9499	g\xE0i	7	n	calcium
\u96BE\u514D	n\xE1n mi\u01CEn	4	v	hard to avoid|difficult to escape from|will inevitably
\u9ED1\u591C	h\u0113i y\xE8	6	n	night
\u6CFC	p\u014D	5	v	splash|spill|rough and coarse|brutish
\u4FC3\u9500	c\xF9 xi\u0101o	4	vn	promote sales
\u653E\u5C04	f\xE0ng sh\xE8	6	v	radiate|radioactive
\u5BB9\u5668	r\xF3ng q\xEC	6	n	receptacle|vessel|container
\u9AD8\u5C14\u592B\u7403	g\u0101o \u011Br f\u016B qi\xFA	7	n	golf|golf ball
\u62DB\u5F85	zh\u0101o d\xE0i	7	v	hold a reception|offer hospitality|entertain|serve
\u6577	f\u016B	7	v	spread|lay out|apply|sufficient|enough
\u6B23\u6170	x\u012Bn w\xE8i	7	a	be gratified
\u6027\u80FD	x\xECng n\xE9ng	5	n	function|performance|behavior
\u542C\u4F17	t\u012Bng zh\xF2ng	3	n	audience|listeners
\u4FCA	j\xF9n	7	nr	smart|eminent|handsome|talented|cool|neat
\u8FC7\u6E21	gu\xF2 d\xF9	6	v	cross over|transition|interim|caretaker
\u52A0\u70ED	ji\u0101 r\xE8	5	v	heat
\u672B\u65E5	m\xF2 r\xEC	7	n	last day|end|final days|doomsday|judgment day
\u9119\u89C6	b\u01D0 sh\xEC	7	v	despise|disdain|look down upon
\u5143\u9996	yu\xE1n sh\u01D2u	7	n	head of state
\u82CD\u767D	c\u0101ng b\xE1i	6	a	pale|wan
\u7EB1	sh\u0101	7	n	cotton yarn|muslin
\u5047\u65E5	ji\xE0 r\xEC	6	n	holiday|non-working day
\u5934\u6655	t\xF3u y\u016Bn	7	v	dizzy
\u9636\u7EA7	ji\u0113 j\xED	7	n	class
\u4E2D\u9014	zh\u014Dng t\xFA	7	d	midway
\u5173\u6000	gu\u0101n hu\xE1i	5	vn	care|solicitude|show care for|concerned about|attentive to
\u6620	y\xECng	7	v	reflect|shine|project
\u72EC\u4E00\u65E0\u4E8C	d\xFA y\u012B w\xFA \xE8r	7	l	unique and unmatched|unrivalled|nothing compares with it
\u53D8\u4E3A	bi\xE0n w\xE9i	3	v	change into
\u79F0\u8D5E	ch\u0113ng z\xE0n	4	v	praise|acclaim|commend|compliment
\u7ECF\u53D7	j\u012Bng sh\xF2u	7	v	undergo|endure|withstand
\u90AE\u7BB1	y\xF3u xi\u0101ng	3	n	mailbox|post office box|email|email inbox
\u4EAE\u76F8	li\xE0ng xi\xE0ng	7	v	strike a pose|make a public appearance|come out in public
\u61D2\u5F97	l\u01CEn d\xE9	7	v	not to feel like|disinclined to
\u5C11\u91CF	sh\u01CEo li\xE0ng	7	m	smidgen|little bit|few
\u7535\u52A8	di\xE0n d\xF2ng	6	b	electric-powered|video game
\u6350\u732E	ju\u0101n xi\xE0n	7	v	donate|contribute|donation|contribution
\u63A5\u624B	ji\u0113 sh\u01D2u	7	v	take over|catcher
\u5373\u53EF	j\xED k\u011B	7	v	can then|can immediately|and that will suffice
\u5C0F\u54C1	xi\u01CEo p\u01D0n	7	n	essay|skit
\u683D	z\u0101i	7	v	plant|grow|insert|erect|impose sth on sb|stumble|fall down
\u7EBF\u6761	xi\xE0n ti\xE1o	7	n	line
\u53D6\u80DC	q\u01D4 sh\xE8ng	7	v	score a victory|prevail over one's opponents
\u8054\u624B	li\xE1n sh\u01D2u	6	v	lit. to join hands|act together
\u9057\u4F53	y\xED t\u01D0	7	n	remains
\u6B8B\u7559	c\xE1n li\xFA	7	vn	remain|be left over|residual|remnant|residue
\u9707\u52A8	zh\xE8n d\xF2ng	7	vn	shake|vibrate|strongly affect|shock|vibration
\u89D2\u9010	ju\xE9 zh\xFA	7	vn	tussle|contend|contest
\u7279\u6743	t\xE8 qu\xE1n	7	n	prerogative|privilege|privileged
\u53EF\u4E0D\u662F	k\u011B bu sh\xEC	7		exactly
\u5BC6\u5EA6	m\xEC d\xF9	7	n	density|thickness
\u8D60\u9001	z\xE8ng s\xF2ng	5	v	present as a gift
\u53E3\u6C34	k\u01D2u shu\u01D0	7	n	saliva
\u5DE8\u989D	j\xF9 \xE9	7	b	large sum|huge amount
\u603B\u7ECF\u7406	z\u01D2ng j\u012Bng l\u01D0	6	n	general manager|ceo
\u70ED\u5E26	r\xE8 d\xE0i	7	n	tropics|tropical
\u53D1\u5149	f\u0101 gu\u0101ng	7	v	emit light|shine|glow|glisten|be luminous
\u6D41\u901A	li\xFA t\u014Dng	5	vn	circulate|distribute|circulation|distribution
\u906E	zh\u0113	7	v	cover up|screen off|hide|conceal
\u6218\u53CB	zh\xE0n y\u01D2u	6	n	comrade-in-arms|battle companion
\u4E0D\u65F6	b\xF9 sh\xED	5	d	from time to time|now and then|occasionally|frequently
\u4E3B\u6D41	zh\u01D4 li\xFA	6	n	main stream|fig. the essential point|mainstream
\u4E0D\u5F97\u4E86	b\xF9 d\xE9 li\u01CEo	5	l	desperately serious|disastrous|extremely|exceedingly
\u6252	b\u0101	7	v	peel|skin|tear|pull down|cling to|dig|rake up|steal
\u8611\u83C7	m\xF3 gu	7	n	mushroom|pester|dawdle
\u98DE\u5F80	f\u0113i w\u01CEng	7	v	go to
\u5411\u5F80	xi\xE0ng w\u01CEng	7	v	yearn for|look forward to
\u966A\u540C	p\xE9i t\xF3ng	6	v	accompany
\u65F6\u9AE6	sh\xED m\xE1o	7	a	in vogue|fashionable
\u97F3\u54CD	y\u012Bn xi\u01CEng	7	n	sound|acoustics|audio|hi-fi system|stereo sound system
\u6025\u6027	j\xED x\xECng	7	b	acute
\u949E\u7968	ch\u0101o pi\xE0o	7	n	paper money|bill
\u867D\u8BF4	su\u012B shu\u014D	7	c	though|although
\u4E00\u8EAB	y\u012B sh\u0113n	5	n	whole body|from head to toe|single person|suit of clothes
\u4E2D\u7B49	zh\u014Dng d\u011Bng	6	b	medium
\u98CE\u4E91	f\u0113ng y\xFAn	7	n	weather|unstable situation
\u5F98\u5F8A	p\xE1i hu\xE1i	7	v	pace back and forth|dither|hesitate|fluctuate
\u6807\u9898	bi\u0101o t\xED	3	n	title|heading|headline|caption|subject
\u62E5\u6324	y\u014Dng j\u01D0	7	a	crowded|throng|congestion
\u663E\u73B0	xi\u01CEn xi\xE0n	7	v	appearance|appear
\u51C0\u5316	j\xECng hu\xE0	7	v	purify
\u96C7\u5458	g\xF9 yu\xE1n	7	n	employee
\u6F14\u793A	y\u01CEn sh\xEC	7	v	demonstrate|show|presentation|demonstration
\u9A6C\u6876	m\u01CE t\u01D2ng	7	n	chamber pot|toilet bowl
\u8FF7\u60D1	m\xED huo	7	v	puzzle|confuse|baffle
\u9ECE\u660E	l\xED m\xEDng	7	t	dawn|daybreak
\u6B65\u5165	b\xF9 r\xF9	7	v	step into|enter
\u5C60\u6740	t\xFA sh\u0101	7	vn	massacre|slaughter
\u7422\u78E8	zu\xF3 mo	7	v	ponder|mull over|think through|taiwan pr|carve and polish
\u81F4\u656C	zh\xEC j\xECng	7	v	salute|pay one's respects to|pay tribute to|pay homage to
\u5FC3\u58F0	x\u012Bn sh\u0113ng	7	n	thoughts|feelings|aspirations|heartfelt wishes|inner voice
\u8868\u6001	bi\u01CEo t\xE0i	7	v	declare one's position|say where one stands
\u9884\u89C1	y\xF9 ji\xE0n	7	v	foresee|predict|forecast|envision|foresight|intuition|vision
\u53CC\u80DE\u80CE	shu\u0101ng b\u0101o t\u0101i	7	n	twin
\u9884\u62A5	y\xF9 b\xE0o	3	vn	forecast
\u6BB4\u6253	\u014Du d\u01CE	7	v	beat up|come to blows|battery
\u652F\u7968	zh\u012B pi\xE0o	7	n	check|cheque
\u4E00\u9053	y\u012B d\xE0o	6	d	together
\u5B9D\u77F3	b\u01CEo sh\xED	4	n	precious stone|gem
\u9886\u571F	l\u01D0ng t\u01D4	7	n	territory
\u751F\u524D	sh\u0113ng qi\xE1n	7	t	during one's life|while living
\u7A84	zh\u01CEi	7	a	narrow|narrow-minded|badly off
\u4E0B\u843D	xi\xE0 lu\xF2	7	n	whereabouts|drop|fall
\u53CD\u9988	f\u01CEn ku\xEC	7	v	send back information|feedback
\u65E0\u80FD\u4E3A\u529B	w\xFA n\xE9ng w\xE9i l\xEC	7	v	impotent|powerless|helpless
\u70B9\u5FC3	di\u01CEn xin	7	n	light refreshments|pastry|dim sum|dessert
\u7740\u706B	zh\xE1o hu\u01D2	4	v	catch fire
\u756A\u8304	f\u0101n qi\xE9	6	n	tomato
\u6BD4\u55BB	b\u01D0 y\xF9	7	n	compare|liken to|metaphor|analogy|figure of speech|figuratively
\u8DF3\u8DC3	ti\xE0o yu\xE8	7	v	jump|leap|bound|skip
\u7CBE\u7F8E	j\u012Bng m\u011Bi	6	a	delicate|fine|refinement
\u632B\u6298	cu\xF2 zh\xE9	7	n	setback|reverse|check|defeat|frustration|disappointment|frustrate|discourage
\u5760	zhu\xEC	7	v	fall|drop|weigh down
\u65B0\u90CE	x\u012Bn l\xE1ng	4	n	bridegroom|groom
\u672C\u6027	b\u011Bn x\xECng	7	n	natural instincts|nature|inherent quality
\u50A8\u5B58	ch\u01D4 c\xFAn	6	v	stockpile|store|storage
\u76F8\u8BC6	xi\u0101ng sh\xED	7	v	acquaintance
\u4E0D\u53EF\u907F\u514D	b\xF9 k\u011B b\xEC mi\u01CEn	7	v	unavoidably
\u5230\u671F	d\xE0o q\u012B	6	v	fall due|expire|mature
\u4FEE\u5EFA	xi\u016B ji\xE0n	5	v	build|construct
\u60EF\u4F8B	gu\xE0n l\xEC	7	n	convention|usual practice
\u8352\u5510	hu\u0101ng t\xE1ng	6	a	beyond belief|preposterous|absurd|intemperate|dissipated
\u6B63\u89C4	zh\xE8ng gu\u012B	5	a	regular|according to standards
\u50A8\u84C4	ch\u01D4 x\xF9	7	vn	deposit money|save|savings
\u5FC5\u5B9A	b\xEC d\xECng	7	d	be bound to|be sure to
\u4E8B\u540E	sh\xEC h\xF2u	6	t	after the event|in hindsight|in retrospect
\u4E0D\u600E\u4E48	b\xF9 z\u011Bn me	6	v	not very|not particularly
\u4E8B\u5B9C	sh\xEC y\xED	7	n	matters|arrangements
\u5F26	xi\xE1n	7	n	bow string|string of musical instrument|watchspring|chord|hypotenuse
\u770B\u91CD	k\xE0n zh\xF2ng	7	v	regard as important|value
\u8FEB\u4E0D\u53CA\u5F85	p\xF2 b\xF9 j\xED d\xE0i	7	l	impatient|in a hurry
\u56DA\u72AF	qi\xFA f\xE0n	7	n	prisoner|convict
\u9AD8\u5927	g\u0101o d\xE0	5	a	tall|lofty|towering
\u865A\u4F2A	x\u016B w\u011Bi	7	a	false|hypocritical|artificial|sham
\u4E88\u4EE5	y\u01D4 y\u01D0	7	v	give|impose|apply
\u5206\u6CCC	f\u0113n m\xEC	7	v	secrete|secretion
\u89E6\u6478	ch\xF9 m\u014D	7	v	touch
\u597D\u6BD4	h\u01CEo b\u01D0	7	v	be just like|can be compared to
\u5F80\u6765	w\u01CEng l\xE1i	6	v	dealings|contacts|go back and forth
\u8D77\u6B65	q\u01D0 b\xF9	7	v	set out|set in motion|start
\u4F59\u5730	y\xFA d\xEC	7	n	margin|leeway
\u540E\u4EE3	h\xF2u d\xE0i	7	n	descendant|progeny|posterity|later ages|later generations
\u4FEE\u6B63	xi\u016B zh\xE8ng	7	v	revise|amend
\u79EF\u7D2F	j\u012B l\u011Bi	4	v	accumulate|accumulation|cumulative|cumulatively
\u9AD8\u6E29	g\u0101o w\u0113n	5	n	high temperature
\u5236\u54C1	zh\xEC p\u01D0n	7	n	products|goods
\u597D\u5FC3	h\u01CEo x\u012Bn	7	n	kindness|good intentions
\u4E3A\u4E3B	w\xE9i zh\u01D4	5	v	rely mainly on|attach most importance to
\u6B3A\u8BC8	q\u012B zh\xE0	7	vn	cheat
\u6B64\u5904	c\u01D0 ch\xF9	6	s	this place|here
\u5149\u4E34	gu\u0101ng l\xEDn	4	v	honor with one's presence|attend
\u626D\u8F6C	ni\u01D4 zhu\u01CEn	7	v	reverse|turn around|torsion
\u6765\u5F80	l\xE1i w\u01CEng	6	v	come and go|have dealings with|be in relation with
\u72C2\u70ED	ku\xE1ng r\xE8	7	a	zealotry|fanatical|feverish
\u9010\u6B65	zh\xFA b\xF9	4	d	progressively|step by step
\u786C\u5E01	y\xECng b\xEC	7	n	coin
\u52A8\u753B	d\xF2ng hu\xE0	6	n	animation|cartoon
\u6574\u9F50	zh\u011Bng q\xED	3	a	orderly|neat|even|tidy
\u5E38\u8BC6	ch\xE1ng sh\xED	4	n	common sense|general knowledge
\u672A\u6210\u5E74\u4EBA	w\xE8i ch\xE9ng ni\xE1n r\xE9n	7	n	minor
\u7279\u6027	t\xE8 x\xECng	5	n	property|characteristic
\u8349\u539F	c\u01CEo yu\xE1n	5	n	grassland|prairie
\u538B\u5236	y\u0101 zh\xEC	7		suppress|inhibit|stifle
\u53EF\u89C1	k\u011B ji\xE0n	4	v	it is clear|clear|visible
\u9999\u5473	xi\u0101ng w\xE8i	7	n	fragrance|bouquet|sweet smell
\u7A9C	cu\xE0n	7	v	flee|scuttle|exile or banish|amend or edit
\u524D\u4EFB	qi\xE1n r\xE8n	7	b	predecessor|ex-|former|ex
\u98DF\u5802	sh\xED t\xE1ng	4	n	dining hall|cafeteria
\u5185\u6DB5	n\xE8i h\xE1n	7	n	meaningful content|implication|connotation|inner qualities
\u707E	z\u0101i	5	n	disaster|calamity
\u51E1\u662F	f\xE1n sh\xEC	6	d	each and every|every|all|any
\u665A\u70B9	w\u01CEn di\u01CEn	4	v	late|delayed|behind schedule|light dinner
\u6C99\u9F99	sh\u0101 l\xF3ng	7	n	salon
\u5FD7\u613F	zh\xEC yu\xE0n	3	n	aspiration|ambition|volunteer
\u4F9D\u7167	y\u012B zh\xE0o	5	p	according to|in light of
\u65E0\u5948	w\xFA n\xE0i	5	d	have no alternative|frustrated|exasperated|helpless|but unfortunately
\u8D77\u521D	q\u01D0 ch\u016B	7	d	originally|at first|at the outset
\u5C0F\u9EA6	xi\u01CEo m\xE0i	6	n	wheat
\u4F4F\u5904	zh\xF9 ch\xF9	7	n	residence|dwelling
\u5907\u53D7	b\xE8i sh\xF2u	7	v	fully experience
\u5934\u9876	t\xF3u d\u01D0ng	7	n	top of the head
\u6C27\u6C14	y\u01CEng q\xEC	6	n	oxygen
\u4FDD\u5065	b\u01CEo ji\xE0n	6	n	health protection|health care|maintain in good health
\u63A8\u7FFB	tu\u012B f\u0101n	7	v	overthrow
\u5F39\u6027	t\xE1n x\xECng	7	n	flexibility|elasticity
\u758F\u6563	sh\u016B s\xE0n	7	v	scatter|disperse|evacuate|scattered|relax
\u7814\u5236	y\xE1n zh\xEC	4	v	research and manufacture|research and to develop
\u5883\u5185	j\xECng n\xE8i	7	s	within the borders|internal|domestic
\u8F6C\u52A8	zhu\xE0n d\xF2ng	4	v	rotate|revolve|turn|move in a circle|gyrate|turn sth around|swivel
\u7164\u6C14	m\xE9i q\xEC	5	n	coal gas|gas
\u5BCC\u88D5	f\xF9 y\xF9	7	a	prosperous|well-to-do|well-off
\u8106	cu\xEC	5	a	brittle|fragile|crisp|crunchy|clear and loud voice|neat
\u6210\u5E74	ch\xE9ng ni\xE1n	7	vn	grow to adulthood|fully grown|adult|whole year
\u65E5\u76CA	r\xEC y\xEC	7	d	day by day|more and more|increasingly
\u804C\u5DE5	zh\xED g\u014Dng	3	n	workers|staff
\u5E86\u5178	q\xECng di\u01CEn	7	n	celebration
\u6728\u5934	m\xF9 tou	3	n	slow-witted|blockhead|log
\u5149\u5F69	gu\u0101ng c\u01CEi	7	a	luster|splendor|radiance|brilliance
\u683C\u5916	g\xE9 w\xE0i	4	d	especially|particularly
\u79BB\u4E0D\u5F00	l\xED bu k\u0101i	4	v	inseparable|inevitably linked to
\u5927\u8C61	d\xE0 xi\xE0ng	5	n	elephant
\u9020\u5C31	z\xE0o ji\xF9	7	v	bring up|train|contribute to|achievements
\u682A	zh\u016B	7	q	tree trunk|stump|plant|strain|involve others
\u9690\u5F62	y\u01D0n x\xEDng	7	b	invisible
\u5927\u5C40	d\xE0 j\xFA	7	n	overall situation|big picture
\u4EBA\u624B	r\xE9n sh\u01D2u	7	n	manpower|staff|human hand
\u6682	z\xE0n	7	d	temporary|taiwan pr|scurry
\u4E0D\u9002	b\xF9 sh\xEC	7	a	unwell|indisposed|out of sorts
\u6EE5\u7528	l\xE0n y\xF2ng	7	v	misuse|abuse
\u51BB\u7ED3	d\xF2ng ji\xE9	7	v	freeze
\u91CE\u751F	y\u011B sh\u0113ng	6	b	wild|undomesticated
\u5217\u4E3A	li\xE8 w\xE9i	4	v	be classified as
\u6108\u5408	y\xF9 h\xE9	7	v	heal
\u6982\u7387	g\xE0i l\u01DC	7	n	probability
\u5C31\u662F\u8BF4	ji\xF9 sh\xEC shu\u014D	6	c	in other words|that is
\u8349\u576A	c\u01CEo p\xEDng	7	n	lawn
\u8425\u9020	y\xEDng z\xE0o	7	v	build|construct|make
\u8BB2\u5EA7	ji\u01CEng zu\xF2	4	n	course of lectures
\u51FA\u884C	ch\u016B x\xEDng	6	v	go out somewhere
\u4FA6\u63A2	zh\u0113n t\xE0n	6	n	detective|do detective work
\u8D8A\u8FC7	yu\xE8 gu\xF2	7	v	cross over|transcend|cover distance|overcome|rise above
\u6B8B\u75BE	c\xE1n j\xED	6	n	disabled|handicapped
\u8865\u8D34	b\u01D4 ti\u0113	5	n	subsidize|subsidy|allowance|supplement|benefit
\u6D77\u6C34	h\u01CEi shu\u01D0	4	n	seawater
\u957F\u8FDC	ch\xE1ng yu\u01CEn	6	a	long-term|long-range
\u52A8\u6447	d\xF2ng y\xE1o	4	v	sway|waver|rock|rattle|destabilize|pose a challenge to
\u8FF7\u8DEF	m\xED l\xF9	7	v	lose the way|lost|labyrinth|labyrinthus vestibularis
\u5370\u5237	y\xECn shu\u0101	5	vn	print|printing
\u7A0D\u540E	sh\u0101o h\xF2u	7	d	in a little while|in a moment|later on
\u4E22\u4EBA	di\u016B r\xE9n	7	a	lose face
\u6000\u91CC	hu\xE1i l\u01D0	7	s	embrace|bosom
\u6320	n\xE1o	7	v	scratch|thwart|yield
\u843D\u5730	lu\xF2 d\xEC	7	v	fall to the ground|reach to the ground|be born|land
\u516C\u52A1	g\u014Dng w\xF9	7	n	official business
\u6765\u8BBF	l\xE1i f\u01CEng	7	v	pay a visit
\u4F53\u64CD	t\u01D0 c\u0101o	4	n	gymnastic|gymnastics
\u7A46\u65AF\u6797	M\xF9 s\u012B l\xEDn	7	nz	muslim
\u53E3\u97F3	k\u01D2u yin	7	n	voice|accent|oral speech sounds
\u7A00	x\u012B	7	a	rare|uncommon|watery|sparse
\u4E71\u4E03\u516B\u7CDF	lu\xE0n q\u012B b\u0101 z\u0101o	7	l	chaotic|in disorder|muddled
\u5916\u5F62	w\xE0i x\xEDng	7	n	figure|shape|external form|contour
\u8D2B\u7A77	p\xEDn qi\xF3ng	7	a	poor|impoverished
\u80A5\u80D6	f\xE9i p\xE0ng	7	a	fat|obese
\u5236\u6210	zh\xEC ch\xE9ng	5	v	manufacture|turn out
\u5224\u5904	p\xE0n ch\u01D4	7	v	sentence|condemn
\u8D60	z\xE8ng	5	v	give as a present|repel
\u82F1\u4FCA	y\u012Bng j\xF9n	7	a	handsome
\u884C\u5217	h\xE1ng li\xE8	7	n	formation|array|ranks
\u820D\u4E0D\u5F97	sh\u011B bu de	5	v	hate to do sth|hate to part with|begrudge
\u53D8\u5F02	bi\xE0n y\xEC	7	n	variation
\u5927\u7237	d\xE0 y\xE9	4	n	arrogant idler|self-centered show-off|father's older brother|uncle
\u719F\u4EBA	sh\xFA r\xE9n	3	n	acquaintance|friend
\u7535\u7EBF	di\xE0n xi\xE0n	7	n	wire|power cord
\u79CB\u5B63	qi\u016B j\xEC	4	t	autumn|fall
\u6301\u4E45	ch\xED ji\u01D4	7	a	lasting|enduring|persistent|permanent|protracted|endurance|persistence|last long
\u9EBB\u75F9	m\xE1 b\xEC	7	a	paralysis|palsy|numbness|benumb|lull|negligent|apathetic
\u5236\u88C1	zh\xEC c\xE1i	7	vn	punish|punishment|sanctions
\u62DB\u52DF	zh\u0101o m\xF9	7	v	recruit|enlist
\u65E5\u7A0B	r\xEC ch\xE9ng	7	n	schedule|itinerary
\u79F0\u4F5C	ch\u0113ng zu\xF2	7	v	be called|be known as
\u53F0\u98CE	t\xE1i f\u0113ng	5	n	stage presence, poise|typhoon
\u9884\u611F	y\xF9 g\u01CEn	7	n	have a premonition|premonition
\u7EC5\u58EB	sh\u0113n sh\xEC	7	n	gentleman
\u5F15\u9886	y\u01D0n l\u01D0ng	7		crane one's neck|await eagerly|lead|show the way
\u5F00\u5F20	k\u0101i zh\u0101ng	7	v	open a business
\u6297\u62D2	k\xE0ng j\xF9	7	v	resist|defy|oppose
\u62A5\u5230	b\xE0o d\xE0o	3	v	report for duty|check in|register
\u666F\u8272	j\u01D0ng s\xE8	3	n	scenery|scene|landscape|view
\u660E\u65E5	m\xEDng r\xEC	6	t	tomorrow
\u8BC4\u5224	p\xEDng p\xE0n	7	v	judge|appraise
\u627F\u529E	ch\xE9ng b\xE0n	5	v	undertake|accept a contract
\u8868\u683C	bi\u01CEo g\xE9	3	n	form|table
\u9762\u6761	mi\xE0n ti\xE1o	3	n	noodles
\u4E0D\u582A	b\xF9 k\u0101n	7	v	cannot bear|cannot stand|utterly|extremely
\u96F6\u98DF	l\xEDng sh\xED	4	n	between-meal nibbles|snacks
\u522B\u626D	bi\xE8 niu	7	a	awkward|difficult|uncomfortable|not agreeing|at loggerheads|gauche
\u521D\u671F	ch\u016B q\u012B	5	f	initial stage|beginning period
\u5927\u7247	d\xE0 pi\xE0n	7	n	wide expanse|large area|vast stretch|extending widely|blockbuster movie
\u641E\u597D	g\u01CEo h\u01CEo	5	v	do well at|do a good job
\u6572\u95E8	qi\u0101o m\xE9n	5	v	knock on a door
\u8F70\u70B8	h\u014Dng zh\xE0	7	v	bomb|bombard
\u56E0\u800C	y\u012Bn \xE9r	5	c	therefore|as a result|thus|and as a result,
\u6307\u6807	zh\u01D0 bi\u0101o	5	n	target|quota|index|indicator|sign|signpost|pointer
\u76CF	zh\u01CEn	7	q	small cup
\u878D\u5316	r\xF3ng hu\xE0	7	v	melt|thaw|dissolve|blend into|combine|fuse
\u53BB\u6389	q\xF9 di\xE0o	6	v	get rid of|exclude|eliminate|remove|delete|strip out|extract
\u6B3E\u5F0F	ku\u01CEn sh\xEC	7	n	pattern|style|design|elegant|elegance|good taste
\u63C9	r\xF3u	7	v	knead|massage|rub
\u5DE7\u5999	qi\u01CEo mi\xE0o	6	a	ingenious|clever|ingenuity|artifice
\u611F\u6027	g\u01CEn x\xECng	7	n	perception|perceptual|sensibility|sensitive|emotional|sentimental
\u6D41\u7A0B	li\xFA ch\xE9ng	7	n	course|stream|sequence of processes|work flow in manufacturing
\u63A2\u9669	t\xE0n xi\u01CEn	7	vn	explore|go on an expedition|adventure
\u6B63\u7ECF	zh\xE8ng j\u012Bng	6	a	decent|honorable|proper|serious|according to standards
\u5728\u7EBF	z\xE0i xi\xE0n	7	vn	online
\u5B8C\u86CB	w\xE1n d\xE0n	7	v	be done for
\u6CB3\u6D41	h\xE9 li\xFA	7	n	river
\u547C\u5524	h\u016B hu\xE0n	7	v	call out|shout
\u4E3B\u529B	zh\u01D4 l\xEC	7	n	main force
\u7167\u76F8	zh\xE0o xi\xE0ng	2	v	take a photograph
\u76C8\u5229	y\xEDng l\xEC	7	v	profit|gain|make profits
\u4E66\u7C4D	sh\u016B j\xED	7	n	books|works
\u4E0A\u8FF0	sh\xE0ng sh\xF9	7	b	aforementioned|above-mentioned
\u9876\u5C16	d\u01D0ng ji\u0101n	7	b	peak|apex|world best|number one|finest|top
\u4F20\u5A92	chu\xE1n m\xE9i	6	n	media
\u653E\u7F6E	f\xE0ng zh\xEC	7	v	put
\u9009\u6C11	xu\u01CEn m\xEDn	7	n	voter|constituency|electorate
\u78B0\u649E	p\xE8ng zhu\xE0ng	7	vn	collide|collision
\u5165\u624B	r\xF9 sh\u01D2u	7	v	receive|obtain|buy
\u5F55\u5236	l\xF9 zh\xEC	7	v	record
\u901A\u884C	t\u014Dng x\xEDng	6	v	go through|pass through|be in general use
\u786E\u4FE1	qu\xE8 x\xECn	7	v	be convinced|be sure|firmly believe|be positive that|definite news
\u9500\u6BC1	xi\u0101o hu\u01D0	7	v	destroy|obliterate
\u51B5\u4E14	ku\xE0ng qi\u011B	7	c	moreover|besides|in addition|furthermore
\u52A8\u7269\u56ED	d\xF2ng w\xF9 yu\xE1n	2	n	zoo
\u9CA8\u9C7C	sh\u0101 y\xFA	7	n	shark
\u8F66\u95F4	ch\u0113 ji\u0101n	7	n	workshop
\u4E30\u539A	f\u0113ng h\xF2u	7	a	generous|ample
\u53E3\u5F84	k\u01D2u j\xECng	7	n	bore|caliber|diameter|aperture|stance|version|account|narrative
\u76D8\u5B50	p\xE1n zi	4	n	tray|plate|dish
\u529F\u8BFE	g\u014Dng k\xE8	3	n	homework|assignment|task|classwork|lesson|study
\u8BBF\u8C08	f\u01CEng t\xE1n	7	vn	visit and discuss|interview
\u8868\u626C	bi\u01CEo y\xE1ng	4	v	praise|commend
\u901A\u544A	t\u014Dng g\xE0o	7	n	announce|give notice|announcement
\u8D44\u672C\u4E3B\u4E49	z\u012B b\u011Bn zh\u01D4 y\xEC	7	n	capitalism
\u4ED8\u6B3E	f\xF9 ku\u01CEn	7	v	payment
\u5FCD\u8010	r\u011Bn n\xE0i	7	v	endure|bear with|exercise patience|restrain oneself|patience|endurance
\u8349\u5730	c\u01CEo d\xEC	2	n	lawn|meadow|sod|turf
\u524A	xu\u0113	7	v	pare|reduce|remove|taiwan pr|peel with a knife|cut
\u836F\u5E97	y\xE0o di\xE0n	2	n	pharmacy
\u5956\u676F	ji\u01CEng b\u0113i	7	n	trophy cup
\u7834\u788E	p\xF2 su\xEC	7	a	smash to pieces|shatter
\u94F2	ch\u01CEn	7	v	shovel|remove|spade|level off|root up
\u6050\u9F99	k\u01D2ng l\xF3ng	7	n	dinosaur|ugly person
\u9664\u53BB	ch\xFA q\xF9	7	v	eliminate|remove|except for|apart from
\u571F\u58E4	t\u01D4 r\u01CEng	7	n	soil
\u901A\u5BB5	t\u014Dng xi\u0101o	7	n	all night|throughout the night
\u6C61\u6C34	w\u016B shu\u01D0	5	n	sewage
\u503C\u94B1	zh\xED qi\xE1n	7	a	valuable|costly|expensive
\u7709\u6BDB	m\xE9i mao	7	n	eyebrow
\u7406\u4F1A	l\u01D0 hu\xEC	7	v	understand|pay attention to|take notice of
\u5357\u74DC	n\xE1n gu\u0101	7	n	pumpkin
\u53D1\u70ED	f\u0101 r\xE8	7	v	have a high temperature|feverish|unable to think calmly|emit heat
\u6269\u5C55	ku\xF2 zh\u01CEn	4	v	extend|expand|extension|expansion
\u62B5\u5236	d\u01D0 zh\xEC	7	v	resist|boycott|refuse|reject|resistance|refusal
\u5883\u5730	j\xECng d\xEC	7	n	circumstances
\u8D2A\u5A6A	t\u0101n l\xE1n	7	a	avaricious|greedy|rapacious|insatiable|avid
\u9006	n\xEC	7	g	contrary|opposite|backwards|go against|oppose|betray|rebel
\u5B66\u5386	xu\xE9 l\xEC	7	n	educational background|academic qualifications
\u897F\u74DC	x\u012B gu\u0101	4	n	watermelon
\u75DB\u5FEB	t\xF2ng ku\xE0i	4	a	delighted|one's heart's content|straightforward|also pr
\u4E00\u4EE3	y\u012B d\xE0i	6	n	generation
\u5F97\u7F6A	d\xE9 zu\xEC	7	v	commit an offense|violate the law|excuse me|offend sb|make a faux pas|faux pas
\u7E41\u6B96	f\xE1n zh\xED	6	v	breed|reproduce|propagate
\u8DE8\u8D8A	ku\xE0 yu\xE8	7	v	step across|step over
\u4FDD\u91CD	b\u01CEo zh\xF2ng	7	v	take care of oneself
\u52A0\u91CD	ji\u0101 zh\xF2ng	7	v	make heavier|emphasize|become more serious|aggravate|increase
\u5962\u4F88	sh\u0113 ch\u01D0	7	a	luxurious|extravagant
\u4FE1\u4EF6	x\xECn ji\xE0n	7	n	letter
\u94C5\u7B14	qi\u0101n b\u01D0	6	n	pencil
\u5947\u7279	q\xED t\xE8	7	a	peculiar|unusual|queer
\u4E25\u5CFB	y\xE1n j\xF9n	7	a	grim|severe|rigorous
\u88AB\u52A8	b\xE8i d\xF2ng	5	a	passive
\u5DF7	xi\xE0ng	6	g	lane|alley
\u5E73\u7A33	p\xEDng w\u011Bn	4	a	smooth|steady
\u7CAA	f\xE8n	7	n	manure|dung
\u6846	ku\xE0ng	7	g	frame|casing|fig. framework|template|circle|restrict|taiwan pr
\u60EF	gu\xE0n	7	v	accustomed to|used to|indulge|spoil
\u7EAA\u5FF5\u65E5	j\xEC ni\xE0n r\xEC	7	n	day of commemoration|memorial day
\u8206\u8BBA	y\xFA l\xF9n	7	n	public opinion
\u589E\u5927	z\u0113ng d\xE0	5	v	enlarge|amplify|magnify
\u4FA6\u5BDF	zh\u0113n ch\xE1	7	v	investigate a crime|scout|reconnoiter|reconnaissance|detection
\u5F53\u9762	d\u0101ng mi\xE0n	7	d	sb's face|in sb's presence
\u9884\u544A	y\xF9 g\xE0o	7	v	forecast|predict|advance notice
\u7981\u533A	j\xECn q\u016B	7	n	restricted area|forbidden region
\u8EAB\u5F71	sh\u0113n y\u01D0ng	7	n	silhouette|figure
\u4E8B\u8FF9	sh\xEC j\xEC	7	n	deed|past achievement
\u503E\u659C	q\u012Bng xi\xE9	7	v	incline|lean|slant|slope|tilt
\u665A\u95F4	w\u01CEn ji\u0101n	7	t	evening|night
\u773C\u770B	y\u01CEn k\xE0n	6	v	soon|in a moment
\u9ED1\u767D	h\u0113i b\xE1i	7	b	black and white|right and wrong|monochrome
\u7269\u8D44	w\xF9 z\u012B	7	n	goods|supplies
\u8BFE\u9898	k\xE8 t\xED	5	n	task|problem|issue
\u7F8E\u672F	m\u011Bi sh\xF9	3	n	art|fine arts|painting
\u65F6\u6BB5	sh\xED du\xE0n	7	n	time interval|work shift|time slot
\u72B9\u5982	y\xF3u r\xFA	7	v	similar to|like
\u62DB\u724C	zh\u0101o pai	7	n	signboard|shop sign|reputation of a business
\u8058\u8BF7	p\xECn q\u01D0ng	6	v	engage|hire
\u4EF7\u503C\u89C2	ji\xE0 zh\xED gu\u0101n	7	n	system of values
\u8FC4\u4ECA\u4E3A\u6B62	q\xEC j\u012Bn w\xE9i zh\u01D0	7	l	so far|up to now|still
\u652F\u67F1	zh\u012B zh\xF9	7	n	mainstay|pillar|prop|backbone
\u5F02\u8BAE	y\xEC y\xEC	7	n	objection|dissent
\u4E00\u5FC3	y\u012B x\u012Bn	7	d	wholeheartedly|heart and soul
\u9965\u997F	j\u012B \xE8	7	n	hunger|starvation|famine
\u5BA3\u544A	xu\u0101n g\xE0o	7	v	declare|proclaim
\u4E00\u5934	y\u012B t\xF3u	7	mq	one head|head full of sth|one end|one side|headlong|directly|rapidly|simultaneously
\u5F13	g\u014Dng	7	n	bow|bend|arch
\u53D8\u9769	bi\xE0n g\xE9	7	vn	transform|change
\u7A7A\u865A	k\u014Dng x\u016B	7	a	hollow|emptiness|meaningless
\u7AD6	sh\xF9	7	v	erect|vertical|vertical stroke
\u8D23\u4EFB\u611F	z\xE9 r\xE8n g\u01CEn	7	n	sense of responsibility
\u95E8\u8BCA	m\xE9n zh\u011Bn	5	n	outpatient service
\u6545\u4E61	g\xF9 xi\u0101ng	3	n	home|homeland|native place
\u8BA4\u5F97	r\xE8n de	3	v	recognize|know
\u5173\u673A	gu\u0101n j\u012B	2	v	turn off|finish shooting a film
\u5BB6\u52A1	ji\u0101 w\xF9	4	n	household duties|housework
\u4EE3\u8A00\u4EBA	d\xE0i y\xE1n r\xE9n	7	n	spokesperson
\u6D77\u9C9C	h\u01CEi xi\u0101n	4	n	seafood
\u4E00\u822C\u6765\u8BF4	y\u012B b\u0101n l\xE1i shu\u014D	4	v	generally speaking
\u5587\u53ED	l\u01CE ba	7	n	horn|loudspeaker|brass wind instrument|trumpet
\u9732\u9762	l\xF2u mi\xE0n	7	v	show one's face|appear
\u514D\u5F97	mi\u01CEn de	6	v	so as not to|so as to avoid
\u5B9E\u8D28	sh\xED zh\xEC	7	n	substance|essence
\u90AE\u7968	y\xF3u pi\xE0o	3	n	stamp
\u5F00\u5E55	k\u0101i m\xF9	5	v	open|inaugurate
\u6697\u4E2D	\xE0n zh\u014Dng	7	d	in the dark|in secret|on the sly|surreptitiously
\u4EBA\u4E3A	r\xE9n w\xE9i	7	b	artificial|man-made|human attempt or effort
\u575A\u5B88	ji\u0101n sh\u01D2u	7	v	hold fast to|stick to
\u8BA1\u8F83	j\xEC ji\xE0o	7	v	bother about|haggle|bicker|argue|plan|stratagem
\u7855\u58EB	shu\xF2 sh\xEC	5	n	master's degree|learned person
\u5E06	f\u0101n	7	n	gallop|taiwan pr|sail
\u7279\u5927	t\xE8 d\xE0	6	b	exceptionally big
\u6346	k\u01D4n	7	v	bunch|tie together|bundle
\u63CF\u5199	mi\xE1o xi\u011B	4	v	describe|depict|portray|description
\u65E0\u80FD	w\xFA n\xE9ng	7	a	incompetence|inability|incapable|powerless
\u8D29\u5356	f\xE0n m\xE0i	7	v	sell|peddle|traffic
\u6DFB\u52A0	ti\u0101n ji\u0101	7	v	add|increase
\u76F8\u7247	xi\xE0ng pi\xE0n	4	n	image|photograph
\u81F3\u6B64	zh\xEC c\u01D0	7	d	up until now|so far
\u4EA7\u7269	ch\u01CEn w\xF9	7	n	product|result
\u5173\u6389	gu\u0101n di\xE0o	7	v	switch off|shut off
\u8000\u773C	y\xE0o y\u01CEn	7	a	dazzle|dazzling
\u6162\u6027	m\xE0n x\xECng	7	b	slow and patient|chronic|slow to take effect
\u5BCC\u7FC1	f\xF9 w\u0113ng	7	n	rich person|millionaire|billionaire
\u84B8	zh\u0113ng	7	v	evaporate|steam|finely chopped firewood
\u6D41\u7545	li\xFA ch\xE0ng	7	a	flowing|fluent|smooth and easy
\u6811\u6728	sh\xF9 m\xF9	7	n	tree
\u5D1B\u8D77	ju\xE9 q\u01D0	7	v	rise abruptly|tower over|spring up|emerge suddenly|emergence
\u70B9\u5B50	di\u01CEn zi	7	n	spot|point|dot|speck|drop|droplet|idea|crux
\u82CD\u8747	c\u0101ng ying	7	n	housefly
\u5E73\u9762	p\xEDng mi\xE0n	7	n	plane|print media
\u7164\u77FF	m\xE9i ku\xE0ng	7	n	coal mine|coal seam
\u8FC7\u5934	gu\xF2 t\xF3u	7	a	overdo it|overstep the limit|excessively|above one's head|overhead
\u6402	l\u014Du	7	v	draw towards oneself|gather|gather up|grab|extort|hug|embrace|hold in one's arms
\u846C\u793C	z\xE0ng l\u01D0	7	n	burial|funeral
\u5305\u88B1	b\u0101o fu	7	n	wrapping cloth|bundle wrapped in cloth|load|weight|burden|funny part|punchline
\u7A97\u5E18	chu\u0101ng li\xE1n	5	n	window curtains
\u5F15\u4EBA\u6CE8\u76EE	y\u01D0n r\xE9n zh\xF9 m\xF9	7	v	attract attention|eye-catching|conspicuous
\u8BF8\u4F4D	zh\u016B w\xE8i	6	r	everyone|ladies and gentlemen|sirs
\u53D1\u813E\u6C14	f\u0101 p\xED q\xEC	7	v	get angry
\u594F	z\xF2u	6	v	play music|achieve
\u6539\u88C5	g\u01CEi zhu\u0101ng	6	v	change one's costume|repackage|remodel|refit|modify|convert
\u8981\u70B9	y\xE0o di\u01CEn	7	n	main point|essential
\u7B11\u8138	xi\xE0o li\u01CEn	6	n	smiling face|smiley :) \u263A
\u7F34	ji\u01CEo	7	v	hand in|hand over|seize
\u4E61\u4E0B	xi\u0101ng xia	7	s	countryside|rural area
\u6838\u5B9E	h\xE9 sh\xED	7	v	verify|check
\u54BD	y\u0101n	7	v	throat|pharynx|narrow pass|choke|swallow
\u6B66\u672F	w\u01D4 sh\xF9	3	n	military skill or technique|self-defense
\u622A\u6B62	ji\xE9 zh\u01D0	6	v	close|stop|cut-off point|stopping point|deadline
\u63A8\u5F00	tu\u012B k\u0101i	3	v	push open|push away|reject|decline
\u51B7\u51BB	l\u011Bng d\xF2ng	7	v	freeze|deep-freeze
\u77ED\u88E4	du\u01CEn k\xF9	3	n	short pants|shorts
\u80DC\u8D1F	sh\xE8ng f\xF9	5	n	victory or defeat|outcome of a battle
\u5F00\u5E55\u5F0F	k\u0101i m\xF9 sh\xEC	5	n	opening ceremony
\u7578\u5F62	j\u012B x\xEDng	7	n	deformity|abnormality
\u9E3D\u5B50	g\u0113 zi	7	n	pigeon|dove
\u53D1\u8D22	f\u0101 c\xE1i	7	v	get rich
\u7279\u6709	t\xE8 y\u01D2u	5	b	specific|characteristic|distinctive
\u53D1\u75C5	f\u0101 b\xECng	6	v	occur|get sick|fall ill|onset
\u5306\u5306	c\u014Dng c\u014Dng	7	z	hurriedly
\u6674	q\xEDng	2	v	clear|fine
\u67E5\u627E	ch\xE1 zh\u01CEo	7	v	search for|look up
\u5F80\u5E38	w\u01CEng ch\xE1ng	7	t	usual|customary
\u9690\u853D	y\u01D0n b\xEC	7	a	conceal|hide|covert|under cover
\u6551\u6D4E	ji\xF9 j\xEC	7	n	emergency relief
\u590D\u82CF	f\xF9 s\u016B	6	v	recover|resuscitate|anabiosis
\u7CCA	h\xFA	7	v	muddled|paste|scorched|cream|congee|making a living
\u7EC8\u751F	zh\u014Dng sh\u0113ng	7	m	throughout one's life|lifetime|lifelong
\u8DD1\u8F66	p\u01CEo ch\u0113	7	n	racing bicycle|racing car|sports car|work on a train|slip away
\u9886\u5E26	l\u01D0ng d\xE0i	5	n	necktie
\u7ADE\u6280	j\xECng j\xEC	7	n	competition of skill|athletics tournament
\u95F9\u949F	n\xE0o zh\u014Dng	4	n	alarm clock
\u9AD8\u7B49	g\u0101o d\u011Bng	6	b	high-level|higher|advanced
\u4E13\u680F	zhu\u0101n l\xE1n	7	n	special column
\u5F53\u4E0B	d\u0101ng xi\xE0	7	t	immediately|at once|at that moment|at the moment
\u5206\u8FA8	f\u0113n bi\xE0n	7	v	distinguish|differentiate|resolve
\u63CF\u7ED8	mi\xE1o hu\xEC	7	v	describe|portray
\u5730\u4E0B\u5BA4	d\xEC xi\xE0 sh\xEC	6	n	basement|cellar
\u6CD5\u8BED	F\u01CE y\u01D4	6	nz	french
\u8D35\u5BBE	gu\xEC b\u012Bn	7	n	honored guest|distinguished guest|vip
\u5B9E\u4F53	sh\xED t\u01D0	7	n	entity|substance|real thing
\u8BFA\u8A00	nu\xF2 y\xE1n	7	n	promise
\u89C2\u5149	gu\u0101n gu\u0101ng	6	v	tour|sightseeing|tourism
\u8D5E\u626C	z\xE0n y\xE1ng	7	v	praise|approve of|show approval
\u8FF7\u604B	m\xED li\xE0n	7	v	be infatuated with|be enchanted by|be passionate about
\u7B79\u96C6	ch\xF3u j\xED	7	v	collect money|raise funds
\u6D3E\u9063	p\xE0i qi\u01CEn	7	v	send|dispatch
\u63EA	ji\u016B	7	v	seize|clutch|grab firmly and pull
\u6298\u6263	zh\xE9 k\xF2u	7	n	discount
\u8205\u8205	ji\xF9 jiu	7	n	mother's brother|maternal uncle
\u65F6\u901F	sh\xED s\xF9	7	n	speed per hour
\u9521	x\u012B	7	n	tin|bestow|confer|grant|taiwan pr
\u9996\u9970	sh\u01D2u sh\xEC	7	n	jewelry|head ornament
\u4E3B\u89C2	zh\u01D4 gu\u0101n	5	a	subjective
\u5927\u59D0	d\xE0 ji\u011B	4	n	big sister|elder sister|older sister
\u540E\u5929	h\xF2u ti\u0101n	1	n	day after tomorrow|acquired|posteriori
\u4E0D\u5BB9	b\xF9 r\xF3ng	7	v	must not|cannot|not allow|cannot tolerate
\u5F3A\u76D7	qi\xE1ng d\xE0o	6	n	rob|bandit|robber
\u4E34\u8FD1	l\xEDn j\xECn	7	v	close to|approaching
\u67B6\u5B50	ji\xE0 zi	7	n	shelf|frame|stand|framework|airs|arrogance
\u4E00\u5982\u65E2\u5F80	y\u012B r\xFA j\xEC w\u01CEng	7	v	as before|continuing as always
\u5B89\u5B81	\u0101n n\xEDng	7	an	peaceful|tranquil|calm|composed|free from worry|anning city
\u65F6\u4E0D\u65F6	sh\xED b\xF9 sh\xED	7	d	from time to time
\u5377\u5165	ju\u01CEn r\xF9	7	v	be drawn into|be involved in
\u5951\u7EA6	q\xEC yu\u0113	7	n	agreement|contract
\u643A\u624B	xi\xE9 sh\u01D2u	7	v	hand in hand|join hands|collaborate
\u5F52\u8FD8	gu\u012B hu\xE1n	7	v	return sth|revert
\u503E\u8BC9	q\u012Bng s\xF9	7	v	say everything
\u6D77\u6E7E	h\u01CEi w\u0101n	6	n	bay|gulf
\u7F29\u77ED	su\u014D du\u01CEn	4	v	curtail|cut down
\u60C5\u613F	q\xEDng yu\xE0n	7	v	willingness|would rather
\u6E34	k\u011B	1	a	thirsty
\u5934\u8854	t\xF3u xi\xE1n	7	n	title|rank|appellation
\u76F8\u8FDE	xi\u0101ng li\xE1n	7	v	link|join|connection
\u5FC3\u4E8B	x\u012Bn sh\xEC	7	n	load on one's mind|worry
\u4F9D\u6CD5	y\u012B f\u01CE	5	d	legal|according to law
\u80A2\u4F53	zh\u012B t\u01D0	7	n	limb|limbs and trunk|body
\u7259\u818F	y\xE1 g\u0101o	7	n	toothpaste
\u9650\u4E8E	xi\xE0n y\xFA	7	v	be limited to|be confined to
\u5148\u540E	xi\u0101n h\xF2u	5	d	early or late|priority|in succession|one after another
\u6355\u6349	b\u01D4 zhu\u014D	7	v	catch|seize|capture
\u51FA\u6F14	ch\u016B y\u01CEn	7	v	appear|appearance
\u7B4B	j\u012Bn	7	n	muscle|tendon
\u6C14\u7403	q\xEC qi\xFA	4	n	balloon
\u9047\u96BE	y\xF9 n\xE0n	7	v	perish|be killed
\u6562\u4E8E	g\u01CEn y\xFA	6	v	dare to|bold in
\u8FC7\u4E0D\u53BB	gu\xF2 bu q\xF9	7	v	make life difficult for|embarrass
\u516C\u76CA	g\u014Dng y\xEC	7	n	public good|public welfare|public interest
\u6469\u6258	m\xF3 tu\u014D	5	n	motor|motorbike
\u70E4\u8089	k\u01CEo r\xF2u	5	n	barbecue
\u4E50\u5668	yu\xE8 q\xEC	7	n	musical instrument
\u6625\u5B63	ch\u016Bn j\xEC	4	t	springtime
\u8087\u4E8B	zh\xE0o sh\xEC	7	vn	cause an accident|provoke a disturbance
\u6C14\u52BF	q\xEC sh\xEC	7	n	imposing manner|loftiness|grandeur|energetic looks|vigor
\u65A9	zh\u01CEn	7	v	behead|chop
\u623F\u4E1C	f\xE1ng d\u014Dng	3	n	landlord
\u8F66\u9053	ch\u0113 d\xE0o	7	n	traffic lane|driveway
\u4E8B\u9879	sh\xEC xi\xE0ng	7	n	matter|item
\u5929\u7136\u6C14	ti\u0101n r\xE1n q\xEC	5	n	natural gas
\u730E\u4EBA	li\xE8 r\xE9n	7	n	hunter
\u4E22\u8138	di\u016B li\u01CEn	7	a	lose face|humiliation
\u957F\u9014	ch\xE1ng t\xFA	4	b	long distance
\u614E\u91CD	sh\xE8n zh\xF2ng	7	a	cautious|careful|prudent
\u533B\u52A1	y\u012B w\xF9	7	b	medical affairs
\u6C34\u7BA1	shu\u01D0 gu\u01CEn	7	n	water pipe
\u865A\u5F31	x\u016B ru\xF2	7	a	weak|in poor health
\u706B\u82B1	hu\u01D2 hu\u0101	7	n	spark|sparkle
\u8D5E\u8D4F	z\xE0n sh\u01CEng	4	v	admire|praise|appreciate
\u96C6\u88C5\u7BB1	j\xED zhu\u0101ng xi\u0101ng	7	n	container
\u5168\u529B\u4EE5\u8D74	qu\xE1n l\xEC y\u01D0 f\xF9	7	v	do at all costs|make an all-out effort
\u822A\u5929	h\xE1ng ti\u0101n	7	n	space flight
\u534F\u4F5C	xi\xE9 zu\xF2	7	v	cooperation|coordination
\u731C\u60F3	c\u0101i xi\u01CEng	7	v	guess|conjecture|suppose|hypothesis
\u65E0\u7EBF\u7535	w\xFA xi\xE0n di\xE0n	7	n	wireless
\u5927\u961F	d\xE0 du\xEC	7	n	group|large body of|production brigade|military group
\u89E3\u8BFB	ji\u011B d\xFA	7	v	decipher|decode|interpret
\u8D44\u8BAF	z\u012B x\xF9n	7	n	information
\u5BF9\u51C6	du\xEC zh\u01D4n	7	v	aim at|target|point at|be directed at|registration|alignment
\u8E6D	c\xE8ng	7	v	rub against|walk slowly|freeload
\u68D5\u8272	z\u014Dng s\xE8	6	n	brown
\u8BEF\u5BFC	w\xF9 d\u01CEo	7	v	mislead|misguide|misleading
\u5B64\u7ACB	g\u016B l\xEC	7	v	isolated|isolate
\u5668\u6750	q\xEC c\xE1i	7	n	equipment|material
\u5BF9\u5E94	du\xEC y\xECng	5	v	correspond|be equivalent to|be a counterpart to
\u65E0\u7A77	w\xFA qi\xF3ng	7	z	endless|boundless|inexhaustible
\u822A\u884C	h\xE1ng x\xEDng	7	v	sail|fly|navigate
\u5927\u9009	d\xE0 xu\u01CEn	7	vn	general election
\u524D\u8F88	qi\xE1n b\xE8i	7	n	senior|older generation|precursor
\u4E66\u623F	sh\u016B f\xE1ng	6	n	study|studio
\u7EA2\u706F	h\xF3ng d\u0113ng	7	n	red light
\u6253\u53D1	d\u01CE fa	6	v	make sb leave|pass|make arrangements|bestow
\u5E7F\u5927	gu\u01CEng d\xE0	3	b	vast or extensive|large-scale|widespread|numerous
\u660E\u4EAE	m\xEDng li\xE0ng	5	a	bright|shining|glittering|become clear
\u7262\u7262	l\xE1o l\xE1o	7	d	firmly|safely
\u603B\u6570	z\u01D2ng sh\xF9	5	n	total|sum|aggregate
\u6536\u97F3\u673A	sh\u014Du y\u012Bn j\u012B	3	n	radio
\u96BE\u4EE5\u7F6E\u4FE1	n\xE1n y\u01D0 zh\xEC x\xECn	7	v	hard to believe|incredible
\u8D77\u8349	q\u01D0 c\u01CEo	7	v	make a draft|draw up
\u526A\u5200	ji\u01CEn d\u0101o	5	n	scissors
\u9EBB\u6728	m\xE1 m\xF9	7	a	numb|insensitive|apathetic
\u91CD\u4F24	zh\xF2ng sh\u0101ng	7	n	seriously hurt|serious injury
\u9752\u86D9	q\u012Bng w\u0101	7	n	frog|ugly guy
\u8471	c\u014Dng	7	n	scallion|green onion
\u51FA\u9762	ch\u016B mi\xE0n	6	v	appear personally|step in|step forth|show up
\u901A\u98CE	t\u014Dng f\u0113ng	7	v	airy|ventilation|ventilate|disclose information
\u5954\u8DD1	b\u0113n p\u01CEo	6	v	run
\u51CF\u5F31	ji\u01CEn ru\xF2	7	v	weaken|diminish
\u6536\u89C6\u7387	sh\u014Du sh\xEC l\u01DC	7	n	ratings
\u6599\u5230	li\xE0o d\xE0o	7	v	foresee|anticipate
\u7ED8\u753B	hu\xEC hu\xE0	6	n	drawing|painting
\u6574\u5408	zh\u011Bng h\xE9	7	v	conform|integrate
\u51FA\u4F17	ch\u016B zh\xF2ng	7	a	stand out|outstanding
\u5408\u5F71	h\xE9 y\u01D0ng	7	n	take a joint photo|group photo
\u540E\u671F	h\xF2u q\u012B	7	f	late stage|later period
\u53CD\u611F	f\u01CEn g\u01CEn	7	v	be disgusted with|dislike|bad reaction|antipathy
\u7167\u6837	zh\xE0o y\xE0ng	6	d	as before|as usual|in the same manner|still|nevertheless
\u8425\u6551	y\xEDng ji\xF9	7	v	rescue
\u68D2\u7403	b\xE0ng qi\xFA	7	n	baseball
\u957F\u57CE	Ch\xE1ng ch\xE9ng	3	ns	great wall
\u6C89\u6D78	ch\xE9n j\xECn	7	v	soak|permeate|immerse
\u8BAE\u8BBA	y\xEC l\xF9n	4	v	comment|talk about|discuss|discussion
\u98DF\u7528	sh\xED y\xF2ng	7	v	eat|consume|edible
\u9910\u684C	c\u0101n zhu\u014D	7	n	dining table|dinner table
\u65B9\u4F4D	f\u0101ng w\xE8i	6	n	direction|points of the compass|bearing|position|azimuth
\u4ECE\u5934	c\xF3ng t\xF3u	7	d	anew|from the start
\u5BA2\u623F	k\xE8 f\xE1ng	7	n	guest room|room
\u6000\u62B1	hu\xE1i b\xE0o	7	n	hug|cherish|within the bosom|embrace
\u91CE\u517D	y\u011B sh\xF2u	7	n	beast|wild animal
\u5F53\u5FC3	d\u0101ng x\u012Bn	7	v	take care|look out
\u6C34\u6E90	shu\u01D0 yu\xE1n	7	n	water source|water supply|headwaters of a river
\u8870\u8001	shu\u0101i l\u01CEo	7	a	age|deteriorate with age|old and weak
\u540C\u611F	t\xF3ng g\u01CEn	7	n	same feeling|similar impression|common feeling
\u64CD\u5FC3	c\u0101o x\u012Bn	7	v	worry about
\u65F6\u95F4\u8868	sh\xED ji\u0101n bi\u01CEo	7	n	schedule|timetable
\u7406\u8D22	l\u01D0 c\xE1i	6	vn	manage wealth|manage finances|money management
\u5B66\u4E1A	xu\xE9 y\xE8	7	n	studies|schoolwork
\u603B\u7684\u6765\u8BF4	z\u01D2ng de l\xE1i shu\u014D	7	c	generally speaking|sum up|in summary|in short
\u73ED\u957F	b\u0101n zh\u01CEng	2	n	class monitor|squad leader|team leader
\u719F\u7EC3	sh\xFA li\xE0n	4	a	practiced|proficient|skilled|skillful
\u8F70\u52A8	h\u014Dng d\xF2ng	7	vn	cause a sensation|create a stir in|commotion|controversy
\u4E0A\u5F53	sh\xE0ng d\xE0ng	6	v	taken in|be fooled|be duped
\u82E6\u96BE	k\u01D4 n\xE0n	7	n	suffering
\u64AC	qi\xE0o	7	v	lift|pry open|lever open
\u6F14\u6280	y\u01CEn j\xEC	7	n	acting|performing skills
\u8FC7\u671F	gu\xF2 q\u012B	7	v	be overdue|exceed the time limit|expire
\u7B5B\u9009	sh\u0101i xu\u01CEn	7	v	filter
\u6865\u6881	qi\xE1o li\xE1ng	6	n	bridge
\u624B\u52BF	sh\u01D2u sh\xEC	7	n	gesture|sign|signal
\u731B\u70C8	m\u011Bng li\xE8	7	a	fierce|violent|vigorous|intense
\u597D\u574F	h\u01CEo hu\xE0i	7	n	good or bad|good and bad|standard|quality|very bad
\u7BA1\u5BB6	gu\u01CEn ji\u0101	7	n	butler|steward|manager|administrator|housekeeper|manage a household
\u88C1	c\xE1i	7	v	cut out|cut|trim|reduce|diminish|cut back|decision|judgment
\u5B87\u822A\u5458	y\u01D4 h\xE1ng yu\xE1n	6	n	astronaut
\u6709\u5F85	y\u01D2u d\xE0i	7	v	not yet|pending
\u5927\u4E8E	d\xE0 y\xFA	5	v	greater than|bigger than|more than
\u7F1D\u5408	f\xE9ng h\xE9	7	v	sew together|suture|sew up
\u624B\u52A8	sh\u01D2u d\xF2ng	7	b	manual|manually operated|manual gear-change
\u5E38\u7528	ch\xE1ng y\xF2ng	2	a	in common usage
\u4E2D\u671F	zh\u014Dng q\u012B	6	f	middle|medium-term
\u6D17\u624B\u95F4	x\u01D0 sh\u01D2u ji\u0101n	1	n	toilet|lavatory|washroom
\u793A\u5A01	sh\xEC w\u0113i	7	vn	demonstrate|demonstration|military show of force
\u6B4C\u821E	g\u0113 w\u01D4	7	n	singing and dancing
\u89C2\u8D4F	gu\u0101n sh\u01CEng	7	v	watch|ornamental
\u89C6\u89D2	sh\xEC ji\u01CEo	7	n	perspective|viewpoint|frame of reference|camera angle|visual angle|angle of view
\u91CD\u5FC3	zh\xF2ng x\u012Bn	7	n	center of gravity|central core|main part
\u8FF7\u4FE1	m\xED x\xECn	5	v	superstition|have a superstitious belief
\u91CC\u5934	l\u01D0 tou	2	f	inside|interior
\u4E0B\u8BFE	xi\xE0 k\xE8	1	v	finish class|get out of class|be dismissed|be fired
\u8BAE	y\xEC	7	v	comment on|discuss|suggest
\u6177\u6168	k\u0101ng k\u01CEi	7	a	vehement|fervent|generous|magnanimous
\u53CA\u683C	j\xED g\xE9	4	v	meet a minimum standard
\u5F00\u521B	k\u0101i chu\xE0ng	6	v	initiate|start|found
\u5DE8\u578B	j\xF9 x\xEDng	7	b	giant|enormous
\u70E6\u8E81	f\xE1n z\xE0o	7	a	jittery|twitchy|fidgety
\u58EE\u89C2	zhu\xE0ng gu\u0101n	6	a	spectacular|magnificent sight
\u5B58\u653E	c\xFAn f\xE0ng	7	v	deposit|store|leave in sb's care
\u8C26\u865A	qi\u0101n x\u016B	6	a	modest|self-effacing|make modest remarks
\u9022	f\xE9ng	7	v	meet by chance|come across|come along|fall on|fawn upon
\u8BB2\u7A76	ji\u01CEng jiu	4	v	pay particular attention to|carefully selected for quality|tastefully chosen
\u597D\u8BF4	h\u01CEo shu\u014D	7	a	easy to deal with|not a problem|you flatter me
\u6270\u4E71	r\u01CEo lu\xE0n	7	v	disturb|perturb|harass
\u6E90\u4E8E	yu\xE1n y\xFA	7	v	has its origins in
\u542F\u793A	q\u01D0 sh\xEC	7	vn	reveal|enlighten|enlightenment|revelation|illumination|moral|lesson
\u793E\u56E2	sh\xE8 tu\xE1n	7	n	association|society|group|union|club|organization
\u6784\u9020	g\xF2u z\xE0o	4	n	structure|composition|tectonic
\u6E21\u8FC7	d\xF9 gu\xF2	7	v	cross over|pass through
\u79D1\u7814	k\u0113 y\xE1n	6	n	research
\u5976\u725B	n\u01CEi ni\xFA	6	n	milk cow|dairy cow
\u9635\u5730	zh\xE8n d\xEC	6	n	position|front
\u8F6C\u60A0	zhu\xE0n you	7	v	roll|wander around|appear repeatedly
\u624B\u5934	sh\u01D2u t\xF3u	7	n	on hand|at hand|one's financial situation
\u6D4B\u9A8C	c\xE8 y\xE0n	7	vn	test
\u6E85	ji\xE0n	7	v	splash
\u8D44\u6DF1	z\u012B sh\u0113n	7	b	veteran|senior|highly experienced
\u7F13\u7F13	hu\u01CEn hu\u01CEn	7	d	slowly|unhurriedly|little by little
\u786E\u8BCA	qu\xE8 zh\u011Bn	7	v	make a definite diagnosis|confirmed
\u5D07\u9AD8	ch\xF3ng g\u0101o	7	a	majestic|sublime
\u7279\u8D28	t\xE8 zh\xEC	7	n	characteristic|special quality
\u505A\u751F\u610F	zu\xF2 sh\u0113ng y\xEC	7		do business
\u5C4A\u65F6	ji\xE8 sh\xED	7	d	when the time comes|at the scheduled time
\u9AD8\u6548	g\u0101o xi\xE0o	7	b	efficient|highly effective
\u5BDD\u5BA4	q\u01D0n sh\xEC	7	n	bedroom|dormitory
\u5BC6\u5C01	m\xEC f\u0113ng	7	vn	seal up
\u83B7\u6089	hu\xF2 x\u012B	7	v	learn of sth|find out|get news
\u866B\u5B50	ch\xF3ng zi	4	n	insect|bug|worm
\u9AD8\u660E	g\u0101o m\xEDng	7	a	brilliant|superior|wise
\u75A4	b\u0101	6	n	scar|scab
\u56FD\u65D7	gu\xF3 q\xED	6	n	flag
\u80C6\u5B50	d\u01CEn zi	7	n	courage|nerve|guts
\u53FC	di\u0101o	7	v	hold with one's mouth
\u5835\u585E	d\u01D4 s\xE8	7	v	clog up|blockage
\u6536\u542C	sh\u014Du t\u012Bng	3	v	listen to
\u7F51\u9875	w\u01CEng y\xE8	6	n	web page
\u6F02	pi\u0101o	7	v	float|drift|elegant|polished|bleach
\u78D5	k\u0113	7	v	tap|knock
\u5206\u660E	f\u0113n m\xEDng	7	a	clear|distinct|evidently|clearly
\u6599\u7406	li\xE0o l\u01D0	7	v	arrange|handle|cook|cuisine|art of cooking
\u793C\u54C1	l\u01D0 p\u01D0n	7	n	gift|present
\u5267\u70C8	j\xF9 li\xE8	7	a	violent|acute|severe|fierce
\u586B\u8865	ti\xE1n b\u01D4	7	v	fill a gap|fill in a blank|overcome a deficiency
\u6C34\u5E93	shu\u01D0 k\xF9	5	n	reservoir
\u624B\u638C	sh\u01D2u zh\u01CEng	7	n	palm
\u8D77\u4F0F	q\u01D0 f\xFA	7	v	move up and down|undulate|ups and downs
\u5426\u51B3	f\u01D2u ju\xE9	7	v	veto|overrule
\u4E2D\u6B62	zh\u014Dng zh\u01D0	7	v	cease|suspend|break off|stop|discontinue
\u79FB\u4EA4	y\xED ji\u0101o	7	v	transfer|hand over
\u6311\u8845	ti\u01CEo x\xECn	7	v	provoke|provocation
\u529F\u52B3	g\u014Dng l\xE1o	7	n	contribution|meritorious service|credit
\u6709\u5E78	y\u01D2u x\xECng	7	v	fortunately
\u7535\u5B50\u90AE\u4EF6	di\xE0n z\u01D0 y\xF3u ji\xE0n	3		email
\u590D\u53D1	f\xF9 f\u0101	7	v	recur|reappear|relapse
\u4E1B\u6797	c\xF3ng l\xEDn	7	n	jungle|thicket|forest|buddhist monastery
\u6F14\u53D8	y\u01CEn bi\xE0n	7	v	develop|evolve|development|evolution
\u6B64\u524D	c\u01D0 qi\xE1n	6	t	before this|before then|previously
\u7CBE\u534E	j\u012Bng hu\xE1	7	n	best feature|quintessence|essence|soul
\u53CD\u5C04	f\u01CEn sh\xE8	6	v	reflect|reflection|reflex
\u706B\u70ED	hu\u01D2 r\xE8	7	z	fiery|burning|fervent|ardent|passionate
\u81A8\u80C0	p\xE9ng zh\xE0ng	7	v	expand|inflate|swell
\u66F4\u6539	g\u0113ng g\u01CEi	7	v	alter
\u6210\u5343\u4E0A\u4E07	ch\xE9ng qi\u0101n sh\xE0ng w\xE0n	7	v	untold numbers|innumerable|thousands upon thousands
\u4E19	b\u01D0ng	7	Mg	third in order|propyl
\u7F3A\u5E2D	qu\u0113 x\xED	7	v	be absent
\u6807\u672C	bi\u0101o b\u011Bn	7	n	specimen|sample
\u53D1\u7968	f\u0101 pi\xE0o	4	n	invoice
\u4F24\u52BF	sh\u0101ng sh\xEC	7	n	condition of an injury
\u6311\u8D77	ti\u01CEo q\u01D0	7	v	provoke|stir up|incite
\u8BF7\u5BA2	q\u01D0ng k\xE8	2	v	give a dinner party|entertain guests|invite to dinner
\u5DE9\u56FA	g\u01D2ng g\xF9	6	v	consolidate|consolidation|strengthen
\u5824	d\u012B	7	n	dike|taiwan pr
\u76B1\u7EB9	zh\xF2u w\xE9n	6	n	wrinkle
\u62CC	b\xE0n	7	v	mix|mix in|toss
\u65E5\u62A5	r\xEC b\xE0o	2	n	daily newspaper
\u673A\u52A8	j\u012B d\xF2ng	7	b	locomotive|motorized|power-driven|adaptable|flexible
\u5E7B\u89C9	hu\xE0n ju\xE9	7	n	illusion|hallucination|figment of one's imagination
\u8270\u8F9B	ji\u0101n x\u012Bn	7	a	hardships|arduous|difficult
\u5E7F\u9614	gu\u01CEng ku\xF2	6	a	wide|vast
\u8FC7\u6EE4	gu\xF2 l\u01DC	7	v	filter
\u504F\u89C1	pi\u0101n ji\xE0n	7	n	prejudice|bias
\u6500	p\u0101n	7	v	climb|implicate
\u6C14\u6124	q\xEC f\xE8n	7	a	indignant|furious
\u4FDD\u6696	b\u01CEo nu\u01CEn	7	a	keep warm
\u9636\u5C42	ji\u0113 c\xE9ng	7	n	social class
\u62BD\u5C49	ch\u014Du ti	7	n	drawer
\u4F1A\u573A	hu\xEC ch\u01CEng	7	n	meeting place|place where people gather
\u77E5\u89C9	zh\u012B ju\xE9	7	n	perception|consciousness
\u5BA1\u6838	sh\u011Bn h\xE9	7	v	audit|investigate thoroughly
\u98DE\u7FD4	f\u0113i xi\xE1ng	7	v	circle in the air|soar
\u795D\u613F	zh\xF9 yu\xE0n	6	v	wish
\u8BCD\u6C47	c\xED hu\xEC	4	n	vocabulary|list of words|word
\u5927\u5403\u4E00\u60CA	d\xE0 ch\u012B y\u012B j\u012Bng	7	v	have a surprise|shocked or startled|gobsmacked
\u96F6\u552E	l\xEDng sh\xF2u	7	vn	retail
\u53D9\u8FF0	x\xF9 sh\xF9	7	v	relate|tell or talk about|recount|narration|telling|narrative|account
\u5C71\u9876	sh\u0101n d\u01D0ng	7	n	hilltop
\u654F\u9510	m\u01D0n ru\xEC	7	a	keen|sharp|acute
\u8FC7\u65F6	gu\xF2 sh\xED	6	a	old-fashioned|out of date
\u9644\u52A0	f\xF9 ji\u0101	7	vn	additional|annex
\u8DEF\u7A0B	l\xF9 ch\xE9ng	7	n	route|path traveled|distance traveled|course
\u7C97\u7CD9	c\u016B c\u0101o	7	a	crude|gruff|rough|coarse
\u7A0E\u52A1	shu\xEC w\xF9	7	n	taxation services|state revenue service
\u7834\u89E3	p\xF2 ji\u011B	7	v	break|explain|unravel|decipher|decode|crack
\u5927\u7C73	d\xE0 m\u01D0	6	n	rice
\u5F15\u5165	y\u01D0n r\xF9	7	v	draw into|pull into|introduce
\u51B7\u5374	l\u011Bng qu\xE8	6	vn	cool
\u5316\u9A8C	hu\xE0 y\xE0n	7	v	chemical examination|do a lab test
\u6697\u6740	\xE0n sh\u0101	7	v	assassinate
\u5766\u8BDA	t\u01CEn ch\xE9ng	7	a	candid|frank|plain dealing
\u65E0\u79C1	w\xFA s\u012B	7	b	selfless|unselfish|disinterested|altruistic
\u6210\u6548	ch\xE9ng xi\xE0o	5	n	effect|result
\u52AB\u6301	ji\xE9 ch\xED	7	v	kidnap|hijack|abduct|hold under duress
\u508D\u665A	b\xE0ng w\u01CEn	6	t	in the evening|when night falls|towards evening|at night fall|at dusk
\u5E73\u884C	p\xEDng x\xEDng	6	v	parallel|of equal rank|simultaneous
\u80CC\u7740	b\xE8i zhe	6	v	turning one's back to|keeping sth secret from|keeping behind one's back|carrying on one's back
\u4E00\u8DEF\u4E0A	y\u012B l\xF9 sh\xE0ng	6		along the way|whole way|whole time
\u76AE\u5E26	p\xED d\xE0i	7	n	strap|leather belt
\u58F0\u8A89	sh\u0113ng y\xF9	7	n	reputation|fame
\u63BA	ch\u0101n	7	v	mix|grasp
\u76F8\u4F34	xi\u0101ng b\xE0n	7	v	accompany sb|accompany each other
\u4F17\u6240\u5468\u77E5	zh\xF2ng su\u01D2 zh\u014Du zh\u012B	7	v	as everyone knows
\u4EBA\u9020	r\xE9n z\xE0o	7	b	man-made|artificial|synthetic
\u868A\u5B50	w\xE9n zi	7	n	mosquito
\u987D\u5F3A	w\xE1n qi\xE1ng	6	a	tenacious|hard to defeat
\u4F20\u67D3\u75C5	chu\xE1n r\u01CEn b\xECng	7	n	infectious disease|contagious disease|pestilence
\u73B0\u4EFB	xi\xE0n r\xE8n	7	b	occupy a post currently|current|incumbent|current boyfriend
\u4EB2\u751F	q\u012Bn sh\u0113ng	7	b	one's own|biological|birth
\u80E1\u8BF4	h\xFA shu\u014D	7	v	talk nonsense|drivel
\u6839\u6E90	g\u0113n yu\xE1n	7	n	origin|root
\u5E2D\u4F4D	x\xED w\xE8i	7	n	seat|parliamentary or congressional seat
\u5984\u60F3	w\xE0ng xi\u01CEng	7	v	attempt vainly|vain attempt|delusion
\u69A8	zh\xE0	7	v	press|extract
\u5306\u5FD9	c\u014Dng m\xE1ng	7	a	hasty|hurried
\u73A9\u800D	w\xE1n shu\u01CE	7	v	play|amuse oneself
\u8981\u7D20	y\xE0o s\xF9	6	n	essential factor|key constituent
\u7B3C\u7F69	l\u01D2ng zh\xE0o	7	v	envelop|shroud
\u5353\u8D8A	zhu\xF3 yu\xE8	7	a	outstanding|surpassing|distinguished|splendid
\u4FDD\u517B	b\u01CEo y\u01CEng	5	v	keep in good repair|maintain|maintenance
\u5168\u5C40	qu\xE1n j\xFA	7	n	overall situation
\u51CF\u901F	ji\u01CEn s\xF9	7	v	reduce speed|slow down|take it easy
\u54CD\u5E94	xi\u01CEng y\xECng	7	v	respond to|answer
\u8F6C\u8BA9	zhu\u01CEn r\xE0ng	5	v	transfer
\u7011\u5E03	p\xF9 b\xF9	7	n	waterfall
\u5931\u604B	sh\u012B li\xE0n	7	v	lose one's love|break up|feel jilted
\u52A8\u5458	d\xF2ng yu\xE1n	5	v	mobilize|mobilization
\u987E\u8651	g\xF9 l\u01DC	7	n	misgivings|apprehensions
\u76D1\u62A4	ji\u0101n h\xF9	7	vn	act as a guardian
\u9CC4\u9C7C	\xE8 y\xFA	7	n	alligator|crocodile
\u6050\u5413	k\u01D2ng h\xE8	7	v	threaten|menace
\u4E0D\u6210	b\xF9 ch\xE9ng	6	v	won't do|unable to|can that be
\u6DF7\u51DD\u571F	h\xF9n n\xEDng t\u01D4	7	n	concrete
\u767E\u5408	b\u01CEi h\xE9	7	n	lily
\u8BDA\u610F	ch\xE9ng y\xEC	7	n	sincerity|good faith
\u7406\u6240\u5F53\u7136	l\u01D0 su\u01D2 d\u0101ng r\xE1n	7	l	inevitable and right
\u75F0	t\xE1n	7	n	phlegm|spittle
\u5FC5\u5C06	b\xEC ji\u0101ng	6	d	inevitably
\u6570\u989D	sh\xF9 \xE9	7	n	amount|sum of money|fixed number
\u706B\u817F	hu\u01D2 tu\u01D0	5	n	ham
\u90E8\u4EF6	b\xF9 ji\xE0n	7	n	part|component
\u60B2\u75DB	b\u0113i t\xF2ng	7	an	grieved|sorrowful
\u666F\u89C2	j\u01D0ng gu\u0101n	7	n	landscape
\u6240\u5C5E	su\u01D2 sh\u01D4	7	n	one's affiliation|subordinate|belonging to|affiliated|under one's command
\u6DF9\u6CA1	y\u0101n m\xF2	6	v	submerge|drown|flood|drown out
\u5DE5\u827A	g\u014Dng y\xEC	5	n	arts and crafts|industrial arts
\u6F47\u6D12	xi\u0101o s\u01CE	7	a	confident and at ease|free and easy
\u4E0D\u8981\u7D27	b\xF9 y\xE0o j\u01D0n	4	v	unimportant|not serious|it doesn't matter|never mind
\u80CC\u5FC3	b\xE8i x\u012Bn	6	n	sleeveless garment
\u4E86\u7ED3	li\u01CEo ji\xE9	7	v	settle|finish|conclude|wind up
\u5012\u8BA1\u65F6	d\xE0o j\xEC sh\xED	7		count down|countdown
\u8F66\u578B	ch\u0113 x\xEDng	7	n	vehicle model
\u5237\u7259	shu\u0101 y\xE1	4	v	brush one's teeth
\u72E1\u733E	ji\u01CEo hu\xE1	7	a	crafty|cunning|sly
\u95EA\u70C1	sh\u01CEn shu\xF2	7	v	flickering|twinkling|evasive|vague
\u9886\u53D6	l\u01D0ng q\u01D4	6	v	receive|draw|get
\u5375	lu\u01CEn	7	n	egg|ovum|spawn|testicles|penis|fucking
\u53EF\u4FE1	k\u011B x\xECn	7	a	trustworthy
\u4E00\u518D	y\u012B z\xE0i	4	d	repeatedly
\u767D\u767D	b\xE1i b\xE1i	7	d	in vain|no purpose|for nothing|white
\u586B\u5199	ti\xE1n xi\u011B	7	v	fill in a form
\u8BF7\u5047	q\u01D0ng ji\xE0	1	v	request leave of absence
\u901A\u884C\u8BC1	t\u014Dng x\xEDng zh\xE8ng	7	n	pass|laissez-passer or safe conduct
\u884C\u4EBA	x\xEDng r\xE9n	2	n	pedestrian|traveler on foot|passer-by
\u79D8\u8BC0	m\xEC ju\xE9	7	n	secret know-how|key|secret|recipe
\u63ED	ji\u0113	6	v	take the lid off|expose|unmask
\u540C\u76DF	t\xF3ng m\xE9ng	7	n	alliance
\u7728	zh\u01CE	6	v	blink|wink
\u91CE\u5916	y\u011B w\xE0i	7	s	countryside|areas outside the city
\u6311\u5254	ti\u0101o ti	7	v	picky|fussy
\u57F9\u80B2	p\xE9i y\xF9	4	v	train|breed
\u5668\u68B0	q\xEC xi\xE8	7	n	apparatus|instrument|equipment|weapon
\u5F00\u5B66	k\u0101i xu\xE9	2	v	school opening
\u8D70\u8FDB	z\u01D2u j\xECn	2	v	enter
\u89E6\u52A8	ch\xF9 d\xF2ng	7	v	touch|stir up|move
\u5185\u5E55	n\xE8i m\xF9	7	n	inside story|non-public information|behind the scenes|internal
\u7EC6\u5FC3	x\xEC x\u012Bn	7	a	careful|attentive
\u5386\u7A0B	l\xEC ch\xE9ng	7	n	course|process
\u671B\u8FDC\u955C	w\xE0ng yu\u01CEn j\xECng	7	n	binoculars|telescope
\u8981\u7D27	y\xE0o j\u01D0n	7	a	important|urgent
\u91CD\u7533	ch\xF3ng sh\u0113n	7	v	reaffirm|reiterate
\u5E99	mi\xE0o	7	n	temple|ancestral shrine|temple fair|great imperial hall|imperial
\u5F2F\u66F2	w\u0101n q\u016B	6	a	bend|curve around|curved|crooked|wind|warp
\u795E\u60C5	sh\xE9n q\xEDng	5	n	look|expression
\u68FA\u6750	gu\u0101n cai	7	n	coffin
\u4EB2\u5C5E	q\u012Bn sh\u01D4	6	n	kin|kindred|relatives
\u4FD8\u864F	f\xFA l\u01D4	7	n	captive
\u4FE1\u8A89	x\xECn y\xF9	7	n	prestige|distinction|reputation|trust
\u803B\u8FB1	ch\u01D0 r\u01D4	7	n	disgrace|shame|humiliation
\u9524	chu\xED	6	g	hammer|hammer into shape|weight|strike with a hammer
\u53D1\u7535	f\u0101 di\xE0n	6	v	generate electricity|send a telegram
\u521D\u6B21	ch\u016B c\xEC	7	d	for the first time|first
\u521D\u7EA7	ch\u016B j\xED	3	b	junior|primary
\u79DF\u8D41	z\u016B l\xECn	7	vn	rent|lease|hire
\u9547\u5B9A	zh\xE8n d\xECng	7	a	calm|unperturbed|cool
\u7834\u6848	p\xF2 \xE0n	7	v	solve a case|shabby old table
\u89C4\u7AE0	gu\u012B zh\u0101ng	6	n	rule|regulation
\u5C51	xi\xE8	6	g	bits|fragments|crumbs|filings|trifling|trivial|condescend to
\u65BD\u5C55	sh\u012B zh\u01CEn	6	v	use fully|put to use
\u7C73\u996D	m\u01D0 f\xE0n	1	n	rice
\u521B\u529E	chu\xE0ng b\xE0n	6	v	establish|found|launch
\u5916\u516C	w\xE0i g\u014Dng	7	n	mother's father|maternal grandfather
\u4E27\u751F	s\xE0ng sh\u0113ng	7	v	die|lose one's life
\u66F2\u5B50	q\u01D4 zi	6	n	poem for singing|tune|music
\u589E\u591A	z\u0113ng du\u014D	5	v	increase|grow in number
\u9F50\u5168	q\xED qu\xE1n	5	a	complete|comprehensive
\u5C71\u8C37	sh\u0101n g\u01D4	6	n	valley|ravine
\u542C\u529B	t\u012Bng l\xEC	3	n	hearing|listening ability
\u592A\u9633\u80FD	t\xE0i y\xE1ng n\xE9ng	6	n	solar energy
\u4E52\u4E53\u7403	p\u012Bng p\u0101ng qi\xFA	7	n	table tennis|ping-pong|table tennis ball
\u5E73\u6DE1	p\xEDng d\xE0n	7	a	flat|dull|ordinary|nothing special
\u9AD8\u538B	g\u0101o y\u0101	7	n	high pressure|high-handed
\u63A8\u7406	tu\u012B l\u01D0	7	vn	reasoning|inference|infer|deduce
\u7BA1\u7528	gu\u01CEn y\xF2ng	7	a	efficacious|useful
\u6F5C\u6C34	qi\xE1n shu\u01D0	7	vn	dive|go under water|lurk
\u793C\u4EEA	l\u01D0 y\xED	7	n	etiquette|ceremony
\u591A\u534A	du\u014D b\xE0n	6	d	most|mostly|most likely
\u6DF1\u60C5	sh\u0113n q\xEDng	7	n	deep emotion|deep feeling|deep love
\u51F9	\u0101o	7	a	depressed|sunken|indented|concave|female
\u8FDC\u65B9	yu\u01CEn f\u0101ng	6	s	far away|distant location
\u5520\u53E8	l\xE1o dao	7	v	prattle|chatter away|nag|garrulous|nagging
\u65B0\u624B	x\u012Bn sh\u01D2u	7	n	new hand|novice|raw recruit
\u540D\u989D	m\xEDng \xE9	6	n	quota|number of places|place (in an institution|group etc)
\u7B80\u77ED	ji\u01CEn du\u01CEn	7	a	brief|briefly|brevity
\u98CE\u5C1A	f\u0113ng sh\xE0ng	7	n	current custom
\u8F6C\u64AD	zhu\u01CEn b\u014D	7	vn	relay|broadcast
\u5C55\u51FA	zh\u01CEn ch\u016B	7	v	put on display|be on show|exhibit
\u79EF\u84C4	j\u012B x\xF9	7	n	save|put aside|savings
\u7BA1\u8F96	gu\u01CEn xi\xE1	7	v	administer|have jurisdiction
\u575F\u5893	f\xE9n m\xF9	7	n	grave|tomb
\u8870\u7AED	shu\u0101i ji\xE9	7	v	organ failure|exhaustion|prostration
\u5BFC\u6E38	d\u01CEo y\xF3u	4	n	tour guide|guidebook|conduct a tour
\u8DEF\u4EBA	l\xF9 r\xE9n	7	n	passer-by|stranger
\u89E3\u7B54	ji\u011B d\xE1	7	v	solve|resolve|provide an answer|solution|resolution|answer
\u8F6E\u6905	l\xFAn y\u01D0	4	n	wheelchair
\u5C0F\u5403	xi\u01CEo ch\u012B	4	n	snack|refreshments
\u6C42\u6551	qi\xFA ji\xF9	7	v	seek help
\u82E6\u607C	k\u01D4 n\u01CEo	7	a	vexed|distressed
\u56E2\u805A	tu\xE1n j\xF9	7	v	reunite|have a reunion
\u4E11\u964B	ch\u01D2u l\xF2u	7	a	ugly
\u5145\u5F53	ch\u014Dng d\u0101ng	7	v	serve as|act as|play the role of
\u4FE1\u5C01	x\xECn f\u0113ng	3	n	envelope
\u904D\u5E03	bi\xE0n b\xF9	7	v	cover the whole|be found throughout
\u4FEE\u8865	xi\u016B b\u01D4	7	v	mend
\u6CE5\u571F	n\xED t\u01D4	7	n	earth|soil|mud|clay
\u629A\u6478	f\u01D4 m\u014D	7	v	gently caress and stroke|pet|fondle
\u9888\u90E8	j\u01D0ng b\xF9	7		neck
\u5149\u6ED1	gu\u0101ng hu\xE1	7	a	glossy|sleek|smooth
\u4E0D\u80FD\u4E0D	b\xF9 n\xE9ng b\xF9	5	d	have to|cannot but
\u540C\u4F19	t\xF3ng hu\u01D2	7	n	colleague|co-conspirator|accomplice
\u53D1\u6296	f\u0101 d\u01D2u	7	v	tremble|shake|shiver
\u53F6\u5B50	y\xE8 zi	4	n	leaf|marijuana
\u886C\u8863	ch\xE8n y\u012B	3	n	shirt
\u6253\u6298	d\u01CE zh\xE9	4	v	give a discount
\u8877\u5FC3	zh\u014Dng x\u012Bn	7	d	heartfelt|wholehearted|cordial
\u53F8\u4EE4	s\u012B l\xECng	7	n	commanding officer
\u4F18\u8D28	y\u014Du zh\xEC	6	b	excellent quality
\u7070\u5C18	hu\u012B ch\xE9n	7	n	dust
\u76FC\u671B	p\xE0n w\xE0ng	6	v	hope for|look forward to
\u82E5\u5E72	ru\xF2 g\u0101n	7	m	certain number or amount|how many|how much
\u7535\u62A5	di\xE0n b\xE0o	7	n	telegram|cable|telegraph
\u8F93\u51FA	sh\u016B ch\u016B	5	vn	export|output
\u63ED\u793A	ji\u0113 sh\xEC	7	v	show|make known
\u8F6E\u6D41	l\xFAn li\xFA	7	v	alternate|take turns
\u6807\u8BED	bi\u0101o y\u01D4	7	n	written slogan|placard
\u786C\u4EF6	y\xECng ji\xE0n	5	n	hardware
\u6279\u5224	p\u012B p\xE0n	7	v	criticize|critique
\u7B51	zh\xF9	7	v	build|construct|ram|hit|taiwan pr|five-string lute
\u6539\u6B63	g\u01CEi zh\xE8ng	4	v	correct|amend|put right|correction
\u8FFD\u8D76	zhu\u012B g\u01CEn	7	v	pursue|chase after|accelerate|catch up with|overtake
\u7279\u4EF7	t\xE8 ji\xE0	4	n	special price
\u62D6\u978B	tu\u014D xi\xE9	6	n	slippers|sandals|flip-flops
\u6D17\u8863\u673A	x\u01D0 y\u012B j\u012B	2	n	washing machine|washer
\u9C9C\u660E	xi\u0101n m\xEDng	4	a	bright|clear-cut|distinct
\u9635\u8425	zh\xE8n y\xEDng	7	n	group of people|camp|faction|sides in a dispute
\u6B66\u529B	w\u01D4 l\xEC	7	n	military force
\u96BE\u582A	n\xE1n k\u0101n	7	a	hard to take|embarrassed
\u6F14\u8BF4	y\u01CEn shu\u014D	7	vn	speech|deliver a speech
\u6FC0\u8D77	j\u012B q\u01D0	7	v	arouse|evoke|cause|stir up
\u7EB3\u7A0E\u4EBA	n\xE0 shu\xEC r\xE9n	7	n	taxpayer
\u91CE\u5FC3	y\u011B x\u012Bn	7	n	ambition|wild schemes|careerism
\u7EB3\u7A0E	n\xE0 shu\xEC	7	v	pay taxes
\u6E38\u6CF3\u6C60	y\xF3u y\u01D2ng ch\xED	5	n	swimming pool
\u70BC	li\xE0n	7	v	refine|smelt
\u5173\u7167	gu\u0101n zh\xE0o	7	v	take care|keep an eye on|look after|tell|remind
\u8BF8\u591A	zh\u016B du\u014D	7	m	good deal|lot of
\u53D8\u66F4	bi\xE0n g\u0113ng	6	v	change|alter|modify
\u914D\u7F6E	p\xE8i zh\xEC	6	v	deploy|allocate|configuration|allocation
\u5929\u9E45	ti\u0101n \xE9	7	n	swan
\u6728\u6750	m\xF9 c\xE1i	7	n	wood
\u65AD\u88C2	du\xE0n li\xE8	7	v	fracture|rupture|break apart
\u6B62\u8840	zh\u01D0 xu\xE8	7	v	staunch|hemostatic
\u95FB\u540D	w\xE9n m\xEDng	7	v	well-known|famous|renowned|eminent
\u6CB9\u6F06	y\xF3u q\u012B	6	n	oil paints|lacquer|paint
\u8BCD\u8BED	c\xED y\u01D4	2	n	word|term|expression
\u5207\u5B9E	qi\xE8 sh\xED	6	a	feasible|realistic|practical|earnestly|conscientiously
\u53E4\u8463	g\u01D4 d\u01D2ng	7	n	curio|antique
\u91D1\u5B57\u5854	j\u012Bn z\xEC t\u01CE	7	n	pyramid
\u4FE1\u7BB1	x\xECn xi\u0101ng	5	n	mailbox|post office box
\u62DF	n\u01D0	7	v	plan to|draft|imitate|assess|compare|pseudo-|doubtful|suspicious
\u53CD\u5F39	f\u01CEn t\xE1n	7	v	bounce|bounce back|boomerang|ricochet|rebound|backlash|negative repercussions
\u61C2\u4E8B	d\u01D2ng sh\xEC	7	a	sensible|thoughtful|intelligent
\u594B\u529B	f\xE8n l\xEC	7	d	do everything one can|spare no effort|strive
\u8FFD\u968F	zhu\u012B su\xED	7	v	follow|accompany
\u4EE3\u53F7	d\xE0i h\xE0o	7	n	code name
\u8C03\u89E3	ti\xE1o ji\u011B	5	v	mediate
\u5C71\u533A	sh\u0101n q\u016B	5	n	mountain area
\u7EEF\u95FB	f\u0113i w\xE9n	7	n	sex scandal
\u7ED3\u5B9E	ji\u0113 shi	3	a	rugged|sturdy|strong|durable|buff|bear fruit
\u53EF\u803B	k\u011B ch\u01D0	7	a	shameful|disgraceful|ignominious
\u53E4\u4EBA	g\u01D4 r\xE9n	7	n	people of ancient times|ancients|deceased person
\u5E78\u4E8F	x\xECng ku\u012B	7	d	fortunately|luckily
\u5FAE\u5999	w\u0113i mi\xE0o	7	a	subtle
\u53E5\u5B50	j\xF9 zi	2	n	sentence
\u660E\u4FE1\u7247	m\xEDng x\xECn pi\xE0n	5	n	postcard
\u53CD\u7701	f\u01CEn x\u01D0ng	7	v	reflect upon oneself|examine one's conscience|question oneself|search one's soul
\u7687\u4E0A	hu\xE1ng shang	7	n	emperor|your majesty the emperor|his imperial majesty
\u672C\u8272	b\u011Bn s\xE8	7	n	inherent qualities|natural qualities|distinctive character|true qualities|natural color
\u767B\u673A	d\u0113ng j\u012B	7	v	board a plane
\u9274\u522B	ji\xE0n bi\xE9	7	v	differentiate|distinguish
\u610F\u60F3\u4E0D\u5230	y\xEC xi\u01CEng b\xF9 d\xE0o	6	v	unexpected|previously unimagined
\u8239\u53EA	chu\xE1n zh\u012B	6	n	ship|boat|vessel
\u6070\u6070\u76F8\u53CD	qi\xE0 qi\xE0 xi\u0101ng f\u01CEn	7	c	just the opposite
\u80CC\u9762	b\xE8i mi\xE0n	7	f	back|reverse side|wrong side
\u76F4\u5F84	zh\xED j\xECng	7	n	diameter
\u6362\u53D6	hu\xE0n q\u01D4	7	v	obtain in exchange|exchange for
\u8FC7\u5F80	gu\xF2 w\u01CEng	7	vn	come and go|have friendly relations with|in the past|previous
\u597D\u8BC4	h\u01CEo p\xEDng	7	n	favorable criticism|positive evaluation
\u5FFD\u60A0	h\u016B you	7	z	rock|sway|flicker|flutter|dupe|con
\u5FC3\u8840	x\u012Bn xu\xE8	7	n	heart's blood|expenditure|meticulous care
\u7167\u76F8\u673A	zh\xE0o xi\xE0ng j\u012B	3	n	camera
\u5FE7\u8651	y\u014Du l\u01DC	7	v	worry|anxiety
\u663E\u800C\u6613\u89C1	xi\u01CEn \xE9r y\xEC ji\xE0n	7	l	obviously|clearly|it goes without saying
\u517B\u8001\u91D1	y\u01CEng l\u01CEo j\u012Bn	7	n	pension
\u9632\u536B	f\xE1ng w\xE8i	7	vn	defend|defensive|defense
\u9884\u5148	y\xF9 xi\u0101n	7	d	beforehand|in advance
\u4EBA\u6C14	r\xE9n q\xEC	7	n	popularity|personality|character
\u5893\u5730	m\xF9 d\xEC	7	n	cemetery|graveyard
\u914D\u5957	p\xE8i t\xE0o	5	a	form a complete set|compatible|matching|complementary
\u9057\u5931	y\xED sh\u012B	6	v	lose|leave behind
\u516C\u5F0F	g\u014Dng sh\xEC	5	n	formula
\u770B\u6837\u5B50	k\xE0n y\xE0ng zi	7	v	it seems|it looks as if
\u9A7E\u7167	ji\xE0 zh\xE0o	5	n	driver's license
\u4FB5\u5BB3	q\u012Bn h\xE0i	7	v	encroach on|infringe on
\u524D\u671F	qi\xE1n q\u012B	7	f	preceding period|early stage
\u8868\u767D	bi\u01CEo b\xE1i	7	v	explain oneself|express|declaration|confession
\u60A3\u6709	hu\xE0n y\u01D2u	7	v	contract|be afflicted with|suffer from
\u5E26\u5934	d\xE0i t\xF3u	7	v	take the lead|be the first|set an example
\u73ED\u7EA7	b\u0101n j\xED	3	n	class|grade
\u7B77\u5B50	ku\xE0i zi	2	n	chopsticks
\u8FD8\u539F	hu\xE1n yu\xE1n	7	v	reconstruct|reduction
\u9165	s\u016B	7	a	flaky pastry|crunchy|limp|soft|silky
\u4E0D\u7528\u8BF4	b\xF9 y\xF2ng shu\u014D	7	v	needless to say|it goes without saying
\u70F9\u996A	p\u0113ng r\xE8n	6	vn	cooking|culinary arts
\u63A5\u901A	ji\u0113 t\u014Dng	7	v	connect|put through
\u6C34\u5206	shu\u01D0 f\xE8n	5	n	moisture content|overstatement|padding
\u9676\u74F7	t\xE1o c\xED	7	n	pottery and porcelain|ceramics
\u76D1\u5BDF	ji\u0101n ch\xE1	7	vn	supervise|control
\u8BA8\u597D	t\u01CEo h\u01CEo	7	v	get the desired outcome|curry favor with
\u53D1\u706B	f\u0101 hu\u01D2	7	v	catch fire|ignite|detonate|get angry
\u4E30\u6EE1	f\u0113ng m\u01CEn	7	a	ample|well developed|fully rounded
\u4EFB\u804C	r\xE8n zh\xED	7	v	hold a post|take office
\u5EF6\u671F	y\xE1n q\u012B	4	v	delay|extend|postpone|defer
\u4E0D\u5B9C	b\xF9 y\xED	7	v	not suitable|inadvisable|inappropriate
\u5782\u76F4	chu\xED zh\xED	6	v	perpendicular|vertical
\u51FA\u5883	ch\u016B j\xECng	7	v	outbound
\u534A\u51B3\u8D5B	b\xE0n ju\xE9 s\xE0i	6	n	semifinals
\u7231\u62A4	\xE0i h\xF9	4	v	cherish|treasure|take care of|love and protect
\u8F88	b\xE8i	5	n	lifetime|generation|group of people|class|classifier for people
\u521B\u59CB\u4EBA	chu\xE0ng sh\u01D0 r\xE9n	7	n	creator|founder|initiator
\u4EFB\u6027	r\xE8n x\xECng	6	a	willful|headstrong|unruly
\u63D0\u65E9	t\xED z\u01CEo	7	d	ahead of schedule|sooner than planned|bring forward
\u7384	xu\xE1n	7	a	black|mysterious
\u5E2E\u624B	b\u0101ng sh\u01D2u	7	n	helper|assistant
\u9EC4\u74DC	hu\xE1ng gu\u0101	4	n	cucumber
\u4EFF	f\u01CEng	7	v	imitate|copy|seemingly
\u5355\u4E00	d\u0101n y\u012B	5	a	single|only|sole
\u4EE5\u81F4	y\u01D0 zh\xEC	7	c	down to|up to
\u5316\u8EAB	hu\xE0 sh\u0113n	7	n	incarnation|reincarnation|embodiment|personification
\u84B8\u53D1	zh\u0113ng f\u0101	6	v	evaporate|evaporation
\u7F16\u6392	bi\u0101n p\xE1i	7	v	arrange|lay out
\u5B9E\u5730	sh\xED d\xEC	7	d	on-site
\u5835\u8F66	d\u01D4 ch\u0113	4	v	traffic jam|get congested
\u7ACB\u4F53	l\xEC t\u01D0	7	b	three-dimensional|solid|stereoscopic
\u7CBE\u660E	j\u012Bng m\xEDng	7	a	astute|shrewd|smart
\u6ED1\u7A3D	hu\xE1 j\u012B	7	a	comical|funny|amusing|huaji
\u9AD8\u6DA8	g\u0101o zh\u01CEng	7	a	surge up|rise|run high
\u4F53\u80B2\u573A	t\u01D0 y\xF9 ch\u01CEng	2	n	stadium
\u6CBB\u7406	zh\xEC l\u01D0	5	v	govern|administer|manage|control|governance
\u5584\u610F	sh\xE0n y\xEC	7	n	goodwill|benevolence|kindness
\u59D1\u59D1	g\u016B gu	6	n	paternal aunt
\u5B97\u65E8	z\u014Dng zh\u01D0	7	n	objective|aim|goal
\u8BF4\u660E\u4E66	shu\u014D m\xEDng sh\u016B	6	n	manual|directions|synopsis|specification
\u4E0A\u6E38	sh\xE0ng y\xF3u	7	f	upper reaches|upper level|upper echelon|upstream
\u5E45\u5EA6	f\xFA d\xF9	5	n	width|extent|range|scope
\u4E0A\u4EFB	sh\xE0ng r\xE8n	7	v	take office|previous|predecessor
\u6696\u6C14	nu\u01CEn q\xEC	4	n	central heating|heater|warm air
\u63A2\u671B	t\xE0n w\xE0ng	7	v	visit|call on sb|look around
\u4E3E\u6B62	j\u01D4 zh\u01D0	7	n	bearing|manner|mien
\u4E8C\u624B	\xE8r sh\u01D2u	4	b	indirectly acquired|second-hand|assistant
\u8058	p\xECn	7	v	engage|hire|betroth|betrothal gift|get married
\u5FE0\u4E8E	zh\u014Dng y\xFA	7	v	be loyal to
\u80DC\u4EFB	sh\xE8ng r\xE8n	7	v	qualified|competent
\u60B2\u89C2	b\u0113i gu\u0101n	7	a	pessimistic
\u4E0B\u8DCC	xi\xE0 di\u0113	7	v	fall|tumble
\u8352\u8C2C	hu\u0101ng mi\xF9	7	a	absurd|ridiculous
\u62D3\u5C55	tu\xF2 zh\u01CEn	7	v	expand
\u66FF\u6362	t\xEC hu\xE0n	7	v	exchange|replace|substitute for|switch
\u56DE\u9988	hu\xED ku\xEC	7		repay a favor|give back|feedback
\u7387\u9886	shu\xE0i l\u01D0ng	5	v	lead|command|head
\u6D53\u7F29	n\xF3ng su\u014D	7	v	concentrate|concentration|espresso coffee
\u521B\u7ACB	chu\xE0ng l\xEC	5	v	establish|set up|found
\u653E\u6620	f\xE0ng y\xECng	7	v	show|screen
\u81EA\u52A9	z\xEC zh\xF9	7	b	self-service
\u865A\u6784	x\u016B g\xF2u	7	v	make up|fabrication|fictional|imaginary
\u7956\u5148	z\u01D4 xi\u0101n	7	n	ancestors|forebears|ancestral species
\u80A5\u7682	f\xE9i z\xE0o	7	n	soap
\u5473\u513F	w\xE8i r	4	n	taste
\u7EC4\u957F	z\u01D4 zh\u01CEng	2	n	group leader
\u6CC4	xi\xE8	7	g	leak out|discharge|divulge
\u59D4\u5C48	w\u011Bi qu	7	a	feel wronged|grievance
\u6D3B\u513F	hu\xF3 r	7	n	work|things to do
\u73B0\u4EE3\u5316	xi\xE0n d\xE0i hu\xE0	3	vn	modernization
\u4F18\u826F	y\u014Du li\xE1ng	4	z	fine|good|first-rate
\u7279\u957F	t\xE8 ch\xE1ng	7	n	personal strength
\u8D2A	t\u0101n	7	v	covet|greedy|corrupt
\u8F6C\u5F2F	zhu\u01CEn w\u0101n	4	v	turn|go around a corner
\u513F\u5973	\xE9r n\u01DA	5	n	children|sons and daughters
\u679C\u65AD	gu\u01D2 du\xE0n	7	a	firm|decisive
\u5931\u6548	sh\u012B xi\xE0o	7	v	fail|lose effectiveness
\u8D26\u53F7	zh\xE0ng h\xE0o	7	n	account|username
\u4E3B\u529E	zh\u01D4 b\xE0n	5	v	organize|host
\u8584\u5F31	b\xF3 ru\xF2	5	a	weak|frail
\u516C\u8BA4	g\u014Dng r\xE8n	5	v	publicly known|accepted
\u5E73\u539F	p\xEDng yu\xE1n	5	n	field|plain
\u632F\u594B	zh\xE8n f\xE8n	7	v	stir oneself up|raise one's spirits|inspire
\u96D5	di\u0101o	7	g	carve|engrave|shrewd|bird of prey
\u5351\u9119	b\u0113i b\u01D0	7	a	base|mean|contemptible|despicable
\u8033\u5149	\u011Br gu\u0101ng	7	n	slap on the face
\u671F\u672B	q\u012B m\xF2	4	t	end of term
\u62AB\u9732	p\u012B l\xF9	7	v	reveal|publish|make public|announce
\u5224\u5B9A	p\xE0n d\xECng	7	v	judge|decide|judgment|determination
\u5F00\u8BBE	k\u0101i sh\xE8	6	v	offer|open
\u52A1\u5FC5	w\xF9 b\xEC	7	d	must|need to|be sure to
\u767E\u5206\u70B9	b\u01CEi f\u0113n di\u01CEn	6	n	percentage point
\u60CA\u53F9	j\u012Bng t\xE0n	7	v	exclaim in admiration|gasp of surprise
\u62E5\u62A4	y\u014Dng h\xF9	7	v	endorse|support
\u9996\u8111	sh\u01D2u n\u01CEo	6	n	head|summit|leader
\u610F\u6599	y\xEC li\xE0o	7	v	anticipate|expect|expectations
\u50F5\u786C	ji\u0101ng y\xECng	6	a	stiff|rigid
\u7A7A\u524D	k\u014Dng qi\xE1n	7	a	unprecedented
\u6CB9\u753B	y\xF3u hu\xE0	7	n	oil painting
\u65FA\u76DB	w\xE0ng sh\xE8ng	7	a	vigorous|exuberant
\u4F4F\u5BBF	zh\xF9 s\xF9	7	v	stay at|lodging|accommodation
\u8FDB\u573A	j\xECn ch\u01CEng	7	v	enter the venue|enter the arena|approach the airfield|get into the market
\u4E13\u9898	zhu\u0101n t\xED	3	n	specific topic
\u514B\u5236	k\xE8 zh\xEC	7	v	restrain|control|restraint|self-control
\u5305\u5BB9	b\u0101o r\xF3ng	7	v	pardon|forgive|show tolerance|contain|hold|inclusive
\u9A73\u56DE	b\xF3 hu\xED	7	v	reject|turn down|overrule
\u65E0\u5F62	w\xFA x\xEDng	7	b	incorporeal|virtual|formless|invisible|intangible
\u7528\u9910	y\xF2ng c\u0101n	7	v	eat a meal
\u65B9\u9488	f\u0101ng zh\u0113n	4	n	policy|guidelines
\u7AD9\u53F0	zh\xE0n t\xE1i	6	n	platform|publicly lend one's support|website
\u5DE5\u592B	g\u014Dng fu	3	n	period of time|spare time|skill|labor|effort|laborer
\u5F20\u626C	zh\u0101ng y\xE1ng	7	v	display ostentatiously|make public|spread around|flamboyant|brash
\u897F\u7EA2\u67FF	x\u012B h\xF3ng sh\xEC	5	n	tomato
\u4E0D\u80AF	b\xF9 k\u011Bn	7	v	refuse
\u770B\u4F3C	k\xE0n s\xEC	7	v	look as if|seem
\u98CE\u5473	f\u0113ng w\xE8i	7	n	distinctive flavor|distinctive style
\u6863\u6B21	d\xE0ng c\xEC	7	n	grade|class|quality|level
\u8DD1\u9053	p\u01CEo d\xE0o	7	n	athletic track|track|runway
\u751F\u6210	sh\u0113ng ch\xE9ng	5	v	generate|produce|form|be formed|come into being|be born with|be blessed with
\u6B4C\u5267	g\u0113 j\xF9	7	n	western opera
\u8BA9\u6B65	r\xE0ng b\xF9	7	v	concede|give in|yield|concession|concessive
\u58EB\u6C14	sh\xEC q\xEC	7	n	morale
\u8FC7\u65E5\u5B50	gu\xF2 r\xEC zi	7	v	live one's life|pass one's days|get along
\u542C\u4ECE	t\u012Bng c\xF3ng	7	v	listen and obey|comply with|heed|hearken
\u52FA	sh\xE1o	6	q	spoon|ladle
\u7E41\u5FD9	f\xE1n m\xE1ng	7	a	busy|bustling
\u8BA2\u5A5A	d\xECng h\u016Bn	7	v	get engaged
\u4E0D\u540C\u5BFB\u5E38	b\xF9 t\xF3ng x\xFAn ch\xE1ng	7	v	out of the ordinary|unusual
\u63A8\u65AD	tu\u012B du\xE0n	7	v	infer|deduce|predict|extrapolate
\u9886\u517B	l\u01D0ng y\u01CEng	7	v	adopt|adoption
\u4E60\u4FD7	x\xED s\xFA	7	n	custom|tradition|local tradition|convention
\u8D27\u8FD0	hu\xF2 y\xF9n	7	n	freight transport|cargo|transported goods
\u829D\u9EBB	zh\u012B ma	7	n	sesame
\u9057\u5F03	y\xED q\xEC	7	v	leave|abandon
\u521B\u4E1A	chu\xE0ng y\xE8	3	v	begin an undertaking|start a major task|initiate|venture|entrepreneurship
\u6B63\u76F4	zh\xE8ng zh\xED	7	a	upright|upstanding|honest
\u5E73\u606F	p\xEDng x\u012B	7	v	settle|quieten down|suppress
\u72ED\u7A84	xi\xE1 zh\u01CEi	7	a	narrow
\u656C\u610F	j\xECng y\xEC	7	n	respect|esteem|high regard
\u53D8\u6362	bi\xE0n hu\xE0n	6	v	transform|convert|vary|alternate|transformation
\u5E03\u5C40	b\xF9 j\xFA	7	n	arrangement|composition|layout|opening
\u8D2A\u6C61	t\u0101n w\u016B	7	v	be corrupt|corruption|embezzle
\u81EA\u5982	z\xEC r\xFA	7	a	unobstructed|unconstrained|smoothly|with ease|freely
\u8304\u5B50	qi\xE9 zi	6	n	eggplant|aubergine|brinjal|guinea squash|phonetic "cheese"|equivalent of "say cheese"
\u4F4E\u6E29	d\u012B w\u0113n	6	n	low temperature
\u91D1\u5B50	J\u012Bn z\u01D0	7	n	kaneko|gold
\u66B4\u96E8	b\xE0o y\u01D4	6	n	torrential rain|rainstorm
\u96C7\u4E3B	g\xF9 zh\u01D4	7	n	employer
\u5CE1\u8C37	xi\xE1 g\u01D4	7	n	canyon|gill|ravine
\u6C90\u6D74	m\xF9 y\xF9	6	v	take a bath|bathe|immerse
\u53D7\u7406	sh\xF2u l\u01D0	7	v	handle
\u4F5C\u6587	zu\xF2 w\xE9n	2	n	write an essay|composition
\u5409\u5229	j\xED l\xEC	6	a	auspicious|lucky|propitious|geely, chinese car make
\u91CD\u73B0	ch\xF3ng xi\xE0n	7	v	reappear
\u91CC\u8FB9	l\u01D0 bian	1	f	inside
\u672C\u9886	b\u011Bn l\u01D0ng	3	n	skill|ability|capability
\u53E3\u8154	k\u01D2u qi\u0101ng	7	n	oral cavity
\u52E4\u594B	q\xEDn f\xE8n	5	a	hardworking|diligent
\u5FAE\u6CE2\u7089	w\u0113i b\u014D l\xFA	6	n	microwave oven
\u7D0A\u4E71	w\u011Bn lu\xE0n	7	a	disorder|chaos
\u5E9F\u589F	f\xE8i x\u016B	7	n	ruins
\u840E\u7F29	w\u011Bi su\u014D	7	v	wither|dry up|atrophy
\u6276\u6301	f\xFA ch\xED	7	v	help|assist
\u771F\u60C5	zh\u0113n q\xEDng	7	n	real situation|truth
\u4EBA\u54C1	r\xE9n p\u01D0n	7	n	moral standing|moral quality|character|personality|appearance|looks|bearing
\u5E73\u548C	p\xEDng h\xE9	7	a	gentle|mild|moderate|placid
\u7A0D\u7A0D	sh\u0101o sh\u0101o	7	d	somewhat|little|slightly
\u6C89\u8FF7	ch\xE9n m\xED	7	v	be engrossed|be absorbed with|lose oneself in|be addicted to
\u7968\u623F	pi\xE0o f\xE1ng	7	n	box office
\u4E1C\u5357	d\u014Dng n\xE1n	2	f	southeast
\u5BFF\u547D	sh\xF2u m\xECng	7	n	life span|life expectancy|lifetime
\u65E5\u8BED	R\xEC y\u01D4	6	nz	japanese language
\u53CD\u9A73	f\u01CEn b\xF3	7	v	retort|refute
\u91CD\u91CF\u7EA7	zh\xF2ng li\xE0ng j\xED	7	b	heavyweight
\u53BB\u5411	q\xF9 xi\xE0ng	7	n	whereabouts
\u5F00\u529E	k\u0101i b\xE0n	7	v	open|start|set up
\u8131\u9896\u800C\u51FA	tu\u014D y\u01D0ng \xE9r ch\u016B	7	v	reveal one's talent|rise above others|distinguish oneself
\u4EAE\u70B9	li\xE0ng di\u01CEn	7	n	highlight|bright spot
\u7275\u6302	qi\u0101n gu\xE0	7	v	worry about|be concerned about
\u4E0D\u7406	b\xF9 l\u01D0	7	v	refuse to acknowledge|pay no attention to|take no notice of|ignore
\u706B\u5C71	hu\u01D2 sh\u0101n	7	n	volcano
\u5212\u5206	hu\xE0 f\u0113n	5	v	divide up|partition|differentiate
\u73AF\u7ED5	hu\xE1n r\xE0o	7	v	surround|circle|revolve around
\u9A71\u9010	q\u016B zh\xFA	7	v	expel|deport|banishment
\u4F53\u79EF	t\u01D0 j\u012B	5	n	volume|bulk
\u8865\u52A9	b\u01D4 zh\xF9	6	n	subsidize|subsidy|allowance
\u4E2A\u5B50	g\xE8 zi	2	n	height|stature|build|size
\u82DB\u523B	k\u0113 k\xE8	7	a	harsh|severe|demanding
\u8E39	chu\xE0i	7	v	kick|trample|tread on
\u4E0D\u77E5\u4E0D\u89C9	b\xF9 zh\u012B b\xF9 ju\xE9	7	l	unconsciously|unwittingly
\u52A8\u753B\u7247	d\xF2ng hu\xE0 pi\xE0n	4	n	animated film
\u68B3	sh\u016B	7	v	comb
\u88C1\u5B9A	c\xE1i d\xECng	7	v	ruling
\u5730\u57DF	d\xEC y\xF9	7	n	area|district|region
\u5706\u5F62	yu\xE1n x\xEDng	7	n	round|circular
\u518D\u73B0	z\xE0i xi\xE0n	7	v	recreate|reconstruct
\u8D23\u602A	z\xE9 gu\xE0i	7	v	blame|rebuke
\u5C3D\u65E9	j\u01D0n z\u01CEo	7	d	as early as possible
\u5BF9\u7167	du\xEC zh\xE0o	7	v	contrast|compare|check
\u70ED\u70B9	r\xE8 di\u01CEn	6	n	hot spot|point of special interest
\u952F	j\xF9	7	v	saw|cut with a saw
\u7EB3\u5165	n\xE0 r\xF9	7	v	bring into|channel into|integrate into|incorporate
\u8FA8\u8BA4	bi\xE0n r\xE8n	7	v	recognize|identify
\u5907\u5FD8\u5F55	b\xE8i w\xE0ng l\xF9	6	n	memorandum|aide-memoire|memorandum book
\u539F\u6709	yu\xE1n y\u01D2u	5	v	original|former
\u5956\u9879	ji\u01CEng xi\xE0ng	7	n	award|prize
\u4EBA\u884C\u9053	r\xE9n x\xEDng d\xE0o	7	n	sidewalk
\u5929\u6027	ti\u0101n x\xECng	7	n	nature|innate tendency
\u5BB6\u6559	ji\u0101 ji\xE0o	7	n	family education|upbringing|bring sb up|private tutor
\u60AC\u5D16	xu\xE1n y\xE1	7	n	precipice|overhanging cliff
\u57CB\u6028	m\xE1n yu\xE0n	7	v	complain|grumble|reproach|blame
\u51B7\u6218	l\u011Bng zh\xE0n	7	n	cold war|strained relationship|shiver|shudder
\u4F4F\u6237	zh\xF9 h\xF9	7	n	household|inhabitant|householder
\u6307\u70B9	zh\u01D0 di\u01CEn	7	v	point out|indicate|give directions|show how|censure|pick at
\u8F68\u8FF9	gu\u01D0 j\xEC	7	n	locus|orbit|trajectory|track
\u5468\u5230	zh\u014Du d\xE0o	7	a	thoughtful|considerate|attentive|thorough|also pr
\u884C\u60C5	h\xE1ng q\xEDng	7	n	market price|quotation of market price|current market situation
\u6574\u6D01	zh\u011Bng ji\xE9	7	a	neatly|tidy
\u8FC7\u5931	gu\xF2 sh\u012B	7	n	error|fault|negligence|delinquency
\u5148\u950B	xi\u0101n f\u0113ng	6	n	vanguard|pioneer|avant-garde
\u82D7	mi\xE1o	7	n	sprout
\u5E38\u4EBA	ch\xE1ng r\xE9n	7	n	ordinary person
\u5BA3\u8A93	xu\u0101n sh\xEC	7	v	swear an oath|make a vow
\u6405\u62CC	ji\u01CEo b\xE0n	7	v	stir|agitate
\u6446\u653E	b\u01CEi f\xE0ng	7	v	set up|arrange|lay out
\u5168\u80FD	qu\xE1n n\xE9ng	7	n	omnipotent|all-round|strong in every area
\u98A0\u8986	di\u0101n f\xF9	7	v	topple|capsize|fig. to overturn|undermine|subvert
\u4F4E\u4EF7	d\u012B ji\xE0	7	n	low price
\u5E8A\u5355	chu\xE1ng d\u0101n	6	n	bed sheet
\u7CBE\u901A	j\u012Bng t\u014Dng	7	v	be proficient in|master
\u5C0F\u4E11	xi\u01CEo ch\u01D2u	7	n	clown
\u6D77\u6EE8	h\u01CEi b\u012Bn	7	s	shore|seaside
\u6C14\u7BA1	q\xEC gu\u01CEn	7	n	windpipe|trachea|respiratory tract|air duct|gas pipe
\u5229\u7387	l\xEC l\u01DC	7	n	interest rates
\u770B\u4E2D	k\xE0n zh\xF2ng	7	v	have a preference for|fancy|choose after consideration|settle on
\u7275\u6D89	qi\u0101n sh\xE8	7	v	involve|implicated
\u5206\u652F	f\u0113n zh\u012B	7	n	branch|diverge|ramify|subdivide
\u53BB\u9664	q\xF9 ch\xFA	7	v	remove|dislodge
\u6D41\u6C34	li\xFA shu\u01D0	7	n	running water|turnover
\u516C\u9053	g\u014Dng d\xE0o	7	a	justice|fairness|public highway|fair|equitable
\u8150\u8680	f\u01D4 sh\xED	7	v	corrosion|corrode|rot|corruption
\u516C\u6B3E	g\u014Dng ku\u01CEn	7	n	public money
\u8F9C\u8D1F	g\u016B f\xF9	7	v	fail to live up|unworthy|let down|betray|disappoint
\u6D3B\u8BE5	hu\xF3 g\u0101i	7	d	serve sb right|deservedly|ought|should
\u8BD5\u7528	sh\xEC y\xF2ng	7	v	try sth out|be on probation
\u96E8\u6C34	y\u01D4 shu\u01D0	5	n	rainwater|rainfall|rain
\u4E00\u584C\u7CCA\u6D82	y\u012B t\u0101 h\xFA tu	7	l	muddled and completely collapsing|in an awful condition|complete shambles|total mess
\u4E0A\u763E	sh\xE0ng y\u01D0n	7	v	get into a habit|become addicted
\u6765\u5BBE	l\xE1i b\u012Bn	7	n	guest|visitor
\u592A\u5E73	T\xE0i p\xEDng	7	a	place name|peace and security
\u6811\u679D	sh\xF9 zh\u012B	7	n	branch|twig
\u81EA\u6765\u6C34	z\xEC l\xE1i shu\u01D0	6	n	running water|tap water
\u4E0D\u5982\u8BF4	b\xF9r\xFA shu\u014D	7	c	rather say
\u540E\u7EED	h\xF2u x\xF9	7	vn	follow-up|remarry
\u5FAE\u5F31	w\u0113i ru\xF2	7	a	weak|faint|feeble
\u4E0D\u6127	b\xF9 ku\xEC	6	d	be worthy of|deserve to be called|prove oneself to be
\u5784\u65AD	l\u01D2ng du\xE0n	7	v	monopolize
\u5730\u5F62	d\xEC x\xEDng	5	n	topography|terrain|landform
\u73A9\u5F04	w\xE1n n\xF2ng	6	v	play with|toy with|dally with|engage in|resort to
\u5F00\u91C7	k\u0101i c\u01CEi	7	v	extract|exploit|mine
\u6655\u5012	y\u016Bn d\u01CEo	7	v	faint|swoon|black out|become unconscious
\u64CD\u573A	c\u0101o ch\u01CEng	4	n	playground|sports field|drill ground
\u84DD\u5929	l\xE1n ti\u0101n	6	n	blue sky
\u89C1\u89E3	ji\xE0n ji\u011B	7	n	opinion|view|understanding
\u62B5\u6321	d\u01D0 d\u01CEng	7	v	resist|hold back|stop|ward off|withstand
\u77A9\u76EE	zh\u01D4 m\xF9	7	v	focus attention upon
\u6C22	q\u012Bng	6	n	hydrogen
\u915D\u917F	y\xF9n ni\xE0ng	7	v	ferment|be brewing|mull over|hold exploratory discussions
\u63ED\u53D1	ji\u0113 f\u0101	7	v	expose|bring to light|disclose|revelation
\u8DF3\u52A8	ti\xE0o d\xF2ng	7	v	throb|pulse|bounce|jiggle|jump about
\u51FA\u5934	ch\u016B t\xF3u	7	v	stick out|take the initiative|little more than
\u9635\u5BB9	zh\xE8n r\xF3ng	7	n	troop arrangement|battle formation|lineup
\u70E7\u6BC1	sh\u0101o hu\u01D0	7	v	burn|burn down
\u77ED\u7247	du\u01CEn pi\xE0n	6	n	short film|video clip
\u9972\u6599	s\xEC li\xE0o	7	n	feed|fodder
\u540C\u7B49	t\xF3ng d\u011Bng	7	b	equal to
\u6781\u529B	j\xED l\xEC	7	d	make a supreme effort|at all costs
\u4E0A\u697C	sh\xE0ng l\xF3u	4	v	go upstairs
\u7EC6\u81F4	x\xEC zh\xEC	4	a	delicate|fine|careful|meticulous|painstaking
\u4E0B\u697C	xi\xE0 l\xF3u	4		go downstairs
\u7545\u9500	ch\xE0ng xi\u0101o	7	v	sell well|bestselling|chart-topping
\u540D\u6C14	m\xEDng q\xEC	7	n	reputation|fame
\u57FA\u7763\u6559	J\u012B d\u016B ji\xE0o	6	nz	christianity|christian
\u9664\u5916	ch\xFA w\xE0i	7	v	exclude|not including sth|except for
\u62E3	ji\u01CEn	7	v	choose|pick|sort out|pick up
\u9012\u4EA4	d\xEC ji\u0101o	7	v	present|give|hand over|hand in|lay before
\u5012\u584C	d\u01CEo t\u0101	7	v	collapse|topple over
\u9644\u5C5E	f\xF9 sh\u01D4	7	vn	subsidiary|auxiliary|attached|affiliated|subordinate|subordinating
\u9002\u5B9C	sh\xEC y\xED	7	v	suitable|appropriate
\u5C48\u670D	q\u016B f\xFA	7	v	surrender|succumb|yield|defeat|prevail over
\u634D\u536B	h\xE0n w\xE8i	7		defend|uphold|safeguard
\u70B9\u706B	di\u01CEn hu\u01D2	7	v	ignite|light a fire|agitate|start an engine|ignition
\u8BA2\u8D2D	d\xECng g\xF2u	7	v	place an order|subscribe
\u65C5\u884C\u793E	l\u01DA x\xEDng sh\xE8	3	n	travel agency
\u6025\u4E8E	j\xED y\xFA	7	v	eager to|in a hurry to
\u4E0D\u7B97	b\xF9 su\xE0n	7	v	not calculate|not count|not be considered|have no weight
\u96EA\u5C71	xu\u011B sh\u0101n	7	n	snow-capped mountain
\u6BEB\u4E0D\u72B9\u8C6B	h\xE1o b\xF9 y\xF3u y\xF9	7	l	without the slightest hesitation
\u6CB8\u817E	f\xE8i t\xE9ng	7	v	boil|boil over|flare up|be impassioned
\u6EE1\u6000	m\u01CEn hu\xE1i	7	v	full on|heavy with young
\u541B\u5B50	j\u016Bn z\u01D0	7	n	nobleman|person of noble character
\u52BF\u5934	sh\xEC t\xF3u	7	n	power|momentum|tendency|impetus|situation|look of things
\u62CE	l\u012Bn	7	v	lift up|carry in one's hand|taiwan pr
\u5C0F\u5FC3\u7FFC\u7FFC	xi\u01CEo x\u012Bn y\xEC y\xEC	7	l	cautious and solemn|very carefully|prudent|gently and cautiously
\u98CE\u91C7	f\u0113ng c\u01CEi	7	n	svelte|elegant manner|graceful bearing
\u517B\u8001	y\u01CEng l\u01CEo	6	vn	provide for the elderly
\u767E\u8D27	b\u01CEi hu\xF2	4	n	general merchandise
\u63D2\u624B	ch\u0101 sh\u01D2u	7	v	get involved in|meddle|interference
\u76F4\u5954	zh\xED b\xE8n	7	v	go straight to|make a beeline for
\u5408\u4F19	h\xE9 hu\u01D2	7	v	act jointly|form a partnership
\u5168\u5FC3\u5168\u610F	qu\xE1n x\u012Bn qu\xE1n y\xEC	7	l	heart and soul|wholeheartedly
\u524D\u53F0	qi\xE1n t\xE1i	7	n	stage|proscenium|foreground in politics etc|front desk|reception desk|front-end|foreground
\u9A7E\u9A6D	ji\xE0 y\xF9	7	v	urge on|drive|steer|handle|manage|master|dominate
\u5171\u9E23	g\xF2ng m\xEDng	7	vn	resonate|resonance|sympathetic response
\u7EF7	b\u0113ng	7	v	draw tight|stretch taut|tack|embroidery hoop|woven bed mat|have a taut face
\u96BE\u770B	n\xE1n k\xE0n	2	a	ugly|unsightly
\u5916\u8BED	w\xE0i y\u01D4	1	n	foreign language
\u5047\u5192	ji\u01CE m\xE0o	7	v	impersonate|pose as|counterfeit|palm off
\u6273	b\u0101n	7	v	pull|turn around|recoup
\u4E5E\u4E10	q\u01D0 g\xE0i	7	n	beggar
\u656C\u8BF7	j\xECng q\u01D0ng	7	v	please
\u9AD8\u7A7A	g\u0101o k\u014Dng	7	s	high altitude
\u653E\u7EB5	f\xE0ng z\xF2ng	7	v	indulge|pamper|connive at|permissive|indulgent|self-indulgent|unrestrained|undisciplined
\u6709\u70B9\u513F	y\u01D2u di\u01CEn r	2		slightly|little|somewhat
\u5730\u94C1\u7AD9	d\xEC ti\u011B zh\xE0n	2	n	subway station
\u82B1\u74F6	hu\u0101 p\xEDng	6	n	flower vase
\u7533\u62A5	sh\u0113n b\xE0o	7	v	report|declare
\u6328\u7740	\u0101i zhe	6	v	near
\u5192\u5145	m\xE0o ch\u014Dng	7	v	feign|pretend to be|pass oneself off as
\u6D41\u5931	li\xFA sh\u012B	7	vn	wash away|be eroded|go elsewhere|fail to be retained
\u6BD4\u65B9	b\u01D0 fang	5	v	analogy|instance|for instance
\u6765\u6E90\u4E8E	l\xE1i yu\xE1n y\xFA	7	v	originate in
\u9AD8\u96C5	g\u0101o y\u01CE	7	a	dainty|elegance|elegant
\u4E8B\u6001	sh\xEC t\xE0i	7	n	situation|existing state of affairs
\u9A71\u52A8	q\u016B d\xF2ng	7	vn	drive|propel|drive mechanism|device driver
\u6076\u6027	\xE8 x\xECng	7	b	malignant|wicked|vicious|producing evil|rapid|runaway
\u62C5\u5F53	d\u0101n d\u0101ng	7	v	take upon oneself|assume
\u5DEE\u9519	ch\u0101 cu\xF2	7	n	mistake|slip-up|fault|error|accident|mishap
\u7F50\u5934	gu\xE0n tou	7	n	tin|can
\u8DEF\u9762	l\xF9 mi\xE0n	7	n	road surface
\u6512	z\u01CEn	7	v	collect|hoard|accumulate|save|bring together
\u6A59	ch\xE9ng	6	g	orange tree|orange
\u7F8E\u666F	m\u011Bi j\u01D0ng	7	n	beautiful scenery
\u5C40\u9650	j\xFA xi\xE0n	7	v	limit|confine
\u98CE\u5EA6	f\u0113ng d\xF9	5	n	elegance|elegant demeanor|grace|poise
\u6BD4\u4E0D\u4E0A	b\u01D0 b\xF9 sh\xE0ng	7	v	can't compare with
\u6551\u6CBB	ji\xF9 zh\xEC	7	v	provide critical care
\u65B9\u5411\u76D8	f\u0101ng xi\xE0ng p\xE1n	7	n	steering wheel
\u677F\u5757	b\u01CEn ku\xE0i	7	n	slab|tectonic plate|sector|bloc
\u63A5\u7EB3	ji\u0113 n\xE0	7	v	admit
\u5F52\u5C5E	gu\u012B sh\u01D4	7	vn	belong to|be affiliated to|one's final destination
\u52A8\u611F	d\xF2ng g\u01CEn	7	n	sense of movement|dynamic|vivid|lifelike
\u68D8\u624B	j\xED sh\u01D2u	7	a	thorny|intractable
\u5C16\u9510	ji\u0101n ru\xEC	7	a	sharp|intense|penetrating|pointed|acute
\u4F11\u514B	xi\u016B k\xE8	7	vn	shock|go into shock
\u6253\u724C	d\u01CE p\xE1i	6	v	play mahjong or cards
\u524A\u5F31	xu\u0113 ru\xF2	7	v	weaken|impair|cripple
\u5BBD\u677E	ku\u0101n s\u014Dng	7	a	spacious|roomy|uncrowded|loose and comfortable|relaxed|free of worry|well-off|affluent
\u8654\u8BDA	qi\xE1n ch\xE9ng	7	a	pious|devout|sincere
\u5BA3\u8BFB	xu\u0101n d\xFA	7	v	prepared speech
\u76AE\u978B	p\xED xi\xE9	5	n	leather shoes
\u7740\u773C	zhu\xF3 y\u01CEn	7	v	have one's eyes on|having sth in mind|concentrate
\u7262\u56FA	l\xE1o g\xF9	7	a	firm|secure
\u4EB2\u70ED	q\u012Bn r\xE8	7	a	affectionate|intimate|warmhearted|show affection for|get intimate with sb
\u6068\u4E0D\u5F97	h\xE8n bu de	7	d	hate to be unable|itching to do sth
\u5206\u91CF	f\xE8n liang	7	n	quantity|weight|measure|component
\u5151\u6362	du\xEC hu\xE0n	7	v	convert|exchange
\u9171\u6CB9	ji\xE0ng y\xF3u	6	n	soy sauce
\u9057\u7559	y\xED li\xFA	7	v	leave behind|hand down
\u9732\u5929	l\xF9 ti\u0101n	7	n	outdoors|al fresco|in the open
\u5DE8\u5934	j\xF9 t\xF3u	7	n	tycoon|magnate|big player|big shot
\u8D62\u5BB6	y\xEDng ji\u0101	7		winner
\u7B80\u6D01	ji\u01CEn ji\xE9	7	a	concise|succinct|pithy
\u6350\u52A9	ju\u0101n zh\xF9	6	v	donate|offer|contribution|donation
\u5927\u8086	d\xE0 s\xEC	7	d	wantonly|without restraint|unbridled
\u6025\u8BCA	j\xED zh\u011Bn	7	n	emergency treatment
\u9752\u6625\u671F	q\u012Bng ch\u016Bn q\u012B	7	t	puberty|adolescence
\u4EB2\u53CB	q\u012Bn y\u01D2u	7	n	friends and relatives
\u60AC\u5FF5	xu\xE1n ni\xE0n	7	n	concern for sb's welfare
\u6C34\u624B	shu\u01D0 sh\u01D2u	7	n	mariner|sailor|seaman
\u6CA1\u610F\u601D	m\xE9i y\xEC si	7	a	boring|of no interest
\u5FAE\u578B	w\u0113i x\xEDng	7	b	miniature|micro-|tiny
\u53CD\u54CD	f\u01CEn xi\u01CEng	6	n	repercussions|reaction|echo
\u7956\u7236	z\u01D4 f\xF9	6	n	father's father|paternal grandfather
\u9500	xi\u0101o	7	v	melt|cancel|annul|sell|expend|spend|pin|bolt
\u7F8A\u8089	y\xE1ng r\xF2u	2	n	mutton|goat meat
\u7728\u773C	zh\u01CE y\u01CEn	7	v	blink|wink
\u6389\u5934	di\xE0o t\xF3u	7	v	turn one's head|turn round|turn about
\u5BC2\u9759	j\xEC j\xECng	7	a	quiet
\u7403\u661F	qi\xFA x\u012Bng	6	n	sports star
\u804C\u6743	zh\xED qu\xE1n	7	n	authority|power over others
\u4F26\u7406	l\xFAn l\u01D0	7	n	ethics
\u53CD\u8FC7\u6765	f\u01CEn guo l\xE1i	7	d	conversely|in reverse order|in an opposite direction
\u754F\u60E7	w\xE8i j\xF9	7	v	fear|dread|foreboding
\u8EAB\u4EF7	sh\u0113n ji\xE0	7	n	social status|price of a slave|price of a person|worth|value
\u632F\u4F5C	zh\xE8n zu\xF2	7	v	bestir oneself|pull oneself together|cheer up|uplift|stimulate
\u9762\u7C89	mi\xE0n f\u011Bn	7	n	flour
\u83AB\u975E	m\xF2 f\u0113i	7	d	could it be
\u57CE\u5899	ch\xE9ng qi\xE1ng	7	n	city wall
\u5FEB\u6377	ku\xE0i ji\xE9	7	z	quick|fast|nimble|agile|shortcut
\u9A6F	x\xF9n	7	v	attain gradually|tame|taiwan pr
\u7A7A\u5730	k\xF2ng d\xEC	7	n	vacant land|open space|air-to-surface
\u51B2\u6D17	ch\u014Dng x\u01D0	7	v	rinse|wash|develop
\u63A5\u66FF	ji\u0113 t\xEC	7	v	replace|take over
\u4E0B\u53F0	xi\xE0 t\xE1i	7	v	go off the stage|step down|disentangle oneself|get off the hook
\u538B\u7F29	y\u0101 su\u014D	7	v	compress|compression
\u5F53\u7740	d\u0101ng zhe	7	p	in front of|in the presence of
\u5BAB\u6BBF	g\u014Dng di\xE0n	7	n	palace
\u9057\u5631	y\xED zh\u01D4	7	n	testament|will
\u73B0\u884C	xi\xE0n x\xEDng	7	b	be in effect|in force|current
\u7533\u9886	sh\u0113n l\u01D0ng	7		apply
\u6574\u987F	zh\u011Bng d\xF9n	6	v	tidy up|reorganize|consolidate|rectify
\u5FEB\u9910	ku\xE0i c\u0101n	2	n	fast food|snack|quick meal
\u5916\u8863	w\xE0i y\u012B	6	n	outer clothing|semblance|appearance
\u67DC\u5B50	gu\xEC zi	5	n	cupboard|cabinet
\u6CA1\u4E8B\u513F	m\xE9i sh\xEC r	1	v	have spare time|free from work|it's not important|it's nothing|never mind
\u70B9\u540D	di\u01CEn m\xEDng	4	v	roll call|mention sb by name|by name
\u4E0D\u4E3A\u4EBA\u77E5	b\xF9 w\xE9i r\xE9n zh\u012B	7	v	not known to anyone|secret|unknown
\u6487	pi\u011B	7	v	throw|cast|left-slanting downward brush stroke|cast away|fling aside
\u4ED9\u5973	xi\u0101n n\u01DA	7	n	fairy
\u8D22\u7269	c\xE1i w\xF9	7	n	property|belongings
\u4ECE\u5BB9	c\xF3ng r\xF3ng	7	a	go easy|unhurried|calm|taiwan pr
\u8270\u5DE8	ji\u0101n j\xF9	7	a	arduous|terrible|very difficult|formidable
\u7535\u4FE1	di\xE0n x\xECn	7	n	telecommunications
\u79D8\u4E66\u957F	m\xEC sh\u016B zh\u01CEng	6	n	secretary-general
\u7F3A\u53E3	qu\u0113 k\u01D2u	7	n	nick|jag|gap|shortfall
\u4E00\u5757\u513F	y\u012B ku\xE0i r	1	d	piece|chunk|one yuan|one dollar
\u75B2\u5026	p\xED ju\xE0n	7	a	tire|tired
\u8003\u53E4	k\u01CEo g\u01D4	6	n	archaeology
\u9646\u5730	l\xF9 d\xEC	4	n	dry land
\u7AD9\u4F4F	zh\xE0n zh\xF9	2	v	stand
\u94B1\u8D22	qi\xE1n c\xE1i	7	n	wealth|money
\u5F88\u96BE\u8BF4	h\u011Bn n\xE1nshu\u014D	6	v	hard to say
\u6709\u671B	y\u01D2u w\xE0ng	7	v	hopeful|promising
\u96BE\u5173	n\xE1n gu\u0101n	7	n	difficulty|crisis
\u5CF0\u4F1A	f\u0113ng hu\xEC	6	n	summit meeting
\u9650\u5EA6	xi\xE0n d\xF9	7	n	limitation|limit
\u9547\u9759	zh\xE8n j\xECng	6	a	calm|cool
\u9065\u63A7	y\xE1o k\xF2ng	7	vn	remotely control
\u59E8	y\xED	7	n	mother's sister|aunt
\u6392\u653E	p\xE1i f\xE0ng	7	vn	arrange in order|emit|discharge|ovulate|discharge semen
\u987D\u56FA	w\xE1n g\xF9	7	a	stubborn|obstinate
\u767D\u9886	b\xE1i l\u01D0ng	6	b	white-collar|white-collar worker
\u6563\u5E03	s\xE0n b\xF9	7	v	disseminate
\u8BDD\u5267	hu\xE0 j\xF9	3	n	stage play|modern drama
\u8D76\u5F80	g\u01CEn w\u01CEng	7	v	hurry to
\u6413	cu\u014D	7	v	twist
\u4EFD\u989D	f\xE8n \xE9	7	n	share|portion
\u6123	l\xE8ng	7	v	look distracted|stare blankly|distracted|blank|unexpectedly|rash|rashly
\u9897\u7C92	k\u0113 l\xEC	6	n	kernel|granule|granulated
\u6ED1\u51B0	hu\xE1 b\u012Bng	7	vn	skate|skating
\u5B9D\u85CF	b\u01CEo z\xE0ng	7	n	precious mineral deposits|hidden treasure|treasure|treasure of buddha's law
\u5BC6\u96C6	m\xEC j\xED	7	a	concentrated|crowded together|intensive|compressed
\u60ED\u6127	c\xE1n ku\xEC	7	a	ashamed
\u6784\u601D	g\xF2u s\u012B	7	v	design|plot|plan out|compose|draw a mental sketch|conception|plan|idea
\u6D77\u7EF5	h\u01CEi mi\xE1n	7	n	sponge|foam rubber
\u589E\u6DFB	z\u0113ng ti\u0101n	7	v	add|increase
\u4E58\u8F66	ch\xE9ng ch\u0113	5	v	ride|drive|motor
\u66A7\u6627	\xE0i m\xE8i	6	a	vague|ambiguous|equivocal|dubious
\u706D\u4EA1	mi\xE8 w\xE1ng	7	v	be destroyed|become extinct|perish|die out|destroy|exterminate
\u4EA4\u9645	ji\u0101o j\xEC	4	v	communication|social intercourse
\u5927\u4F7F\u9986	d\xE0 sh\u01D0 gu\u01CEn	3	n	embassy
\u5F25\u6F2B	m\xED m\xE0n	7	v	pervade|fill the air|diffuse|everywhere present|about to inundate|permeated by|filled with|saturate
\u914D\u4EF6	p\xE8i ji\xE0n	7	n	component|part|fitting|accessory|replacement part
\u5C0A\u8D35	z\u016Bn gu\xEC	7	a	respected|respectable|honorable
\u79E4	ch\xE8ng	7	n	steelyard|roman balance|weigh
\u6728\u677F	m\xF9 b\u01CEn	7	n	slab|board|plank
\u5982\u610F	r\xFA y\xEC	7	a	as one wants|according to one's wishes|ruyi scepter
\u7F38	g\u0101ng	7	n	jar|vat
\u8FA9\u89E3	bi\xE0n ji\u011B	7	v	explain|justify|defend|provide an explanation|try to defend oneself
\u4EF0	y\u01CEng	6	v	face upward|look up|admire|rely on
\u6C99\u5B50	sh\u0101 zi	3	n	sand|grit
\u5B57\u5E55	z\xEC m\xF9	7	n	caption|subtitle
\u4E9A\u519B	y\xE0 j\u016Bn	5	n	second place|runner-up
\u6454\u8DE4	shu\u0101i ji\u0101o	7	vn	trip and fall|wrestle|wrestling
\u9000\u56DE	tu\xEC hu\xED	7	v	return|send back|go back
\u7D27\u8FEB	j\u01D0n p\xF2	7	a	pressing|urgent
\u4FC3\u6210	c\xF9 ch\xE9ng	7	v	facilitate|effect
\u9886\u961F	l\u01D0ng du\xEC	7	n	lead a group|leader of a group|captain
\u5F92\u5F1F	t\xFA d\xEC	6	n	apprentice|disciple
\u8D2F\u7A7F	gu\xE0n chu\u0101n	7	v	run through|link
\u5927\u5BB6\u5EAD	d\xE0 ji\u0101 t\xEDng	7	n	extended family|big family|harmonious group
\u4E00\u65E0\u6240\u6709	y\u012B w\xFA su\u01D2 y\u01D2u	7	v	utterly lacking
\u89C4\u683C	gu\u012B g\xE9	7	n	standard|norm|specification
\u9AD8\u8840\u538B	g\u0101o xu\xE8 y\u0101	7	n	high blood pressure|hypertension
\u8D70\u8FD1	z\u01D2u j\xECn	7	v	approach|draw near to
\u601D\u7EEA	s\u012B x\xF9	6	n	train of thought|emotional state|mood|feeling
\u632F\u52A8	zh\xE8n d\xF2ng	5	vn	vibrate|shake|vibration
\u5BA3\u626C	xu\u0101n y\xE1ng	7	v	publicize|advertise|spread far and wide
\u7275\u626F	qi\u0101n ch\u011B	7	v	involve|implicate|be interrelated
\u663E\u793A\u5668	xi\u01CEn sh\xEC q\xEC	7	n	monitor
\u6597\u5FD7	d\xF2u zh\xEC	7	n	will to fight|fighting spirit
\u8336\u53F6	ch\xE1 y\xE8	4	n	tea|tea leaves
\u5982\u4E00	r\xFA y\u012B	6		consistent|same|unvarying
\u559D\u5F69	h\xE8 c\u01CEi	7	v	acclaim|cheer
\u81F4\u4F7F	zh\xEC sh\u01D0	7	v	cause|result in
\u5B66\u79D1	xu\xE9 k\u0113	5	n	subject|branch of learning|course|academic discipline
\u51ED\u7740	p\xEDng zhe	7	p	relying on|on the basis of
\u524D\u8005	qi\xE1n zh\u011B	7	r	former
\u5E8F	x\xF9	7	n	order|sequence|introductory|initial|preface
\u57CB\u4F0F	m\xE1i f\xFA	7	v	ambush|lie in wait for|lie low
\u5F15\u8BF1	y\u01D0n y\xF2u	7	v	coerce|lure|seduce
\u611F\u5174\u8DA3	g\u01CEn x\xECng q\xF9	4	a	be interested
\u7ED3\u7B97	ji\xE9 su\xE0n	6	vn	settle a bill|close an account
\u53F7\u53EC	h\xE0o zh\xE0o	5	v	call|appeal
\u683C\u5F0F	g\xE9 sh\xEC	7	n	form|specification|format
\u95F4\u9694	ji\xE0n g\xE9	7	n	gap|interval|compartment|divide|separate|leave a gap of
\u545B	qi\xE0ng	7	v	irritate the nose|choke|pungent|shout at sb|scold|speak out against sb
\u4E0D\u7ECF\u610F	b\xF9 j\u012Bng y\xEC	7	a	not paying attention|carelessly|by accident
\u8C03\u5EA6	di\xE0o d\xF9	7	vn	dispatch|schedule|manage|dispatcher|scheduler
\u770B\u53F0	k\xE0n t\xE1i	7	n	terrace|spectator's grandstand|viewing platform
\u71C3\u6CB9	r\xE1n y\xF3u	7	n	fuel oil
\u5BA1\u89C6	sh\u011Bn sh\xEC	7	v	look closely at|examine
\u534A\u6570	b\xE0n sh\xF9	7	m	half the number|half
\u8868\u5F70	bi\u01CEo zh\u0101ng	7	v	honor|commend|cite
\u524D\u5915	qi\xE1n x\u012B	7	f	eve|day before
\u8FC7\u763E	gu\xF2 y\u01D0n	7	a	satisfy a craving|gratifying|immensely enjoyable|satisfying|fulfilling
\u611F\u60F3	g\u01CEn xi\u01CEng	5	n	impressions|reflections|thoughts
\u5165\u5883	r\xF9 j\xECng	7	v	enter a country
\u517B\u6D3B	y\u01CEng huo	7	v	provide for|keep (animals|family etc)|raise animals|feed and clothe|support|necessities of life|give birth
\u8D4E	sh\xFA	7	v	redeem|ransom
\u5206\u7EC4	f\u0113n z\u01D4	3	v	divide into groups|group|subgroup|packet
\u6297\u4E89	k\xE0ng zh\u0113ng	7	v	resist
\u5F97\u76CA\u4E8E	d\xE9 y\xEC y\xFA	7		benefit from|thanks to
\u7167\u660E	zh\xE0o m\xEDng	7	n	lighting|illumination|light up|illuminate
\u5730\u8D28	d\xEC zh\xEC	7	n	geology
\u76F8\u5DEE	xi\u0101ng ch\xE0	7	v	differ|discrepancy between
\u53CB\u5584	y\u01D2u sh\xE0n	7	a	friendly
\u5E08\u8303	sh\u012B f\xE0n	7		teacher-training|pedagogical|normal
\u7535\u7F51	di\xE0n w\u01CEng	7	n	electricity grid|power grid|electrified wire netting
\u90AE\u5C40	y\xF3u j\xFA	4	n	post office
\u51FA\u8D70	ch\u016B z\u01D2u	7	v	leave home|go off|run away
\u6D6E\u73B0	f\xFA xi\xE0n	7	v	appear before one's eyes|come into view|float into appearance|come back|emerge|it emerges|it occurs
\u5174\u594B\u5242	x\u012Bng f\xE8n j\xEC	7	n	stimulant|doping
\u7AD9\u7ACB	zh\xE0n l\xEC	7	v	stand|standing|on one's feet
\u60CA\u614C	j\u012Bng hu\u0101ng	7	a	panic|be alarmed
\u8FD0\u52A8\u4F1A	y\xF9n d\xF2ng hu\xEC	4	n	sports competition
\u6D4B\u5B9A	c\xE8 d\xECng	6	v	determine
\u8D26\u5355	zh\xE0ng d\u0101n	7	n	bill
\u80A5\u6599	f\xE9i li\xE0o	7	n	fertilizer|manure
\u6267\u7167	zh\xED zh\xE0o	7	n	license|permit
\u77ED\u7F3A	du\u01CEn qu\u0113	7	v	shortage
\u63D0\u5021	t\xED ch\xE0ng	5	v	promote|advocate
\u6ECB\u6DA6	z\u012B r\xF9n	7	v	moist|humid|moisten|provide moisture|comfortably off
\u83CA\u82B1	j\xFA hu\u0101	7	n	chrysanthemum|anus
\u4E66\u5199	sh\u016B xi\u011B	7	v	write
\u5BC4\u6258	j\xEC tu\u014D	7	v	entrust|place in
\u624B\u672F\u5BA4	sh\u01D2u sh\xF9 sh\xEC	7	n	operating room
\u6B49\u610F	qi\xE0n y\xEC	7	n	apology|regret
\u8D81\u7740	ch\xE8nzhe	7	p	while
\u62A5\u7B54	b\xE0o d\xE1	5	v	repay|requite
\u706F\u6CE1	d\u0113ng p\xE0o	7	n	light bulb
\u4EA7\u91CF	ch\u01CEn li\xE0ng	6	n	output
\u5927\u90FD	d\xE0 d\u014Du	5	ns	for the most part|on the whole|also pr|metropolitan
\u6342	w\u01D4	7	v	enclose|cover with the hand|cover up|contrary|contradict
\u53EF\u89C2	k\u011B gu\u0101n	7	a	considerable|impressive|significant
\u8131\u843D	tu\u014D lu\xF2	7	v	drop off|come off|lose|omit
\u62FF\u624B	n\xE1 sh\u01D2u	7	a	expert in|good at
\u6536\u655B	sh\u014Du li\u01CEn	7	v	dwindle|vanish|make vanish|exercise restraint|curb|astringe|converge
\u6838\u6843	h\xE9 tao	7	n	walnut
\u70B9\u8BC4	di\u01CEn p\xEDng	7	v	comment|point by point commentary
\u52DF\u6350	m\xF9 ju\u0101n	7	vn	solicit contributions|collect donations
\u6CBB\u75C5	zh\xEC b\xECng	6	v	treat an illness
\u5357\u5317	n\xE1n b\u011Bi	5	f	north and south|north to south
\u5F00\u82B1	k\u0101i hu\u0101	4	v	bloom|blossom|flower|burst|split open|burst with joy|spring up everywhere|flourish
\u50B2\u6162	\xE0o m\xE0n	7	a	arrogant|haughty
\u5F00\u9614	k\u0101i ku\xF2	7	v	wide|open|open up
\u767B\u5C71	d\u0113ng sh\u0101n	4	vn	climb a mountain|climbing|mountaineering
\u8109\u640F	m\xE0i b\xF3	7	n	pulse
\u6587\u732E	w\xE9n xi\xE0n	7	n	document
\u63B0	b\u0101i	7	v	break off
\u5938\u5956	ku\u0101 ji\u01CEng	7	vn	praise|applaud|compliment
\u9009\u9879	xu\u01CEn xi\xE0ng	7	n	option|alternative|choice|choose a project
\u963B\u529B	z\u01D4 l\xEC	7	n	resistance|drag
\u5168\u65B9\u4F4D	qu\xE1n f\u0101ng w\xE8i	7	n	all around|omnidirectional|complete|holistic|comprehensive
\u8F66\u8F6E	ch\u0113 l\xFAn	7	n	wheel
\u76F2\u4EBA	m\xE1ng r\xE9n	6	n	blind person
\u6F6E\u6E7F	ch\xE1o sh\u012B	4	a	damp|moist
\u7F18\u5206	yu\xE1n f\xE8n	7	n	predestined affinity or relationship|destiny
\u640F\u6597	b\xF3 d\xF2u	7	v	wrestle|fight|struggle
\u8150\u70C2	f\u01D4 l\xE0n	7	v	rot|putrefy|corrupt
\u8DB3\u8FF9	z\xFA j\xEC	7	n	footprint|track|spoor
\u7167\u6599	zh\xE0o li\xE0o	7	v	tend|take care of sb
\u8BF7\u6559	q\u01D0ng ji\xE0o	3	v	ask for guidance|consult
\u6028\u6068	yu\xE0n h\xE8n	7	v	resent|harbor a grudge against|loathe|resentment|rancor
\u7CAA\u4FBF	f\xE8n bi\xE0n	7	n	excrement|feces|night soil
\u51B7\u9177	l\u011Bng k\xF9	7	a	unfeeling|callous
\u5408\u5531	h\xE9 ch\xE0ng	7	vn	chorus
\u98DE\u8DC3	f\u0113i yu\xE8	7	vn	leap
\u5F00\u62D3	k\u0101i tu\xF2	7	v	break new ground|open up|develop|fig. to open up
\u529E\u4E8B\u5904	b\xE0n sh\xEC ch\xF9	6	n	office|agency
\u8BB2\u89E3	ji\u01CEng ji\u011B	7	v	explain
\u8981\u597D	y\xE0o h\u01CEo	6	a	be on good terms|be close friends|striving for self-improvement
\u98CE\u7B5D	f\u0113ng zh\u0113ng	7	n	kite
\u5BB9\u91CF	r\xF3ng li\xE0ng	7	n	capacity|volume|quantitative
\u6000\u65E7	hu\xE1i ji\xF9	7	vn	feel nostalgic|nostalgia
\u795E\u4ED9	sh\xE9n xi\u0101n	7	n	daoist immortal|supernatural entity|fairy, elf, leprechaun etc|fig. lighthearted person
\u997A\u5B50	ji\u01CEo zi	2	n	dumpling|pot-sticker
\u4E00\u8FDE\u4E32	y\u012B li\xE1n chu\xE0n	7	l	succession of|series of
\u846C	z\xE0ng	7	g	bury|inter
\u9003\u4EA1	t\xE1o w\xE1ng	7	v	flee|flight|fugitive
\u964D\u6E29	ji\xE0ng w\u0113n	4	v	become cooler|lower the temperature|cooling|decline
\u62BD\u7B7E	ch\u014Du qi\u0101n	7	v	perform divination with sticks|draw lots|ballot
\u65E0\u987B	w\xFA x\u016B	7	d	need not|not obliged to|not necessarily
\u7F16\u5199	bi\u0101n xi\u011B	7	v	compile
\u629B\u5F00	p\u0101o k\u0101i	7	v	throw out|get rid of
\u67D4\u548C	r\xF3u h\xE9	7	a	gentle|soft
\u9999\u80A0	xi\u0101ng ch\xE1ng	5	n	sausage
\u6606\u866B	k\u016Bn ch\xF3ng	7	n	insect
\u8FEB\u5BB3	p\xF2 h\xE0i	7	vn	persecute
\u4E66\u5305	sh\u016B b\u0101o	1	n	schoolbag|satchel|bookbag
\u9000\u7F29	tu\xEC su\u014D	7	v	shrink back|cower
\u62BD\u5956	ch\u014Du ji\u01CEng	4	v	draw a prize|lottery|raffle
\u8C05\u89E3	li\xE0ng ji\u011B	7	vn	understand|make allowances for|understanding
\u8865\u7ED9	b\u01D4 j\u01D0	7	vn	supply|replenishment|replenish
\u98A0\u5012	di\u0101n d\u01CEo	7	v	turn upside down|reverse|back to front|confused|deranged|crazy
\u65E0\u4ECE	w\xFA c\xF3ng	6	d	not to have access
\u8BA4\u9519	r\xE8n cu\xF2	7	v	admit an error|acknowledge one's mistake
\u591C\u73ED	y\xE8 b\u0101n	7	n	night shift
\u6982\u62EC	g\xE0i ku\xF2	4	v	summarize|generalize|briefly|in broad outline
\u8F9B\u52E4	x\u012Bn q\xEDn	7	a	hardworking|industrious
\u4F20\u6388	chu\xE1n sh\xF2u	7	v	impart|pass on|teach
\u7C97\u66B4	c\u016B b\xE0o	7	a	rough|cruel
\u5929\u7EBF	ti\u0101n xi\xE0n	7	n	antenna|mast|connection with high-ranking officials
\u4F24\u5458	sh\u0101ng yu\xE1n	6	n	wounded person
\u7687\u5BA4	hu\xE1ng sh\xEC	7	n	royal family|imperial household
\u98CE\u6D41	f\u0113ng li\xFA	7	a	distinguished and accomplished|outstanding|romantic|dissolute|loose
\u9910\u996E	c\u0101n y\u01D0n	5	n	food and beverage|catering|repast
\u6D77\u5CE1	h\u01CEi xi\xE1	7	n	strait|channel
\u4E3B\u5BB0	zh\u01D4 z\u01CEi	7	v	dominate|rule|dictate|master
\u5149\u987E	gu\u0101ng g\xF9	7	v	visit
\u5B59\u5973	s\u016Bn n\u01DA	4	n	son's daughter|granddaughter
\u6210\u5929	ch\xE9ng ti\u0101n	7	d	all day long|all the time
\u7591\u8651	y\xED l\u01DC	7	n	hesitation|misgivings|doubt
\u60C5\u4E0D\u81EA\u7981	q\xEDng b\xF9 z\xEC j\u012Bn	7	l	unable to restrain emotions|cannot help
\u82CF\u9192	s\u016B x\u01D0ng	7	v	come to|awaken|regain consciousness
\u89E3\u96C7	ji\u011B g\xF9	7	v	fire|sack|dismiss|terminate employment
\u9690\u60A3	y\u01D0n hu\xE0n	7	n	danger concealed within sth|hidden damage
\u90D1\u91CD	zh\xE8ng zh\xF2ng	7	ad	serious|solemn|earnest|conscientious
\u5EFA\u7B51\u5E08	ji\xE0n zh\xF9 sh\u012B	7	n	architect
\u5766\u7387	t\u01CEn shu\xE0i	7	a	frank|blunt|open
\u70C8\u58EB	li\xE8 sh\xEC	7	n	martyr
\u5927\u5DF4	d\xE0 b\u0101	4	n	large bus|coach
\u7B3C\u5B50	l\xF3ng zi	7	n	cage|basket|container
\u9003\u751F	t\xE1o sh\u0113ng	7	v	flee for one's life
\u9610\u8FF0	ch\u01CEn sh\xF9	7	v	expound|elaborate|treat
\u5783\u573E\u6876	l\u0101 j\u012B t\u01D2ng	4	n	rubbish bin|trash can|garbage can|taiwan pr
\u559C\u597D	x\u01D0 h\xE0o	7	vn	like|fond of|prefer|love|one's tastes|preference
\u5747\u5300	j\u016Bn y\xFAn	7	a	even|well-distributed|homogeneous|well-proportioned
\u8F6E\u5ED3	l\xFAn ku\xF2	7	n	outline|silhouette
\u8D77\u6E90	q\u01D0 yu\xE1n	7	n	origin|originate|come from
\u591C\u603B\u4F1A	y\xE8 z\u01D2ng hu\xEC	7	n	nightclub|nightspot
\u849C	su\xE0n	7	n	garlic
\u6811\u53F6	sh\xF9 y\xE8	4	n	tree leaves
\u95E8\u69DB	m\xE9n k\u01CEn	7	n	doorstep|sill|threshold|fig. knack or trick
\u665A\u671F	w\u01CEn q\u012B	7	t	later period|end stage|terminal
\u706B\u67F4	hu\u01D2 ch\xE1i	5	n	match
\u5012\u95ED	d\u01CEo b\xEC	4	v	go bankrupt|close down
\u59A5\u5584	tu\u01D2 sh\xE0n	7	ad	appropriate|proper
\u75F4\u5446	ch\u012B d\u0101i	7	z	imbecility|dementia
\u4E00\u65E0\u6240\u77E5	y\u012B w\xFA su\u01D2 zh\u012B	7	v	completely ignorant|without an inkling
\u8BD5\u63A2	sh\xEC t\xE0n	7	v	sound out|probe|feel out|try out
\u58EE\u5927	zhu\xE0ng d\xE0	7	v	expand|strengthen
\u9A9A\u4E71	s\u0101o lu\xE0n	7	vn	disturbance|riot|create a disturbance
\u6536\u636E	sh\u014Du j\xF9	7	n	receipt
\u5F71\u8FF7	y\u01D0ng m\xED	6	n	film enthusiast|movie fan
\u5E95\u5C42	d\u01D0 c\xE9ng	7	n	ground or first floor|bottom|lowest rung
\u575A\u56FA	ji\u0101n g\xF9	4	a	firm|firmly|hard|stable
\u8033\u73AF	\u011Br hu\xE1n	6	n	earring
\u81EA\u4EE5\u4E3A\u662F	z\xEC y\u01D0 w\xE9i sh\xEC	7	v	believe oneself infallible|be opinionated
\u9881\u5E03	b\u0101n b\xF9	7	v	issue|proclaim|enact
\u94A9\u5B50	g\u014Du zi	7	n	hook
\u9972\u517B	s\xEC y\u01CEng	7	v	raise|rear
\u8BDA\u6073	ch\xE9ng k\u011Bn	7	a	sincere|honest|cordial
\u9AD8\u4EF7	g\u0101o ji\xE0	4	n	high price
\u5047\u5B9A	ji\u01CE d\xECng	7	v	assume|suppose|supposed|so-called|assumption|hypothesis
\u5973\u5A7F	n\u01DA xu	7	n	daughter's husband|son-in-law
\u533F\u540D	n\xEC m\xEDng	7	vn	anonymous
\u51DD\u805A	n\xEDng j\xF9	7	v	condense|coagulate|coacervation|aggregation|coherent
\u5174\u8D77	x\u012Bng q\u01D0	7	v	rise|spring up|burgeon|be aroused|come into vogue
\u8F6C\u673A	zhu\u01CEn j\u012B	7	n	turn for the better|change planes
\u7F16\u5236	bi\u0101n zh\xEC	6	n	weave|plait|compile|put together|establish|staffing structure
\u5BBD\u655E	ku\u0101n chang	7	a	spacious|wide
\u4E3A\u671F	w\xE9i q\u012B	5	v	by|lasting
\u6069\u6028	\u0113n yu\xE0n	7	n	gratitude and grudges|resentment|grudges|grievances
\u9762\u8C8C	mi\xE0n m\xE0o	5	n	face|features|appearance|look
\u51B7\u6C34	l\u011Bng shu\u01D0	6	n	cold water|unboiled water|fig. not yet ready
\u4E13\u7A0B	zhu\u0101n ch\xE9ng	7	d	specifically|specially
\u51B7\u7B11	l\u011Bng xi\xE0o	7	v	sneer|laugh grimly|grin of dissatisfaction
\u5206\u7EA2	f\u0113n h\xF3ng	7	v	dividend|award a bonus
\u5357\u6781	n\xE1n j\xED	5	ns	south pole
\u9884\u793A	y\xF9 sh\xEC	7	v	indicate|foretell|forebode|betoken
\u5954\u6CE2	b\u0113n b\u014D	7	v	rush about
\u504F\u50FB	pi\u0101n p\xEC	7	a	remote|desolate|far from the city
\u5907\u4EFD	b\xE8i f\xE8n	6	n	backup
\u591A\u4E8F	du\u014D ku\u012B	7	v	thanks to|luckily
\u771F\u7A7A	zh\u0113n k\u014Dng	7	n	vacuum
\u4EB2\u8EAB	q\u012Bn sh\u0113n	7	d	personal|oneself
\u5C0F\u63D0\u7434	xi\u01CEo t\xED q\xEDn	7	n	fiddle|violin
\u539F\u578B	yu\xE1n x\xEDng	7	n	model|prototype|archetype
\u6838\u5BF9	h\xE9 du\xEC	7	v	check|verify|audit|examine
\u575F	f\xE9n	7	n	grave|tomb|embankment|mound|ancient book
\u524D\u4E0D\u4E45	qi\xE1n b\xF9 ji\u01D4	7	t	not long ago|not long before
\u9886\u609F	l\u01D0ng w\xF9	7	v	understand|comprehend
\u5B89\u629A	\u0101n f\u01D4	7	v	placate|pacify|appease
\u5851\u6599\u888B	s\xF9 li\xE0o d\xE0i	4	n	plastic bag
\u5E9F\u9664	f\xE8i ch\xFA	7	v	abolish|abrogate|repeal
\u6263\u9664	k\xF2u ch\xFA	7	v	deduct
\u7D20\u6750	s\xF9 c\xE1i	7	n	source material
\u9547\u538B	zh\xE8n y\u0101	6	v	suppression|repression|suppress|put down|quell
\u50AC\u7720	cu\u012B mi\xE1n	7	v	hypnosis
\u4F3A\u5019	c\xEC hou	7	v	serve|wait upon
\u4E22\u5F03	di\u016B q\xEC	7	v	discard|abandon
\u51FA\u4EBA\u610F\u6599	ch\u016B r\xE9n y\xEC li\xE0o	7	v	unexpected|surprising
\u638F\u94B1	t\u0101o qi\xE1n	7	v	pay|spend money|fork out
\u5927\u5988	d\xE0 m\u0101	4	n	father's elder brother's wife|aunt
\u968F\u624B	su\xED sh\u01D2u	4	d	conveniently|without extra trouble|while doing it|in passing
\u7528\u5904	y\xF2ng chu	6	n	usefulness
\u9F3B\u6D95	b\xED t\xEC	7	n	nasal mucus|snivel|snot
\u878D\u6D3D	r\xF3ng qi\xE0	7	a	harmonious|friendly relations
\u642D\u4E58	d\u0101 ch\xE9ng	7	v	ride as a passenger|travel by
\u5207\u5272	qi\u0113 g\u0113	7	v	cut
\u6F5C\u80FD	qi\xE1n n\xE9ng	7	n	potential|hidden capability
\u5F92\u6B65	t\xFA b\xF9	7	d	be on foot
\u6D77\u57DF	h\u01CEi y\xF9	7	n	sea area|territorial waters|maritime space
\u5C0F\u5B66\u751F	xi\u01CEo xu\xE9 sh\u0113ng	1	n	primary school student|schoolchild|beginner
\u7EAA\u5F55\u7247	j\xEC l\xF9 pi\xE0n	7	n	newsreel|documentary
\u6C57\u6C34	h\xE0n shu\u01D0	7	n	sweat|perspiration
\u90AE\u653F	y\xF3u zh\xE8ng	7	n	postal service|postal
\u5929\u6865	ti\u0101n qi\xE1o	7	n	overhead walkway|pedestrian bridge
\u59E5\u59E5	l\u01CEo lao	7	n	mother's mother|maternal grandmother
\u8FC1	qi\u0101n	7	v	move|shift|change|promote
\u62FC\u640F	p\u012Bn b\xF3	7	v	struggle|wrestle
\u5316\u89E3	hu\xE0 ji\u011B	6	v	dissolve|resolve|dispel|iron out|defuse|neutralize
\u5B8C\u597D	w\xE1n h\u01CEo	7	a	intact|in good condition
\u79BB\u804C	l\xED zh\xED	7	v	leave one's job temporarily|leave one's job|resign
\u8F93\u9001	sh\u016B s\xF2ng	7	v	transport|convey|deliver
\u4EFB\u671F	r\xE8n q\u012B	7	n	term of office|tenure
\u529F\u6548	g\u014Dng xi\xE0o	7	n	efficacy
\u56F4\u5899	w\xE9i qi\xE1ng	7	n	perimeter wall|fence
\u597D\u6B79	h\u01CEo d\u01CEi	7	d	good and bad|most unfortunate occurrence|in any case|whatever
\u51F8	t\u016B	7	g	stick out|protruding|convex|male|taiwan pr
\u822A\u6D77	h\xE1ng h\u01CEi	7	vn	sail the seas|maritime navigation|voyage
\u6392\u884C\u699C	p\xE1i h\xE1ng b\u01CEng	6	n	charts|table of ranking
\u5E74\u5E95	ni\xE1n d\u01D0	3	t	end of the year|year-end
\u7F8E\u6EE1	m\u011Bi m\u01CEn	7	a	happy|blissful
\u7EFD\u653E	zh\xE0n f\xE0ng	7	v	blossom
\u53E3\u5934	k\u01D2u t\xF3u	7	n	oral|verbal
\u6854\u5B50	j\xFA zi	5	n	tangerine
\u6CD5\u5236	f\u01CE zh\xEC	5	n	legal system and institutions|made in france
\u8F6C\u578B	zhu\u01CEn x\xEDng	7	v	undergo fundamental change|transition|transform|update
\u57CB\u846C	m\xE1i z\xE0ng	6	v	bury
\u66B4\u8E81	b\xE0o z\xE0o	7	a	irascible|irritable|violent
\u534F\u540C	xi\xE9 t\xF3ng	7	v	cooperate|in coordination with|coordinated|collaborate|collaboration|collaborative
\u75F4\u8FF7	ch\u012B m\xED	7	v	infatuated|obsessed
\u7D27\u63A5\u7740	j\u01D0n ji\u0113 zhe	7	c	immediately afterwards|shortly after that
\u521D\u8877	ch\u016B zh\u014Dng	7	n	original intention
\u4E1D\u7EF8	s\u012B ch\xF3u	7	n	silk cloth|silk
\u8F6C\u544A	zhu\u01CEn g\xE0o	4	v	pass on|communicate|transmit
\u5E26\u52A8	d\xE0i d\xF2ng	3	v	spur|provide impetus|drive
\u914D\u5076	p\xE8i \u01D2u	7	n	spouse
\u4E2D\u7ACB	zh\u014Dng l\xEC	7	v	neutral|neutrality
\u597D\u5947\u5FC3	h\xE0o q\xED x\u012Bn	7	n	interest in sth|curiosity|inquisitive
\u5EF6\u8BEF	y\xE1n wu	7	v	delay|be held up|miss|holdup
\u706D\u7EDD	mi\xE8 ju\xE9	7	v	become extinct|die out|lose completely|exterminate
\u622A\u7136\u4E0D\u540C	ji\xE9 r\xE1n b\xF9 t\xF3ng	7	v	entirely different
\u5165\u573A	r\xF9 ch\u01CEng	7	v	enter into an examination
\u5C31\u8BFB	ji\xF9 d\xFA	7	v	go to school
\u5BB9\u7EB3	r\xF3ng n\xE0	7	v	hold|contain|accommodate|tolerate
\u65E0\u6761\u4EF6	w\xFA ti\xE1o ji\xE0n	7	d	unconditional
\u8A00\u884C	y\xE1n x\xEDng	7	n	words and actions
\u8001\u8FDC	l\u01CEo yu\u01CEn	7	d	very far away
\u6BCD\u5973	m\u01D4 n\u01DA	6	n	mother and daughter|mother-daughter
\u5F00\u52A8	k\u0101i d\xF2ng	7	v	start|set in motion|move|march|dig in|tuck in
\u63FD	l\u01CEn	7	v	monopolize|seize|take into one's arms|embrace|fasten|take on|canvass
\u4F53\u80FD	t\u01D0 n\xE9ng	7	n	physical capability|stamina
\u722A\u5B50	zhu\u01CE zi	7	n	claw
\u996D\u7897	f\xE0n w\u01CEn	7	n	rice bowl|fig. livelihood|job
\u516C\u7136	g\u014Dng r\xE1n	7	d	openly|publicly|undisguised
\u6D17\u793C	x\u01D0 l\u01D0	7	n	baptism
\u4E00\u56DE\u4E8B	y\u012B hu\xED sh\xEC	7		one and the same|one thing
\u52C7\u4E8E	y\u01D2ng y\xFA	7	v	dare to|be brave enough to
\u6263\u62BC	k\xF2u y\u0101	7	v	detain|hold in custody|distrain|seize property
\u56E2\u957F	tu\xE1n zh\u01CEng	5	n	regimental command|head of a delegation|group buy organizer|group-buying coordinator
\u5BCC\u8C6A	f\xF9 h\xE1o	7	n	rich and powerful person
\u65E5\u591C	r\xEC y\xE8	6	d	day and night|around the clock
\u53CD\u601D	f\u01CEn s\u012B	7	v	think back over sth|review|revisit|rethink|reflection|reassessment
\u6D1E\u7A74	d\xF2ng xu\xE9	6	n	cave|cavern
\u80C0	zh\xE0ng	7	a	swell|dropsical|swollen|bloated
\u8981\u5BB3	y\xE0o h\xE0i	7	n	vital part|key point|crucial
\u575A\u5B9E	ji\u0101n sh\xED	7	a	firm and substantial|solid
\u8C03\u76AE	ti\xE1o p\xED	4	a	naughty|mischievous|unruly
\u9192\u76EE	x\u01D0ng m\xF9	7	a	eye-grabbing|striking
\u7EC4\u88C5	z\u01D4 zhu\u0101ng	7	v	assemble|put together
\u5411\u6765	xi\xE0ng l\xE1i	7	d	always
\u57CE\u533A	ch\xE9ng q\u016B	6	n	city district|urban area
\u6295\u673A	t\xF3u j\u012B	7	vn	speculate|opportunistic|congenial|agreeable
\u9EA6\u514B\u98CE	m\xE0i k\xE8 f\u0113ng	5	n	microphone
\u6253\u901A	d\u01CE t\u014Dng	7	v	open access|establish contact|remove a block|put through
\u5927\u6279	d\xE0 p\u012B	6	m	large quantities of
\u9EC4\u660F	hu\xE1ng h\u016Bn	7	t	dusk|evening|nightfall
\u516C\u5143	g\u014Dng yu\xE1n	4	n	ce|christian era|ad
\u5916\u8FB9	w\xE0i bian	1	f	outside|outer surface|abroad
\u6D41\u91CF	li\xFA li\xE0ng	7	n	flow rate|throughput of passengers|volume of traffic|discharge|data traffic|network traffic|website traffic|mobile data
\u6212\u70DF	ji\xE8 y\u0101n	7	v	give up smoking
\u4EA4\u4ED8	ji\u0101o f\xF9	7	v	hand over|deliver
\u5C55\u671B	zh\u01CEn w\xE0ng	7	v	outlook|prospect|look ahead|look forward to
\u6709\u6240\u4E0D\u540C	y\u01D2u su\u01D2 b\xF9 t\xF3ng	7	v	differ to some extent
\u60C5\u7ED3	q\xEDng ji\xE9	7	n	complex
\u77E5\u540D\u5EA6	zh\u012B m\xEDng d\xF9	7	n	reputation|profile
\u4EEA\u8868	y\xED bi\u01CEo	7	n	appearance|bearing|meter
\u5E84\u4E25	zhu\u0101ng y\xE1n	7	a	solemn|dignified|stately
\u6B63\u5982	zh\xE8ng r\xFA	5	v	just as|precisely as
\u5382\u5546	ch\u01CEng sh\u0101ng	6	n	manufacturer|producer
\u8E6C	d\u0113ng	7	v	step on|tread on|wear|dump|taiwan pr
\u96C6\u7ED3	j\xED ji\xE9	7	v	assemble|concentrate|mass|build up|marshal
\u9AD8\u539F	g\u0101o yu\xE1n	5	n	plateau
\u4E3B\u4EBA\u516C	zh\u01D4 r\xE9n g\u014Dng	7	n	hero|main protagonist
\u5957\u9910	t\xE0o c\u0101n	4	n	set meal|product or service package
\u51B7\u6DE1	l\u011Bng d\xE0n	7	a	cold|indifferent
\u56FE\u8868	t\xFA bi\u01CEo	7	n	chart|diagram
\u5409\u7965\u7269	j\xED xi\xE1ng w\xF9	7	n	mascot
\u8349\u6848	c\u01CEo \xE0n	7	n	draft
\u53D6\u6696	q\u01D4 nu\u01CEn	7	v	warm oneself
\u8FC7\u5173	gu\xF2 gu\u0101n	7	v	cross a barrier|get through|pass|reach
\u6240\u4F5C\u6240\u4E3A	su\u01D2 zu\xF2 su\u01D2 w\xE9i	7	l	one's conduct and deeds
\u73CD\u85CF	zh\u0113n c\xE1ng	7	v	collect
\u62B5\u5FA1	d\u01D0 y\xF9	7	v	resist|withstand
\u5931\u5229	sh\u012B l\xEC	7	v	lose|suffer defeat
\u5B89\u7A33	\u0101n w\u011Bn	7	a	steady|stable|sedate|calm|sound|smooth
\u6251\u514B	p\u016B k\xE8	7	n	poker|playing cards
\u6D41\u9732	li\xFA l\xF9	7	v	reveal
\u51A4\u6789	yu\u0101n wang	7	v	accuse wrongly|treat unjustly|injustice|wronged|not worthwhile
\u4FE1\u8D37	x\xECn d\xE0i	7	n	credit|borrowed money
\u751F\u673A	sh\u0113ng j\u012B	7	n	opportunity to live|reprieve from death|life force|vitality
\u9677\u5BB3	xi\xE0n h\xE0i	6	v	entrap|set up|frame|make false charges against
\u8003\u6838	k\u01CEo h\xE9	5	vn	examine|check up on|assess|review|appraisal|evaluation
\u8FFD\u6EAF	zhu\u012B s\xF9	7	v	lit. to go upstream|trace sth back to|date from
\u4F53\u8C05	t\u01D0 li\xE0ng	7	v	empathize|allow|show understanding|appreciate
\u81EA\u536B	z\xEC w\xE8i	7	v	defend oneself|self-defense
\u81EA\u8D23	z\xEC z\xE9	7	v	blame oneself
\u98DF\u6B32	sh\xED y\xF9	6	n	appetite
\u98CE\u96E8	f\u0113ng y\u01D4	7	n	wind and rain|elements|trials and hardships
\u5C3E\u58F0	w\u011Bi sh\u0113ng	7	n	coda|epilogue|end
\u74F7\u5668	c\xED q\xEC	7	n	chinaware|porcelain
\u4E00\u4E3E	y\u012B j\u01D4	7	d	move|action|in one move|at a stroke|in one go
\u804B	l\xF3ng	7	v	deaf
\u8D77\u4E49	q\u01D0 y\xEC	6	v	uprising|insurrection|revolt
\u8138\u988A	li\u01CEn ji\xE1	7	n	cheek
\u60CA\u9192	j\u012Bng x\u01D0ng	7	v	rouse|be woken by sth|wake with a start|sleep lightly
\u7834\u706D	p\xF2 mi\xE8	7	v	be shattered|be annihilated
\u85CF\u8EAB	c\xE1ng sh\u0113n	7	v	hide|go into hiding|take refuge
\u7956\u6BCD	z\u01D4 m\u01D4	6	n	father's mother|paternal grandmother
\u9AD8\u5C71	g\u0101o sh\u0101n	7	n	high mountain|alpine mountain
\u5E03\u6EE1	b\xF9 m\u01CEn	6	v	be covered with|be filled with
\u7F13\u548C	hu\u01CEn h\xE9	7	v	ease|alleviate|moderate|allay|make more mild
\u6212\u5907	ji\xE8 b\xE8i	7	v	take precautions|guard against
\u82BD	y\xE1	7	n	bud|sprout
\u62A5\u9500	b\xE0o xi\u0101o	7	v	submit an expense account|apply for reimbursement|write off|wipe out
\u65E5\u540E	r\xEC h\xF2u	7	t	sometime|someday
\u4E25\u7981	y\xE1n j\xECn	7	v	strictly prohibit
\u5BFF\u53F8	sh\xF2u s\u012B	5		sushi
\u7269\u4E1A	w\xF9 y\xE8	5	n	property|real estate
\u7687\u5BAB	hu\xE1ng g\u014Dng	7	n	imperial palace
\u5065\u8EAB\u623F	ji\xE0n sh\u0113n f\xE1ng	5	n	gym|gymnasium
\u7EE3	xi\xF9	7	v	embroider|embroidery
\u6B63\u5B97	zh\xE8ng z\u014Dng	7	b	orthodox school|fig. traditional|old school|authentic|genuine
\u7ED3\u6676	ji\xE9 j\u012Bng	7	n	crystallize|crystallization|crystal|crystalline|fruit
\u5609\u5E74\u534E	ji\u0101 ni\xE1n hu\xE1	7	n	carnival
\u60F3\u65B9\u8BBE\u6CD5	xi\u01CEng f\u0101ng sh\xE8 f\u01CE	7	l	devise ways and means
\u8303\u7574	f\xE0n ch\xF3u	7	n	category
\u7D22\u8D54	su\u01D2 p\xE9i	7	v	ask for compensation|claim damages|claim for damages
\u81EA\u8D1F	z\xEC f\xF9	7	v	conceited|take responsibility
\u903C\u8FD1	b\u012B j\xECn	7	v	press on towards|close in on|approach|draw near
\u8FDD\u7AE0	w\xE9i zh\u0101ng	7	v	break the rules|violate regulations
\u7262\u8BB0	l\xE1o j\xEC	7	v	keep in mind|remember
\u52B3\u52A8\u529B	l\xE1o d\xF2ng l\xEC	7	n	labor force|manpower
\u7279\u5236	t\xE8 zh\xEC	7	b	special|unique
\u5206\u62C5	f\u0113n d\u0101n	7	v	share (a burden|cost|responsibility)
\u8F66\u4F4D	ch\u0113 w\xE8i	7	n	parking spot|unloading point|garage place|stand for taxi
\u624B\u827A	sh\u01D2u y\xEC	7	n	craftmanship|workmanship|handicraft|trade
\u8BA1\u65F6	j\xEC sh\xED	7	v	measure time|time|reckon by time
\u8FFD\u95EE	zhu\u012B w\xE8n	7	v	question closely|investigate in detail|examine minutely
\u53CC\u5411	shu\u0101ng xi\xE0ng	7	b	bidirectional|two-way|interactive
\u5371\u53CA	w\u0113i j\xED	7	v	endanger|jeopardize|danger
\u5243	t\xEC	7	v	shave|weed
\u82AD\u857E	b\u0101 l\u011Bi	7	n	ballet
\u9634\u6697	y\u012Bn \xE0n	7	a	dim|dark|overcast|darkness|shadow|dismal|gloomy|somber
\u4E0D\u4E88	b\xF9y\u01D4	7	v	withhold|refuse
\u5821\u5792	b\u01CEo l\u011Bi	7	n	fort
\u50F5	ji\u0101ng	7	a	rigid|deadlock|stiff
\u6572\u8BC8	qi\u0101o zh\xE0	7	v	rip off|extort|extortion|blackmail
\u9886\u4F1A	l\u01D0ng hu\xEC	7	v	understand|comprehend|grasp
\u4E3E\u63AA	j\u01D4 cu\xF2	7	n	move|act|measure
\u7F8E\u5FB7	M\u011Bi D\xE9	7	n	usa and germany|virtue
\u6B22\u5FEB	hu\u0101n ku\xE0i	7	a	cheerful and lighthearted|lively
\u6E38\u89C8	y\xF3u l\u01CEn	7	v	go sightseeing|tour|visit
\u53C2\u7167	c\u0101n zh\xE0o	7	v	consult a reference|refer to
\u871C\u6708	m\xEC yu\xE8	7	n	honeymoon
\u6447\u6446	y\xE1o b\u01CEi	7	v	sway|wobble|waver
\u4F18\u8D8A	y\u014Du yu\xE8	7	a	superior|superiority
\u4E0B\u4E00\u4EE3	xi\xE0 y\u012B d\xE0i	7	n	next generation
\u62BD\u8C61	ch\u014Du xi\xE0ng	7	a	abstract|abstraction
\u5F00\u6717	k\u0101i l\u01CEng	7	a	spacious and well-lit|open and clear|optimistic|cheerful|carefree
\u60A0\u4E45	y\u014Du ji\u01D4	7	a	long
\u53D7\u5BB3	sh\xF2u h\xE0i	7	v	suffer damage, injury etc|damaged|injured|killed|robbed
\u54E8	sh\xE0o	6	g	whistle|sentry
\u5371\u6025	w\u0113i j\xED	7	a	critical|desperate
\u5236\u8BA2	zh\xEC d\xECng	4	v	work out|formulate
\u5916\u89C2	w\xE0i gu\u0101n	6	n	outward appearance
\u7740\u8FF7	zh\xE1o m\xED	7	v	be fascinated|be captivated
\u590D\u539F	f\xF9 yu\xE1n	7	v	restore to former condition|recover from illness|recovery
\u91C7\u7EB3	c\u01CEi n\xE0	6	v	accept|adopt
\u968F\u5373	su\xED j\xED	7	d	immediately|presently|following which
\u5B57\u773C	z\xEC y\u01CEn	7	n	wording
\u901A\u7F09	t\u014Dng j\u012B	7	v	list as wanted
\u6587\u51ED	w\xE9n p\xEDng	7	n	diploma
\u5C0F\u8DEF	xi\u01CEo l\xF9	7	n	minor road|lane|pathway|trail
\u5206\u5DE5	f\u0113n g\u014Dng	6	vn	divide up the work|division of labor
\u634E	sh\u0101o	7	v	bring sth to sb|deliver
\u603B\u989D	z\u01D2ng \xE9	7	n	total
\u65E0\u975E	w\xFA f\u0113i	7	d	only|nothing else
\u63D0\u62D4	t\xED b\xE1	7	v	select for promotion
\u8D81\u673A	ch\xE8n j\u012B	7	d	seize an opportunity|take advantage of situation
\u529D\u8BF4	qu\xE0n shu\u014D	7	v	persuade|persuasion|advise
\u968F\u5FC3\u6240\u6B32	su\xED x\u012Bn su\u01D2 y\xF9	7	v	follow one's heart's desires|do as one pleases
\u76AE\u9769	p\xED g\xE9	6	n	leather
\u7EF0\u53F7	chu\xF2 h\xE0o	7	n	nickname
\u9646\u7EED	l\xF9 x\xF9	4	d	in turn|successively|one after the other|bit by bit
\u7387\u5148	shu\xE0i xi\u0101n	4	d	take the lead|show initiative
\u54D1	y\u01CE	7	v	mute|dumb|incapable of speech|hoarse|husky|dud|sound of cawing
\u56FE\u7EB8	t\xFA zh\u01D0	7	n	blueprint|drawing|design plans|graph paper
\u75C5\u5E8A	b\xECng chu\xE1ng	7	n	hospital bed|sickbed
\u89C2\u671B	gu\u0101n w\xE0ng	7	v	wait and see|watch from the sidelines|look around|survey
\u544A\u8BEB	g\xE0o ji\xE8	7	v	warn|admonish
\u5996\u602A	y\u0101o gu\xE0i	7	n	monster|devil
\u5F71\u661F	y\u01D0ng x\u012Bng	6	n	film star
\u653F\u515A	zh\xE8ng d\u01CEng	6	n	political party
\u5386\u7ECF	l\xEC j\u012Bng	7	v	experience|go through
\u8BD1	y\xEC	7	v	translate|interpret
\u5546\u8BA8	sh\u0101ng t\u01CEo	7	v	discuss|deliberate
\u51F6\u6B8B	xi\u014Dng c\xE1n	7	a	savage|cruel|fierce
\u53E3\u9999\u7CD6	k\u01D2u xi\u0101ng t\xE1ng	7	n	chewing gum
\u7EDE	ji\u01CEo	7	v	twist|entangle|wring|hang|turn|wind
\u8E2A\u8FF9	z\u014Dng j\xEC	6	n	tracks|trail|footprint|trace|vestige
\u53D7\u8D3F	sh\xF2u hu\xEC	7	v	accept a bribe
\u6C89\u601D	ch\xE9n s\u012B	7	v	contemplate|ponder|contemplation|meditation
\u4E2D\u5B66\u751F	zh\u014Dng xu\xE9 sh\u0113ng	1	n	middle-school student|high school student
\u5185\u5B58	n\xE8i c\xFAn	7	n	internal storage|computer memory|random access memory
\u53C2\u519B	c\u0101n j\u016Bn	7	v	join the army
\u70ED\u6F6E	r\xE8 ch\xE1o	7	n	upsurge|popular craze
\u7CBE\u5BC6	j\u012Bng m\xEC	6	a	accuracy|exact|precise|refined
\u5BF9\u7ACB	du\xEC l\xEC	5	v	oppose|set sth against|be antagonistic to|antithetical|relative opposite|opposing|diametrical
\u9614	ku\xF2	6	a	rich|wide|broad
\u79D1\u5E7B	k\u0113 hu\xE0n	7	b	science fiction
\u8D28\u95EE	zh\xEC w\xE8n	7	v	question|ask questions|inquire|bring to account|interrogate
\u63A0\u593A	lu:\xE8 du\xF3	7	v	plunder|rob
\u5265\u524A	b\u014D xu\u0113	7	v	exploit|exploitation
\u5382\u5BB6	ch\u01CEng ji\u0101	7	n	factory|manufacturer|factory owner|factory management
\u7F16\u9020	bi\u0101n z\xE0o	7	v	compile|draw up|fabricate|invent|concoct|make up|cook up
\u5766\u7136	t\u01CEn r\xE1n	7	ad	calm|undisturbed
\u95F4\u65AD	ji\xE0n du\xE0n	7	v	disconnected|interrupted|suspended|gap|break
\u7EC6\u817B	x\xEC n\xEC	7	a	exquisite|meticulous
\u8DF3\u6C34	ti\xE0o shu\u01D0	6	vn	dive|diving|fall dramatically
\u63A8\u884C	tu\u012B x\xEDng	5	v	put into effect|carry out
\u8BDD\u7B52	hu\xE0 t\u01D2ng	7	n	microphone|receiver|handset
\u63A7\u544A	k\xF2ng g\xE0o	7	v	accuse|charge|indict
\u8BD5\u5377	sh\xEC ju\xE0n	4	n	examination paper|test paper
\u52A0\u6DF1	ji\u0101 sh\u0113n	7	v	deepen
\u949F\u5934	zh\u014Dng t\xF3u	6	n	hour
\u8721	l\xE0	7	n	candle|wax
\u5178\u8303	di\u01CEn f\xE0n	7	n	model|example|paragon
\u9690\u8EAB	y\u01D0n sh\u0113n	7	v	hide oneself|invisible
\u53F0\u7403	t\xE1i qi\xFA	7	n	billiards
\u4EE3\u8868\u56E2	d\xE0i bi\u01CEo tu\xE1n	3	n	delegation
\u51B0\u96EA	b\u012Bng xu\u011B	4	n	ice and snow
\u4E92\u52A9	h\xF9 zh\xF9	7	vn	help each other
\u6EB6\u89E3	r\xF3ng ji\u011B	7	v	dissolve
\u8C03\u7814	di\xE0o y\xE1n	6	vn	investigate and research|research|investigation
\u4E30\u6536	f\u0113ng sh\u014Du	5	v	bumper harvest
\u5212\u7B97	hu\xE1 su\xE0n	7	a	calculate|weigh|view as profitable|worthwhile|value for money|cost-effective
\u6C34\u4EA7\u54C1	shu\u01D0 ch\u01CEn p\u01D0n	5		aquatic products
\u680F\u76EE	l\xE1n m\xF9	6	n	regular column or segment|program
\u77EB\u6B63	ji\u01CEo zh\xE8ng	7	v	correct|rectify|cure|rectification|correction|straighten
\u758F\u5FFD	sh\u016B hu	7	vn	neglect|overlook|negligence|carelessness
\u6267\u7740	zh\xED zhu\xF3	7	a	be strongly attached to|be dedicated|cling to|attachment
\u534A\u5C9B	b\xE0n d\u01CEo	7	n	peninsula
\u8111\u7B4B	n\u01CEo j\u012Bn	7	n	brains|mind|head|way of thinking
\u80C6\u5C0F	d\u01CEn xi\u01CEo	5	a	cowardice|timid
\u5F00\u673A	k\u0101i j\u012B	2	v	start an engine|boot up|press ctrl-alt-delete
\u672C\u5B50	b\u011Bn zi	1	n	book|notebook|edition
\u7259\u5237	y\xE1 shu\u0101	4	n	toothbrush
\u7C89\u672B	f\u011Bn m\xF2	6	n	fine powder|dust
\u8870\u9000	shu\u0101i tu\xEC	7	v	decline|fall|drop|falter|recession
\u7ED3\u8BC6	ji\xE9 sh\xED	7	v	get to know sb
\u7530\u5F84	ti\xE1n j\xECng	6	n	track and field
\u7F3A\u5931	qu\u0113 sh\u012B	7	n	lack|deficiency|shortcoming|flaw|defect|be deficient
\u547B\u541F	sh\u0113n y\xEDn	6	v	moan|groan
\u53F7\u79F0	h\xE0o ch\u0113ng	7	v	be known as|be nicknamed|be purportedly|claim
\u8BA8\u4EF7\u8FD8\u4EF7	t\u01CEo ji\xE0 hu\xE1n ji\xE0	7	v	haggle over price|bargain
\u6D41\u6DCC	li\xFA t\u01CEng	7	v	flow
\u96D5\u523B	di\u0101o k\xE8	7	n	carve|engrave|carving
\u594F\u6548	z\xF2u xi\xE0o	7	v	show results|be effective
\u6325\u970D	hu\u012B hu\xF2	6	v	squander money|extravagant|prodigal|free and easy|agile
\u4E3B\u6743	zh\u01D4 qu\xE1n	7	n	sovereignty
\u5E72\u90E8	g\xE0n b\xF9	7	n	cadre|official|officer|manager
\u8131\u8EAB	tu\u014D sh\u0113n	7	v	get away|escape|free oneself|disengage
\u6784\u5EFA	g\xF2u ji\xE0n	6	v	construct
\u607C\u706B	n\u01CEo hu\u01D2	6	a	annoyed|riled|vexed
\u8DA3\u5473	q\xF9 w\xE8i	7	n	fun|interest|delight|taste|liking|preference
\u5F52\u5BBF	gu\u012B s\xF9	7	n	place to return to|home|final destination|ending
\u51F3\u5B50	d\xE8ng zi	7	n	stool|small seat
\u4E89\u7AEF	zh\u0113ng du\u0101n	7	n	dispute|controversy|conflict
\u67AF\u71E5	k\u016B z\xE0o	7	a	dry and dull|uninteresting|dry-as-dust
\u9A6C\u529B	m\u01CE l\xEC	7	n	horsepower
\u4EBA\u9053	r\xE9n d\xE0o	7	n	human sympathy|humanitarianism|humane|sexual intercourse
\u89E3\u8BF4	ji\u011B shu\u014D	6	v	explain|give a running commentary
\u5F71\u89C6	y\u01D0ng sh\xEC	3	b	movies and television
\u4E00\u53E3\u6C14	y\u012B k\u01D2u q\xEC	5	d	one breath|in one breath|at a stretch
\u660E\u6717	m\xEDng l\u01CEng	7	a	bright|clear|obvious|forthright|open-minded|bright and cheerful
\u4E0D\u5C51	b\xF9 xi\xE8	7	v	disdain to do sth
\u53DB\u9006	p\xE0n n\xEC	7	n	rebel|revolt
\u4E00\u773C	y\u012B y\u01CEn	7	d	glance|quick look|glimpse
\u8FA8\u522B	bi\xE0n bi\xE9	7	v	distinguish|differentiate|discern|recognize|tell
\u65B9\u8A00	f\u0101ng y\xE1n	7	n	topolect|dialect
\u94ED\u8BB0	m\xEDng j\xEC	7	v	engrave in one's memory
\u786E\u7ACB	qu\xE8 l\xEC	5	v	establish|institute
\u5E94\u8058	y\xECng p\xECn	7	v	accept a job offer
\u8D23\u5907	z\xE9 b\xE8i	7	v	blame|criticize|condemnation|reproach
\u4E25\u8C28	y\xE1n j\u01D0n	7	a	rigorous|strict|careful|well organized|meticulous
\u5962\u671B	sh\u0113 w\xE0ng	7	v	extravagant hope|have excessive expectations
\u4E30\u76DB	f\u0113ng sh\xE8ng	7	a	rich|sumptuous
\u7533\u529E	sh\u0113n b\xE0n	7		apply for|bid for
\u5E84\u56ED	zhu\u0101ng yu\xE1n	7	n	manor|feudal land|villa and park
\u9152\u9B3C	ji\u01D4 gu\u01D0	5	n	drunkard
\u51B2\u523A	ch\u014Dng c\xEC	7	v	sprint|spurt|dash
\u523B\u82E6	k\xE8 k\u01D4	7	a	hardworking|assiduous
\u540E\u52E4	h\xF2u q\xEDn	7	n	logistics
\u5F80\u65E5	w\u01CEng r\xEC	7	t	former days|past
\u8001\u5316	l\u01CEo hu\xE0	7	v	age|become outdated
\u8BAE\u7A0B	y\xEC ch\xE9ng	7	n	agenda|agenda item
\u6652\u592A\u9633	sh\xE0i t\xE0i y\xE1ng	7	v	be in the sun
\u656C\u4F69	j\xECng p\xE8i	7	v	esteem|admire
\u5BBD\u6055	ku\u0101n sh\xF9	7	v	forgive|forgiveness
\u70ED\u8877	r\xE8 zh\u014Dng	7	v	feel strongly about|be fond of|obsession|deep commitment
\u77E5\u5DF1	zh\u012B j\u01D0	7	n	know oneself|be intimate or close|intimate friend
\u5355\u8C03	d\u0101n di\xE0o	4	a	monotonous
\u6363\u4E71	d\u01CEo lu\xE0n	7	v	disturb|look for trouble|stir up a row|bother sb intentionally
\u6539\u540D	g\u01CEi m\xEDng	7	v	change one's name
\u661F\u671F\u65E5	X\u012Bng q\u012B r\xEC	1	t	sunday
\u516C\u5171\u573A\u6240	g\u014Dng g\xF2ng ch\u01CEng su\u01D2	7	n	public place
\u582A\u79F0	k\u0101n ch\u0113ng	7	v	can be rated as
\u8FC7\u65E9	gu\xF2 z\u01CEo	7	d	premature|untimely|have breakfast|breakfast
\u7740\u5B9E	zhu\xF3 sh\xED	7	d	truly|indeed|severely|harshly
\u6DF9	y\u0101n	7	v	flood|submerge|drown|irritate the skin|delay
\u4F18\u5F02	y\u014Du y\xEC	7	a	exceptional|outstandingly good
\u5AB3\u5987	x\xED f\xF9	7	n	daughter-in-law|wife|young married woman|young woman
\u8179\u6CFB	f\xF9 xi\xE8	7	v	diarrhea|have the runs
\u52A3\u52BF	li\xE8 sh\xEC	7	n	inferior|disadvantaged
\u8D85\u901F	ch\u0101o s\xF9	7	v	exceed the speed limit|speed|high-speed
\u80F6\u56CA	ji\u0101o n\xE1ng	7	n	capsule
\u903C\u8FEB	b\u012B p\xF2	7	v	force|compel|coerce
\u5582\u517B	w\xE8i y\u01CEng	7	v	feed|keep|raise
\u6EA2	y\xEC	7	v	overflow|excessive
\u8FD0\u6CB3	y\xF9n h\xE9	7	n	canal
\u4E0D\u5F97\u5DF2	b\xF9 d\xE9 y\u01D0	7	a	act against one's will|have to|have no choice|must
\u6846\u67B6	ku\xE0ng ji\xE0	7	n	frame|framework
\u5317\u6781	b\u011Bi j\xED	5	n	north pole|arctic pole|north magnetic pole
\u590D\u5174	f\xF9 x\u012Bng	7	vn	revive|rejuvenate
\u5DC5\u5CF0	di\u0101n f\u0113ng	7	n	summit|apex|pinnacle|peak
\u65AD\u5B9A	du\xE0n d\xECng	7	v	conclude|determine|come to a judgment
\u98CE\u8DA3	f\u0113ng q\xF9	7	a	charm|humor|wit|humorous|witty
\u8BFE\u672C	k\xE8 b\u011Bn	1	n	textbook
\u66F2\u6298	q\u016B zh\xE9	7	a	winding|complicated
\u6401	g\u0113	7	v	place|put aside|shelve|bear|stand|endure
\u79BB\u5947	l\xED q\xED	7	a	odd|bizarre
\u9664\u5915	Ch\xFA x\u012B	5	t	lunar new year's eve
\u535A\u89C8\u4F1A	b\xF3 l\u01CEn hu\xEC	5	n	exposition|international fair
\u590D\u67E5	f\xF9 ch\xE1	7	v	check again|re-examine
\u738B\u724C	w\xE1ng p\xE1i	7	n	trump card
\u517B\u6210	y\u01CEng ch\xE9ng	4	v	cultivate|raise|form|acquire
\u513F\u79D1	\xE9r k\u0113	6	n	pediatrics
\u53D8\u8D28	bi\xE0n zh\xEC	7	v	degenerate|deteriorate|go bad|go off|metamorphism
\u65BD\u884C	sh\u012B x\xEDng	7	v	put in place|put into practice|take effect
\u505C\u8F66\u4F4D	t\xEDng ch\u0113 w\xE8i	7	n	parking space|parking spot
\u8D35\u91CD	gu\xEC zh\xF2ng	7	a	precious
\u7BA1\u5B50	gu\u01CEn zi	7	n	tube|pipe|drinking straw
\u6DF7\u6DC6	h\xF9n xi\xE1o	7	v	obscure|confuse|mix up|blur|mislead
\u76DB\u4F1A	sh\xE8ng hu\xEC	7	n	pageant|distinguished meeting
\u770B\u5F97\u89C1	k\xE0n d\xE9 ji\xE0n	6	v	can see|visible
\u6295\u7A3F	t\xF3u g\u01CEo	7	v	submit articles for publication|contribute
\u77FF\u6CC9\u6C34	ku\xE0ng qu\xE1n shu\u01D0	4	n	mineral water
\u6346\u7ED1	k\u01D4n b\u01CEng	6	v	bind
\u52A8\u542C	d\xF2ng t\u012Bng	7	a	pleasant to listen to
\u60CA\u9669	j\u012Bng xi\u01CEn	7	a	perilous|touch-and-go|nerve-racking|suspenseful
\u6025\u5267	j\xED j\xF9	7	d	rapid|sudden
\u8FCE\u5408	y\xEDng h\xE9	7	v	cater to|pander to
\u538C\u70E6	y\xE0n f\xE1n	7	v	bored|fed up with sth|sick of sth
\u4EA4\u6D89	ji\u0101o sh\xE8	7	v	negotiate|have dealings
\u5747\u8861	j\u016Bn h\xE9ng	7	a	equal|balanced|harmony|equilibrium
\u6559\u79D1\u4E66	ji\xE0o k\u0113 sh\u016B	7	n	textbook
\u672C\u610F	b\u011Bn y\xEC	7	n	original idea|real intention|etymon
\u950B\u5229	f\u0113ng l\xEC	6	a	sharp|incisive|point
\u601D\u7D22	s\u012B su\u01D2	7	v	think deeply|ponder
\u4E8C\u6C27\u5316\u78B3	\xE8r y\u01CEng hu\xE0 t\xE0n	7	n	carbon dioxide co2
\u5938\u5927	ku\u0101 d\xE0	7	v	exaggerate
\u6539\u826F	g\u01CEi li\xE1ng	7	v	improve|reform
\u7F16\u7EC7	bi\u0101n zh\u012B	6	v	weave|knit|plait|braid|lie etc)
\u6E14\u8239	y\xFA chu\xE1n	7	n	fishing boat
\u9A7B\u624E	zh\xF9 zh\u0101	6	v	station|garrison
\u6B4C\u661F	g\u0113 x\u012Bng	6	n	singing star|famous singer
\u76DF\u53CB	m\xE9ng y\u01D2u	7	n	ally
\u6025\u5207	j\xED qi\xE8	6	a	eager|impatient
\u6B63\u89C6	zh\xE8ng sh\xEC	7	v	face squarely|meet head on|face up to
\u6295\u8EAB	t\xF3u sh\u0113n	7	v	throw oneself into sth
\u7F51\u5427	w\u01CEng b\u0101	6	n	internet caf\xE9
\u6E38\u620F\u673A	y\xF3u x\xEC j\u012B	6	n	video game machine|video game console
\u91CD\u4EFB	zh\xF2ng r\xE8n	7	n	heavy responsibility
\u6324\u538B	j\u01D0 y\u0101	7	v	squeeze|press|extrude
\u65BD\u52A0	sh\u012B ji\u0101	7	v	exert
\u5904\u5206	ch\u01D4 f\xE8n	5	n	discipline sb|punish|disciplinary action|deal with
\u5F97\u624B	d\xE9 sh\u01D2u	7	v	go smoothly|come off|succeed
\u9576	xi\u0101ng	7	v	inlay|embed|ridge|border
\u79C1\u81EA	s\u012B z\xEC	7	d	private|personal|secretly|without explicit approval
\u517C\u987E	ji\u0101n g\xF9	7	v	balance
\u6C34\u57DF	shu\u01D0 y\xF9	7	n	waters|body of water
\u914D\u97F3	p\xE8i y\u012Bn	7	v	dubbing
\u5B8F\u4F1F	h\xF3ng w\u011Bi	7	a	grand|imposing|magnificent
\u9AD8\u4F4E	g\u0101o d\u012B	7	n	height|altitude|pitch|ups and downs|anyway, whatever|eventually, in the end
\u81EA\u7136\u800C\u7136	z\xEC r\xE1n \xE9r r\xE1n	7	l	involuntary|automatically
\u7CBE\u9AD3	j\u012Bng su\u01D0	7	n	marrow|pith|quintessence|essence
\u8FC7\u5269	gu\xF2 sh\xE8ng	7	v	be excessive
\u957F\u5BFF	ch\xE1ng sh\xF2u	5	a	longevity|long-lived
\u6539\u52A8	g\u01CEi d\xF2ng	7	v	alter|modify|revise
\u60E6\u8BB0	di\xE0n j\xEC	7	v	think of|keep thinking about|be concerned about
\u5C9B\u5C7F	d\u01CEo y\u01D4	7	n	island
\u832B\u832B	m\xE1ng m\xE1ng	6	z	boundless|vast and obscure
\u654F\u6377	m\u01D0n ji\xE9	7	a	nimble|quick|shrewd
\u7981\u5FCC	j\xECn j\xEC	7	n	taboo|contraindication|abstain from
\u811A\u5370	ji\u01CEo y\xECn	6	n	footprint
\u6D41\u5165	li\xFA r\xF9	7	v	flow into|drift into|influx|inflow
\u65B0\u5947	x\u012Bn q\xED	7	a	novel|new|exotic
\u5C0F\u6C14	xi\u01CEo q\xEC	7	a	stingy|miserly|narrow-minded|petty
\u63A5\u8FDE	ji\u0113 li\xE1n	5	d	on end|in a row|in succession
\u8D8A\u53D1	yu\xE8 f\u0101	7	d	increasingly|more and more|ever more|all the more
\u8FDB\u800C	j\xECn \xE9r	7	c	and then
\u70AD	t\xE0n	7	n	wood charcoal|coal
\u7B80\u5316	ji\u01CEn hu\xE0	7	v	simplify
\u8BDA\u4FE1	ch\xE9ng x\xECn	4	a	genuine|honest|in good faith|honesty|integrity
\u9488\u7078	zh\u0113n ji\u01D4	7	n	acupuncture and moxibustion
\u61D2\u60F0	l\u01CEn du\xF2	7	a	idle|lazy
\u7A97\u5B50	chu\u0101ng zi	4	n	window
\u53EF\u53E3	k\u011B k\u01D2u	7	a	tasty|taste good
\u56DE\u9996	hu\xED sh\u01D2u	7	v	turn around|look back|recall the past
\u67F4\u6CB9	ch\xE1i y\xF3u	6	n	diesel fuel
\u6B96\u6C11\u5730	zh\xED m\xEDn d\xEC	6	n	colony
\u56FD\u5E86	Gu\xF3 q\xECng	3	t	national day
\u9157\u9152	x\xF9 ji\u01D4	7	v	heavy drinking|get drunk|drink to excess
\u9519\u89C9	cu\xF2 ju\xE9	7	n	misconception|illusion|misperception
\u9676\u9189	t\xE1o zu\xEC	7	v	be infatuated with|be drunk with|be enchanted with|revel in
\u8FDB\u51FA\u53E3	j\xECn ch\u016B k\u01D2u	7	vn	import and export
\u672A\u514D	w\xE8i mi\u01CEn	7	d	unavoidably|can't help|really|rather
\u540D\u8A00	m\xEDng y\xE1n	7	n	saying|famous remark
\u6C60\u5858	ch\xED t\xE1ng	7	n	pool|pond
\u5BA1\u6279	sh\u011Bn p\u012B	7	vn	examine and approve|endorse
\u518D\u4E09	z\xE0i s\u0101n	4	d	over and over again|again and again
\u793A\u610F	sh\xEC y\xEC	7	v	hint|indicate
\u6D77\u9762	h\u01CEi mi\xE0n	7	n	sea level|sea surface
\u5B9A\u5C45	d\xECng j\u016B	7	v	settle|take up residence
\u52A0\u7D27	ji\u0101 j\u01D0n	7	v	intensify|speed up|step up
\u84DD\u56FE	l\xE1n t\xFA	7	n	blueprint
\u4FEE\u517B	xi\u016B y\u01CEng	5	n	accomplishment|training|self-cultivation
\u6591\u70B9	b\u0101n di\u01CEn	7	n	spot|stain|speckle
\u6BCD\u5B50	m\u01D4 z\u01D0	6	n	mother and child|parent and subsidiary|principal and interest
\u75C5\u75C7	b\xECng zh\xE8ng	7	n	disease|illness
\u5E06\u8239	f\u0101n chu\xE1n	7	n	sailboat
\u4F5B\u6559	F\xF3 ji\xE0o	6	nz	buddhism
\u65E0\u7F18	w\xFA yu\xE1n	7	v	have no opportunity|no way|no chance|no connection|not placed
\u6291\u90C1\u75C7	y\xEC y\xF9 zh\xE8ng	7	n	clinical depression
\u7184\u706D	x\u012B mi\xE8	6	v	stop burning|go out|die out|extinguished
\u4E0D\u8010\u70E6	b\xF9 n\xE0i f\xE1n	5	a	impatient|lose patience
\u9632\u706B\u5899	f\xE1ng hu\u01D2 qi\xE1ng	7	n	firewall
\u8865\u6551	b\u01D4 ji\xF9	7	v	remedy
\u5956\u724C	ji\u01CEng p\xE1i	7	n	medal
\u6D77\u5578	h\u01CEi xi\xE0o	7	n	tsunami
\u5B9A\u8BBA	d\xECng l\xF9n	7	n	final conclusion|accepted argument
\u5F00\u8F9F	k\u0101i p\xEC	7	v	open up|set up|establish
\u96F6\u94B1	l\xEDng qi\xE1n	7	n	change|small change|pocket money
\u5916\u53F7	w\xE0i h\xE0o	7	n	nickname
\u72C2\u6B22\u8282	ku\xE1ng hu\u0101n ji\xE9	7	n	carnival
\u63A5\u89C1	ji\u0113 ji\xE0n	7	v	receive sb|grant an interview
\u6D25\u8D34	j\u012Bn ti\u0113	7	n	allowance
\u7B79\u5212	ch\xF3u hu\xE0	7	v	plan and prepare
\u80DA\u80CE	p\u0113i t\u0101i	7	n	embryo
\u7597\u6548	li\xE1o xi\xE0o	7	n	healing efficacy|healing effect
\u6F02\u6D6E	pi\u0101o f\xFA	6	v	float|hover|drift (also fig|lead a wandering life)|rove|showy|superficial
\u534E\u8BED	Hu\xE1 y\u01D4	5		chinese language
\u9769\u65B0	g\xE9 x\u012Bn	6	vn	innovate|innovation
\u58F0\u671B	sh\u0113ng w\xE0ng	7	n	popularity|prestige
\u7A7A\u6D1E	k\u014Dng d\xF2ng	6	a	cavity|empty|vacuous
\u95EE\u5377	w\xE8n ju\xE0n	7	n	questionnaire
\u5475\u62A4	h\u0113 h\xF9	7	v	bless|cherish|take good care of|conserve
\u5B88\u5019	sh\u01D2u h\xF2u	7	v	wait for|expect|keep watch|watch over|nurse
\u6DF1\u5207	sh\u0113n qi\xE8	7	a	deeply felt|heartfelt|sincere|honest
\u8DEF\u5B50	l\xF9 zi	7	n	method|way|approach
\u53CD\u5E38	f\u01CEn ch\xE1ng	7	a	unusual|abnormal
\u6253\u91CF	d\u01CE liang	7	v	size sb up|take the measure of|suppose|reckon
\u656C\u4E1A	j\xECng y\xE8	7	v	dedicated to one's work
\u89C6\u5BDF	sh\xEC ch\xE1	7	v	inspect|investigation
\u7406\u53D1	l\u01D0 f\xE0	3	v	get a haircut|have one's hair done|cut hair|give a haircut
\u5237\u65B0	shu\u0101 x\u012Bn	7	v	renovate|refurbish|refresh|write a new page|break
\u5546\u57CE	sh\u0101ng ch\xE9ng	6	n	shopping center|department store
\u4E00\u884C	y\u012B x\xEDng	6	n	party|delegation
\u6C49\u8BED	H\xE0n y\u01D4	1	nz	chinese language
\u6CDB\u6EE5	f\xE0n l\xE0n	7	v	be in flood|overflow|inundate|spread unchecked
\u78C1\u5E26	c\xED d\xE0i	7	n	magnetic tape
\u5E73\u65B9	p\xEDng f\u0101ng	4	q	square
\u8BED\u6CD5	y\u01D4 f\u01CE	4	n	grammar
\u5927\u610F	d\xE0 y\xEC	7	n	general idea|main idea|careless
\u9EBB\u5C06	m\xE1 ji\xE0ng	7	n	mahjong
\u6BC1\u574F	hu\u01D0 hu\xE0i	7	v	damage|devastate|vandalize|destruction
\u4F1A\u6664	hu\xEC w\xF9	7	vn	meet|meeting|conference
\u52A8\u5411	d\xF2ng xi\xE0ng	7	n	trend|tendency
\u7126\u6025	ji\u0101o j\xED	7	a	anxiety|anxious
\u4F53\u9762	t\u01D0 mi\xE0n	7	a	dignity|prestige|face|honorable|creditable|presentable|respectable
\u80E1\u4E71	h\xFA lu\xE0n	6	d	careless|reckless|casually|absent-mindedly|at will|at random|any old how
\u968F\u65F6\u968F\u5730	su\xED sh\xED su\xED d\xEC	7	l	anytime and anywhere
\u81EA\u5C0A\u5FC3	z\xEC z\u016Bn x\u012Bn	7	n	self-respect|self-esteem|ego
\u566A\u58F0	z\xE0o sh\u0113ng	7	n	noise
\u4E0B\u5C97	xi\xE0 g\u01CEng	7	v	come off duty|be to laid off
\u6210\u54C1	ch\xE9ng p\u01D0n	6	n	finished goods|finished product
\u6269	ku\xF2	7	g	enlarge
\u6691\u671F	sh\u01D4 q\u012B	7	t	summer vacation time
\u56B7	r\u01CEng	7	v	shout|bellow
\u7267\u573A	m\xF9 ch\u01CEng	7	n	pasture|grazing land|ranch
\u51DD\u56FA	n\xEDng g\xF9	7	v	freeze|solidify|congeal|fig. with rapt attention
\u7092\u4F5C	ch\u01CEo zu\xF2	6	v	hype|promote
\u78E8\u635F	m\xF3 s\u01D4n	7	v	suffer wear and tear|deteriorate through use|wear out
\u610F\u5411	y\xEC xi\xE0ng	7	n	intention|purpose|intent|inclination|disposition
\u6E90\u6CC9	yu\xE1n qu\xE1n	7	n	fountainhead|well-spring|water source|fig. origin
\u987A\u624B	sh\xF9n sh\u01D2u	7	d	easily|without trouble|in passing|handy
\u89C9\u609F	ju\xE9 w\xF9	6	n	come to understand|realize|consciousness|awareness|buddhist enlightenment
\u4F59\u989D	y\xFA \xE9	7	n	balance|surplus|remainder
\u80F6\u7247	ji\u0101o pi\xE0n	7	n	film
\u7EC6\u5FAE	x\xEC w\u0113i	7	a	tiny|minute|fine|subtle|sensitive
\u5915\u9633	x\u012B y\xE1ng	6	n	sunset|setting sun
\u663E\u773C	xi\u01CEn y\u01CEn	7	a	conspicuous|eye-catching|glamorous
\u7B80\u6613	ji\u01CEn y\xEC	7	a	simple and easy|simplistic|simplicity
\u6B23\u559C	x\u012Bn x\u01D0	7	a	happy
\u5413\u552C	xi\xE0 hu	7	v	scare|frighten
\u4E00\u9F50	y\u012B q\xED	6	d	at the same time|simultaneously
\u6D77\u62D4	h\u01CEi b\xE1	7	n	height above sea level|elevation
\u6E29\u5BA4	w\u0113n sh\xEC	7	n	greenhouse
\u679C\u5B9E	gu\u01D2 sh\xED	4	n	fruit|fruits|results|gains
\u8DDF\u524D	g\u0113n qi\xE1n	5	f	front|sb's presence|just before|at one's side|living with one
\u81EA\u8A00\u81EA\u8BED	z\xEC y\xE1n z\xEC y\u01D4	6	l	talk to oneself|think aloud|soliloquize
\u68C0\u5BDF	ji\u01CEn ch\xE1	7	b	inspect|prosecute|investigate
\u5C71\u5761	sh\u0101n p\u014D	6	n	hillside
\u65E5\u5386	r\xEC l\xEC	4	n	calendar
\u5BA0\u7231	ch\u01D2ng \xE0i	7	v	dote on sb
\u6447\u6643	y\xE1o hu\xE0ng	7	v	rock|shake|sway
\u5931\u660E	sh\u012B m\xEDng	7	v	lose one's eyesight|become blind|blindness
\u680F\u6746	l\xE1n g\u0101n	7	n	railing|banister
\u5174\u81F4	x\xECng zh\xEC	7	n	mood|spirits|interest
\u7D2F\u79EF	l\u011Bi j\u012B	7	v	accumulate
\u9759\u6B62	j\xECng zh\u01D0	7	v	still|immobile|static|stationary
\u62F4	shu\u0101n	7	v	tie up
\u62F1	g\u01D2ng	7	v	surround|arch|arched
\u5F80\u8FD4	w\u01CEng f\u01CEn	7	v	go back and forth|go to and fro|do a round trip
\u8367\u5149	y\xEDng gu\u0101ng	7	n	fluorescence|fluorescent
\u89C2\u6D4B	gu\u0101n c\xE8	7	vn	observe|survey|observation
\u516C\u5171\u6C7D\u8F66	g\u014Dng g\xF2ng q\xEC ch\u0113	2		bus
\u5992\u5FCC	d\xF9 j\xEC	7	v	be jealous of|be envious|envy
\u5230\u5934\u6765	d\xE0o t\xF3u l\xE1i	7	d	in the end|finally|as a result
\u7F15	l\u01DA	7	q	strand|thread|detailed|in detail
\u53D1\u5446	f\u0101 d\u0101i	6	v	stare blankly|be stunned|be lost in thought
\u81EA\u5351	z\xEC b\u0113i	7	a	have low self-esteem|abase oneself
\u8F93\u6DB2	sh\u016B y\xE8	7	v	intravenous infusion
\u8FDE\u540C	li\xE1n t\xF3ng	6	p	together with|along with
\u8BF4\u5230\u5E95	shu\u014D d\xE0o d\u01D0	7	l	in the final analysis|in the end
\u589E\u8FDB	z\u0113ng j\xECn	6	v	promote|enhance|further|advance
\u53EA\u987E	zh\u01D0 g\xF9	6	v	solely preoccupied|engrossed|focusing
\u53D1\u7535\u673A	f\u0101 di\xE0n j\u012B	7	n	electricity generator|dynamo
\u707E\u5BB3	z\u0101i h\xE0i	5	n	calamity|disaster
\u590F\u4EE4\u8425	xi\xE0 l\xECng y\xEDng	7	n	summer camp
\u4EF2\u88C1	zh\xF2ng c\xE1i	7	vn	arbitration
\u5708\u5957	qu\u0101n t\xE0o	7	n	trap|snare|trick
\u8BAE\u9898	y\xEC t\xED	6	n	topic of discussion|topic|subject|issue
\u89E6\u72AF	ch\xF9 f\xE0n	7	v	violate|offend
\u5E72\u65F1	g\u0101n h\xE0n	7	an	drought|arid|dry
\u6DF1\u8FDC	sh\u0113n yu\u01CEn	7	a	far-reaching|profound and long-lasting
\u832B\u7136	m\xE1ng r\xE1n	7	a	blankly|vacantly|at a loss
\u8EAB\u8EAF	sh\u0113n q\u016B	7	n	body
\u8FDE\u9501\u5E97	li\xE1n su\u01D2 di\xE0n	7	n	chain store
\u4FBF\u4E8E	bi\xE0n y\xFA	5	v	easy to|convenient for
\u7559\u604B	li\xFA li\xE0n	7	v	reluctant to leave|recall fondly
\u4E00\u4E3E\u4E00\u52A8	y\u012B j\u01D4 y\u012B d\xF2ng	7	l	every movement|each and every move
\u97F3\u91CF	y\u012Bn li\xE0ng	6	n	loudness|volume
\u7AED\u529B	ji\xE9 l\xEC	7	d	do one's utmost
\u78B0\u89C1	p\xE8ng ji\xE0n	2	v	run into|meet|bump into
\u4E3B\u5987	zh\u01D4 f\xF9	7	n	housewife|lady of the house|hostess
\u5B89\u68C0	\u0101n ji\u01CEn	6	n	do a security check
\u963B\u6320	z\u01D4 n\xE1o	7	v	thwart|obstruct
\u8FC4\u4ECA	q\xEC j\u012Bn	7	d	so far|date|until now
\u6309\u952E	\xE0n ji\xE0n	7	n	button or key|keystroke|press a button
\u5173\u5934	gu\u0101n t\xF3u	7	n	juncture|moment
\u4F34\u594F	b\xE0n z\xF2u	7	v	accompany
\u5931\u7075	sh\u012B l\xEDng	7	v	out of order|not working properly|failing
\u51DD\u89C6	n\xEDng sh\xEC	6	v	gaze at|fix one's eyes on
\u7968\u4EF7	pi\xE0o ji\xE0	3	n	ticket price|fare|admission fee
\u65E0\u8D56	w\xFA l\xE0i	6	n	hoodlum|rascal|rogue|rascally|scoundrelly
\u6728\u5076	m\xF9 \u01D2u	7	n	puppet
\u8BC9\u8BF4	s\xF9 shu\u014D	7	v	recount|tell of|relate|stand as testament to
\u6298\u53E0	zh\xE9 di\xE9	7	v	fold|collapsible|folding
\u91CD\u578B	zh\xF2ng x\xEDng	7	b	heavy|heavy duty|large caliber
\u79D8\u65B9	m\xEC f\u0101ng	7	n	secret recipe
\u5E1D\u56FD\u4E3B\u4E49	d\xEC gu\xF3 zh\u01D4 y\xEC	7	n	imperialism
\u8F7B\u800C\u6613\u4E3E	q\u012Bng \xE9r y\xEC j\u01D4	7	l	easy|with no difficulty
\u5730\u6BB5	d\xEC du\xE0n	7	n	section|district
\u5439\u725B	chu\u012B ni\xFA	7	v	talk big|shoot off one's mouth|chat
\u6380	xi\u0101n	7	v	lift|rock|convulse
\u76D7\u7248	d\xE0o b\u01CEn	6	vn	pirated|illegal
\u6708\u5E95	yu\xE8 d\u01D0	4	t	end of the month
\u813E	p\xED	7	n	spleen
\u987E\u53CA	g\xF9 j\xED	7	v	take into consideration|attend to
\u903C\u771F	b\u012B zh\u0113n	7	a	lifelike|true to life|distinctly|clearly
\u65E0\u507F	w\xFA ch\xE1ng	7	d	free|no charge|at no cost
\u4E16\u754C\u7EA7	sh\xEC ji\xE8 j\xED	7	b	world-class
\u5F53\u65E5	d\xE0ng r\xEC	7	t	that very day|same day|on that day
\u767D\u9152	b\xE1i ji\u01D4	5	n	baijiu
\u9075\u7167	z\u016Bn zh\xE0o	7	v	in accordance with|follow
\u82B1\u74E3	hu\u0101 b\xE0n	7	n	petal
\u6027\u60C5	x\xECng q\xEDng	7	n	nature|temperament
\u5B9A\u4EF7	d\xECng ji\xE0	6	v	set a price|fix a price
\u8C46\u5B50	d\xF2u zi	7	n	bean|pea
\u817A	xi\xE0n	7	n	gland
\u7F9E\u6127	xi\u016B ku\xEC	7	v	ashamed
\u8058\u7528	p\xECn y\xF2ng	7	v	employ|hire
\u7CBE\u54C1	j\u012Bng p\u01D0n	6	n	quality goods|premium product|fine work
\u5C0F\u770B	xi\u01CEo k\xE0n	7	v	look down on|underestimate
\u575A\u786C	ji\u0101n y\xECng	7	a	hard|solid
\u5185\u79D1	n\xE8i k\u0113	4	n	internal medicine|general medicine
\u5FEB\u6D3B	ku\xE0i huo	5	a	happy|cheerful
\u8D1F\u6709	f\xF9 y\u01D2u	7	v	be responsible for
\u6DF1\u539A	sh\u0113n h\xF2u	4	a	deep|profound
\u83AB\u8FC7\u4E8E	m\xF2 gu\xF2 y\xFA	7	v	nothing can surpass
\u8F7B\u89C6	q\u012Bng sh\xEC	5	v	contempt|contemptuous|despise|scorn|scornful
\u5F53\u4F17	d\u0101ng zh\xF2ng	7	d	in public|in front of everybody
\u597D\u610F	h\u01CEo y\xEC	7	n	good intention|kindness
\u6280\u827A	j\xEC y\xEC	7	n	skill|art
\u5149\u6CFD	gu\u0101ng z\xE9	7	n	luster|gloss
\u6F14\u7EC3	y\u01CEn li\xE0n	7	v	do a drill|practice|training|drill
\u4E13\u5356\u5E97	zhu\u0101n m\xE0i di\xE0n	7	n	specialty store
\u4E13\u79D1	zhu\u0101n k\u0113	6	n	specialized subject|branch|specialized training school
\u505C\u987F	t\xEDng d\xF9n	7	v	halt|break off|pause
\u821F	zh\u014Du	6	n	boat
\u5450\u558A	n\xE0 h\u01CEn	7	v	shout|rallying cry|cheering
\u76F8\u7EE7	xi\u0101ng j\xEC	7	d	in succession|following closely
\u53D1\u626C	f\u0101 y\xE1ng	7	v	develop|make full use of
\u7EB5\u5BB9	z\xF2ng r\xF3ng	7	v	indulge|connive at
\u5206\u5316	f\u0113n hu\xE0	7	v	split apart|differentiation
\u62D6\u7D2F	tu\u014D l\u011Bi	7	v	encumber|be a burden on|implicate
\u996E\u6C34	y\u01D0n shu\u01D0	7	n	drinking water
\u4E09\u660E\u6CBB	s\u0101n m\xEDng zh\xEC	6	n	sandwich
\u7B97\u8BA1	su\xE0n ji	7	v	reckon|calculate|plan|expect|scheme
\u679C\u771F	gu\u01D2 zh\u0113n	7	d	really|as expected|sure enough|if indeed|if it's really
\u97A0\u8EAC	j\u016B g\u014Dng	7	v	bow|bend down
\u5B55\u80B2	y\xF9n y\xF9	7	v	be pregnant|produce offspring|nurture|fig. replete with
\u9000\u5B66	tu\xEC xu\xE9	7	v	quit school
\u60A0\u95F2	y\u014Du xi\xE1n	7	a	leisurely|carefree|relaxed
\u6587\u827A	w\xE9n y\xEC	5	n	literature and art
\u4F9D\u6B21	y\u012B c\xEC	6	d	in order|in succession
\u4E13\u804C	zhu\u0101n zh\xED	7	b	special duty
\u666F\u70B9	j\u01D0ng di\u01CEn	6	n	tourist attraction|scenic spot
\u4E00\u5F8B	y\u012B l\u01DC	4	d	same|uniformly|all|without exception
\u7167\u8000	zh\xE0o y\xE0o	6	v	shine|illuminate
\u95F8	zh\xE1	7	n	gear|brake|sluice|lock
\u77E5\u8DB3	zh\u012B z\xFA	7	a	content with one's situation|know contentment
\u524D\u6CBF	qi\xE1n y\xE1n	7	s	front-line|forward position|outpost|extending ahead|frontier
\u5BA2\u673A	k\xE8 j\u012B	7	n	passenger plane
\u5BF9\u79F0	du\xEC ch\xE8n	7	a	symmetry|symmetrical
\u9002\u65F6	sh\xEC sh\xED	7	a	timely|apt to the occasion|in due course
\u5236\u7EA6	zh\xEC yu\u0113	5	vn	restrict|condition
\u52A0\u76DF	ji\u0101 m\xE9ng	6	v	align|join|participate
\u51F6\u731B	xi\u014Dng m\u011Bng	7	a	fierce|violent|ferocious
\u8FD9\u4F1A\u513F	zh\xE8 hu\xEC r	7	r	now|this moment|also pr
\u7559\u5FC3	li\xFA x\u012Bn	7	v	be careful|pay attention to
\u4F4E\u8C37	d\u012B g\u01D4	7	n	valley|trough|fig. low point|lowest ebb|nadir of one's fortunes
\u5916\u8C8C	w\xE0i m\xE0o	7	n	profile|appearance
\u5982\u5B9E	r\xFA sh\xED	7	d	as things really are|realistic
\u987F\u65F6	d\xF9n sh\xED	7	d	immediately|suddenly
\u964D\u4EF7	ji\xE0ng ji\xE0	4	v	cut the price|drive down the price|get cheaper
\u88C1\u5458	c\xE1i yu\xE1n	6	v	cut staff|lay off employees
\u7545\u901A	ch\xE0ng t\u014Dng	6	a	unimpeded|free-flowing|straight path|unclogged|move without obstruction
\u622A\u81F3	ji\xE9 zh\xEC	6	v	up to|by
\u516C\u5B89	g\u014Dng \u0101n	6	n	public security|public safety
\u5B57\u5178	z\xEC di\u01CEn	2	n	dictionary
\u5411\u7740	xi\xE0ng zhe	7	p	towards|facing|side with|favor
\u98CE\u8303	f\u0113ng f\xE0n	7	n	air|manner|model|paragon|demeanor
\u5F1F\u5B50	d\xEC z\u01D0	7	n	disciple|follower
\u55B7\u6CC9	p\u0113n qu\xE1n	7	n	fountain
\u65AD\u7EDD	du\xE0n ju\xE9	6	v	sever|break off
\u8D2F\u5F7B	gu\xE0n ch\xE8	7	v	implement|put into practice|carry out
\u66B4\u98CE\u96E8	b\xE0o f\u0113ng y\u01D4	6	n	rainstorm|storm|tempest
\u8C0B\u751F	m\xF3u sh\u0113ng	7	v	seek one's livelihood|work to support oneself|earn a living
\u7075\u654F	l\xEDng m\u01D0n	7	a	smart|clever|sensitive|keen|quick|sharp
\u6392\u7403	p\xE1i qi\xFA	2	n	volleyball
\u540D\u526F\u5176\u5B9E	m\xEDng f\xF9 q\xED sh\xED	7	v	aptly named|worthy of the name
\u843D\u4E0B	lu\xF2 xi\xE0	7	v	fall|drop|land
\u6BD4\u8D77	b\u01D0 q\u01D0	7	v	compared with
\u59A5\u5F53	tu\u01D2 dang	7	a	appropriate|proper|ready
\u79D1\u76EE	k\u0113 m\xF9	7	n	academic subject|field of study
\u88F8\u9732	lu\u01D2 l\xF9	7	v	naked|bare|uncovered|exposed
\u516C\u7EA6	g\u014Dng yu\u0113	7	n	convention
\u60AC\u6302	xu\xE1n gu\xE0	7	v	suspend|hang|suspension
\u5E72\u676F	g\u0101n b\u0113i	2	v	drink a toast|cheers|here's to you|bottoms up|lit. dry cup
\u62D6\u6B20	tu\u014D qi\xE0n	7	v	in arrears|behind in payments|default on one's debts
\u81EA\u53D1	z\xEC f\u0101	7	d	spontaneous
\u9AD8\u8D85	g\u0101o ch\u0101o	7	a	excellent|superlative
\u57AB\u5E95	di\xE0n d\u01D0	7	v	lay the foundation
\u6DA8\u4EF7	zh\u01CEng ji\xE0	5	v	appreciate|increase in price
\u6EDA\u52A8	g\u01D4n d\xF2ng	7	v	roll|in a loop|scroll|progressively expand|rumble
\u6C11\u7528	m\xEDn y\xF2ng	7	b	civilian use
\u6DF1\u6C89	sh\u0113n ch\xE9n	6	a	deep|profound|reserved|undemonstrative|low-pitched
\u6C11\u610F	m\xEDn y\xEC	6	n	public opinion|popular will|public will
\u62DB\u751F	zh\u0101o sh\u0113ng	5	vn	enroll new students|get students
\u60E8\u91CD	c\u01CEn zh\xF2ng	7	a	disastrous
\u5E72\u52B2	g\xE0n j\xECn	6	n	enthusiasm for doing sth
\u732E\u8840	xi\xE0n xu\xE8	7	v	donate blood
\u8BC6\u5B57	sh\xED z\xEC	6	v	learn to read
\u6263\u7559	k\xF2u li\xFA	7	v	detain|arrest|hold|confiscate
\u8D85\u6807	ch\u0101o bi\u0101o	7	v	cross the limit|excessive
\u514D\u9664	mi\u01CEn ch\xFA	7	v	prevent|avoid|excuse|exempt|relieve|remit
\u53CD\u9762	f\u01CEn mi\xE0n	7	n	reverse side|backside|other side|negative|bad
\u638C\u7BA1	zh\u01CEng gu\u01CEn	7	v	in charge of|control
\u8C03\u6599	ti\xE1o li\xE0o	7	n	condiment|seasoning|flavoring
\u6784\u60F3	g\xF2u xi\u01CEng	7	vn	conceive|concept
\u4E0B\u6E38	xi\xE0 y\xF3u	7	f	lower reaches|lower level|lower echelon|downstream
\u5FCC	j\xEC	7	v	be jealous of|fear|dread|scruple|avoid or abstain from|quit|give up sth
\u9001\u793C	s\xF2ng l\u01D0	6	v	give a present
\u901D\u4E16	sh\xEC sh\xEC	7	v	pass away|die
\u5BE1\u5987	gu\u01CE fu	7	n	widow
\u6C89\u7740	ch\xE9n zhu\xF3	7	a	steady|calm and collected|not nervous
\u6478\u7D22	m\u014D suo	7	v	feel about|grope about|fumble|do things slowly
\u6536\u4E70	sh\u014Du m\u01CEi	7	v	purchase|bribe
\u6B3E\u9879	ku\u01CEn xi\xE0ng	7	n	funds|sum of money
\u6253\u5B98\u53F8	d\u01CE gu\u0101n si	6	v	file a lawsuit|sue|dispute
\u80FD\u8010	n\xE9ng n\xE0i	7	n	ability|capability
\u597D\u4F3C	h\u01CEo s\xEC	6	v	seem|be like
\u901A\u901A	t\u014Dng t\u014Dng	7	d	all|entire|complete
\u5019\u9009	h\xF2u xu\u01CEn	6	b	candidate
\u98CE\u6CE2	f\u0113ng b\u014D	7	n	disturbance|crisis|disputes|restlessness
\u6837\u5F0F	y\xE0ng sh\xEC	5	n	type|style
\u8FC8\u8FDB	m\xE0i j\xECn	7	v	step in|stride forward|forge ahead
\u6765\u5386	l\xE1i l\xEC	7	n	history|antecedents|origin
\u4EC1\u6148	r\xE9n c\xED	7	a	benevolent|charitable|kind|kindly|kindness|merciful
\u5BFB\u89C5	x\xFAn m\xEC	7	v	look for
\u6CA1\u5B8C\u6CA1\u4E86	m\xE9i w\xE1n m\xE9i li\u01CEo	7	v	without end|incessantly|on and on
\u5E9F\u54C1	f\xE8i p\u01D0n	7	n	production rejects|seconds|scrap|discarded material
\u547C\u58F0	h\u016B sh\u0113ng	7	n	shout
\u663E\u51FA	xi\u01CEn ch\u016B	6	v	express|exhibit
\u710A	h\xE0n	7	v	weld|solder
\u51FA\u6E38	ch\u016B y\xF3u	7	v	go on a tour|have an outing
\u76D8\u65CB	p\xE1n xu\xE1n	6	v	spiral|circle|go around|hover|orbit
\u4EB2\u60C5	q\u012Bn q\xEDng	7	n	affection|family love
\u6742\u4EA4	z\xE1 ji\u0101o	7	vn	hybridize|crossbreed|promiscuity
\u5F00\u9500	k\u0101i xi\u0101o	7	n	pay|expenses|dismiss
\u62DB\u6570	zh\u0101o sh\xF9	7	n	move|gambit|trick|scheme|movement
\u6C89\u95F7	ch\xE9n m\xE8n	7	a	oppressive|heavy|depressed|not happy|dull|muffled
\u73A9\u610F\u513F	w\xE1n y\xEC r	7		toy|thing|trick
\u5FAE\u4E0D\u8DB3\u9053	w\u0113i b\xF9 z\xFA d\xE0o	7	v	negligible|insignificant
\u5FC3\u75BC	x\u012Bn t\xE9ng	5	v	love dearly|feel sorry for sb|regret|grudge|be distressed
\u94A6\u4F69	q\u012Bn p\xE8i	7	v	admire|look up to|respect sb greatly
\u6536\u652F	sh\u014Du zh\u012B	7	n	cash flow|financial balance|income and expenditure
\u516C\u76CA\u6027	g\u014Dngy\xEC x\xECng	7		public welfare
\u53CD\u5012	f\u01CEn d\xE0o	7	d	but on the contrary|but expectedly
\u4E66\u8BB0	sh\u016B ji	7	n	secretary|clerk|scribe
\u62E8\u6B3E	b\u014D ku\u01CEn	7	v	allocate funds|appropriation
\u6E17	sh\xE8n	7	v	seep|ooze|horrify
\u704C\u8F93	gu\xE0n sh\u016B	7	v	imbue with|inculcate|instill into|teach|impart
\u8638	zh\xE0n	7	v	dip in
\u7A81\u7834\u53E3	t\u016B p\xF2 k\u01D2u	7	n	breach|gap|breakthrough point
\u656C\u793C	j\xECng l\u01D0	7	v	salute
\u52A3\u8D28	li\xE8 zh\xEC	7	b	shoddy|of poor quality
\u900F\u6C14	t\xF2u q\xEC	7	v	flow freely|ventilate|breathe|divulge
\u5BB9\u8C8C	r\xF3ng m\xE0o	6	n	one's appearance|one's aspect|looks|features
\u4F4F\u5740	zh\xF9 zh\u01D0	7	n	address
\u6868	ji\u01CEng	6	n	oar|paddle
\u52A0\u5267	ji\u0101 j\xF9	7	v	intensify
\u9002\u5EA6	sh\xEC d\xF9	7	a	moderately|appropriate
\u957F\u8F88	zh\u01CEng b\xE8i	7	n	one's elders|older generation
\u5BB9\u8BB8	r\xF3ng x\u01D4	7	v	permit|allow
\u4E0D\u7531\u81EA\u4E3B	b\xF9 y\xF3u z\xEC zh\u01D4	7	l	can't help|involuntarily
\u75BC\u7231	t\xE9ng \xE0i	5	v	love dearly
\u9C9C\u6D3B	xi\u0101n hu\xF3	7	a	vivid|lively|live or fresh
\u5F97\u529B	d\xE9 l\xEC	7	a	able|capable|competent|efficient
\u8BFD\u8C24	f\u011Bi b\xE0ng	7	v	slander|libel
\u5148\u4F8B	xi\u0101n l\xEC	7	n	antecedent|precedent
\u76F4\u8FBE	zh\xED d\xE1	7	v	reach directly|direct|nonstop
\u62DB\u5F85\u4F1A	zh\u0101o d\xE0i hu\xEC	7	n	reception
\u8B6C\u5982	p\xEC r\xFA	7	v	for example|for instance|such as
\u5403\u4E8F	ch\u012B ku\u012B	7	a	suffer losses|come to grief|lose out|be at a disadvantage|unfortunately
\u8BBA\u8BC1	l\xF9n zh\xE8ng	7	v	prove a point|expound on|demonstrate or prove|proof
\u5FC3\u80F8	x\u012Bn xi\u014Dng	7	n	heart|mind|ambition|aspiration
\u957F\u5047	ch\xE1ng ji\xE0	6	n	long vacation
\u8F93\u8840	sh\u016B xu\xE8	7	v	transfuse blood|give aid and support
\u60BC\u5FF5	d\xE0o ni\xE0n	7	v	grieve
\u711A\u70E7	f\xE9n sh\u0101o	7	v	burn|set on fire
\u5BDF\u770B	ch\xE1 k\xE0n	7	v	watch|look carefully at
\u7EBD\u5E26	ni\u01D4 d\xE0i	7	n	tie|link|bond
\u7AED\u5C3D\u5168\u529B	ji\xE9 j\xECn qu\xE1n l\xEC	7	v	spare no effort|do one's utmost
\u5B9A\u65F6	d\xECng sh\xED	6	d	fix a time|fixed time|timed
\u6162\u6162\u6765	m\xE0n m\xE0n l\xE1i	7	v	take your time|take it easy
\u51CF\u538B	ji\u01CEn y\u0101	7	v	reduce pressure|relax
\u6446\u8BBE	b\u01CEi sh\xE8	7	n	set out|display|furnish|ornament|decorative item
\u9999\u6599	xi\u0101ng li\xE0o	7	n	spice|flavoring|condiment|perfume
\u5F97\u4F53	d\xE9 t\u01D0	7	a	appropriate to the occasion|fitting
\u5BF9\u5CD9	du\xEC zh\xEC	7	v	stand opposite|confront|confrontation
\u82D7\u6761	mi\xE1o tiao	7	a	slim|slender|graceful
\u81EA\u7ACB	z\xEC l\xEC	7	v	independent|self-reliant|self-sustaining|support oneself
\u9644\u4EF6	f\xF9 ji\xE0n	5	n	enclosure|attachment|appendix
\u6FD2\u4E34	b\u012Bn l\xEDn	6	v	on the edge of|on the verge of|close to
\u7F8E\u5316	m\u011Bi hu\xE0	7	v	make more beautiful|decorate|embellishment
\u6362\u6210	hu\xE0n ch\xE9ng	7	v	exchange for|replace with|convert into
\u5C4F\u969C	p\xEDng zh\xE0ng	6	n	barrier
\u7172	b\u0101o	7	v	pot|saucepan
\u5077\u61D2	t\u014Du l\u01CEn	7	v	goof off|be lazy
\u51FA\u8D44	ch\u016B z\u012B	7	v	fund|put money into sth|invest
\u539A\u9053	h\xF2u dao	7	a	kind and honest|generous|sincere
\u6A2A\u5411	h\xE9ng xi\xE0ng	7	n	horizontal|orthogonal|perpendicular|lateral|crosswise
\u633D	w\u01CEn	7	v	pull|draw|roll up|coil|carry on the arm|lament the dead|pull against|recover
\u5C31\u804C	ji\xF9 zh\xED	7	v	take office|assume a post
\u597D\u5728	h\u01CEo z\xE0i	7	d	luckily|fortunately
\u901A\u77E5\u4E66	t\u014Dng zh\u012B sh\u016B	4	n	written notice
\u5347\u503C	sh\u0113ng zh\xED	6	v	rise in value|appreciate
\u4E13\u957F	zhu\u0101n ch\xE1ng	7	n	specialty|special knowledge or ability
\u9AD8\u50B2	g\u0101o \xE0o	7	a	arrogant|haughty|proud
\u5316\u77F3	hu\xE0 sh\xED	5	n	fossil
\u5B75\u5316	f\u016B hu\xE0	7	v	breeding|incubate|innovation
\u5305\u624E	b\u0101o z\u0101	7	v	wrap up|pack|bind up
\u51B2\u6D6A	ch\u014Dng l\xE0ng	7	v	surf|surfing
\u80A9\u8D1F	ji\u0101n f\xF9	7	v	shoulder|bear|suffer
\u9648\u65E7	ch\xE9n ji\xF9	7	a	old-fashioned
\u56DE\u4FE1	hu\xED x\xECn	5	n	reply|write back|letter written in reply
\u7EAA\u5FF5\u7891	j\xEC ni\xE0n b\u0113i	7	n	monument
\u76F4\u89C6	zh\xED sh\xEC	7	v	look straight at
\u6536\u7559	sh\u014Du li\xFA	7	v	offer shelter
\u6709\u7684\u662F	y\u01D2u de sh\xEC	3	l	have plenty of|there's no lack of
\u4F20\u5355	chu\xE1n d\u0101n	6	n	leaflet|flier|pamphlet
\u5077\u770B	t\u014Du k\xE0n	7	v	peep|peek|steal a glance
\u5206\u5272	f\u0113n g\u0113	7	v	cut up|break up
\u803D\u6401	d\u0101n ge	7	v	tarry|delay|stop over
\u51B0\u5C71	b\u012Bng sh\u0101n	7	n	iceberg
\u70DF\u706B	y\u0101n hu\u01D2	7	n	smoke and fire|fireworks
\u5165\u95E8	r\xF9 m\xE9n	5	v	entrance door|enter a door|introduction
\u7535\u8F66	di\xE0n ch\u0113	6	n	trolleybus
\u76AE\u5305	p\xED b\u0101o	3	n	handbag|briefcase
\u5DE5\u4F5C\u65E5	g\u014Dng zu\xF2 r\xEC	5	n	workday|working day|weekday
\u6DD8\u6C14	t\xE1o q\xEC	7	a	naughty|mischievous
\u540E\u8FB9	h\xF2u bian	1	f	back|rear|last bit|behind|near the end|at the back|later|afterwards
\u6D77\u6D6A	h\u01CEi l\xE0ng	6	n	sea wave
\u8868\u8FF0	bi\u01CEo sh\xF9	7	vn	formulate|enunciation|explain sth precisely
\u56DE\u5473	hu\xED w\xE8i	7	v	aftertaste
\u96F6\u4E0B	l\xEDng xi\xE0	2	s	below zero
\u987A\u7545	sh\xF9n ch\xE0ng	7	a	smooth and unhindered|fluent
\u68CD\u5B50	g\xF9n zi	7	n	stick|rod
\u97F3\u50CF	y\u012Bn xi\xE0ng	6	n	audio and video|audiovisual
\u98DE\u901F	f\u0113i s\xF9	7	d	swift|rapidly
\u66D9\u5149	sh\u01D4 gu\u0101ng	7	n	dawn
\u5AC2\u5B50	s\u01CEo zi	7	n	older brother's wife|sister-in-law
\u80F8\u819B	xi\u014Dng t\xE1ng	7	n	chest
\u5E26\u961F	d\xE0i du\xEC	7	v	lead a team|lead a group|group leader|tour guide
\u8FDE\u7EED\u5267	li\xE1n x\xF9 j\xF9	3	n	serialized drama|dramatic series|show in parts
\u8840\u7F18	xu\xE8 yu\xE1n	7	n	bloodline
\u6F2B\u6E38	m\xE0n y\xF3u	7	vn	travel around|roam|roaming
\u772F	m\u012B	6	v	narrow one's eyes|squint|take a nap|blind|taiwan pr
\u60C5\u8C03	q\xEDng di\xE0o	7	n	sentiment|tone and mood|taste
\u8D34\u8FD1	ti\u0113 j\xECn	7	v	press close to|snuggle close|intimate
\u62FF\u51FA	n\xE1 ch\u016B	2	v	take out|put out|provide|put forward|come up with
\u7E41\u534E	f\xE1n hu\xE1	7	a	flourishing|bustling
\u4E0A\u9650	sh\xE0ng xi\xE0n	7	n	upper bound
\u717D\u52A8	sh\u0101n d\xF2ng	7	v	incite|instigate
\u8E0F\u5B9E	t\u0101 shi	6	a	firmly-based|steady|steadfast|have peace of mind|free from anxiety|taiwan pr
\u6444\u6C0F\u5EA6	Sh\xE8 sh\xEC d\xF9	7	q	\xB0c
\u5B66\u95EE	xu\xE9 w\xE8n	4	n	learning|knowledge
\u5D07\u5C1A	ch\xF3ng sh\xE0ng	7	v	hold up|hold in esteem|revere|advocate
\u8BB0\u6027	j\xEC xing	6	n	memory
\u590D\u5370	f\xF9 y\xECn	3	v	photocopy|duplicate a document
\u6E3A\u5C0F	mi\u01CEo xi\u01CEo	7	a	minute|tiny|negligible|insignificant
\u59D3\u6C0F	x\xECng sh\xEC	7	n	family name
\u51FA\u53F0	ch\u016B t\xE1i	6	v	officially launch|appear on stage|appear publicly|leave with a client
\u5B89\u9038	\u0101n y\xEC	7	a	easy and comfortable|easy
\u7272\u755C	sh\u0113ng ch\xF9	7	n	domesticated animals|livestock
\u5927\u5956\u8D5B	d\xE0 ji\u01CEng s\xE0i	5	n	grand prix
\u5F3A\u9879	qi\xE1ng xi\xE0ng	7	n	key strength|strong suit|specialty
\u5149\u76D8	gu\u0101ng p\xE1n	4	n	compact disc|dvd|cd-rom
\u897F\u8FB9	x\u012B bi\u0101n	1	f	west|west side|western part|west of
\u5927\u4F19\u513F	d\xE0 hu\u01D2 r	5	r	everybody|everyone
\u6726\u80E7	m\xE9ng l\xF3ng	7	a	dim|murky|indistinct
\u4E70\u4E0D\u8D77	m\u01CEi bu q\u01D0	7	v	cannot afford|can't afford buying
\u667E	li\xE0ng	6	v	dry in the air|cold-shoulder
\u7ACB\u8DB3	l\xEC z\xFA	7	v	stand|have a footing|be established|base oneself on
\u4E0A\u5934	sh\xE0ng tou	7	f	above|on top of|on the surface of|go to one's head
\u9489\u5B50	d\u012Bng zi	7	n	nail|snag|saboteur
\u4E2D\u9910	zh\u014Dng c\u0101n	2	n	lunch|chinese meal|chinese food
\u6253\u635E	d\u01CE l\u0101o	7	v	salvage|dredge|fish out
\u5B50\u5B59	z\u01D0 s\u016Bn	7	n	offspring|posterity
\u65BD\u538B	sh\u012B y\u0101	7	v	pressure
\u8981\u4E0D\u662F	y\xE0o bu sh\xEC	7	c	but for
\u7B80\u4ECB	ji\u01CEn ji\xE8	6	n	summary|brief introduction
\u4EA4\u63A5	ji\u0101o ji\u0113	7	vn	come into contact|meet|hand over to|take over from|associate with|have friendly relations with|have sexual intercourse
\u751F\u6D3B\u8D39	sh\u0113ng hu\xF3 f\xE8i	6	n	cost of living|living expenses|alimony
\u62CD\u620F	p\u0101i x\xEC	7	v	shoot a movie
\u8017\u8D39	h\xE0o f\xE8i	7	v	waste|spend|consume|squander
\u5927\u7B14	d\xE0b\u01D0	7	n	large
\u798F\u6C14	f\xFA qi	7	n	good fortune|blessing
\u53D7\u82E6	sh\xF2u k\u01D4	7	v	suffer hardship
\u660E\u5A9A	m\xEDng m\xE8i	7	a	bright and beautiful
\u5BB6\u653F	ji\u0101 zh\xE8ng	7	n	housekeeping
\u80E1\u95F9	h\xFA n\xE0o	7	v	make trouble
\u8DF5\u8E0F	ji\xE0n t\xE0	6	v	trample
\u7528\u610F	y\xF2ng y\xEC	7	n	intention|purpose
\u57CB\u85CF	m\xE1i c\xE1ng	7	v	bury|hide by burying|hidden
\u8FC1\u79FB	qi\u0101n y\xED	7	v	migrate|move
\u7A91	y\xE1o	7	g	kiln|oven|coal pit|cave dwelling|brothel
\u8DEF\u6BB5	l\xF9 du\xE0n	7	n	stretch of road
\u6D41\u5411	li\xFA xi\xE0ng	7	v	direction of a current|direction of flow|flow toward
\u4F30\u7B97	g\u016B su\xE0n	7	v	assessment|evaluation
\u6E05\u6F88	q\u012Bng ch\xE8	6	a	clear|limpid
\u5B98\u50DA	gu\u0101n li\xE1o	7	n	bureaucrat|bureaucracy|bureaucratic
\u708E\u75C7	y\xE1n zh\xE8ng	7	n	inflammation
\u5EA7\u8C08\u4F1A	zu\xF2 t\xE1n hu\xEC	6	n	conference|symposium|rap session
\u8D39\u52B2	f\xE8i j\xECn	7	a	require effort|strenuous
\u4E0A\u8FB9	sh\xE0ng bian	1	f	top|above|overhead|upwards|top margin|above-mentioned|those higher up
\u5149\u73AF	gu\u0101ng hu\xE1n	7	n	ring of light|halo|glory|splendor
\u4E0E\u5176	y\u01D4 q\xED	7	c	rather than
\u6CA1\u52B2	m\xE9i j\xECn	7	a	have no strength|feel weak|exhausted|feeling listless|boring|of no interest
\u642C\u8FC1	b\u0101n qi\u0101n	7	v	move|relocate|removal
\u501F\u9274	ji\xE8 ji\xE0n	6	v	draw on|learn from|lesson to be learned
\u82B1\u7EB9	hu\u0101 w\xE9n	7	n	decorative design
\u4E8F\u635F	ku\u012B s\u01D4n	7	v	deficit|loss
\u9ED1\u9A6C	h\u0113i m\u01CE	7	n	dark horse|fig. unexpected winner
\u5BFA\u5E99	s\xEC mi\xE0o	7	n	temple|monastery|shrine
\u5341\u5B57\u8DEF\u53E3	sh\xED z\xEC l\xF9 k\u01D2u	7	l	crossroads|intersection
\u65C5\u5E97	l\u01DA di\xE0n	6	n	inn|small hotel
\u60A3\u75C5	hu\xE0n b\xECng	7	v	fall ill
\u9AD8\u6602	g\u0101o \xE1ng	7	a	hold high|expensive|high
\u5176\u540E	q\xED h\xF2u	7	t	next|later|after that
\u65E0\u7406	w\xFA l\u01D0	7	a	irrational|unreasonable
\u708E\u70ED	y\xE1n r\xE8	7	a	blistering hot|sizzling hot
\u4FB5\u6743	q\u012Bn qu\xE1n	7	vn	infringe the rights of|violate|infringement
\u8FD1\u65E5	j\xECn r\xEC	6	t	past few days|recently|next few days
\u50CF\u6837	xi\xE0ng y\xE0ng	7	a	presentable|decent|up to par
\u5B57\u4F53	z\xEC t\u01D0	7	n	calligraphic style|typeface|font
\u94F8\u9020	zh\xF9 z\xE0o	7	v	cast
\u540E\u4EBA	h\xF2u r\xE9n	7	n	later generation
\u6674\u5929	q\xEDng ti\u0101n	2	n	clear sky|sunny day
\u5192\u72AF	m\xE0o f\xE0n	7	v	offend
\u8F6C\u4EA4	zhu\u01CEn ji\u0101o	7	v	pass on to sb
\u7531\u8877	y\xF3u zh\u014Dng	7	d	heartfelt|sincere|unfeigned
\u666E\u901A\u8BDD	p\u01D4 t\u014Dng hu\xE0	2	n	mandarin|putonghua|ordinary speech
\u5C31\u8BCA	ji\xF9 zh\u011Bn	7	v	see a doctor|seek medical advice
\u4E09\u7EF4	s\u0101n w\xE9i	7	mq	three-dimensional|3d
\u6D78\u6CE1	j\xECn p\xE0o	7	v	steep|soak|immerse
\u4E0B\u51B3\u5FC3	xi\xE0 ju\xE9 x\u012Bn	7	v	determine|resolve
\u52A8\u5F39	d\xF2ng tan	7	v	budge
\u81EA\u7136\u754C	z\xEC r\xE1n ji\xE8	7	n	nature|natural world
\u4EA4\u950B	ji\u0101o f\u0113ng	7	v	cross swords|have a confrontation
\u6070\u5230\u597D\u5904	qi\xE0 d\xE0o h\u01CEo ch\xF9	7	l	it's just perfect|it's just right
\u9057\u5740	y\xED zh\u01D0	7	n	ruins|historic relics
\u85CF\u533F	c\xE1ng n\xEC	7	v	cover up|conceal|go into hiding
\u65E0\u5173\u7D27\u8981	w\xFA gu\u0101n j\u01D0n y\xE0o	7	v	indifferent|insignificant
\u5176\u95F4	q\xED ji\u0101n	7	f	in between|within that interval|in the meantime
\u5C3A\u5EA6	ch\u01D0 d\xF9	7	n	scale|yardstick
\u68B3\u7406	sh\u016B l\u01D0	7	v	comb|fig. to sort out
\u6500\u5347	p\u0101n sh\u0113ng	7	v	clamber up|rise
\u5FC3\u5F97	x\u012Bn d\xE9	7	n	what one has learned|knowledge|insight|understanding|tips
\u9AD8\u989D	g\u0101o \xE9	7	b	high quota|large amount
\u8F6C\u8FBE	zhu\u01CEn d\xE1	7	v	pass on|convey|communicate
\u50F5\u5C40	ji\u0101ng j\xFA	7	n	impasse|deadlock
\u9ECF	ni\xE1n	7	a	sticky|glutinous|adhere|stick on|glue
\u5021\u5BFC	ch\xE0ng d\u01CEo	5	v	advocate|initiate|propose|be a proponent of
\u5B9A\u5411	d\xECng xi\xE0ng	7	d	orientate|directional|directed|orienteering
\u79C1\u7ACB	s\u012B l\xEC	7	b	private
\u5730\u540D	d\xEC m\xEDng	6	n	place name|toponym
\u56FA\u4F53	g\xF9 t\u01D0	5	n	solid
\u76F8\u5F53\u4E8E	xi\u0101ng d\u0101ng y\xFA	7	v	equivalent to
\u79C1\u8425	s\u012B y\xEDng	7	b	privately-owned|private
\u540A\u9500	di\xE0o xi\u0101o	7	v	suspend|revoke
\u904F\u5236	\xE8 zh\xEC	7	v	check|contain|hold back|keep within limits|constrain|restrain
\u8001\u4E61	l\u01CEo xi\u0101ng	6	n	fellow townsman|fellow villager
\u7A33\u56FA	w\u011Bn g\xF9	7	a	stable|steady|firm|stabilize
\u5C11\u6709	sh\u01CEo y\u01D2u	7	a	rare|infrequent
\u7D22\u53D6	su\u01D2 q\u01D4	7	v	ask|demand
\u4E3B\u4F53	zh\u01D4 t\u01D0	5	n	main part|bulk|body|subject|agent
\u5EF6\u7F13	y\xE1n hu\u01CEn	7	v	defer|postpone|put off|retard|slow sth down
\u606D\u7EF4	g\u014Dng wei	7	v	praise|speak highly of|compliment
\u8D22\u7ECF	c\xE1i j\u012Bng	7	n	finance and economics
\u8DEF\u706F	l\xF9 d\u0113ng	7	n	street lamp|street light
\u62A8\u51FB	p\u0113ng j\u012B	7	v	attack
\u5B9E\u7269	sh\xED w\xF9	7	n	material object|concrete object|original object|in kind|object for practical use|definite thing|reality|matter
\u8352	hu\u0101ng	7	g	desolate|shortage|scarce|out of practice|absurd|uncultivated|neglect
\u7785	ch\u01D2u	7	v	look at
\u6447\u7BEE	y\xE1o l\xE1n	7	n	cradle
\u65B0\u6B3E	x\u012Bn ku\u01CEn	7	b	new style|latest fashion|new model
\u6614\u65E5	x\u012B r\xEC	7	t	former days|in the past
\u5185\u5916	n\xE8i w\xE0i	6	f	inside and outside|domestic and foreign|approximately|about
\u56FE\u753B	t\xFA hu\xE0	3	n	drawing|picture
\u8C08\u5230	t\xE1n d\xE0o	7	v	refer to|speak about|talk about
\u5F53\u52A1\u4E4B\u6025	d\u0101ng w\xF9 zh\u012B j\xED	7	l	top priority job|matter of vital importance
\u8D3A\u5361	h\xE8 k\u01CE	5	n	greeting card|congratulation card
\u5165\u573A\u5238	r\xF9 ch\u01CEng qu\xE0n	7	n	admission ticket
\u7075\u901A	l\xEDng t\u014Dng	7	a	fast and abundant|clever|effective
\u53D7\u9A97	sh\xF2u pi\xE0n	7	v	be cheated|be taken in|be hoodwinked
\u6DAE	shu\xE0n	7	v	rinse|trick|fool sb
\u52FE\u7ED3	g\u014Du ji\xE9	7	v	collude with|collaborate with|gang up with
\u65F6\u8282	sh\xED ji\xE9	6	n	season|time
\u63E3	chu\u01CEi	7	v	estimate|guess|figure|surmise|put into|taiwan pr
\u5BAB\u5EF7	g\u014Dng t\xEDng	7	n	court
\u8F9E\u53BB	c\xED q\xF9	7	v	resign|quit
\u8BC4\u5B9A	p\xEDng d\xECng	7	v	evaluate|make one's judgment
\u826F\u6027	li\xE1ng x\xECng	7	b	positive|leading to good consequences|virtuous|benign
\u706B\u836F	hu\u01D2 y\xE0o	7	n	gunpowder
\u706B\u9505	hu\u01D2 gu\u014D	7	n	hotpot
\u56FE\u5F62	t\xFA x\xEDng	7	n	picture|figure|diagram|graph|depiction|graphical
\u4E3B\u9875	zh\u01D4 y\xE8	7	n	home page
\u4F5C\u5E9F	zu\xF2 f\xE8i	6	v	become invalid|cancel|delete|nullify
\u66F4\u8863\u5BA4	g\u0113ng y\u012B sh\xEC	7	n	change room|dressing room|locker room|toilet
\u623F\u4EF7	f\xE1ng ji\xE0	6	n	house price|cost of housing
\u4E66\u6CD5	sh\u016B f\u01CE	5	n	calligraphy|handwriting|penmanship
\u65B0\u623F	x\u012Bn f\xE1ng	7	n	brand new house|bridal chamber
\u627F\u8F7D	ch\xE9ng z\xE0i	7	v	bear the weight|sustain
\u529F\u7387	g\u014Dng l\u01DC	7	n	rate of work|power
\u56FD\u6709	gu\xF3 y\u01D2u	7	vn	nationalized|public|government owned|state-owned
\u78B0\u5DE7	p\xE8ng qi\u01CEo	7	d	by chance|by coincidence|happen to
\u5BFC\u5411	d\u01CEo xi\xE0ng	7	n	be oriented towards|orientation
\u6B20\u7F3A	qi\xE0n qu\u0113	7	v	be deficient in|lapse|deficiency
\u7329\u7329	x\u012Bng xing	7	n	orangutan
\u4EA4\u66FF	ji\u0101o t\xEC	7	v	replace|alternately|in turn
\u5A92\u4ECB	m\xE9i ji\xE8	6	n	intermediary|vehicle|vector|medium|media
\u628A\u620F	b\u01CE x\xEC	6	n	acrobatics|jugglery|trick|ploy
\u8FDF\u7591	ch\xED y\xED	7	a	hesitate
\u64AD\u79CD	b\u014D zh\xF2ng	6	v	grow from seed|plant by sowing seed|sow seeds
\u9C9C\u8273	xi\u0101n y\xE0n	5	a	bright-colored|gaily-colored
\u62A5\u520A	b\xE0o k\u0101n	6	n	newspapers and periodicals|press
\u7740\u91CD	zhu\xF3 zh\xF2ng	7	v	put emphasis on|stress
\u60CB\u60DC	w\u01CEn x\u012B	7	an	regret|feel sorry for sb
\u5916\u4EA4\u5B98	w\xE0i ji\u0101o gu\u0101n	4	n	diplomat
\u4EF7\u4F4D	ji\xE0 w\xE8i	7	n	price level
\u5168\u5E74	qu\xE1n ni\xE1n	2	n	whole year|all year long
\u7F20\u7ED5	ch\xE1n r\xE0o	6	v	twisting|twine|wind|pester|bother
\u6C47\u805A	hu\xEC j\xF9	7	v	convergence|come together
\u64B0\u5199	zhu\xE0n xi\u011B	7	v	write|compose
\u5BA3\u6CC4	xu\u0101n xi\xE8	7	v	drain|unburden oneself|divulge|leak a secret
\u4E0A\u5C97	sh\xE0ng g\u01CEng	7	v	take up one's post|go on duty|take up a job
\u770B\u4E0D\u8D77	k\xE0n bu q\u01D0	4	v	look down upon|despise
\u6559\u517B	ji\xE0o y\u01CEng	7	n	educate|bring up|nurture|upbringing|breeding|culture
\u900F\u652F	t\xF2u zh\u012B	7	v	overdraw|take out an overdraft|overdraft|overspend|exhaust
\u9020\u53CD	z\xE0o f\u01CEn	6	v	rebel|revolt
\u6742\u6280	z\xE1 j\xEC	7	n	acrobatics
\u79C3	t\u016B	7	a	bald|blunt
\u540C\u5E74	t\xF3ng ni\xE1n	7	d	same year
\u5C55\u89C8\u4F1A	zh\u01CEn l\u01CEn hu\xEC	7	n	exhibition|show
\u4FEE\u8BA2	xi\u016B d\xECng	7	v	revise
\u6DB2\u6676	y\xE8 j\u012Bng	7	n	liquid crystal
\u6328\u6253	\xE1i d\u01CE	6	v	take a beating|get thrashed|come under attack
\u54CD\u4EAE	xi\u01CEng li\xE0ng	7	a	loud and clear|resounding
\u62DB\u624B	zh\u0101o sh\u01D2u	5	v	wave|beckon
\u9644\u5E26	f\xF9 d\xE0i	7	v	supplementary|incidentally|in parentheses|by chance|in passing|additionally|secondary|subsidiary
\u5480\u56BC	j\u01D4 ju\xE9	6	v	chew|think over
\u571F\u532A	t\u01D4 f\u011Bi	7	n	bandit
\u53EA\u5F97	zh\u01D0 d\xE9	6	d	be obliged to
\u5F00\u53D1\u5546	k\u0101i f\u0101 sh\u0101ng	7	n	developer (of real estate|commercial product etc)
\u66F4\u6B63	g\u0113ng zh\xE8ng	6	v	correct|make a correction
\u4F18\u5316	y\u014Du hu\xE0	7	v	optimize
\u98CE\u6C34	f\u0113ng shu\u01D0	7	n	feng shui|geomancy
\u78E8\u96BE	m\xF3 n\xE0n	7	n	torment|trial|tribulation|cross|well-tried
\u5E78\u5B58	x\xECng c\xFAn	7	v	survive
\u5E84\u7A3C	zhu\u0101ng jia	7	n	farm crop
\u4E43\u81F3	n\u01CEi zh\xEC	7	c	and even
\u4E5E\u8BA8	q\u01D0 t\u01CEo	7	v	beg|go begging
\u5267\u56E2	j\xF9 tu\xE1n	7	n	theatrical troupe
\u8038	s\u01D2ng	6	g	excite|raise up|shrug|high|lofty|towering
\u8F6C\u6298	zhu\u01CEn zh\xE9	7	vn	turnaround|turn in the conversation
\u6E05\u6D01\u5DE5	q\u012Bng ji\xE9 g\u014Dng	6	n	cleaner|janitor|garbage collector
\u65B0\u9896	x\u012Bn y\u01D0ng	7	a	lit. new bud|fig. new and original
\u8DE8\u56FD	ku\xE0 gu\xF3	7	b	transnational|multinational
\u5C71\u8DEF	sh\u0101n l\xF9	7	n	mountain road
\u603B\u548C	z\u01D2ng h\xE9	6	n	sum
\u7AE0\u7A0B	zh\u0101ng ch\xE9ng	6	n	rules|regulations|constitution|statute|articles of association|articles of incorporation|charter|by-laws
\u4F20\u627F	chu\xE1n ch\xE9ng	7	v	pass on|passed on|continued tradition|inheritance
\u52B3\u7D2F	l\xE1o l\xE8i	7	a	tired|exhausted|worn out|toil
\u5211\u6CD5	x\xEDng f\u01CE	7	n	criminal law
\u7701\u94B1	sh\u011Bng qi\xE1n	6	a	save money
\u53E3\u5B50	k\u01D2u zi	7	n	hole|opening|cut|gap|gash|my husband or wife|precedent
\u4F53\u8D28	t\u01D0 zh\xEC	7	n	constitution
\u5C0F\u4E8E	xi\u01CEo y\xFA	6	v	less than, <
\u752D	b\xE9ng	6	v	please don't|very
\u57F9\u8BAD\u73ED	p\xE9i x\xF9n b\u0101n	4	n	training class
\u7AF9\u5B50	zh\xFA zi	5	n	bamboo
\u7B97\u6570	su\xE0n sh\xF9	6	v	count numbers|keep to one's word|hold|count
\u963B\u62E6	z\u01D4 l\xE1n	7	v	stop|obstruct
\u4E1B	c\xF3ng	6	g	cluster|collection|collection of books|thicket
\u53D6\u7B11	q\u01D4 xi\xE0o	7	v	tease|make fun of
\u5B50\u5F1F	z\u01D0 d\xEC	7	n	child|younger generation
\u591A\u5A92\u4F53	du\u014D m\xE9i t\u01D0	6	n	multimedia
\u4E30\u5BCC\u591A\u5F69	f\u0113ng f\xF9 du\u014D c\u01CEi	7	v	richly colorful
\u52A8\u8361	d\xF2ng d\xE0ng	7	a	unrest|turmoil|upheaval|commotion
\u55DC\u597D	sh\xEC h\xE0o	7	n	hobby|indulgence|habit|addiction
\u7A3F\u5B50	g\u01CEo zi	6	n	draft of a document|script|manuscript|mental plan|precedent
\u6CBF\u9014	y\xE1n t\xFA	7	d	by the wayside
\u8165	x\u012Bng	7	a	fishy
\u5916\u6C47	w\xE0i hu\xEC	4	n	foreign exchange
\u91CD\u64AD	ch\xF3ng b\u014D	7	v	replay|rerun|reseed|oversow
\u6458\u8981	zh\u0101i y\xE0o	6	n	summary|abstract
\u5524\u8D77	hu\xE0n q\u01D0	7	v	waken|rouse|evoke
\u548C\u7766	h\xE9 m\xF9	7	a	peaceful relations|harmonious
\u5929\u4E3B\u6559	Ti\u0101n zh\u01D4 ji\xE0o	7	nz	catholicism
\u6BC5\u529B	y\xEC l\xEC	7	n	perseverance|willpower
\u53BB\u5904	q\xF9 ch\xF9	7	n	place|destination
\u614C\u4E71	hu\u0101ng lu\xE0n	7	a	frenetic|hurried
\u7231\u6234	\xE0i d\xE0i	6	vn	love and respect
\u529F\u529B	g\u014Dng l\xEC	7	n	merit|efficacy|competence|skill|power
\u6253\u5370\u673A	d\u01CE y\xECn j\u012B	6	n	printer
\u957F\u5904	ch\xE1ng ch\xF9	3	n	good aspects|strong points
\u4ED3\u4FC3	c\u0101ng c\xF9	6	a	all of a sudden|hurriedly
\u9738\u9053	b\xE0 d\xE0o	6	a	way of the hegemon|despotic rule|rule by might|overbearing|tyranny|strong|potent
\u738B\u540E	w\xE1ng h\xF2u	6	n	queen
\u8BDA\u631A	ch\xE9ng zh\xEC	7	a	sincere|cordial
\u7167\u5E38	zh\xE0o ch\xE1ng	7	v	as usual
\u7C97\u9C81	c\u016B l\u01D4	7	a	coarse|crude|boorish
\u8C61\u68CB	xi\xE0ng q\xED	5	n	chinese chess
\u74F7	c\xED	7	g	chinaware|porcelain|china
\u5347\u6E29	sh\u0113ng w\u0113n	7	v	become hot|temperature rise|intensify|hot up|escalate|get a boost
\u5806\u79EF	du\u012B j\u012B	6	v	pile up|heap|accumulation
\u5DE5\u5546	g\u014Dng sh\u0101ng	6	n	industry and commerce
\u5976\u7C89	n\u01CEi f\u011Bn	6	n	powdered milk
\u614C\u5F20	hu\u0101ng zh\u0101ng	7	a	flustered|agitated
\u81F4\u5BCC	zh\xEC f\xF9	7	v	become rich
\u65E0\u8BDD\u53EF\u8BF4	w\xFA hu\xE0 k\u011B shu\u014D	7	v	have nothing to say
\u4E0D\u8D77\u773C	b\xF9 q\u01D0 y\u01CEn	7	a	unremarkable
\u56FD\u7C4D	gu\xF3 j\xED	5	n	nationality
\u5DE5\u4F5C\u91CF	g\u014Dng zu\xF2 li\xE0ng	7	n	workload|volume of work
\u51D1\u5408	c\xF2u he	7	v	bring together|just get by|improvise|passable|not too bad
\u7834\u65E7	p\xF2 ji\xF9	7	a	shabby
\u9876\u591A	d\u01D0ng du\u014D	7	d	at most|at best
\u5370\u7AE0	y\xECn zh\u0101ng	7	n	seal|signet|chop|stamp
\u7EFF\u706F	l\u01DC d\u0113ng	7	n	green light|permission to proceed
\u627F\u5305	ch\xE9ng b\u0101o	7	v	contract|undertake
\u804C\u80FD	zh\xED n\xE9ng	5	n	function|role
\u6C14\u6982	q\xEC g\xE0i	6	n	lofty quality|mettle|spirit
\u6CE2\u6D6A	b\u014D l\xE0ng	6	n	wave
\u534A\u8DEF	b\xE0n l\xF9	7	n	halfway|midway|on the way
\u5B9A\u91D1	d\xECng j\u012Bn	7	n	down payment|advance payment
\u81EA\u5B66	z\xEC xu\xE9	6	v	self-study|study on one's own
\u63D0\u9632	d\u012B fang	7	v	guard against|be vigilant|watch you don't|taiwan pr
\u9ED1\u624B	h\u0113i sh\u01D2u	7	n	hidden hand|mechanic|blue-collar worker|manual laborer
\u4FB5\u5360	q\u012Bn zh\xE0n	7	v	invade and occupy
\u89C2\u6469	gu\u0101n m\xF3	7	v	observe and emulate|study
\u8FC7\u9053	gu\xF2 d\xE0o	7	n	passageway|corridor|aisle
\u76F8\u901A	xi\u0101ng t\u014Dng	7	v	interlinked|connected|communicating|in communication|accommodating
\u5F97\u5F53	d\xE9 d\xE0ng	7	a	appropriate|suitable
\u504F\u8FDC	pi\u0101n yu\u01CEn	7	a	remote|far from civilization
\u5FD9\u6D3B	m\xE1ng huo	7	v	be really busy|pressing business
\u4E00\u5929\u5230\u665A	y\u012B ti\u0101n d\xE0o w\u01CEn	7	l	all day long|whole day
\u4FEE\u8F66	xi\u016B ch\u0113	6	v	repair a bike
\u5E26\u8DEF	d\xE0i l\xF9	7	v	lead the way|guide|show the way|instruct
\u7CBE\u7EC6	j\u012Bng x\xEC	7	a	fine|meticulous|careful
\u722C\u5C71	p\xE1 sh\u0101n	2	v	climb a mountain|mountaineer|hiking|mountaineering
\u884C\u5BB6	h\xE1ng ji\u0101	7	n	connoisseur|expert|veteran
\u58A8\u6C34	m\xF2 shu\u01D0	6	n	ink
\u683C\u5C40	g\xE9 j\xFA	7	n	structure|pattern|layout
\u6674\u6717	q\xEDng l\u01CEng	5	a	sunny and cloudless
\u597D\u5FC3\u4EBA	h\u01CEo x\u012Bn r\xE9n	7	n	kindhearted person|good samaritan
\u7236\u5973	f\xF9 n\u01DA	6	n	father and daughter
\u90A3\u4F1A\u513F	n\xE0 hu\xEC r	2	r	at that time|also pr
\u54BD\u5589	y\u0101n h\xF3u	7	n	throat
\u656C\u7231	j\xECng \xE0i	7	v	respect and love|hold in high esteem
\u770B\u62A4	k\u0101n h\xF9	7	v	nurse|look after|watch over|hospital nurse
\u9ED1\u677F	h\u0113i b\u01CEn	2	n	blackboard
\u8F6E\u5B50	l\xFAn zi	4	n	wheel|falun gong practitioner
\u70B9\u7F00	di\u01CEn zhu\xEC	7	v	decorate|adorn|sprinkled|studded|only for show
\u793C\u5802	l\u01D0 t\xE1ng	6	n	assembly hall|auditorium
\u7A7A\u95F2	k\xF2ng xi\xE1n	5	n	idle|free time|leisure|unused
\u4F5C\u7269	zu\xF2 w\xF9	7	n	crop
\u62A0	k\u014Du	7	v	dig out|pick out|carve|cut|study meticulously|lift one's clothes|stingy|miserly
\u5408\u4E4E	h\xE9 h\u016B	7	v	accord with|conform to
\u89C9\u9192	ju\xE9 x\u01D0ng	7	v	awaken|come to realize|awakened to the truth|truth dawns upon one|become aware
\u5BB6\u79BD	ji\u0101 q\xEDn	7	n	poultry|domestic fowl
\u6C7D\u6C34	q\xEC shu\u01D0	4	n	soda pop|carbonated soft drink
\u5CB3\u7236	yu\xE8 f\xF9	7	n	wife's father, father-in-law
\u9009\u7528	xu\u01CEn y\xF2ng	7	v	choose for some purpose|select and use
\u52A8\u8EAB	d\xF2ng sh\u0113n	7	v	go on a journey|leave
\u7763\u4FC3	d\u016B c\xF9	7	v	urge on
\u6EDE\u7559	zh\xEC li\xFA	7	v	remain in|be stranded|remain|linger
\u7EFF\u8336	l\u01DC ch\xE1	3	n	green tea
\u9893\u5E9F	tu\xED f\xE8i	7	a	decadent|dispirited|depressed|dejected
\u65F6\u800C	sh\xED \xE9r	6	d	occasionally|from time to time
\u76DB\u5F00	sh\xE8ng k\u0101i	7	v	blooming|in full flower
\u67F1\u5B50	zh\xF9 zi	6	n	pillar
\u5468\u5BC6	zh\u014Du m\xEC	7	a	careful|thorough|meticulous|dense|impenetrable
\u5C81\u6570	su\xEC shu	6	n	age
\u5077\u7AA5	t\u014Du ku\u012B	7	v	peep|peek|act as voyeur
\u90CA\u5916	ji\u0101o w\xE0i	7	s	outskirts
\u673A\u667A	j\u012B zh\xEC	7	a	quick-witted|resourceful
\u519C\u4F5C\u7269	n\xF3ng zu\xF2 w\xF9	7	n	crops
\u5FC5\u4E0D\u53EF\u5C11	b\xEC b\xF9 k\u011B sh\u01CEo	7	v	absolutely necessary|indispensable|essential
\u65B0\u5F0F	x\u012Bn sh\xEC	7	a	new style|latest type
\u5018\u82E5	t\u01CEng ru\xF2	7	c	if|supposing|in case
\u70DF\u56F1	y\u0101n c\u014Dng	7	n	chimney
\u6E7F\u5EA6	sh\u012B d\xF9	7	n	humidity level
\u7D20\u98DF	s\xF9 sh\xED	7	n	vegetarian food|eat a vegetarian diet
\u6307\u5934	zh\u01D0 tou	6	n	finger|toe
\u62A5\u5E9F	b\xE0o f\xE8i	7	v	scrap|dispose of
\u8BD5\u70B9	sh\xEC di\u01CEn	6	n	test point|carry out trial|pilot scheme
\u7EBA\u7EC7	f\u01CEng zh\u012B	7	vn	spinning and weaving
\u4E11\u6076	ch\u01D2u \xE8	7	a	ugly|repulsive
\u7559\u5B66	li\xFA xu\xE9	3	v	study abroad
\u95F9\u4E8B	n\xE0o sh\xEC	7	v	cause trouble|create a disturbance
\u5E74\u85AA	ni\xE1n x\u012Bn	7	n	annual salary
\u68AF\u5B50	t\u012B zi	7	n	ladder|stepladder
\u8BB2\u8BFE	ji\u01CEng k\xE8	6	v	teach|lecture
\u5267\u76EE	j\xF9 m\xF9	7	n	theatrical piece|repertoire
\u65F6\u5DEE	sh\xED ch\u0101	6	n	time difference|time lag|jet lag
\u5B66\u5206	xu\xE9 f\u0113n	4	n	course credit
\u5F80\u5E74	w\u01CEng ni\xE1n	6	t	in former years|in previous years
\u5BB6\u7528	ji\u0101 y\xF2ng	7	b	home-use|domestic|family expenses|housekeeping money
\u7EAA\u5FF5\u9986	j\xEC ni\xE0n gu\u01CEn	7	n	memorial hall|commemorative museum
\u52FA\u5B50	sh\xE1o zi	5	n	scoop|ladle
\u51C6\u8BB8	zh\u01D4n x\u01D4	7	v	allow|grant|permit
\u76D6\u5B50	g\xE0i zi	7	n	cover|lid|shell
\u65F6\u65F6	sh\xED sh\xED	6	d	often|constantly
\u770B\u7BA1	k\u0101n gu\u01CEn	6	v	look after
\u8282\u80FD	ji\xE9 n\xE9ng	6	vn	save energy|energy-saving
\u6253\u8F66	d\u01CE ch\u0113	1	v	take a taxi|hitch a lift
\u7B80\u964B	ji\u01CEn l\xF2u	7	a	simple and crude
\u91CD\u53E0	ch\xF3ng di\xE9	7	v	overlap|superimpose|telescope|run together|duplicate|one over another|superposition|redundancy
\u53EA\u7BA1	zh\u01D0 gu\u01CEn	6	d	just|simply|by all means|please feel free|do not hesitate
\u538B\u5012	y\u0101 d\u01CEo	7	v	overwhelm|overpower|overwhelming
\u66F0	yu\u0113	7	g	speak|say
\u5ACC\u5F03	xi\xE1n q\xEC	7	v	regard with disdain|shun
\u4FBF\u6377	bi\xE0n ji\xE9	7	a	convenient and fast
\u57FA\u5C42	j\u012B c\xE9ng	7	n	basic level|grassroots unit|basement layer
\u683D\u57F9	z\u0101i p\xE9i	7	v	grow|cultivate|train|educate|patronize
\u704C\u6E89	gu\xE0n g\xE0i	7	vn	irrigate
\u5F52\u7ED3	gu\u012B ji\xE9	7	v	sum up|conclude|put in a nutshell|conclusion|end
\u5E73\u65E5	p\xEDng r\xEC	7	t	ordinary day|everyday|ordinarily|usually
\u80FD\u5E72	n\xE9ng g\xE0n	4	a	capable|competent
\u53C2\u89C1	c\u0101n ji\xE0n	7	v	refer to|compare|pay respect to
\u51FA\u6C57	ch\u016B h\xE0n	5		perspire|sweat
\u5411\u5BFC	xi\xE0ng d\u01CEo	5	n	guide
\u65E0\u5BB6\u53EF\u5F52	w\xFA ji\u0101 k\u011B gu\u012B	7	v	homeless
\u5916\u5356	w\xE0i m\xE0i	2		takeout
\u9524\u5B50	chu\xED zi	7	n	hammer
\u6577\u884D	f\u016B y\u01CEn	6	v	elaborate|expound|perfunctory|skimp|botch
\u6073\u6C42	k\u011Bn qi\xFA	7	v	beg|beseech|entreat|entreaty
\u6279\u53D1	p\u012B f\u0101	7	vn	wholesale|bulk trade|distribution
\u53EF\u8D35	k\u011B gu\xEC	7	a	be treasured|praiseworthy
\u52E4\u52B3	q\xEDn l\xE1o	7	a	hardworking|industrious|diligent
\u677E\u5F1B	s\u014Dng ch\xED	7	a	relax|relaxed|limp|lax
\u8DEF\u9014	l\xF9 t\xFA	7	n	road|path
\u8FD0\u7B97	y\xF9n su\xE0n	6	vn	perform calculations|operation
\u5F20\u8D34	zh\u0101ng ti\u0113	7	v	post|advertise
\u6E7F\u6DA6	sh\u012B r\xF9n	7	a	moist
\u5916\u4F01	w\xE0i q\u01D0	7		foreign enterprise
\u81F4\u8F9E	zh\xEC c\xED	7	v	make a speech|address
\u6587\u76F2	w\xE9n m\xE1ng	7	n	illiterate
\u66F4\u662F	g\xE8ng sh\xEC	6	d	even more
\u7528\u4EBA	y\xF2ng r\xE9n	7	vn	servant|manage people
\u74E6\u89E3	w\u01CE ji\u011B	6	v	collapse|disintegrate|crumble|disrupt|break up
\u8150\u673D	f\u01D4 xi\u01D4	7	a	rotten|decayed|decadent|degenerate
\u6DF1\u4FE1	sh\u0113n x\xECn	7	v	believe firmly
\u636E\u6B64	j\xF9 c\u01D0	7	d	according to this
\u5384\u8FD0	\xE8 y\xF9n	7	n	bad luck|misfortune|adversity
\u591A\u5143\u5316	du\u014D yu\xE1n hu\xE0	6	vn	diversification|pluralism|diversify
\u8BEF\u5DEE	w\xF9 ch\u0101	7	n	difference|error|inaccuracy
\u98CE\u4FD7	f\u0113ng s\xFA	4	n	social custom
\u540E\u9057\u75C7	h\xF2u y\xED zh\xE8ng	7	n	sequelae|residual effects|repercussions|aftermath
\u529B\u6C42	l\xEC qi\xFA	7	v	make every effort to
\u63A5\u529B	ji\u0113 l\xEC	7	vn	relay
\u5FE0\u5FC3	zh\u014Dng x\u012Bn	6	n	good faith|devotion|loyalty|dedication
\u6D88\u9063	xi\u0101o qi\u01CEn	7	v	while the time away|amusement|pastime|recreation|make sport of
\u542B\u7CCA	h\xE1n hu	7	a	ambiguous|vague|careless|perfunctory
\u60C5\u8C0A	q\xEDng y\xEC	7	n	friendship|camaraderie
\u9020\u5047	z\xE0o ji\u01CE	7	v	counterfeit
\u8C0E\u8BDD	hu\u01CEng hu\xE0	7	n	lie
\u865A\u5E7B	x\u016B hu\xE0n	7	a	imaginary|illusory
\u6CFB	xi\xE8	7	v	flow out swiftly|flood|torrent|diarrhea|laxative
\u4F1A\u8BCA	hu\xEC zh\u011Bn	7	v	consultation|meet for diagnosis|consultation of different specialists
\u6500\u767B	p\u0101n d\u0113ng	6	v	climb|pull oneself up|clamber|scale
\u6CBC\u6CFD	zh\u01CEo z\xE9	7	n	marsh|swamp|wetlands|glade
\u8BF1\u53D1	y\xF2u f\u0101	7	v	induce|cause|elicit|trigger
\u6CB9\u70B8	y\xF3u zh\xE1	5		deep fry
\u6B6A\u66F2	w\u0101i q\u016B	7	v	distort|misrepresent
\u98A0\u7C38	di\u0101n b\u01D2	6	v	be jolted around|undergo a rough experience
\u751F\u5E73	sh\u0113ng p\xEDng	7	n	life|in one's entire life
\u53E3\u611F	k\u01D2u g\u01CEn	7	n	mouthfeel|texture
\u77E5\u8BC6\u5206\u5B50	zh\u012B shi f\xE8n z\u01D0	7	n	intellectual|intelligentsia|learned person
\u5FF5\u4E66	ni\xE0n sh\u016B	7	v	read|study
\u516C\u9E21	g\u014Dng j\u012B	6	n	cock|rooster
\u7591\u70B9	y\xED di\u01CEn	7	n	doubtful point
\u7A81\u5982\u5176\u6765	t\u016B r\xFA q\xED l\xE1i	7	l	arise abruptly|arrive suddenly|happening suddenly
\u55C5\u89C9	xi\xF9 ju\xE9	7	n	sense of smell
\u56FA\u7136	g\xF9 r\xE1n	7	c	admittedly
\u5B89\u7720\u836F	\u0101n mi\xE1n y\xE0o	7	n	sleeping pill
\u5343\u65B9\u767E\u8BA1	qi\u0101n f\u0101ng b\u01CEi j\xEC	7	l	lit. thousand ways|hundred plans|by every possible means
\u62DB\u6536	zh\u0101o sh\u014Du	7	v	hire|recruit
\u63A5\u73ED\u4EBA	ji\u0113 b\u0101n r\xE9n	7	n	successor
\u8FDE\u591C	li\xE1n y\xE8	7	d	that very night|through the night
\u62D0\u6756	gu\u01CEi zh\xE0ng	7	n	crutches|crutch|walking stick
\u4EE5\u81F3	y\u01D0 zh\xEC	6	cc	down to|up to
\u519B\u8230	j\u016Bn ji\xE0n	6	n	warship|military naval vessel
\u5E7B\u5F71	hu\xE0n y\u01D0ng	7	n	phantom|mirage
\u9192\u609F	x\u01D0ng w\xF9	7	v	come to oneself|come to realize|wake up to reality
\u534F\u8BAE\u4E66	xi\xE9 y\xEC sh\u016B	5	n	contract|protocol
\u6B21\u65E5	c\xEC r\xEC	7	t	next day|morrow
\u80F6\u5E26	ji\u0101o d\xE0i	5	n	adhesive tape|magnetic tape
\u843D\u5B9E	lu\xF2 sh\xED	5	v	practical|workable|implement|carry out|decide
\u6446\u52A8	b\u01CEi d\xF2ng	4	v	sway|swing|move back and forth|oscillate
\u5B9E\u51B5	sh\xED ku\xE0ng	7	n	live|what is actually happening|scene|real situation
\u7981\u4E0D\u4F4F	j\u012Bn bu zh\xF9	7	v	can't help it|can't bear it
\u7530\u91CE	ti\xE1n y\u011B	5	n	field|open land
\u63A5\u9001	ji\u0113 s\xF2ng	7	v	ferry back and forth
\u51C4\u51C9	q\u012B li\xE1ng	7	a	mournful|miserable|desolate
\u6467\u6B8B	cu\u012B c\xE1n	6	v	ravage|ruin
\u6C47\u96C6	hu\xEC j\xED	7	v	collect|compile|converge
\u62A2\u593A	qi\u01CEng du\xF3	7	v	plunder|pillage|forcibly take
\u65E8\u5728	zh\u01D0 z\xE0i	7	v	have as its purpose|be intended to|aim to
\u754C\u5B9A	ji\xE8 d\xECng	7	v	definition|delimit
\u51FA\u53D1\u70B9	ch\u016B f\u0101 di\u01CEn	7	n	starting point|basis|motive
\u87BA\u4E1D	lu\xF3 s\u012B	7	n	screw
\u5E73\u65B9\u7C73	p\xEDng f\u0101ng m\u01D0	6	q	square meter
\u7089\u5B50	l\xFA zi	7	n	stove|oven|furnace
\u65B0\u9648\u4EE3\u8C22	x\u012Bn ch\xE9n d\xE0i xi\xE8	7	v	metabolism|new replaces the old
\u529B\u4E89	l\xEC zh\u0113ng	7	v	work hard for|do all one can|contend strongly
\u679C\u56ED	gu\u01D2 yu\xE1n	7	n	orchard
\u82F1\u660E	y\u012Bng m\xEDng	6	a	wise|brilliant
\u5B9E\u8BDD\u5B9E\u8BF4	sh\xED hu\xE0 sh\xED shu\u014D	7	v	tell the truth
\u7C7B\u522B	l\xE8i bi\xE9	7	n	classification|category
\u5404\u5F0F\u5404\u6837	g\xE8 sh\xEC g\xE8 y\xE0ng	7	l	all kinds and sorts|various
\u6216\u591A\u6216\u5C11	hu\xF2 du\u014D hu\xF2 sh\u01CEo	7	d	more or less
\u6376	chu\xED	7	v	beat|thump|pound
\u7206\u7AF9	b\xE0o zh\xFA	7	n	firecracker
\u586B\u5145	ti\xE1n ch\u014Dng	7	v	fill up|stuff
\u6CD5\u4EBA	f\u01CE r\xE9n	6	n	legal person|corporation
\u4E00\u52A8\u4E0D\u52A8	y\u012B d\xF2ng b\xF9 d\xF2ng	7	l	motionless
\u8BF1\u9975	y\xF2u \u011Br	7	n	bait
\u987A\u5FC3	sh\xF9n x\u012Bn	7	a	happy|satisfactory
\u7B5B	sh\u0101i	7	v	sieve|sift|filter|eliminate through selection|pour|strike
\u6559\u6750	ji\xE0o c\xE1i	3	n	teaching material
\u76F8\u7EA6	xi\u0101ng yu\u0113	7	v	agree|reach agreement|make an appointment
\u7F9E\u803B	xi\u016B ch\u01D0	6	n	shame
\u8840\u6813	xu\xE8 shu\u0101n	7	n	blood clot|thrombus
\u4EA4\u60C5	ji\u0101o qing	7	n	friendship|friendly relations
\u6D01\u51C0	ji\xE9 j\xECng	7	a	clean|cleanse
\u8FDE\u4EFB	li\xE1n r\xE8n	7	v	continue in office
\u65B9\u4FBF\u9762	f\u0101ng bi\xE0n mi\xE0n	2	n	instant noodles
\u5E94\u916C	y\xECng chou	7	v	engage in social activities|socialize|dinner party|banquet|social engagement
\u6D8C\u73B0	y\u01D2ng xi\xE0n	7	v	emerge in large numbers|spring up|emerge prominently
\u504F\u5DEE	pi\u0101n ch\u0101	7	n	bias|deviation
\u7A3B\u8349	d\xE0o c\u01CEo	7	n	rice straw
\u541D\u556C	l\xECn s\xE8	6	a	stingy|mean|miserly
\u60CA\u52A8	j\u012Bng d\xF2ng	6	v	alarm|startle|disturb
\u7247\u65AD	pi\xE0n du\xE0n	6	n	section|fragment|segment
\u51F6\u72E0	xi\u014Dng h\u011Bn	7	a	cruel|vicious|fierce and malicious|vengeful
\u9668\u77F3	y\u01D4n sh\xED	7	n	meteorite|aerolite
\u504F\u5411	pi\u0101n xi\xE0ng	7	n	partial towards sth|prefer|incline|erroneous tendencies
\u6025\u8E81	j\xED z\xE0o	6	a	irritable|irascible|impetuous
\u95F4\u9699	ji\xE0n x\xEC	7	n	interval|gap|clearance
\u6297\u8861	k\xE0ng h\xE9ng	7	v	compete with|vie with|counter
\u5B58\u6298	c\xFAn zh\xE9	7	n	passbook|bankbook
\u62C5\u8D1F	d\u0101n f\xF9	7	v	shoulder|bear|undertake
\u72FC\u72C8	l\xE1ng b\xE8i	7	an	in a difficult situation|cut a sorry figure|scoundrel
\u4FC4\u8BED	\xC9 y\u01D4	7	nz	russian
\u5728\u804C	z\xE0i zh\xED	7	vn	be employed|be in post|on-the-job
\u8FDD\u7EA6	w\xE9i yu\u0113	7	v	break a promise|violate an agreement|default
\u6559\u80B2\u90E8	Ji\xE0o y\xF9 b\xF9	6	nt	ministry of education
\u8EB2\u85CF	du\u01D2 c\xE1ng	7	v	conceal oneself|go into hiding|take cover
\u8054\u7F51	li\xE1n w\u01CEng	7	v	connect to a network|network
\u94F6\u5E55	y\xEDn m\xF9	7	n	movie screen
\u65E0\u6240\u4E8B\u4E8B	w\xFA su\u01D2 sh\xEC sh\xEC	7	v	have nothing to do|idle one's time away
\u5BA2\u8F66	k\xE8 ch\u0113	6	n	coach|bus|passenger train
\u611F\u89E6	g\u01CEn ch\xF9	7	n	one's thoughts and feelings|emotional stirring|moved|touched
\u76DB\u884C	sh\xE8ng x\xEDng	6	v	be in vogue|be popular|be prevalent
\u66FF\u8EAB	t\xEC sh\u0113n	7	n	stand-in|substitute|body double|stuntman|scapegoat|fall guy
\u6292\u60C5	sh\u016B q\xEDng	7	vn	express emotion|lyric
\u4E0D\u6B63\u4E4B\u98CE	b\xF9 zh\xE8ng zh\u012B f\u0113ng	7		unhealthy tendency
\u4E1C\u8FB9	d\u014Dng bian	1	f	east|east side|eastern part|east of
\u5305\u5B50	b\u0101o zi	1	n	bao
\u771F\u631A	zh\u0113n zh\xEC	7	a	sincere|sincerity
\u5F00\u6C34	k\u0101i shu\u01D0	4	n	boiled water|boiling water
\u4E3A\u9996	w\xE9i sh\u01D2u	6	v	head|be headed by
\u4EA4\u96C6	ji\u0101o j\xED	7	v	occur simultaneously|intermingle|common ground|points of commonality|overlap|connection|interaction|dealings
\u7CDF\u8E4B	z\u0101o t\xE0	6	v	waste|defile|abuse|insult|trample on|wreck|also pr
\u6253\u730E	d\u01CE li\xE8	7	v	go hunting
\u75DB\u5FC3	t\xF2ng x\u012Bn	7	a	grieved|pained
\u544A\u8F9E	g\xE0o c\xED	7	v	say goodbye|take one's leave
\u7406\u776C	l\u01D0 c\u01CEi	7	v	heed|pay attention to
\u6548\u76CA	xi\xE0o y\xEC	7	n	benefit|effectiveness|efficiency
\u5BB3\u866B	h\xE0i ch\xF3ng	7	n	injurious insect|pest
\u505C\u6EDE	t\xEDng zh\xEC	6	v	stagnation|at a standstill|bogged down
\u63D0\u70BC	t\xED li\xE0n	7	v	extract|refine|purify|process
\u56E2\u5706	tu\xE1n yu\xE1n	7	v	have a reunion
\u5F85\u4F1A\u513F	d\u0101i hu\xEC r	6	d	in a moment|later|also pr. or
\u6446\u5E73	b\u01CEi p\xEDng	7	v	be fair|be impartial|settle
\u5C61	l\u01DA	7	d	time and again|repeatedly|frequently
\u6E05\u9759	q\u012Bng j\xECng	7	a	quiet|peaceful and quiet
\u5598\u606F	chu\u01CEn x\u012B	7	v	gasp for breath|take a breather
\u8F6C\u6298\u70B9	zhu\u01CEn zh\xE9 di\u01CEn	7	n	turning point|breaking point
\u6070\u5DE7	qi\xE0 qi\u01CEo	7	d	by chance
\u7BA1\u6559	gu\u01CEn ji\xE0o	7	vn	discipline|teach|guarantee
\u5408\u8BA1	h\xE9 j\xEC	7	v	add up the total|consider
\u5C0F\u6EAA	xi\u01CEo x\u012B	7	n	brook|streamlet
\u5355\u6253	d\u0101n d\u01CE	6	n	singles
\u4E13\u4EBA	zhu\u0101n r\xE9n	7	n	specialist
\u5929\u5206	ti\u0101n f\xE8n	7	n	natural gift|talent
\u996D\u9986	f\xE0n gu\u01CEn	2	n	restaurant
\u68CB\u5B50	q\xED z\u01D0	7	n	chess piece|pawn
\u91CD\u521B	zh\xF2ng chu\u0101ng	7	v	inflict heavy losses|inflict serious damage
\u9891\u9891	p\xEDn p\xEDn	7	d	repeatedly|again and again|continuously|constantly
\u7F05\u6000	mi\u01CEn hu\xE1i	7	v	commemorate|recall fondly|think of the past
\u53D6\u800C\u4EE3\u4E4B	q\u01D4 \xE9r d\xE0i zh\u012B	7	v	replace|supersede|take its place
\u540E\u88D4	h\xF2u y\xEC	7	n	descendant
\u9971\u6EE1	b\u01CEo m\u01CEn	7	a	full|plump
\u5904\u957F	ch\xF9 zh\u01CEng	6	n	department head|section chief
\u6C79\u6D8C	xi\u014Dng y\u01D2ng	7	a	surge up violently|turbulent
\u7A00\u7F55	x\u012B han	7	a	rare|uncommon|rare thing|rarity|value as a rarity|cherish|taiwan pr
\u4E00\u5BB6\u4EBA	y\u012B ji\u0101 r\xE9n	7	n	household|whole family
\u575A\u6301\u4E0D\u61C8	ji\u0101n ch\xED b\xF9 xi\xE8	7	v	persevere unremittingly
\u5C16\u7AEF	ji\u0101n du\u0101n	7	b	sharp pointed end|tip|cusp|tip-top|most advanced and sophisticated|highest peak|best
\u53CD\u52A8	f\u01CEn d\xF2ng	6	a	reaction|reactionary
\u6C14\u538B	q\xEC y\u0101	6	n	atmospheric pressure|barometric pressure
\u9650\u5B9A	xi\xE0n d\xECng	7	v	restrict to|limit
\u5FC3\u91CC\u8BDD	x\u012Bn li hu\xE0	7	n	true feelings|secret mind
\u9992\u5934	m\xE1n tou	6	n	steamed roll|steamed bun|steamed bread
\u5C11\u4E0D\u4E86	sh\u01CEo bu li\u01CEo	7	v	cannot do without|be unavoidable
\u5FF5\u5FF5\u4E0D\u5FD8	ni\xE0n ni\xE0n b\xF9 w\xE0ng	7	v	keep in mind constantly
\u4E4C\u4E91	w\u016B y\xFAn	6	n	black cloud
\u7ADF\u6562	j\xECng g\u01CEn	7	v	have the impertinence|have the cheek to
\u8D1D\u58F3	b\xE8i k\xE9	7	n	shell|conch|cowry|mother of pearl|hard outer skin|also pr
\u6A59\u6C41	ch\xE9ng zh\u012B	7	n	orange juice
\u7EF7\u5E26	b\u0113ng d\xE0i	7	n	bandage
\u8427\u6761	xi\u0101o ti\xE1o	7	a	bleak|desolate|in a slump|sluggish|depressed
\u67B6\u52BF	ji\xE0 shi	7	n	attitude|position
\u4E66\u67B6	sh\u016B ji\xE0	3	n	bookshelf
\u5185\u5730	n\xE8i d\xEC	6	s	inland|interior|hinterland|mainland china|japan
\u5148\u5929	xi\u0101n ti\u0101n	7	n	inborn|innate|natural
\u65E0\u52A8\u4E8E\u8877	w\xFA d\xF2ng y\xFA zh\u014Dng	6	v	aloof|indifferent|unconcerned
\u8BB0\u53F7	j\xEC hao	7	n	mark|symbol|notation|seal
\u6E9C\u8FBE	li\u016B da	7	v	stroll|go for a walk
\u53C2\u8C0B	c\u0101n m\xF3u	7	n	staff officer|give advice
\u4FDD\u9C9C	b\u01CEo xi\u0101n	7	vn	keep fresh
\u5916\u5934	w\xE0i tou	6	f	outside|out
\u6DCC	t\u01CEng	7	v	drip|trickle|shed
\u552E\u7968	sh\xF2u pi\xE0o	7	v	sell tickets
\u611F\u53F9	g\u01CEn t\xE0n	7	v	sigh|lament
\u7891	b\u0113i	7	n	monument|upright stone tablet|stele
\u4F20\u8BB0	zhu\xE0n j\xEC	7	n	biography
\u5409\u7965	j\xED xi\xE1ng	6	n	lucky|auspicious|propitious
\u6C42\u804C	qi\xFA zh\xED	6	vn	seek employment
\u723D\u5FEB	shu\u01CEng kuai	7	a	refreshed|rejuvenated|frank and straightforward
\u4E0D\u62E9\u624B\u6BB5	b\xF9 z\xE9 sh\u01D2u du\xE0n	6	l	unscrupulously
\u4E0B\u68CB	xi\xE0 q\xED	7	v	play chess
\u6367\u573A	p\u011Bng ch\u01CEng	7	v	cheer on|root for sb|sing sb's praises|flatter
\u8A00\u8F9E	y\xE1n c\xED	7	n	words|expression|what one says
\u5014\u5F3A	ju\xE9 ji\xE0ng	7	a	stubborn|obstinate|unbending
\u8840\u8109	xu\xE8 m\xE0i	7	n	blood vessels
\u7164\u70AD	m\xE9i t\xE0n	7	n	coal
\u540D\u8457	m\xEDng zh\xF9	7		masterpiece
\u67AA\u6BD9	qi\u0101ng b\xEC	7	v	execute by firing squad|shoot dead|fig. to discard|get rid of
\u77A7\u4E0D\u8D77	qi\xE1o b\xF9 q\u01D0	7	v	look down upon|hold in contempt
\u5927\u4F53	d\xE0 t\u01D0	7	d	in general|more or less|in rough terms|basically|on the whole|overall situation|big picture
\u5145\u7535\u5668	ch\u014Dng di\xE0n q\xEC	4	n	battery charger
\u6E14\u6C11	y\xFA m\xEDn	7	n	fisherman|fisher folk
\u53D1\u6101	f\u0101 ch\xF3u	7	v	worry|fret|be anxious|become sad
\u8D22\u529B	c\xE1i l\xEC	7	n	financial resources
\u6563\u6587	s\u01CEn w\xE9n	5	n	prose|essay
\u884C\u674E\u7BB1	x\xEDng li xi\u0101ng	3	n	suitcase|baggage compartment|overhead bin|trunk|boot
\u6838\u80FD	h\xE9 n\xE9ng	7	n	nuclear energy
\u53F2\u65E0\u524D\u4F8B	sh\u01D0 w\xFA qi\xE1n l\xEC	7	l	unprecedented in history
\u8FC1\u5F99	qi\u0101n x\u01D0	6	v	migrate|move
\u9AD8\u5CF0\u671F	g\u0101o f\u0113ng q\u012B	7	n	peak period|rush hour
\u8F66\u901F	ch\u0113 s\xF9	7	n	vehicle speed
\u624E\u5B9E	zh\u0101 shi	6	a	strong|solid|sturdy|firm|practical
\u58C1\u753B	b\xEC hu\xE0	7	n	mural|fresco
\u773C\u754C	y\u01CEn ji\xE8	7	n	ken|scope
\u7F34\u8D39	ji\u01CEo f\xE8i	7	vn	pay a fee
\u9508	xi\xF9	7	v	rust
\u4E0D\u5BA2\u6C14	b\xF9 k\xE8 qi	1		you're welcome|don't mention it|impolite|rude|blunt
\u8096\u50CF	xi\xE0o xi\xE0ng	7	n	portrait|representation of a person|likeness
\u4E0D\u666F\u6C14	b\xF9 j\u01D0ng q\xEC	7	a	slack|in a slump
\u5C0F\u8D29	xi\u01CEo f\xE0n	7	n	peddler|hawker
\u5F97\u5931	d\xE9 sh\u012B	7	n	gains and losses|success and failure|merits and demerits
\u8FC7\u95EE	gu\xF2 w\xE8n	6	v	show an interest in|get involved with
\u8D85\u524D	ch\u0101o qi\xE1n	7	a	take the lead|advanced
\u89E3\u4F53	ji\u011B t\u01D0	7	v	break up into components|disintegrate|collapse|crumble
\u54CD\u58F0	xi\u01CEng sh\u0113ng	6	n	noise
\u7A83\u53D6	qi\xE8 q\u01D4	7	v	steal
\u4E0D\u503C	b\xF9 zh\xED	6		not worth
\u73B0\u6210	xi\xE0n ch\xE9ng	7	b	ready-made|readily available
\u76F8\u58F0	xi\xE0ng sheng	5	n	comic dialogue|sketch|crosstalk
\u4E0B\u5C71	xi\xE0 sh\u0101n	7	v	go down a hill|set
\u5929\u5E73	ti\u0101n p\xEDng	7	n	scales
\u95EE\u4E16	w\xE8n sh\xEC	7	v	be published|come out
\u81EA\u4FE1\u5FC3	z\xEC x\xECn x\u012Bn	7	n	self-confidence
\u4E0A\u6D41	sh\xE0ng li\xFA	7	b	upper class
\u7EA2\u5305	h\xF3ng b\u0101o	4	n	bonus payment|kickback|bribe
\u5403\u529B	ch\u012B l\xEC	5	a	entail strenuous effort|toil at a task|strenuous|laborious|strain
\u8D64\u5B57	ch\xEC z\xEC	7	n	deficit|red letter
\u516C\u8BC1	g\u014Dng zh\xE8ng	7	n	notarization|notarized|acknowledgement
\u6734\u7D20	p\u01D4 s\xF9	7	a	plain and simple|unadorned|simple living|not frivolous
\u56FD\u6B4C	gu\xF3 g\u0113	6	n	national anthem
\u6C14\u8272	q\xEC s\xE8	6	n	complexion
\u8FAB\u5B50	bi\xE0n zi	7	n	plait|braid|pigtail|handle
\u53E3\u7F69	k\u01D2u zh\xE0o	7	n	mask
\u62B5\u6D88	d\u01D0 xi\u0101o	7	v	counteract|cancel out|offset
\u522B\u81F4	bi\xE9 zh\xEC	7	a	unusual|unique
\u6F14\u827A\u5708	y\u01CEn y\xEC qu\u0101n	7	n	show business
\u8D5E\u53F9	z\xE0n t\xE0n	7	v	exclaim in admiration
\u91CC\u7A0B\u7891	l\u01D0 ch\xE9ng b\u0113i	7	n	milestone
\u5E08\u751F	sh\u012B sh\u0113ng	6	n	teachers and students
\u5012\u8F66	d\xE0o ch\u0113	4	v	reverse|drive backwards|change buses, trains etc
\u5065\u58EE	ji\xE0n zhu\xE0ng	7	a	robust|healthy|sturdy
\u7559\u795E	li\xFA sh\xE9n	7	v	take care|be careful
\u751C\u5934	ti\xE1n tou	7	n	sweet taste|benefit
\u642D\u5EFA	d\u0101 ji\xE0n	7	v	build|knock together|rig up
\u8D28\u5730	zh\xEC d\xEC	7	n	texture|background|grain|quality|character|disposition
\u6210\u578B	ch\xE9ng x\xEDng	7	v	become shaped|become formed
\u540E\u5934	h\xF2u tou	4	f	behind|back|rear|later|afterwards|future
\u6930\u5B50	y\u0113 zi	7	n	coconut palm|coconut
\u6E38\u73A9	y\xF3u w\xE1n	6	v	amuse oneself|have fun|go sightseeing|take a stroll
\u516C\u7528	g\u014Dng y\xF2ng	7	vn	public|for public use
\u821E\u5385	w\u01D4 t\u012Bng	7	n	dance hall|ballroom
\u6B7C\u706D	ji\u0101n mi\xE8	7	v	wipe out|crush|annihilate
\u9632\u6CBB	f\xE1ng zh\xEC	5	vn	prevent and cure|prevention and cure
\u8C03\u8BD5	ti\xE1o sh\xEC	7	v	debug|adjust components during testing|debugging
\u6094\u6068	hu\u01D0 h\xE8n	7	v	remorse|repentance
\u4ECB\u4E8E	ji\xE8 y\xFA	7	v	between|intermediate|lie between
\u673A\u7075	j\u012B ling	7	a	clever|quick-witted
\u4E24\u4FA7	li\u01CEng c\xE8	6	f	two sides|both sides
\u54C1\u5FB7	p\u01D0n d\xE9	7	n	moral character
\u520A\u7269	k\u0101n w\xF9	7	n	publication
\u767D\u83DC	b\xE1i c\xE0i	3	n	chinese cabbage|pak choi
\u7AEF\u6B63	du\u0101n zh\xE8ng	7	v	upright|regular|proper|correct
\u98CE\u529B	f\u0113ng l\xEC	7	n	wind force|wind power
\u4E92\u8865	h\xF9 b\u01D4	7	v	complementary|complement each other
\u9886\u7565	l\u01D0ng lu:\xE8	7	v	have a taste of|realize|appreciate
\u56DE\u6263	hu\xED k\xF2u	7	n	brokerage|euphemism for a bribe|kickback
\u6B21\u8981	c\xEC y\xE0o	5	b	secondary
\u51B7\u843D	l\u011Bng lu\xF2	7	v	desolate|unfrequented|treat sb coldly|snub|cold shoulder
\u7FBD\u6BDB\u7403	y\u01D4 m\xE1o qi\xFA	5	n	shuttlecock|badminton
\u4E50\u66F2	yu\xE8 q\u01D4	6	n	musical composition
\u5B89\u8BE6	\u0101n xi\xE1ng	6	a	serene
\u6267\u610F	zh\xED y\xEC	7	d	be determined to|insist on
\u575B	t\xE1n	7	g	platform|rostrum|altar|earthen jar
\u6BCD\u9E21	m\u01D4 j\u012B	6	n	hen
\u5B98\u5175	gu\u0101n b\u012Bng	7	n	officers and soldiers|officers and men|government troops
\u8D5B\u8DD1	s\xE0i p\u01CEo	7	v	race
\u7247\u9762	pi\xE0n mi\xE0n	4	a	unilateral|one-sided
\u672C\u79D1	b\u011Bn k\u0113	4	n	undergraduate course|undergraduate
\u6760\u6746	g\xE0ng g\u01CEn	6	n	lever|pry bar|crowbar|financial leverage
\u5893\u7891	m\xF9 b\u0113i	7	n	gravestone|tombstone
\u97AD\u70AE	bi\u0101n p\xE0o	7	n	firecrackers|string of small firecrackers
\u6DB5\u76D6	h\xE1n g\xE0i	7	v	cover|comprise|include
\u7B50	ku\u0101ng	7	n	basket
\u4E13\u5236	zhu\u0101n zh\xEC	7	n	autocracy|dictatorship
\u653E\u8086	f\xE0ng s\xEC	7	a	wanton|unbridled|presumptuous|impudent
\u6E05\u6DE1	q\u012Bng d\xE0n	7	a	light|insipid|slack
\u65B0\u5174	x\u012Bn x\u012Bng	6	b	rising|emerging|in the ascendant
\u9152\u6C34	ji\u01D4 shu\u01D0	6	n	beverage|drink
\u706F\u7B3C	d\u0113ng l\xF3ng	7	n	lantern
\u79C1\u4E8B	s\u012B sh\xEC	7	n	personal matters
\u5143\u8001	yu\xE1n l\u01CEo	7	n	senior figure|elder|doyen
\u53D1\u708E	f\u0101 y\xE1n	6	v	become inflamed|inflammation
\u5E78\u514D	x\xECng mi\u01CEn	7	v	avoid
\u7D27\u51D1	j\u01D0n c\xF2u	7	a	compact|terse|tight
\u996E\u7528\u6C34	y\u01D0n y\xF2ng shu\u01D0	7	n	drinking water|potable water
\u62BC\u91D1	y\u0101 j\u012Bn	5	n	deposit|down payment
\u4F4E\u8FF7	d\u012B m\xED	7	a	blurred|low|in a slump
\u7269\u4EF7	w\xF9 ji\xE0	5	n	prices
\u4E0D\u5B9A	b\xF9 d\xECng	7	d	indefinite|indeterminate|adventitious
\u516C\u5893	g\u014Dng m\xF9	7	n	public cemetery
\u6DF1\u601D	sh\u0113n s\u012B	7	v	ponder|consider
\u7554	p\xE0n	6	g	side|edge|boundary
\u53D1\u6012	f\u0101 n\xF9	6	v	get angry
\u770B\u5F97\u51FA	k\xE0n de ch\u016B	7	v	can see|can tell
\u7A33\u91CD	w\u011Bn zh\xF2ng	7	a	steady|earnest|staid
\u6BBF\u5802	di\xE0n t\xE1ng	7	n	palace|hall|temple buildings
\u665A\u5E74	w\u01CEn ni\xE1n	7	t	one's later years
\u4EC7\u4EBA	ch\xF3u r\xE9n	7	n	foe|one's personal enemy
\u7403\u978B	qi\xFA xi\xE9	2	n	athletic shoes
\u653B\u514B	g\u014Dng k\xE8	6	v	capture|take|overcome|solve
\u6CBF\u5CB8	y\xE1n \xE0n	7	f	coastal area|littoral or riparian
\u5E74\u7EC8	ni\xE1n zh\u014Dng	7	t	end of the year
\u6C47\u5408	hu\xEC h\xE9	7	v	confluence|converge|join|fuse|fusion
\u6C47\u6B3E	hu\xEC ku\u01CEn	5	n	remit money|remittance
\u7269\u8BC1	w\xF9 zh\xE8ng	7	n	material evidence
\u5750\u843D	zu\xF2 lu\xF2	7	v	be situated|be located
\u72ED\u5C0F	xi\xE1 xi\u01CEo	7	a	narrow
\u4E00\u5239\u90A3	y\u012B ch\xE0 n\xE0	7	t	moment|instant|in a flash
\u6D8C\u5165	y\u01D2ng r\xF9	7	v	come pouring in|influx
\u762B	t\u0101n	7	v	paralyzed
\u8349\u7387	c\u01CEo shu\xE0i	6	a	careless|negligent|sloppy|not serious
\u9690\u7EA6	y\u01D0n yu\u0113	7	z	vague|faint|indistinct
\u9738\u5360	b\xE0 zh\xE0n	7	v	occupy by force|seize|dominate
\u547C\u6551	h\u016B ji\xF9	7	v	call for help
\u76F8\u63D0\u5E76\u8BBA	xi\u0101ng t\xED b\xECng l\xF9n	7	v	mention on equal terms
\u519C\u4EA7\u54C1	n\xF3ng ch\u01CEn p\u01D0n	5	n	agricultural produce
\u7B28\u62D9	b\xE8n zhu\u014D	6	a	clumsy|awkward|stupid
\u5C24\u4E3A	y\xF3u w\xE9i	7	d	especially
\u5E8F\u5E55	x\xF9 m\xF9	7	n	prologue
\u6284\u88AD	ch\u0101o x\xED	7	v	plagiarize|copy
\u5E38\u7406	ch\xE1ng l\u01D0	7	n	common sense|conventional reasoning and morals
\u6C14\u6CE1	q\xEC p\xE0o	7	n	bubble|blister|sparkling|carbonated
\u6851\u62FF	s\u0101ng n\xE1	7	n	sauna
\u70ED\u6C14	r\xE8 q\xEC	7	n	steam|heat
\u59D4\u5A49	w\u011Bi w\u01CEn	7	a	tactful|euphemistic|suave|soft
\u575A\u97E7	ji\u0101n r\xE8n	7	a	tough and durable|tenacious
\u9632\u76D7	f\xE1ng d\xE0o	7	vn	guard against theft|anti-theft
\u4E0D\u89C1\u5F97	b\xF9 ji\xE0n de	7	d	not necessarily|not likely
\u4E0D\u89E3	b\xF9 ji\u011B	7	v	not understand|be puzzled by|indissoluble
\u9600\u95E8	f\xE1 m\xE9n	7	n	valve
\u5951\u673A	q\xEC j\u012B	7	n	opportunity|turning point|juncture
\u5BF9\u5F97\u8D77	du\xEC de q\u01D0	7	v	treat sb fairly|be worthy of
\u72EC\u88C1	d\xFA c\xE1i	6	a	dictatorship
\u9F50\u5FC3\u534F\u529B	q\xED x\u012Bn xi\xE9 l\xEC	7	v	make concerted efforts|pull together|work as one
\u987A\u4ECE	sh\xF9n c\xF3ng	7	v	obedient|comply|submit|defer
\u4F11\u60F3	xi\u016B xi\u01CEng	7	v	don't think|don't imagine
\u53F9\u6C14	t\xE0n q\xEC	6	v	sigh|heave a sigh
\u51FF	z\xE1o	7	v	chisel|bore a hole|chisel or dig|certain|authentic|irrefutable|also pr
\u74F6\u9888	p\xEDng j\u01D0ng	7	n	neck of a bottle|bottleneck|problem that impedes progress
\u7D2F\u8BA1	l\u011Bi j\xEC	7	v	calculate the running total|cumulative|total|in total
\u6B62\u6B65	zh\u01D0 b\xF9	7	v	halt|stop|go no farther
\u6C34\u9F99\u5934	shu\u01D0 l\xF3ng t\xF3u	7	n	faucet|tap
\u5E8A\u4F4D	chu\xE1ng w\xE8i	7	n	bed|berth|bunk
\u5F81\u96C6	zh\u0113ng j\xED	7	v	collect|recruit
\u89C1\u6548	ji\xE0n xi\xE0o	7	a	have the desired effect
\u8D76\u4E0D\u4E0A	g\u01CEn b\xF9 sh\xE0ng	6		can't keep up with|can't catch up with|cannot overtake
\u4E66\u684C	sh\u016B zhu\u014D	5	n	desk
\u63AA\u624B\u4E0D\u53CA	cu\xF2 sh\u01D2u b\xF9 j\xED	7	l	caught unprepared
\u62D3\u5BBD	tu\xF2 ku\u0101n	7	v	broaden
\u53F0\u706F	t\xE1i d\u0113ng	6	n	desk lamp|table lamp
\u7F62\u4F11	b\xE0 xi\u016B	7	v	give up|abandon|let sth go|forget it|let the matter drop
\u624B\u5E15	sh\u01D2u p\xE0	7	n	handkerchief
\u5F81\u6536	zh\u0113ng sh\u014Du	7	v	levy|expropriate
\u5598\u6C14	chu\u01CEn q\xEC	6	v	breathe deeply|pant|gasp|take a breather|catch one's breath
\u5C0F\u8D39	xi\u01CEo f\xE8i	6	nr	tip|gratuity
\u7A33\u5065	w\u011Bn ji\xE0n	7	a	firm|stable and steady
\u793E\u8BBA	sh\xE8 l\xF9n	7	n	editorial
\u786E\u51FF	qu\xE8 z\xE1o	7	a	definite|conclusive|undeniable|authentic|also pr
\u5386\u6765	l\xEC l\xE1i	7	d	always|throughout|all-time
\u5C31\u4EFB	ji\xF9 r\xE8n	7	v	take office|assume a post
\u897F\u73ED\u7259\u8BED	X\u012B b\u0101n y\xE1 y\u01D4	6	nz	spanish language
\u5FD8\u4E0D\u4E86	w\xE0ng b\xF9 li\u01CEo	7	v	cannot forget
\u6DC0\u7C89	di\xE0n f\u011Bn	7	n	starch|amylum n
\u7275\u5236	qi\u0101n zh\xEC	7	v	control|curb|restrict|impede|pin down
\u8FBE\u6807	d\xE1 bi\u0101o	7	v	reach a set standard
\u5B9E\u60E0	sh\xED hu\xEC	5	an	tangible benefit|material advantages|cheap|economical|advantageous|substantial
\u53D8\u8FC1	bi\xE0n qi\u0101n	7	vn	changes|vicissitudes
\u51A4	yu\u0101n	7	an	injustice|grievance|wrong
\u5C5E\u6027	sh\u01D4 x\xECng	7	n	attribute|property
\u5145\u6C9B	ch\u014Dng p\xE8i	7	a	abundant|plentiful|vigorous
\u6D41\u5229	li\xFA l\xEC	2	a	fluent
\u7B80\u8981	ji\u01CEn y\xE0o	7	ad	concise|brief
\u81EA\u529B\u66F4\u751F	z\xEC l\xEC g\u0113ng sh\u0113ng	7	v	self-reliance
\u4EA4\u670B\u53CB	ji\u0101o p\xE9ng you	2	v	make friends
\u9636\u68AF	ji\u0113 t\u012B	7	n	flight of steps|stepping stone
\u85CF\u54C1	c\xE1ng p\u01D0n	7	n	museum piece|collector's item|precious object
\u6BEF\u5B50	t\u01CEn zi	7	n	blanket
\u68A2	sh\u0101o	6	g	tip of branch
\u6843\u82B1	t\xE1o hu\u0101	5	n	peach blossom|love affair
\u65E0\u7406\u53D6\u95F9	w\xFA l\u01D0 q\u01D4 n\xE0o	6	v	make trouble without reason|be deliberately provocative
\u4E2D\u6027	zh\u014Dng x\xECng	7	n	neutral
\u5FE7\u6101	y\u014Du ch\xF3u	7	a	be worried
\u4E0D\u6613	b\xF9 y\xEC	5	a	difficult|unchanging
\u8DF3\u4F1E	ti\xE0o s\u01CEn	7	v	parachute|bail out|parachute jumping
\u4E00\u8DEF\u987A\u98CE	y\u012B l\xF9 sh\xF9n f\u0113ng	2	v	have a pleasant journey
\u6838\u7535\u7AD9	h\xE9 di\xE0n zh\xE0n	7	n	nuclear power plant
\u50AC\u4FC3	cu\u012B c\xF9	7	v	urge
\u5BBD\u5EA6	ku\u0101n d\xF9	5	n	width
\u665A\u62A5	w\u01CEn b\xE0o	2	n	evening newspaper|evening news
\u8F6E\u8239	l\xFAn chu\xE1n	4	n	steamship|steamer|steamboat
\u5934\u6761	t\xF3u ti\xE1o	7	n	lead story
\u552F\u72EC	w\xE9i d\xFA	7	d	only|just|all except|unique
\u81EA\u59CB\u81F3\u7EC8	z\xEC sh\u01D0 zh\xEC zh\u014Dng	7	l	from start to finish
\u4E00\u5E06\u98CE\u987A	y\u012B f\u0101n f\u0113ng sh\xF9n	7	v	plain sailing|go smoothly|have a nice trip
\u56DE\u5347	hu\xED sh\u0113ng	7	v	pick up|rally
\u5B5D\u987A	xi\xE0o sh\xF9n	7	v	filial|dutiful|devoted to one's parents|show filial piety towards|filial piety
\u5631\u5490	zh\u01D4 f\xF9	7	v	tell|exhort|injunction
\u5BBD\u5E7F	ku\u0101n gu\u01CEng	4	a	wide|broad|extensive|vast
\u6A61\u76AE	xi\xE0ng p\xED	7	n	rubber|eraser
\u5B66\u8BF4	xu\xE9 shu\u014D	7	n	theory|doctrine
\u80F8\u6000	xi\u014Dng hu\xE1i	6	n	one's bosom|breast|broad-minded and open|think about|cherish
\u524D\u5934	qi\xE1n tou	4	f	in front|at the head|ahead|above
\u5E76\u8D2D	b\xECng g\xF2u	7	vn	merger and acquisition|acquisition|take over
\u5357\u8FB9	n\xE1n bian	1	f	south|south side|southern part|south of
\u80E1\u987B	h\xFA x\u016B	5	n	beard
\u7ECF\u5546	j\u012Bng sh\u0101ng	7	v	trade|carry out commercial activities|in business
\u5E74\u524D	ni\xE1n qi\xE1n	5	t	shortly before new year
\u62B5\u89E6	d\u01D0 ch\xF9	7	v	conflict|contradict
\u9000\u4F11\u91D1	tu\xEC xi\u016B j\u012Bn	7	n	retirement pay|pension
\u77DB\u5934	m\xE1o t\xF3u	7	n	spearhead|barb|attack or criticism
\u907F\u96BE	b\xEC n\xE0n	7	v	refuge|take refuge|seek asylum
\u592A\u6781	T\xE0i j\xED	7	nz	absolute or supreme ultimate
\u553E\u6DB2	tu\xF2 y\xE8	7	n	saliva
\u7518\u5FC3	g\u0101n x\u012Bn	7	v	be willing to|resign oneself to
\u5143\u65E6	Yu\xE1n d\xE0n	5	t	new year's day
\u8F6C\u773C	zhu\u01CEn y\u01CEn	7	d	in a flash|glance
\u5317\u8FB9	b\u011Bi bi\u0101n	1	f	north|north side|northern part|north of
\u6E05\u771F\u5BFA	q\u012Bng zh\u0113n s\xEC	7	n	mosque
\u8FDB\u4FEE	j\xECn xi\u016B	7	v	undertake advanced studies|take a refresher course
\u5AB2\u7F8E	p\xEC m\u011Bi	7	v	match|is comparable with
\u6D53\u539A	n\xF3ng h\xF2u	7	a	dense|thick|deep|fully saturated
\u76D8\u7B97	p\xE1n su\xE0n	7	v	plot|scheme|calculate
\u7EBD\u6263	ni\u01D4 k\xF2u	7	n	button
\u5E73\u5766	p\xEDng t\u01CEn	5	a	level|even|smooth|flat
\u96BE\u542C	n\xE1n t\u012Bng	2	a	unpleasant to hear|coarse|vulgar|offensive|shameful
\u6743\u8861	qu\xE1n h\xE9ng	7	v	consider|weigh|balance
\u5E84\u91CD	zhu\u0101ng zh\xF2ng	6	a	grave|solemn|dignified
\u65B0\u6F6E	x\u012Bn ch\xE1o	7	n	modern|fashionable
\u52BF\u5FC5	sh\xEC b\xEC	7	d	be bound to|undoubtedly will
\u523A\u7EE3	c\xEC xi\xF9	7	n	embroider|embroidery
\u94A2\u7B14	g\u0101ng b\u01D0	5	n	fountain pen
\u836F\u6C34	y\xE0o shu\u01D0	2	n	medicine in liquid form|bottled medicine|lotion
\u5B66\u58EB	xu\xE9 sh\xEC	7	n	bachelor's degree
\u4E3E\u91CD	j\u01D4 zh\xF2ng	7	vn	lift weights|weight-lifting
\u6108\u6765\u6108	y\xF9 l\xE1i y\xF9	7	d	more and more
\u6E05\u51C9	q\u012Bng li\xE1ng	7	a	cool|refreshing|skimpy|revealing
\u5228	p\xE1o	7	v	dig|excavate|exclude|not to count|deduct|subtract|carpenter's plane|plane
\u88C2\u75D5	li\xE8 h\xE9n	7	n	crack|gap|split
\u5FC3\u60F3\u4E8B\u6210	x\u012Bn xi\u01CEng sh\xEC ch\xE9ng	7	v	wish you the best
\u96C6\u8D44	j\xED z\u012B	7	v	raise money|accumulate funds
\u516C\u7ACB	g\u014Dng l\xEC	7	b	public
\u7F29\u6C34	su\u014D shu\u01D0	7	v	shrink|fig. to shrink
\u52A8\u5DE5	d\xF2ng g\u014Dng	7	v	start
\u905B	li\xF9	7	v	stroll|walk
\u8FDF\u8FDF	ch\xED ch\xED	7	d	late|slow
\u6C34\u58F6	shu\u01D0 h\xFA	7	n	kettle|canteen|watering can
\u6F14\u64AD\u5BA4	y\u01CEn b\u014D sh\xEC	7	n	broadcasting studio
\u82B1\u5349	hu\u0101 hu\xEC	7	n	flowers and plants
\u5174\u5EFA	x\u012Bng ji\xE0n	7	v	build|construct
\u53E3\u4EE4	k\u01D2u l\xECng	7	n	oral command|word of command|password
\u5FC3\u80A0	x\u012Bn ch\xE1ng	7	n	heart|intention|one's inclination|state of mind|mood
\u65E0\u6545	w\xFA g\xF9	7	d	without cause or reason
\u8D2C\u4F4E	bi\u01CEn d\u012B	6	v	belittle|disparage|play down|demean|degrade|devalue
\u4F5C\u5BF9	zu\xF2 du\xEC	7	v	set oneself against|oppose|make a pair
\u5927\u5E45\u5EA6	d\xE0 f\xFA d\xF9	7	d	by a wide margin|substantial
\u53CD\u95EE	f\u01CEn w\xE8n	6	v	ask in reply|rhetorical question
\u56FD\u4EA7	gu\xF3 ch\u01CEn	6	b	domestically produced
\u83E9\u8428	P\xFA s\xE0	7	n	bodhisattva
\u666E\u53CA	p\u01D4 j\xED	3	v	spread extensively|generalize|widespread|popular|universal|ubiquitous|pervasive
\u5C31\u5730	ji\xF9 d\xEC	7	d	locally|on the spot
\u4EB2\u670B\u597D\u53CB	q\u012Bn p\xE9ng h\u01CEo y\u01D2u	7	l	friends and family|kith and kin
\u4E8C\u624B\u8F66	\xE8r sh\u01D2u ch\u0113	7	n	second-hand car
\u80C6\u602F	d\u01CEn qi\xE8	7	a	timidity|timid|cowardly
\u523A\u8033	c\xEC \u011Br	7	a	ear-piercing
\u72ED\u9698	xi\xE1 \xE0i	7	a	narrow|tight|narrow minded|lacking in experience
\u547D\u9898	m\xECng t\xED	7	n	proposition|assign an essay topic
\u72E0\u5FC3	h\u011Bn x\u012Bn	6	a	callous|heartless|resolve
\u761F\u75AB	w\u0113n y\xEC	7	n	plague|pestilence
\u65E9\u5E74	z\u01CEo ni\xE1n	7	t	many years ago|in the past|in one's early years
\u5C71\u8109	sh\u0101n m\xE0i	6	n	mountain range
\u6DE1\u6C34	d\xE0n shu\u01D0	6	n	potable water|fresh water
\u539A\u5EA6	h\xF2u d\xF9	7	n	thickness
\u7F6A\u9B41\u7978\u9996	zu\xEC ku\xED hu\xF2 sh\u01D2u	7	l	criminal ringleader, main offender|main culprit
\u636E\u6089	j\xF9 x\u012B	7	v	according to reports|it is reported
\u6B3E\u5F85	ku\u01CEn d\xE0i	6	vn	entertain|be hospitable to
\u4FEE\u957F	xi\u016B ch\xE1ng	7	a	slender|lanky|tall and thin
\u540D\u6B21	m\xEDng c\xEC	6	n	place|rank
\u6C47\u7387	hu\xEC l\u01DC	4	n	exchange rate
\u60EF\u6027	gu\xE0n x\xECng	7	n	inertia|force of habit|habitual
\u5DE5\u827A\u54C1	g\u014Dng y\xEC p\u01D0n	5	n	handicraft article|handiwork
\u4F11\u517B	xi\u016B y\u01CEng	7	v	recuperate|recover|convalesce
\u7ED3\u51B0	ji\xE9 b\u012Bng	7	v	freeze
\u51C9\u723D	li\xE1ng shu\u01CEng	7	a	cool and refreshing
\u5E86\u8D3A	q\xECng h\xE8	7	v	congratulate|celebrate
\u6807\u793A	bi\u0101o sh\xEC	7	v	indicate
\u70ED\u6C34\u5668	r\xE8 shu\u01D0 q\xEC	6	n	water heater
\u663C\u591C	zh\xF2u y\xE8	7	n	day and night|period of 24 hours|continuously, without stop
\u9F20\u6807	sh\u01D4 bi\u0101o	5	n	mouse
\u4E0B\u610F\u8BC6	xi\xE0 y\xEC sh\xED	7	n	subconscious mind
\u532A\u5F92	f\u011Bi t\xFA	6	n	gangster|bandit
\u8FD4\u8FD8	f\u01CEn hu\xE1n	7	v	restitution|remittance
\u53D1\u9175	f\u0101 ji\xE0o	7	v	ferment|bubble away|simmer|develop
\u540C\u671F	t\xF3ng q\u012B	6	f	corresponding time period|concurrent|synchronous
\u517C\u5BB9	ji\u0101n r\xF3ng	7	v	compatible
\u754C\u7EBF	ji\xE8 xi\xE0n	7	n	limits|bounds|dividing line
\u7965\u548C	xi\xE1ng h\xE9	7	a	auspicious and peaceful
\u548C\u853C	h\xE9 \u01CEi	7	a	kindly|nice|amiable
\u5965\u79D8	\xE0o m\xEC	7	n	secret|mystery
\u7E41\u91CD	f\xE1n zh\xF2ng	7	a	heavy|burdensome|heavy-duty|arduous|onerous
\u94BB\u7814	zu\u0101n y\xE1n	7	v	study meticulously|delve into
\u53CB\u4EBA	y\u01D2u r\xE9n	7	n	friend
\u91C7\u77FF	c\u01CEi ku\xE0ng	7	vn	mining
\u901A\u4FD7	t\u014Dng s\xFA	7	a	common|everyday|average
\u70D8	h\u014Dng	6	v	bake|heat by fire|set off by contrast
\u5927\u5B97	d\xE0 z\u014Dng	7	m	large amount|staple
\u4F19\u98DF	hu\u01D2 sh\xED	7	n	food|meals
\u5730\u4E0B\u6C34	d\xEC xi\xE0 shu\u01D0	7	n	groundwater
\u5E38\u5E74	ch\xE1ng ni\xE1n	6	d	all year round|for years on end|average year
\u8F9E\u9000	c\xED tu\xEC	7	v	dismiss|discharge|fire
\u53E3\u7891	k\u01D2u b\u0113i	7	n	public praise|public reputation|commonly held opinions|current idiom
\u886C\u6258	ch\xE8n tu\u014D	7	v	set off
\u62A2\u773C	qi\u01CEng y\u01CEn	7	a	eye-catching
\u7CBE\u7B80	j\u012Bng ji\u01CEn	7	v	simplify|reduce
\u5FEB\u8F66	ku\xE0i ch\u0113	6	n	express
\u6401\u7F6E	g\u0113 zh\xEC	7	v	shelve|set aside
\u65E0\u8FB9	w\xFA bi\u0101n	6	z	without boundary|not bordered
\u8FDC\u89C1	yu\u01CEn ji\xE0n	7	n	foresight|discernment|vision
\u53CD\u4E4B	f\u01CEn zh\u012B	6	c	on the other hand|conversely
\u611F\u67D3\u529B	g\u01CEn r\u01CEn l\xEC	7	n	infectiousness|appeal|power|impact
\u8511\u89C6	mi\xE8 sh\xEC	6	v	loathe|despise|contempt
\u822A\u8FD0	h\xE1ng y\xF9n	7	n	shipping|transport
\u5C71\u5CF0	sh\u0101n f\u0113ng	6	n	peak
\u771F\u662F\u7684	zh\u0113n shi de	7		really
\u4E89\u6C14	zh\u0113ng q\xEC	7	a	work hard for sth|resolve on improvement
\u656C\u91CD	j\xECng zh\xF2ng	7	v	respect deeply|revere|esteem
\u5916\u884C	w\xE0i h\xE1ng	7	n	layman|amateur
\u7978\u5BB3	hu\xF2 h\xE0i	7	n	disaster|harm|scourge|bad person|damage|wreck
\u540E\u76FE	h\xF2u d\xF9n	7	n	support|backing
\u65B9\u65B9\u9762\u9762	f\u0101ng f\u0101ng mi\xE0n mi\xE0n	7	n	all sides|all aspects|multifaceted
\u672C\u94B1	b\u011Bn qi\xE1n	7	n	capital|asset|advantage|means
\u8BE7\u5F02	ch\xE0 y\xEC	7	a	flabbergasted|astonished
\u5973\u5B69\u513F	n\u01DA h\xE1i r	1		girl
\u5916\u63F4	w\xE0i yu\xE1n	7	n	foreign aid|external aid|foreign player|player recruited from overseas
\u65E0\u6D4E\u4E8E\u4E8B	w\xFA j\xEC y\xFA sh\xEC	7	v	no avail|of no use
\u529B\u6240\u80FD\u53CA	l\xEC su\u01D2 n\xE9ng j\xED	7	l	best of one's ability|within one's powers
\u900F\u5F7B	t\xF2u ch\xE8	7	a	penetrating|thorough|incisive
\u6C11\u5DE5	m\xEDn g\u014Dng	6	n	migrant worker
\u9047\u4E0A	y\xF9 sh\xE0ng	7	v	come across|run into
\u5F53\u4E4B\u65E0\u6127	d\u0101ng zh\u012B w\xFA ku\xEC	7	v	entirely worthy
\u4FD7\u8BDD	s\xFA hu\xE0	7	n	common saying|proverb
\u4E2D\u533B	Zh\u014Dng y\u012B	2	n	traditional chinese medical science
\u6C34\u5229	shu\u01D0 l\xEC	7	n	water conservancy|irrigation works
\u5956\u8D4F	ji\u01CEng sh\u01CEng	6	n	reward|prize|award
\u771F\u5047	zh\u0113n ji\u01CE	7	n	genuine or fake|true or false
\u574F\u5904	hu\xE0i chu	2	n	harm|troubles
\u6E90\u6E90\u4E0D\u65AD	yu\xE1n yu\xE1n b\xF9 du\xE0n	7	v	steady flow|unending stream
\u53D7\u7F6A	sh\xF2u zu\xEC	6	v	endure|suffer|hardships|torments|hard time|nuisance
\u6E56\u6CCA	h\xFA p\u014D	7	n	lake
\u6258\u4ED8	tu\u014D f\xF9	7	v	entrust
\u5217\u4E3E	li\xE8 j\u01D4	7	v	list|enumerate
\u6CE2\u53CA	b\u014D j\xED	7	v	spread to|involve|affect
\u6C42\u8BC1	qi\xFA zh\xE8ng	7	v	seek proof|seek confirmation
\u7D20\u63CF	s\xF9 mi\xE1o	7	n	sketch
\u516C\u4E8B	g\u014Dng sh\xEC	7	n	work-related matters|documents
\u70D8\u5E72	h\u014Dng g\u0101n	7	v	dry over a stove
\u76CA\u5904	y\xEC chu	7	n	benefit
\u8BE6\u5C3D	xi\xE1ng j\xECn	7	a	thorough and detailed|exhaustive|tedious details in full
\u8BF7\u793A	q\u01D0ng sh\xEC	6	v	ask for instructions
\u5E74\u521D	ni\xE1n ch\u016B	3	t	beginning of the year
\u865A\u8363	x\u016B r\xF3ng	6	a	vanity
\u7130\u706B	y\xE0n hu\u01D2	7	n	fireworks
\u7D22\u6027	su\u01D2 x\xECng	7	d	you might as well|simply|just
\u5F7B\u591C	ch\xE8 y\xE8	7	d	whole night
\u6574\u6CBB	zh\u011Bng zh\xEC	6	v	bring under control|regulate|restore to good condition|fix|prepare
\u6E0A\u6E90	yu\u0101n yu\xE1n	7	n	origin|source|relationship
\u5E76\u5217	b\xECng li\xE8	7	v	stand side by side|be juxtaposed
\u6C11\u6B4C	m\xEDn g\u0113	6	n	folk song
\u4EA4\u754C	ji\u0101o ji\xE8	7	v	common boundary|common border
\u5199\u7167	xi\u011B zh\xE0o	7	n	portrayal
\u5929\u6587	ti\u0101n w\xE9n	5	n	astronomy
\u9F13\u52A8	g\u01D4 d\xF2ng	7	v	urge|encourage|agitate|instigate|incite|beat|flap (wings|fan etc)
\u79D1\u666E	k\u0113 p\u01D4	7	b	popular science|explain in layperson's terms
\u89E3\u56F4	ji\u011B w\xE9i	7	v	lift a siege
\u5012\u5356	d\u01CEo m\xE0i	7	v	resell at a profit|speculate
\u8FD9\u5C31\u662F\u8BF4	zh\xE8 ji\xF9 sh\xEC shu\u014D	6	c	in other words|that is to say
\u559C\u5E86	x\u01D0 q\xECng	7	v	jubilation|festive
\u57FA\u51C6	j\u012B zh\u01D4n	7	n	datum|standard|criterion|benchmark
\u5CB8\u4E0A	\xE0n sh\xE0ng	5	s	ashore|on the riverbank
\u6717\u8BFB	l\u01CEng d\xFA	5	v	read aloud
\u8B66\u949F	j\u01D0ng zh\u014Dng	7	n	alarm bell
\u6717\u8BF5	l\u01CEng s\xF2ng	7	v	read aloud with expression|recite|declaim
\u663E\u8D6B	xi\u01CEn h\xE8	7	a	illustrious|celebrated
\u7A8D\u95E8	qi\xE0o m\xE9n	7	n	trick|ingenious method|know-how|knack
\u71D5\u5B50	y\xE0n zi	7	n	swallow
\u5982\u613F\u4EE5\u507F	r\xFA yu\xE0n y\u01D0 ch\xE1ng	7	v	have one's wish fulfilled
\u5C31\u533B	ji\xF9 y\u012B	7	v	receive medical treatment
\u7184\u706B	x\u012B hu\u01D2	7	v	go out|put out|die down|stall
\u524D\u5E74	qi\xE1n ni\xE1n	2	t	year before last
\u7F34\u7EB3	ji\u01CEo n\xE0	7	v	pay
\u5F3A\u52A0	qi\xE1ng ji\u0101	7	v	impose|force upon
\u6B4C\u9882	g\u0113 s\xF2ng	7	v	sing the praises of|extol|eulogize
\u6025\u5FD9	j\xED m\xE1ng	4	d	hastily
\u8FC1\u5C31	qi\u0101n ji\xF9	7	v	yield|adapt to|accommodate to
\u56E2\u5458	tu\xE1n yu\xE1n	7	n	member|group member
\u63A8\u8BBA	tu\u012B l\xF9n	6	v	infer|inference|corollary|reasoned conclusion
\u7A7A\u9699	k\xF2ng x\xEC	7	n	crack|gap between two objects
\u8BD5\u9898	sh\xEC t\xED	3	n	exam question|test topic
\u6028\u8A00	yu\xE0n y\xE1n	7	n	complaint
\u9648\u5217	ch\xE9n li\xE8	7	v	display|exhibit
\u4E00\u8FDE	y\u012B li\xE1n	7	d	in a row|in succession|running
\u67E5\u5904	ch\xE1 ch\u01D4	7	v	investigate and handle
\u62C9\u62E2	l\u0101 l\u01D2ng	7	v	rope in|fig. to involve sb|entice
\u544A\u793A	g\xE0o shi	7	n	announcement
\u4E16\u4EE3	sh\xEC d\xE0i	7	n	for many generations|generation|era|age
\u5E72\u4E8B	g\xE0n shi	7	n	administrator|executive secretary
\u9020\u798F	z\xE0o f\xFA	7	v	benefit
\u4E0D\u61C8	b\xF9 xi\xE8	7	z	untiring|unremitting|indefatigable
\u5BBD\u9614	ku\u0101n ku\xF2	6	a	expansive|wide|width|thickness
\u53EB\u597D	ji\xE0o h\u01CEo	7	v	applaud|cheer
\u836F\u65B9	y\xE0o f\u0101ng	7	n	prescription
\u5BD3\u610F	y\xF9 y\xEC	7	n	moral|lesson to be learned|implication|message|import|metaphorical meaning
\u6CC4\u5BC6	xi\xE8 m\xEC	7	v	leak secrets
\u9AD8\u8C03	g\u0101o di\xE0o	7	n	high-sounding speech|bombast|high-profile
\u7ED3\u8D26	ji\xE9 zh\xE0ng	5	v	pay the bill|settle accounts
\u70F9\u8C03	p\u0113ng ti\xE1o	7	v	cook
\u6295\u63B7	t\xF3u zh\xEC	6	v	hurl|throw at|throw|flip
\u987A\u52BF	sh\xF9n sh\xEC	7	d	take advantage|seize an opportunity|in passing|without taking extra trouble|conveniently
\u8BCD\u5178	c\xED di\u01CEn	2	n	dictionary
\u4E0A\u8C03	sh\xE0ng ti\xE1o	7	v	raise|adjust upwards
\u552E\u4EF7	sh\xF2u ji\xE0	7	n	selling price
\u6302\u5FF5	gu\xE0 ni\xE0n	7	v	concerned
\u653E\u6C34	f\xE0ng shu\u01D0	7	v	turn on the water|let water out|throw a game
\u904D\u5730	bi\xE0n d\xEC	6	v	everywhere|all over
\u7535\u8BAF	di\xE0n x\xF9n	7	n	telecommunications|telecom
\u671F\u4E2D	q\u012B zh\u014Dng	4	t	interim|midterm
\u575D	b\xE0	7	n	dam|dike|embankment
\u4E16\u754C\u89C2	sh\xEC ji\xE8 gu\u0101n	6	n	worldview|world outlook|weltanschauung
\u7B97\u8D26	su\xE0n zh\xE0ng	7	v	balance the books|do the accounts|settle an account|get one's revenge
\u89E3\u6790	ji\u011B x\u012B	7	v	analyze|resolve|analysis|analytic
\u7EFF\u5730	l\u01DC d\xEC	7	n	green area
\u7F51\u5740	w\u01CEng zh\u01D0	4	n	website|web address|url
\u79EF\u6781\u6027	j\u012B j\xED x\xECng	3	n	zeal|initiative|enthusiasm|activity
\u5C11\u513F	sh\xE0o \xE9r	6	n	child
\u611A\u6627	y\xFA m\xE8i	6	a	ignorant|uneducated|ignorance
\u4E00\u8A00\u4E0D\u53D1	y\u012B y\xE1n b\xF9 f\u0101	7	v	not say a word
\u8BF8\u5982\u6B64\u7C7B	zh\u016B r\xFA c\u01D0 l\xE8i	7	l	things like this|and so on|and the rest|etc
\u8DEF\u51B5	l\xF9 ku\xE0ng	7	n	road condition
\u673A\u52A8\u8F66	j\u012B d\xF2ng ch\u0113	6	n	motor vehicle
\u76AE\u7403	p\xED qi\xFA	6	n	ball
\u95E8\u8DEF	m\xE9n l\xF9	7	n	way of doing sth|right social connection
\u5B57\u8FF9	z\xEC j\xEC	7	n	handwriting
\u63A8\u79FB	tu\u012B y\xED	7	vn	elapse or pass|develop or evolve
\u6B7B\u5FC3	s\u01D0 x\u012Bn	7	v	give up|admit failure|drop the matter|reconcile oneself to loss
\u72B9\u8C6B\u4E0D\u51B3	y\xF3u y\xF9 b\xF9 ju\xE9	7	v	hesitancy|indecision|waver
\u71C3\u6C14	r\xE1n q\xEC	7	n	fuel gas
\u6D3D\u8C08	qi\xE0 t\xE1n	7	v	discuss
\u4EBA\u6587	r\xE9n w\xE9n	7	n	humanities|human affairs|culture
\u53E3\u624D	k\u01D2u c\xE1i	7	n	eloquence
\u5468\u65CB	zh\u014Du xu\xE1n	7	v	mix with others|socialize|deal with|contend
\u8131\u53E3\u800C\u51FA	tu\u014D k\u01D2u \xE9r ch\u016B	7	v	blurt out|let slip
\u9057\u7269	y\xED w\xF9	7	n	remnant
\u9888\u690E	j\u01D0ng zhu\u012B	6	n	cervical vertebra
\u4F0A\u65AF\u5170\u6559	Y\u012B s\u012B l\xE1n ji\xE0o	7	nz	islam
\u4E13\u8457	zhu\u0101n zh\xF9	7		monograph|specialized text
\u6D88\u6C89	xi\u0101o ch\xE9n	7	a	depressed|bad mood|low spirit
\u4EC5\u6B21\u4E8E	j\u01D0n c\xEC y\xFA	7	v	second only to|ranking behind only
\u901A\u7545	t\u014Dng ch\xE0ng	7	a	unobstructed|clear|coherent|fluent
\u8086\u65E0\u5FCC\u60EE	s\xEC w\xFA j\xEC d\xE0n	6	v	absolutely unrestrained|unbridled|without the slightest scruple
\u5386\u65F6	l\xEC sh\xED	7	v	last|take|period|diachronic
\u7EB5\u6A2A	z\xF2ng h\xE9ng	6	v	vertically and horizontal|length and breadth|criss-crossed|able to move unhindered
\u8F7D\u4F53	z\xE0i t\u01D0	7	n	carrier|vector|vehicle or medium
\u5438\u7BA1	x\u012B gu\u01CEn	4	n	straw|pipette|eyedropper|snorkel
\u4E2A\u6848	g\xE8 \xE0n	7	n	individual case|special case
\u830E	j\u012Bng	7	n	stalk|stem
\u5343\u514B	qi\u0101n k\xE8	2	q	kilogram
\u6210\u5BB6	ch\xE9ng ji\u0101	7	v	become a recognized expert
\u8C03\u548C	ti\xE1o h\xE9	6	v	harmonious|mediate|reconcile|mediation|compromise|mix|blend|blended
\u6CB9\u817B	y\xF3u n\xEC	6	a	greasy food|oily food|greasy|oily|fatty|obnoxious|pretentious|vulgar
\u8FDF\u7F13	ch\xED hu\u01CEn	6	a	slow|sluggish
\u7A00\u5947	x\u012B q\xED	7	a	rare|strange
\u795E\u8272	sh\xE9n s\xE8	6	n	expression|look
\u8FCE\u9762	y\xEDng mi\xE0n	6	d	directly|head-on|in one's face
\u5A01\u4FE1	w\u0113i x\xECn	7	n	prestige|reputation|trust|credit with the people
\u4E94\u661F\u7EA7	w\u01D4 x\u012Bng j\xED	7	b	five-star
\u4E00\u76EE\u4E86\u7136	y\u012B m\xF9 li\u01CEo r\xE1n	7	v	obvious at a glance
\u4E3E\u8DB3\u8F7B\u91CD	j\u01D4 z\xFA q\u012Bng zh\xF2ng	6	v	play a critical role|influential
\u706B\u901F	hu\u01D2 s\xF9	7	d	at top speed|at a tremendous lick
\u5927\u7EB2	d\xE0 g\u0101ng	5	n	synopsis|outline|program|leading principles
\u4EAE\u4E3D	li\xE0ng l\xEC	7	a	bright and beautiful
\u8212\u7545	sh\u016B ch\xE0ng	7	a	happy|entirely free from worry
\u5E94\u6709\u5C3D\u6709	y\u012Bng y\u01D2u j\xECn y\u01D2u	7	v	have all one needs
\u9A8C\u6536	y\xE0n sh\u014Du	7	v	inspect and accept|acceptance
\u539F\u6750\u6599	yu\xE1n c\xE1i li\xE0o	7	n	raw and semifinished materials
\u5A01\u98CE	w\u0113i f\u0113ng	7	a	might|awe-inspiring authority|impressive
\u9576\u5D4C	xi\u0101ng qi\xE0n	7	v	inlay|embed|set|tiling|tesselation
\u65E0\u5FE7\u65E0\u8651	w\xFA y\u014Du w\xFA l\u01DC	7	v	carefree and without worries
\u6C14\u6D3E	q\xEC p\xE0i	7	a	impressive|stylish|magnificent|imposing manner|dignified air
\u56FA\u6709	g\xF9 y\u01D2u	6	b	intrinsic to sth|inherent|native
\u4F3C\u66FE\u76F8\u8BC6	s\xEC c\xE9ng xi\u0101ng sh\xED	7	v	d\xE9j\xE0 vu|seemingly familiar|apparently already acquainted
\u6734\u5B9E	p\u01D4 sh\xED	7	a	plain|simple|guileless|down-to-earth|sincere and honest
\u95EE\u8DEF	w\xE8n l\xF9	2	v	ask for directions|ask the way
\u547C\u5578	h\u016B xi\xE0o	6	v	whistle|scream|whiz
\u62C5\u5B50	d\xE0n zi	7	n	burden|task|responsibility
\u55A7\u95F9	xu\u0101n n\xE0o	7	v	make a noise|noisy
\u65AF\u6587	s\u012B w\xE9n	6	a	refined|educate|cultured|intellectual|polite|gentle
\u968F\u5904\u53EF\u89C1	su\xED ch\xF9 k\u011B ji\xE0n	7	v	can be seen everywhere
\u4E0B\u8FB9	xi\xE0 bian	1	f	under|underside|below
\u4FD7\u8BDD\u8BF4	s\xFA hu\xE0 shu\u014D	7	v	as the proverb says|as they say
\u8282\u5047\u65E5	ji\xE9 ji\xE0 r\xEC	6	t	public holiday
\u5BF9\u767D	du\xEC b\xE1i	7	n	dialogue
\u793C\u8282	l\u01D0 ji\xE9	6	n	etiquette
\u8C03\u4F83	ti\xE1o k\u01CEn	7	v	ridicule|tease|mock|idle talk|chitchat
\u4E00\u5FC3\u4E00\u610F	y\u012B x\u012Bn y\u012B y\xEC	7	l	single-minded|bent on|intently
\u80F6\u6C34	ji\u0101o shu\u01D0	5	n	glue
\u5E76\u5B58	b\xECng c\xFAn	6	v	coexist
\u672C\u7740	b\u011Bn zhe	7	p	based on|in conformance with
\u8D25\u574F	b\xE0i hu\xE0i	6	v	ruin|corrupt|undermine
\u9AA8\u5E72	g\u01D4 g\xE0n	7	n	diaphysis|fig. backbone
\u673A\u8231	j\u012B c\u0101ng	7	n	cabin of a plane
\u8363\u83B7	r\xF3ng hu\xF2	7	v	be honored with
\u53EB\u4F5C	ji\xE0o zu\xF2	2	v	call|be called
\u5065\u7F8E	ji\xE0n m\u011Bi	7	n	healthy and beautiful|do fitness exercises
\u5B98\u50DA\u4E3B\u4E49	gu\u0101n li\xE1o zh\u01D4 y\xEC	7	n	bureaucracy
\u4E5E\u6C42	q\u01D0 qi\xFA	7	v	beg
\u6807\u81F4	bi\u0101o zhi	7	a	beautiful|pretty|peugeot
\u5DEB\u5A46	w\u016B p\xF3	7	n	witch|sorceress|female shaman
\u4ECE\u4E1A	c\xF3ng y\xE8	7	b	practice
\u9884\u8D5B	y\xF9 s\xE0i	7	n	preliminary competition|hold preliminary heats
\u4E0B\u7EA7	xi\xE0 j\xED	7	n	low ranking|low level|underclass|subordinate
\u7A97\u53F0	chu\u0101ng t\xE1i	4	n	window sill|window ledge
\u8D44\u5386	z\u012B l\xEC	7	n	qualifications|experience|seniority
\u4E3E\u4F8B	j\u01D4 l\xEC	7	v	give an example
\u51B2\u649E	ch\u014Dng zhu\xE0ng	7	v	collide|jerking motion|impinge|offend|provoke
\u8D2C\u503C	bi\u01CEn zh\xED	7	v	become devaluated|devaluate|depreciate
\u5960\u5B9A	di\xE0n d\xECng	7	v	establish|fix|settle
\u542B\u84C4	h\xE1n x\xF9	7	a	contain|hold|reserved|restrained|full of hidden meaning|implicit|veiled
\u70ED\u6C14\u7403	r\xE8 q\xEC qi\xFA	7	n	hot air balloon
\u631F\u6301	xi\xE9 ch\xED	7	v	seize
\u589E\u503C	z\u0113ng zh\xED	6	v	appreciate|increase in value|value-added
\u9C81\u83BD	l\u01D4 m\u01CEng	7	a	hot-headed|impulsive|reckless
\u7528\u529F	y\xF2ng g\u014Dng	7	a	diligent|industrious|study hard|make great effort
\u501A	y\u01D0	7	v	lean on|rely upon
\u6253\u55B7\u568F	d\u01CE p\u0113n t\xEC	5	v	sneeze
\u7406\u4E8B	l\u01D0 sh\xEC	7	n	member of council|take care of matters
\u6401\u6D45	g\u0113 qi\u01CEn	7	v	be stranded|run aground
\u675C\u7EDD	d\xF9 ju\xE9	7	v	put an end to
\u62DB\u6807	zh\u0101o bi\u0101o	7	v	invite bids
\u505C\u4E1A	t\xEDng y\xE8	7	v	cease trading|close down
\u9AD8\u9F84	g\u0101o l\xEDng	7	n	elderly
\u56FD\u5E86\u8282	Gu\xF3 q\xECng ji\xE9	5	t	prc national day
\u7EA2\u706B	h\xF3ng hu\u01D2	7	a	prosperous
\u68C0\u8BA8	ji\u01CEn t\u01CEo	7	v	examine or inspect|self-criticism|review
\u54C0\u6C42	\u0101i qi\xFA	7	v	entreat|implore|plead
\u62DF\u5B9A	n\u01D0 d\xECng	7	v	draw up|draft|formulate
\u76EE\u77AA\u53E3\u5446	m\xF9 d\xE8ng k\u01D2u d\u0101i	7	l	dumbstruck|stupefied|stunned
\u6D3E\u522B	p\xE0i bi\xE9	7	n	group|sect|clique|faction|school
\u5BA1\u7F8E	sh\u011Bn m\u011Bi	7	vn	esthetics|appreciating the arts|taste
\u624D\u5E72	c\xE1i g\xE0n	6	n	ability|competence
\u603B\u8BA1	z\u01D2ng j\xEC	7	v	total
\u88C1\u7F1D	c\xE1i feng	6	n	tailor|dressmaker
\u5B8F\u5927	h\xF3ng d\xE0	6	a	great|grand
\u5171\u8BA1	g\xF2ng j\xEC	5	v	sum up to|total
\u65F6\u4E8B	sh\xED sh\xEC	5	n	current trends|present situation|how things are going
\u957F\u8DD1	ch\xE1ng p\u01CEo	6	vn	long-distance running
\u5316\u80A5	hu\xE0 f\xE9i	7	n	fertilizer
\u95E8\u94C3	m\xE9n l\xEDng	7	n	doorbell
\u96C4\u539A	xi\xF3ng h\xF2u	7	a	substantial|robust|ample|abundant
\u56DE\u5FC6\u5F55	hu\xED y\xEC l\xF9	7	n	memoir
\u8D34\u5207	ti\u0113 qi\xE8	7	a	close-fitting|closest
\u9971\u548C	b\u01CEo h\xE9	7	v	saturated|filled to capacity
\u6269\u5EFA	ku\xF2 ji\xE0n	7	v	extend (a building|airport runway etc)
\u677E\u6811	s\u014Dng sh\xF9	4	n	pine|pine tree
\u4E00\u6210\u4E0D\u53D8	y\u012B ch\xE9ng b\xF9 bi\xE0n	7	v	immutable|impervious to change|set in stone
\u517B\u6B96	y\u01CEng zh\xED	7	vn	cultivate|cultivation|further|encourage
\u79C1\u6709	s\u012B y\u01D2u	7	vn	private|privately-owned
\u6D82\u62B9	t\xFA m\u01D2	6	v	paint|smear|apply|doodle|erase|obliterate
\u4F24\u6B8B	sh\u0101ng c\xE1n	7	vn	disabled|maimed|crippled|damaged
\u7261\u4E39	m\u01D4 dan	7	n	tree peony
\u8BC0\u7A8D	ju\xE9 qi\xE0o	7	n	secret|trick|knack|key
\u4E2D\u5916	zh\u014Dng w\xE0i	6	b	sino-foreign|chinese-foreign|home and abroad
\u7701\u7565	sh\u011Bng lu:\xE8	7	v	leave out|omission
\u51C9\u5FEB	li\xE1ng kuai	2	a	nice and cold|pleasantly cool
\u5EB8\u4FD7	y\u014Dng s\xFA	7	a	vulgar|tacky|tawdry
\u6B21\u5E8F	c\xEC x\xF9	6	n	sequence|order
\u96F6\u82B1\u94B1	l\xEDng hu\u0101 qi\xE1n	7	n	pocket money|allowance
\u81EA\u7531\u81EA\u5728	z\xEC y\xF3u z\xEC z\xE0i	7	l	free and easy|carefree|leisurely
\u9760\u62E2	k\xE0o l\u01D2ng	7	v	draw close to
\u7EDD\u6280	ju\xE9 j\xEC	7	n	consummate skill|supreme feat|tour-de-force|stunt
\u7638	qu\xE9	6	v	lame
\u7279\u5FEB	t\xE8 ku\xE0i	6	b	express
\u816E	s\u0101i	6	n	cheek
\u80CC\u8BF5	b\xE8i s\xF2ng	7	v	recite|repeat from memory
\u758F\u901A	sh\u016B t\u014Dng	7	v	unblock|dredge|clear the way|get things flowing|facilitate|mediate|lobby|explicate
\u7A7A\u8361\u8361	k\u014Dng d\xE0ng d\xE0ng	7	z	empty|deserted
\u6108\u6F14\u6108\u70C8	y\xF9 y\u01CEn y\xF9 li\xE8	7	v	ever more critical
\u5468\u8F6C	zh\u014Du zhu\u01CEn	6	vn	rotate|circulate|turnover|circulation|cash flow
\u4E07\u65E0\u4E00\u5931	w\xE0n w\xFA y\u012B sh\u012B	7	v	surefire|absolutely safe
\u8352\u51C9	hu\u0101ng li\xE1ng	7	a	desolate
\u5BB9\u989C	r\xF3ng y\xE1n	7	n	mien|complexion
\u5173\u7A0E	gu\u0101n shu\xEC	7	n	customs duty|tariff
\u5DE5\u5546\u754C	g\u014Dng sh\u0101ng ji\xE8	7		industry|world of business
\u8D8B\u4E8E	q\u016B y\xFA	7	v	tend towards
\u5409\u666E	J\xED p\u01D4	7	n	jeep
\u4E00\u7ECF	y\u012B j\u012Bng	7	d	as soon as|once
\u5608\u6742	c\xE1o z\xE1	6	a	noisy|clamorous
\u8015\u5730	g\u0113ng d\xEC	7	n	arable land|plow land
\u8854\u63A5	xi\xE1n ji\u0113	7	v	link up|connect|join
\u51ED\u8BC1	p\xEDng zh\xE8ng	7	n	proof|certificate|receipt|voucher
\u9519\u4F4D	cu\xF2 w\xE8i	7	v	be wrongly positioned|be dislocated|be misplaced|be in malposition|erroneous|eccentric
\u6D4B\u7B97	c\xE8 su\xE0n	7	v	take measurements and calculate
\u56DB\u9762\u516B\u65B9	s\xEC mi\xE0n b\u0101 f\u0101ng	7	l	in all directions|all around|far and near
\u606F\u606F\u76F8\u5173	x\u012B x\u012B xi\u0101ng gu\u0101n	7	v	closely bound up|intimately related
\u4F9B\u6696	g\u014Dng nu\u01CEn	7	v	supply heating|heating
\u95FA\u5973	gu\u012B \u02D9nu:	7	n	maiden|unmarried woman|daughter
\u540D\u5229	m\xEDng l\xEC	7	n	fame and profit
\u515C\u552E	d\u014Du sh\xF2u	7	v	hawk|peddle
\u8DF3\u69FD	ti\xE0o c\xE1o	7	v	change jobs|job-hopping
\u6885\u82B1	m\xE9i hu\u0101	6	n	plum blossom|clubs \u2663|wintersweet
\u7956\u5B97	z\u01D4 z\u014Dng	7	n	ancestor|forebear
\u5254\u9664	t\u012B ch\xFA	7	v	reject|discard|get rid of
\u6C49\u5B57	h\xE0n z\xEC	1	nz	chinese character|japanese: kanji|korean: hanja|vietnamese: h\xE1n t\u1EF1
\u56ED\u6797	yu\xE1n l\xEDn	5	n	gardens|park|landscape garden
\u8FD1\u89C6	j\xECn sh\xEC	6	a	shortsighted|nearsighted|myopia
\u961F\u5F62	du\xEC x\xEDng	7	n	formation
\u60E8\u75DB	c\u01CEn t\xF2ng	7	a	bitter|painful|deeply distressed
\u53D6\u7F14	q\u01D4 d\xEC	7	v	suppress|crack down on|prohibit
\u7262\u9A9A	l\xE1o s\u0101o	6	n	discontent|complaint|complain
\u7F8E\u89C2	m\u011Bi gu\u0101n	7	a	pleasing to the eye|beautiful|artistic
\u591A\u6837	du\u014D y\xE0ng	4	m	diverse|diversity|manifold
\u603B\u800C\u8A00\u4E4B	z\u01D2ng \xE9r y\xE1n zh\u012B	7	c	in short|in a word|in brief
\u5348\u7761	w\u01D4 shu\xEC	2	v	take a nap|siesta
\u6CE2\u6F9C	b\u014D l\xE1n	7	n	billows|great waves
\u5939\u5B50	ji\u0101 zi	5	n	clip|clamp|tongs|folder|wallet
\u5355\u65B9\u9762	d\u0101n f\u0101ng mi\xE0n	7	d	unilateral
\u987D\u76AE	w\xE1n p\xED	6	a	naughty
\u65E0\u53EF\u5948\u4F55	w\xFA k\u011B n\xE0i h\xE9	7	v	have no way out|have no alternative
\u4F3A\u673A	s\xEC j\u012B	7	d	wait for an opportunity|watch for one's chance
\u62A1	l\u016Bn	7	v	swing (one's arms|heavy object)|wave|fling|select
\u5B9A\u4E3A	d\xECng w\xE8i	7	v	set to
\u6ED4\u6ED4\u4E0D\u7EDD	t\u0101o t\u0101o b\xF9 ju\xE9	7	v	unceasing torrent|talking non-stop
\u5F55\u97F3\u673A	l\xF9 y\u012Bn j\u012B	6	n	recording machine|tape recorder
\u5939\u6742	ji\u0101 z\xE1	6	v	mix together|mingle|mix|be tangled up with
\u96EA\u4E0A\u52A0\u971C	xu\u011B sh\xE0ng ji\u0101 shu\u0101ng	7	v	make matters even worse|add insult to injury
\u8F7B\u578B	q\u012Bng x\xEDng	7	b	light
\u8C1C\u56E2	m\xED tu\xE1n	7	n	riddle|enigma|unpredictable situation|elusive matters
\u5F0A\u7AEF	b\xEC du\u0101n	7	n	systemic problem
\u51FA\u5382	ch\u016B ch\u01CEng	7	v	leave the factory
\u707E\u533A	z\u0101i q\u016B	5	n	disaster area|stricken region
\u63A8\u5378	tu\u012B xi\xE8	7	v	avoid|shift|pass the buck
\u5BB6\u55BB\u6237\u6653	ji\u0101 y\xF9 h\xF9 xi\u01CEo	7	v	understood by everyone|well known|household name
\u836F\u7247	y\xE0o pi\xE0n	2	n	pill or tablet
\u5B66\u5E74	xu\xE9 ni\xE1n	4	n	academic year
\u804C\u4E1A\u75C5	zh\xED y\xE8 b\xECng	7	n	occupational disease
\u7279\u9080	t\xE8 y\u0101o	7	vn	special invitation
\u552E\u8D27\u5458	sh\xF2u hu\xF2 yu\xE1n	4	n	salesperson
\u7EE7\u800C	j\xEC \xE9r	7	c	then|afterwards
\u8C1C\u5E95	m\xED d\u01D0	7	n	answer to a riddle
\u611F\u6168	g\u01CEn k\u01CEi	7	v	rueful|deeply moved
\u5E94\u9080	y\xECng y\u0101o	7	v	at sb's invitation|on invitation
\u7EDD\u62DB	ju\xE9 zh\u0101o	7	n	unique skill|unexpected tricky move|masterstroke|finishing blow
\u9001\u884C	s\xF2ng x\xEDng	6	v	see someone off
\u8FC7\u5883	gu\xF2 j\xECng	7	v	transit
\u51B7\u95E8	l\u011Bng m\xE9n	7	n	neglected branch
\u5CB3\u6BCD	yu\xE8 m\u01D4	7	n	wife's mother, mother-in-law
\u7559\u5FF5	li\xFA ni\xE0n	7	v	keep as a souvenir|recall fondly
\u5927\u9762\u79EF	d\xE0 mi\xE0n j\u012B	7	d	large area|on a massive scale
\u521D\u4E00	ch\u016B y\u012B	3	n	new year's day
\u5927\u6B3E	d\xE0 ku\u01CEn	7	n	very wealthy person
\u840C\u82BD	m\xE9ng y\xE1	7	vn	sprout|bud|germinate|germ|seed
\u5976\u8336	n\u01CEi ch\xE1	3	n	milk tea
\u6977\u6A21	k\u01CEi m\xF3	7	n	model|example
\u4E00\u628A\u624B	y\u012B b\u01CE sh\u01D2u	7	n	working hand|participant
\u5F69\u7535	c\u01CEi di\xE0n	7	n	color tv
\u7A33\u59A5	w\u011Bn tu\u01D2	7	a	dependable
\u4E0D\u614E	b\xF9 sh\xE8n	7	d	incautious|inattentive
\u51CF\u514D	ji\u01CEn mi\u01CEn	7	v	reduce or waive
\u8F6C\u8F7D	zhu\u01CEn z\u01CEi	7	v	forward|reprint sth published elsewhere|taiwan pr
\u5C31\u9910	ji\xF9 c\u0101n	7	v	dine
\u5370\u8BC1	y\xECn zh\xE8ng	7	v	confirm|corroborate|verify|proof|evidence
\u5438\u7EB3	x\u012B n\xE0	7	v	take in|absorb|admit|accept
\u7834\u9664	p\xF2 ch\xFA	7	v	eliminate|do away with|get rid of
\u53EF\u60F3\u800C\u77E5	k\u011B xi\u01CEng \xE9r zh\u012B	7	v	it is obvious that
\u542F\u4E8B	q\u01D0 sh\xEC	5	n	announcement|post information|notice
\u5FC3\u9178	x\u012Bn su\u0101n	7	a	feel sad
\u6298\u5C04	zh\xE9 sh\xE8	7	v	refract|refraction|reflect
\u6444\u53D6	sh\xE8 q\u01D4	6	v	absorb|assimilate|intake|take a photograph of
\u9884\u5146	y\xF9 zh\xE0o	7	n	omen|sign|prior indication|foreshadow
\u6682\u4E14	z\xE0n qi\u011B	6	d	for now|for the time being|temporarily
\u529D\u544A	qu\xE0n g\xE0o	7	vn	advise|urge|exhort|exhortation|advice
\u7A20	ch\xF3u	7	a	dense|crowded|thick|many
\u9A6C\u864E	m\u01CE hu	7	a	careless|sloppy|negligent|skimpy
\u65FA\u5B63	w\xE0ng j\xEC	7	n	busy season|peak period
\u538B\u69A8	y\u0101 zh\xE0	6	v	press|squeeze
\u53CA\u65E9	j\xED z\u01CEo	7	d	as soon as possible
\u9886\u4E8B	l\u01D0ng sh\xEC	7	n	consul
\u65E5\u590D\u4E00\u65E5	r\xEC f\xF9 y\u012B r\xEC	7	v	day after day
\u97F3\u8282	y\u012Bn ji\xE9	2	n	syllable
\u83B2\u5B50	li\xE1n z\u01D0	7		lotus seed
\u98CE\u6D6A	f\u0113ng l\xE0ng	7	n	wind and waves|rough waters|hardship
\u5112\u5B66	R\xFA xu\xE9	7		confucianism
\u53CC\u8FB9	shu\u0101ng bi\u0101n	7	n	bilateral
\u5408\u8EAB	h\xE9 sh\u0113n	6	a	well-fitting
\u8003\u91CF	k\u01CEo li\xE1ng	7	v	consider|consideration
\u626B\u9664	s\u01CEo ch\xFA	7	v	sweep|clean with a brush|sweep away
\u731B\u7136	m\u011Bng r\xE1n	7	d	suddenly|abruptly
\u603B\u91CF	z\u01D2ng li\xE0ng	6	n	total|overall amount
\u7565\u5FAE	lu:\xE8 w\u0113i	7	d	little bit|slightly
\u4E0D\u5F97\u800C\u77E5	b\xF9 d\xE9 \xE9r zh\u012B	7	v	unknown|unable to find out
\u505C\u653E	t\xEDng f\xE0ng	7	v	park|moor|leave sth
\u97F5\u5473	y\xF9n w\xE8i	7	n	hinted appeal|interest
\u9ED8\u9ED8\u65E0\u95FB	m\xF2 m\xF2 w\xFA w\xE9n	7	v	obscure and unknown|outsider without any reputation|nobody|unknown quantity
\u9694\u9602	g\xE9 h\xE9	7	n	misunderstanding|estrangement|barrier
\u7535\u706F	di\xE0n d\u0113ng	4	n	electric light
\u8367\u5C4F	y\xEDng p\xEDng	6	n	fluorescent screen|tv screen
\u67FF\u5B50	sh\xEC zi	7	n	persimmon
\u5F53\u5373	d\u0101ng j\xED	7	d	at once|on the spot
\u51B0\u96F9	b\u012Bng b\xE1o	6	n	hail|hailstone
\u8010\u6027	n\xE0i x\xECng	7	n	patience
\u53E3\u8BED	k\u01D2u y\u01D4	4	n	colloquial speech|spoken language|vernacular language|slander|gossip
\u7599\u7629	g\u0113 da	6	n	pimple|knot|lump|preoccupation|problem
\u987A\u8DEF	sh\xF9n l\xF9	7	d	by the way|conveniently
\u628A\u67C4	b\u01CE b\u01D0ng	7	n	handle
\u6709\u6548\u671F	y\u01D2u xi\xE0o q\u012B	7	n	period of validity|sell-by date
\u4E45\u8FDD	ji\u01D4 w\xE9i	7	v	for a long time
\u52A1\u5B9E	w\xF9 sh\xED	7	v	pragmatic|dealing with concrete issues
\u60C5\u7406	q\xEDng l\u01D0	6	n	reason|sense
\u9762\u76EE\u5168\u975E	mi\xE0n m\xF9 qu\xE1n f\u0113i	7	l	nothing remains the same|change beyond recognition
\u6697\u5730\u91CC	\xE0n d\xEC li	7	d	secretly|inwardly|on the sly
\u98CE\u6C14	f\u0113ng q\xEC	7	n	general mood|atmosphere|common practice
\u4E2D\u7EA7	zh\u014Dng j\xED	2	b	middle level
\u5EA7\u8C08	zu\xF2 t\xE1n	7	v	have an informal discussion
\u4F9D\u6258	y\u012B tu\u014D	7	v	rely on|depend on|support
\u5883\u9047	j\xECng y\xF9	7	n	circumstance
\u8352\u8BDE	hu\u0101ng d\xE0n	7	a	beyond belief|incredible|preposterous|fantastic
\u9661	d\u01D2u	7	a	steep|precipitous|abrubtly|suddenly|unexpectedly
\u6709\u5E8F	y\u01D2u x\xF9	7	a	regular|orderly|successive|in order
\u63A8\u7B97	tu\u012B su\xE0n	7	v	calculate|reckon|extrapolate
\u5468\u6298	zh\u014Du zh\xE9	6	n	twists and turns|vicissitude|complication|difficulty|effort
\u6D41\u57DF	li\xFA y\xF9	7	n	river basin|valley|drainage area
\u5377\u5B50	ju\u01CEn zi	7	n	steamed roll|spring roll|test paper|examination paper
\u542F\u8FEA	q\u01D0 d\xED	7	vn	edify|enlightenment
\u52B3\u52A1	l\xE1o w\xF9	7	n	service|services
\u4E0D\u8A00\u800C\u55BB	b\xF9 y\xE1n \xE9r y\xF9	6	v	it goes without saying|it is self-evident
\u5C6F	t\xFAn	7	g	station|store up|village|difficult|stingy
\u7B79\u529E	ch\xF3u b\xE0n	7	v	arrange|make preparations
\u7231\u60DC	\xE0i x\u012B	7	v	cherish|treasure|use sparingly
\u76F8\u7B49	xi\u0101ng d\u011Bng	5	v	equal|equally|equivalent
\u50E7\u4EBA	s\u0113ng r\xE9n	7	n	monk
\u753B\u5C55	hu\xE0 zh\u01CEn	7	n	art exhibition
\u62B1\u8D1F	b\xE0o f\xF9	7	n	aspiration|ambition
\u9996\u6B21	sh\u01D2u c\xEC	6	m	first|first time|for the first time
\u81B3\u98DF	sh\xE0n sh\xED	7	n	meals|food
\u52C7\u5F80\u76F4\u524D	y\u01D2ng w\u01CEng zh\xED qi\xE1n	7	v	advance bravely
\u4E0B\u6D77	xi\xE0 h\u01CEi	7	v	go out to sea|enter the sea|take the plunge
\u624E\u6839	zh\u0101 g\u0113n	7	v	take root
\u5C71\u5BE8	sh\u0101n zh\xE0i	7	n	fortified hill village|mountain stronghold|knockoff|counterfeit|imitation
\u8C46\u6D46	d\xF2u ji\u0101ng	7	n	soy milk
\u60AC\u6B8A	xu\xE1n sh\u016B	7	a	widely different|large disparity
\u7A00\u5C11	x\u012B sh\u01CEo	7	a	sparse|rare
\u4E00\u70B9\u70B9	y\u012B di\u01CEn di\u01CEn	2	t	little bit
\u540D\u8D35	m\xEDng gu\xEC	7	a	famous and valuable|rare|precious
\u542F\u8499	q\u01D0 m\xE9ng	7	vn	instruct the young|initiate|awake sb from ignorance|primer|enlightened|enlightenment
\u8033\u76EE\u4E00\u65B0	\u011Br m\xF9 y\u012B x\u012Bn	7	l	pleasant change|breath of fresh air|refreshing
\u7126\u8E81	ji\u0101o z\xE0o	7	a	fretful|impatient
\u67A2\u7EBD	sh\u016B ni\u01D4	7	n	hub|hinge|pivot|fulcrum
\u9488\u950B\u76F8\u5BF9	zh\u0113n f\u0113ng xi\u0101ng du\xEC	7	l	tit for tat|measure for measure
\u52D8\u63A2	k\u0101n t\xE0n	7	vn	explore|survey|prospect|prospecting
\u67AF\u7AED	k\u016B ji\xE9	6	v	used up|dried up|exhausted
\u751F\u6015	sh\u0113ng p\xE0	7	v	fear|afraid|extremely nervous|for fear that|avoid|so as not to
\u7B54\u8FA9	d\xE1 bi\xE0n	7	vn	reply|defend one's dissertation
\u6BD4\u91CD	b\u01D0 zh\xF2ng	5	n	proportion|specific gravity
\u6B62\u54B3	zh\u01D0 k\xE9	7	vn	suppress coughing
\u53D7\u707E	sh\xF2u z\u0101i	5	v	disaster-stricken
\u4F7F\u5524	sh\u01D0 huan	7	v	order sb around|handle|taiwan pr
\u8FD1\u4EE3	j\xECn d\xE0i	4	t	not-very-distant past|capitalist times
\u80E1\u540C	h\xFA t\xF2ng	5	n	lane|alley
\u6D41\u8F6C	li\xFA zhu\u01CEn	7	vn	be on the move|roam or wander|circulate
\u6709\u671D\u4E00\u65E5	y\u01D2u zh\u0101o y\u012B r\xEC	7	l	one day|sometime in the future
\u5305\u5E87	b\u0101o b\xEC	6	v	shield|harbor|cover up
\u7C97\u7565	c\u016B lu:\xE8	7	a	rough|cursory
\u773C\u8272	y\u01CEn s\xE8	7	n	meaningful glance
\u516C\u9877	g\u014Dng q\u01D0ng	7	q	hectare
\u5F31\u52BF	ru\xF2 sh\xEC	7	n	vulnerable|weak
\u57AB\u5B50	di\xE0n zi	7	n	cushion|mat|pad
\u63D2\u56FE	ch\u0101 t\xFA	7	n	illustration
\u884D\u751F	y\u01CEn sh\u0113ng	7	v	give rise to|derive|derivative|derivation
\u8F7B\u8511	q\u012Bng mi\xE8	7	v	scornful|disdainful|contemptuous|pejorative|disdain|contempt
\u60C5\u6000	q\xEDng hu\xE1i	7	n	feelings|mood
\u8C26\u900A	qi\u0101n x\xF9n	7	a	humble|modest|unpretentious|modesty
\u5229\u5BB3	l\xEC hai	7	n	terrible|formidable|serious|devastating|tough|capable|sharp|severe
\u5021\u8BAE	ch\xE0ng y\xEC	7	n	suggest|initiate|proposal|initiative
\u8C0B\u6C42	m\xF3u qi\xFA	7	v	seek|strive for
\u7070\u5FC3	hu\u012B x\u012Bn	7	a	lose heart|be discouraged
\u53D8\u6545	bi\xE0n g\xF9	6	n	unforeseen event|accident|misfortune
\u51D1\u5DE7	c\xF2u qi\u01CEo	7	a	fortuitously|luckily|as chance has it
\u514D\u4E0D\u4E86	mi\u01CEn b\xF9 li\u01CEo	7	v	unavoidable|can't be avoided
\u4EBA\u5747	r\xE9n j\u016Bn	7	a	per capita
\u5929\u957F\u5730\u4E45	ti\u0101n ch\xE1ng d\xEC ji\u01D4	7	v	eternal
\u82AC\u82B3	f\u0113n f\u0101ng	7	n	perfume|fragrant
\u6295\u5C04	t\xF3u sh\xE8	7	v	throw|cast
\u5B58\u5FC3	c\xFAn x\u012Bn	7	d	deliberately
\u71A8	y\xF9	6	v	reconciled|smooth|iron
\u8BEC\u9677	w\u016B xi\xE0n	6	v	entrap|frame
\u51C9\u978B	li\xE1ng xi\xE9	6	n	sandal
\u7597\u517B	li\xE1o y\u01CEng	4	v	get well|heal|recuperate|convalesce|convalescence|nurse
\u843D\u6210	lu\xF2 ch\xE9ng	6	v	complete a construction project
\u4E2D\u578B	zh\u014Dng x\xEDng	7	b	medium sized
\u6D53\u90C1	n\xF3ng y\xF9	7	a	rich|strong|heavy|dense|full-bodied|intense
\u8BBA\u8FF0	l\xF9n sh\xF9	7	vn	treatise|discourse|exposition
\u8131\u8282	tu\u014D ji\xE9	7	v	come apart
\u4E0D\u7531\u5F97	b\xF9 y\xF3u de	7	d	can't help|cannot but
\u6C89\u6DC0	ch\xE9n di\xE0n	7	v	settle|precipitate|sedimentation
\u96BE\u5904	n\xE1n chu	7	n	trouble|difficulty|problem
\u9ED1\u5FC3	h\u0113i x\u012Bn	7	n	black core
\u8346\u68D8	j\u012Bng j\xED	7	n	thistles and thorns|brambles|thorny undergrowth
\u96CC\u96C4	c\xED xi\xF3ng	6	n	male and female
\u8D54\u94B1	p\xE9i qi\xE1n	7	v	lose money|pay for damages
\u8574\u85CF	y\xF9n c\xE1ng	7	v	hold in store|contain
\u672C\u671F	b\u011Bn q\u012B	6	r	current period|this term
\u62D0\u5F2F	gu\u01CEi w\u0101n	7	v	go round a curve|turn a corner|fig. a new direction
\u6CB3\u7554	h\xE9 p\xE0n	7	n	riverside|river plain
\u65E5\u8D8B	r\xEC q\u016B	7	d	day by day|with every passing day|gradually
\u7279\u4EA7	t\xE8 ch\u01CEn	7	n	special local product|specialty
\u7834\u4F8B	p\xF2 l\xEC	6	v	make an exception
\u9605\u5386	yu\xE8 l\xEC	7	n	experience
\u7075\u5DE7	l\xEDng qi\u01CEo	7	a	deft|nimble|ingenious
\u8D70\u6295\u65E0\u8DEF	z\u01D2u t\xF3u w\xFA l\xF9	7	l	be at an impasse|in a tight spot|desperate
\u6307\u6559	zh\u01D0 ji\xE0o	7	v	give advice or comments
\u80FD\u4EBA	n\xE9ng r\xE9n	7	n	capable person
\u6DE1\u5316	d\xE0n hu\xE0	7	v	water down|play down|trivialize|weaken|become dull with time|desalinate|desalination
\u906E\u76D6	zh\u0113 g\xE0i	7	v	hide|cover
\u5229\u7D22	l\xEC suo	7	a	nimble
\u5174\u9AD8\u91C7\u70C8	x\xECng g\u0101o c\u01CEi li\xE8	7	l	happy and excited|in high spirits|in great delight
\u94F6\u724C	y\xEDn p\xE1i	3	n	silver medal
\u7EA2\u8336	h\xF3ng ch\xE1	3	n	black tea
\u5927\u718A\u732B	d\xE0 xi\xF3ng m\u0101o	5	n	giant panda
\u6B8B\u7F3A	c\xE1n qu\u0113	7	v	badly damaged|shattered
\u4E61\u9547	xi\u0101ng zh\xE8n	6	n	village|township
\u6709\u6761\u4E0D\u7D0A	y\u01D2u ti\xE1o b\xF9 w\u011Bn	6	l	regular and thorough|methodically arranged
\u5174\u65FA	x\u012Bng w\xE0ng	6	a	prosperous|thriving|prosper|flourish
\u5927\u8857\u5C0F\u5DF7	d\xE0 ji\u0113 xi\u01CEo xi\xE0ng	7	l	everywhere in the city
\u9000\u6B65	tu\xEC b\xF9	5	v	make a concession|setback|backward step|leeway|room to maneuver|fallback
\u7B2C\u4E00\u624B	d\xEC y\u012B sh\u01D2u	7	b	first-hand
\u7740\u843D	zhu\xF3 lu\xF2	7	n	whereabouts|place to settle|reliable source|rest with sb|settlement|solution
\u5C94	ch\xE0	6	v	fork in road|bifurcation|branch off|turn off|diverge|stray|change the subject|interrupt
\u8D76\u8D74	g\u01CEn f\xF9	7	v	hurry|rush
\u76F8\u6BD4\u4E4B\u4E0B	xi\u0101ng b\u01D0 zh\u012B xi\xE0	7	v	by comparison
\u914D\u9001	p\xE8i s\xF2ng	7	v	deliver
\u88C5\u5378	zhu\u0101ng xi\xE8	6	vn	load or unload|transfer|assemble and disassemble
\u4E61\u4EB2	xi\u0101ng q\u012Bn	7	n	fellow countryman|local people|villager|folks back home
\u51FA\u5177	ch\u016B j\xF9	7	v	issue|provide
\u51F6\u6076	xi\u014Dng \xE8	7	a	fierce|ferocious|fiendish|frightening
\u6839\u57FA	g\u0113n j\u012B	7	n	foundation
\u517B\u8001\u9662	y\u01CEng l\u01CEo yu\xE0n	7	n	nursing home
\u751F\u9508	sh\u0113ng xi\xF9	6	v	rust|grow rusty|corrode|oxidization
\u9690\u6027	y\u01D0n x\xECng	7	b	hidden|crypto-|recessive
\u8BF7\u8FDB	q\u01D0ng j\xECn	1		"please come in"
\u970D\u4E71	hu\xF2 lu\xE0n	7	n	cholera
\u6253\u78E8	d\u01CE m\xF3	7	v	polish|burnish|shine
\u7A7A\u96BE	k\u014Dng n\xE0n	7	n	air crash|aviation accident or incident
\u624B\u7EED\u8D39	sh\u01D2u x\xF9 f\xE8i	6	n	service charge|processing fee|commission
\u68B3\u5B50	sh\u016B zi	7	n	comb
\u4FD8\u83B7	f\xFA hu\xF2	7	v	capture
\u6728\u5320	m\xF9 ji\xE0ng	7	n	carpenter
\u90AE\u7F16	y\xF3u bi\u0101n	7	n	postal code|zip code
\u5C01\u5EFA	f\u0113ng ji\xE0n	7	a	system of enfeoffment|feudalism|feudal|feudalistic
\u7A98\u8FEB	ji\u01D2ng p\xF2	7	a	poverty-stricken|very poor|hard-pressed|in a predicament|embarrassed
\u901A\u7EA2	t\u014Dng h\xF3ng	6	z	very red|red through and through|blush
\u5E38\u6001	ch\xE1ng t\xE0i	7	n	normal state
\u4E16\u6545	sh\xEC gu	7	a	sophisticated|worldly-wise|ways of the world
\u63A8\u9009	tu\u012B xu\u01CEn	7	v	elect|choose
\u626B\u5174	s\u01CEo x\xECng	7	a	spoil things|dampen spirits|feel deflated|be dispirited
\u4E2D\u534E	Zh\u014Dng hu\xE1	6	nz	china
\u6DF1\u5965	sh\u0113n \xE0o	7	a	profound|abstruse|recondite|profoundly
\u51FA\u606F	ch\u016B xi	7	n	future prospects|profit|mature|grow up|yield interest, profit etc|exhale
\u901E\u5F3A	ch\u011Bng qi\xE1ng	7	v	show off|try to be brave
\u6269\u5145	ku\xF2 ch\u014Dng	6	v	expand
\u6CA1\u843D	m\xF2 lu\xF2	7	v	decline|wane
\u6069\u60E0	\u0113n hu\xEC	7	n	favor|grace
\u4E00\u4E1D\u4E0D\u82DF	y\u012B s\u012B b\xF9 g\u01D2u	6	v	not one thread loose|meticulous
\u591F\u545B	g\xF2u qi\xE0ng	7	v	unbearable|terrible|enough|unlikely
\u4E25\u5BD2	y\xE1n h\xE1n	6	an	bitter cold|severe winter
\u65C1\u89C2	p\xE1ng gu\u0101n	7	v	spectator|non-participant
\u626D\u5934	ni\u01D4 t\xF3u	7	v	turn one's head|turn around
\u96C4\u4F1F	xi\xF3ng w\u011Bi	5	a	grand|imposing|magnificent|majestic
\u5BD2\u5047	h\xE1n ji\xE0	4	t	winter vacation
\u5D07\u656C	ch\xF3ng j\xECng	6	v	revere|venerate|high esteem
\u78C1\u76D8	c\xED p\xE1n	7	n	disk
\u6CA7\u6851	c\u0101ng s\u0101ng	7	n	great changes|ups and downs|vicissitudes
\u529D\u963B	qu\xE0n z\u01D4	7	v	advise against|dissuade
\u5C79\u7ACB	y\xEC l\xEC	7	v	tower|stand straight
\u6CE8\u91CA	zh\xF9 sh\xEC	6	n	annotate|add a comment|explanatory note|annotation
\u6C89\u7A33	ch\xE9n w\u011Bn	7	a	steady|calm|unflustered
\u60CA\u5FC3\u52A8\u9B44	j\u012Bng x\u012Bn d\xF2ng p\xF2	7	v	heart-stopping|hair-raising|breathtaking
\u5355\u8584	d\u0101n b\xF3	7	a	weak|frail|thin|flimsy
\u5931\u4E1A\u7387	sh\u012B y\xE8 l\u01DC	7	n	unemployment rate
\u77EE\u5C0F	\u01CEi xi\u01CEo	4	a	short and small|low and small|undersized
\u4E00\u5473	y\u012B w\xE8i	7	d	blindly|invariably
\u548C\u6C14	h\xE9 qi	7	a	friendly|polite|amiable
\u8DDF\u4E0A	g\u0113n sh\xE0ng	7	v	catch up with|keep pace with
\u5EA7\u53F3\u94ED	zu\xF2 y\xF2u m\xEDng	7	n	motto|maxim
\u63D2\u5634	ch\u0101 zu\u01D0	7	v	interrupt|butt in|cut into a conversation
\u529B\u56FE	l\xEC t\xFA	6	v	try hard to|strive to
\u656C\u9152	j\xECng ji\u01D4	7	v	toast|propose a toast
\u516C\u4EC6	g\u014Dng p\xFA	7	n	public servant
\u8896\u624B\u65C1\u89C2	xi\xF9 sh\u01D2u p\xE1ng gu\u0101n	7	v	watch with folded arms
\u529B\u4E0D\u4ECE\u5FC3	l\xEC b\xF9 c\xF3ng x\u012Bn	7	v	less capable than desirable
\u62D8\u675F	j\u016B sh\xF9	7	a	restrict|restrain|constrained|awkward|ill at ease|uncomfortable|reticent
\u98D9\u5347	bi\u0101o sh\u0113ng	7	v	rise rapidly|soar
\u7F29\u5F71	su\u014D y\u01D0ng	7	n	miniature version of sth|microcosm|epitome|microfilm
\u4EBA\u6C11\u5E01	r\xE9n m\xEDn b\xEC	3	n	renminbi|chinese yuan
\u5B8C\u5907	w\xE1n b\xE8i	7	a	faultless|complete|perfect
\u505C\u6CCA	t\xEDng b\xF3	7	v	anchor|anchorage|mooring
\u95F2\u8BDD	xi\xE1n hu\xE0	6	n	casual conversation|chat|gossip|talk about
\u5DEE\u70B9\u513F	ch\xE0 di\u01CEn r	5	d	almost|nearly
\u8F83\u52B2	ji\xE0o j\xECn	7	v	match one's strength with|compete|more competitive|set oneself against sb|disobliging|make a special effort
\u7C97\u5FC3	c\u016B x\u012Bn	4	a	careless|thoughtless
\u516C\u804C	g\u014Dng zh\xED	7	n	civil service|public office|government job
\u4FEE\u8DEF	xi\u016B l\xF9	7	v	repair a road
\u5212\u8239	hu\xE1 chu\xE1n	3	v	row a boat|rowing boat|rowing
\u81EA\u7406	z\xEC l\u01D0	7	v	take care of oneself|provide for oneself
\u76D6\u7AE0	g\xE0i zh\u0101ng	6	v	affix a seal|stamp|sign off on sth
\u76F4\u89C2	zh\xED gu\u0101n	7	a	direct observation|intuitive|audiovisual
\u683C\u683C\u4E0D\u5165	g\xE9 g\xE9 b\xF9 r\xF9	7	v	inharmonious|incompatible
\u6253\u6405	d\u01CE ji\u01CEo	7	v	disturb|trouble|bother
\u6E38\u8239	y\xF3u chu\xE1n	7	n	pleasure boat|cruise ship
\u5237\u5B50	shu\u0101 zi	4	n	brush|scrub
\u53E4\u8FF9	g\u01D4 j\xEC	7	n	places of historic interest|historical sites
\u7167\u529E	zh\xE0o b\xE0n	7	v	follow the rules|do as instructed|play by the book|comply with a request
\u5408\u60C5\u5408\u7406	h\xE9 q\xEDng h\xE9 l\u01D0	7	l	reasonable and fair
\u8C41\u51FA\u53BB	hu\u014D chu qu	7	v	press one's luck|go for broke
\u767E\u5206\u6BD4	b\u01CEi f\u0113n b\u01D0	7	n	percentage
\u6069\u4EBA	\u0113n r\xE9n	6	n	benefactor
\u53D1\u8D77\u4EBA	f\u0101 q\u01D0 r\xE9n	7	n	proposer|initiator|founding member
\u606D\u656C	g\u014Dng j\xECng	6	a	deferential|respectful
\u6D77\u85FB	h\u01CEi z\u01CEo	7	n	seaweed|marine alga|kelp
\u7D27\u7F29	j\u01D0n su\u014D	7	v	reduce|curtail|cut back|tighten|austerity|tightening|crunch
\u4E0A\u706B	sh\xE0ng hu\u01D2	7	v	get angry
\u6210\u95EE\u9898	ch\xE9ng w\xE8n t\xED	7	v	be a problem|problematic|questionable
\u8D77\u8DD1\u7EBF	q\u01D0 p\u01CEo xi\xE0n	7	n	starting line|scratch line
\u6C34\u843D\u77F3\u51FA	shu\u01D0 lu\xF2 sh\xED ch\u016B	7	l	as the water recedes|rocks appear|truth comes to light
\u53D1\u6E90\u5730	f\u0101 yu\xE1n d\xEC	7	n	place of origin|birthplace|source
\u987A\u7406\u6210\u7AE0	sh\xF9n l\u01D0 ch\xE9ng zh\u0101ng	7	v	logical|only to be expected|rational and clearly structured
\u6258\u8FD0	tu\u014D y\xF9n	6	v	consign|check through
\u7EE7\u7236	j\xEC f\xF9	7	n	stepfather
\u7115\u53D1	hu\xE0n f\u0101	7	v	shine|glow|irradiate|flash
\u6069\u8D50	\u0113n c\xEC	7	vn	favor
\u553E\u6CAB	tu\xF2 mo	6	n	spittle|saliva
\u906D\u6B83	z\u0101o y\u0101ng	7	v	suffer a calamity
\u7EB5\u89C2	z\xF2ng gu\u0101n	7	v	survey comprehensively|overall survey
\u96BE\u70B9	n\xE1n di\u01CEn	7	n	difficulty
\u62DB\u63FD	zh\u0101o l\u01CEn	7	v	attract|drum up
\u8FFD\u60BC\u4F1A	zhu\u012B d\xE0o hu\xEC	7	n	memorial service|funeral service
\u52A9\u5A01	zh\xF9 w\u0113i	7	v	cheer for|encourage|boost the morale of
\u8F6C\u5B66	zhu\u01CEn xu\xE9	7	v	change schools|transfer to another college
\u8C03\u5242	ti\xE1o j\xEC	6	v	adjust|balance
\u539F\u88C5	yu\xE1n zhu\u0101ng	7	b	genuine|intact in original packaging
\u8FD8\u6B3E	hu\xE1n ku\u01CEn	7	v	repayment|pay back money
\u5F00\u660E	k\u0101i m\xEDng	6	a	enlightened|open-minded|enlightenment
\u9776\u5B50	b\u01CE zi	7	n	target
\u4EA7\u5730	ch\u01CEn d\xEC	7	n	source|place of origin|manufacturing location
\u6C14\u9981	q\xEC n\u011Bi	7	a	be discouraged
\u96F6\u661F	l\xEDng x\u012Bng	6	a	fragmentary|random|bits and pieces|sporadic
\u5954\u8D74	b\u0113n f\xF9	7	v	rush to|hurry to
\u6EE8\u6D77	B\u012Bn h\u01CEi	7	n	binhai|primorsky|coastal|bordering the sea
\u53E3\u54E8	k\u01D2u sh\xE0o	7	n	whistle
\u8230\u8247	ji\xE0n t\u01D0ng	6	n	warship|naval vessel
\u53D7\u60CA	sh\xF2u j\u012Bng	7	v	startled
\u6765\u5E74	l\xE1i ni\xE1n	7	t	next year|coming year
\u5B64\u96F6\u96F6	g\u016B l\xEDng l\xEDng	7	z	lone|isolated and without help|all alone|solitary
\u5356\u5F04	m\xE0i nong	7	v	show off|make a display of
\u6BD4\u8BD5	b\u01D0 sh\xEC	7	v	have a competition
\u5927\u540D\u9F0E\u9F0E	d\xE0 m\xEDng d\u01D0ng d\u01D0ng	7	v	grand reputation|renowned|famous
\u6839\u6CBB	g\u0113n zh\xEC	7	v	bring under permanent control|effect a radical cure
\u597D\u5BB6\u4F19	h\u01CEo ji\u0101 huo	7	e	my god|oh boy|man
\u5C31\u8FD1	ji\xF9 j\xECn	7	d	nearby|in a close neighborhood
\u56FD\u5B9D	gu\xF3 b\u01CEo	7	n	national treasure
\u591A\u65B9\u9762	du\u014D f\u0101ng mi\xE0n	6	n	many-sided|in many aspects
\u8001\u5B9E\u8BF4	l\u01CEo sh\xED shu\u014D	7		honestly speaking|be frank,
\u7814\u8BA8	y\xE1n t\u01CEo	7	vn	discussion
\u4E00\u4E8B\u65E0\u6210	y\u012B sh\xEC w\xFA ch\xE9ng	7	v	have achieved nothing|be a total failure|get nowhere
\u7FFB\u5929\u8986\u5730	f\u0101n ti\u0101n f\xF9 d\xEC	7	l	fig. complete confusion
\u9010\u5E74	zh\xFA ni\xE1n	7	d	year after year|with each passing year|over the years
\u7740\u51C9	zh\xE1o li\xE1ng	5	v	catch cold|taiwan pr
\u6761\u7406	ti\xE1o l\u01D0	6	n	arrangement|order|tidiness
\u706B\u5019	hu\u01D2 hou	7	n	heat control|mastery|crucial moment
\u6CE2\u6298	b\u014D zh\xE9	7	n	twists and turns
\u54C1\u884C	p\u01D0n x\xEDng	7	n	behavior|moral conduct
\u5408\u8D44	h\xE9 z\u012B	7	vn	joint venture
\u987A\u5E94	sh\xF9n y\xECng	7	v	comply|conform to|in tune with|adapting to|adjust to
\u7D27\u7F3A	j\u01D0n qu\u0113	7	a	in short supply|scarce
\u4E24\u5CB8	li\u01CEng \xE0n	5	n	bilateral|both shores|both sides|both coasts|taiwan and mainland
\u6316\u82E6	w\u0101 k\u01D4	7	v	speak sarcastically|make cutting remarks|also pr
\u6028\u6C14	yu\xE0n q\xEC	7	n	grievance|resentment|complaint
\u82E6\u7EC3	k\u01D4 li\xE0n	7	v	train hard|practice diligently|hard work|blood, sweat, and tears
\u7126\u8DDD	ji\u0101o j\xF9	7	n	focal length|focal distance
\u6D0B\u6EA2	y\xE1ng y\xEC	7	v	brimming with|steeped in
\u7ACB\u65B9	l\xEC f\u0101ng	7	q	cube
\u96BE\u4E3A\u60C5	n\xE1n w\xE9i q\xEDng	7	a	embarrassed
\u6CE5\u6F6D	n\xED t\xE1n	7	n	quagmire
\u4F55\u82E6	h\xE9 k\u01D4	7	d	why bother
\u5DF4\u4E0D\u5F97	b\u0101 bu de	7	v	be eager for|long for|look forward to
\u5927\u4F53\u4E0A	d\xE0 t\u01D0 sh\xE0ng	7	d	overall|in general terms
\u8865\u8BFE	b\u01D4 k\xE8	6	v	make up missed lesson|reschedule a class
\u5B9D\u5E93	b\u01CEo k\xF9	7	n	treasure-house|treasury|treasure-trove
\u5FCC\u8BB3	j\xEC hu\xEC	7	v	taboo|avoid as taboo|abstain from
\u5B8F\u89C2	h\xF3ng gu\u0101n	7	n	macro-|macroscopic|holistic
\u4FDD\u4FEE	b\u01CEo xi\u016B	7	v	guarantee|warranty
\u795E\u6001	sh\xE9n t\xE0i	7	n	appearance|manner|bearing|deportment|look|expression|mien
\u7701\u4E8B	x\u01D0ng sh\xEC	7	a	perceptive|understanding|handle administrative work|simplify matters|save trouble
\u9996\u521B	sh\u01D2u chu\xE0ng	7	v	create|original creation
\u5BFC\u706B\u7D22	d\u01CEo hu\u01D2 su\u01D2	7	n	fuse
\u78E8\u5408	m\xF3 h\xE9	7	v	break in|wear in
\u559C\u4E8B	x\u01D0 sh\xEC	7	n	happy occasion|wedding
\u4EA4\u54CD\u4E50	ji\u0101o xi\u01CEng yu\xE8	7	n	symphony
\u5F62\u5F62\u8272\u8272	x\xEDng x\xEDng s\xE8 s\xE8	7	l	all kinds of|all sorts of|every kind of
\u6295\u5954	t\xF3u b\xE8n	7	v	seek shelter|seek asylum
\u98D8\u626C	pi\u0101o y\xE1ng	6	v	wave|flutter|fly
\u74DC\u5B50	gu\u0101 z\u01D0	7	n	melon seed
\u6655\u8F66	y\xF9n ch\u0113	6	v	be carsick
\u65F1	h\xE0n	7	a	drought
\u8C08\u8D77	t\xE1n q\u01D0	7	v	mention|speak of|talk about
\u753B\u518C	hu\xE0 c\xE8	7	n	picture album
\u8C03\u63A7	ti\xE1o k\xF2ng	7	vn	regulate|control
\u65E5\u524D	r\xEC qi\xE1n	7	t	other day|few days ago
\u6307\u624B\u753B\u811A	zh\u01D0 sh\u01D2u hu\xE0 ji\u01CEo	7	l	gesticulate while talking
\u5F00\u53D1\u533A	k\u0101i f\u0101 q\u016B	7	n	development zone
\u6625\u8282	Ch\u016Bn ji\xE9	2	t	spring festival
\u8F9E\u5448	c\xED ch\xE9ng	7	n	resignation
\u6CC4\u6C14	xi\xE8 q\xEC	7	v	leak|be discouraged|despair|pathetic|vent one's anger|be flat
\u5632\u5F04	ch\xE1o n\xF2ng	7	v	tease|poke fun at|make fun of
\u503E\u9500	q\u012Bng xi\u0101o	7	v	dump
\u6765\u9F99\u53BB\u8109	l\xE1i l\xF3ng q\xF9 m\xE0i	7	l	whole sequence of events|causes and effects
\u8EAB\u4E0D\u7531\u5DF1	sh\u0113n b\xF9 y\xF3u j\u01D0	7	v	involuntary|in spite of oneself
\u4E0D\u5E73	b\xF9 p\xEDng	7	a	uneven|injustice|unfairness|wrong|grievance|indignant|dissatisfied
\u76F8\u4F20	xi\u0101ng chu\xE1n	7	v	pass on|hand down|tradition has it that|according to legend
\u767B\u673A\u724C	d\u0113ng j\u012B p\xE1i	5	n	boarding pass
\u96BE\u8BF4	n\xE1n shu\u014D	7	v	hard to tell
\u7EAA\u5B9E	j\xEC sh\xED	7	n	record of actual events|documentary
\u5C42\u51FA\u4E0D\u7A77	c\xE9ng ch\u016B b\xF9 qi\xF3ng	7	v	more and more emerge|innumerable succession|breeding like flies
\u5E02\u573A\u7ECF\u6D4E	sh\xEC ch\u01CEng j\u012Bng j\xEC	7	n	market economy
\u72EC\u5531	d\xFA ch\xE0ng	7	vn	solo
\u5C31\u5EA7	ji\xF9 zu\xF2	7	v	take a seat
\u7531\u6765	y\xF3u l\xE1i	7	n	origin
\u7A74\u4F4D	xu\xE9 w\xE8i	7	n	acupuncture point|location of a grave
\u786C\u6717	y\xECng l\u01CEng	7	a	robust|healthy
\u7ED5\u884C	r\xE0o x\xEDng	7	v	take a circular route|do a circuit|orbit|circumnavigate|take a detour|bypass
\u4E0D\u600E\u4E48\u6837	b\xF9 z\u011Bn me y\xE0ng	6		not up to much|very indifferent|nothing great about it
\u5F00\u573A\u767D	k\u0101i ch\u01CEng b\xE1i	7	n	prologue of play|opening remarks|preamble
\u4EA4\u7EB3	ji\u0101o n\xE0	7	v	pay
\u6BCD\u8BED	m\u01D4 y\u01D4	6	n	native language|mother tongue|parent language
\u544A\u72B6	g\xE0o zhu\xE0ng	7	v	tell on sb|complain (to a teacher|superior etc)|bring a lawsuit
\u8FC7\u534A	gu\xF2 b\xE0n	7	v	over fifty percent|more than half
\u7ACB\u4EA4\u6865	l\xEC ji\u0101o qi\xE1o	7	n	overpass|flyover
\u767E\u79D1\u5168\u4E66	b\u01CEi k\u0113 qu\xE1n sh\u016B	7	n	encyclopedia
\u8BF7\u67EC	q\u01D0ng ji\u01CEn	7	n	invitation card|written invitation
\u8BF4\u767D\u4E86	shu\u014D b\xE1i le	7		speak frankly
\u5403\u82E6	ch\u012B k\u01D4	7	v	bear hardships
\u697C\u9053	l\xF3u d\xE0o	6	n	corridor|passageway
\u4E0D\u96BE	b\xF9 n\xE1n	7	d	not difficult
\u7EFF\u5316	l\u01DC hu\xE0	6	v	make green with plants|reforest|islamization
\u60CA\u5929\u52A8\u5730	j\u012Bng ti\u0101n d\xF2ng d\xEC	7	v	world-shaking
\u901A\u8F66	t\u014Dng ch\u0113	7	v	open to traffic|have a transportation service|commute
\u73CD\u89C6	zh\u0113n sh\xEC	7	v	place great importance on|treasure
\u9C9C\u7F8E	xi\u0101n m\u011Bi	7	a	delicious|tasty
\u4E2D\u836F	zh\u014Dng y\xE0o	5	n	traditional chinese medicine
\u957F\u77ED	ch\xE1ng du\u01CEn	6	n	length|accident|mishap|right and wrong|good and bad|merits and demerits
\u80C6\u5C0F\u9B3C	d\u01CEn xi\u01CEo gu\u01D0	5	n	coward
\u7A3F\u4EF6	g\u01CEo ji\xE0n	6	n	manuscript|article
\u8D77\u52B2	q\u01D0 j\xECn	7	a	energetic|vigorous|enthusiastic
\u75C7\u7ED3	zh\u0113ng ji\xE9	7	n	crux of an issue|sticking point|deadlock in negotiations
\u65AD\u65AD\u7EED\u7EED	du\xE0n du\xE0n x\xF9 x\xF9	7	l	intermittent|off and on|discontinuous|stop-go|stammering|disjointed|inarticulate
\u6C34\u69FD	shu\u01D0 c\xE1o	7	n	sink
\u6EDE\u540E	zh\xEC h\xF2u	7	v	lag behind
\u4EFF\u5236	f\u01CEng zh\xEC	7	v	copy|imitate
\u672C\u5206	b\u011Bn f\xE8n	7	n	one's part|one's role|one's duty|one's bounds|dutiful|keeping to one's role
\u7EDF\u7B79	t\u01D2ng ch\xF3u	7	v	overall plan
\u6587\u96C5	w\xE9n y\u01CE	7	a	elegant|refined
\u4E00\u5E72\u4E8C\u51C0	y\u012B g\u0101n \xE8r j\xECng	7	l	thoroughly|completely|one and all|very clean
\u5C3C\u9F99	n\xED l\xF3ng	7	n	nylon
\u7B1B\u5B50	d\xED zi	7	n	bamboo flute
\u5E74\u9650	ni\xE1n xi\xE0n	7	n	age limit|fixed number of years
\u9001\u522B	s\xF2ng bi\xE9	7	v	farewell
\u534E\u88D4	Hu\xE1 y\xEC	7	n	ethnic chinese
\u8D81\u65E9	ch\xE8n z\u01CEo	7	d	as soon as possible|at the first opportunity|sooner the better|before it's too late
\u52B2\u5934	j\xECn t\xF3u	7	n	enthusiasm|zeal|vigor|strength
\u5BD2\u6684	h\xE1n xu\u0101n	6	v	exchange conventional greetings|exchange pleasantries
\u65F6\u9694	sh\xED g\xE9	7	v	separated in time
\u7EE7\u6BCD	j\xEC m\u01D4	7	n	stepmother
\u5A01\u671B	w\u0113i w\xE0ng	6	n	prestige
\u4F2F\u7236	b\xF3 f\xF9	7	n	father's elder brother
\u610F\u6599\u4E4B\u5916	y\xEC li\xE0o zh\u012B w\xE0i	7		contrary to expectation|unexpected
\u8D85\u8F66	ch\u0101o ch\u0113	7	v	overtake
\u62B9\u6740	m\u01D2 sh\u0101	6	v	erase|cover traces|obliterate evidence|expunge|blot out|suppress
\u76C6\u5730	p\xE9n d\xEC	6	n	basin|depression
\u57FA\u672C\u529F	j\u012B b\u011Bn g\u014Dng	7	n	basic skills|fundamentals
\u7B97\u76D8	su\xE0n p\xE1n	7	n	abacus|plan|scheme
\u58F0\u8C03	sh\u0113ng di\xE0o	5	n	tone|note
\u9002\u91CF	sh\xEC li\xE0ng	7	a	appropriate amount
\u523A\u9AA8	c\xEC g\u01D4	7	z	piercing|cutting|bone-chilling|penetrating
\u9EBB\u8FA3	m\xE1 l\xE0	7	z	hot and numbing
\u53EE\u5631	d\u012Bng zh\u01D4	7	v	warn repeatedly|urge|exhort again and again
\u998B	ch\xE1n	7	a	gluttonous|greedy|have a craving
\u518D\u63A5\u518D\u5389	z\xE0i ji\u0113 z\xE0i l\xEC	6	v	continue the struggle|persist|unremitting efforts
\u5168\u957F	qu\xE1n ch\xE1ng	7	n	overall length|span
\u906E\u6321	zh\u0113 d\u01CEng	6	v	shelter|shelter from
\u5201\u96BE	di\u0101o n\xE0n	7	v	be hard on sb|deliberately make things difficult|taiwan pr
\u9886\u4E8B\u9986	l\u01D0ng sh\xEC gu\u01CEn	7	n	consulate
\u5916\u7C4D	w\xE0i j\xED	7	n	foreign
\u822A\u5929\u5458	h\xE1ng ti\u0101n yu\xE1n	7	n	astronaut
\u4E0D\u4EE5\u4E3A\u7136	b\xF9 y\u01D0 w\xE9i r\xE1n	7	v	object|disapprove|take exception to
\u7FFB\u756A	f\u0101n f\u0101n	7	v	double
\u7316\u72C2	ch\u0101ng ku\xE1ng	7	a	savage|furious
\u56FD\u753B	gu\xF3 hu\xE0	7		traditional chinese painting
\u5014	ju\xE8	7	a	gruff|surly
\u597D\u73A9\u513F	h\u01CEo w\xE1n r	1	a	amusing|fun|interesting
\u54C6\u55E6	du\u014D suo	7	v	tremble|shiver
\u632F\u5174	zh\xE8n x\u012Bng	7	v	revive|revitalize|invigorate|re-energize
\u594B\u52C7	f\xE8n y\u01D2ng	7	d	dauntless
\u58EE\u4E3D	zhu\xE0ng l\xEC	7	a	magnificence|magnificent|majestic|glorious
\u6CB8\u6CB8\u626C\u626C	f\xE8i f\xE8i y\xE1ng y\xE1ng	7	l	bubbling and gurgling|hubbubing|abuzz
\u8D2B\u5BCC	p\xEDn f\xF9	7	n	poor and rich
\u6BEB\u7C73	h\xE1o m\u01D0	4	q	millimeter
\u75B2\u60EB\u4E0D\u582A	p\xED b\xE8i b\xF9 k\u0101n	7	l	exhausted|fatigued to the extreme
\u8BC9\u82E6	s\xF9 k\u01D4	7	v	grumble|complain|grievance
\u571F\u751F\u571F\u957F	t\u01D4 sh\u0113ng t\u01D4 zh\u01CEng	7	v	locally born and bred|indigenous|home-grown
\u751F\u758F	sh\u0113ng sh\u016B	6	a	unfamiliar|strange|out of practice|not accustomed
\u6566\u4FC3	d\u016Bn c\xF9	7	v	press|urge|hasten
\u8FF8\u53D1	b\xE8ng f\u0101	6	v	burst forth
\u5199\u5B57\u697C	xi\u011B z\xEC l\xF3u	6	n	office building
\u5B5D\u656C	xi\xE0o j\xECng	7	v	show filial respect|give presents|support one's aged parents
\u7D20\u517B	s\xF9 y\u01CEng	7	n	accomplishment|attainment in self-cultivation
\u6BCF\u9022	m\u011Bi f\xE9ng	7	v	every time|on each occasion|whenever
\u51FA\u4EFB	ch\u016B r\xE8n	7	v	take up a post
\u4EBA\u5DE5\u667A\u80FD	r\xE9n g\u014Dng zh\xEC n\xE9ng	7	n	artificial intelligence
\u51FA\u9053	ch\u016B d\xE0o	7	v	start one's career|make one's debut
\u9E1F\u5DE2	ni\u01CEo ch\xE1o	7	n	bird's nest
\u63A5\u4E8C\u8FDE\u4E09	ji\u0113 \xE8r li\xE1n s\u0101n	7	l	one after another|in quick succession
\u72EC\u8EAB	d\xFA sh\u0113n	7	n	unmarried|single
\u96E8\u8863	y\u01D4 y\u012B	6	n	raincoat
\u5171\u6027	g\xF2ng x\xECng	7	n	overall character
\u4E00\u6982	y\u012B g\xE0i	7	d	all|without any exceptions|categorically
\u4EB2\u548C\u529B	q\u012Bn h\xE9 l\xEC	7	n	warmth|approachability|accessibility|user friendliness|affinity
\u4FDD\u8D28\u671F	b\u01CEo zh\xEC q\u012B	7	n	shelf life|expiration date
\u4F9B\u5949	g\xF2ng f\xE8ng	7	v	consecrate|enshrine and worship|offering|sacrifice
\u5C3E\u6C14	w\u011Bi q\xEC	7	n	exhaust|emissions
\u72B6\u5143	zhu\xE0ng yu\xE1n	7	n	leading light
\u8282\u4FED	ji\xE9 ji\u01CEn	7	a	frugal|economical
\u60A6\u8033	yu\xE8 \u011Br	7	a	sweet-sounding|beautiful
\u5185\u884C	n\xE8i h\xE1ng	7	n	expert|adept|experienced|professional
\u6FC0\u5316	j\u012B hu\xE0	7	v	intensify
\u6C60\u5B50	ch\xED zi	5	n	pond|bathhouse pool|stalls
\u5C61\u6B21	l\u01DA c\xEC	7	d	repeatedly|time and again
\u58F0\u52BF	sh\u0113ng sh\xEC	6	n	fame and power|prestige|influence|impetus|momentum
\u7A9F\u7ABF	k\u016B long	7	n	hole|pocket|cavity|loophole|debt
\u9519\u7EFC\u590D\u6742	cu\xF2 z\u014Dng f\xF9 z\xE1	7	v	tangled and complicated
\u9B44\u529B	p\xF2 l\xEC	7	n	courage|daring|boldness|resolution|drive
\u903E\u671F	y\xFA q\u012B	7	v	be overdue
\u98CE\u8C8C	f\u0113ng m\xE0o	7	n	style|manner|ethos
\u4F9B\u6C42	g\u014Dng qi\xFA	7	n	supply and demand
\u5E74\u8FC8	ni\xE1n m\xE0i	7	z	old|aged
\u7761\u888B	shu\xEC d\xE0i	7	n	sleeping bag
\u795E\u6C14	sh\xE9n q\xEC	7	a	expression|manner|vigorous|impressive|lofty|pretentious
\u5398\u7C73	l\xED m\u01D0	4	q	centimeter
\u4E0D\u5C51\u4E00\u987E	b\xF9 xi\xE8 y\u012B g\xF9	6	v	disdain as beneath contempt
\u52E4\u5FEB	q\xEDn ku\xE0i	7	a	diligent|hardworking
\u51B7\u6C14	l\u011Bng q\xEC	6	n	air conditioning
\u4F73\u80B4	ji\u0101 y\xE1o	6	n	fine food|delicacies|delicious food
\u7CBE\u5999	j\u012Bng mi\xE0o	7	a	exquisite|fine and delicate
\u751F\u786C	sh\u0113ng y\xECng	7	a	stiff|harsh
\u8BDD\u8D39	hu\xE0 f\xE8i	7	n	call charge
\u4E56\u5DE7	gu\u0101i qi\u01CEo	7	a	clever|smart|lovable|cute
\u90BB\u56FD	l\xEDn gu\xF3	7	n	bordering country|neighbor country|neighboring countries|surrounding countries
\u907F\u6691	b\xEC sh\u01D4	7	vn	prevent sunstroke
\u5143\u5BB5\u8282	Yu\xE1n xi\u0101o ji\xE9	7		lantern festival
\u7EDD\u7F18	ju\xE9 yu\xE1n	7	vn	have no contact with|be cut off from|insulate
\u7167\u5E94	zh\xE0o ying	6	v	look after|take care of|attend to|correlate with|correspond to
\u4E07\u4E07	w\xE0n w\xE0n	7	l	absolutely|wholly
\u82D7\u5934	mi\xE1o tou	7	n	first signs|development
\u6D69\u52AB	h\xE0o ji\xE9	7	n	calamity|catastrophe|apocalypse
\u7F24\u7EB7	b\u012Bn f\u0113n	7	z	vast and various|rich and diverse
\u6BB5\u843D	du\xE0n lu\xF2	7	n	phase|time interval|paragraph|passage
\u4F5C\u606F	zu\xF2 x\u012B	6	n	work and rest
\u7559\u5B66\u751F	li\xFA xu\xE9 sh\u0113ng	2	n	student studying abroad|exchange student
\u55A7\u54D7	xu\u0101n hu\xE1	7	v	hubbub|clamor|make a racket
\u70ED\u817E\u817E	r\xE8 t\xE9ng t\xE9ng	7	z	steaming hot|bustling|hectic|excited|stirred up|freshly minted|hot off the press|also pr
\u7545\u8C08	ch\xE0ng t\xE1n	7	v	talk freely|discuss without inhibition
\u6587\u5177	w\xE9n j\xF9	7	n	stationery|item of stationery
\u5BCC\u542B	f\xF9 h\xE1n	7	v	contain in great quantities|rich in
\u65E5\u7528\u54C1	r\xEC y\xF2ng p\u01D0n	5	n	articles for daily use
\u796D\u5960	j\xEC di\xE0n	7	v	offer sacrifices
\u6362\u4F4D	hu\xE0n w\xE8i	7	v	swap places|conversion|rotate
\u6574\u6570	zh\u011Bng sh\xF9	7	n	whole number|integer|round figure
\u7B2C\u4E00\u7EBF	d\xEC y\u012B xi\xE0n	7	n	front line|forefront
\u4F20\u4EBA	chu\xE1n r\xE9n	7	n	teach|impart|disciple|descendant
\u4EA4\u8D39	ji\u0101o f\xE8i	3	v	pay a fee
\u94DC\u724C	t\xF3ng p\xE1i	6	n	bronze medal
\u8D5E\u8BB8	z\xE0n x\u01D4	7	v	praise|laud
\u9976\u6055	r\xE1o sh\xF9	7	v	forgive|pardon|spare
\u84EC\u52C3	p\xE9ng b\xF3	7	ad	vigorous|flourishing|full of vitality
\u7AE3\u5DE5	j\xF9n g\u014Dng	7	v	complete a project
\u6C34\u6E29	shu\u01D0 w\u0113n	7	n	water temperature
\u6DB5\u4E49	h\xE1n y\xEC	7	n	content|meaning|connotation|implication
\u6247\u5B50	sh\xE0n zi	5	n	fan
\u5360\u535C	zh\u0101n b\u01D4	7	v	divine
\u71C3\u653E	r\xE1n f\xE0ng	7	v	light|set off
\u751A\u81F3\u4E8E	sh\xE8n zh\xEC y\xFA	7	d	so much|even
\u5BA2\u8FD0	k\xE8 y\xF9n	7	n	passenger transportation|intercity bus
\u6C11\u4FD7	m\xEDn s\xFA	7	n	popular custom
\u591C\u6821	y\xE8 xi\xE0o	7	n	evening school|night school
\u8F6E\u6362	l\xFAn hu\xE0n	7	v	rotate|take turns
\u68F1\u89D2	l\xE9ng ji\u01CEo	7	n	edge and corner|protrusion|sharpness|craggy|ridge corner
\u8D2E\u85CF	zh\xF9 c\xE1ng	7	v	store up|hoard|deposits
\u5207\u8EAB	qi\xE8 sh\u0113n	7	b	direct|concerning oneself|personal
\u5168\u6587	qu\xE1n w\xE9n	7	n	entire text|full text
\u76F8\u4F9D\u4E3A\u547D	xi\u0101ng y\u012B w\xE9i m\xECng	7	v	mutually dependent for life|interdependent
\u8D5E\u4E0D\u7EDD\u53E3	z\xE0n b\xF9 ju\xE9 k\u01D2u	7	v	praise without cease
\u670D\u6C14	f\xFA q\xEC	6	v	be convinced|accept
\u4FD7\u8BED	s\xFA y\u01D4	7	n	common saying|proverb|colloquial speech
\u6807\u699C	bi\u0101o b\u01CEng	7	v	flaunt|advertise|parade|boost|excessive praise
\u7384\u673A	xu\xE1n j\u012B	7	n	profound theory|mysterious principles
\u8863\u88F3	y\u012B shang	6	n	clothes
\u541E\u54BD	t\u016Bn y\xE0n	6	v	swallow|gulp
\u97AD\u7B56	bi\u0101n c\xE8	7	v	spur on|urge on|encourage sb
\u5883\u5916	j\xECng w\xE0i	7	s	outside borders
\u59D1\u4E14	g\u016B qi\u011B	6	d	for the time being|tentatively
\u62DC\u89C1	b\xE0i ji\xE0n	7	v	pay a formal visit|call to pay respects
\u6562\u60C5	g\u01CEn qing	7	d	actually|as it turns out|indeed|of course
\u6210\u8BED	ch\xE9ng y\u01D4	5	n	idiom|proverb|saying|adage
\u653B\u8BFB	g\u014Dng d\xFA	7	v	major
\u5F52\u7EB3	gu\u012B n\xE0	7	v	sum up|summarize|conclude from facts|induction
\u4E0D\u514D	b\xF9 mi\u01CEn	5	d	inevitably
\u6148\u7965	c\xED xi\xE1ng	7	a	kindly|benevolent
\u6020\u6162	d\xE0i m\xE0n	7	v	slight|neglect
\u8361\u6F3E	d\xE0ng y\xE0ng	7	v	ripple|undulate
\u5F62\u5F71\u4E0D\u79BB	x\xEDng y\u01D0ng b\xF9 l\xED	7	v	inseparable
\u63E3\u6D4B	chu\u01CEi c\xE8	7	v	guess|conjecture
\u628A\u5173	b\u01CE gu\u0101n	7	v	guard a pass|check on sth
\u7528\u5F97\u7740	y\xF2ng de zh\xE1o	6		be able to use|useable|have a use for|be necessary to
\u8305\u53F0\u9152	m\xE1o t\xE1i ji\u01D4	7		maotai
\u82E6\u529B	k\u01D4 l\xEC	7	n	bitter work|hard toil
\u54FA\u4E73	b\u01D4 r\u01D4	6	v	breastfeeding|suckle|nurse
\u5149\u789F	gu\u0101ng di\xE9	7	n	optical disc|compact disc|cd|cd-rom
\u604D\u7136\u5927\u609F	hu\u01CEng r\xE1n d\xE0 w\xF9	7	v	suddenly realize|suddenly see the light
\u8C22\u7EDD	xi\xE8 ju\xE9	6	v	refuse politely
\u53CC\u6253	shu\u0101ng d\u01CE	6	n	doubles
\u9047\u9669	y\xF9 xi\u01CEn	7	v	get into difficulties|meet with danger
\u4E0D\u76F8\u4E0A\u4E0B	b\xF9 xi\u0101ng sh\xE0ng xi\xE0	7	v	equally matched|about the same
\u7EA2\u6DA6	h\xF3ng r\xF9n	7	a	ruddy|rosy|florid
\u672A\u77E5\u6570	w\xE8i zh\u012B sh\xF9	7	n	unknown quantity
\u7206\u6EE1	b\xE0o m\u01CEn	7	v	filled to capacity
\u9000\u7968	tu\xEC pi\xE0o	6	v	bounce|return a ticket|ticket refund
\u9AA8\u6C14	g\u01D4 q\xEC	7	n	unyielding character|courageous spirit|integrity|moral backbone
\u5192\u6627	m\xE0o m\xE8i	7	a	bold|presumptuous|take the liberty of
\u5E99\u4F1A	mi\xE0o hu\xEC	7	n	temple fair
\u4E0B\u671F	xi\xE0 q\u012B	7	n	next period
\u67A3	z\u01CEo	7	n	jujube|chinese date
\u9000\u8BA9	tu\xEC r\xE0ng	7	v	move aside|back down|concede
\u4E00\u7CFB\u5217	y\u012B x\xEC li\xE8	7	b	series of|string of
\u6587\u79D1	w\xE9n k\u0113	7	n	liberal arts|humanities
\u4F2F\u4F2F	b\xF3 bo	7	n	father's elder brother|uncle
\u8FBD\u9614	li\xE1o ku\xF2	7	a	vast|extensive
\u917F\u9020	ni\xE0ng z\xE0o	7	vn	brew|make by fermentation
\u7FFB\u6765\u8986\u53BB	f\u0101n l\xE1i f\xF9 q\xF9	7	v	toss and turn|again and again
\u64CD\u52B3	c\u0101o l\xE1o	7	v	work hard|look after
\u8BD5\u7528\u671F	sh\xEC y\xF2ng q\u012B	7	n	trial period|probationary period
\u7901\u77F3	ji\u0101o sh\xED	7	n	reef
\u7B79\u63AA	ch\xF3u cu\xF2	7	v	raise
\u4E0D\u50CF\u8BDD	b\xF9 xi\xE0ng hu\xE0	7	a	unreasonable|shocking|outrageous
\u517C\u4EFB	ji\u0101n r\xE8n	7	v	concurrent post|working part-time
\u5DEE\u989D	ch\u0101 \xE9	7	n	balance|discrepancy|difference
\u4E9A\u8FD0\u4F1A	Y\xE0 y\xF9n hu\xEC	4	n	asian games
\u8981\u5F3A	y\xE0o qi\xE1ng	7	a	eager to excel|strong-minded
\u98DF\u5BBF	sh\xED s\xF9	7	n	board and lodging|room and board
\u8D77\u5230	q\u01D0 d\xE0o	5	v	play role)
\u865A\u5FC3	x\u016B x\u012Bn	5	a	open-minded|humble
\u679C\u9171	gu\u01D2 ji\xE0ng	6	n	jam
\u654C\u89C6	d\xED sh\xEC	6	v	hostile|malevolence|antagonism|view as enemy|stand against
\u51C9\u6C34	li\xE1ng shu\u01D0	3	n	cool water|unboiled water
\u51FA\u4E11	ch\u016B ch\u01D2u	7	v	shameful|scandalous|be humiliated|make sb lose face
\u91CE\u9910	y\u011B c\u0101n	7	n	picnic|have a picnic
\u7740\u529B	zhu\xF3 l\xEC	7	v	put effort into sth|try really hard
\u9634\u5929	y\u012Bn ti\u0101n	2	n	cloudy day|overcast sky
\u7B28\u91CD	b\xE8n zh\xF2ng	7	a	heavy|cumbersome|unwieldy
\u8D77\u54C4	q\u01D0 h\xF2ng	6	v	heckle|rowdy jeering|create a disturbance
\u7EB2\u9886	g\u0101ng l\u01D0ng	7	n	program|guiding principle
\u5F52\u6839\u5230\u5E95	gu\u012B g\u0113n d\xE0o d\u01D0	7	l	after all|in the final analysis|ultimately
\u8017\u65F6	h\xE0o sh\xED	7	v	time-consuming|take a period of
\u7A7A\u60F3	k\u014Dng xi\u01CEng	7	n	daydream|fantasy|fantasize
\u7ACB\u529F	l\xEC g\u014Dng	7	v	make worthy contributions|distinguish oneself
\u73CD\u7A00	zh\u0113n x\u012B	6	a	rare|precious and uncommon
\u773C\u7EA2	y\u01CEn h\xF3ng	7	v	covet|envious|jealous|green with envy|infuriated|furious
\u9AD8\u94C1	g\u0101o ti\u011B	4		high speed rail
\u4E0B\u8C03	xi\xE0 ti\xE1o	7	v	adjust downwards|lower|demote
\u91CE\u8425	y\u011B y\xEDng	7	vn	camp|field lodgings
\u5BCC\u8DB3	f\xF9 z\xFA	7	a	rich|plentiful
\u7279\u4F8B	t\xE8 l\xEC	7	n	special case|isolated example
\u4E0D\u6599	b\xF9 li\xE0o	6	d	unexpectedly|one's surprise
\u5171\u540C\u4F53	g\xF2ng t\xF3ng t\u01D0	7	n	community
\u70ED\u6CEA\u76C8\u7736	r\xE8 l\xE8i y\xEDng ku\xE0ng	6	l	extremely moved
\u630E	ku\xE0	7	v	carry
\u534A\u9014\u800C\u5E9F	b\xE0n t\xFA \xE9r f\xE8i	7	v	give up halfway|leave sth unfinished
\u524D\u8FB9	qi\xE1n bian	1	f	front|front side|in front of
\u718F\u9676	x\u016Bn t\xE1o	7	vn	seep in|influence|nurture|training
\u897F\u533B	x\u012B y\u012B	2	n	western medicine
\u540E\u987E\u4E4B\u5FE7	h\xF2u g\xF9 zh\u012B y\u014Du	7	l	family worries
\u57CB\u6CA1	m\xE1i m\xF2	7	v	engulf|bury|overlook|stifle|neglect|fall into oblivion
\u65E0\u4E0D	w\xFA b\xF9	7	d	none lacking|none missing|everything is there|everyone without exception
\u62C4	zh\u01D4	7	v	lean on|prop on
\u5916\u8D38	w\xE0i m\xE0o	7	n	foreign trade
\u6839\u6DF1\u8482\u56FA	g\u0113n sh\u0113n d\xEC g\xF9	7	v	deep-rooted
\u95ED\u585E	b\xEC s\xE8	6	a	stop up|close up|hard to get to|out of the way|inaccessible|unenlightened|blocking
\u6551\u707E	ji\xF9 z\u0101i	5	vn	relieve disaster|help disaster victims
\u5C0F\u5B69\u513F	xi\u01CEo h\xE1i r	1		child
\u7B14\u8BD5	b\u01D0 sh\xEC	6	n	written examination|paper test
\u8BC4\u8BBA\u5458	p\xEDng l\xF9n yu\xE1n	7	n	commentator
\u5FAA\u5E8F\u6E10\u8FDB	x\xFAn x\xF9 ji\xE0n j\xECn	7	v	make steady progress incrementally
\u5239\u90A3	ch\xE0 n\xE0	6	t	instant|split second|twinkling of an eye
\u516C\u8D39	g\u014Dng f\xE8i	7	n	at public expense
\u730E\u72AC	li\xE8 qu\u01CEn	7	n	hound|hunting dog
\u9020\u4EF7	z\xE0o ji\xE0	7	n	construction cost
\u6CBF\u6D77	y\xE1n h\u01CEi	6	f	coastal
\u5206\u5BF8	f\u0113n cun	7	n	propriety|appropriate behavior|proper speech or action|within the norms
\u5FE0\u8D1E	zh\u014Dng zh\u0113n	7	n	loyal and dependable
\u4E2A\u513F	g\xE8 r	5	n	size|height|stature
\u6C61\u8511	w\u016B mi\xE8	6	v	slander|smear|tarnish
\u8C1C\u8BED	m\xED y\u01D4	7	n	riddle|conundrum
\u591A\u529F\u80FD	du\u014D g\u014Dng n\xE9ng	7	b	multifunctional|multifunction
\u82E6\u7B11	k\u01D4 xi\xE0o	7	v	force a smile|bitter laugh
\u4F11\u7720	xi\u016B mi\xE1n	7	vn	be dormant|inactive|hibernate
\u7167\u4F8B	zh\xE0o l\xEC	7	d	as a rule|as usual|usually
\u5FC3\u5B89\u7406\u5F97	x\u012Bn \u0101n l\u01D0 d\xE9	7	v	have a clear conscience
\u8239\u8236	chu\xE1n b\xF3	7	n	shipping|boats
\u8870\u5F31	shu\u0101i ru\xF2	7	a	weak|feeble
\u5408\u7B97	h\xE9 su\xE0n	6	a	worthwhile|be a good deal|be a bargain|reckon up|calculate
\u4E0D\u7FFC\u800C\u98DE	b\xF9 y\xEC \xE9r f\u0113i	7	v	disappear without trace|spread fast|spread like wildfire
\u514D\u804C	mi\u01CEn zh\xED	7	v	sack|demote|dismissal|sacking
\u65E0\u5FAE\u4E0D\u81F3	w\xFA w\u0113i b\xF9 zh\xEC	7	l	in every possible way|meticulous
\u5439\u6367	chu\u012B p\u011Bng	7	v	flatter|laud sb's accomplishments|adulation
\u7403\u62CD	qi\xFA p\u0101i	6	n	racket
\u7BC7\u5E45	pi\u0101n fu	7	n	length
\u7275\u5934	qi\u0101n t\xF3u	7	v	lead|take the lead|coordinate|mediate|go-between
\u8868\u7387	bi\u01CEo shu\xE0i	7	n	example|model
\u5F90\u5F90	x\xFA x\xFA	7	d	slowly|gently
\u4E00\u6643	y\u012B hu\u01CEng	7	v	in an instant|in a flash
\u6C61\u79FD	w\u016B hu\xEC	7	n	nasty|sordid|filthy
\u6CA1\u8F99	m\xE9i zh\xE9	7	v	at one's wit's end
\u79C0\u4E3D	xi\xF9 l\xEC	7	a	pretty|beautiful
\u53F8\u7A7A\u89C1\u60EF	s\u012B k\u014Dng ji\xE0n gu\xE0n	7	v	common occurrence
\u6C11\u8B66	m\xEDn j\u01D0ng	6	n	civil police|prc police
\u98CE\u98CE\u96E8\u96E8	f\u0113ng f\u0113ng y\u01D4 y\u01D4	7	l	trials and tribulations|ups and downs
\u8010\u7528	n\xE0i y\xF2ng	6	a	durable
\u5185\u5411	n\xE8i xi\xE0ng	7	a	reserved|introverted|domestic-oriented
\u5174\u81F4\u52C3\u52C3	x\xECng zh\xEC b\xF3 b\xF3	6	l	become exhilarated|in high spirits|full of zest
\u6E38\u4EBA	y\xF3u r\xE9n	6	n	tourist
\u7EB5\u7136	z\xF2ng r\xE1n	7	c	even if|even though
\u5E76\u884C	b\xECng x\xEDng	7	vn	proceed in parallel|side by side
\u9A8F\u9A6C	j\xF9n m\u01CE	7	n	fine horse|steed
\u5174\u9686	x\u012Bng l\xF3ng	6	a	prosperous|thriving|flourishing
\u67E5\u83B7	ch\xE1 hu\xF2	6	v	track down and seize
\u9274\u8D4F	ji\xE0n sh\u01CEng	7	vn	appreciate
\u6302\u94A9	gu\xE0 g\u014Du	7	v	couple|link|hook together|collude|peg|tie|hook|latch hook
\u72EC\u7ACB\u81EA\u4E3B	d\xFA l\xEC z\xEC zh\u01D4	7	v	independent and autonomous|self-determination|act independently
\u707C\u70ED	zhu\xF3 r\xE8	7	z	burning hot|scorching
\u95ED\u5E55	b\xEC m\xF9	5	v	curtain falls|lower the curtain|come to an end
\u58EE\u70C8	zhu\xE0ng li\xE8	6	ad	brave|heroic
\u5FAE\u89C2	w\u0113i gu\u0101n	7	n	micro-|subatomic
\u8FC7\u610F\u4E0D\u53BB	gu\xF2 y\xEC b\xF9 q\xF9	7	v	feel very apologetic
\u7F06\u8F66	l\u01CEn ch\u0113	7	n	cable car
\u5AC1\u5986	ji\xE0 zhuang	7	n	dowry
\u503E\u5BB6\u8361\u4EA7	q\u012Bng ji\u0101 d\xE0ng ch\u01CEn	7	l	lose a family fortune
\u4E0D\u4EA6\u4E50\u4E4E	b\xF9 y\xEC l\xE8 h\u016B	7	v	fig. extremely|awfully
\u4F73\u8282	ji\u0101 ji\xE9	7	n	festive day|holiday
\u677E\u7ED1	s\u014Dng b\u01CEng	7	v	untie|ease restrictions
\u4F24\u8111\u7B4B	sh\u0101ng n\u01CEo j\u012Bn	7	v	be a real headache|beat one's brains
\u6708\u7968	yu\xE8 pi\xE0o	7	n	monthly ticket
\u65E0\u7CBE\u6253\u91C7	w\xFA j\u012Bng d\u01CE c\u01CEi	7	v	dispirited and downcast|listless|in low spirits|washed out
\u74DC\u5206	gu\u0101 f\u0113n	7	v	partition|divide up
\u7535\u52A8\u8F66	di\xE0nd\xF2ngch\u0113	4	n	electric vehicle
\u6587\u4EBA	w\xE9n r\xE9n	7	n	scholar|literati
\u53C9\u5B50	ch\u0101 zi	5	n	fork
\u65E0\u7A77\u65E0\u5C3D	w\xFA qi\xF3ng w\xFA j\xECn	6	v	endless|boundless|infinite
\u5197\u957F	r\u01D2ng ch\xE1ng	7	a	long and tedious|redundant|superfluous|supernumerary|verbose
\u7EA2\u85AF	h\xF3ng sh\u01D4	7	n	sweet potato
\u8FB9\u8FDC	bi\u0101n yu\u01CEn	7	b	far from the center|remote|outlying
\u5BD3\u8A00	y\xF9 y\xE1n	7	n	fable
\u692D\u5706	tu\u01D2 yu\xE1n	6	n	oval|ellipse|elliptic
\u7231\u4E0D\u91CA\u624B	\xE0i b\xF9 sh\xEC sh\u01D2u	7	v	find sth utterly irresistible
\u8865\u8003	b\u01D4 k\u01CEo	6	v	resit an exam|makeup exam|resit
\u8BEF\u533A	w\xF9 q\u016B	7	n	mistaken ideas|misconceptions|error of one's ways
\u6C14\u9B44	q\xEC p\xF2	7	n	spirit|boldness|positive outlook|imposing attitude
\u5E95\u5B50	d\u01D0 zi	7	n	base|foundation|bottom
\u6447\u6447\u6B32\u5760	y\xE1o y\xE1o y\xF9 zhu\xEC	7	v	tottering
\u8273\u4E3D	y\xE0n l\xEC	7	a	gorgeous|garish and beautiful
\u8F9B\u9178	x\u012Bn su\u0101n	7	a	pungent|bitter|fig. sad|miserable
\u6D77\u8FD0	h\u01CEi y\xF9n	7	vn	shipping by sea
\u4E00\u58F0\u4E0D\u542D	y\u012B sh\u0113ng b\xF9 k\u0113ng	7	l	not say a word
\u5C01\u9876	f\u0113ng d\u01D0ng	7	vn	put a roof|cap the roof|top off|stop growing
\u7C98\u8D34	zh\u0101n ti\u0113	5	v	stick|affix|adhere|paste|taiwan pr
\u957F\u8DB3	ch\xE1ng z\xFA	7	a	remarkable
\u4E0A\u73ED\u65CF	sh\xE0ng b\u0101n z\xFA	6	n	office workers
\u659F\u914C	zh\u0113n zhu\xF3	6	v	consider|deliberate
\u529F\u5E95	g\u014Dng d\u01D0	7	n	knowledge of the fundamentals
\u76DB\u4EA7	sh\xE8ng ch\u01CEn	6	v	produce in abundance|be rich in
\u542C\u8BB2	t\u012Bng ji\u01CEng	2	v	attend a lecture|listen to a talk
\u9000\u5374	tu\xEC qu\xE8	7	v	retreat|shrink back
\u51EF\u6B4C	k\u01CEi g\u0113	7	n	triumphal hymn|victory song|paean
\u5F15\u4EBA\u5165\u80DC	y\u01D0n r\xE9n r\xF9 sh\xE8ng	7	v	enchant|fascinating
\u51F8\u663E	t\u016B xi\u01CEn	7	v	present clearly|give prominence to|magnify|clear and obvious
\u6025\u529F\u8FD1\u5229	j\xED g\u014Dng j\xECn l\xEC	6	v	seeking instant benefit
\u5546\u8D29	sh\u0101ng f\xE0n	7	n	trader|peddler
\u94F2\u5B50	ch\u01CEn zi	7	n	shovel|spade|trowel|spatula
\u4EE5\u8EAB\u4F5C\u5219	y\u01D0 sh\u0113n zu\xF2 z\xE9	7	v	set an example|serve as a model
\u8D64\u9053	ch\xEC d\xE0o	6	n	equator|celestial equator
\u8003\u751F	k\u01CEo sh\u0113ng	2	n	exam candidate
\u4E18\u9675	qi\u016B l\xEDng	7	n	hills
\u54AC\u7259\u5207\u9F7F	y\u01CEo y\xE1 qi\xE8 ch\u01D0	6	l	gnash one's teeth|fume with rage
\u5730\u52BF	d\xEC sh\xEC	6	n	terrain|topography relief
\u8981\u9886	y\xE0o l\u01D0ng	7	n	main aspects|essentials|gist
\u9644\u548C	f\xF9 h\xE8	7	v	agree|go along with|echo
\u5386\u4EE3	l\xEC d\xE0i	6	n	successive generations|successive dynasties|past dynasties
\u5916\u5E01	w\xE0i b\xEC	6	n	foreign currency
\u53D1\u626C\u5149\u5927	f\u0101 y\xE1ng gu\u0101ng d\xE0	7	v	develop and promote|carry forward
\u5931\u4F20	sh\u012B chu\xE1n	7	v	die out|lost|extinct
\u65E0\u8DB3\u8F7B\u91CD	w\xFA z\xFA q\u012Bng zh\xF2ng	7	v	insignificant
\u8BA2\u7ACB	d\xECng l\xEC	7	v	conclude|set up
\u5473\u7CBE	w\xE8i j\u012Bng	7	n	monosodium glutamate
\u4E8F\u672C	ku\u012B b\u011Bn	7	v	make a loss
\u4E24\u53E3\u5B50	li\u01CEng k\u01D2u zi	7	n	husband and wife
\u5408\u4F5C\u793E	h\xE9 zu\xF2 sh\xE8	7	n	cooperative
\u7092\u80A1	ch\u01CEo g\u01D4	6	v	speculate in stocks
\u7AF9\u7AFF	zh\xFA g\u0101n	7	n	bamboo|bamboo pole
\u7EAC\u5EA6	w\u011Bi d\xF9	7	n	latitude
\u52FE\u753B	g\u014Du hu\xE0	7	v	sketch out|delineate
\u6362\u8A00\u4E4B	hu\xE0n y\xE1n zh\u012B	7	cc	in other words
\u5C45\u9AD8\u4E34\u4E0B	j\u016B g\u0101o l\xEDn xi\xE0	7	v	assume a haughty attitude
\u94FA\u8DEF	p\u016B l\xF9	7	v	pave|lay a road|lay the groundwork
\u9009\u4FEE	xu\u01CEn xi\u016B	5	v	take as an elective|elective
\u80DC\u51FA	sh\xE8ng ch\u016B	7	v	come out on top|win|success|victory
\u8001\u6C49	l\u01CEo h\xE0n	7	n	old man|i
\u758F\u5BFC	sh\u016B d\u01CEo	7	v	dredge|remove obstructions|clear the way|enlighten|persuasion
\u6307\u5357\u9488	zh\u01D0 n\xE1n zh\u0113n	7	n	compass
\u6536\u590D	sh\u014Du f\xF9	7	v	recover|recapture
\u4F2F\u6BCD	b\xF3 m\u01D4	7	n	aunt
\u4E32\u95E8	chu\xE0n m\xE9n	7	v	call on sb|drop in|visit sb's home
\u89E6\u89C9	ch\xF9 ju\xE9	7	n	sense of touch|tactile sensation
\u4F38\u7F29	sh\u0113n su\u014D	7	vn	lengthen and shorten|flexible|adjustable|retractable|extensible|telescoping
\u5C71\u5DDD	sh\u0101n chu\u0101n	7	n	mountains and rivers|landscape
\u957F\u5F81	ch\xE1ng zh\u0113ng	7	n	expedition|long journey|long march
\u517B\u751F	y\u01CEng sh\u0113ng	7	vn	maintain good health|curing
\u4FA7\u91CD	c\xE8 zh\xF2ng	7	v	place particular emphasis on
\u6311\u62E8	ti\u01CEo b\u014D	6	v	incite disharmony|instigate
\u62D9\u52A3	zhu\u014D li\xE8	7	a	clumsy|botched
\u4EA7\u503C	ch\u01CEn zh\xED	7	n	value of output|output value
\u6DF1\u5316	sh\u0113n hu\xE0	6	v	deepen|intensify
\u8D61\u517B	sh\xE0n y\u01CEng	7	v	support|provide support for|maintain
\u89E6\u76EE\u60CA\u5FC3	ch\xF9 m\xF9 j\u012Bng x\u012Bn	7	v	shocking|horrible to see|ghastly sight
\u963F\u62C9\u4F2F\u8BED	\u0100 l\u0101 b\xF3 y\u01D4	7	nz	arabic
\u6D17\u8863\u7C89	x\u01D0 y\u012B f\u011Bn	6	n	laundry detergent|washing powder
\u5B6A\u751F	lu\xE1n sh\u0113ng	7	b	twin
\u5F02\u60F3\u5929\u5F00	y\xEC xi\u01CEng ti\u0101n k\u0101i	7	v	imagine the wildest thing|indulge in fantasy
\u6643\u8361	hu\xE0ng dang	7	v	rock|sway|shake
\u5DF4\u7ED3	b\u0101 jie	6	v	fawn on|curry favor with|make up to
\u4E0E\u65E5\u4FF1\u589E	y\u01D4 r\xEC j\xF9 z\u0113ng	7	v	increase steadily
\u97E7\u6027	r\xE8n x\xECng	7	n	toughness
\u59E5\u7237	l\u01CEo ye	7	n	maternal grandfather
\u6559\u6761	ji\xE0o ti\xE1o	7	n	doctrine|dogma|creed|dogmatic
\u652F\u6D41	zh\u012B li\xFA	6	n	tributary
\u54ED\u7B11\u4E0D\u5F97	k\u016B xi\xE0o b\xF9 d\xE9	7	l	between laughter and tears
\u5FC3\u75C5	x\u012Bn b\xECng	7	n	anxiety|sore point|secret worry|mental disorder|heart disease
\u94B3\u5B50	qi\xE1n zi	7	n	pliers|pincers|tongs|forceps|vise|clamp|claw|earring
\u64CD\u7EC3	c\u0101o li\xE0n	6	v	drill|practice
\u5FC3\u614C	x\u012Bn hu\u0101ng	7	a	be flustered|irregular heart-beat
\u5162\u5162\u4E1A\u4E1A	j\u012Bng j\u012Bng y\xE8 y\xE8	7	v	conscientious|assiduous
\u6CE2\u6D9B	b\u014D t\u0101o	7	n	great waves|billows
\u6BB7\u52E4	y\u012Bn q\xEDn	7	a	politely|solicitously|eagerly attentive
\u6BC5\u7136	y\xEC r\xE1n	7	d	firmly|resolutely|without hesitation
\u666F\u533A	j\u01D0ng q\u016B	7	n	scenic area
\u83DC\u5E02\u573A	c\xE0i sh\xEC ch\u01CEng	7	n	food market
\u4E89\u5148\u6050\u540E	zh\u0113ng xi\u0101n k\u01D2ng h\xF2u	7	l	outdoing one another
\u8D6B\u7136	h\xE8 r\xE1n	7	z	with astonishment|with a shock|awe-inspiringly|impressively|furiously
\u5A01\u6151	w\u0113i sh\xE8	7	vn	cower by military force|deterrence
\u96F7\u540C	l\xE9i t\xF3ng	7	v	mirroring others|identical
\u51FA\u98CE\u5934	ch\u016B f\u0113ng tou	7	v	push oneself forward|seek fame|be in the limelight
\u6BEB\u5347	h\xE1o sh\u0113ng	4	q	milliliter
\u6B63\u6C14	zh\xE8ng q\xEC	6	n	healthy atmosphere|moral spirit|unyielding integrity|probity|vital energy
\u76DB\u60C5	sh\xE8ng q\xEDng	6	n	great kindness|magnificent hospitality
\u4E2D\u5EB8	zh\u014Dng y\u014Dng	7	n	golden mean|mediocre|ordinary
\u960E\u738B	Y\xE1n w\xE1ng	7	n	yama|king of hell|cruel and tyrannical person
\u7701\u4F1A	sh\u011Bng hu\xEC	6	n	provincial capital
\u5C0F\u5EB7	xi\u01CEo k\u0101ng	7	n	moderately affluent|well-off|xiaokang
\u53EB\u677F	ji\xE0o b\u01CEn	7		signal the musicians|challenge
\u5F02\u53E3\u540C\u58F0	y\xEC k\u01D2u t\xF3ng sh\u0113ng	7	l	different mouths, same voice|speak in unison
\u6210\u624D	ch\xE9ng c\xE1i	7	v	make sth of oneself
\u63E3\u6469	chu\u01CEi m\xF3	7	v	analyze|try to figure out|try to fathom
\u4E50\u8C31	yu\xE8 p\u01D4	6	n	musical score|sheet music
\u516C\u5B89\u5C40	g\u014Dng \u0101n j\xFA	7	n	public security bureau
\u8896\u73CD	xi\xF9 zh\u0113n	6	b	pocket-sized|pocket
\u5BC6\u4E0D\u53EF\u5206	m\xEC b\xF9 k\u011B f\u0113n	7	v	inextricably linked|inseparable
\u526A\u5F69	ji\u01CEn c\u01CEi	6	v	cut the ribbon
\u4E94\u82B1\u516B\u95E8	w\u01D4 hu\u0101 b\u0101 m\xE9n	7	l	myriad|all kinds of|all sorts of
\u706B\u8FA3\u8FA3	hu\u01D2 l\xE0 l\xE0	7	z	painful heat|scorching|rude and forthright|provocative|hot|sexy
\u5B63\u519B	j\xEC j\u016Bn	6	n	third in a race|bronze medalist
\u53E3\u5403	k\u01D2u ch\u012B	7	v	stammer|stutter|taiwan pr
\u76EE\u4E0D\u8F6C\u775B	m\xF9 b\xF9 zhu\u01CEn j\u012Bng	7	l	gaze steadily|stare
\u5E38\u52A1	ch\xE1ng w\xF9	6	b	routine|everyday business|daily operation
\u8FDE\u7EF5	li\xE1n mi\xE1n	7	z	continuous|unbroken|uninterrupted
\u573A\u9986	ch\u01CEng gu\u01CEn	6	n	sporting venue|arena
\u60E9\u5904	ch\xE9ng ch\u01D4	7	v	punish|administer justice
\u66B4\u5229	b\xE0o l\xEC	7	n	sudden huge profits
\u539F\u6C41\u539F\u5473	yu\xE1n zh\u012B yu\xE1n w\xE8i	7	l	original|authentic
\u4E73\u5236\u54C1	r\u01D4 zh\xEC p\u01D0n	6	n	dairy products
\u82E6\u5FC3	k\u01D4 x\u012Bn	7	n	painstaking effort|laborious at pains
\u4E00\u63FD\u5B50	y\u012B l\u01CEn zi	7	l	all-inclusive|undiscriminating
\u6D6E\u8E81	f\xFA z\xE0o	7	a	fickle and impatient|restless|giddy|scatterbrained
\u7CBE\u75B2\u529B\u7AED	j\u012Bng p\xED l\xEC ji\xE9	7	v	spirit weary, strength exhausted|spent|drained|washed out
\u5EC9\u6D01	li\xE1n ji\xE9	7	a	incorruptible|unbribable|honest
\u67F3\u6811	li\u01D4 sh\xF9	7	n	willow
\u6B22\u58F0\u7B11\u8BED	hu\u0101n sh\u0113ng xi\xE0o y\u01D4	7	l	cheers and laughter
\u8235\u624B	du\xF2 sh\u01D2u	7	n	helmsman
\u5206\u5916	f\xE8n w\xE0i	7	d	exceptionally
\u70E4\u9E2D	k\u01CEo y\u0101	5	n	roast duck
\u8003\u573A	k\u01CEo ch\u01CEng	6	n	exam room
\u8FB9\u7586	bi\u0101n ji\u0101ng	7	s	border area|borderland|frontier|frontier region
\u9177\u4F3C	k\xF9 s\xEC	7	v	strikingly resemble
\u9661\u5CED	d\u01D2u qi\xE0o	6	a	precipitous
\u8D28\u6734	zh\xEC p\u01D4	7	a	simple|plain|unadorned|unaffected|unsophisticated|rustic|earthy
\u4E8F\u5F85	ku\u012B d\xE0i	6	v	treat sb unfairly
\u9152\u697C	ji\u01D4 l\xF3u	7	n	restaurant
\u8FA9\u8BC1	bi\xE0n zh\xE8ng	6	b	investigate|dialectical
\u63A8\u6572	tu\u012B qi\u0101o	7	v	think over
\u9A6E	tu\xF3	7	v	carry on one's back
\u5E7F\u4E49	gu\u01CEng y\xEC	7	n	broad sense|general sense
\u9690\u60C5	y\u01D0n q\xEDng	7	n	ulterior motive|subject best avoided
\u6613\u62C9\u7F50	y\xEC l\u0101 gu\xE0n	7	n	pull-top can|easy-open can
\u63A5\u73ED	ji\u0113 b\u0101n	7	v	take over|succeed sb
\u80A5\u6C83	f\xE9i w\xF2	7	a	fertile
\u6DE1\u5B63	d\xE0n j\xEC	7	t	off season|slow business season
\u6D53\u91CD	n\xF3ng zh\xF2ng	7	a	dense|thick|strong|rich|heavy|deep|profound
\u65E5\u65B0\u6708\u5F02	r\xEC x\u012Bn yu\xE8 y\xEC	7	v	daily renewal, monthly change|rapid progress
\u63A8\u8F9E	tu\u012B c\xED	7	v	decline
\u5FD7\u6C14	zh\xEC q\xEC	7	n	ambition|resolve|backbone|drive|spirit
\u6C34\u707E	shu\u01D0 z\u0101i	5	n	flood|flood damage
\u6253\u96F7	d\u01CE l\xE9i	4	v	rumble with thunder|clap of thunder
\u63D0\u7EB2	t\xED g\u0101ng	5	n	outline|synopsis|notes
\u751F\u547D\u7EBF	sh\u0113ng m\xECng xi\xE0n	7	n	lifeline
\u591C\u4EE5\u7EE7\u65E5	y\xE8 y\u01D0 j\xEC r\xEC	7	l	night and day|continuous strenuous effort
\u90CA\u6E38	ji\u0101o y\xF3u	7	v	go for an outing|go on an excursion
\u9AD8\u79D1\u6280	g\u0101o k\u0113 j\xEC	6	n	high tech|high technology
\u5706\u73E0\u7B14	yu\xE1n zh\u016B b\u01D0	6	n	ballpoint pen
\u53CD\u5DEE	f\u01CEn ch\u0101	7	n	contrast|discrepancy
\u8302\u76DB	m\xE0o sh\xE8ng	7	a	lush
\u52B1\u5FD7	l\xEC zh\xEC	7	nr	inspirational|motivational
\u9A87\u4EBA\u542C\u95FB	h\xE0i r\xE9n t\u012Bng w\xE9n	7	v	shocking|horrifying|atrocious|terrible
\u6676\u83B9	j\u012Bng y\xEDng	7	a	sparkling and translucent
\u4FBF\u9053	bi\xE0n d\xE0o	7	n	pavement|sidewalk|shortcut|makeshift road
\u8FFD\u60BC	zhu\u012B d\xE0o	6	vn	mourn|pay last respects
\u547C\u5E94	h\u016B y\xECng	7	v	conform|echo|correlate well|agreement
\u4E24\u624B	li\u01CEng sh\u01D2u	6	mq	one's two hands|two prongs|both aspects, eventualities etc|skills|expertise
\u51FA\u571F	ch\u016B t\u01D4	7	v	dig up|appear in an excavation|unearthed
\u597D\u5BA2	h\xE0o k\xE8	7	a	hospitality|treat guests well|enjoy having guests|hospitable|friendly
\u4E0D\u670D	b\xF9 f\xFA	7	v	not to accept sth|remain unconvinced by
\u6302\u53F7	gu\xE0 h\xE0o	7	v	register|send by registered mail
\u81EA\u76F8\u77DB\u76FE	z\xEC xi\u0101ng m\xE1o d\xF9n	7	v	contradict oneself|self-contradictory|inconsistent
\u81EA\u6EE1	z\xEC m\u01CEn	6	a	complacent|self-satisfied
\u7F62\u514D	b\xE0 mi\u01CEn	7	v	dismiss
\u5723\u8D24	sh\xE8ng xi\xE1n	7	n	sage|wise and holy man|virtuous ruler|buddhist lama|wine
\u810A\u6881	j\u01D0 li\xE1ng	7	n	backbone|spine|taiwan pr|back
\u6C42\u5B66	qi\xFA xu\xE9	7	v	seek knowledge|study|attend college
\u68CD\u68D2	g\xF9n b\xE0ng	6	n	club|staff|stick
\u8D76\u5FD9	g\u01CEn m\xE1ng	6	d	hurry|hasten|make haste
\u8E0C\u8E87	ch\xF3u ch\xFA	6	v	hesitate
\u57CE\u4E61	ch\xE9ng xi\u0101ng	6	n	city and countryside
\u5C45\u6C11\u697C	j\u016B m\xEDn l\xF3u	7	n	apartment building|residential tower
\u8BFB\u97F3	d\xFA y\u012Bn	2	n	pronunciation
\u4E24\u6816	li\u01CEng q\u012B	7	b	amphibious|dual-talented
\u5E18\u5B50	li\xE1n zi	7	n	curtain
\u8870\u51CF	shu\u0101i ji\u01CEn	7	vn	weaken|attenuate
\u5BBD\u539A	ku\u0101n h\xF2u	7	a	tolerant|generous|magnanimous|thick and broad|thick and deep
\u7956\u4F20	z\u01D4 chu\xE1n	7	vn	passed on from ancestors
\u4E94\u989C\u516D\u8272	w\u01D4 y\xE1n li\xF9 s\xE8	4	l	multicolored
\u6D4F\u89C8\u5668	li\xFA l\u01CEn q\xEC	7	n	browser
\u8270\u82E6\u594B\u6597	ji\u0101n k\u01D4 f\xE8n d\xF2u	7	v	struggle arduously
\u6025\u8F6C\u5F2F	j\xED zhu\u01CEn w\u0101n	7	v	make a sudden turn
\u62CD\u677F	p\u0101i b\u01CEn	7	v	clapper-board|auctioneer's hammer|beat time with clappers
\u76F8\u5BF9\u800C\u8A00	xi\u0101ng du\xEC \xE9r y\xE1n	7	c	relatively speaking|comparatively speaking
\u8BA1\u7B56	j\xEC c\xE8	7	n	stratagem
\u633A\u62D4	t\u01D0ng b\xE1	6	a	tall and straight
\u60CA\u8BE7	j\u012Bng ch\xE0	7	a	be surprised|be amazed|be stunned
\u591C\u5E02	y\xE8 sh\xEC	7	n	night market
\u629A\u517B\u8D39	f\u01D4 y\u01CEng f\xE8i	7	n	child support payment
\u6C34\u7A3B	shu\u01D0 d\xE0o	7	n	rice|paddy
\u7267\u6C11	m\xF9 m\xEDn	7	n	herdsman
\u63A5\u8F68	ji\u0113 gu\u01D0	7	v	railtrack connection|integrate into sth|dock|connect|be in step with|bring into line with|align
\u8150\u5316	f\u01D4 hu\xE0	7	v	rot|decay|become corrupt
\u8D2B\u4E4F	p\xEDn f\xE1	6	a	impoverished|lacking|deficient|limited|meager|impoverishment|lack|deficiency
\u868A\u5E10	w\xE9n zh\xE0ng	7	n	mosquito net
\u6E29\u5EA6\u8BA1	w\u0113n d\xF9 j\xEC	7	n	thermometer|thermograph
\u7528\u6CD5	y\xF2ng f\u01CE	6	n	usage
\u4F5C\u5BA2	zu\xF2 k\xE8	7	v	sojourn
\u9694\u5F00	g\xE9 k\u0101i	4		separate
\u59A8\u5BB3	f\xE1ng h\xE0i	7	v	jeopardize|be harmful to|undermine
\u800D\u8D56	shu\u01CE l\xE0i	7	v	act shamelessly|act dumb
\u6301\u4E4B\u4EE5\u6052	ch\xED zh\u012B y\u01D0 h\xE9ng	7	v	pursue unremittingly|persevere
\u4E2D\u5C0F\u5B66	zh\u014Dng xi\u01CEo xu\xE9	2	n	middle and elementary school
\u5BB6\u5883	ji\u0101 j\xECng	7	n	family financial situation|family circumstances
\u614C\u5FD9	hu\u0101ng m\xE1ng	5	ad	in a great rush|in a flurry
\u5F6C\u5F6C\u6709\u793C	b\u012Bn b\u012Bn y\u01D2u l\u01D0	7	l	refined and courteous|urbane
\u836F\u6750	y\xE0o c\xE1i	7	n	medicinal ingredient
\u62C9\u52A8	l\u0101 d\xF2ng	7	v	pull|stimulate|motivate
\u79C0\u7F8E	xi\xF9 m\u011Bi	7	a	elegant|graceful
\u6559\u5B66\u697C	ji\xE0o xu\xE9 l\xF3u	1	n	teaching block|school building
\u51FA\u4E3B\u610F	ch\u016B zh\u01D4 yi	7		come up with ideas|make suggestions|offer advice
\u6811\u836B	sh\xF9 y\u012Bn	7	n	shade of a tree|taiwan pr
\u607C\u7F9E\u6210\u6012	n\u01CEo xi\u016B ch\xE9ng n\xF9	7	v	be ashamed into anger
\u6A21\u7279\u513F	m\xF3 t\xE8 r	4		model
\u81EA\u79C1\u81EA\u5229	z\xEC s\u012B z\xEC l\xEC	7	v	selfish|mercenary
\u80A1\u6C11	g\u01D4 m\xEDn	7	n	stock investor|share trader
\u7B3C\u7EDF	l\u01D2ng t\u01D2ng	7	a	general|broad|sweeping|lacking in detail|vague
\u679C\u6811	gu\u01D2 sh\xF9	6	n	fruit tree
\u4E86\u5374	li\u01CEo qu\xE8	7	v	resolve|settle
\u7F51\u53CB	w\u01CEng y\u01D2u	1	n	online friend|internet user
\u6BD4\u6BD4\u7686\u662F	b\u01D0 b\u01D0 ji\u0113 sh\xEC	7	v	can be found everywhere
\u5149\u7F06	gu\u0101ng l\u01CEn	7	n	optical cable
\u540D\u80DC	m\xEDng sh\xE8ng	6	n	scenic spot
\u4E3B\u98DF	zh\u01D4 sh\xED	7	n	staple food
\u843D\u5DEE	lu\xF2 ch\u0101	7	n	drop in elevation|gap|disparity
\u5EFA\u6811	ji\xE0n sh\xF9	7	n	make a contribution|establish|found|contribution
\u9A6C\u620F	m\u01CE x\xEC	7	n	circus
\u523B\u4E0D\u5BB9\u7F13	k\xE8 b\xF9 r\xF3ng hu\u01CEn	6	v	brook no delay|demand immediate action
\u65A7\u5B50	f\u01D4 zi	7	n	axe|hatchet
\u8FD9\u6837\u4E00\u6765	zh\xE8 y\xE0ng y\u012B l\xE1i	7	l	thus|if this happens then
\u6025\u8FEB	j\xED p\xF2	7	a	urgent|pressing|imperative
\u957F\u671F\u4EE5\u6765	ch\xE1ng q\u012B y\u01D0 l\xE1i	7	l	for a long time
\u526A\u5B50	ji\u01CEn zi	5	n	clippers|scissors|shears
\u6D77\u91CF	h\u01CEi li\xE0ng	7	n	huge volume
\u8DF3\u9AD8	ti\xE0o g\u0101o	3	v	high jump
\u60F9\u7978	r\u011B hu\xF2	6	v	stir up trouble|invite disaster
\u8058\u4EFB	p\xECn r\xE8n	7	vn	appoint|appointed
\u626B\u5893	s\u01CEo m\xF9	7	v	sweep a grave
\u5BB9\u5149\u7115\u53D1	r\xF3ng gu\u0101ng hu\xE0n f\u0101	7	v	face glowing|looking radiant|all smiles
\u9884\u552E	y\xF9 sh\xF2u	7	vn	sell in advance
\u5F04\u865A\u4F5C\u5047	n\xF2ng x\u016B zu\xF2 ji\u01CE	7	v	practice fraud|by trickery
\u7BA1\u7406\u8D39	gu\u01CEn l\u01D0 f\xE8i	7	n	management fee
\u6539\u7248	g\u01CEi b\u01CEn	7	v	revise the current edition|revised edition
\u7269\u7F8E\u4EF7\u5EC9	w\xF9 m\u011Bi ji\xE0 li\xE1n	6	v	good quality and cheap|bargain
\u4E0B\u5760	xi\xE0 zhu\xEC	7	v	fall|drop|droop|experience tenesmus
\u81EA\u8D39	z\xEC f\xE8i	7	d	at one's own expense|self-funded
\u96C6\u90AE	j\xED y\xF3u	7	vn	stamp collecting|philately
\u63A2\u6C42	t\xE0n qi\xFA	7	v	seek|pursue|investigate
\u4F8D\u5019	sh\xEC h\xF2u	7	v	serve|wait upon
\u5E74\u753B	ni\xE1n hu\xE0	7		new year picture
\u84DD\u9886	l\xE1n l\u01D0ng	6	b	blue-collar|blue-collar worker
\u51FA\u5C71	ch\u016B sh\u0101n	7	v	leave the mountain|take a leading position
\u8D2F\u901A	gu\xE0n t\u014Dng	7	v	link up|thread together
\u5BB6\u7535	ji\u0101 di\xE0n	6	n	household electric appliance
\u7FE0\u7EFF	cu\xEC l\u01DC	7	z	greenish-blue|emerald green
\u8BD5\u884C	sh\xEC x\xEDng	7	v	try out|test
\u4F18\u80DC\u52A3\u6C70	y\u014Du sh\xE8ng li\xE8 t\xE0i	6	v	survival of the fittest
\u5BA1\u5B9A	sh\u011Bn d\xECng	7	v	screen|evaluate|approve
\u597D\u5BB9\u6613	h\u01CEo r\xF3ng y\xEC	6	d	with great difficulty|have a hard time|so easy
\u91CD\u5408	ch\xF3ng h\xE9	7	v	match up|coincide
\u8010\u4EBA\u5BFB\u5473	n\xE0i r\xE9n x\xFAn w\xE8i	7	v	thought-provoking|worth thinking over|provide food for thought
\u5929\u7ECF\u5730\u4E49	ti\u0101n j\u012Bng d\xEC y\xEC	7	l	fig. right and proper|right and unalterable|matter of course
\u8302\u5BC6	m\xE0o m\xEC	7	a	dense|lush
\u8270\u9669	ji\u0101n xi\u01CEn	7	an	difficult and dangerous|hardships and perils
\u5367\u94FA	w\xF2 p\xF9	6	n	bed|couchette
\u4E2D\u56FD\u753B	Zh\u014Dng gu\xF3 hu\xE0	7		chinese painting
\u6284\u5199	ch\u0101o xi\u011B	4	v	copy|transcribe
\u6070\u5982\u5176\u5206	qi\xE0 r\xFA q\xED f\xE8n	7	l	appropriate|apt|just right
\u8BF7\u5E16	q\u01D0ng ti\u011B	7	n	invitation card|written invitation
\u5BE5\u5BE5\u65E0\u51E0	li\xE1o li\xE1o w\xFA j\u01D0	7	v	just a very few|tiny number|not many at all
\u5DE5\u5E8F	g\u014Dng x\xF9	7	n	working procedure|process
\u8BFE\u6587	k\xE8 w\xE9n	1	n	text
\u4F50\u6599	zu\u01D2 li\xE0o	7	n	condiments|seasoning
\u5938\u8000	ku\u0101 y\xE0o	7	v	brag about|flaunt
\u731C\u8C1C	c\u0101i m\xED	7	v	answer a riddle|guess
\u62DC\u4F1A	b\xE0i hu\xEC	7	v	meet with|pay a visit to|call on
\u4E00\u4E3E\u4E24\u5F97	y\u012B j\u01D4 li\u01CEng d\xE9	6	v	one move, two gains
\u6E29\u4E60	w\u0113n x\xED	7	v	review
\u4F38\u5F20	sh\u0113n zh\u0101ng	7	v	uphold|promote
\u987B\u77E5	x\u016B zh\u012B	6	n	key information|instructions
\u804B\u54D1	l\xF3ng y\u01CE	6	vn	deaf and dumb
\u7199\u7199\u6518\u6518	x\u012B x\u012B r\u01CEng r\u01CEng	7	v	bustling with activity
\u9053\u6559	D\xE0o ji\xE0o	6	nz	taoism|daoism
\u9999\u6CB9	xi\u0101ng y\xF3u	7	n	sesame oil|perfumed oil
\u50F5\u5316	ji\u0101ng hu\xE0	7	v	become rigid
\u5E73\u4EF7	p\xEDng ji\xE0	7	n	reasonably priced|inexpensive|keep prices down|parity
\u89E3\u8BF4\u5458	ji\u011B shu\u014D yu\xE1n	5	n	commentator
\u53F8\u957F	s\u012B zh\u01CEng	6	n	bureau chief
\u6ED1\u68AF	hu\xE1 t\u012B	7	n	sliding board|slide
\u6B7B\u5FC3\u584C\u5730	s\u01D0 x\u012Bn t\u0101 d\xEC	7		be hell-bent on|dead set on sth|unswerving
\u65E0\u53EF\u5949\u544A	w\xFA k\u011B f\xE8ng g\xE0o	7	v	"no comment"
\u7C07\u62E5	c\xF9 y\u014Dng	7	v	crowd around|escort
\u7F51\u70B9	w\u01CEng di\u01CEn	7	n	node in a network|sales outlet|branch|service center|screentone|halftone dot
\u64A4\u6362	ch\xE8 hu\xE0n	7	v	dismiss and replace|replace
\u6400	ch\u0101n	7	v	mix|blend|dilute|adulterate
\u6B22\u805A	hu\u0101n j\xF9	7	v	get together socially|celebrate|party|celebration
\u51FA\u6BDB\u75C5	ch\u016B m\xE1o b\xECng	7	v	problem appears|break down
\u5927\u68DA	d\xE0 p\xE9ng	7	n	greenhouse|polytunnel
\u6982\u51B5	g\xE0i ku\xE0ng	7	n	general situation|summary
\u8D77\u7A0B	q\u01D0 ch\xE9ng	7	v	set out|leave
\u987E\u4E0D\u5F97	g\xF9 bu de	7	v	unable to change sth|unable to deal with
\u8BA5\u7B11	j\u012B xi\xE0o	7	v	sneer
\u6E05\u8106	q\u012Bng cu\xEC	7	a	sharp and clear|crisp|melodious|ringing|tinkling|silvery|fragile|frail
\u77BB\u4EF0	zh\u0101n y\u01CEng	7	v	revere|admire
\u8038\u7ACB	s\u01D2ng l\xEC	7	v	stand tall|tower aloft
\u6389\u961F	di\xE0o du\xEC	7	v	fall behind|drop out
\u5546\u8D3E	sh\u0101ng g\u01D4	7		merchant
\u6069\u60C5	\u0113n q\xEDng	7	n	kindness|affection|grace|favor
\u6CBB\u5B66	zh\xEC xu\xE9	7		scholarship|high-level study|do scholarly research
\u5927\u540C\u5C0F\u5F02	d\xE0 t\xF3ng xi\u01CEo y\xEC	7	v	virtually the same
\u78CB\u5546	cu\u014D sh\u0101ng	7	vn	consult|discuss seriously|negotiate|confer|negotiations|consultations
\u6298\u5408	zh\xE9 h\xE9	7	v	convert into|amount to|be equivalent to
\u4F36\u4FD0	l\xEDng l\xEC	6	a	clever|witty|intelligent
\u793C\u62DC\u5929	L\u01D0 b\xE0i ti\u0101n	5	t	sunday
\u5978\u8BC8	ji\u0101n zh\xE0	7	a	treachery|devious|rogue
\u5F00\u57A6	k\u0101i k\u011Bn	7	v	put under the plow
\u4E00\u5E94\u4FF1\u5168	y\u012B y\u012Bng j\xF9 qu\xE1n	7	v	with everything needed available
\u897F\u9910	x\u012B c\u0101n	2	n	western-style food
\u8C41	hu\xF2	7	v	open|clear|liberal-minded|generous|exempt|remit|opening|stake all
\u4E3B\u9898\u6B4C	zh\u01D4 t\xED g\u0113	7	n	theme song
\u5B66\u5802	xu\xE9 t\xE1ng	7	n	college|school
\u592A\u6781\u62F3	t\xE0i j\xED qu\xE1n	7	n	martial art
\u4E66\u67DC	sh\u016B gu\xEC	5	n	bookcase
\u9632\u75AB	f\xE1ng y\xEC	7	vn	prevent epidemics
\u7D20\u4E0D\u76F8\u8BC6	s\xF9 b\xF9 xi\u0101ng sh\xED	7	v	be total strangers
\u91CD\u4E2D\u4E4B\u91CD	zh\xF2ng zh\u014Dng zh\u012B zh\xF2ng	7	l	of the utmost importance|of highest priority
\u8C0B\u5BB3	m\xF3u h\xE0i	7	v	conspire to murder|plot against sb's life
\u9762\u9762\u4FF1\u5230	mi\xE0n mi\xE0n j\xF9 d\xE0o	7	v	take care of everything|handle everything
\u547C\u98CE\u5524\u96E8	h\u016B f\u0113ng hu\xE0n y\u01D4	7	l	exercise magical powers
\u62EC\u53F7	ku\xF2 h\xE0o	4	n	parentheses|brackets
\u4E00\u7B79\u83AB\u5C55	y\u012B ch\xF3u m\xF2 zh\u01CEn	7	v	be at wits' end
\u53EA\u89C1	zh\u01D0 ji\xE0n	5	v	see|one's surprise
\u7802\u7CD6	sh\u0101 t\xE1ng	7	n	granulated sugar
\u6F5C\u79FB\u9ED8\u5316	qi\xE1n y\xED m\xF2 hu\xE0	7	v	imperceptible influence|influence secretly
\u5BCC\u5F3A	f\xF9 qi\xE1ng	7	a	rich and powerful
\u76EE\u4E2D\u65E0\u4EBA	m\xF9 zh\u014Dng w\xFA r\xE9n	7	v	condescending
\u51FD\u6388	h\xE1n sh\xF2u	7	vn	teach by correspondence
\u5386\u5C4A	l\xEC ji\xE8	7	b	all previous
\u75F4\u5FC3	ch\u012B x\u012Bn	7	n	infatuation
\u7ADE\u76F8	j\xECng xi\u0101ng	7	d	competitive|eagerly|vie
\u8863\u67B6	y\u012B ji\xE0	3	n	clothes hanger|clothes rack
\u65E0\u6240\u4F5C\u4E3A	w\xFA su\u01D2 zu\xF2 w\xE9i	7	v	feckless
\u7EB2\u8981	g\u0101ng y\xE0o	7	n	outline|essential points
\u8C6A\u8FC8	h\xE1o m\xE0i	6	a	bold|open-minded|heroic
\u6210\u7FA4\u7ED3\u961F	ch\xE9ng q\xFAn ji\xE9 du\xEC	7	l	in large numbers|as a large crowd
\u4E0A\u8FDB\u5FC3	sh\xE0ng j\xECn x\u012Bn	6	n	motivation|ambition
\u6C14\u529F	q\xEC g\u014Dng	6	n	qigong
\u4E89\u5149	zh\u0113ng gu\u0101ng	7	v	win an honor
\u65ED\u65E5	x\xF9 r\xEC	7	n	rising sun
\u56ED\u5730	yu\xE1n d\xEC	6	n	garden area
\u5916\u5411	w\xE0i xi\xE0ng	6	a	extroverted|export-oriented
\u545C\u54BD	w\u016B y\xE8	7	v	sob|whimper
\u56DE\u843D	hu\xED lu\xF2	7	v	fall back
\u6B64\u8D77\u5F7C\u4F0F	c\u01D0 q\u01D0 b\u01D0 f\xFA	7	v	up here, down there|no sooner one subsides|next arises|repeating continuously|occurring again and again
\u5BBD\u6CDB	ku\u0101n f\xE0n	7	a	wide-ranging
\u6C6A\u6D0B	w\u0101ng y\xE1ng	7	n	vast body of water
\u7075\u673A\u4E00\u52A8	l\xEDng j\u012B y\u012B d\xF2ng	7	v	bright idea suddenly occurs|hit upon an inspiration
\u805A\u7CBE\u4F1A\u795E	j\xF9 j\u012Bng hu\xEC sh\xE9n	7	l	concentrate one's attention
\u5212\u65F6\u4EE3	hu\xE0 sh\xED d\xE0i	7	b	epoch-marking
\u9A70\u540D	ch\xED m\xEDng	7	vn	famous
\u8E0F\u4E0A	t\xE0 sh\xE0ng	7	v	set foot on|step on or into
\u5916\u6587	w\xE0i w\xE9n	3	n	foreign language
\u516C\u5A46	g\u014Dng p\xF3	6	n	husband's parents|parents-in-law
\u56E0\u4EBA\u800C\u5F02	y\u012Bn r\xE9n \xE9r y\xEC	7	v	different for each individual
\u77ED\u5904	du\u01CEn ch\xF9	3	n	shortcoming|defect|fault|one's weak points
\u6ECB\u957F	z\u012B zh\u01CEng	6	v	grow|yield|develop
\u65F7\u8BFE	ku\xE0ng k\xE8	7	v	play truant|cut classes
\u4EAD\u5B50	t\xEDng zi	6	n	pavilion
\u4E0D\u5229\u4E8E	b\xF9 l\xECy\xFA	7	v	is harmful to
\u7A0D\u5019	sh\u0101o h\xF2u	7	v	wait a moment
\u4E49\u5DE5	y\xEC g\u014Dng	7	nr	volunteer worker|volunteer work
\u8574\u6DB5	y\xF9n h\xE1n	7	v	contain|accumulate|embrace|implicit condition|implication|entailment
\u96BE\u80FD\u53EF\u8D35	n\xE1n n\xE9ng k\u011B gu\xEC	6	v	rare and precious|valuable|remarkable
\u4E0D\u7EA6\u800C\u540C	b\xF9 yu\u0113 \xE9r t\xF3ng	7	l	agree by chance
\u65F1\u707E	h\xE0n z\u0101i	7	n	drought
\u53E4\u6734	g\u01D4 p\u01D4	7	a	simple and unadorned
\u51FA\u96BE\u9898	ch\u016B n\xE1n t\xED	7	v	raise a tough question
\u4E00\u8DEF\u5E73\u5B89	y\u012B l\xF9 p\xEDng \u0101n	2		have a pleasant journey|bon voyage
\u4EA1\u7F8A\u8865\u7262	w\xE1ng y\xE1ng b\u01D4 l\xE1o	7	v	fig. to act belatedly|better late than never
\u54FA\u80B2	b\u01D4 y\xF9	7	v	feed|nurture|foster
\u6309\u8BF4	\xE0n shu\u014D	7	d	ordinarily|normally
\u6B23\u6B23\u5411\u8363	x\u012Bn x\u012Bn xi\xE0ng r\xF3ng	7	v	flourishing|thriving
\u5FC3\u6025\u5982\u711A	x\u012Bn j\xED r\xFA f\xE9n	7	v	burn with impatience|torn with anxiety
\u5B98\u540F	gu\u0101n l\xEC	7	n	bureaucrat|official
\u6B21\u54C1	c\xEC p\u01D0n	6	n	substandard products|defective|seconds
\u5343\u5BB6\u4E07\u6237	qi\u0101n ji\u0101 w\xE0n h\xF9	7	l	every family
\u5907\u8BFE	b\xE8i k\xE8	7	v	prepare lessons
\u5B88\u682A\u5F85\u5154	sh\u01D2u zh\u016B d\xE0i t\xF9	7	v	wait idly for opportunities
\u6539\u4E3A	g\u01CEi w\xE9i	7	v	change into
\u843D\u6237	lu\xF2 h\xF9	7	v	settle|set up home
\u601C\u60DC	li\xE1n x\u012B	7	v	take pity on|feel tenderness toward
\u5E08\u957F	sh\u012B zh\u01CEng	7	n	military division level commander|teacher
\u51FA\u795E	ch\u016B sh\xE9n	6	v	spellbound|entranced|lost in thought
\u60E8\u767D	c\u01CEn b\xE1i	7	z	deathly pale
\u78A7\u7EFF	b\xEC l\u01DC	7	z	dark green
\u4E0D\u8F9E\u800C\u522B	b\xF9 c\xED \xE9r bi\xE9	7	v	leave without saying good-bye
\u6E05\u660E	q\u012Bng m\xEDng	7	t	clear and bright|sober and calm|well ordered
\u5E38\u6E29	ch\xE1ng w\u0113n	7	n	room temperature|ordinary temperatures
\u9AA4\u7136	zh\xF2u r\xE1n	7	d	suddenly|abruptly
\u54D7\u7136	hu\xE1 r\xE1n	7	z	in uproar|commotion|tumultuous
\u5FD9\u4E71	m\xE1ng lu\xE0n	7	a	rushed and muddled
\u4FBF\u6761	bi\xE0n ti\xE1o	5	n	note
\u7F8E\u4E2D\u4E0D\u8DB3	m\u011Bi zh\u014Dng b\xF9 z\xFA	7	l	fly in the ointment
\u4E0D\u5047\u601D\u7D22	b\xF9 ji\u01CE s\u012B su\u01D2	7	l	react instantly|fire from the hip
\u8C41\u8FBE	hu\xF2 d\xE1	7	a	optimistic|sanguine|generous|magnanimous|open-minded
\u9632\u76D7\u95E8	f\xE1ng d\xE0o m\xE9n	7	n	security door
\u70E6\u95F7	f\xE1n m\xE8n	7	a	moody|gloomy
\u501F\u6761	ji\xE8 ti\xE1o	7	n	receipt for a loan|iou
\u524D\u65E0\u53E4\u4EBA	qi\xE1n w\xFA g\u01D4 r\xE9n	7	l	unprecedented|unheard of
\u671D\u4EE3	ch\xE1o d\xE0i	7	n	dynasty|reign
\u8BDE\u8FB0	d\xE0n ch\xE9n	7	n	birthday
\u788D\u4E8B	\xE0i sh\xEC	7	a	be in the way|be a hindrance|be of consequence|matter
\u6DF7\u6D4A	h\xF9n zhu\xF3	7	a	turbid|muddy|dirty
\u95ED\u5E55\u5F0F	b\xEC m\xF9 sh\xEC	5	n	closing ceremony
\u77ED\u4FC3	du\u01CEn c\xF9	6	a	short in time|fleeting|brief|gasping|curt
\u50FB\u9759	p\xEC j\xECng	7	a	lonely|secluded
\u5C0F\u66F2	xi\u01CEo q\u01D4	7	n	popular song|folk tune|ballad
\u7A3B\u8C37	d\xE0o g\u01D4	6	n	unhusked rice|paddy
\u7EB5\u6DF1	z\xF2ng sh\u0113n	7	n	depth|span
\u840C\u53D1	m\xE9ng f\u0101	7	v	sprout|shoot|bud
\u5824\u575D	d\u012B b\xE0	7	n	dam|dike
\u6708\u521D	yu\xE8 ch\u016B	7	t	start of month|early in the month
\u98CE\u548C\u65E5\u4E3D	f\u0113ng h\xE9 r\xEC l\xEC	7	v	moderate wind, beautiful sun
\u6D17\u6DA4\u5242	x\u01D0 d\xED j\xEC	7	n	cleaning agent|detergent
\u5BB6\u5BB6\u6237\u6237	ji\u0101 ji\u0101 h\xF9 h\xF9	7	l	each and every family|every household
\u8FDE\u5E74	li\xE1n ni\xE1n	6	b	successive years|over many years
\u5927\u6709\u53EF\u4E3A	d\xE0 y\u01D2u k\u011B w\xE9i	7	v	well worth doing
\u504F\u65B9	pi\u0101n f\u0101ng	7	n	folk remedy|home remedy
\u5E95\u8574	d\u01D0 y\xF9n	7	n	inside information|concrete details
\u589E\u6536	z\u0113ng sh\u014Du	7	v	increase revenue|increase income by|levy
\u755C\u7267	x\xF9 m\xF9	6	n	raise animals
\u4F9D\u4F9D\u4E0D\u820D	y\u012B y\u012B b\xF9 sh\u011B	7	v	reluctant to part
\u5BB3\u81CA	h\xE0i s\xE0o	7	a	be bashful|feel ashamed
\u4E1C\u5F20\u897F\u671B	d\u014Dng zh\u0101ng x\u012B w\xE0ng	7	v	look in all directions|glance around
\u7EDC\u7ECE\u4E0D\u7EDD	lu\xF2 y\xEC b\xF9 ju\xE9	7	v	continuously|in an endless stream
\u7269\u6D41	w\xF9 li\xFA	7	n	distribution|logistics
\u5382\u957F	ch\u01CEng zh\u01CEng	5	n	factory director
\u7855\u679C	shu\xF2 gu\u01D2	7	n	major achievement|great work|triumphant success
\u7A7A\u513F	k\xF2ng r	3	n	spare time|free time
\u79E7\u6B4C	y\u0101ng ge	7		yangge|popular rural folk dance
\u7EA2\u773C	h\xF3ng y\u01CEn	7	v	become infuriated|see red|envious|jealous|covetous|pink eye|red-eye red eye
\u754F\u7F29	w\xE8i su\u014D	7	v	cower|flinch|quail|recoil
\u591A\u5FC3	du\u014D x\u012Bn	7	a	oversensitive|suspicious
\u4E3E\u4E16\u95FB\u540D	j\u01D4 sh\xEC w\xE9n m\xEDng	7	v	world-famous
\u6101\u7709\u82E6\u8138	ch\xF3u m\xE9i k\u01D4 li\u01CEn	7		look anxious|look miserable
\u7C97\u5FC3\u5927\u610F	c\u016B x\u012Bn d\xE0 y\xEC	7	v	negligent|careless|inadvertent
\u4E89\u5206\u593A\u79D2	zh\u0113ng f\u0113n du\xF3 mi\u01CEo	7	l	race against time|making every second count
\u6587\u5A31	w\xE9n y\xFA	6	n	cultural recreation|entertainment
\u9F99\u821F	l\xF3ng zh\u014Du	7	n	dragon boat|imperial boat
\u8F66\u53F7	ch\u0113 h\xE0o	6	n	vehicle number
\u5782\u5934\u4E27\u6C14	chu\xED t\xF3u s\xE0ng q\xEC	7		hanging one's head dispiritedly|dejected|crestfallen
\u5F0A\u75C5	b\xEC b\xECng	7	n	malady|evil|malpractice|drawback|disadvantage
\u4E0D\u6562\u5F53	b\xF9 g\u01CEn d\u0101ng	5	v	lit. i dare not|you flatter me
\u5316\u7EA4	hu\xE0 xi\u0101n	7	n	synthetic fiber
\u4E1C\u9053\u4E3B	d\u014Dng d\xE0o zh\u01D4	7	n	host|official host
\u58EE\u80C6	zhu\xE0ng d\u01CEn	7	v	get one\u2019s courage up|embolden
\u6E05\u771F	q\u012Bng zh\u0113n	6	b	islamic|muslim|halal|clean|pure
\u4E16\u88AD	sh\xEC x\xED	7	vn	succession|inheritance|hereditary
\u519C\u5386	n\xF3ng l\xEC	7	n	traditional chinese calendar|lunar calendar
\u4E0D\u4E00\u4F1A\u513F	b\xF9 y\u012Bhu\u01D0r5	2	l	take a short while
\u73CD\u91CD	zh\u0113n zh\xF2ng	7	v	precious|extremely valuable
\u5938\u5938\u5176\u8C08	ku\u0101 ku\u0101 q\xED t\xE1n	7	v	talk big|sound off|bombastic|grandiloquent
\u4E0B\u4E61	xi\xE0 xi\u0101ng	7	v	go to the countryside
\u94DC\u77FF	t\xF3ng ku\xE0ng	6	n	copper mine|copper ore
\u4E3E\u4E16\u77A9\u76EE	j\u01D4 sh\xEC zh\u01D4 m\xF9	7	l	receive worldwide attention
\u5B81\u80AF	n\xECng k\u011Bn	6	d	would rather|it would be better|would prefer
\u5F18\u626C	h\xF3ng y\xE1ng	7	v	enhance|promote|enrich
\u8D70\u6F0F	z\u01D2u l\xF2u	6	v	leak|smuggle and evade tax|suffer shrinkage
\u540C\u4EBA	t\xF3ng r\xE9n	7	n	co-worker|colleague
\u521A\u6BC5	g\u0101ng y\xEC	7	a	resolute|steadfast|stalwart
\u87BA\u4E1D\u9489	lu\xF3 s\u012B d\u012Bng	6	n	screw
\u5316\u9669\u4E3A\u5937	hu\xE0 xi\u01CEn w\xE9i y\xED	7	v	turn peril into safety|avert disaster
\u8054\u6B22	li\xE1n hu\u0101n	7	v	have a get-together|celebration|party
\u4FCA\u4FCF	j\xF9n qi\xE0o	7	a	attractive and intelligent|charming|elegant
\u6843\u6811	t\xE1o sh\xF9	5	n	peach tree
\u522E\u98CE	gu\u0101 f\u0113ng	7	v	be windy
\u8D70\u8FC7\u573A	z\u01D2u gu\xF2 ch\u01CEng	7	v	go through the motions
\u6210\u5FC3	ch\xE9ng x\u012Bn	6	d	intentional|deliberate|on purpose
\u6263\u4EBA\u5FC3\u5F26	k\xF2u r\xE9n x\u012Bn xi\xE1n	7	v	excite|thrill|exciting|thrilling|cliff-hanging
\u5149\u660E\u78CA\u843D	gu\u0101ng m\xEDng l\u011Bi lu\xF2	7	v	open and candid|straightforward and upright
\u9605\u89C8\u5BA4	yu\xE8 l\u01CEn sh\xEC	5	n	reading room
\u5343\u94A7\u4E00\u53D1	qi\u0101n j\u016Bn y\u012B f\xE0	7	l	imminent peril
\u914C\u60C5	zhu\xF3 q\xEDng	7	d	use discretion|take circumstances into account
\u5343\u53D8\u4E07\u5316	qi\u0101n bi\xE0n w\xE0n hu\xE0	7	v	countless changes|constant permutation
\u671D\u6C14\u84EC\u52C3	zh\u0101o q\xEC p\xE9ng b\xF3	7	v	full of youthful energy|vigorous|energetic|bright spark
\u4E00\u4E2A\u52B2\u513F	y\u012B g\xE8 j\xECn r	7		continuously
\u65A9\u9489\u622A\u94C1	zh\u01CEn d\u012Bng ji\xE9 ti\u011B	6	l	fig. resolute and decisive|unhesitating|categorical
\u641E\u9B3C	g\u01CEo gu\u01D0	7	v	make mischief|play tricks
\u8BDA\u5FC3\u8BDA\u610F	ch\xE9ng x\u012Bn ch\xE9ng y\xEC	7	l	earnestly and sincerely|with all sincerity
\u7470\u5B9D	gu\u012B b\u01CEo	7	n	gem|rare and valuable item|treasure
\u7ACB\u65B9\u7C73	l\xEC f\u0101ng m\u01D0	7	q	cubic meter
\u6708\u997C	yu\xE8 b\u01D0ng	5	n	mooncake
\u516C\u5F00\u4FE1	g\u014Dng k\u0101i x\xECn	7	n	open letter
\u9884\u4E60	y\xF9 x\xED	3	v	prepare a lesson
\u8BF4\u4E0D\u4E0A	shu\u014D bu sh\xE0ng	7	v	not be worth mentioning
\u5929\u4F26\u4E4B\u4E50	ti\u0101n l\xFAn zh\u012B l\xE8	6	l	family love and joy|domestic bliss
\u5E26\u5934\u4EBA	d\xE0i t\xF3u r\xE9n	7	n	leader
\u6B20\u6761	qi\xE0n ti\xE1o	7	n	iou|certificate of indebtedness
\u4E4C\u9ED1	w\u016B h\u0113i	6	z	jet-black|dark
\u89C1\u95FB	ji\xE0n w\xE9n	6	n	knowledge|one's experience
\u540C\u821F\u5171\u6D4E	t\xF3ng zh\u014Du g\xF2ng j\xEC	7	v	fig. having common interests
\u81EA\u5F3A\u4E0D\u606F	z\xEC qi\xE1ng b\xF9 x\u012B	7	v	strive unremittingly|self-improvement
\u5806\u780C	du\u012B q\xEC	7	v	lit. to pile up|pack|fig. to pad out|ornate rhetoric
\u5E8F\u8A00	x\xF9 y\xE1n	6	n	preface|introductory remarks|preamble|prelude
\u5C3A\u5B50	ch\u01D0 zi	4	n	ruler
\u65D7\u888D	q\xED p\xE1o	7	n	chinese-style dress|cheongsam
\u8BF4\u60C5	shu\u014D q\xEDng	7	v	intercede|plead for sb else
\u89C1\u591A\u8BC6\u5E7F	ji\xE0n du\u014D sh\xED gu\u01CEng	6	v	experienced and knowledgeable
\u7CBE\u76CA\u6C42\u7CBE	j\u012Bng y\xEC qi\xFA j\u012Bng	7	v	constantly improving
\u7EC8\u5E74	zh\u014Dng ni\xE1n	6	n	entire year|throughout the year|age at death
\u803B\u7B11	ch\u01D0 xi\xE0o	7	v	sneer at sb|ridicule
\u8DD1\u9F99\u5957	p\u01CEo l\xF3ng t\xE0o	7	v	play a small role
\u4ECE\u5BB9\u4E0D\u8FEB	c\xF3ng r\xF3ng b\xF9 p\xF2	7	v	calm|unruffled
\u7A20\u5BC6	ch\xF3u m\xEC	7	a	dense
\u957F\u8FBE	ch\xE1ng d\xE1	7	nr	extend as long as|lengthen out to
\u6D2A\u4EAE	h\xF3ng li\xE0ng	7	a	loud and clear|resonant
\u5CF0\u56DE\u8DEF\u8F6C	f\u0113ng hu\xED l\xF9 zhu\u01CEn	7	v	twisting and turning
\u5B09\u7B11	x\u012B xi\xE0o	7	v	be laughing and playing|giggle
\u9E64\u7ACB\u9E21\u7FA4	h\xE8 l\xEC j\u012B q\xFAn	7	v	way above the common|manifestly superior
\u98CE\u6C99	f\u0113ng sh\u0101	7	n	sand blown by wind|sandstorm
\u5927\u5927\u54A7\u54A7	d\xE0 d\xE0 li\u0113 li\u0113	7	z	carefree|offhand|casual
\u9AD8\u65B0\u6280\u672F	g\u0101o x\u012Bn j\xEC sh\xF9	7	n	high tech|high technology
\u6807\u70B9	bi\u0101o di\u01CEn	5	n	punctuation|punctuation mark|punctuate
\u559C\u6D0B\u6D0B	x\u01D0 y\xE1ng y\xE1ng	7		radiant with joy
\u5047\u4F7F	ji\u01CE sh\u01D0	7	c	if|in case|suppose|given
\u8BB2\u5B66	ji\u01CEng xu\xE9	7	v	lecture
\u5B66\u5B50	xu\xE9 z\u01D0	7	n	student|scholar
\u7FBD\u7ED2\u670D	y\u01D4 r\xF3ng f\xFA	5	n	down-filled garment
\u7C4D\u8D2F	j\xED gu\xE0n	6	n	one's native place|place of ancestry|registered birthplace
\u5DE5\u6574	g\u014Dng zh\u011Bng	7	a	fine work|carefully and neatly done
\u8377\u82B1	h\xE9 hu\u0101	7	n	lotus
\u63D0\u901F	t\xED s\xF9	7	v	pick up speed|speed up
\u53E3\u8BD5	k\u01D2u sh\xEC	6	v	oral examination|oral test
\u53D8\u5E7B\u83AB\u6D4B	bi\xE0n hu\xE0n m\xF2 c\xE8	7	l	change unpredictably|unpredictable|erratic|treacherous
\u8BF7\u5750	q\u01D0ng zu\xF2	1		please, have a seat
\u6C42\u533B	qi\xFA y\u012B	7	v	seek medical treatment|see a doctor
\u7406\u76F4\u6C14\u58EE	l\u01D0 zh\xED q\xEC zhu\xE0ng	7	l	just and forceful
\u79F0\u5FC3\u5982\u610F	ch\xE8n x\u012Bn r\xFA y\xEC	6	v	after one's own heart|gratifying|satisfactory|everything one could wish
\u6BDB\u7B14	m\xE1o b\u01D0	5	n	writing brush
\u6CBF\u7EBF	y\xE1n xi\xE0n	7	f	along the line|region near the line
\u6C34\u8D27	shu\u01D0 hu\xF2	7	n	smuggled goods|unauthorized goods
\u52C9\u52B1	mi\u01CEn l\xEC	6	v	encourage
\u6811\u68A2	sh\xF9 sh\u0101o	7	n	tip of a tree|treetop
\u77FF\u85CF	ku\xE0ng c\xE1ng	7	n	mineral resources
\u8C46\u5236\u54C1	d\xF2u zh\xEC p\u01D0n	5	n	legume-based product|soybean product
\u7EFC\u4E0A\u6240\u8FF0	z\u014Dng sh\xE0ng su\u01D2 sh\xF9	7	c	summarize|sum up
\u65CB\u6DA1	xu\xE1n w\u014D	7	n	spiral|whirlpool|eddy|vortex
\u4E00\u5E74\u5230\u5934	y\u012B ni\xE1n d\xE0o t\xF3u	7	l	all year round
\u6F20\u7136	m\xF2 r\xE1n	7	z	indifferent|apathetic|cold
\u534A\u5E74	b\xE0n ni\xE1n	1	nr	half a year
\u4E00\u8A00\u4E00\u884C	y\u012B y\xE1n y\u012B x\xEDng	7	l	every word and action
\u6C89\u7538\u7538	ch\xE9n di\xE0n di\xE0n	7	z	heavy
\u534A\u8FB9\u5929	b\xE0n bi\u0101n ti\u0101n	7	n	half the sky|womenfolk
\u8DB3\u667A\u591A\u8C0B	z\xFA zh\xEC du\u014D m\xF3u	7	v	resourceful|full of stratagems
\u4F3C\u662F\u800C\u975E	s\xEC sh\xEC \xE9r f\u0113i	7	v	specious
\u4EBA\u6B21	r\xE9n c\xEC	7	qv	person-times|visits
\u6539\u90AA\u5F52\u6B63	g\u01CEi xi\xE9 gu\u012B zh\xE8ng	7	v	mend one's ways
\u52B3\u9A7E	l\xE1o ji\xE0	5	v	excuse me
\u5360\u7EBF	zh\xE0n xi\xE0n	5	v	busy
\u78C1\u5361	c\xED k\u01CE	7	n	magnetic card|ic card
\u67CF\u6811	b\u01CEi sh\xF9	7	n	cypress tree|taiwan pr
\u8D3A\u7535	h\xE8 di\xE0n	7	n	congratulatory telegram
\u5A07\u6C14	ji\u0101o q\xEC	7	a	delicate|squeamish|finicky
\u519C\u6C11\u5DE5	n\xF3ng m\xEDn g\u014Dng	7	n	migrant worker
\u51F9\u51F8	\u0101o t\u016B	6	n	concave or convex|bumps and holes|uneven|rugged
\u9526\u65D7	j\u01D0n q\xED	7	n	silk banner
\u8D2C\u4E49	bi\u01CEn y\xEC	6	n	derogatory sense|negative connotation
\u8863\u98DF\u4F4F\u884C	y\u012B sh\xED zh\xF9 x\xEDng	7	l	people's basic needs
\u591A\u8FB9	du\u014D bi\u0101n	7	b	multilateral
\u9532\u800C\u4E0D\u820D	qi\xE8 \xE9r b\xF9 sh\u011B	6	v	chisel away at sth|persevere|unflagging efforts
\u7956\u7C4D	z\u01D4 j\xED	7	n	ancestral hometown|original domicile
\u6D6E\u529B	f\xFA l\xEC	7	n	buoyancy
\u80FD\u8017	n\xE9ng h\xE0o	7	n	energy consumption
\u72AF\u6101	f\xE0n ch\xF3u	7	v	worry|be anxious
\u8109\u7EDC	m\xE0i lu\xF2	7	n	arteries and veins|network of blood vessels|vascular system|fabric|overall context
\u6D25\u6D25\u6709\u5473	j\u012Bn j\u012Bn y\u01D2u w\xE8i	7	l	with keen interest|with great pleasure|with gusto|eagerly
\u6CFC\u51B7\u6C34	p\u014D l\u011Bng shu\u01D0	7	v	pour cold water on|dampen sb's enthusiasm
\u5B9A\u5FC3\u4E38	d\xECng x\u012Bn w\xE1n	7	n	tranquilizer
\u6C8F	q\u012B	7	v	steep
\u5AE6\u5A25	Ch\xE1ng \xE9	7	n	chang'e|lady in the moon
\u70D8\u6258	h\u014Dng tu\u014D	7	v	background|backdrop|foil|offset
\u4E0D\u4E9A\u4E8E	b\xF9 y\xE0 y\xFA	7	v	no less than|not inferior to
\u5C71\u5CAD	sh\u0101n l\u01D0ng	7	n	mountain ridge
\u52E4\u4FED	q\xEDn ji\u01CEn	6	a	hardworking and frugal
\u8E0A\u8DC3	y\u01D2ng yu\xE8	7	ad	leap|jump|eager|enthusiastically
\u5F3A\u5360	qi\xE1ng zh\xE0n	7	v	occupy by force
\u9187\u539A	ch\xFAn h\xF2u	7	a	mellow and rich|simple and kind
\u4E30\u7855	f\u0113ng shu\xF2	7	a	plentiful|substantial|rich
\u89C2\u611F	gu\u0101n g\u01CEn	7	n	one's impressions|observations
\u5199\u5B57\u53F0	xi\u011B z\xEC t\xE1i	6	n	writing desk
\u7089\u7076	l\xFA z\xE0o	7	n	stove
\u6539\u65E5	g\u01CEi r\xEC	7	d	another day|some other day
\u4FA0\u4E49	xi\xE1 y\xEC	7	a	chivalrous|chivalry|knight-errantry
\u98CE\u571F\u4EBA\u60C5	f\u0113ng t\u01D4 r\xE9n q\xEDng	6	l	local conditions and customs
\u5FC5\u4FEE	b\xEC xi\u016B	6	vn	required|compulsory
\u660C\u76DB	ch\u0101ng sh\xE8ng	6	an	prosperous
\u4E34\u8857	l\xEDn ji\u0113	7	vn	facing the street
\u529E\u5B66	b\xE0n xu\xE9	6	vn	run a school
\u76F8\u8F85\u76F8\u6210	xi\u0101ng f\u01D4 xi\u0101ng ch\xE9ng	7	v	complement one another
\u5EFA\u4EA4	ji\xE0n ji\u0101o	7	v	establish diplomatic relations
\u5206\u8D43	f\u0113n z\u0101ng	7	v	share the booty|divide ill-gotten gains
\u7E41\u4F53\u5B57	f\xE1n t\u01D0 z\xEC	7		traditional chinese character
\u52E4\u5DE5\u4FED\u5B66	q\xEDn g\u014Dng ji\u01CEn xu\xE9	7	v	work-study program
\u5934\u5934\u662F\u9053	t\xF3u t\xF3u sh\xEC d\xE0o	7	l	clear and logical
\u5916\u8D44	w\xE0i z\u012B	6	n	foreign investment
\u6253\u5C94	d\u01CE ch\xE0	7	v	interruption|interrupt|change the subject
\u8F66\u8F74	ch\u0113 zh\xF3u	7	n	axle
\u56FD\u5FBD	gu\xF3 hu\u012B	7		national emblem|national coat of arms
\u593A\u9B41	du\xF3 ku\xED	7	v	seize|win
\u6170\u52B3	w\xE8i l\xE1o	7	v	show appreciation|comfort
\u8DF3\u8FDC	ti\xE0o yu\u01CEn	3	vn	long jump
\u534A\u4FE1\u534A\u7591	b\xE0n x\xECn b\xE0n y\xED	7	v	half doubting|dubious|skeptical
\u4EAC\u5267	J\u012Bng j\xF9	3	n	beijing opera
\u8B6C\u5982\u8BF4	p\xEC r\xFA shu\u014D	7	v	for example
\u58EE\u5B9E	zhu\xE0ng shi	7	a	robust|sturdy
\u4FEF\u9996	f\u01D4 sh\u01D2u	7	v	bend one's head
\u6E23\u5B50	zh\u0101 zi	7	n	dregs|bits
\u5146\u5934	zh\xE0o tou	7	n	omen|portent|sign
\u8BB9\u8BC8	\xE9 zh\xE0	7	v	extort under false pretenses|blackmail|bluff|defraud
\u65E0\u6076\u4E0D\u4F5C	w\xFA \xE8 b\xF9 zu\xF2	7	v	commit any imaginable misdeed
\u6C34\u6DA8\u8239\u9AD8	shu\u01D0 zh\u01CEng chu\xE1n g\u0101o	7	v	tide rises|boat floats
\u5F97\u5929\u72EC\u539A	d\xE9 ti\u0101n d\xFA h\xF2u	7	l	blessed by heaven|enjoying exceptional advantages|favored by nature
\u9012\u589E	d\xEC z\u0113ng	6	v	increase by degrees|in increasing order|incremental|progressive
\u79C9\u627F	b\u01D0ng ch\xE9ng	7	v	take orders|receive commands|carry on
\u5E03\u544A	b\xF9 g\xE0o	6	n	notice|bulletin|announce
\u534E\u4FA8	Hu\xE1 qi\xE1o	7	n	overseas chinese
\u6CA1\u6CD5\u513F	m\xE9if\u01CEr5	4	l	can't
\u65E0\u5F62\u4E2D	w\xFA x\xEDng zh\u014Dng	7	d	imperceptibly|virtually
\u8FDC\u8FD1\u95FB\u540D	yu\u01CEn j\xECn w\xE9n m\xEDng	7	l	be well-known
\u8FC7\u5956	gu\xF2 ji\u01CEng	7	v	overpraise|flatter
\u94BB\u7A7A\u5B50	zu\u0101n k\xF2ng zi	7	v	exploit an advantage|seize the opportunity
\u604B\u604B\u4E0D\u820D	li\xE0n li\xE0n b\xF9 sh\u011B	7	v	reluctant to part
\u7EAF\u51C0\u6C34	ch\xFAn j\xECng shu\u01D0	4	n	purified water
\u4F1A\u610F	hu\xEC y\xEC	7	v	cotton on|knowing
\u8138\u76C6	li\u01CEn p\xE9n	5	q	washbowl
\u8BF4\u95F2\u8BDD	shu\u014D xi\xE1n hu\xE0	7	v	chat|gossip
\u6025\u4E8E\u6C42\u6210	j\xED y\xFA qi\xFA ch\xE9ng	6	v	anxious for quick results|demand instant success|impatient for result|impetuous
\u535A\u5927\u7CBE\u6DF1	b\xF3 d\xE0 j\u012Bng sh\u0113n	6	v	wide-ranging and profound|broad and deep
\u5E72\u6D3B\u513F	g\xE0n hu\xF3 r	2	v	work|be employed
\u901E\u80FD	ch\u011Bng n\xE9ng	7	v	show off one's ability|boast one's merits
\u559C\u9152	x\u01D0 ji\u01D4	7	n	wedding feast
\u9614\u7EF0	ku\xF2 chu\xF2	7	a	ostentatious|extravagant|liberal with money
\u4ED9\u9E64	xi\u0101n h\xE8	7	n	red-crowned crane
\u6709\u58F0\u6709\u8272	y\u01D2u sh\u0113ng y\u01D2u s\xE8	7	l	having sound and color|vivid|dazzling
\u5DE6\u987E\u53F3\u76FC	zu\u01D2 g\xF9 y\xF2u p\xE0n	7	v	look all around
\u79C1\u623F\u94B1	s\u012B f\xE1ng qi\xE1n	7	n	secret purse|secret stash of money
\u586B\u7A7A	ti\xE1n k\xF2ng	4	v	fill a job vacancy|fill in a blank
\u6D3B\u671F	hu\xF3 q\u012B	7	b	current|checking|demand
\u6760\u94C3	g\xE0ng l\xEDng	7	n	barbell
\u770B\u5F97\u8D77	k\xE0n de q\u01D0	6	v	show respect for|think highly of
\u7ECF\u5EA6	j\u012Bng d\xF9	7	n	longitude
\u9762\u7EA2\u8033\u8D64	mi\xE0n h\xF3ng \u011Br ch\xEC	7	l	flushed with anger
\u4EFB\u4EBA\u5BB0\u5272	r\xE8n r\xE9n z\u01CEi g\u0113	7	v	get trampled on|be taken advantage of
\u6208\u58C1	G\u0113 b\xEC	7	n	gobi
\u6349\u8FF7\u85CF	zhu\u014D m\xED c\xE1ng	7		play hide-and-seek
\u559C\u95FB\u4E50\u89C1	x\u01D0 w\xE9n l\xE8 ji\xE0n	6	l	well received|one's liking
\u8BC0\u522B	ju\xE9 bi\xE9	7	v	bid farewell|part
\u79BE\u82D7	h\xE9 mi\xE1o	7		seedling
\u6CE2\u6D9B\u6C79\u6D8C	b\u014D t\u0101o xi\u014Dng y\u01D2ng	6		waves surging forth|roaring sea
\u7A7A\u524D\u7EDD\u540E	k\u014Dng qi\xE1n ju\xE9 h\xF2u	6	v	first and the last|unmatched|unique
\u671B\u89C1	w\xE0ng ji\xE0n	6	v	espy|spot
\u95E8\u5F53\u6237\u5BF9	m\xE9n d\u0101ng h\xF9 du\xEC	7	v	appropriate match
\u4E00\u9505\u7CA5	y\u012B gu\u014D zh\u014Du	7	l	pot of porridge|complete mess
\u5DDD\u6D41\u4E0D\u606F	chu\u0101n li\xFA b\xF9 x\u012B	7	v	stream flows without stopping|unending flow
\u7D6E\u53E8	x\xF9 dao	7	v	long-winded|garrulous
\u5EC9\u653F	li\xE1n zh\xE8ng	7	n	govern with integrity|clean and honest government
\u6768\u6811	y\xE1ng sh\xF9	7	n	poplar tree
\u5BF9\u5F08	du\xEC y\xEC	7	v	play go, chess etc
\u9E26\u96C0\u65E0\u58F0	y\u0101 qu\xE8 w\xFA sh\u0113ng	7	v	absolute silence
\u5343\u519B\u4E07\u9A6C	qi\u0101n j\u016Bn w\xE0n m\u01CE	7	l	impressive display of manpower
\u7EAA\u8981	j\xEC y\xE0o	6	n	minutes
\u542C\u5199	t\u012Bng xi\u011B	1	v	write down|dictation|transcribe by ear
\u5BA2\u6D41	k\xE8 li\xFA	7	n	passenger flow|customer flow
\u53EF\u6B4C\u53EF\u6CE3	k\u011B g\u0113 k\u011B q\xEC	7	v	fig. deeply moving|happy and sad|inspiring and tragic
\u4E3E\u4E16\u65E0\u53CC	j\u01D4 sh\xEC w\xFA shu\u0101ng	7	v	unrivaled|world number one|unique|unequaled
\u76DB\u6C14\u51CC\u4EBA	sh\xE8ng q\xEC l\xEDng r\xE9n	7	v	overbearing|arrogant bully
\u5FC3\u7075\u624B\u5DE7	x\u012Bn l\xEDng sh\u01D2u qi\u01CEo	7	v	capable|clever|dexterous
\u9A6C\u540E\u70AE	m\u01CE h\xF2u p\xE0o	7	v	fig. belated action|giving advice in hindsight
\u7231\u9762\u5B50	\xE0i mi\xE0n zi	7	a	proud
\u6A2A\u4E03\u7AD6\u516B	h\xE9ng q\u012B sh\xF9 b\u0101	7		in disorder|at sixes and sevens
\u5B64\u964B\u5BE1\u95FB	g\u016B l\xF2u gu\u01CE w\xE9n	7	v	ignorant and inexperienced|ill-informed and narrow-minded
\u8D50\u6559	c\xEC ji\xE0o	7	v	impart one's wisdom|enlighten
\u63A5\u6D4E	ji\u0113 j\xEC	7	v	give material assistance to
\u8003\u9898	k\u01CEo t\xED	6	n	exam question
\u5435\u5634	ch\u01CEo zu\u01D0	7	v	quarrel
\u5E08\u8D44	sh\u012B z\u012B	7	n	qualified teacher
\u7709\u5F00\u773C\u7B11	m\xE9i k\u0101i y\u01CEn xi\xE0o	7		beaming with joy|all smiles
\u65A9\u8349\u9664\u6839	zh\u01CEn c\u01CEo ch\xFA g\u0113n	7	v	destroy root and branch|eliminate completely
\u540E\u5E74	h\xF2u ni\xE1n	3	t	year after next
\u5E73\u5E38\u5FC3	p\xEDng ch\xE1ng x\u012Bn	7	n	levelheadedness|calmness|equanimity
\u6591\u7EB9	b\u0101n w\xE9n	6	n	stripe|streak
\u5C82\u6709\u6B64\u7406	q\u01D0 y\u01D2u c\u01D0 l\u01D0	7		preposterous|ridiculous|absurd
\u6B63\u8D1F	zh\xE8ng f\xF9	6	n	positive and negative
\u6B63\u7248	zh\xE8ng b\u01CEn	5	b	genuine|legal
\u7CBE\u7EC3	j\u012Bng li\xE0n	7	a	scour|degum
\u680B\u6881	d\xF2ng li\xE1ng	7	n	ridgepole|ridgepole and beams|mainstay|pillar
\u653B\u5173	g\u014Dng gu\u0101n	7	vn	storm a strategic pass
\u8D70\u5F2F\u8DEF	z\u01D2u w\u0101n l\xF9	7	v	take an indirect route
\u620F\u66F2	x\xEC q\u01D4	6	n	chinese opera
\u89C1\u4EC1\u89C1\u667A	ji\xE0n r\xE9n ji\xE0n zh\xEC	7	v	opinions differ
\u53D1\u6123	f\u0101 l\xE8ng	7	v	stare blankly|be in a daze
\u56FD\u5B66	gu\xF3 xu\xE9	7	n	chinese national culture|imperial college
\u753B\u86C7\u6DFB\u8DB3	hu\xE0 sh\xE9 ti\u0101n z\xFA	7	l	overdo it
\u9163\u7761	h\u0101n shu\xEC	7	v	sleep soundly
\u5BF9\u8054	du\xEC li\xE1n	7	n	rhyming couplet
\u8336\u9053	ch\xE1 d\xE0o	7	n	japanese tea ceremony|sado
\u6CF0\u6597	t\xE0i d\u01D2u	7	n	doyen|revered authority
\u66B4\u98CE\u9AA4\u96E8	b\xE0o f\u0113ng zh\xF2u y\u01D4	7	l	violent wind and rainstorm|hurricane|tempest
\u745E\u96EA	ru\xEC xu\u011B	7		timely snow
\u4E00\u6982\u800C\u8BBA	y\u012B g\xE0i \xE9r l\xF9n	7	v	lump different matters together
\u5927\u96C1	d\xE0 y\xE0n	7	n	wild goose
\u7ECF\u8D38	j\u012Bng m\xE0o	7	b	trade
\u6F66\u8349	li\xE1o c\u01CEo	7	a	slipshod|careless|slovenly|scrawly|illegible
\u4E92\u4FE1	h\xF9 x\xECn	7	v	mutual trust
\u7535\u5B50\u7248	di\xE0n z\u01D0 b\u01CEn	5	n	electronic edition|digital version
\u4E54\u88C5	qi\xE1o zhu\u0101ng	7		pretend|feign|disguise oneself
\u5927\u516C\u65E0\u79C1	d\xE0 g\u014Dng w\xFA s\u012B	7	v	selfless|impartial
\u6D77\u5185\u5916	h\u01CEi n\xE8i w\xE0i	7	s	domestic and international|at home and abroad
\u7F51\u6C11	w\u01CEng m\xEDn	7	nr	web user|netizen
\u4E92\u8BBF	h\xF9 f\u01CEng	7	v	exchange visits
\u5A07\u60EF	ji\u0101o gu\xE0n	7	v	pamper|coddle|spoil
\u5361\u5B50	qi\u01CE zi	7	n	clip|hair fastener|checkpoint
\u591A\u5143	du\u014D yu\xE1n	7	b	poly-|multi-|multielement|multivariant|multivariate
\u5E72\u6208	g\u0101n g\u0113	7	n	weapons of war|arms
\u597D\u5B66	h\xE0o xu\xE9	6	a	eager to study|studious|erudite|easy to learn
\u5F00\u591C\u8F66	k\u0101i y\xE8 ch\u0113	6	v	burn the midnight oil
\u8FF7\u60D1\u4E0D\u89E3	m\xED hu\xF2 b\xF9 ji\u011B	7	v	feel puzzled
\u6251\u9762\u800C\u6765	p\u016B mi\xE0n \xE9r l\xE1i	7	v	directly in one's face|sth assaults the senses|blatant|eye-catching|assaults the nostrils
\u51B7\u9177\u65E0\u60C5	l\u011Bng k\xF9 w\xFA q\xEDng	7		cold-hearted|unfeeling|callous
\u5F15\u7ECF\u636E\u5178	y\u01D0n j\u012Bng j\xF9 di\u01CEn	7	l	quote chapter and verse
\u6B66\u4FA0	w\u01D4 xi\xE1	6	n	martial arts chivalry|knight-errant
\u611A\u516C\u79FB\u5C71	y\xFA g\u014Dng y\xED sh\u0101n	7	v	old man moves mountains
\u901A\u987A	t\u014Dng sh\xF9n	7	a	smooth|clear and coherent
\u521D\u7B49	ch\u016B d\u011Bng	6	b	elementary
\u6B4C\u548F	g\u0113 y\u01D2ng	7	n	sing
\u8FDE\u5FD9	li\xE1n m\xE1ng	3	d	promptly|at once
\u7ECF\u7EAC	j\u012Bng w\u011Bi	6	n	warp and woof|longitude and latitude|main points
\u6842\u82B1	gu\xEC hu\u0101	7	n	osmanthus flowers|osmanthus fragrans
\u5C0F\u5352	xi\u01CEo z\xFA	7	n	foot soldier|minor figure|nobody|pawn
\u6073\u5207	k\u011Bn qi\xE8	6	a	earnest|sincere
\u4FBF\u996D	bi\xE0n f\xE0n	7	n	ordinary meal|simple home cooking
\u8D5E\u53F9\u4E0D\u5DF2	z\xE0n t\xE0n b\xF9 y\u01D0	7	v	be full of praise
\u7EB5\u6A2A\u4EA4\u9519	z\xF2ng h\xE9ng ji\u0101o cu\xF2	7	v	criss-crossed
\u8282\u6C34	ji\xE9 shu\u01D0	7	vn	save water
\u98CE\u9910\u9732\u5BBF	f\u0113ng c\u0101n l\xF9 s\xF9	7	v	fig. to rough it
\u6021\u7136\u81EA\u5F97	y\xED r\xE1n z\xEC d\xE9	7	v	happy and content
\u4E0A\u671F	sh\xE0ng q\u012B	7	b	previous period
\u5DEE\u4E00\u70B9\u513F	ch\xE0 y\u012B di\u01CEn r	5	d	almost|nearly
\u6162\u8F66	m\xE0n ch\u0113	6	n	local bus or train
\u9662\u58EB	yu\xE0n sh\xEC	7	n	scholar|academician|fellow
\u82E6\u5C3D\u7518\u6765	k\u01D4 j\xECn g\u0101n l\xE1i	6	v	bitterness finishes, sweetness begins|hard times are over|good times just beginning
\u7ED8\u58F0\u7ED8\u8272	hu\xEC sh\u0113ng hu\xEC s\xE8	7		vivid and colorful|true to life|lively and realistic
\u9985\u513F	xi\xE0n r	7	n	filling|stuffing
\u4E09\u756A\u4E94\u6B21	s\u0101n f\u0101n w\u01D4 c\xEC	7	l	over and over again
\u5B66\u65F6	xu\xE9 sh\xED	4	n	class hour|period
\u5FCC\u53E3	j\xEC k\u01D2u	7	v	abstain from certain food|avoid certain foods|be on a diet
\u6E29\u5E26	w\u0113n d\xE0i	6	n	temperate zone
\u52E4\u6073	q\xEDn k\u011Bn	6	a	diligent and attentive|assiduous|sincere
\u505A\u4E1C	zu\xF2 d\u014Dng	6	v	act as host
\u91CE\u708A	y\u011B chu\u012B	7	v	cookout
\u6D9D	l\xE0o	7	v	flooded
\u975E\u91D1\u5C5E	f\u0113i j\u012Bn sh\u01D4	7	n	nonmetal
\u7EA6\u5B9A\u4FD7\u6210	yu\u0113 d\xECng s\xFA ch\xE9ng	7	v	established by popular usage|common usage agreement|customary convention
\u65E0\u60C5\u65E0\u4E49	w\xFA q\xEDng w\xFA y\xEC	7	v	cold and ruthless
\u901A\u8D27	t\u014Dng hu\xF2	6	n	currency|exchange of goods
\u803F\u76F4	g\u011Bng zh\xED	7	a	honest|frank|candid
\u987A\u5DEE	sh\xF9n ch\u0101	7	n	surplus
\u4E1C\u5954\u897F\u8D70	d\u014Dng b\u0113n x\u012B z\u01D2u	7	v	rush about busily|bustle about|hopscotch
\u6CA1\u8BF4\u7684	m\xE9i shu\u014D de	7	v	nothing to pick on|really good|nothing to discuss|settled matter|no problem
\u7F8E\u6ECB\u6ECB	m\u011Bi z\u012B z\u012B	7	z	very happy|elated
\u4FEF\u4EF0	f\u01D4 y\u01CEng	6		small move|pitch
\u6020\u5DE5	d\xE0i g\u014Dng	7	v	go slow
\u5355\u8FB9	d\u0101n bi\u0101n	7	b	unilateral
\u62C9\u9501	l\u0101 su\u01D2	7	n	zipper
\u6CA1\u51C6\u513F	m\xE9i zh\u01D4n r	7		not sure|maybe
\u85E4\u6905	t\xE9ng y\u01D0	7	n	rattan chair
\u5FC3\u773C\u513F	x\u012Bn y\u01CEn r	7		one's thoughts|mind|intention|baseless suspicions
\u6982\u8BBA	g\xE0i l\xF9n	7	n	outline|introduction|survey|general discussion
\u7AEF\u5348\u8282	Du\u0101n w\u01D4 ji\xE9	6	t	dragon boat festival
\u5370\u5237\u672F	y\xECn shu\u0101 sh\xF9	7	n	printing|printing technology
\u7ECF\u4E45\u4E0D\u606F	j\u012Bng ji\u01D4 b\xF9 x\u012B	7	v	prolonged
\u6CBD\u540D\u9493\u8A89	g\u016B m\xEDng di\xE0o y\xF9	7	v	angle for fame|fish for compliments
\u4E22\u4E09\u843D\u56DB	di\u016B s\u0101n l\xE0 s\xEC	6		forgetful|empty-headed
\u6CBE\u5149	zh\u0101n gu\u0101ng	7	v	bask in the light|reflected glory
\u814A\u6708	L\xE0 yu\xE8	7	t	twelfth lunar month
\u5927\u5305\u5927\u63FD	d\xE0 b\u0101o d\xE0 l\u01CEn	7	v	take complete charge
\u6731\u7EA2	zh\u016B h\xF3ng	7	b	vermilion
\u7531\u6B64\u770B\u6765	y\xF3u c\u01D0 k\xE0n l\xE1i	7	l	thereby|judging from this
\u60B2\u6B22\u79BB\u5408	b\u0113i hu\u0101n l\xED h\xE9	7	l	joys and sorrows|partings and reunions|vicissitudes of life
\u82A6\u82B1	l\xFA hu\u0101	7		reed catkin|reed flower
\u4E0D\u592A	b\xF9 t\xE0i	2	nr	not too
\u8282\u6C14	ji\xE9 qi	7	n	solar term
\u8FDE\u6EDA\u5E26\u722C	li\xE1n g\u01D4n d\xE0i p\xE1	7		rolling and crawling|trying frantically to escape
\u671D\u4E09\u66AE\u56DB	zh\u0101o s\u0101n m\xF9 s\xEC	7	v	indecisive|blow hot and cold
\u5185\u9700	n\xE8i x\u016B	7	n	domestic demand
\u6566\u539A	d\u016Bn h\xF2u	7	a	genuine|honest and sincere
\u8001\u4F34\u513F	l\u01CEo b\xE0n r	7	n	husband or wife
\u524D\u4EF0\u540E\u5408	qi\xE1n y\u01CEng h\xF2u h\xE9	7		sway to and fro|rock back and forth
\u4E66\u6A71	sh\u016B ch\xFA	7	n	bookcase
\u7EA2\u6251\u6251	h\xF3ng p\u016B p\u016B	7	z	red|rosy|flushed
\u751F\u8BCD	sh\u0113ng c\xED	2	n	new word
\u8FED\u8D77	di\xE9 q\u01D0	7	v	continuously arising|arise repeatedly
\u8239\u6868	chu\xE1n ji\u01CEng	7	n	oar
\u69D0\u6811	hu\xE1i sh\xF9	7	n	locust tree
\u5927\u6A21\u5927\u6837	d\xE0 m\xFA d\xE0 y\xE0ng	7	l	boldly|ostentatiously|poised|self-assured|taiwan pr
\u8D3A\u4FE1	h\xE8 x\xECn	7	n	congratulatory letter or message
\u54D7\u53D8	hu\xE1 bi\xE0n	7	v	mutiny|rebellion
\u7CD6\u846B\u82A6	t\xE1ng h\xFA lu	6	n	tanghulu
\u51B0\u68CD\u513F	b\u012Bng g\xF9n r	7	n	ice lolly|popsicle
\u8282\u8863\u7F29\u98DF	ji\xE9 y\u012B su\u014D sh\xED	7	v	live frugally
\u7535\u94C3	di\xE0n l\xEDng	7	n	electric bell
\u516C\u51FD	g\u014Dng h\xE1n	7	n	official letter
\u78A7\u7389	b\xEC y\xF9	6	n	jasper
\u9676\u51B6	t\xE1o y\u011B	7	v	fig. to educate
\u7816\u74E6	zhu\u0101n w\u01CE	6	n	tiles and bricks
\u78B0\u9489\u5B50	p\xE8ng d\u012Bng zi	7	v	meet with a rebuff
\u522B\u5177\u5320\u5FC3	bi\xE9 j\xF9 ji\xE0ng x\u012Bn	7		show ingenuity|clever|brilliantly conceived
\u6696\u70D8\u70D8	nu\u01CEn h\u014Dng h\u014Dng	7	z	nice and warm|cozy|heartwarming
\u89C1\u94B1\u773C\u5F00	ji\xE0n qi\xE1n y\u01CEn k\u0101i	7		money-grubbing
\u7231\u7406\u4E0D\u7406	\xE0i l\u01D0 b\xF9 l\u01D0	7	v	standoffish|indifferent
\u9526\u7EE3\u524D\u7A0B	j\u01D0n xi\xF9 qi\xE1n ch\xE9ng	6	l	bright future|bright prospects
\u753B\u513F	hu\xE0 r	2		picture|drawing|painting
\u5947\u82B1\u5F02\u8349	q\xED hu\u0101 y\xEC c\u01CEo	7		very rarely seen, unusual
\u5E10\u5B50	zh\xE0ng zi	7	n	mosquito net
\u6DF1\u60C5\u539A\u8C0A	sh\u0113n q\xEDng h\xF2u y\xEC	6	l	deep friendship
\u6709\u4E24\u4E0B\u5B50	y\u01D2u li\u01CEng xi\xE0 zi	7		have real skill|know one's stuff
\u9163\u7545	h\u0101n ch\xE0ng	7	a	unrestrained|drink with abandon
\u5982\u9189\u5982\u75F4	r\xFA zu\xEC r\xFA ch\u012B	7		intoxicated by sth|obsessed with|mad about sth
\u8033\u95FB\u76EE\u7779	\u011Br w\xE9n m\xF9 d\u01D4	7	v	witness personally
\u4E07\u53E4\u957F\u9752	w\xE0n g\u01D4 ch\xE1ng q\u012Bng	7		remain fresh|last forever|eternal
\u4E00\u6BDB\u4E0D\u62D4	y\u012B m\xE1o b\xF9 b\xE1	7		stingy
\u9ED8\u8BFB	m\xF2 d\xFA	7	v	read in silence
\u7EB3\u95F7\u513F	n\xE0 m\xE8n r	7		puzzled|bewildered
\u5FCD\u9965\u6328\u997F	r\u011Bn j\u012B \xE1i \xE8	7		starving|famished
\u5C71\u5188	sh\u0101n g\u0101ng	7	n	mound|small hill
\u52BF\u4E0D\u53EF\u5F53	sh\xEC b\xF9 k\u011B d\u0101ng	7	v	impossible to resist|irresistible force
\u4F83\u5927\u5C71	k\u01CEn d\xE0 sh\u0101n	7		chatter idly|gossip|boast or brag
\u7206\u51B7\u95E8	b\xE0o l\u011Bng m\xE9n	7	v	upset|unexpected turn of events|pull off a coup|breakthrough
\u51FA\u53E3\u6210\u7AE0	ch\u016B k\u01D2u ch\xE9ng zh\u0101ng	7		eloquent|articulate
\u98DE\u79BD\u8D70\u517D	f\u0113i q\xEDn z\u01D2u sh\xF2u	6	l	birds and animals
\u4E2A\u5934\u513F	g\xE8 t\xF3u r	7		size|height|stature
\u7535\u996D\u9505	di\xE0n f\xE0n gu\u014D	5	n	electric rice cooker
\u62EC\u5F27	ku\xF2 h\xFA	7		parenthesis
\u9020\u7EB8\u672F	z\xE0o zh\u01D0 sh\xF9	7		papermaking process
\u515C\u513F	d\u014Du r	7		pocket|bag
\u9042\u5FC3	su\xEC x\u012Bn	7	v	one's liking
\u804A\u5929\u513F	li\xE1o ti\u0101n r	6		chat|gossip
\u6572\u8FB9\u9F13	qi\u0101o bi\u0101n g\u01D4	7	v	back sb up
\u4E00\u957F\u4E00\u77ED	y\u012B ch\xE1ng y\u012B du\u01CEn	7		talking endlessly|long-winded
\u95F9\u7740\u73A9\u513F	n\xE0o zhe w\xE1n r	7		play games|joke around
\u5C0F\u5077\u513F	xi\u01CEot\u014Dur5	5		thief
\u80E1\u540C\u513F	h\xFAt\xF2ngr5	5		alley
\u968F\u5927\u6E9C	su\xED d\xE0 li\xF9	7		follow the crowd|going with the tide
\u5EC9\u6B63	li\xE1n zh\xE8ng	7		upright and honest|integrity
\u4E00\u4E0B\u513F	y\u012B xi\xE0 r	1		one time|once|all of sudden
\u4E0B\u4E2A\u6708	xi\xE0 g\xE8 yu\xE8	4		next month
\u4E0B\u5468	xi\xE0 zh\u014Du	2		next week
\u4E0D\u670D\u6C14	b\xF9 f\xFA q\xEC	7		unwilling to concede|defiant|indignant|find it galling
\u4E0E\u65F6\u4FF1\u8FDB	y\u01D4 sh\xED j\xF9 j\xECn	7		abreast of modern developments|progressive|timely
\u4E8C\u7EF4\u7801	\xE8r w\xE9i m\u01CE	5		two-dimensional barcode|qr code
\u4EBA\u7F18\u513F	r\xE9n yu\xE1n r	7		relations with other people
\u4ECE\u4ECA\u4EE5\u540E	c\xF3ng j\u012Bn y\u01D0 h\xF2u	7		from now on|henceforward
\u4ECE\u65E9\u5230\u665A	c\xF3ng z\u01CEo d\xE0o w\u01CEn	7		from morning till night|from dawn to dusk|all day long
\u4F4E\u78B3	d\u012B t\xE0n	7		low-carbon|low-carb
\u4F7F\u52B2\u513F	sh\u01D0 j\xECn r	5		exert all one's strength
\u4FBF\u5229\u5E97	bi\xE0n l\xEC di\xE0n	7		convenience store
\u516C\u4EA4\u8F66	g\u014Dng ji\u0101o ch\u0113	2		public transport vehicle|town bus
\u516C\u793A	g\u014Dng sh\xEC	7		public notification
\u522B\u63D0\u4E86	bi\xE9 t\xED le	7		say no more|don't bring it up|drop the subject
\u529E\u4E0D\u5230	b\xE0n bu d\xE0o	7		impossible|can't be done|no can do|unable to accomplish
\u5374\u662F	qu\xE8 sh\xEC	6		nevertheless|actually|fact is
\u539F\u521B	yu\xE1n chu\xE0ng	7		create|original|originality|original work
\u53CC\u8D62	shu\u0101ng y\xEDng	7		profitable to both sides|win-win situation
\u53D6\u6B3E\u673A	q\u01D4 ku\u01CEn j\u012B	6		atm
\u53D7\u8FC7	sh\xF2u gu\xF2	7		take the blame
\u5403\u4E0D\u4E0A	ch\u012B bu sh\xE0ng	7		miss a meal
\u540D\u724C\u513F	m\xEDngp\xE1ir5	4		famous brand
\u540E\u5907\u7BB1	h\xF2u b\xE8i xi\u0101ng	7		trunk|boot
\u5439\u4E86	chu\u012B le	7		failed|busted|have not succeeded|have died|have parted company|have chilled
\u54A7\u5634	li\u011B zu\u01D0	7		grin
\u5927\u6570\u636E	d\xE0 sh\xF9 j\xF9	7		big data
\u5927\u8155\u513F	d\xE0 w\xE0n r	7		big name|big shot
\u5982\u679C\u8BF4	r\xFA gu\u01D2 shu\u014D	7		if
\u5FAE\u535A	w\u0113i b\xF3	5		microblogging|microblog
\u5FEB\u70B9\u513F	ku\xE0i di\u01CEn r	2		do smh more quickly|hurry up
\u5FFD\u9AD8\u5FFD\u4F4E	h\u016B g\u0101o h\u016B d\u012B	7		alternately soaring and plunging
\u6027\u4EF7\u6BD4	x\xECng ji\xE0 b\u01D0	7		cost-performance ratio
\u6253\u76F9\u513F	d\u01CE d\u01D4n r	7		doze off
\u6253\u7BEE\u7403	d\u01CE l\xE1n qi\xFA	2		play basketball
\u62A5\u4EAD	b\xE0o t\xEDng	7		kiosk|newsstand
\u62DB\u6295\u6807	zh\u0101o t\xF3u bi\u0101o	6		bidding|auction
\u6307\u7740	zh\u01D0zhe	6		poke
\u633A\u597D	t\u01D0ng h\u01CEo	2		very good
\u63A5\u542C	ji\u0113 t\u012Bng	7		answer the phone
\u641C\u6551	s\u014Du ji\xF9	7		search and rescue
\u641E\u7B11	g\u01CEo xi\xE0o	7		get people to laugh|funny|hilarious
\u644A\u513F	t\u0101n r	6		vendor's stand
\u64CD\u63A7	c\u0101o k\xF2ng	7		control|manipulate
\u653E\u6691\u5047	f\xE0ng sh\u01D4 ji\xE0	4		be on summer vacation
\u65F6\u597D\u65F6\u574F	sh\xED h\u01CEo sh\xED hu\xE0i	7		sometimes good, sometimes bad
\u6709\u4E00\u4E9B	y\u01D2u y\u012B xi\u0113	1		somewhat|rather|some
\u6709\u4E00\u70B9\u513F	y\u01D2u y\u012B di\u01CEn r	2		bit|little
\u6709\u52B2\u513F	y\u01D2uj\xECnr5	4		strength
\u6709\u6CA1\u6709	y\u01D2u m\xE9i y\u01D2u	6		do have|is there a|did|have
\u6709\u7A7A\u513F	y\u01D2uk\xF2ngr5	2		available
\u6740\u6BD2	sh\u0101 d\xFA	5		disinfect|destroy a computer virus
\u6781\u5C11\u6570	j\xED sh\u01CEo sh\xF9	7		extremely few|small minority
\u6B63\u80FD\u91CF	zh\xE8ng n\xE9ng li\xE0ng	7		positive energy|positivity
\u6C90\u6D74\u9732	m\xF9 y\xF9 l\xF9	7		shower gel
\u6CA1\u60F3\u5230	m\xE9i xi\u01CEng d\xE0o	4		didn't expect
\u70B9\u51FB\u7387	di\u01CEn j\u012B l\u01DC	7		click-through rate
\u7537\u5B69\u513F	n\xE1n h\xE1i r	1		boy
\u7740\u773C\u4E8E	zhu\xF3y\u01CEn y\xFA	7		focus on
\u77ED\u4FE1	du\u01CEn x\xECn	2		text message|sms
\u79BB\u8C31\u513F	l\xED p\u01D4r5	7		scientific
\u79C1\u5BB6\u8F66	s\u012B ji\u0101 ch\u0113	7		private car
\u7B11\u8BDD\u513F	xi\xE0ohuar5	2		joke
\u7CFB\u9886\u5E26	x\xEC l\u01D0ng d\xE0i	5		wear a tie
\u7EA2\u9152	h\xF3ng ji\u01D4	3		red wine
\u7EBD\u6263\u513F	ni\u01D4 k\xF2u er	6		button
\u804B\u4EBA	l\xF3ng r\xE9n	7		deaf person|hearing-impaired person
\u8336\u9986\u513F	ch\xE1 gu\u01CEn r	7		teashop
\u85AF\u7247	sh\u01D4 pi\xE0n	6		fried potato chips
\u8868\u9762\u4E0A	bi\u01CEo mi\xE0n shang	6		outwardly|superficially
\u89C1\u8FC7	ji\xE0ngu\xF2	2		seen
\u8BA8\u4EBA\u559C\u6B22	t\u01CEo r\xE9n x\u01D0 huan	7		attract people's affection|charming|delightful
\u8BF4\u771F\u7684	shu\u014D zh\u0113n de	7		tell the truth|honestly|in fact
\u8BF4\u8001\u5B9E\u8BDD	shu\u014D l\u01CEo shi hu\xE0	7		be honest|tell the truth|be frank
\u8BF4\u8D77\u6765	shu\u014D q\u01D0l\xE1i	7		say
\u8C01\u77E5\u9053	sh\xE9i zh\u012B d\xE0o	7		god knows|who would have imagined
\u8D2A\u73A9\u513F	t\u0101n w\xE1nr5	7		greedy
\u8F6F\u5B9E\u529B	ru\u01CEn sh\xED l\xEC	7		soft power
\u8FFD\u5C3E	zhu\u012B w\u011Bi	7		tailgate
\u90A3\u65F6\u5019	n\xE0 sh\xED hou	2		at that time
\u94F6\u884C\u5361	y\xEDn h\xE1ng k\u01CE	2		bank card|atm card
\u9632\u6C5B	f\xE1ng x\xF9n	7		flood control|anti-flood
\u96BE\u4EE5\u60F3\u8C61	n\xE1ny\u01D0xi\u01CEngxi\xE0ng	7		unimaginable
\u96BE\u5F97\u4E00\u89C1	n\xE1n d\xE9 y\u012B ji\xE0n	7		rarely seen
\u9762\u6761\u513F	mi\xE0n ti\xE1o r	1		noodles
\u9886\u519B	l\u01D0ng j\u016Bn	7		lead troups|lead|leading
\u58A8\u6C34\u513F	m\xF2 shu\u01D0 r	6		ink`;var zn={am:"be",is:"be",are:"be",was:"be",were:"be",been:"be",being:"be",has:"have",had:"have",having:"have",does:"do",did:"do",done:"do",doing:"do",goes:"go",went:"go",gone:"go",says:"say",said:"say",got:"get",gotten:"get",made:"make",knew:"know",known:"know",thought:"think",took:"take",taken:"take",saw:"see",seen:"see",came:"come",gave:"give",given:"give",found:"find",told:"tell",became:"become",left:"leave",felt:"feel",brought:"bring",began:"begin",begun:"begin",kept:"keep",held:"hold",wrote:"write",written:"write",stood:"stand",heard:"hear",meant:"mean",met:"meet",ran:"run",paid:"pay",sat:"sit",spoke:"speak",spoken:"speak",led:"lead",grew:"grow",grown:"grow",lost:"lose",fell:"fall",fallen:"fall",sent:"send",built:"build",understood:"understand",drew:"draw",drawn:"draw",broke:"break",broken:"break",spent:"spend",rose:"rise",risen:"rise",drove:"drive",driven:"drive",bought:"buy",wore:"wear",worn:"wear",chose:"choose",chosen:"choose",ate:"eat",eaten:"eat",taught:"teach",caught:"catch",sold:"sell",sang:"sing",sung:"sing",drank:"drink",drunk:"drink",swam:"swim",swum:"swim",flew:"fly",flown:"fly",slept:"sleep",won:"win",threw:"throw",thrown:"throw",children:"child",people:"person",men:"man",women:"woman",feet:"foot",teeth:"tooth",mice:"mouse",geese:"goose",lives:"life",knives:"knife",wives:"wife",leaves:"leaf",halves:"half",wolves:"wolf",shelves:"shelf",selves:"self",better:"good",best:"good",worse:"bad",worst:"bad",more:"many",most:"many",less:"little",least:"little"},jn=new Set(["this","his","its","us","yes","gas","bus","class","glass","grass","pass","press","cross","dress","less","miss","boss","loss","news","series","species","always","perhaps","was","as","has","is"]),qn="aeiou";function it(i){let t=i.toLowerCase(),n=[t],e=o=>{o.length>=2&&!n.includes(o)&&n.push(o)},a=zn[t];if(a&&e(a),t.endsWith("ies")&&t.length>4&&e(`${t.slice(0,-3)}y`),t.endsWith("es")&&t.length>3&&(e(t.slice(0,-2)),e(t.slice(0,-1))),t.endsWith("s")&&!t.endsWith("ss")&&!jn.has(t)&&t.length>2&&e(t.slice(0,-1)),t.endsWith("ied")&&t.length>4&&e(`${t.slice(0,-3)}y`),t.endsWith("ed")&&t.length>3&&(e(t.slice(0,-2)),e(t.slice(0,-1)),e(G(t.slice(0,-2)))),t.endsWith("ing")&&t.length>4){let o=t.slice(0,-3);e(o),e(`${o}e`),e(G(o))}return t.endsWith("est")&&t.length>4&&(e(t.slice(0,-3)),e(`${t.slice(0,-3)}e`),e(G(t.slice(0,-3))),t.endsWith("iest")&&e(`${t.slice(0,-4)}y`)),t.endsWith("er")&&t.length>4&&(e(t.slice(0,-2)),e(t.slice(0,-1)),e(G(t.slice(0,-2))),t.endsWith("ier")&&e(`${t.slice(0,-3)}y`)),t.endsWith("ly")&&t.length>4&&(e(t.slice(0,-2)),t.endsWith("ily")&&e(`${t.slice(0,-3)}y`)),n}function G(i){let t=i.length;if(t<3)return i;let n=i[t-1];return n===i[t-2]&&!qn.includes(n)&&n!=="l"&&n!=="s"?i.slice(0,-1):i}var B=[],jt=[],qt=[],ot=[],_t=[],at=new Map;for(let i of zt.split(`
`)){let t=i.split("	"),n=B.length;B.push(t[0]),jt.push(t[1]??""),qt.push(Number(t[2])||0),ot.push(t[3]??"");let e=(t[4]??"").split("|").filter(Boolean);_t.push(e);for(let a=0;a<e.length;a++){let o=at.get(e[a]);o===void 0?at.set(e[a],[{id:n,at:a}]):o.push({id:n,at:a})}}var S=B.length;function D(i){if(i<0||i>=S)throw new RangeError(`no word with id ${i} (have ${S})`);return{id:i,simplified:B[i],pinyin:jt[i],hsk:qt[i],pos:ot[i],meanings:_t[i]}}var _n={n:2,v:2,a:2,vn:2,an:2,nz:2,ns:2,nr:2,nt:2,t:2,s:2,m:2,q:2,mq:2,qt:2,qv:2,d:1,ad:1,b:1,r:1,f:1,z:1,l:1,u:0,y:0,e:0,o:0,c:0,cc:0,p:0,k:0,h:0,g:0,Mg:0,Rg:0,tg:0};function Y(i){return _n[ot[i]]??1}function St(i){let t=j(i),n=t.split(" "),e=new Map,a=o=>{for(let s of at.get(o)??[]){let r=e.get(s.id);(r===void 0||s.at<r)&&e.set(s.id,s.at)}};if(a(t),n.length===1)for(let o of it(t))a(o);else{let o=n[n.length-1];for(let s of it(o))a([...n.slice(0,-1),s].join(" "))}return[...e.entries()].sort((o,s)=>o[1]-s[1]||o[0]-s[0]).slice(0,4).map(([o])=>o)}var Sn=new Set(["a","an","the","of","to","it","its","s","by","in","on","at","for","with","from","as","into","about","and","or","but","so","than","that","this","there","then"]);function Mt(i){return!Sn.has(j(i))}function Et(i,t){return t===1?!0:j(i).split(" ").length>=2}function j(i){return i.toLowerCase().replace(/[^a-z0-9\s'-]/g," ").replace(/\s+/g," ").trim().replace(/^to\s+/,"").replace(/^(a|an|the)\s+/,"")}var Mn=Math.log(400),X=2.2,En=.25,An=3,Rn=.004,Dn=.92,In=.25,Ln=.7,Tn=.5,Nn=i=>1/(1+Math.exp(-i));function M(i){return Math.log(i+1)}function rt(i){return Math.max(0,Math.round(Math.exp(i)-1))}var q=class i{constructor(t=Mn,n=X){this.mu=t;this.sigma=n}mu;sigma;exploreEnabled=!0;frozenSigma=void 0;exploreCap=Tn;pCorrect(t){let n=Math.sqrt(1+.81*this.sigma*this.sigma*Math.PI/8);return Nn(.9*(this.mu-t)/n)}information(t){let n=this.pCorrect(t);return .9*.9*n*(1-n)}observe(t,n){let e=this.pCorrect(t),a=n?1:0,s=1/(1/(this.sigma*this.sigma)+.9*.9*e*(1-e));this.mu+=s*.9*(a-e),Math.abs(a-e)>Dn&&(s+=In),this.sigma=this.frozenSigma??At(Math.sqrt(s))}drift(t){if(t<=0||this.frozenSigma!==void 0)return;let n=this.sigma*this.sigma+Rn*t;this.sigma=At(Math.sqrt(n))}explorationWeight(){return this.exploreEnabled?this.exploreCap*(this.sigma/(this.sigma+Ln)):0}level(){return rt(this.mu)}levelRange(){return[rt(this.mu-this.sigma),rt(this.mu+this.sigma)]}clone(){let t=new i(this.mu,this.sigma);return t.exploreEnabled=this.exploreEnabled,t.frozenSigma=this.frozenSigma,t.exploreCap=this.exploreCap,t}};function At(i){return Number.isFinite(i)?Math.min(An,Math.max(En,i)):X}function w(i=new Date){return Math.floor(i.getTime()/864e5)}function K(i){return new Date(i*864e5)}var Rt=1162038322,st=4,I=class i{n;shown;asked;right;stability;difficulty;lastDay;ability;density;newBudget;f;constructor(t,n){this.n=t,this.shown=new Uint16Array(t),this.asked=new Uint16Array(t),this.right=new Uint16Array(t),this.stability=new Float32Array(t),this.difficulty=new Float32Array(t),this.lastDay=new Uint32Array(t),this.ability=n,this.density=.15,this.newBudget=1,this.f=xt()}static fresh(t=S){return new i(t,new q)}static fromHskLevel(t,n=S){let e=[50,300,700,1200,1900,2900,4300,7e3],a=Math.max(0,Math.min(7,Math.round(t)));return new i(n,new q(M(e[a]),1.4))}static atLevel(t,n=X,e=S){return new i(e,new q(M(t),n))}hasHistory(t){return this.asked[t]>0}probKnows(t,n=w()){if(t<0||t>=this.n)return this.prior(t);if(this.asked[t]===0)return this.prior(t);let e=this.f.get_retrievability(this.toCard(t,n),K(n),!1);return Number.isFinite(e)?e:this.prior(t)}prior(t){return this.ability.pCorrect(M(t))}information(t){return this.ability.information(M(t))}isDue(t,n=w(),e=.9){return this.asked[t]>0&&this.probKnows(t,n)<e}needsRedo(t){return this.redo.includes(t)}static REDO_AFTER_SCREENS=3;redo=[];screenDone(t){this.redo=this.redo.filter(n=>!t.includes(n)),this.redo.length>12&&(this.redo=this.redo.slice(-12))}redoQueue(){return this.redo}answer(t,n,e=w()){let a=this.toCard(t,e),o=this.f.next(a,K(e),n?u.Good:u.Again).card,s=this.asked[t]===0;this.asked[t]++,n&&this.right[t]++,this.stability[t]=o.stability,this.difficulty[t]=o.difficulty,this.lastDay[t]=e,n?this.redo=this.redo.filter(r=>r!==t):this.redo.includes(t)||this.redo.push(t),s&&this.ability.observe(M(t),n)}glanced(t,n=w()){this.shown[t]<65535&&this.shown[t]++}catchUp(t=w()){let n=this.lastActiveDay;n>0&&t>n&&this.ability.drift(t-n),this.lastActiveDay=t}lastActiveDay=0;markShown(t){this.shown[t]<65535&&this.shown[t]++}toCard(t,n){if(this.asked[t]===0)return R(K(n));let e=K(this.lastDay[t]);return{due:e,stability:this.stability[t],difficulty:this.difficulty[t],elapsed_days:0,scheduled_days:0,reps:this.asked[t],lapses:this.asked[t]-this.right[t],state:m.Review,last_review:e}}toBytes(){let t=8+st*4,n=[this.stability,this.difficulty,this.lastDay],e=[this.shown,this.asked,this.right],a=t+n.reduce((c,h)=>c+h.byteLength,0)+e.reduce((c,h)=>c+h.byteLength,0)+4+this.redo.length*4,o=new Uint8Array(a),s=new DataView(o.buffer);s.setUint32(0,Rt,!0),s.setUint32(4,this.n,!0);let r=[this.ability.mu,this.ability.sigma,this.density,this.newBudget];for(let[c,h]of r.entries())s.setFloat32(8+c*4,h,!0);let l=t;for(let c of[...n,...e])o.set(new Uint8Array(c.buffer,c.byteOffset,c.byteLength),l),l+=c.byteLength;s.setUint32(l,this.redo.length,!0),l+=4;for(let c of this.redo)s.setUint32(l,c,!0),l+=4;return o}static fromBytes(t){let n=t.slice(),e=n.buffer,a=new DataView(e);if(a.getUint32(0,!0)!==Rt)throw new Error("not an Eclipse store");let o=a.getUint32(4,!0),s=new i(o,new q(a.getFloat32(8,!0),a.getFloat32(12,!0)));s.density=a.getFloat32(16,!0),s.newBudget=a.getFloat32(20,!0);let r=8+st*4;if(s.stability.set(new Float32Array(e,r,o)),r+=o*4,s.difficulty.set(new Float32Array(e,r,o)),r+=o*4,s.lastDay.set(new Uint32Array(e,r,o)),r+=o*4,s.shown.set(new Uint16Array(e,r,o)),r+=o*2,s.asked.set(new Uint16Array(e,r,o)),r+=o*2,s.right.set(new Uint16Array(e,r,o)),r+=o*2,r+4<=n.byteLength){let l=a.getUint32(r,!0);r+=4;for(let c=0;c<l&&r+4<=n.byteLength;c++,r+=4)s.redo.push(a.getUint32(r,!0))}return s}byteSize(){return 8+st*4+this.n*18+4+this.redo.length*4}};var Dt={gentle:{maxDensity:.25,maxNew:1,label:"A few words a screen. Barely interrupts reading."},normal:{maxDensity:.6,maxNew:2,label:"The tuned default. Never more than two unfamiliar words at once."},intense:{maxDensity:.8,maxNew:3,label:"Much more Mandarin, and up to three unfamiliar words. Tiring."}};function lt(i){let{maxDensity:t,maxNew:n}=Dt[i]??Dt.normal;return{maxDensity:t,maxNew:n}}var It=i=>Math.min(.85,i.maxDensity??.6),Lt=i=>Math.min(3,i.maxNew??2),On={climb:.7,fall:1.5,leaningTooFar:.15,maxStep:.08,target:.85},L=(i,t,n)=>Math.min(n,Math.max(t,i));function Tt(i,t,n=On){if(t.answered===0)return{...i};let a=t.correct/t.answered-n.target,o=Math.min(1,t.answered/10),r=(a<-n.leaningTooFar?n.fall:n.climb)*o,l=L(r*a,-n.maxStep,n.maxStep),c=L(i.density+l,.05,It(i)),h=L(r*a/4,-1,.34),v=L(i.newBudget+h,0,Lt(i));return{density:c,newBudget:v,maxDensity:i.maxDensity,maxNew:i.maxNew}}function ct(i){return Math.min(Math.floor(i.newBudget),Lt(i))}function ut(i){let t=It(i),n=(i.density-.05)/Math.max(.01,t-.05);return .95-.3*Math.min(1,Math.max(0,n))}function Nt(i,t){return t===0?0:L(Math.round(t*i.density),0,t)}var Cn=.5,Wn=3,Fn=/[A-Za-z][A-Za-z'’-]*/g;function Pn(i){let t=[];for(let n of i.matchAll(Fn))t.push({text:n[0],start:n.index,end:n.index+n[0].length});return t}function Ot(i,t,n=w(),e=.75){let a=Pn(i),o=new Set,s=[];for(let r=Wn;r>=1;r--)for(let l=0;l+r<=a.length;l++){let c=!1;for(let y=l;y<l+r;y++)o.has(y)&&(c=!0);if(c)continue;let h=a[l],v=a[l+r-1],d=i.slice(h.start,v.end);if(!Et(d,r)||r===1&&!Mt(d))continue;let g=St(d);if(g.length===0)continue;let f=g.find(y=>Y(y)===2)??g.find(y=>Y(y)===1);if(f===void 0)continue;let _=D(f),b=t.probKnows(f,n);s.push({start:h.start,end:v.end,english:d,wordId:f,mandarin:_.simplified,pinyin:_.pinyin,accepted:_.meanings,known:b,risky:b<Cn&&!t.needsRedo(f),score:$n(f,b,r,t,e)});for(let y=l;y<l+r;y++)o.add(y)}return s.sort((r,l)=>r.start-l.start)}function $n(i,t,n,e,a){let o=Math.max(0,1-Math.abs(t-a)/Math.max(a,1-a)),s=e.information(i)/.2025,r=e.ability.explorationWeight(),l=r*Math.min(1,s)+(1-r)*o;if(e.hasHistory(i)){l+=.5;let c=1-e.right[i]/Math.max(1,e.asked[i]);l+=c*.6}return e.needsRedo(i)&&(l+=3),l+=Y(i)===2?.25:0,l+=(n-1)*.15,l}function Un(i,t,n,e=w()){let a=Ot(i,t,e,ut(n));if(a.length===0)return{text:i,swaps:[]};let o=Nt(n,a.length),s=ct(n),r=a.filter(g=>!g.risky).sort((g,f)=>f.score-g.score),l=a.filter(g=>g.risky).sort((g,f)=>g.wordId-f.wordId),c=new Set,h=[],v=g=>c.has(g.wordId)?!1:(c.add(g.wordId),h.push(g),!0),d=0;for(let g of l){if(h.length>=o||d>=s)break;v(g)&&d++}for(let g of r){if(h.length>=o)break;v(g)}return h.sort((g,f)=>g.start-f.start),{text:i,swaps:h}}function Ct(i,t,n,e=w()){let a=ct(n),o=new Set,s=[];for(let r of i){let l=Un(r,t,{...n,newBudget:a},e);l.swaps=l.swaps.filter(c=>o.has(c.wordId)?!1:(o.add(c.wordId),!0)),a-=l.swaps.filter(c=>c.risky).length,a<0&&(a=0),s.push(l)}if(s.every(r=>r.swaps.length===0)){let r,l;for(let c of s)for(let h of Ot(c.text,t,e,ut(n)))h.risky||(!r||h.score>r.score)&&(r=h,l=c);r&&l&&(l.swaps=[r])}return s}function Hn(i,t,n){if(Math.abs(i.length-t.length)>n)return!1;if(i===t)return!0;let e=Array.from({length:t.length+1},(a,o)=>o);for(let a=1;a<=i.length;a++){let o=[a],s=a;for(let r=1;r<=t.length;r++){let l=i[a-1]===t[r-1]?0:1,c=Math.min(e[r]+1,o[r-1]+1,e[r-1]+l);o.push(c),c<s&&(s=c)}if(s>n)return!1;e=o}return e[t.length]<=n}function Wt(i,t){let n=j(i);if(!n)return{verdict:"empty",typo:!1,worthAsking:!1};let e=t.map(j).filter(Boolean);for(let a of e)if(n===a)return{verdict:"right",matched:a,typo:!1,worthAsking:!1};for(let a of e){let o=a.split(" ");if(o.length>1&&o.includes(n)&&n.length>=3)return{verdict:"right",matched:a,typo:!1,worthAsking:!1}}for(let a of e)if(a.length>=4&&Hn(n,a,1))return{verdict:"right",matched:a,typo:!0,worthAsking:!1};return{verdict:"wrong",typo:!1,worthAsking:/^[a-z][a-z\s'-]{2,}$/.test(n)&&n.split(" ").length<=3&&n.split(" ").every(a=>/[aeiouy]/.test(a))}}var Ft=`You mix Mandarin words into English sentences for someone learning Mandarin.

For each sentence you get a list of replacements. Each gives an English word or
phrase and the exact Mandarin word to use in its place.

Rules:
1. Use every replacement, UNLESS the Mandarin word given does not fit what the
   sentence actually means. In that case leave that one out. A wrong word is
   much worse than a missing one.
2. Use the exact Mandarin word given. Never substitute a different word.
3. Leave every other English word alone, in its original order. Never translate
   the whole sentence. Most of it must stay English.
4. You MAY add small Mandarin grammar words the sentence needs to read
   correctly, such as \u7684, \u4E86, \u4E00\u4E2A, \u662F. These are glue, not replacements, and you
   do not report them. Without them the result reads like broken Chinese:
     wrong:  Bob \u6709 \u4E00\u4E2A \u84DD\u8272 \u82F9\u679C
     right:  Bob \u6709\u4E00\u4E2A\u84DD\u8272\u7684\u82F9\u679C
5. Keep the original punctuation and capitalisation of the English parts.
6. Always put a space between an English word and a Mandarin word or phrase
   next to it, on both sides. Never let them touch directly:
     wrong:  particular\u6709 long / \u662Fthe answer
     right:  particular \u6709 long / \u662F the answer

Output format, nothing else. Two kinds of line, each starting with the
sentence's index in brackets:
[<i>] <the mixed sentence>
[<i>] A| <the Mandarin word you used> | <the English it replaced>

Exactly one sentence line per sentence you were given. One A| line under it
per replacement you actually used \u2014 omit the line entirely for any you left
out under rule 1. No other text: no commentary, no markdown, no code fences,
no blank lines.`;function Pt(i){return i.map((t,n)=>({i:n,text:t.text,replace:t.swaps.map(e=>({en:e.english,zh:e.mandarin}))})).filter(t=>t.replace.length>0)}function $t(i){return i.map(t=>`[${t.i}] ${t.text}
`+t.replace.map(n=>`    ${n.en} -> ${n.zh}`).join(`
`)).join(`

`)}var Gn=/^\[(\d+)\]\s*A\|\s*([^|]+?)\s*\|\s*(.+)$/,Bn=/^\[(\d+)\]\s*(.*)$/;function Ut(i){let t=new Map,n=e=>{let a=t.get(e);return a||(a={i:e,text:"",used:[]},t.set(e,a)),a};for(let e of i.split(/\r?\n/)){let a=e.match(Gn);if(a){n(Number(a[1])).used.push({zh:a[2].trim(),en:a[3].trim()});continue}let o=e.match(Bn);o&&(n(Number(o[1])).text=o[2].trim())}return[...t.values()]}var Yn=/[A-Za-z][A-Za-z'’-]*/g,Ht=i=>[...i.matchAll(Yn)].map(t=>t[0].toLowerCase());function Gt(i,t){let n=[],e=new Map(i.replace.map(d=>[d.zh,d.en]));t.i!==i.i&&n.push(`index ${t.i} is not ${i.i}`),t.text?.trim()||n.push("no sentence returned");let a=t.text??"",o=[];for(let d of t.used??[]){if(!e.has(d.zh)){n.push(`used ${d.zh}, which was not offered`);continue}if(!a.includes(d.zh)){n.push(`claims to have used ${d.zh} but it is not in the sentence`);continue}o.push(d)}let s=o.map(d=>e.get(d.zh)),r=i.text;for(let d of s)r=r.replace(d," ");let l=Ht(r),c=Ht(a),h=0,v=[];for(let d of l){let g=c.indexOf(d,h);g===-1?v.push(d):h=g+1}return v.length&&n.push(`English lost or reordered: ${v.slice(0,5).join(", ")}`),Xn.test(a)&&n.push("English and Mandarin are jammed together with no space"),a.length>i.text.length*Kn&&n.push("reply is far longer than the sentence sent, likely a repetition loop"),{ok:n.length===0&&o.length>0,problems:n,swaps:o}}var Xn=/[A-Za-z][一-鿿]|[一-鿿][A-Za-z]/,Kn=3;var Zn="https://ai.hackclub.com/proxy/v1",ht="google/gemini-3.5-flash-lite";async function Bt(i,t,n=ht){let e=Date.now(),a={replies:new Map,ms:0,cost:0};if(t.length===0)return a;let o;try{o=await fetch(`${Zn}/chat/completions`,{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"application/json"},body:JSON.stringify({model:n,messages:[{role:"system",content:Ft},{role:"user",content:$t(t)}],temperature:.2,frequency_penalty:.4,max_tokens:Math.min(4e3,t.length*150+300),provider:{sort:"latency"}})})}catch(h){return a.ms=Date.now()-e,a.error=h instanceof Error?h.message:String(h),a}a.ms=Date.now()-e;let s=await o.text();if(!o.ok)return a.error=o.status===429?"Rate limited \u2014 750 requests per 30 minutes. Slow down or wait.":`HTTP ${o.status}. ${s.slice(0,120)}`,a;let r;try{r=JSON.parse(s)}catch{return a.error="the provider did not return JSON",a}a.cost=r.usage?.cost??0;let l=r.choices?.[0]?.message?.content;if(!l)return a.error="the model returned nothing",a;let c=new Map(Ut(l).map(h=>[h.i,h]));for(let h of t){let v=c.get(h.i);if(!v)continue;let d=Gt(h,v);d.ok&&a.replies.set(h.i,{text:v.text,swaps:d.swaps})}return a}var Vn="eclipse";var T="state";var N="cache",Yt;function Jn(){return Yt??=new Promise((i,t)=>{let n=indexedDB.open(Vn,1);n.onupgradeneeded=()=>{let e=n.result;e.objectStoreNames.contains(T)||e.createObjectStore(T),e.objectStoreNames.contains("log")||e.createObjectStore("log",{keyPath:"id",autoIncrement:!0}),e.objectStoreNames.contains(N)||e.createObjectStore(N)},n.onsuccess=()=>i(n.result),n.onerror=()=>t(n.error)}),Yt}function E(i,t,n){return Jn().then(e=>new Promise((a,o)=>{let s=e.transaction(i,t),r=n(s.objectStore(i));r.onsuccess=()=>a(r.result),r.onerror=()=>o(r.error)}))}var Xt=i=>E(T,"readwrite",t=>t.put(i,"learner")),Kt=()=>E(T,"readonly",i=>i.get("learner")),Zt=i=>E("log","readwrite",t=>t.add(i));var Vt=i=>E(N,"readonly",t=>t.get(i)),Jt=(i,t)=>E(N,"readwrite",n=>n.put(t,i)),Qt=async()=>{for(let i of[T,"log",N])await E(i,"readwrite",t=>t.clear())};function dt(i,t){let n=2166136261,e=`${i}|${t.join(",")}`;for(let a=0;a<e.length;a++)n^=e.charCodeAt(a),n=Math.imul(n,16777619);return(n>>>0).toString(36)}var tn={apiKey:"",model:ht,enabledHosts:[],hskLevel:1,intensity:"normal"};async function F(){return{...tn,...await chrome.storage.local.get(tn)}}var te=["bank","chase.","paypal","wellsfargo","hsbc","barclays","revolut","monzo","mail.google","outlook.","proton.me","icloud.com","health","nhs.uk","mychart","accounts.google","login.","signin.","auth.","localhost","127.0.0.1","chrome.google.com","chromewebstore.google.com"];function en(i){let t=i.toLowerCase();return te.some(n=>t.includes(n))}var x,gt,an,O=0,C=0,nn=w();async function W(){if(x)return x;let i=await Kt();if(i)try{x=I.fromBytes(new Uint8Array(i))}catch{x=void 0}if(!x){let{hskLevel:t}=await F();x=I.fromHskLevel(t)}return x.catchUp(),x}function pt(){gt||(gt=setTimeout(()=>{gt=void 0,x&&Xt(x.toBytes())},3e3))}function ne(){let i=w();i!==nn&&(nn=i,O=0,C=0)}var mt=new Map;async function ee(i,t){let n=await F();if(en(t))return{type:"plan:off",reason:"Eclipse never runs on this kind of site."};if(!n.enabledHosts.includes(t))return{type:"plan:off",reason:"not switched on here"};if(!n.apiKey)return{type:"plan:off",reason:"no API key \u2014 open the options page"};let e=await W(),a={density:e.density,newBudget:e.newBudget,...lt(n.intensity)},o=Ct(i,e,a),s=[],r=[],l=[];for(let c=0;c<o.length;c++){let h=o[c];if(h.swaps.length===0)continue;let v=dt(h.text,h.swaps.map(g=>g.wordId)),d=await Vt(v);if(d){s.push({...d,i:c});continue}r.push(h),l.push(c)}if(r.length>0){let c=Pt(r),h=await Bt(n.apiKey,c,n.model);an=h.error;for(let[v,d]of h.replies){let g=r[v];if(!g)continue;let f=d.swaps.map(b=>{let y=g.swaps.find(on=>on.mandarin===b.zh);if(!y)return;let vt=D(y.wordId);return{zh:b.zh,en:b.en,wordId:y.wordId,pinyin:vt.pinyin,accepted:[...new Set([...vt.meanings,b.en.toLowerCase()])]}}).filter(b=>b!==void 0);if(f.length===0)continue;let _={i:l[v],text:d.text,swaps:f};s.push(_),Jt(dt(g.text,g.swaps.map(b=>b.wordId)),_)}}for(let c of s)for(let h of c.swaps)(await W()).markShown(h.wordId),mt.set(h.wordId,{accepted:h.accepted,shownAs:h.zh,host:t});return pt(),{type:"plan:ok",sentences:s}}async function ie(i,t){ne();let n=await W(),e=mt.get(i),a=D(i),o=e?.accepted??a.meanings,s=Wt(t,o),r=s.verdict==="right";if(s.verdict!=="empty"){n.answer(i,r),O++,r&&C++,Zt({ts:Date.now(),wordId:i,shownAs:e?.shownAs??a.simplified,typed:t,correct:r,host:e?.host??""});let{intensity:l}=await F(),c=Tt({density:n.density,newBudget:n.newBudget,...lt(l)},{answered:O,correct:C});n.density=c.density,n.newBudget=c.newBudget,pt()}return{type:"answer:ok",correct:r,answer:`${a.simplified} (${a.pinyin}) \u2014 ${a.meanings.slice(0,3).join(", ")}`,typo:s.typo}}async function ae(i){let t=await F(),n=await W(),e=0;for(let a=0;a<n.n;a++)n.asked[a]>0&&e++;return{enabledHere:i?t.enabledHosts.includes(i)&&!en(i):!1,hasKey:t.apiKey.length>0,answeredToday:O,correctToday:C,level:n.ability.level(),levelRange:n.ability.levelRange(),wordsMet:e,density:n.density,newBudget:n.newBudget,intensity:t.intensity,lastError:an}}chrome.runtime.onMessage.addListener((i,t,n)=>((async()=>{switch(i.type){case"plan":return await ee(i.sentences,i.host);case"answer":return await ie(i.wordId,i.typed);case"glanced":{let e=await W();for(let a of i.wordIds)e.glanced(a);return pt(),{type:"ok"}}case"status":return{type:"status:ok",status:await ae(i.host)};case"forget":return await Qt(),x=void 0,mt.clear(),O=0,C=0,{type:"ok"};case"setEnabled":{let e=await F(),a=new Set(e.enabledHosts);return i.on?a.add(i.host):a.delete(i.host),await chrome.storage.local.set({enabledHosts:[...a]}),{type:"ok"}}default:return{type:"error",message:"unknown message"}}})().then(n).catch(e=>n({type:"error",message:e instanceof Error?e.message:String(e)})),!0));
