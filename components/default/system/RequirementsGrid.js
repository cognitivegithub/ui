Ext.define('Application.components.RequirementsGrid', {
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
  getRowClass: function (record) {
    if (!record.data.active) {
      return 'x-color-0';
    }
  },
  initComponent: function () {
    var store = createRequirementsStorage(),
      component = this;

    var exceptionHandler = function () {
      component.enableActionButtons();
    };

    store.on('exception', exceptionHandler);

    Ext.apply(this, {
      store: store,
      listeners: {
        destroy: function() {
          store.un('exception', exceptionHandler);
        }
      },
      tbar: {
        items: [{
          iconCls: 'icon-silk-add',
          text: 'Добавить',
          handler: function () {
            redirect_to('requirements/add')
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
          })]
      },
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {
            header: 'id',
            dataIndex: 'id',
            width: 20
          },
          {
            header: 'Наименование',
            dataIndex: 'name',
            width: 200
          },
          {
            header: 'Код',
            dataIndex: 'code',
            width: 40
          },
          {
            header: 'Активно',
            dataIndex: 'actual',
            width: 40,
            renderer: function (value) {
              if (value) {
                return 'Да';
              }
              return 'Нет';
            }
          },
          {
            header: 'Кол-во вариаций',
            dataIndex: 'count',
            width: 40
          },
          {
            header: 'Операции',
            xtype: 'textactioncolumn',
            width: 20,
            actionsSeparator: ' ',
            sortable: false,
            items: [
              {
                tooltip: 'Редактировать',
                icon: '/ico/edit.png',
                href: hrefAction('/requirements/edit/id/{id}'),
                text: ''
              },
              {
                tooltip: 'Удалить',
                icon: '/ico/delete.png',
                isHidden: function(r, v, d) {
                  if (d && d.data) {
                    return !d.data.actual
                  }
                  return false;
                },
                handler: function (grid, rowIndex) {
                  Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите удалить запись?', function (r) {
                    if ('yes' == r) {
                      var data = grid.getStore().getAt(rowIndex);
                      performRPCCall(RPC.Requirements.remove, [{id: data.id}], {}, function(resp) {
                        if (resp && resp.success) {
                          Ext.MessageBox.alert('Успех', 'Требование неактивно');
                          store.reload();
                          component.disableActionButtons();
                        } else {
                          Ext.MessageBox.alert('Ошибка', resp.message.join('</br>'));
                        }
                      });
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