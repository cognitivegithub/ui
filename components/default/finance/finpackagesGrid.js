
Ext.define('Application.components.finpackagesGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    component.addEvents('search');
    
    var store = new Ext.data.DirectStore({
      directFn: RPC.Finance.finmaillist,
      paramsAsHash: true,
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        {name:'date_sent', type: 'date', dateFormat: 'c'}, 'id', 'status', 'count'
      ],
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      baseParams: {
        type: 'packages'
      },
      remoteSort: true
    });
    
    function dateSentRenderer(val) {
      var result = val;
      if (!val) {
        result = 'не отправлено';
      } else {
        result = Ext.util.Format.date(val, 'd.m.Y');
      }
      return result;
    }

    function statusRenderer(val, meta, rec) {
      var result = '';
      if (val === 1) {
        result = 'Отправлен';
      } else if (rec.data.count == 30) {
        result = 'Готов';
      } else if (rec.data.count > 0 && rec.data.count < 30) {
        result = 'Формируется';
      } else if (rec.data.count === 0) {
        result = 'Пуст, формируется';
      } else {
        result = 'Переполнен';
      }
      return result;
    }
    
    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {header: "№ списка", dataIndex: 'id',  tooltip: "№ списка", sortable: true, width: 15},
          {header: "Статус", dataIndex: 'status',  tooltip: "Статус", sortable: true, width: 30, renderer: statusRenderer},
          {header: "Число писем", dataIndex: 'count',  tooltip: "Число писем", sortable: true, width: 20},
          {header: "Дата отправки", dataIndex: 'date_sent',  tooltip: "Дата отправки", sortable: true, width: 50, renderer: dateSentRenderer},
          {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', items: [
             {
              text: 'Пометить как неотправленный',
              handler: function(grid, rowIndex) {
                var item = grid.getAt(rowIndex);
                if (item) {
                  performRPCCall(RPC.Finance.marksent, [{ id: item.data.id, unsent: 1 }], {wait_text: 'Меняем статус...'}, function(response) {
                    if (response.success) {
                      store.reload();
                      var mailsstore = component.parent.items.items[1].getStore();
                      mailsstore.reload();
                    } else {
                      alert(response.message);
                    }
                  });
                }
              },
              isHidden: function(v, meta, rec) {
               return !(rec.data.status === 1);
              }
             }, {
              text: 'Пометить как отправленный',
              handler: function(grid, rowIndex) {
                var item = grid.getAt(rowIndex);
                if (item) {
                
                  var win = new Ext.Window({
                    autoHeight: true,
                    width: 400,
                    title: 'Установить дату отправки письма',
                    closeAction: 'close',
                    modal: true,
                    items: [
                      new Ext.FormPanel({
                        width: '100%',
                        border: false,
                        autoheight: true,
                        frame: true,
                        labelWidth: 200,
                        items: [{
                          xtype: 'datefield',
                          id: 'date_packet_sent',
                          name: 'date_packet_sent',
                          fieldLabel: 'Дата фактической отправки'
                        }],
                        buttons: [
                          {
                            xtype: 'button',
                            text: 'Установить дату',
                            handler: function() {
                              var dt = new Date(Ext.getCmp('date_packet_sent').getValue());
                              var params = {date: dt.format('c'), 'id': item.data.id};
                              performRPCCall(RPC.Finance.marksent, [params], {wait_text: 'Меняем статус...'}, function(response) {
                                if (response.success) {
                                  store.reload();
                                  var mailsstore = component.parent.items.items[1].getStore();
                                  mailsstore.reload();
                                } else {
                                  alert(response.message);
                                }
                                win.close();
                              });
                            }
                          },
                          {
                            xtype: 'button',
                            text: 'Отмена',
                            handler: function() {
                              win.close();
                            }
                          }
                        ],
                        listeners: {
                          'render': function() {
                            var d = new Date();
                            Ext.getCmp('date_packet_sent').setValue(d);
                          }
                        }
                      })
                    ]
                  });
                  win.show();                
                }
              },
              isHidden: function(v, meta, rec) {
               return !(rec.data.status !== 1 && rec.data.count <= 30 && 0 < rec.data.count);
              }
             }, {
              text: 'Список&nbsp;в&nbsp;XLS',
              newWindow: true,
              href: function(value, p, record) {
                return String.format('finance/mails/id/{0}', record.get('id'));
              },
              isHidden: function(v, meta, rec) {
               return false;
              }
             }, {
              text: 'Опись&nbsp;вложения',
              newWindow: true,
              href: function(value, p, record) {
                return String.format('finance/packet/id/{0}', record.get('id'));
              },
              isHidden: function(v, meta, rec) {
               return false;
              }
             }
            ]
          }
        ]
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Списки {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Введите номер списка',
        advancedSearch: [{
          xtype: 'dateinterval',
          name: 'date',
          fieldLabel: 'Диапазон дат',
          width: 100
        }, null, {
          xtype: 'textfield',
          fieldLabel: '№ Списка',
          name: 'list_num'
        }],
        itemsAlign: 'right',
        items: [{
          xtype: 'button',
          hideLabel: true,
          text: 'Переформировать списки',
          handler: function(grid, rowIndex) { 
            performRPCCall(RPC.Finance.makemaillist, [], {wait_text: 'Формирование списков...'}, function(response) {
              if (response.success) {
                store.reload();
                var mailsstore = component.parent.items.items[1].getStore();
                mailsstore.reload();
              } else {
                alert(response.message);
              }
            });
          },
          scope: this
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          component.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = component.getStore();
          if (search_params) {
            var sp;
            for (sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('query', query); 
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load();
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }      
    }
    );
    
    Application.components.finpackagesGrid.superclass.initComponent.call(this);    
  }
});
