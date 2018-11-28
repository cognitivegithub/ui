Ext.define('Application.components.DocumentTypesGrid', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  editable: true,
  initComponent: function () {
    var component = this,
      store = createFileTypesStore();

    var saveHandler = function (currentStore) {
      Ext.Msg.show({
        title: 'Успех',
        msg: 'Данные сохранены',
        buttons: Ext.Msg.OK
      });
    };

    store.on('save', saveHandler);

    Ext.apply(this,
      {
        listeners: {
          destroy: function() {
            store.un('save', saveHandler);
          }
        },
        store: store,
        loadMask: true,
        sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
        columns: [
          {
            header: 'ИД',
            dataIndex: 'id',
            width: 20,
            sortable: true
          },
          {
            header: 'Название',
            dataIndex: 'name',
            width: 150,
            sortable: true,
            editor: {
              xtype: 'textfield',
              allowBlank: false
            }
          },
          {
            header: 'Операции',
            xtype: 'textactioncolumn',
            width: 20,
            actionsSeparator: ' ',
            items: [
              // Не выводим кнопку редактирования. Редактирование - через двойной клик.
              // {
              //   tooltip: 'Редактировать',
              //   icon: '/ico/edit.png',
              //   text: '',
              //   pseudo: 'company/edit',
              //   scope: 'item',
              //   handler: function (grid, rowIndex) {
              //     component.startEditing(rowIndex, 1);
              //   }
              // },
              {
                tooltip: 'Удалить',
                icon: '/ico/delete.png',
                text: '',
                handler: function (grid, rowIndex) {
                  Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите удалить тип документа?', function (r) {
                    if ('yes' == r) {
                      grid.getStore().removeAt(rowIndex);
                    }
                  });
                },
                isHidden: function (v, meta, rec) {
                  return rec.get('use_count') > 0;
                }
              },
              {
                tooltip: 'Невозможно удалить. Тип документа уже используется.',
                icon: '/ico/delete_disabled.png',
                text: '',
                isHidden: function (v, meta, rec) {
                  return rec.get('use_count') == 0 || rec.get('id') == null;
                }
              }
            ]
          }
        ],
        viewConfig: {
          forceFit: true
        },
        tbar: {
          items: [
            {
              iconCls: 'icon-silk-add',
              text: 'Добавить',
              handler: function () {
                var record = new store.recordType({
                  id: null
                });
                store.insert(0, record);
                component.startEditing(0, 1);
              }
            }, {
              xtype: 'tbspacer',
              width: 5
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
            }
          ]
        },
        bbar: {
          items: [
            {
              text: 'Сохранить',
              id: 'dtSaveButton',
              cls: 'x-btn-text-icon',
              icon: 'ico/database_save.png',
              handler: function () {
                var allNamesCorrect = true;

                Ext.each(store.getModifiedRecords(), function (r) {
                  if (r.get('name') == null) {
                    allNamesCorrect = false;
                  }
                });

                if (allNamesCorrect) {
                  store.save();
                } else {
                  Ext.Msg.show({
                    title: 'Ошибка',
                    msg: 'Не все названия типов документа заполнены',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                  });
                }
              }
            }, {
              text: 'Отменить',
              id: 'dtCancelButton',
              cls: 'x-btn-text-icon',
              icon: 'ico/undo.png',
              handler: function () {
                Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите отменить все изменения?', function (r) {
                  if ('yes' == r) {
                    rejectStoreChanges(store);
                  }
                });
              }
            }
          ]
        }
      }
    );

    Application.components.DocumentTypesGrid.superclass.initComponent.call(this);
  }
});
