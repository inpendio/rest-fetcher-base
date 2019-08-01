!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("lodash")):"function"==typeof define&&define.amd?define(["exports","lodash"],e):e(t.reduxrestfetcher={},t.lodash)}(this,function(t,d){function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function ownKeys(e,t){var o=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),o.push.apply(o,n)}return o}function g(){for(var e={},t=arguments.length,o=new Array(t),n=0;n<t;n++)o[n]=arguments[n];return o.forEach(function(t){t.constructor===Object&&(e=function mergeTwo(e,o){var n=o,r={};return Object.keys(e).forEach(function(t){"object"===_typeof(e[t])&&e[t].constructor!==Array?o[t]&&"object"===_typeof(o[t])?r[t]=mergeTwo(e[t],o[t]):r[t]=e[t]:e[t].constructor===Array?(r[t]=e[t],o[t]&&o[t].constructor===Array&&(r[t]=e[t].concat(o[t]))):o[t]?r[t]=o[t]:r[t]=e[t],delete n[t]}),r=Object.assign({},r,n)}(e,t))}),e}function i(t,o,e){var n=t,r={};return-1===t.indexOf("http")&&(n="".concat(e).concat(t)),d.isObject(o)&&Object.keys(o).forEach(function(t){if(-1===c.indexOf(t)){var e=new RegExp(":".concat(t));e.test(n)?n=n.replace(e,o[t]):r[t]=o[t]}else"GET"===t&&(r=function _objectSpread2(r){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(i,!0).forEach(function(t){var e,o,n;e=r,n=i[o=t],o in e?Object.defineProperty(e,o,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[o]=n}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(i)):ownKeys(i).forEach(function(t){Object.defineProperty(r,t,Object.getOwnPropertyDescriptor(i,t))})}return r}({},r,{},o[t]))}),n+=function getGetParamsAsString(o){if(d.isEmpty(o))return"";var n="?";return Object.keys(o).forEach(function(t,e){"object"!==_typeof(o[t])&&"function"!=typeof o[t]&&(n="".concat(n+(0!==e?"&":"")+t,"=").concat(o[t]))}),n}(r)}function k(){var u=this;!function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,k),this.setBaseUrl=function(t){u.baseUrl=t},this.setPrefix=function(t){u.basePrefix=t},this.setFetch=function(t){var e=global||window;u.fetch=t.bind(e)},this.setBaseOptions=function(t){u.baseOptions=t},this.setDispatcher=function(t){u.dispatch=t.bind(u)},this.setGetState=function(t){u.getState=t},this.getHelpers=function(){return{deepMerge:g}},this.setEndpoints=function(o){Object.keys(o).forEach(function(e){u.endpointCreationPool.forEach(function(t){t(o[e],e)}),u.originalEndpoints[e]=o[e]})},this.addToPrefetchPool=function(t,e){var o=t.prefetch;o&&(d.isFunction(o)||d.isArray(o))&&(u.prefetchPool[e]=o)},this.addToPostfetchPool=function(t,e){var o=t.postfetch;o&&(d.isFunction(o)||d.isArray(o))&&(u.postfetchPool[e]=o)},this.addEndpointAsClassFunction=function(t,n){var r=t.url,i=t.options,c=t.useEmptyHeaders;u[n]=function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},o=2<arguments.length?arguments[2]:void 0;return u.baseFetch(r,i,t,e,n,o||c)},u.actions[n]=u[n]},this.baseFetch=function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},o=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{},n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:{},r=4<arguments.length?arguments[4]:void 0,c=5<arguments.length&&void 0!==arguments[5]&&arguments[5];if(!u.fetch)throw new Error("rest-fetcher-base requires fetch to be defined. Since none was found in construction you probably forgot to add one manually");var s=o.expected||"json",a=g(u.baseOptions,e,n);c&&(a={headers:{}});var f={actions:u.actions,getState:u.getState,dispatch:u.dispatch,params:o,options:a,url:t,helpers:u.getHelpers()};u.prefetchPool[r]&&u.getState&&(d.isArray(u.prefetchPool[r])?u.prefetchPool[r]:[u.prefetchPool[r]]).forEach(function(t){var e=t(f);e&&(f=g(f,e))});a=g(f.options,function getBody(t){return!!t.body&&("string"==typeof t.body?{body:t.body}:!!d.isObject(t.body)&&{body:JSON.stringify(t.body)})}(f.params));var h,p=i(f.url,f.params,u.baseUrl);return u.dispatch&&u.actionStart&&u.dispatch(u.actionStart(r,p,a)),u.fetch(p,a).then(function(t){return h={ok:t.ok,redirected:t.redirected,status:t.status,type:t.type,url:t.url},Promise.all([t[s](),Promise.resolve(h)])}).then(function(t){if(u.dispatch&&u.actionEnd&&u.dispatch(u.actionEnd(r,t[0],t[1])),u.postfetchPool[r]){var o={actions:u.actions,getState:u.getState,dispatch:u.dispatch,data:t[0],helpers:u.getHelpers()};return(d.isArray(u.postfetchPool[r])?u.postfetchPool[r]:[u.postfetchPool[r]]).forEach(function(t){var e=t(o);e&&(o=g(o,e))}),Promise.resolve(o.data)}return Promise.resolve(t[0])}).catch(function(t){u.dispatch&&u.actionError&&u.dispatch(u.actionError(r,h,t.message))})},this.baseUrl="","undefined"!=typeof window&&"undefined"!=typeof fetch?this.fetch=fetch.bind(window):this.fetch=null,this.originalEndpoints={},this.reducerPool={},this.prefetchPool={},this.postfetchPool={},this.transformerPool={},this.endpointCreationPool=[this.addToPrefetchPool,this.addToPostfetchPool,this.addEndpointAsClassFunction],this.actions={},this.basePrefix="api(.)(.)",this.baseOptions={credentials:"include",headers:{Accept:"application/json","Content-Type":"application/json",Cache:"no-cache",credentials:"same-origin"}}}var c=["body","expected","GET"],e=new k;t.default=e,t.Base=k,Object.defineProperty(t,"__esModule",{value:!0})});