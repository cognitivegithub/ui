Ext.override(Ext.Panel, {
    beforeDestroy : function(){
        Ext.Panel.superclass.beforeDestroy.call(this);
        if(this.header && this.header.removeAllListeners){
            this.header.removeAllListeners();
        }
        if(this.tools){
            for(var k in this.tools){
                Ext.destroy(this.tools[k]);
            }
        }
        if(this.toolbars && this.toolbars.length > 0){
            Ext.each(this.toolbars, function(tb){
                tb.un('afterlayout', this.syncHeight, this);
                tb.un('remove', this.syncHeight, this);
            }, this);
        }
        if(Ext.isArray(this.buttons)){
            while(this.buttons.length) {
                Ext.destroy(this.buttons[0]);
            }
        }
        if(this.rendered){
            Ext.destroy(
                this.ft,
                this.header,
                this.footer,
                this.toolbars,
                this.tbar,
                this.bbar,
                this.body,
                this.mc,
                this.bwrap
            );
            if (this.fbar) {
                Ext.destroy(
                    this.fbar,
                    this.fbar.el
                );
            }
        }else{
            Ext.destroy(
                this.topToolbar,
                this.bottomToolbar
            );
        }
    }
});
/*
Ext.apply = function(o, c, defaults){
    // no "this" reference for friendly out of scope calls
    if(defaults){
        Ext.apply(o, defaults);
    }
    if(o && c && typeof c == 'object'){
        for(var p in c){
            if (window.Application && Application.Locale && Application.Locale.localizableProps.indexOf(p) != -1)
               o[p] = Application.Locale.translate(p, c[p]);
            else
               o[p] = c[p];
        }
    }
    return o;
};

Ext.applyIf = function(o, c){
    if(o){
        for(var p in c){
            if(!Ext.isDefined(o[p])){
                if (window.Application && Application.Locale && Application.Locale.localizableProps.indexOf(p) != -1)
                   o[p] = Application.Locale.translate(p, c[p]);
                else
                   o[p] = c[p];
            }
        }
    }
    return o;
}
*/

Ext.override(Ext.form.DateField, {
  altFormats: 'c|m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|n-j|n/j'
});

Ext.data.JsonStore = Ext.extend(Ext.data.Store, {
    /**
     * @cfg {Ext.data.DataReader} reader @hide
     */
    constructor: function(config){
        Ext.data.JsonStore.superclass.constructor.call(this, Ext.apply(config, {
            reader: new Ext.data.JsonReader(config, config.recordType || config.fields)
        }));
    }
});

Ext.reg('jsonstore', Ext.data.JsonStore);

Ext.reg('tooltip', Ext.ToolTip);

Ext.override(Ext.grid.GridView, {
  cellTpl: new Ext.Template(
        '<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
            '<div class="x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>',
        '</td>'
    )
});

Ext.override(Ext.util.Cookies.clear, function(name){
  if(Ext.util.Cookies.get(name)){
    // ставим 2000, т.к. дефолтовые 70 некоторые браузеры воспринимают как 2070
    document.cookie = name + "=" + "; expires=Sat, 01-Jan-2000 00:00:01 GMT";
  }
});

Ext.override(Ext.dd.DragTracker, {
    onMouseMove: function (e, target) {
        //var isIE9 = Ext.isIE && (/msie 9/.test(navigator.userAgent.toLowerCase())) && document.documentMode != 6;
        if (this.active && Ext.isIE && !Ext.isIE9 && !e.browserEvent.button) {
            e.preventDefault();
            this.onMouseUp(e);
            return;
        }
        e.preventDefault();
        var xy = e.getXY(), s = this.startXY;
        this.lastXY = xy;
        if (!this.active) {
            if (Math.abs(s[0] - xy[0]) > this.tolerance || Math.abs(s[1] - xy[1]) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }
        this.fireEvent('mousemove', this, e);
        this.onDrag(e);
        this.fireEvent('drag', this, e);
    }
});

/* К сожалению пришлось переткнуть целиком всю функцию ради трех строк фиксов */
Ext.util.TaskRunner = function(interval){
    interval = interval || 10;
    var tasks = [],
    	removeQueue = [],
    	id = 0,
    	running = false,

    	// private
    	stopThread = function(){
	        running = false;
	        clearInterval(id);
	        id = 0;
	    },

    	// private
    	startThread = function(){
	        if(!running){
	            running = true;
	            id = setInterval(runTasks, interval);
	        }
	    },

    	// private
    	removeTask = function(t){
	        /*if (tasks.indexOf(t)<0) {
	          return;
	        }*/
	        removeQueue.push(t);
	        if(t.onStop){
	            t.onStop.apply(t.scope || t);
	        }
	    },

    	// private
    	runTasks = function(){
	    	var rqLen = removeQueue.length,
	    		now = new Date().getTime();

	        if(rqLen > 0){
	            for(var i = 0; i < rqLen; i++){
	                tasks.remove(removeQueue[i]);
	            }
	            removeQueue = [];
	            if(tasks.length < 1){
	                stopThread();
	                return;
	            }
	        }
	        for(var i = 0, t, itime, rt, len = tasks.length; i < len; ++i){
	            t = tasks[i];
	            itime = now - t.taskRunTime;
              if (itime<0) {  // Проверяем, что время не прыгнуло назад
                t.taskRunTime = now;
                continue;
              }
	            if(t.interval <= itime){
	                rt = t.run.apply(t.scope || t, t.args || [++t.taskRunCount]);
	                t.taskRunTime = now;
	                if(rt === false || t.taskRunCount === t.repeat){
	                    removeTask(t);
	                    return;
	                }
	            }
	            if(t.duration && t.duration <= (now - t.taskStartTime)){
	                removeTask(t);
	            }
	        }
	    };


    this.start = function(task){
        /*if (tasks.indexOf(task)>=0 && removeQueue.indexOf(task)<0) {
          return task;
        }*/
        tasks.push(task);
        task.taskStartTime = new Date().getTime();
        task.taskRunTime = 0;
        task.taskRunCount = 0;
        startThread();
        return task;
    };

    /**
     * Stops an existing running task.
     * @method stop
     * @param {Object} task The task to stop
     * @return {Object} The task
     */
    this.stop = function(task){
        removeTask(task);
        return task;
    };

    /**
     * Stops all tasks that are currently running.
     * @method stopAll
     */
    this.stopAll = function(){
        stopThread();
        for(var i = 0, len = tasks.length; i < len; i++){
            if(tasks[i].onStop){
                tasks[i].onStop();
            }
        }
        tasks = [];
        removeQueue = [];
    };
};

Ext.TaskMgr.stopAll();
delete Ext.TaskMgr;
delete Ext.TaskManager;

Ext.TaskMgr = new Ext.util.TaskRunner(100); // ну и пореже дергаем, ибо дефолт — 10мс
Ext.TaskManager = Ext.TaskMgr;

Ext.util.JSON.encodeDate = function(d) {
  return d.format('"c"');
};
