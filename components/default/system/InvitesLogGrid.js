
 Ext.define('Application.components.InvitesLogGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    this.addEvents('search');
    
    if (!this.procedure_id) {
      this.procedure_id = null;
    }
        
    var store = createInvitesLogStore();
    Ext.apply(this,
    {
      store: store,
      columns: [
        {header: 'ID события', width: 15, dataIndex: 'id', sortable: true},
        {header: 'Дата и время', width: 20, dataIndex: 'date_sent', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s'), sortable: true},
        {header: 'Тема', dataIndex: 'subject', width: 150, sortable: true},
        {header: 'Оператор', dataIndex: 'username', width: 30, sortable: true},
        {header: 'Операции', xtype: 'textactioncolumn', width: 20, actionsSeparator: ' ', items: [
           {
            tooltip: 'Просмотреть',
            icon: '/ico/settings/browse.png',
            handler: function(grid, rowIndex) {
              var row = grid.getAt(rowIndex);
              performRPCCall(RPC.Log.loadinvite, [{ id: row.data.id }], {wait_text: 'Получаем данные'}, function(response) {
                if (response.success) {
                  var inviteWindow = new Ext.Window({
                    closeAction: 'close',
                    width: 700,
                    autoHeight: true,
                    modal: true,
                    title: 'Разосланное приглашение',
                    items: [
                      {
                        xtype: 'Application.components.InviteViewForm',
                        invite_data: response.invite,
                        close_fn: function() {
                          inviteWindow.close();
                        }
                      }
                    ]
                  });
                  inviteWindow.show();
                } else {
                  Ext.Msg.alert('Ошибка', response.message);
                }
              });
            }
           }
        ]}
      ],
      viewConfig: {
        forceFit: true
      },
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по пользователю',
        items: [{          
          text: 'Отправить приглашения',
          iconCls: 'icon-silk-email_go',
          handler: function() {
            redirect_to('com/procedure/sendinvites');
          }
        }, {
          xtype: 'tbspacer', width: 10
        }],
        advancedSearch: [{
          xtype: 'dateinterval',
          name: 'date_range',
          fieldLabel: 'Дата'
        }, {
          xtype: 'textfield',
          name: 'procedure_registry_number',
          fieldLabel: 'Реестровый номер процедуры'
        }]
      },
      bbar: renderPagingToolbar('Записи', store, 50),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('query', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          store.load();
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );

    Application.components.InvitesLogGrid.superclass.initComponent.call(this);
  }
});
