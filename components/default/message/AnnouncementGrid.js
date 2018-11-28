Ext.define('Application.components.announcementGrid', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  editable: false,
  stripeRows: true,
  sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
  loadMask: true,
  viewConfig: {
    forceFit: true
  },
  initComponent: function () {
    var component = this;

    var store = createMessageStorage(component.userId);

    Ext.apply(this, {
      store: store,
      tbar: {
        items: [{
          iconCls: 'icon-silk-add',
          text: 'Добавить',
          handler: function () {
            redirect_to('message/add')
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
          })
        ]
      },
      colModel: new Ext.grid.ColumnModel({
        renderTo: Ext.getBody(),
        defaults: {
          sortable: true
        },
        columns: [{
          header: 'Сообщение',
          dataIndex: 'content',
          width: 140
        }, {
          header: 'Дата начала вывода сообщения',
          dataIndex: 'date_start',
          renderer: component.dateStartRenderer,
          width: 40
        }, {
          header: 'Дата окончания вывода сообщения',
          dataIndex: 'date_end',
          renderer: component.dateEndRenderer,
          width: 40
        }, {
          header: 'Видимость сообщения',
          dataIndex: 'type',
          renderer: component.typeRenderer,
          width: 40
        }, {
          header: 'Уведомляемое подразделение/пользователь',
          dataIndex: 'object_name',
          renderer: component.notifiedObjectNameRenderer,
          width: 80
        }, {
          header: 'Операции',
          xtype: 'textactioncolumn',
          width: 20,
          actionsSeparator: ' ',
          sortable: false,
          items: [
            {
              tooltip: 'Редактировать',
              icon: '/ico/edit.png',
              href: hrefAction('/message/edit/id/{id}'),
              text: ''
            },
            {
              tooltip: 'Удалить',
              icon: '/ico/delete.png',
              handler: function (grid, rowIndex) {
                Ext.Msg.confirm('Подтверждение', 'Вы уверены, что хотите удалить запись?', function (r) {
                  if ('yes' == r) {
                    var data = grid.getStore().getAt(rowIndex);
                    performRPCCall(RPC.Message.remove, [{id: data.id}], {}, function(resp) {
                      if (resp && resp.success) {
                        Ext.MessageBox.alert('Успех', 'Сообщение удалено');
                        store.reload();
                      } else {
                        Ext.MessageBox.alert('Ошибка', resp.message);
                      }
                    });
                  }
                });
              }
            }
          ]
        }]
      })
    });

    Application.components.announcementGrid.superclass.initComponent.call(this);
  },
  dateStartRenderer: function(v, m, r) {
    var dateStart =  v ? v : (r.data.date_edit ? r.data.date_edit : r.data.date_add);
    return Ext.util.Format.date(parseDate(dateStart), 'd.m.Y H:i');
  },
  dateEndRenderer: function(v) {
    return (!v) ? 'Бессрочно' : Ext.util.Format.date(parseDate(v), 'd.m.Y H:i');
  },
  typeRenderer: function(v) {
    switch (v) {
      case 'ALL':
        return 'Всем пользователям';
      case 'DEPARTMENT':
        return 'Подразделению';
      case 'PERSONAL':
        return 'Пользователю';
      default:
        return '—';
    }
  },
  notifiedObjectNameRenderer: function(v, m, r) {
    switch (r.data.type) {
      case 'DEPARTMENT':
        return r.data.department_name;
      case 'PERSONAL':
        return r.data.user_fio;
      default:
        return '—';
    }
  }
});
