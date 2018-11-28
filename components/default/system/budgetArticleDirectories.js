Ext.define('Application.components.budgetArticleDirectories', {
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
    var store = createBudgetArticleDirectoriesStorage(),
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
              Ext.Msg.confirm('Подтверждение', 'Обновление приведет к потере модифицированных данных, продолжить?', function (r) {
                if ('yes' == r) {
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
            id: 'smspSaveButton',
            cls: 'x-btn-text-icon',
            icon: 'ico/database_save.png',
            handler: function () {
              store.save();
            }
          }, {
            text: 'Отменить',
            id: 'smspCancelButton',
            cls: 'x-btn-text-icon',
            icon: 'ico/undo.png',
            handler: function () {
              Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите отменить все изменения?', function (r) {
                if ('yes' == r) {
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
            header: 'Статья',
            dataIndex: 'code',
            width: 40,
            editor: {
              xtype: 'textfield',
              allowBlank: false,
              storeValueField: 'code'
            }
          },
          {
            header: 'Наименование',
            dataIndex: 'name',
            width: 200,
            editor: {
              xtype: 'textfield',
              allowBlank: false,
              storeValueField: 'code'
            }
          },
          {
            header: 'Операции',
            xtype: 'textactioncolumn',
            width: 10,
            actionsSeparator: ' ',
            sortable: false,
            items: [
              // Не выводим кнопку редактирования. Редактирование - через двойной клик.
              // {
              //   tooltip: 'Редактировать',
              //   icon: '/ico/edit.png',
              //   handler: function (grid, rowIndex) {
              //     component.startEditing(rowIndex, 0);
              //   }
              // },
              {
                tooltip: 'Удалить',
                icon: '/ico/delete.png',
                handler: function (grid, rowIndex) {
                  Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите удалить запись?', function (r) {
                    if ('yes' == r) {
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

    Application.components.smspReferenceGrid.superclass.initComponent.call(this);
  }
});
