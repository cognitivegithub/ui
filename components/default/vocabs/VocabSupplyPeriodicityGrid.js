
Ext.define('Application.components.VocabSupplyPeriodicityGrid', {
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
    var storeParams = {'isActual' : 1};
    var store = createVocabSupplyPeriodicityStore(storeParams),
      component = this;

    var updateHandler = function (currentStore) {
      var hasEmpty = false;

      Ext.each(currentStore.getRange(), function(rec) {
        if (!Ext.util.Format.trim(rec.data.name)) {
          hasEmpty = true;
        }
      });
      if (currentStore.getModifiedRecords().length > 0 && !hasEmpty) {
        component.enableActionButtons();
      }
      if (hasEmpty) {
        component.disableActionButtons();
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
              id: null,
              actual: true
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
              Ext.Msg.confirm(
                'Подтверждение',
                'Обновление приведет к потере модифицированных данных, продолжить?',
                function (r) {
                  if ('yes' == r) {
                    store.reload();
                    component.disableActionButtons();
                  }
                }
              );
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
            id: 'evalCriteriaSaveButton',
            cls: 'x-btn-text-icon',
            icon: 'ico/database_save.png',
            handler: function () {

              store.save();
              component.disableActionButtons();
            }
          }, {
            disabled: true,
            text: 'Отменить',
            id: 'evalCriteriaCancelButton',
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
            header: 'Периодичность',
            dataIndex: 'name',
            editor: {
              xtype: 'textfield',
              allowBlank: false
            }
          },
          {
            header: 'Актуальность',
            dataIndex: 'actual',
            width: 20,
            hidden: true,
            editor: {
              xtype: 'combo',
              store: component.getActualityStore(),
              triggerAction: 'all',
              displayField: 'actual_name',
              valueField: 'actual',
              mode: 'local',
              editable: true,
              allowBlank: false
            },
            renderer: function (value) {
              return value ? 'Актуальна' : 'Не актуальна';
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
              // }
              {
                tooltip: 'Удалить',
                icon: '/ico/delete.png',
                handler: function (grid, rowIndex) {
                  var record = grid.getStore().getAt(rowIndex);
                  component.disableRecord(record.id);
                }
              }
            ]
          }
        ]
      }),
      disableRecord: function(id) {
        var params = {rows:[{id: id, actual: false}]};
        performRPCCall(RPC.Periodicity.edit, [params], {wait_text: 'Удаляется, подождите...'}, function(response) {
            if (response.success) {
              component.store.reload();
            } else {
              Ext.Msg.alert('Ошибка', 'При удалении произошла ошибка.');
            }
          }
        );
      }
    });

    Application.components.VocabSupplyPeriodicityGrid.superclass.initComponent.call(this);
  },
  disableActionButtons: function () {
    Ext.each(this.getBottomToolbar().find('id', 'evalCriteriaSaveButton'), function (item) {
      item.disable();
    });
    Ext.each(this.getBottomToolbar().find('id', 'evalCriteriaCancelButton'), function (item) {
      item.disable();
    });
  },
  enableActionButtons: function () {
    Ext.each(this.getBottomToolbar().find('id', 'evalCriteriaSaveButton'), function (item) {
      item.enable();
    });
    Ext.each(this.getBottomToolbar().find('id', 'evalCriteriaCancelButton'), function (item) {
      item.enable();
    });
  },
  getActualityStore: function () {
    return new Ext.data.ArrayStore({
      autoDestroy: true,
      fields: ['actual', 'actual_name'],
      idIndex: 0,
      data: [
        [true, 'Актуальна'],
        [false, 'Не актуальна']
      ]
    });
  }
});
