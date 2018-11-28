/**
 * Компонент, который строит редактируемый грид ресурсов
 *
 * Параметры:
 *   type: тип ресурсов. Возможные значения: 'api', 'gui'
 *
 * Евенты:
 *   нету
 */

Ext.define('Application.components.resourcesGrid', {
  extend: 'Ext.grid.Panel',
  editable: true,
  autoHeight: true,
  frame: true,
  border: false,
  type: 'api',
  stripeRows: true,
  initComponent: function() {
    var component = this;

    var store, columns;

    columns = [
        {header: '#', dataIndex: 'id', width: 20, hidden: true, sortable: true}
    ];

    if ('api'==this.type) {
      store = getApiResourcesStore();
      columns.push(
        {header: 'Модуль', dataIndex: 'module', width: 60, editor: Ext.ux.helpers.textEdit(), sortable: true},
        {header: 'Контроллер', dataIndex: 'controller', width: 60, editor: Ext.ux.helpers.textEdit(), sortable: true},
        {header: 'Действие', dataIndex: 'action', width: 60, editor: Ext.ux.helpers.textEdit(), sortable: true}
      );
    } else {
      store = getGuiResourcesStore();
      columns.push({header: 'Адрес', dataIndex: 'url', width: 60, editor: Ext.ux.helpers.textEdit(), sortable: true});
    }

    columns.push({header: 'Описание', dataIndex: 'descr', flex: 1, width: 100, editor: Ext.ux.helpers.textEdit(), sortable: true});

    if ('api'==this.type) {
      columns.push({header: 'Лог', dataIndex: 'log', xtype: 'checkcolumn', width: 20, sortable: true});
    }

    columns.push({header: 'Операции', xtype: 'textactioncolumn', width: 20,
       items: [{
         icon: '/ico/delete.png',
         tooltip: 'Удалить',
         handler: function(grid, rowIndex) {
           grid.getStore().removeAt(rowIndex);
         }
       }]
    });

    function cleanStore(fn) {
      var to_del = [];
      store.clearFilter();
      store.each(function(r){
        if (fn(r)) {
          to_del.push(r);
        } else if (r.deleteWarned) {
          delete r.deleteWarned;
        }
      });
      for (var i=0; i<to_del.length; i++) {
        to_del[i].deleteWarned = true;
      }
      if (to_del.length) {
        component.getView().refresh();
        Ext.Msg.alert('Удаление ресурсов', 'Часть ресурсов ('+to_del.length+') отсутствует в автоматических базах. '+
                                           'Такие ресурсы отмечены в списке цветом. '+
                                           'Если они фактически не существуют, то их следует удалить.');
      }
    }

    function fillGUIResources() {
      var i,j,r,idx,c,m, mname, url;
      cleanStore(function(r){
        var t = (r.data.url||'').split('/');
        var controller='',
        module='defaultModule',
        action = '',
        midx=-1,
        cidx=0,
        aidx=1;
        if (2!=t.length && 3!=t.length) {
          return true;
        } else {
          if(3==t.length) {
            midx = 0;
            cidx = 1;
            aidx = 2;
            module = t[midx]+'Module';
          }

          controller = t[cidx].toLowerCase()+'Controller';
          action = t[aidx].toLowerCase()+'Action';

          controller = controller.charAt(0).toUpperCase()+controller.slice(1);

          if (!Application.controllers[module][controller]
              || !Application.controllers[module][controller].prototype[action]) {
            return true;
          }
        }
        return false;
      });
      for(m in Application.controllers){
        if(m!='Abstract') {
          mname = m.match(/^(.+)Module$/);
          mname = mname[1];
          for (i in Application.controllers[m]) {
            if (!i || !Application.controllers[m].hasOwnProperty(i)) {
              continue;
            }
            c = i.match(/^(.+)Controller$/);
            if (!c) {
              continue;
            }
            c = c[1].toLowerCase();
            for (j in Application.controllers[m][i].prototype) {
              j = j.match(/^(.+)Action$/);
              if (j) {
                j = j[1];
                idx = store.find('url', ((m=='defaultModule') ? c+'/'+j : mname+'/'+c+'/'+j));
                if (idx<0) {
                  r = new store.recordType({
                    id: null,
                    url: ((m=='defaultModule') ? c+'/'+j : mname+'/'+c+'/'+j)
                  });
                  store.insert(0, r);
                }
              }
            }
          }
        }
      }
    }

    function fillStore(rpcObj, moduleName) {
      var i, j, idx, r;
      for (i in rpcObj) {
        if (!rpcObj.hasOwnProperty(i)) {
          continue;
        }
        for (j in rpcObj[i]) {
          if (!rpcObj.hasOwnProperty(i)) {
            continue;
          }
          idx = store.findBy(function(r) {
            return r.data.module==moduleName && r.data.controller === i.toLowerCase() && r.data.action === j;
          });
          if (idx<0) {
            r = new store.recordType({
              id: null,
              module: moduleName,
              controller: i.toLowerCase(),
              action: j
            });
            store.insert(0, r);
          }
        }
      }
    }

    function fillAPIResources() {
      var r;
      cleanStore(function(r){
        var controller = r.data.controller||'';
        var action = r.data.action||'';
        var module = r.data.module||'';
        controller = controller.charAt(0).toUpperCase()+controller.slice(1);
        switch(module) {
          case 'tsn':
            return (!RPC_tsn[controller] || !RPC_tsn[controller][action]);
            break;
          default:
            return (!RPC[controller] || !RPC[controller][action]);
            break;
        }
      });
      fillStore(RPC, 'default');
      if (window.RPC_tsn) {
        fillStore(RPC_tsn, 'tsn');
      }
    }

    Ext.apply(this, {
      loadMask: true,
      title: 'Ресурсы '+this.type.toUpperCase(),
      store: store,
      viewConfig: {
        forceFit: true,
        getRowClass: function(r) {
          if (r.deleteWarned) {
            return 'highlight';
          }
          return '';
        }
      },
      columns: columns,
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        items: [{
          iconCls: 'icon-silk-add',
          text: 'Создать ресурс',
          handler: function(){
            var record = new store.recordType({
              id: null
            });
            store.insert(0, record);
            component.startEditing(0,1);
          }
        }, '-', {
          text: 'Заполнить автоматически',
          handler: ('api'==this.type)?fillAPIResources:fillGUIResources
        }, {
          xtype: 'tbspacer', width: 50
        }]
      },
      bbar: [{
        text: 'Сохранить',
        cls:'x-btn-text-icon',
        icon: 'ico/database_save.png',
        handler: function(){
          store.save();
        }
      }, {
        text: 'Отменить',
        cls:'x-btn-text-icon',
        icon: 'ico/undo.png',
        handler: function(){
          rejectStoreChanges(store);
        }
      }, '->', {
        iconCls: 'x-tbar-loading',
        handler: function() {
          store.reload();
        }
      }],
      listeners: {
        search: function(query) {
          if (!query || ''==query) {
            store.clearFilter();
          } else {
            query = query.toLowerCase();
            store.filterBy(function(record){
              return record.data.url.toLowerCase().indexOf(query)>=0;
            });
          }
        }
      }
    });
    Application.components.resourcesGrid.superclass.initComponent.call(this);
  }
});
