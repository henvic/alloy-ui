AUI.add("aui-tree-io",function(e){var l=e.Lang,d=l.isFunction,b=l.isString,a="ioRequestSuccess",n="contentBox",f="io",i="ownerTree",j="loaded",m="loading",c="node",o="tree",h=e.getClassName,g=h(o,c,f,m);function k(q){var p=this;p.publish(a,{defaultFn:p._onIOSuccessDefault});}k.ATTRS={io:{lazyAdd:false,value:null,setter:function(p){return this._setIO(p);}}};k.prototype={initializer:function(){var p=this;p.publish();},initIO:function(){var q=this;var r=q.get(f);if(d(r.cfg.data)){r.cfg.data=r.cfg.data.call(q,q);}q._syncPaginatorIOData(r);if(d(r.loader)){var p=e.bind(r.loader,q);p(r.url,r.cfg,q);}else{e.io.request(r.url,r.cfg);}},ioStartHandler:function(){var p=this;var q=p.get(n);p.set(m,true);q.addClass(g);},ioCompleteHandler:function(){var p=this;var q=p.get(n);p.set(m,false);p.set(j,true);q.removeClass(g);},ioSuccessHandler:function(){var p=this;var w=p.get(f);var r=Array.prototype.slice.call(arguments);var t=r.length;var q=r[1];if(t>=3){var v=r[2];try{q=e.JSON.parse(v.responseText);}catch(u){}}var s=w.formatter;if(s){q=s(q);}p.createNodes(q);p.fire(a,q);},ioFailureHandler:function(){var p=this;p.fire("ioRequestFailure");p.set(m,false);p.set(j,false);},_onIOSuccessDefault:function(r){var p=this;var q=p.get(i);if(q&&q.ddDelegate){q.ddDelegate.syncTargets();}},_setIO:function(r){var p=this;if(!r){return null;}else{if(b(r)){r={url:r};}}r=r||{};r.cfg=r.cfg||{};r.cfg.on=r.cfg.on||{};var q={start:e.bind(p.ioStartHandler,p),complete:e.bind(p.ioCompleteHandler,p),success:e.bind(p.ioSuccessHandler,p),failure:e.bind(p.ioFailureHandler,p)};e.each(q,function(u,s){var v=r.cfg.on[s];u.defaultFn=true;if(d(v)){var t=e.bind(function(){u.apply(p,arguments);v.apply(p,arguments);},p);t.wrappedFn=true;r.cfg.on[s]=t;}else{r.cfg.on[s]=u;}});return r;}};e.TreeViewIO=k;},"@VERSION@",{skinnable:false,requires:["aui-io","json"]});