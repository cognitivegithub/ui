
Ext.define('Application.components.finmailGrid', {
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
        'id', {name:'date_generated', type: 'date', dateFormat: 'c'}, 'number', 'full_name', 'registry_number', 'addr_post', 'postal_package_id',
          {name:'date_forwarded', type: 'date', dateFormat: 'c'}
      ],
      sortInfo: {
        field: 'number',
        direction: 'DESC'
      },
      baseParams: {
        type: 'mails'
      },
      remoteSort: true
    });
    
    function postalPackageRenderer(val) {
      var result = val;
      if (null === val) {
        result = 'не назначен';
      } else if (0 === val) {
        result = 'отключен';
      }
      return result;
    }
    
    function dateForwardedRenderer(val) {
      var result = val;
      if (!val) {
        result = 'нет';
      } else {
        result = Ext.util.Format.date(val, 'd.m.Y');
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
          {header: "Дата", dataIndex: 'date_generated',  tooltip: "Дата", sortable: true, width: 40, renderer: Ext.util.Format.dateRenderer('d.m.Y')},
          {header: "Номер док.", dataIndex: 'number',  tooltip: "Номер документа", sortable: true, width: 40},
          {header: "Контрагент", dataIndex: 'full_name',  tooltip: "Контрагент", sortable: true},
          {header: "Процедура", dataIndex: 'registry_number',  tooltip: "Процедура", sortable: true, width: 50},
          {header: "Адрес", dataIndex: 'addr_post',  tooltip: "Адрес", width: 200, sortable: true},
          {header: "№ списка", dataIndex: 'postal_package_id',  tooltip: "№ списка", sortable: true, width: 40, renderer: postalPackageRenderer},
          {header: "Отправлен", dataIndex: 'date_forwarded',  tooltip: "Отправлен", sortable: true, width: 40, renderer: dateForwardedRenderer},
          {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', items: [
             {
              text: 'Включить&nbsp;в&nbsp;отправку',
              handler: function(grid, rowIndex) {
                var item = grid.getAt(rowIndex);
                if (item) {
                  performRPCCall(RPC.Finance.enablefinmail, [{ id: item.data.id, enable: true }], {wait_text: 'Меняем статус...'}, function(response) {
                    if (response.success) {
                      store.reload();
                    } else {
                      alert(response.message);
                    }
                  });
                }
              },
              isHidden: function(v, meta, rec) {
               return !(rec.data.postal_package_id === 0);
              }
             }, {
              text: 'Исключить&nbsp;из&nbsp;отправки',
              handler: function(grid, rowIndex) {
                var item = grid.getAt(rowIndex);
                if (item) {
                  performRPCCall(RPC.Finance.enablefinmail, [{ id: item.data.id, enable: false }], {wait_text: 'Меняем статус...'}, function(response) {
                    if (response.success) {
                      store.reload();
                      var packagesstore = component.parent.items.items[0].getStore();
                      packagesstore.reload();
                    } else {
                      alert(response.message);
                    }
                  });
                }
              },
              isHidden: function(v, meta, rec) {
               return !(rec.data.postal_package_id !== 0 && rec.data.date_forwarded === null);
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
        advancedSearchActive:true,
        advancedSearchOnly:true,
        advancedSearch: [{
          xtype: 'dateinterval',
          name: 'date',
          fieldLabel: 'Диапазон дат',
          width: 100
        }, null, {
          xtype: 'textfield',
          fieldLabel: '№ Списка',
          name: 'list_num'
        }, null, {
          xtype: 'textfield',
          fieldLabel: '№ Процедуры',
          name: 'procedure_num'
        }, {
          xtype: 'checkbox',
          boxLabel: 'Скрыть отправленные',
          hideLabel: true,
          name: 'hide_sent'
        }, null, {
          xtype: 'checkbox',
          boxLabel: 'Скрыть исключенные',
          hideLabel: true,
          name: 'hide_disabled'
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          component.fireEvent('search');
        },
        search: function(search_params) {
          var store = component.getStore();
          if (search_params) {
            var sp;
            for (sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
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
    
    Application.components.finmailGrid.superclass.initComponent.call(this);    
  }
});
