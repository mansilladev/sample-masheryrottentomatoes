/**
 * af.popup - a popup/alert library for html5 mobile apps
 * @copyright Indiepath 2011 - Tim Fisher
 * Modifications/enhancements by appMobi for App Framework
 *
 */
/* EXAMPLE
 $.query('body').popup({
        title:"Alert! Alert!",
        message:"This is a test of the emergency alert system!! Don't PANIC!",
        cancelText:"Cancel me",
        cancelCallback: function(){console.log("cancelled");},
        doneText:"I'm done!",
        doneCallback: function(){console.log("Done for!");},
        cancelOnly:false,
        doneClass:'button',
        cancelClass:'button',
        onShow:function(){console.log('showing popup');}
        autoCloseDone:true, //default is true will close the popup when done is clicked.
        suppressTitle:false //Do not show the title if set to true
  });

  You can programatically trigger a close by dispatching a "close" event to it.

 $.query('body').popup({title:'Alert',id:'myTestPopup'});
  $("#myTestPopup").trigger("close");

 */
!function($){$.fn.popup=function(opts){return new popup(this[0],opts)};var queue=[],popup=function(){var popup=function(containerEl,opts){if(this.container="string"==typeof containerEl||containerEl instanceof String?document.getElementById(containerEl):containerEl,!this.container)return alert("Error finding container for popup "+containerEl),void 0;try{("string"==typeof opts||"number"==typeof opts)&&(opts={message:opts,cancelOnly:"true",cancelText:"OK"}),this.id=id=opts.id=opts.id||$.uuid(),this.addCssClass=opts.addCssClass?"":opts.addCssClass,this.title=opts.suppressTitle?"":opts.title||"Alert",this.message=opts.message||"",this.cancelText=opts.cancelText||"Cancel",this.cancelCallback=opts.cancelCallback||function(){},this.cancelClass=opts.cancelClass||"button",this.doneText=opts.doneText||"Done",this.doneCallback=opts.doneCallback||function(){},this.doneClass=opts.doneClass||"button",this.cancelOnly=opts.cancelOnly||!1,this.onShow=opts.onShow||function(){},this.autoCloseDone=void 0!==opts.autoCloseDone?opts.autoCloseDone:!0,queue.push(this),1==queue.length&&this.show()}catch(e){console.log("error adding popup "+e)}};return popup.prototype={id:null,addCssClass:null,title:null,message:null,cancelText:null,cancelCallback:null,cancelClass:null,doneText:null,doneCallback:null,doneClass:null,cancelOnly:!1,onShow:null,autoCloseDone:!0,supressTitle:!1,show:function(){var self=this,markup='<div id="'+this.id+'" class="afPopup hidden '+addCssClass+'">'+"<header>"+this.title+"</header>"+"<div>"+this.message+"</div>"+'<footer style="clear:both;">'+'<a href="javascript:;" class="'+this.cancelClass+'" id="cancel">'+this.cancelText+"</a>"+'<a href="javascript:;" class="'+this.doneClass+'" id="action">'+this.doneText+"</a>"+" </footer>"+"</div></div>";$(this.container).append($(markup));var $el=$.query("#"+this.id);$el.bind("close",function(){self.hide()}),this.cancelOnly&&($el.find("A#action").hide(),$el.find("A#cancel").addClass("center")),$el.find("A").each(function(){var button=$(this);button.bind("click",function(e){"cancel"==button.attr("id")?(self.cancelCallback.call(self.cancelCallback,self),self.hide()):(self.doneCallback.call(self.doneCallback,self),self.autoCloseDone&&self.hide()),e.preventDefault()})}),self.positionPopup(),$.blockUI(.5),$el.bind("orientationchange",function(){self.positionPopup()}),//force header/footer showing to fix CSS style bugs
$el.find("header").show(),$el.find("footer").show(),setTimeout(function(){$el.removeClass("hidden"),self.onShow(self)},50)},hide:function(){var self=this;$.query("#"+self.id).addClass("hidden"),$.unblockUI(),$.os.ie||$.os.android?self.remove():setTimeout(function(){self.remove()},250)},remove:function(){var self=this,$el=$.query("#"+self.id);$el.unbind("close"),$el.find("BUTTON#action").unbind("click"),$el.find("BUTTON#cancel").unbind("click"),$el.unbind("orientationchange").remove(),queue.splice(0,1),queue.length>0&&queue[0].show()},positionPopup:function(){var popup=$.query("#"+this.id);popup.css("top",window.innerHeight/2.5+window.pageYOffset-popup[0].clientHeight/2+"px"),popup.css("left",window.innerWidth/2-popup[0].clientWidth/2+"px")}},popup}(),uiBlocked=!1;$.blockUI=function(opacity){uiBlocked||(opacity=opacity?" style='opacity:"+opacity+";'":"",$.query("BODY").prepend($("<div id='mask'"+opacity+"></div>")),$.query("BODY DIV#mask").bind("touchstart",function(e){e.preventDefault()}),$.query("BODY DIV#mask").bind("touchmove",function(e){e.preventDefault()}),uiBlocked=!0)},$.unblockUI=function(){uiBlocked=!1,$.query("BODY DIV#mask").unbind("touchstart"),$.query("BODY DIV#mask").unbind("touchmove"),$("BODY DIV#mask").remove()}}(af);