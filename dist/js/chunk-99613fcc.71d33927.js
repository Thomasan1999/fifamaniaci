(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-99613fcc"],{"1cd7":function(t,e,s){},"41b5":function(t,e,s){"use strict";var n=s("1cd7"),a=s.n(n);a.a},"6d0d":function(t,e,s){"use strict";s.r(e);var n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("section",{staticClass:"matches"},[s("loading-container",{attrs:{condition:t.dataLoaded}},[s("table-container",{attrs:{"table-name":t.tableName,columns:t.columns,"form-component":"MatchesFormAdd",rows:t.rows,"rows-sort-compare-fn":t.rowsSortCompareFn,"start-top-at":t.startTopAt,text:t.text,types:t.types},scopedSlots:t._u([{key:"bottomRow",fn:function(e){var n=e.formAdd;return[s("div",{staticClass:"legend"},[t.$store.state.windowWidth>424?s("p",{domProps:{innerHTML:t._s(t.text.types.localization)}}):t._e(),s("div",{staticClass:"type-container-container"},t._l(t.typesSorted,(function(e,n){var a=e[1];return s("div",{key:n},[s("div",{staticClass:"legend-circle",class:new t.$String(a.name).caseTrainTo().toString()}),s("p",{domProps:{innerHTML:t._s(t.typeHtmlGet(a))}})])})),0)]),t.$store.state.userLogged.loggedIn?s("div",{staticClass:"add-match-button-container"},t._l(t.typesSorted,(function(e,a){var r,o=e[0],i=e[1];return s("div",{key:a,class:(r={},r[new t.$String(i.name).caseTrainTo().toString()]=!0,r.disabled=i.disabled,r),attrs:{title:new t.$String(t.text.add).htmlParse({type:t.text.types[i.name].long||t.text.types[i.name]})},on:{click:function(t){return n(o)},mousedown:function(t){t.preventDefault()}}},[s("p",[t._v("+")])])})),0):t._e()]}}])})],1)],1)},a=[],r=(s("c1f9"),s("ddb0"),s("9ab4")),o=s("2fe1"),i=s("60a3"),c=s("9fa6"),d=s("d6ef"),l=s("0dec"),p=s("aa99"),u=s("8aed");let f=class extends(Object(o["c"])(u["a"],d["a"],l["a"],c["a"])){rowsSortCompareFn([,t],[,e]){const s=this.$dayjs(t.playedAt).diff(this.$dayjs(e.playedAt));return 0===s?this.$dayjs(t.resultWritten).diff(this.$dayjs(e.resultWritten)):s}typeHtmlGet(t){const e=this.text.types[t.name],s=()=>this.$store.getters.touchscreen?e.short:e.long;return"object"===typeof e?s():e}get rows(){return Object.fromEntries(Object.entries(this.$store.state.matches.value[this.categoriesActive]||{}).filter(([,t])=>t.playedAt))}get typesSorted(){return Object.entries(this.types).sort(([,t],[,e])=>t.weight-e.weight)}};f=Object(r["a"])([Object(i["a"])({components:{TableContainer:p["default"]},name:"Matches"})],f);var m=f,b=m,y=(s("41b5"),s("2877")),h=Object(y["a"])(b,n,a,!1,null,"e640e782",null);e["default"]=h.exports},d6ef:function(t,e,s){"use strict";s("25f0");var n=s("9ab4"),a=s("2fe1"),r=s("60a3"),o=s("8aed");let i=class extends(Object(a["c"])(o["a"])){get active(){return this.sectionsActive===new this.$String(this.$options.name).decapitalize().toString()}};Object(n["a"])([Object(r["b"])({required:!0,type:Object})],i.prototype,"text",void 0),i=Object(n["a"])([Object(r["a"])({name:"SectionMixin"})],i),e["a"]=i}}]);
//# sourceMappingURL=chunk-99613fcc.71d33927.js.map