(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-070b0364"],{"0a64":function(t,e,a){"use strict";a.r(e);var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"tab-container"},[t._l(t.tabs,(function(e){var s,n=e[0],c=e[1];return[c.disabled?a("a",{key:n,staticClass:"tab disabled"},[a("p",[a("span",{staticClass:"tab-name",domProps:{innerHTML:t._s(new t.$String(c.name).htmlParse())}}),a("span",{staticClass:"soon",domProps:{innerHTML:t._s(new t.$String(t.text.soon).htmlParse())}})])]):a("router-link",{key:n,staticClass:"tab",attrs:{to:{name:t.tabsNames[n],params:t.$store.getters.params}}},[a("p",{class:(s={},s["general-count"]=c.special,s)},[c.special?t._t("special"):t._e(),c.component?a(c.component.name,t._b({tag:"component"},"component",c.component.props,!1)):a("span",{staticClass:"tab-name",domProps:{innerHTML:t._s(new t.$String(c.name).htmlParse())}})],2),t.updatable&&0!==parseInt(n)?a("span",{staticClass:"tab-delete",domProps:{innerHTML:t._s("✕")},on:{click:function(e){return e.preventDefault(),t.tabDelete({tabId:n})}}}):t._e()])]})),t.updatable&&t.$store.state.userLogged.loggedIn?a("div",{staticClass:"tab-add",class:{clicked:t.tabAddClicked}},[t.$scopedSlots.add&&t.tabAddClicked?t._t("add"):a("p",{on:{click:t.tabAddClickOn}},[t._v("+")])],2):t._e()],2)},n=[],c=(a("ddb0"),a("9ab4")),o=a("2fe1"),r=a("60a3"),i=a("4b14"),b=a("8aed");let d=class extends(Object(o["c"])(b["a"])){constructor(){super(...arguments),this.tabAddClicked=!1}tabAddClickOn(){this.tabAddClicked=!0,this.$emit("tab-add-click")}tabDelete({tabId:t}){this.$emit("delete",{tabId:t})}};Object(c["a"])([Object(r["b"])({type:String})],d.prototype,"tableName",void 0),Object(c["a"])([Object(r["b"])({required:!0,type:Array})],d.prototype,"tabs",void 0),Object(c["a"])([Object(r["b"])({required:!0,type:[Number,String]})],d.prototype,"tabsActive",void 0),Object(c["a"])([Object(r["b"])({required:!0,type:Object})],d.prototype,"tabsNames",void 0),Object(c["a"])([Object(r["b"])({required:!0,type:Object})],d.prototype,"text",void 0),Object(c["a"])([Object(r["b"])({default:!1,type:Boolean})],d.prototype,"updatable",void 0),d=Object(c["a"])([Object(r["a"])({components:{UsernameContainer:i["default"]},name:"TabContainer"})],d);var p=d,l=p,u=(a("35e7"),a("2877")),m=Object(u["a"])(l,s,n,!1,null,"4495b7b2",null);e["default"]=m.exports},"35e7":function(t,e,a){"use strict";var s=a("a9a1"),n=a.n(s);n.a},a9a1:function(t,e,a){}}]);
//# sourceMappingURL=chunk-070b0364.902b7617.js.map