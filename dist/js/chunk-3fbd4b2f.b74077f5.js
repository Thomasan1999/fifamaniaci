(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-3fbd4b2f","chunk-572b6c86","chunk-e504afd4"],{"19bf":function(e,t,a){"use strict";a.r(t);var r=function(e,t){var a=t._c;return t.props.sectionIs?a("section",{staticClass:"form-section",class:new t.parent.$String(t.parent.$options.name).urlTo()},[a("div",{staticClass:"text-container"},[a("h1",{staticClass:"title",domProps:{innerHTML:t._s(new t.parent.$String(t.parent.text.title).htmlParse())}}),a(t.props.components.FormContainer,{tag:"component"})],1)]):a(t.props.components.FormContainer,{tag:"component",class:new t.parent.$String(t.parent.$options.name).urlTo()})},s=[],n=a("9ddd"),_={name:"FormSection",props:{components:{type:Object,default(){return{FormContainer:n["default"]}}},sectionIs:{default:!0,type:Boolean}}},i=_,l=(a("e8af"),a("2877")),o=Object(l["a"])(i,r,s,!0,null,"30c16355",null);t["default"]=o.exports},2281:function(e,t,a){},"5fc0":function(e,t,a){},"73f1":function(e,t,a){"use strict";a.r(t);var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("form-section")},s=[],n=(a("ddb0"),a("9ab4")),_=a("60a3"),i=a("2fe1"),l=a("e14e"),o=a("eade"),u=a("8aed"),c=a("19bf");let m=class extends(Object(i["c"])(u["a"],o["a"],l["a"])){constructor(){super(...arguments),this.tableName="users",this.alertTypesActive=["empty","short","long","invalid","notFound"],this.url="passwordReset"}responseOn(e){e.ok||"Password reset token invalid"===e.body.message&&this.alertShow({alertType:"passwordResetTokenInvalid",state:"failed"})}created(){this.elements=this.elementsCreate({passwordNew:{order:0,type:"password"}}),this.elementsExtra=this.elementsCreate({email:{type:"email",value:this.$route.query.email},passwordResetToken:{type:"password",value:this.$route.query.passwordResetToken}})}};m=Object(n["a"])([Object(_["a"])({components:{FormSection:c["default"]},name:"PasswordReset"})],m);var p=m,d=p,h=a("2877"),f=Object(h["a"])(d,r,s,!1,null,"6e4b956b",null);t["default"]=f.exports},8119:function(e,t,a){"use strict";var r=a("2281"),s=a.n(r);s.a},"9ddd":function(e,t,a){"use strict";a.r(t);var r=function(e,t){var a=t._c;return a("div",{staticClass:"form-container"},[t.parent.text.instructions?a("p",{staticClass:"instructions",domProps:{innerHTML:t._s(t.parent.text.instructions)}}):t._e(),a("form",{attrs:{action:t.parent.urlFullGet(),method:"post"},on:{submit:function(e){return e.preventDefault(),t.parent.submitOn(e)}}},[t._l(t.parent.elementsEntries,(function(e){var r,s=e[0],n=e[1];return[n.labelTop?a("label",{key:s+"-labelTop",staticClass:"label-top",domProps:{innerHTML:t._s(n.labelTop+":")}}):t._e(),a("div",{key:s+"-element",staticClass:"element",class:(r={},r["error-show"]=n.errorShow,r)},[a("label",{attrs:{for:t.parent.idGet({elementName:s})},domProps:{innerHTML:t._s(new t.parent.$String(t.parent.texts.dictionary[s]).capitalize()+":"+(n.required?"*":""))}}),a("input",{key:s+"-input",style:{color:n.color},attrs:{id:t.parent.idGet({elementName:s}),autocomplete:n.autocomplete,minlength:n.length.min,maxlength:n.length.max,type:n.input},domProps:{value:n.value},on:{blur:function(e){return t.parent.blurOn({element:n})},focus:function(e){return t.parent.focusOn({element:n})},input:function(e){return t.parent.propertiesUpdate({element:n,props:{value:e.target.value}})}}}),n.errorShow?a("div",{staticClass:"input-alert",domProps:{innerHTML:t._s(t.parent.alertHtmlGet(Object.assign({},n,{targetType:n.name})))}}):t._e()])]})),a("p",{staticClass:"required-fields-legend",domProps:{innerHTML:t._s(t.parent.texts.form.requiredFields)}}),a("button",{staticClass:"bordered-button",domProps:{innerHTML:t._s(t.parent.text.submit||t.parent.texts.form.submit)}})],2)])},s=[],n={name:"FormContainer"},_=n,i=(a("8119"),a("2877")),l=Object(i["a"])(_,r,s,!0,null,"11e74040",null);t["default"]=l.exports},e14e:function(e,t,a){"use strict";a("25f0"),a("ddb0");var r=a("9ab4"),s=a("2fe1"),n=a("60a3"),_=a("8aed"),i=a("eade");let l=class extends(Object(s["c"])(_["a"],i["a"])){focusOn({element:e}){"transparent"===e.color&&this.propertiesUpdate({element:e,props:{color:"",value:""}})}validityGet({element:{required:e,taken:t,type:a,validateRegex:r,validLength:s,value:n,valueDefault:_}}){return(r.test(n)||!n&&!e)&&(!t||n===_||"password"===a)&&s}get elementsEntries(){return Object.entries(this.elements).sort(([,e],[,t])=>e.order-t.order)}get text(){return this.texts[new this.$String(this.$options.name).decapitalize().toString()]}created(){Object.values(this.elements).forEach(e=>{e.valueDefault||this.propertiesUpdate({element:e,props:{color:"transparent",value:" "}}),this.$set(e,"asterisk",e.required?"*":"")})}};l=Object(r["a"])([Object(n["a"])({name:"FormSectionMixin"})],l),t["a"]=l},e8af:function(e,t,a){"use strict";var r=a("5fc0"),s=a.n(r);s.a},eade:function(e,t,a){"use strict";a("ddb0");var r=a("9ab4"),s=a("2fe1"),n=a("60a3"),_=a("8aed"),i=a("f6bb");let l=class extends(Object(s["c"])(_["a"],i["a"])){async availabilityCheck({element:e}){!1!==e.unique&&("password"===e.input||e.validateRegex.test(e.value)||(e.errorShow=!1),"password"!==e.input&&e.validateRegex.test(e.value)&&(e.checking=!0,new Promise((t,a)=>{const r=Object.entries(this.$store.state.users.value).find(([t,a])=>a[e.name]===e.value);return r?t():a()}).then(()=>{e.taken=!0}).catch(()=>{e.taken=!1}).finally(()=>{e.checking=!1,this.computedPropertiesUpdate({element:e})})))}blurOn({element:e}){this.availabilityCheck({element:e}).catch((function(){})),e.inputting=!1,e.alertType=this.alertTypeGet({element:e}),this.errorShowUpdate({element:e})}};l=Object(r["a"])([Object(n["a"])({name:"RegistrationLoginFormMixin"})],l),t["a"]=l},f6bb:function(module,__webpack_exports__,__webpack_require__){"use strict";var core_js_modules_es_regexp_to_string__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("25f0"),core_js_modules_es_regexp_to_string__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(core_js_modules_es_regexp_to_string__WEBPACK_IMPORTED_MODULE_0__),core_js_modules_es_string_includes__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("2532"),core_js_modules_es_string_includes__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(core_js_modules_es_string_includes__WEBPACK_IMPORTED_MODULE_1__),core_js_modules_es_string_match__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("466d"),core_js_modules_es_string_match__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(core_js_modules_es_string_match__WEBPACK_IMPORTED_MODULE_2__),core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("5319"),core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(core_js_modules_es_string_replace__WEBPACK_IMPORTED_MODULE_3__),core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("ddb0"),core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_4___default=__webpack_require__.n(core_js_modules_web_dom_collections_iterator__WEBPACK_IMPORTED_MODULE_4__),C_Users_tomas_WebStormProjects_fifamaniaci_preview_client_node_modules_vue_babel_preset_app_node_modules_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("f3f3"),tslib__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("9ab4"),vue_class_component__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("2fe1"),vue_property_decorator__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("60a3"),_mixins_Main__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("8aed");let FormMixin=class FormMixin extends(Object(vue_class_component__WEBPACK_IMPORTED_MODULE_7__["c"])(_mixins_Main__WEBPACK_IMPORTED_MODULE_9__["a"])){constructor(){super(...arguments),this.alertTypes={empty(e){return e.required&&e.emptyIs()},invalid({validateRegex:e,value:t}){return!e.test(t)},long({length:e,value:t}){return t.length>e.max},notFound({taken:e}){return!e},short(e){return!(!e.required&&e.emptyIs())&&e.value.length<e.length.min},taken({taken:e,type:t,valueDefault:a,value:r}){return e&&"password"!==t&&r!==a}},this.alertTypesActive=["short","long","invalid","empty"],this.elements={},this.elementsExtra={},this.formData={},this.method="post"}alertShowSuccessful(){this.alertShow({alertType:"successful",state:"successful",targetType:this.$options.name})}alertTypeGet({element:e}){return this.alertTypesActive.find(t=>this.alertTypes[t](e))||""}blurOn({element:e}){e.inputting=!1,e.alertType=this.alertTypeGet({element:e}),this.errorShowUpdate({element:e})}computedPropertiesUpdate({element:e}){this.formDataUpdate({element:e}),e.validLength=this.lengthValidityGet({element:e}),e.valid=this.validityGet({element:e}),e.alertType=this.alertTypeGet({element:e}),this.errorShowUpdate({element:e})}errorShowUpdate({element:e}){e.errorShow=(e.required||!e.emptyIs())&&!e.valid&&!e.inputting&&!e.checking}formDataUpdate({element:e}){if(!e.sendable||"span"===e.tag)return;if(e.emptyIs()&&!e.required||e.reference&&e.valueDefault===e.value)return void delete this.formData[e.name];const t=(()=>{switch(e.type){case"id":case"idUsername":return e.id||null;case"date":return e.value||this.$dayjs().format();case"float":return parseFloat(e.value)||e.min;case"integer":return parseInt(e.value)||e.min;case"boolean":return e.value;default:return" "===e.value?null:e.value||null}})();this.$set(this.formData,e.name,t)}async formSubmit({alertSuccessful:e=!0,categoryInclude:t=!1,auth:a=!1,tableName:r=this.tableName,url:s=this.url}={}){var n;if(this.validate(),this.valid)return e&&this.alertShowSuccessful(),Object.values(this.elements).forEach(e=>{this.propertiesUpdate({element:e,props:Object(C_Users_tomas_WebStormProjects_fifamaniaci_preview_client_node_modules_vue_babel_preset_app_node_modules_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_5__["a"])({},e.reference?{valueDefault:e.value}:{value:"span"===e.tag?e.value:""})})}),null===(n=this.responseOn)||void 0===n||n.call(this,{body:{},headers:{},ok:!0,status:400}),{body:{},headers:{},ok:!0,status:400};this.invalidOn()}idGet({elementName:e}){return`${new this.$String(this.$options.name).caseTrainTo()}-${new this.$String(e).caseTrainTo()}${"undefined"!==typeof this.id?"-"+this.id:""}`}invalidOn(){this.alertShow({alertType:"invalid",state:"failed"})}lengthValidityGet({element:{length:e,value:t}}){return new this.$Range(e.min,e.max).includes(t.toString().length)}propertiesUpdate({element:e,inputting:t=!0,props:a}){Object.entries(a).forEach(([a,r])=>{e.inputting=t,e[a]=r,this.computedPropertiesUpdate({element:e})})}responseOn(e){}submitOn(){this.formSubmit({auth:Boolean(this.auth),categoryInclude:Boolean(this.categoryInclude)}).catch((function(){}))}urlFullGet({tableName:e=this.tableName,url:t=this.url}={}){return`https://api.${this.hostname}/${e}${t?"/"+t:""}`}validityGet({}){return!0}validate(){Object.values(this.elements).forEach(e=>{e.inputting=!1,this.computedPropertiesUpdate({element:e})})}get elementsAll(){return Object(C_Users_tomas_WebStormProjects_fifamaniaci_preview_client_node_modules_vue_babel_preset_app_node_modules_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_5__["a"])(Object(C_Users_tomas_WebStormProjects_fifamaniaci_preview_client_node_modules_vue_babel_preset_app_node_modules_babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_5__["a"])({},this.elements),this.elementsExtra)}get valid(){return!Object.entries(this.elementsAll).filter(([,e])=>e.required).some(([e,t])=>!t.valid&&"password"!==e)}elementsCreate(elements){const defaults={alertType:"",autocomplete:{default:"off",email:"email",password:"password"},checking:!1,emptyIs(){return""===this.value||" "===this.value},errorShow:!1,input:{boolean:"checkbox",default:"text",email:"email",float:"number",integer:"number",password:"password"},inputting:!1,length:{default:{min:0,max:128},email:{min:0,max:64},fbLink:{min:25,max:256},message:{min:0,max:1024},password:{min:6,max:64},username:{min:0,max:32},usernamesInGamePs:{min:3,max:16},usernamesInGamePc:{min:4,max:16},usernamesInGameXbox:{min:3,max:16}},prefix:{default:"",fbLink:"https://facebook.com/"},required:!0,sendable:!0,tag:"input",taken:{default:!1,password:!0},type:"any",valid:"${!element.required}",validLength:!0,validateRegex:{id:/^([-]?\d|NaN)+$/,idUsername:/^([-]?\d|NaN)+$/,alphabetical:/^([a-z]| )+$/i,alphabeticalExtended:/^([\u0041-\u005a]|[\u00c0-\u024f]| )+$/i,alphanumerical:/^(\w+| )$/i,alphanumericalExtended:/^(\d|[\u0041-\u005a]|[\u00c0-\u024f]| )+$/i,any:/^(.*)$/,boolean:/^(true|false)$/,default:/^(.*)$/,email:/^(([^<>()\\.,;:\s@"]+(\.[^<>()\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,fbLink:/^((http|https):\/\/)(www\.)?(facebook\.com)(\/)?([^\W_]|\.){5,}$/,float:/^([-]?\d[.\d+]?|NaN)+$/,hexadecimal:/[0-9a-f]+/i,integer:/^([-]?\d|NaN)+$/,username:/^(\d|[\u0041-\u005a]|[\u00c0-\u024f]| |_|-)+$/i,usernamesInGamePc:/^(\w|-|_)+$/i,usernamesInGamePs:/^(\w|-|_)+$/i,usernamesInGameXbox:/^(.*)+$/i},value:{boolean:!1,default:""},visibility:!0};return Object.entries(elements).forEach(([elementName,element])=>{this.$set(element,"name",elementName),Object.entries(defaults).filter(([e,t])=>!/^\${(.*)}$/.test(t)&&"undefined"===typeof element[e]).forEach(([e,t])=>{"object"!==typeof t?this.$set(element,e,t):this.$set(element,e,Object.keys(t).includes(element.type)?t[element.type]:t.default)}),this.formDataUpdate({element:element}),Object.entries(defaults).filter(([,e])=>/^\${(.*)}$/.test(e)).forEach(([prop,defaultValue])=>{const valueNew=(()=>{var _defaultValue$replace;return"valid"===prop?!element.required||this.validityGet({element:element}):eval((null===(_defaultValue$replace=defaultValue.replace("${","").match(/(.*)(?=})/))||void 0===_defaultValue$replace?void 0:_defaultValue$replace[0])||"")})();this.$set(element,prop,valueNew)})}),elements}};FormMixin=Object(tslib__WEBPACK_IMPORTED_MODULE_6__["a"])([Object(vue_property_decorator__WEBPACK_IMPORTED_MODULE_8__["a"])({name:"FormMixin"})],FormMixin),__webpack_exports__["a"]=FormMixin}}]);
//# sourceMappingURL=chunk-3fbd4b2f.b74077f5.js.map