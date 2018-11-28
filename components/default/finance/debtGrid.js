Ext.define('Application.components.debtGrid', {
  extend: 'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    this.addEvents('search');
    var store_suppliers = createCompanyByType();
    
    var store = new Ext.data.DirectStore({
      directFn: RPC.Finance.debts,
      paramsAsHash: true,
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        {name:'tx_date', type: 'date', dateFormat: 'c'}, 'total', 'plus_amount', 'minus_amount', 'comment'
      ],
      sortInfo: {
        field: 'tx_date',
        direction: 'ASC'
      },
      remoteSort: true
    });
    
    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {header: 'Дата', dataIndex: 'tx_date', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s')},
          {header: 'Текущий долг', dataIndex: 'total', renderer: Ext.util.Format.formatPrice, sortable: false},
          {header: 'Увеличение долга', dataIndex: 'plus_amount', renderer: Ext.util.Format.formatPrice, sortable: false},
          {header: 'Величина погашения', dataIndex: 'minus_amount', renderer: Ext.util.Format.formatPrice, sortable: false},
          {header: 'Комментарий', dataIndex: 'comment', sortable: false}
        ]
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 50,
          store: store,
          displayInfo: true,
          displayMsg: 'Записи {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        advancedSearchActive:true,
        advancedSearchOnly:true,
        advancedSearch: [{
          xtype: 'dateinterval',
          name: 'start',
          fieldLabel: 'Диапазон дат',
          width: 100
        }, {
          xtype: 'combo',
          name: 'supplier_id',
          hiddenName: 'supplier_id',
          fieldLabel: 'Организация',
          anchor: '100%',
          model: 'remote',
          store: store_suppliers,
          displayField: 'full_name',
          valueField: 'id',
          minChars: 3,
          hideTrigger: true,
          forceSelection: true,
          typeAhead: true,
          triggerAction: 'all',
          allowBlank: false,
          width: 150
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        search: function(search_params) {
          if (!search_params['supplier_id']) {
            Ext.Msg.alert('Ошибка', 'Не указана организация');
            return;
          }
          var store = this.getStore();
          if (search_params) {
            for (sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 50);
          store.load();
        }
      }
    }
    );
    
    Application.components.debtGrid.superclass.initComponent.call(this);    
  }
});
