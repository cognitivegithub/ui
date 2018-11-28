
Ext.define('Application.components.menuGrid', {
  extend: 'Ext.grid.Panel',
  editable: true,
  frame: true,
  border: false,
  title: 'Пункты меню',
  stripeRows: true,
  initComponent: function() {
    var component = this;
    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: true,
      api: {
        read    : RPC.Acl.menuIndex,
        create  : RPC.Acl.menuUpdate,
        update  : RPC.Acl.menuUpdate,
        destroy : RPC.Acl.menuDelete
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'menues',
      fields: ['id', 'icon', 'url', 'weight', 'menupath', 'actual']
    });
    var columns = [
      {header: '#', dataIndex: 'id', width: 40, editor: Ext.ux.helpers.numberEdit(), sortable: true, hidden: true},
      {header: 'Нахождение в меню', dataIndex: 'menupath', width: 60, editor: Ext.ux.helpers.textEdit(), sortable: true},
      {header: 'Адрес', dataIndex: 'url', width: 90, editor: Ext.ux.helpers.textEdit(), sortable: true},
      {header: 'Иконка', dataIndex: 'icon', width: 60, editor: Ext.ux.helpers.textEdit(), sortable: true},
      {header: 'Вес в меню', dataIndex: 'weight', width: 40, editor: Ext.ux.helpers.numberEdit(), sortable: true},
      {header: 'Актуальность', dataIndex: 'actual', width: 20, xtype: 'checkcolumn', sortable: true},
      {header: 'Операции', xtype: 'textactioncolumn', width: 20,
       items: [{
         icon: '/ico/delete.png',
         tooltip: 'Удалить',
         handler: function(grid, rowIndex) {
           grid.getStore().removeAt(rowIndex);
         }
       }]
      }
    ];
    Ext.apply(this, {
      loadMask: true,
      store: store,
      columns: columns,
      viewConfig: {
        forceFit: true
      },
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        items: [{
          iconCls: 'icon-silk-add',
          text: 'Создать пункт меню',
          handler: function(){
            var record = new store.recordType({
              id: null,
              weight: 1000,
              actual: true
            });
            store.insert(0, record);
            component.startEditing(0,1);
          }
        }, {
          xtype: 'tbspacer', width: 50
        }]
      },
      bbar: [{
        cls:'x-btn-text-icon',
        icon: 'ico/database_save.png',
        text: 'Сохранить',
        handler: function(){
          store.save();
        }
      }, {
        cls:'x-btn-text-icon',
        icon: 'ico/undo.png',
        text: 'Отменить',
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
              return (record.data.url||'').toLowerCase().indexOf(query)>=0 ||
                     (record.data.menupath||'').toLowerCase().indexOf(query)>=0;
            });
          }
        }
      }
    });
    Application.components.menuGrid.superclass.initComponent.call(this);
  }
});