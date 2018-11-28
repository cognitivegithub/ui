/**
 * Компонент выводит грид шаблонов документов.
 * Параметры:
 */
Ext.define('Application.components.BankAccountGrid', {
  extend: 'Ext.grid.Panel',
  frame: true,
  border: false,
  initComponent: function() {
    var component = this;

    var store = createBankAccountStore();
    var cols = [
      {id: 'id', header: 'ID', width: 50, dataIndex: 'id'},
      {header: 'Название банка', dataIndex: 'bank'},
      {header: 'ИНН', dataIndex: 'inn'},
      {header: 'КПП', dataIndex: 'kpp'},
      {header: 'БИК', dataIndex: 'bik'},
      {header: 'Статус', width: 40, xtype: 'textactioncolumn', sortable: false,
        items: [
          {
            tooltip: 'Неактивен',
            icon: '/ico/stop.png',
            handler: function (grid, rowIndex) {
              if (!(isAdmin())) {
                return;
              }

              bank = store.getAt(rowIndex);
              component.changeActiveBankAccount(bank.id, 'Включить банк?')
            },
            isHidden: function(v, meta, rec) {
              return (rec.data.actual == true);
            }
          }, {
            tooltip: 'Активен',
            icon: '/ico/accept.png',
            handler: function (grid, rowIndex) {
              if (!(isAdmin())) {
                return;
              }

              bank = store.getAt(rowIndex);
              component.changeActiveBankAccount(bank.id, 'Вы уверены, что хотите изменить статус банка?')
            },
            isHidden: function(v, meta, rec) {
              return !(rec.data.actual == true);
            }
          }
        ]
      },
      {header: 'Операции', width: 100, xtype: 'textactioncolumn', actionsSeparator: ' ', sortable: false,
        items: [
          {
            tooltip: 'Редктировать',
            icon: '/ico/edit.png',
            handler: redirectActionHandler('bankaccount/edit/id/{id}'),
            isHidden: function () {
              return !(isAdmin());
            }
          }, {
            tooltip: 'Удалить',
            icon: '/ico/delete.png',
            handler: function (grid, rowIndex) {
              bank = store.getAt(rowIndex);
              component.removeBankAccount(bank.id);
            },
            isHidden: function () {
              return !(isAdmin());
            }
          }
        ]
      }
    ];

    Ext.apply(this,
    {
      store: store,
      viewConfig: {
        forceFit: true
      },
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: cols,
        listeners: {
          render: function () {
            this.fireEvent('search');
            user_roles_store.load();
          }
        },
        getAt: function(rowIndex) {
          return this.getStore().getAt(rowIndex);
        }
      }),
      bbar: this.getBottomToolbarConfig(store)
    });

    Application.components.BankAccountGrid.superclass.initComponent.call(this);
  },

  getBottomToolbarConfig: function (store) {
    var limit = 50;
    var pagingToolbar = renderPagingToolbar('Банки', store, limit, ['-', {}], true);
    var addButton = function(title, icon, functionHandler) {
      pagingToolbar.items.push('-');
      pagingToolbar.items.push({
        text: title,
        cls: 'x-btn-text-icon',
        icon: icon,
        handler: functionHandler,
        scope: this
      });
    };
    addButton('Добавить банк', '/ico/add.png', function() {
      redirect_to('bankaccount/add');
    });

    return pagingToolbar;
  },

  removeBankAccount: function (bankId) {
    var component = this;
    Ext.Msg.confirm('Удаление', 'Вы уверены, что точно хотите удалить этот Банк?', function (btn) {
      if ('yes' == btn) {
        var params = {
          mask: true,
          wait_text: 'Удаляется банк'
        };
        performRPCCall(RPC.Bankaccount.remove, [{id: bankId}], params, function (resp) {
          if (resp.success) {
            Ext.MessageBox.alert('', resp.message);
            component.store.reload();
          } else {
            echoResponseMessage(resp);
            if (typeof resp.queryMessage != 'undefined') {
              component.changeActiveBankAccount(bankId, resp.message + '<br>' + resp.queryMessage, false);
            }
          }
        });
      }
    });
  },

  changeActiveBankAccount: function (bankId, message, isActive) {
    var component = this;
    Ext.Msg.confirm('Внимание!', message, function (btn) {
      if ('yes' == btn) {
        var params = {
          mask: true,
          wait_text: 'Изменение статуса банка'
        };
        performRPCCall(RPC.Bankaccount.changeActual, [{id: bankId, isActive: isActive}], params, function (resp) {
          if (resp.success) {
            Ext.MessageBox.alert('', resp.message);
            component.store.reload();
          } else {
            echoResponseMessage(resp);
          }
        });
      }
    });
  }
});
