/**
 * Компонент, который строит редактируемый грид ролей
 *
 * Параметры:
 *   нету
 *
 * Евенты:
 *   roleselected(id, record, store) [OUT]
 *     Выстреливает когда юзер кликнул по роли в гриде, отличающейся от ранее выбранной
 *     id: ид роли
 *     record: роль целиком
 *     store: стор с ролями
 *
 */

Ext.define('Application.components.rolesGrid', {
  extend: 'Ext.grid.Panel',
  editable: true,
  autoHeight: true,
  frame: true,
  border: false,
  stripeRows: true,
  initComponent: function() {
    var component = this;

    var store = getRolesStore();

    this.addEvents('roleselected');

    Ext.apply(this, {
      loadMask: true,
      store: store,
      lastSelectedId: -1,
      viewConfig: {
        forceFit: true
      },
      columns: [
        {header: '#', dataIndex: 'id', width: 20, hidden: true, sortable: true},
        {header: 'Роль', dataIndex: 'name', width: 60, editor: Ext.ux.helpers.textEdit(), flex: 1, sortable: true},
        {header: 'Код', dataIndex: 'code', width: 20, editor: Ext.ux.helpers.textEdit(), sortable: true, hidden: !this.editable},
        {header: 'Пользовательская роль', dataIndex: 'user_role', width: 20, xtype: 'checkcolumn', sortable: true, hidden: !this.editable},
        {header: 'Операторская роль', dataIndex: 'operator_role', width: 20, xtype: 'checkcolumn', sortable: true, hidden: !this.editable},
        {header: 'Заказщицкая роль', dataIndex: 'customer_role', width: 20, xtype: 'checkcolumn', sortable: true, hidden: !this.editable},
        {header: 'Поставщицкая роль', dataIndex: 'supplier_role', width: 20, xtype: 'checkcolumn', sortable: true, hidden: !this.editable},
        {header: 'Актуальна', dataIndex: 'actual', width: 20, xtype: 'checkcolumn', sortable: true, hidden: !this.editable},
        {header: 'Операции', xtype: 'textactioncolumn', width: 20, hidden: !this.editable,
           items: [{
             icon: '/ico/delete.png',
             tooltip: 'Удалить',
             handler: function(grid, rowIndex) {
               var store = grid.getStore();
               var record = store.getAt(rowIndex);
               if (record.id<=2) {
                 return;
               }
               store.removeAt(rowIndex);
             },
             isHidden: function(v, meta, rec) {
               return (rec.id<=2);
             }
           }]
        }
      ],
      tbar: [{
        iconCls: 'icon-silk-add',
        text: 'Создать роль',
        hidden: !this.editable,
        handler: function(){
          var record = new store.recordType({
            id: null,
            name: 'Новая роль',
            actual: true
          });
          store.insert(0, record);
          component.startEditing(0,1);
        }
      }],
      bbar: [{
        cls:'x-btn-text-icon',
        hidden: !this.editable,
        icon: 'ico/database_save.png',
        text: 'Сохранить',
        handler: function(){
          store.save();
        }
      }, {
        cls:'x-btn-text-icon',
        hidden: !this.editable,
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
        rowclick: function(grid, rowIndex) {
          var store = grid.getStore();
          var record = store.getAt(rowIndex);
          if (record && record.id != grid.lastSelectedId) {
            grid.lastSelectedId = record.id;
            this.fireEvent('roleselected', record.id, record, store);
          }
        }
      }
    });
    if (!this.editable) {
      this.selModel = new Ext.grid.RowSelectionModel({singleSelect: true});
      for (var i=0; i<this.columns.length; i++) {
        if (this.columns[i].editor) {
          delete this.columns[i].editor;
        }
      }
    }
    Application.components.rolesGrid.superclass.initComponent.call(this);
  }
});
