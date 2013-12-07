//TouchLayer contributed by Carlos Ouro @ Badoo
//un-authoritive layer between touches and actions on the DOM
//(un-authoritive: listeners do not require useCapture)
//handles overlooking JS and native scrolling, panning,
//no delay on click, edit mode focus, preventing defaults, resizing content,
//enter/exit edit mode (keyboard on screen), prevent clicks on momentum, etc
//It can be used independently in other apps but it is required by jqUi
//Object Events
//Enter Edit Mode:
//pre-enter-edit - when a possible enter-edit is actioned - happens before actual click or focus (android can still reposition elements and event is actioned)
//cancel-enter-edit - when a pre-enter-edit does not result in a enter-edit
//enter-edit - on a enter edit mode focus
//enter-edit-reshape - focus resized/scrolled event
//in-edit-reshape - resized/scrolled event when a different element is focused
//Exit Edit Mode
//exit-edit - on blur
//exit-edit-reshape - blur resized/scrolled event
//Other
//orientationchange-reshape - resize event due to an orientationchange action
//reshape - window.resize/window.scroll event (ignores onfocus "shaking") - general reshape notice
!function($){//singleton
$.touchLayer=function(el){//	if(af.os.desktop||!af.os.webkit) return;
return $.touchLayer=new touchLayer(el),$.touchLayer};//configuration stuff
var inputElements=["input","select","textarea"],autoBlurInputTypes=["button","radio","checkbox","range","date"],requiresJSFocus=$.os.ios,verySensitiveTouch=$.os.blackberry,inputElementRequiresNativeTap=$.os.blackberry||$.os.android&&!$.os.chrome;$.os.blackberry||$.os.android&&!$.os.chrome,$.os.ios;//devices scrolling on focus instead of resizing
var requirePanning=$.os.ios,addressBarError=.97,maxHideTries=2,skipTouchEnd=!1,cancelClick=!1,touchLayer=function(el){this.clearTouchVars(),el.addEventListener("touchstart",this,!1),el.addEventListener("touchmove",this,!1),el.addEventListener("touchend",this,!1),el.addEventListener("click",this,!1),el.addEventListener("focusin",this,!1),document.addEventListener("scroll",this,!1),window.addEventListener("resize",this,!1),window.addEventListener("orientationchange",this,!1),this.layer=el,//proxies
this.scrollEndedProxy_=$.proxy(this.scrollEnded,this),this.exitEditProxy_=$.proxy(this.exitExit,this,[]),this.launchFixUIProxy_=$.proxy(this.launchFixUI,this);var that=this;this.scrollTimeoutExpireProxy_=function(){that.scrollTimeout_=null,that.scrollTimeoutEl_.addEventListener("scroll",that.scrollEndedProxy_,!1)},this.retestAndFixUIProxy_=function(){af.os.android&&(that.layer.style.height="100%"),$.asap(that.testAndFixUI,that,arguments)},//iPhone double clicks workaround
document.addEventListener("click",function(e){return cancelClick?(e.preventDefault(),e.stopPropagation(),!1):(void 0!==e.clientX&&null!=that.lastTouchStartX&&2>Math.abs(that.lastTouchStartX-e.clientX)&&2>Math.abs(that.lastTouchStartY-e.clientY)&&(e.preventDefault(),e.stopPropagation()),void 0)},!0),//js scrollers self binding
$.bind(this,"scrollstart",function(el){that.isScrolling=!0,that.scrollingEl_=el,$.feat.nativeTouchScroll||(that.scrollerIsScrolling=!0),that.fireEvent("UIEvents","scrollstart",el,!1,!1)}),$.bind(this,"scrollend",function(el){that.isScrolling=!1,$.feat.nativeTouchScroll||(that.scrollerIsScrolling=!1),that.fireEvent("UIEvents","scrollend",el,!1,!1)}),//fix layer positioning
this.launchFixUI(5)};touchLayer.prototype={dX:0,dY:0,cX:0,cY:0,touchStartX:null,touchStartY:null,//elements
layer:null,scrollingEl_:null,scrollTimeoutEl_:null,//handles / proxies
scrollTimeout_:null,reshapeTimeout_:null,scrollEndedProxy_:null,exitEditProxy_:null,launchFixUIProxy_:null,reHideAddressBarTimeout_:null,retestAndFixUIProxy_:null,//options
panElementId:"header",//public locks
blockClicks:!1,//private locks
allowDocumentScroll_:!1,ignoreNextResize_:!1,blockPossibleClick_:!1,//status vars
isScrolling:!1,isScrollingVertical_:!1,wasPanning_:!1,isPanning_:!1,isFocused_:!1,justBlurred_:!1,requiresNativeTap:!1,holdingReshapeType_:null,trackingClick:!1,scrollerIsScrolling:!1,handleEvent:function(e){switch(e.type){case"touchstart":this.onTouchStart(e);break;case"touchmove":this.onTouchMove(e);break;case"touchend":this.onTouchEnd(e);break;case"click":this.onClick(e);break;case"blur":this.onBlur(e);break;case"scroll":this.onScroll(e);break;case"orientationchange":this.onOrientationChange(e);break;case"resize":this.onResize(e);break;case"focusin":this.onFocusIn(e)}},launchFixUI:function(maxTries){//this.log("launchFixUI");
return maxTries||(maxTries=maxHideTries),null===this.reHideAddressBarTimeout_?this.testAndFixUI(0,maxTries):void 0},resetFixUI:function(){//this.log("resetFixUI");
this.reHideAddressBarTimeout_&&clearTimeout(this.reHideAddressBarTimeout_),this.reHideAddressBarTimeout_=null},testAndFixUI:function(retry,maxTries){//this.log("testAndFixUI");
//for ios or if the heights are incompatible (and not close)
var refH=this.getReferenceHeight(),curH=this.getCurrentHeight();return refH==curH||refH>curH*addressBarError&&curH>refH*addressBarError?(af.os.android&&this.resetFixUI(),!1):(//panic! page is out of place!
this.hideAddressBar(retry,maxTries),!0)},hideAddressBar:function(retry,maxTries){if(!af.ui||!af.ui.isIntel){if(retry>=maxTries)return this.resetFixUI(),void 0;//this.log("hiding address bar");
if(af.os.desktop||af.os.chrome)this.layer.style.height="100%";else if(af.os.android){//on some phones its immediate
window.scrollTo(1,1),this.layer.style.height=this.isFocused_||window.innerHeight>window.outerHeight?window.innerHeight+"px":window.outerHeight/window.devicePixelRatio+"px",//sometimes android devices are stubborn
that=this;//re-test in a bit (some androids (SII, Nexus S, etc) fail to resize on first try)
var nextTry=retry+1;this.reHideAddressBarTimeout_=setTimeout(this.retestAndFixUIProxy_,250*nextTry,[nextTry,maxTries])}else this.isFocused_||(document.documentElement.style.height="5000px",window.scrollTo(0,0),document.documentElement.style.height=window.innerHeight+"px",this.layer.style.height=window.innerHeight+"px")}},getReferenceHeight:function(){//the height the page should be at
//the height the page should be at
return af.os.android?Math.ceil(window.outerHeight/window.devicePixelRatio):window.innerHeight},getCurrentHeight:function(){//the height the page really is at
//the height the page really is at
return af.os.android?window.innerHeight:numOnly(document.documentElement.style.height)},onOrientationChange:function(){//this.log("orientationchange");
//if a resize already happened, fire the orientationchange
!this.holdingReshapeType_&&this.reshapeTimeout_?this.fireReshapeEvent("orientationchange"):this.previewReshapeEvent("orientationchange")},onResize:function(){//avoid infinite loop on iPhone
//avoid infinite loop on iPhone
return this.ignoreNextResize_?(//this.log('ignored resize');
this.ignoreNextResize_=!1,void 0):(//this.logInfo('resize');
this.launchFixUI()&&this.reshapeAction(),void 0)},onClick:function(e){//handle forms
var tag=e.target&&void 0!==e.target.tagName?e.target.tagName.toLowerCase():"";//this.log("click on "+tag);
if(-1===inputElements.indexOf(tag)||this.isFocused_&&e.target===this.focusedElement)$.os.blackberry10&&this.isFocused_&&this.focusedElement.blur();else{var type=e.target&&void 0!==e.target.type?e.target.type.toLowerCase():"",autoBlur=-1!==autoBlurInputTypes.indexOf(type);//focus
if(autoBlur)this.isFocused_=!1;else{//android bug workaround for UI
if(//remove previous blur event if this keeps focus
this.isFocused_&&this.focusedElement.removeEventListener("blur",this,!1),this.focusedElement=e.target,this.focusedElement.addEventListener("blur",this,!1),!this.isFocused_&&!this.justBlurred_)//fire / preview reshape event
if(//this.log("enter edit mode");
$.trigger(this,"enter-edit",[e.target]),$.os.ios){var that=this;setTimeout(function(){that.fireReshapeEvent("enter-edit")},300)}else this.previewReshapeEvent("enter-edit");this.isFocused_=!0}this.justBlurred_=!1,this.allowDocumentScroll_=!0,//fire focus action
requiresJSFocus&&e.target.focus()}},previewReshapeEvent:function(ev){//a reshape event of this type should fire within the next 750 ms, otherwise fire it yourself
that=this,this.reshapeTimeout_=setTimeout(function(){that.fireReshapeEvent(ev),that.reshapeTimeout_=null,that.holdingReshapeType_=null},750),this.holdingReshapeType_=ev},fireReshapeEvent:function(ev){//this.log(ev?ev+'-reshape':'unknown-reshape');
$.trigger(this,"reshape"),//trigger a general reshape notice
$.trigger(this,ev?ev+"-reshape":"unknown-reshape")},reshapeAction:function(){this.reshapeTimeout_?(//we have a specific reshape event waiting for a reshapeAction, fire it now
clearTimeout(this.reshapeTimeout_),this.fireReshapeEvent(this.holdingReshapeType_),this.holdingReshapeType_=null,this.reshapeTimeout_=null):this.previewReshapeEvent()},onFocusIn:function(e){this.isFocused_||this.onClick(e)},onBlur:function(e){af.os.android&&e.target==window||(//ignore window blurs
this.isFocused_=!1,//just in case...
this.focusedElement&&this.focusedElement.removeEventListener("blur",this,!1),this.focusedElement=null,//make sure this blur is not followed by another focus
this.justBlurred_=!0,$.asap(this.exitEditProxy_,this,[e.target]))},exitExit:function(el){if(this.justBlurred_=!1,!this.isFocused_)//fire / preview reshape event
if(//this.log("exit edit mode");
$.trigger(this,"exit-edit",[el]),//do not allow scroll anymore
this.allowDocumentScroll_=!1,$.os.ios){var that=this;setTimeout(function(){that.fireReshapeEvent("exit-edit")},300)}else this.previewReshapeEvent("exit-edit")},onScroll:function(e){//this.log("document scroll detected "+document.body.scrollTop);
this.allowDocumentScroll_||this.isPanning_||e.target!=document||(this.allowDocumentScroll_=!0,this.wasPanning_?(this.wasPanning_=!1,//give it a couple of seconds
setTimeout(this.launchFixUIProxy_,2e3,[maxHideTries]))://this.log("scroll forced page into place");
this.launchFixUI())},onTouchStart:function(e){if(//setup initial touch position
this.dX=e.touches[0].pageX,this.dY=e.touches[0].pageY,this.lastTimestamp=e.timeStamp,this.lastTouchStartX=this.lastTouchStartY=null,$.os.ios){if(skipTouchEnd===e.touches[0].identifier)return cancelClick=!0,e.preventDefault(),!1;skipTouchEnd=e.touches[0].identifier,cancelClick=!1}if(this.scrollerIsScrolling)return this.moved=!0,this.scrollerIsScrolling=!1,e.preventDefault(),!1;this.trackingClick=!0,//check dom if necessary
(requirePanning||$.feat.nativeTouchScroll)&&this.checkDOMTree(e.target,this.layer),//scrollend check
this.isScrolling&&(//remove prev timeout
null!==this.scrollTimeout_?(clearTimeout(this.scrollTimeout_),this.scrollTimeout_=null,//different element, trigger scrollend anyway
this.scrollTimeoutEl_!=this.scrollingEl_?this.scrollEnded(!1):this.blockPossibleClick_=!0):this.scrollTimeoutEl_&&(//trigger
this.scrollEnded(!0),this.blockPossibleClick_=!0));// We allow forcing native tap in android devices (required in special cases)
var forceNativeTap=af.os.android&&e&&e.target&&e.target.getAttribute&&"ignore"==e.target.getAttribute("data-touchlayer");//if on edit mode, allow all native touches
//(BB10 must still be prevented, always clicks even after move)
if(forceNativeTap||this.isFocused_&&!$.os.blackberry10)this.requiresNativeTap=!0,this.allowDocumentScroll_=!0;else if(inputElementRequiresNativeTap&&e.target&&void 0!==e.target.tagName){var tag=e.target.tagName.toLowerCase();-1!==inputElements.indexOf(tag)&&(//notify scrollers (android forms bug), except for selects
//if(tag != 'select') $.trigger(this, 'pre-enter-edit', [e.target]);
this.requiresNativeTap=!0)}else e.target&&void 0!==e.target.tagName&&"input"==e.target.tagName.toLowerCase()&&"range"==e.target.type&&(this.requiresNativeTap=!0);//prevent default if possible
this.isPanning_||this.requiresNativeTap?this.isScrollingVertical_&&this.demandVerticalScroll():(this.isScrolling&&!$.feat.nativeTouchScroll||!this.isScrolling)&&e.preventDefault()},demandVerticalScroll:function(){//if at top or bottom adjust scroll
var atTop=this.scrollingEl_.scrollTop<=0;if(atTop)//this.log("adjusting scrollTop to 1");
this.scrollingEl_.scrollTop=1;else{var scrollHeight=this.scrollingEl_.scrollTop+this.scrollingEl_.clientHeight,atBottom=scrollHeight>=this.scrollingEl_.scrollHeight;atBottom&&(//this.log("adjusting scrollTop to max-1");
this.scrollingEl_.scrollTop=this.scrollingEl_.scrollHeight-this.scrollingEl_.clientHeight-1)}},//set rules here to ignore scrolling check on these elements
//consider forcing user to use scroller object to assess these... might be causing bugs
ignoreScrolling:function(el){return void 0===el.scrollWidth||void 0===el.clientWidth?!0:void 0===el.scrollHeight||void 0===el.clientHeight?!0:!1},allowsVerticalScroll:function(el,styles){var overflowY=styles.overflowY;return"scroll"==overflowY?!0:"auto"==overflowY&&el.scrollHeight>el.clientHeight?!0:!1},allowsHorizontalScroll:function(el,styles){var overflowX=styles.overflowX;return"scroll"==overflowX?!0:"auto"==overflowX&&el.scrollWidth>el.clientWidth?!0:!1},//check if pan or native scroll is possible
checkDOMTree:function(el,parentTarget){//check panning
//temporarily disabled for android - click vs panning issues
if(requirePanning&&this.panElementId==el.id)return this.isPanning_=!0,void 0;//check native scroll
if($.feat.nativeTouchScroll){//prevent errors
if(this.ignoreScrolling(el))return;//check if vertical or hor scroll are allowed
var styles=window.getComputedStyle(el);if(this.allowsVerticalScroll(el,styles))return this.isScrollingVertical_=!0,this.scrollingEl_=el,this.isScrolling=!0,void 0;this.allowsHorizontalScroll(el,styles)&&(this.isScrollingVertical_=!1,this.scrollingEl_=null,this.isScrolling=!0)}//check recursive up to top element
var isTarget=el==parentTarget;!isTarget&&el.parentNode&&this.checkDOMTree(el.parentNode,parentTarget)},//scroll finish detectors
scrollEnded:function(e){//this.log("scrollEnded");
null!==this.scrollTimeoutEl_&&(e&&this.scrollTimeoutEl_.removeEventListener("scroll",this.scrollEndedProxy_,!1),this.fireEvent("UIEvents","scrollend",this.scrollTimeoutEl_,!1,!1),this.scrollTimeoutEl_=null)},onTouchMove:function(e){//set it as moved
var wasMoving=this.moved;//panning check
return this.moved=!0,//very sensitive devices check
verySensitiveTouch&&(this.cY=e.touches[0].pageY-this.dY,this.cX=e.touches[0].pageX-this.dX),this.isPanning_?void 0:(//native scroll (for scrollend)
this.isScrolling&&(wasMoving||//this.log("scrollstart");
this.fireEvent("UIEvents","scrollstart",this.scrollingEl_,!1,!1),//if(this.isScrollingVertical_) {
this.speedY=(this.lastY-e.touches[0].pageY)/(e.timeStamp-this.lastTimestamp),this.lastY=e.touches[0].pageY,this.lastX=e.touches[0].pageX,this.lastTimestamp=e.timeStamp),//non-native scroll devices
$.os.blackberry10?void 0:(//legacy stuff for old browsers
this.isScrolling&&$.feat.nativeTouchScroll||e.preventDefault(),void 0))},onTouchEnd:function(e){//double check moved for sensitive devices)
var itMoved=this.moved;//panning action
if(verySensitiveTouch&&(itMoved=itMoved&&!(Math.abs(this.cX)<10&&Math.abs(this.cY)<10)),//don't allow document scroll unless a specific click demands it further ahead
af.os.ios&&this.requiresNativeTap||(this.allowDocumentScroll_=!1),this.isPanning_&&itMoved)//wait 2 secs and cancel
this.wasPanning_=!0;else if(itMoved||this.requiresNativeTap)itMoved&&(//setup scrollend stuff
this.isScrolling&&(this.scrollTimeoutEl_=this.scrollingEl_,Math.abs(this.speedY)<.01?//fire scrollend immediatly
//this.log(" scrollend immediately "+this.speedY);
this.scrollEnded(!1)://wait for scroll event
//this.log($.debug.since()+" setting scroll timeout "+this.speedY);
this.scrollTimeout_=setTimeout(this.scrollTimeoutExpireProxy_,30)),//trigger cancel-enter-edit on inputs
this.requiresNativeTap&&(this.isFocused_||$.trigger(this,"cancel-enter-edit",[e.target])));else{if(this.scrollerIsScrolling=!1,!this.trackingClick)return;//fire click
if(//NOTE: on android if touchstart is not preventDefault(), click will fire even if touchend is prevented
//this is one of the reasons why scrolling and panning can not be nice and native like on iPhone
e.preventDefault(),!this.blockClicks&&!this.blockPossibleClick_){var theTarget=e.target;3==theTarget.nodeType&&(theTarget=theTarget.parentNode),this.fireEvent("Event","click",theTarget,!0,e.mouseToTouch,e.changedTouches[0]),this.lastTouchStartX=this.dX,this.lastTouchStartY=this.dY}}$.os.blackberry10&&(this.lastTouchStartX=this.dX,this.lastTouchStartY=this.dY),this.clearTouchVars()},clearTouchVars:function(){//this.log("clearing touchVars");
this.speedY=this.lastY=this.cY=this.cX=this.dX=this.dY=0,this.moved=!1,this.isPanning_=!1,this.isScrolling=!1,this.isScrollingVertical_=!1,this.requiresNativeTap=!1,this.blockPossibleClick_=!1,this.trackingClick=!1},fireEvent:function(eventType,eventName,target,bubbles,mouseToTouch,data){//this.log("Firing event "+eventName);
//create the event and set the options
var theEvent=document.createEvent(eventType);theEvent.initEvent(eventName,bubbles,!0),theEvent.target=target,data&&$.each(data,function(key,val){theEvent[key]=val}),//af.DesktopBrowsers flag
mouseToTouch&&(theEvent.mouseToTouch=!0),target.dispatchEvent(theEvent)}}}(af);