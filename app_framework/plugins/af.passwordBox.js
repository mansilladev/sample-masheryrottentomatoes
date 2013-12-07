/**
 * af.passwordBox - password box replacement for html5 mobile apps on android due to a bug with CSS3 translate3d
 * @copyright 2011 - Intel
 */
!function($){$.passwordBox=function(){return new passwordBox};var passwordBox=function(){this.oldPasswords={}};passwordBox.prototype={showPasswordPlainText:!1,getOldPasswords:function(elID){//   if ($.os.android == false) return; -  iOS users seem to want this too, so we'll let everyone join the party
var container=elID&&document.getElementById(elID)?document.getElementById(elID):document;if(!container)return alert("Could not find container element for passwordBox "+elID),void 0;for(var sels=container.getElementsByTagName("input"),i=0;i<sels.length;i++)"password"==sels[i].type&&$.os.webkit&&(sels[i].type="text",$(sels[i]).vendorCss("TextSecurity","disc"))},changePasswordVisiblity:function(what,id){what=parseInt(what,10);var theEl=document.getElementById(id);1==what?//show
$(theEl).vendorCss("TextSecurity","none"):$(theEl).vendorCss("TextSecurity","disc"),$.os.webkit||(theEl.type=1==what?"text":"password"),theEl=null}}}(af);