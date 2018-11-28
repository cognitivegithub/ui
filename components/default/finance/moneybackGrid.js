/**
 * Параметры компоненты:
 * parent - родительская панель
 */
Ext.define('Application.components.moneybackGrid', {
  extend: 'Ext.grid.Panel',
  frame : false,
  border : false,
  loadMask: true,
  autoHeight: true,
  initComponent : function () {
    var component = this;
    this.addEvents('search');
    this.addEvents('search_started');
    var store = new Ext.data.DirectStore({
      directFn: RPC.Finance.moneybackapplic,
      paramsAsHash: true,
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        'id', 'contragent_id', 'basis_text', 'sum', 'full_name', 'inn', 'eds',
        {name: 'date_added', type: 'date', dateFormat: 'c'},
        {name: 'date_solved', type: 'date', dateFormat: 'c'},
        {name: 'date_cancelled', type: 'date', dateFormat: 'c'},
        {name: 'date_accepted', type: 'date', dateFormat: 'c'}
      ],
      sortInfo: {
        field: 'id',
        direction: 'DESC'
      },
      remoteSort: true
    });

    var actionLinks = [
     {
       tooltip: 'Платежное поручение',
       icon: 'ico/appl_dover.png',
       handler: function(grid, idx) {
         var store = grid.getStore();
         var r = store.getAt(idx);
         if (!r) {
          return;
         }
         var data_id = Ext.id();
         var data = {
           name: r.data.full_name,
           receiver: r.data.full_name,
           inn: r.data.inn,
           sum: Ext.util.Format.price(r.data.sum, null, 'руб.')
         };
         var win = new Ext.Window({
           title: 'Платежное поручение заявки №'+r.data.id,
           autoHeight: true,
           width: 500,
           items: [{
             id: data_id,
             xtype: 'Application.components.keyValuePanel',
             autoHeight: true,
             border: false,
             noValueText: '<i>[загрузка данных]</i>',
             defaults: {
               border: false,
               bodyCssClass: 'cleanbackground'
             },
             captionCls: 'bold spaced-bottom-shallow width_150px',
             fields: {
               account: 'Л/с на ЭТП',
               name: 'Наименование',
               receiver: 'Получатель платежа',
               inn: 'ИНН',
               kpp: 'КПП',
               bik: 'БИК',
               account_ras: 'Расчетный счет',
               account_lic: 'Лицевой счет',
               account_cor: 'Корреспондентский счет',
               bank: 'Название банка',
               bank_addr: 'Адрес банка',
               sum: 'Сумма возврата'
             },
             values: data
           }],
           buttons: [{
             text: 'Закрыть',
             handler: function() {
               win.close();
             }
           }]
         });
         win.show();
         RPC.Finance.transactionrequestInfo(r.data.id, function(resp){
           if (!resp || !resp.success) {
             echoResponseMessage(resp);
             return;
           }
           var cmp = Ext.getCmp(data_id);
           if (!cmp) {
             return;
           }
           if (resp.contragent) {
             Ext.apply(data, resp.contragent);
           }
           cmp.loadData(data);
           win.syncSize();
         });
       }
     },
     {
       tooltip: 'Возврат произведен',
       icon: 'ico/contract.png',
       text: '',
       handler: function(grid, idx) {
         if (!grid.getAt && grid.getStore) {
           grid = grid.getStore();
         }
         var item = grid.getAt(idx);
         if (!item) {
           return;
         }
         this.acceptApplication(item, store);
       },
       isHidden: function(v, meta, rec) {
         return (rec.data.date_solved||rec.data.date_cancelled);
       },
       scope: this
     },
     {
       tooltip: 'Отоклонить заявку',
       icon: 'ico/garbage.png',
       text: '',
       handler: function(grid, idx) {
         if (!grid.getAt && grid.getStore) {
           grid = grid.getStore();
         }
         var item = grid.getAt(idx);
         if (!item) {
           return;
         }
         this.rejectApplication(item, store);
       },
       isHidden: function(v, meta, rec) {
         return (rec.data.date_solved||rec.data.date_cancelled);
       },
       scope: this
     },
     {
       tooltip: 'Сертификат ЭП',
       icon: 'ico/eds.png',
       text: '',
       isHidden: function(v, meta, rec) {
         return !rec.data.eds;
       },
       handler: function(grid, idx) {
         var store = grid.getStore();
         var r = store.getAt(idx);
         if (!r) {
          return;
         }
         performRPCCall(RPC.Finance.transactionrequestInfo, [r.data.id], null, function(resp){
           if (!resp || !resp.success || !resp.request) {
             echoResponseMessage(resp);
             return;
           }
           if (!resp.request.eds || !resp.request.eds.SignedData) {
             Ext.Msg.alert('ЭП отсутствует', "Заявка на возврат подана без ЭП");
           }
           var text = (''+resp.request.eds.SignedData).escapeHtml();
           text = text.replace(/\n/g, '<br/>');
           Ext.Msg.alert('ЭП заявки на возврат №'+r.data.id, text);
         });
       }
     }
    ];

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true,
          width: 35
        },
        columns: [
          {header: "Номер", tooltip: "Номер заявки", dataIndex: 'id', width: 20},
          {header: "Наименование", tooltip: "Наименование", dataIndex: 'full_name', width: null},
          {header: "ИНН", tooltip: "ИНН", dataIndex: 'inn', sortable: false},
          {header: "Дата добавления", tooltip: "Дата добавления", dataIndex: 'date_added', renderer: Ext.util.Format.localDateRenderer},
          {header: "Дата начала обработки", tooltip: "Дата начала обработки (передачи в банк)", dataIndex: 'date_accepted', renderer: Ext.util.Format.localDateRenderer},
          {header: "Дата обработки", tooltip: "Дата обработки", dataIndex: 'date_solved', renderer: Ext.util.Format.localDateRenderer},
          {header: "Дата отклонения", tooltip: "Дата отклонения", dataIndex: 'date_cancelled', renderer: Ext.util.Format.localDateRenderer},
          {header: "Статус", tooltip: "Статус заявки", dataIndex: 'basis_text', width: 50, sortable: false},
          {header: "Сумма (руб.)", tooltip: "Сумма (руб.)", dataIndex: 'sum', renderer: 'formatPrice'},
          {header: "Операции", xtype: 'textactioncolumn', items : actionLinks, sortable: false, actionsSeparator: ' '}
        ]
      }),
      viewConfig: {
        forceFit: true,
        getRowClass: function(record, rowIndex, p, store) {
          if (record.data.date_solved) {
            return 'x-color-2';
          } else if (record.data.date_cancelled) {
            return 'x-color-5';
          } else if (record.data.date_accepted) {
            return 'x-color-3';
          }
          return '';
        }
      },
      tbar: {
        xtype: 'Application.components.searchToolbar',
        searchHelp: 'Поиск по названию контрагента, ИНН, номеру заявки',
        eventTarget: this
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Заявки {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),

      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      iconCls: 'icon-grid',
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(search_params) {
          var store = this.getStore();
          if (Ext.isString(search_params)) {
            store.setBaseParam('query', search_params);
          } else if (search_params) {
            for (var sp in search_params) {
              if (!search_params.hasOwnProperty(sp)) {
                continue;
              }
              store.setBaseParam(sp, search_params[sp]);
            }
          }
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load();
        },
        search_started: function() {
          this.fireEvent('search', component.parent.searchParams);
        }
      }
    }
    );

    Application.components.moneybackGrid.superclass.initComponent.call(this);
  },
  rejectApplication: function(item, store) {
    var win = new Ext.Window({
      title: 'Отклонить заявку №'+item.data.id,
      layout: 'form',
      width: 500,
      autoHeight: true,
      labelWidth: 200,
      frame: true,
      border: false,
      defaults: {
        border: false,
        msgTarget: 'under'
      },
      items: [{
        xtype: 'displayfield',
        fieldLabel: 'Укажите причину отклонения'
      }, {
        xtype: 'textarea',
        hideLabel: true,
        name: 'reject_reason',
        allowBlank: false,
        anchor: '100%'
      }],
      buttons: [{
        text: 'Не отклонять',
        handler: function() {
          win.close();
        }
      }, {
        text: 'Отклонить заявку',
        handler: function() {
          if (!isFormValid(win)) {
            return;
          }
          var v = {};
          collectComponentValues(win, v);
          v.reject_reason_signature = getSignature(v.reject_reason);
          if (!v.reject_reason_signature) {
            return;
          }
          v.application_id = item.data.id;
          performRPCCall(RPC.Finance.decline, [v], null, function(resp){
            echoResponseMessage(resp);
            if (resp && resp.success) {
              store.reload();
              win.close();
            }
          });
        }
      }]
    });
    win.show();
  },
  acceptApplication: function(item, store) {
    var win = new Ext.Window({
      title: 'Произведен возврат по заявке №'+item.data.id,
      layout: 'form',
      width: 500,
      autoHeight: true,
      labelWidth: 200,
      frame: true,
      border: false,
      defaults: {
        border: false,
        msgTarget: 'under'
      },
      items: [{
        xtype: 'displayfield',
        fieldLabel: 'Укажите комментарий к возврату'
      }, {
        xtype: 'textarea',
        hideLabel: true,
        name: 'reason',
        allowBlank: false,
        anchor: '100%'
      }],
      buttons: [{
        text: 'Не принимать',
        handler: function() {
          win.close();
        }
      }, {
        text: 'Принять заявку',
        handler: function() {
          if (!isFormValid(win)) {
            return;
          }
          var v = {};
          collectComponentValues(win, v);
          v.reason_signature = getSignature(v.reason);
          if (!v.reason_signature) {
            return;
          }
          v.application_id = item.data.id;
          performRPCCall(RPC.Finance.accept, [v], null, function(resp){
            echoResponseMessage(resp);
            if (resp && resp.success) {
              store.reload();
              win.close();
            }
          });
        }
      }]
    });
    win.show();
  }
});
