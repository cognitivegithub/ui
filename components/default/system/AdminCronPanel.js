
Ext.define('Application.components.AdminCronPanel', {
  extend        : 'Ext.grid.Panel',
  frame         : true,
  border        : false,
  autoHeight    : true,
  initComponent: function() {

    var loaded = false;
    var autoupdate_id = Ext.id();
    var store = new Ext.data.DirectStore({
      directFn: RPC.Admin.cronStats,
      root: 'crons',
      idProperty: 'name',
      autoLoad: true,
      fields: ['name', 'descr', 'rate', 'last_run', 'last_success', 'warn_interval', 'module'],
      listeners: {
        load: function() {
          loaded = true;
        }
      }
    });

    var linkRenderer = function (v, meta, record) {
      var url = '/cron/' + v;
      if(record.data.module != ''){
        url = '/' + record.data.module + url;
      }
      return '<a href="' + url + '" target="_blank">' + v + '</a>';
    };

    var lastRunRenderer = function(v) {
      if (!v || 0==v.length) {
        return 'Никогда';
      }
      var format = function(v) {
        var date = parseDate(v.date);
        date = date?Ext.util.Format.localDateRenderer(date):'?';

        var text = 'Сбой в '+date;
        var alt_text = ' '+date;
        var icon = '/images/icons/silk/stop.png';
        if (true===v.status) {
          text = 'Успех в '+date+'<br/>\n';
          alt_text = ' '+date+'<br/>\n'+
                     'Время работы: '+(v.duration||'?')+'<br/>\n'+
                     'Результат: '+(v.message||'?');
          icon = '/images/icons/silk/tick.png';
        }
        if (null===v.status) {
          text = 'Выполняется с '+date;
          alt_text = '';
          icon = '/images/icons/silk/information.png';
        }
        return '<img alt="'+text+'" ext:qtip="'+text+'" src="'+icon+'" />'+alt_text;
      }
      if (!Ext.isArray(v)) {
        return format(v);
      }
      if (v.length==1 || true===v[0].status) {
        return format(v[0]);
      }
      return format(v[1])+'<br/>\n'+format(v[0]);
    }

    var lastSuccessRenderer = function(v, m, r) {
      v = parseDate(v);
      var result = 'Никогда';
      var warn = true;
      if (v) {
        result = Ext.util.Format.formatInterval(Math.abs(now().getTime()-v.getTime()), {isMs: true, langCase: 'nominative'});
        if (!r.data.warn_interval || Math.abs(now().getTime()-v.getTime())/1000 < r.data.warn_interval ) {
          warn = false;
        }
      }
      if (warn) {
        result = '<span class="red">'+result+'</span>';
      }
      return result;
    }

    var updateTask = {
      interval: 10000,
      scope: this,
      run: function() {
        if (this.isDestroyed || this.destroying) {
          Ext.TaskMgr.stop(updateTask);
          return;
        }
        if (loaded) {
          loaded = false;
          store.reload();
        }
      }
    };

    Ext.apply(this, {
      store: store,
      columns: [
        {header: 'Ссылка', dataIndex: 'name', renderer: linkRenderer, width: 60},
        {header: 'Описание', dataIndex: 'descr'},
        {header: 'Рекомендуемая периодичность запуска', dataIndex: 'rate', width: 35},
        {header: 'Последний запуск', dataIndex: 'last_run', renderer: lastRunRenderer},
        {header: 'Последний успех', dataIndex: 'last_success', renderer: lastSuccessRenderer, width: 70}
      ],
      viewConfig: {
        forceFit: true
      },
      loadMask: true,
      bbar: [{
        text: 'Обновить',
        handler: function() {
          if (Ext.getCmp(autoupdate_id).getValue()) {
            Ext.TaskMgr.stop(updateTask);
            Ext.TaskMgr.start(updateTask);
          } else {
            if (loaded) {
              loaded = false;
              store.reload();
            }
          }
        }
      }, '->', {
        xtype: 'checkbox',
        hideLabel: true,
        boxLabel: 'Автообновление',
        id: autoupdate_id,
        checked: true,
        listeners: {
          check: function(cb, status) {
            if (status) {
              Ext.TaskMgr.start(updateTask);
            } else {
              Ext.TaskMgr.stop(updateTask);
            }
          }
        }
      }]
    });
    Application.components.AdminCronPanel.superclass.initComponent.call(this);
    Ext.TaskMgr.start(updateTask);
    this.on('destroy', function() {
      Ext.TaskMgr.stop(updateTask);
    });
  }
});
