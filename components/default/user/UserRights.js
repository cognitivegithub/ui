/**
 * Компонент, который строит редактируемый грид прав пользователей
 *
 * Параметры:
 *   user_id - идентификатор пользователя (обязательный параметр)
 *   grid_only - отображать только грид (необязательный параметр, по умолчанию он равен false)
 *   id - айди компонента (необязательный параметр, по умолчанию он равен Ext.id()
 *
 * Евенты:
 *   roleselected(id, record, store) [OUT]
 *     Выстреливает когда юзер кликнул по роли в гриде, отличающейся от ранее выбранной
 *     id: ид роли
 *     record: роль целиком
 *     store: стор с ролями
 *
 */

Ext.define('Application.components.UserRights', {
  extend: 'Ext.grid.Panel',
  editable: true,
  autoHeight: true,
  frame: true,
  border: false,
  initComponent: function() {
    var component = this;
    if (!component.grid_only) component.grid_only = false;
    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: true,
      api: {
        read    : RPC.User.rightsIndex,
        create  : RPC.User.rightsUpdate,
        update  : RPC.User.rightsUpdate
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : false}),
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      root: 'roles',
      baseParams: {
        user_id: component.user_id
      },
      fields: ['id', 'name', 'actual'],
      sortInfo: {
        field: 'name',
        direction: 'ASC'
      },
      listeners: {
        load: function(store) {
          var view = component.getView();
          view.refresh();
        },
        exception: storeExceptionHandler,
        update: function(store, record) {
          if (component.isAdmin()) {
            store.each(function(r) {
              if (r.data.id < 4) {
                r.set('actual', false);
              }
            });
          }
          var view = component.getView();
          view.refresh();
        }
      }
    });


    this.addEvents('roleselected');

    Ext.apply(this, {
      loadMask: true,
      frame: !component.grid_only,
      title: (component.grid_only) ? '' : 'Список ролей',
      store: store,
      lastSelectedId: -1,
      id: (component.id) ? component.id : Ext.id(),
      viewConfig: {
        forceFit: true,
        getRowClass : function(record){
          if (component.isAdmin() && record.data.id < 4) {
            record.dirty = false;
            return 'x-color-0';
          }
          return 'x-color-1';
        }
      },
      columns: [
        {header: '#', dataIndex: 'id', width: 20, hidden: true, sortable: true},
        {header: 'Роль', dataIndex: 'name', flex: 1, sortable: true},
        {header: 'Актуальна', dataIndex: 'actual', width: 20, xtype: 'checkcolumn', sortable: true, editable: isAdmin()}
      ],
      bbar: new Ext.Toolbar({
        hidden: component.grid_only,
        items: [{
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
            var view = component.getView();
            view.refresh();
          }
        }, '->', {
          iconCls: 'x-tbar-loading',
          handler: function() {
            store.reload();
          }
        }]
      }),
      listeners: {
        rowclick: function(grid, rowIndex) {
          var store = grid.getStore();
          var record = store.getAt(rowIndex);
          if (record && record.id != grid.lastSelectedId) {
            grid.lastSelectedId = record.id;
            this.fireEvent('roleselected', record.id, record, store);
          }
        }
      },
      isAdmin: function() {
        var is_admin = false;
        store.each(function(r) {
          if (r.data.id == 4 || r.data.id == 5) {
            if (r.data.actual == true) {
              is_admin = true;
            }
          }
        });
        return is_admin;
      }
    });
    Application.components.UserRights.superclass.initComponent.call(this);
  }
});
