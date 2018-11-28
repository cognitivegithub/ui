Ext.ns('Ext.ux.plugins');

/**
 * Плагин для включения стейтфульности. У компонента должен быть указан name, и
 * присутствовать функция getValue
 * Параметры:
 *   statePrefix: префикс имени стейта
 *   stateSuffix: суффикс имени стейта
 */


Ext.ux.plugins.Stateful = {
  init: function(cmp) {
    var complex_cmp = false;
    if (!cmp.name) {
      return;
    }
    var stateEvents = ['select', 'change', 'blur', 'beforedestroy', 'statechanged'];
    cmp.stateData = {};
    if (cmp.getColumnModel) {
      stateEvents.push('resize', 'columnmove', 'hiddenchange', 'columnresize');
      cmp.relayEvents(cmp.getColumnModel(), ['hiddenchange']);
    }
    if (cmp.getStore) {
      cmp.addEvents(['storeloaded']);
      stateEvents.push('storeloaded');
      cmp.getStore().on('load', function(store, data, options){
        if (options && options.params) {
          cmp.stateData.storeOptions = {
            params: options.params,
            sort: store.getSortState()
          };
          cmp.fireEvent('storeloaded');
        }
      });
    }
    if (cmp.getView) {
      complex_cmp = true;
      stateEvents.push('mousedown');
    }
    Ext.apply(cmp, {
      stateful: true,
      stateId: (cmp.statePrefix?(cmp.statePrefix+'_'):'') + cmp.name + (cmp.stateSuffix?('_'+cmp.stateSuffix):''),
      stateEvents: stateEvents,
      getState: this.getState,
      applyState: this.applyState,
      _getToolbarsState: this._getToolbarsState
    });
    if (complex_cmp) {
      var toolpanel = null;
      if (cmp.header || cmp.title) {
        toolpanel = cmp;
      } else if (cmp.outerPanel && (cmp.outerPanel.header||cmp.outerPanel.title) ) {
        toolpanel = cmp.outerPanel;
      }
      toolpanel.tools = toolpanel.tools||[];
      toolpanel.tools.push({
        id: 'refresh',
        handler: this.clearState,
        scope: cmp,
        qtip: 'Очистить параметры отображения (используйте в случае, если хотите сбросить вид к изначальному)'
      });
    }
    cmp.on('beforestatesave', this.onBeforeStateSave)
  },
  getState: function() {
    if (this.stateClear) {
      return null;
    }
    var state = {
      savedAt: (new Date()).getTime()
    };
    if (this.getValue) {
      state.value = this.getValue();
    } else if (this.getValues) {
      state.value = this.getValues();
    }
    if (this.getColumnModel) {
      state.columns = [];
      this.getColumnModel().getColumnsBy(function(c){
        if (!c) {
          return;
        }
        state.columns.push({
          hidden: !!c.hidden,
          width: c.width,
          id: c.id
        });
      });
    }
    if (this.getView) {
      var el = this.getView().scroller;
      state.scroll = el?el.getScroll():undefined;
    }
    if (this.stateData.storeOptions) {
      state.store = this.stateData.storeOptions;
    }
    this._getToolbarsState(state);
    return state;
  },
  _getToolbarsState: function(state) {
    if (!this.getTopToolbar) {
      return;
    }
    var bar = this.getTopToolbar();
    if (!bar || !bar.getValues) {
      return;
    }
    state.toolbars = {};
    state.toolbars[bar.name||bar.xtype] = bar.getValues();
  },
  applyState: function(state) {
    if (!state) {
      return;
    }
    var i;
    var now = (new Date()).getTime();
    if (state.savedAt && state.savedAt+24*60*60*1000<now) {
      // данные сохранялись давно, чистим автоматом
      return;
    }
    this.onRestoreState = true;
    if (state.value) {
      this.value = state.value;
      if (this.setValue) {
        this.setValue(this.value);
      } else if (this.setValues) {
        this.setValues(this.value);
      }
    }
    if (state.columns && state.columns.length && this.getColumnModel) {
      var columns = this.getColumnModel();
      var n = -1;
      this.suspendEvents(false);
      var positions = [];
      var cur_positions = [];
      columns.getColumnsBy(function(c){
        n++;
        if (!c) {
          return;
        }
        for (var i=0; i<state.columns.length; i++) {
          if (state.columns[i].id != c.id) {
            continue;
          }
          positions[i] = n;
          columns.setColumnWidth(n, state.columns[i].width);
          columns.setHidden(n, state.columns[i].hidden);
          break;
        }
      });
      for (i=0; i<positions.length; i++) {
        cur_positions[i]=i;
      }
      for (i=0; i<positions.length; i++) {
        if (positions[i]!=cur_positions[i]) {
          var oldindex = false;
          for (var j=i; j<cur_positions.length; j++) {
            if (cur_positions[j]==positions[i]) {
              oldindex = j;
              break;
            }
          }
          if (!oldindex) {
            break;
          }
          for (j=i+1; j<=oldindex; j++) {
            cur_positions[j] = cur_positions[j-1];
          }
          cur_positions[i] = positions[i];
          columns.moveColumn(oldindex, i);
        }
      }
      this.resumeEvents();
    }
    if (state.toolbars && this.getTopToolbar) {
      var bar = this.getTopToolbar();
      if (bar && bar.setValues && state.toolbars[bar.name||bar.xtype]) {
        bar.setValues(state.toolbars[bar.name||bar.xtype]);
      }
    }
    if (this.getStore && state.store) {
      var store = this.getStore();
      if (state.store.params) {
        for (i in state.store.params) {
          if (!state.store.params.hasOwnProperty(i)) {
            continue;
          }
          store.setBaseParam(i, state.store.params[i]);
        }
      }
      if (state.store.sort) {
        store.sortInfo = state.store.sort;
      }
    }
    if (state.scroll && this.getView) {
      function doScroll() {
        var el = this.getView().scroller;
        if (el) {
          el.scrollTo('top', state.scroll.top);
          el.scrollTo('left', state.scroll.left);
        }
      }
      if (this.getStore) {
        this.getStore().on('load', function(){doScroll.defer(100, this)}, this, {single: true});
      } else {
        doScroll.defer(100, this);
      }
    }
    this.onRestoreState = false;
  },
  onBeforeStateSave: function(cmp){
    if (cmp.onRestoreState) {
      return false;
    }
    return true;
  },
  clearState: function() {
    this.stateClear = true;
    this.on('statesave', function(){
      Ext.defer(function(){
        window.location.reload();
      }, 500);
    });
    this.fireEvent('statechanged', this);
  }
};
