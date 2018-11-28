/**
 * Параметры компоненты:
 * params - параметры поиска по финансовой истории
 */
 Application.components.historyGrid = Ext.extend(Ext.grid.GridPanel, {
  frame : true,
  border : false,
  initComponent : function () {
    this.addEvents('search');

    var store = new Ext.data.DirectStore({
      directFn: RPC.Finance.history,
      paramsAsHash: true,
      root: 'rows',
      totalProperty: 'totalCount',
      fields: [
        'id', {name:'tx_date', type: 'date', dateFormat: 'c'},
        'start', 'total', 'plus_amount', 'minus_amount', 'operation_description', 'basis_text', {name:'operation_date', type: 'date', dateFormat: 'c'}
      ],
      sortInfo: {
        field: 'tx_date',
        direction: 'DESC'
      },
      remoteSort: true
    });

    var plusheader, minusheader;
    if(this.optype=='deposit_blocked') {
      plusheader='Заблокировано';
      minusheader='Разблокировано';
    } else if (this.optype=='service_fee') {
      plusheader='Пополнение';
      minusheader='Списание'
    }

    function operation_description_renderer(value, p, record) {
      var basis_text = record.get('basis_text');
      return value + (basis_text ? '. Основание: ' + basis_text : '');
    }

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {header: 'ИД', dataIndex: 'id', hidden: true, sortable: false},
          {header: 'Дата', dataIndex: 'tx_date', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s')},
          {header: 'Входящий остаток', dataIndex: 'start', renderer: Ext.util.Format.formatPrice, sortable: false},
          {header: plusheader, dataIndex: 'plus_amount', renderer: Ext.util.Format.formatPrice, sortable: false},
          {header: minusheader, dataIndex: 'minus_amount', renderer: Ext.util.Format.formatPrice, sortable: false},
          {header: 'Исходящий остаток', dataIndex: 'total', renderer: Ext.util.Format.formatPrice, sortable: false},
          {header: 'Основание', dataIndex: 'operation_description', renderer: operation_description_renderer, sortable: false},
          {header: 'Реальная дата транзакции', dataIndex: 'operation_date', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s'), sortable: false, hidden: true}
        ]
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
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
        }],
        advancedSearchButtonAlign: 'left'
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          var component = this;
          var search_params = {
            contragent_id: component.contragent_id,
            optype: component.optype
          }
          this.fireEvent('search', search_params);
        },
        search: function(search_params) {
          var store = this.getStore();
          var sp;
          if (search_params) {
            for (sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load();
        }
      }
    }
    );

    Application.components.historyGrid.superclass.initComponent.call(this);
  }
});
