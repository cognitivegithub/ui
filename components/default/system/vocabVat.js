/**
 * Управление справочником НДС
 */
Ext.define('Application.components.vocabVat', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  editable: true,
  stripeRows: true,
  sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
  loadMask: true,
  viewConfig: {
    forceFit: true
  },
  initComponent: function () {
    var store = createVocabVatStorage(),
      component = this;

    Ext.apply(this, {
      store: store,
      tbar: {
        items: [{
          iconCls: 'icon-silk-add',
          text: 'Добавить',
          handler: function () {
            var record = new store.recordType({
              id: null
            });
            store.insert(0, record);
            component.startEditing(0, 0);
          }
        }, {
          xtype: 'tbspacer', width: 5
        }, {
          text: 'Обновить',
          iconCls: 'x-tbar-loading',
          handler: function () {
            if (store.getModifiedRecords().length > 0) {
              Ext.Msg.confirm('Подтверждение', 'Обновление приведет к потере модифицированных данных, продолжить?',
                function (r) {
                  if ('yes' === r) {
                    store.reload();
                  }
              });
            } else {
              store.reload();
            }
          }
        }]
      },
      bbar: {
        items: [
          new Ext.PagingToolbar({
            pageSize: 50,
            store: store,
            displayInfo: true,
            displayMsg: 'Записи {0} - {1} из {2}',
            emptyMsg: 'Список пуст',
            listeners: {
              afterrender: function () {
                this.refresh.hide();
              }
            }
          }),
          {
            text: 'Сохранить',
            id: 'saveButton',
            cls: 'x-btn-text-icon',
            icon: 'ico/database_save.png',
            handler: function () {
              store.save();
            }
          }, {
            text: 'Отменить',
            id: 'cancelButton',
            cls: 'x-btn-text-icon',
            icon: 'ico/undo.png',
            handler: function () {
              Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите отменить все изменения?', function (r) {
                if ('yes' === r) {
                  rejectStoreChanges(store);
                }
              });
            }
          }]
      },
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {
            header: 'Наименование',
            dataIndex: 'name',
            width: 40,
            editor: {
              xtype: 'textfield',
              allowBlank: false,
              storeValueField: 'name'
            }
          },
          {
            header: 'Значение',
            dataIndex: 'value',
            width: 200,
            editor: {
              xtype: 'textfield',
              allowBlank: false,
              storeValueField: 'value'
            }
          },
          {
            header: 'Операции',
            xtype: 'textactioncolumn',
            width: 10,
            actionsSeparator: ' ',
            sortable: false,
            items: [
              {
                tooltip: 'Удалить',
                icon: '/ico/delete.png',
                handler: function (grid, rowIndex) {
                  Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите удалить запись?', function (r) {
                    if ('yes' === r) {
                      grid.getStore().removeAt(rowIndex);
                    }
                  });
                }
              }
            ]
          }
        ]
      })
    });

    Application.components.vocabVat.superclass.initComponent.call(this);
  }
});
