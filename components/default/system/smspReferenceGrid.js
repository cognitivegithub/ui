Ext.define('Application.components.smspReferenceGrid', {
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
    var store = createSmspStorage(),
      component = this;

    var updateHandler = function (currentStore) {
      if (currentStore.getModifiedRecords().length > 0) {
        component.enableActionButtons();
      }
    };

    var removeHandler = function (obj, record) {
      if (record.data.id !== null) {
        component.enableActionButtons();
      }
    };

    var exceptionHandler = function () {
      component.enableActionButtons();
    };

    store.on('save', updateHandler);
    store.on('update', updateHandler);
    store.on('remove', removeHandler);
    store.on('exception', exceptionHandler);

    Ext.apply(this, {
      store: store,
      listeners: {
        destroy: function() {
          store.un('save', updateHandler);
          store.un('update', updateHandler);
          store.un('remove', removeHandler);
          store.un('exception', exceptionHandler);
        }
      },
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
                  component.disableActionButtons();
                }
              });
            } else {
              store.reload();
              component.disableActionButtons();
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
            disabled: true,
            text: 'Сохранить',
            id: 'smspSaveButton',
            cls: 'x-btn-text-icon',
            icon: 'ico/database_save.png',
            handler: function () {
              store.save();
              component.disableActionButtons();
            }
          }, {
            disabled: true,
            text: 'Отменить',
            id: 'smspCancelButton',
            cls: 'x-btn-text-icon',
            icon: 'ico/undo.png',
            handler: function () {
              Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите отменить все изменения?', function (r) {
                if ('yes' == r) {
                  rejectStoreChanges(store);
                  component.disableActionButtons();
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
            header: 'ОКПД2',
            dataIndex: 'okpd2',
            width: 40,
            editor: {
              xtype: 'Application.components.okpd2Field',
              allowBlank: false,
              storeValueField: 'okpd2',
              initComponent: function() {
                this.directFn = RPC.Reference.smspSearch;
                Application.components.okpd2Field.superclass.initComponent.call(this);
              },
              removedOkpd2: [],
              listeners: {
                beforeselect: function (combo, record) {
                  if (component.getStore().query('okpd2_id', record.get('id')).length > 0) {
                    return false;
                  }
                },
                select: function (combo, record) {
                  if (combo.gridEditor.record.get('id') != null) {
                    this.removedOkpd2.push(combo.gridEditor.record.get('okpd2_id'));
                  }

                  combo.gridEditor.record.set('okpd2_id', record.get('id'));
                  combo.gridEditor.record.set('name', record.get('name'));

                  var newOkpd2 = [];

                  Ext.each(component.getStore().getModifiedRecords(), function () {
                    newOkpd2.push(this.get('okpd2_id'));
                  });

                  combo.getStore().setBaseParam('newOkpd2', newOkpd2);
                  combo.getStore().setBaseParam('removedOkpd2', this.removedOkpd2);
                  combo.getStore().remove(record);
                }
              }
            }
          },
          {
            header: 'Наименование',
            dataIndex: 'name',
            width: 200
          },
          {
            header: 'Операции',
            xtype: 'textactioncolumn',
            width: 10,
            actionsSeparator: ' ',
            sortable: false,
            items: [
              {
                tooltip: 'Редактировать',
                icon: '/ico/edit.png',
                handler: function (grid, rowIndex) {
                  component.startEditing(rowIndex, 0);
                }
              },
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
  },
  disableActionButtons: function () {
    Ext.each(this.getBottomToolbar().find('id', 'smspSaveButton'), function (item) {
      item.disable();
    });
    Ext.each(this.getBottomToolbar().find('id', 'smspCancelButton'), function (item) {
      item.disable();
    });
  },
  enableActionButtons: function () {
    Ext.each(this.getBottomToolbar().find('id', 'smspSaveButton'), function (item) {
      item.enable();
    });
    Ext.each(this.getBottomToolbar().find('id', 'smspCancelButton'), function (item) {
      item.enable();
    });
  }
});