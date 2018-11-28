/**
 * Параметры компоненты:
 * contragent_id - ИД организации
 */
 Application.components.applicReturnGrid = Ext.extend(Ext.grid.GridPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    this.addEvents('search');
    this.addEvents('applic_added');
    var store = new Ext.data.DirectStore({
      directFn: RPC.Finance.moneybackapplic,
      paramsAsHash: true,
      root: 'rows',
      totalProperty: 'totalCount',
      autoLoad: false,
      fields: [
        'id', {name:'date_added', type: 'date', dateFormat: 'c'}, 'sum', 'basis_text'
      ],
      sortInfo: {
        field: 'date_added',
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
          {header: '№ заявки', dataIndex: 'id', sortable: false},
          {header: 'Дата подачи', dataIndex: 'date_added', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s')},
          {header: 'Сумма (руб.)', width: 60, sortable: true, dataIndex: 'sum', renderer: 'formatPrice'},
          {header: 'Статус', sortable: true, dataIndex: 'basis_text'}
        ]
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Заявки {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      border: false,
      loadMask: true,
      autoHeight: true,
      iconCls: 'icon-grid',
      listeners: {
        render: function() {
          var search_params = {
            contragent_id: Main.contragent.id
          }
          this.fireEvent('search', search_params);
        },
        search: function(search_params) {
          var store = this.getStore();
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          store.load({params: search_params});
        },
        applic_added: function() {
          var search_params = {
            contragent_id: Main.contragent.id
          }
          this.fireEvent('search', search_params);
        }
      }
    }
    );
    
    Application.components.applicReturnGrid.superclass.initComponent.call(this);    
  }
});
