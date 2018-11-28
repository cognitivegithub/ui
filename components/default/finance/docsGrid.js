/**
 * Грид расходных документов контрагента
 */
Ext.define('Application.components.docsGrid', {
  extend: 'Ext.grid.GridPanel',
  frame : true,
  border : false,
  initComponent : function () {
    this.addEvents('search');

    var store = createFiscalDoscStore();

    Ext.apply(this,
    {
      store: store,
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
          {header: 'Реестровый №', dataIndex: 'registry_number', width: 50},
          {header: 'Сумма', dataIndex: 'price', width: 40, renderer: Ext.util.Format.formatPrice},
          {header: 'Заказчик', dataIndex: 'customer', width: 140},
          {header: 'Акт', dataIndex: 'number', width: 40},
          {header: 'Дата отправки акта', dataIndex: 'date_forwarded', width: 40, renderer: Ext.util.Format.dateRenderer('d-m-Y')},
          {header: 'Дата подписания акта', dataIndex: 'date_signed', width: 40, renderer: Ext.util.Format.dateRenderer('d-m-Y')},
          {header: 'Дата списания', dataIndex: 'date_generated', width: 40, renderer: Ext.util.Format.dateRenderer('d-m-Y')},
          {header: 'Операции', xtype: 'textactioncolumn', actionsSeparator: ' ', width: 40, items: [{
            tooltip: 'Загрузить документ',
            icon: '/ico/document.png',
            text: '',
            href: function(v, m, record) {
              return ('/file/getact/act/' + record.data.id);
            }
           }]}
        ]
      }),
      viewConfig: {
        forceFit: true
      },
      bbar: new Ext.PagingToolbar({
          pageSize: 25,
          store: store,
          displayInfo: true,
          displayMsg: 'Документы {0} - {1} из {2}',
          emptyMsg: "Список пуст"
      }),
      tbar: {
        xtype: 'Application.components.searchToolbar',
        eventTarget: this,
        searchHelp: 'Быстрый поиск по номеру документа',
        advancedSearch: [{
          xtype: 'textfield',
          fieldLabel: 'Заказчик',
          name: 'customer'
        }, {
          xtype: 'dateinterval',
          name: 'date_begin',
          fieldLabel: 'Дата проведения',
          width: 100
        }, {
          xtype: 'textfield',
          fieldLabel: 'Номер процедуры',
          name: 'registry_number'
        }, {
          xtype: 'dateinterval',
          name: 'date_generated',
          fieldLabel: 'Дата документа',
          width: 100
        }, {
          xtype: 'textfield',
          fieldLabel: 'Номер документа',
          name: 'number'
        }]
      },
      sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
      loadMask: true,
      listeners: {
        render: function() {
          this.fireEvent('search');
        },
        search: function(query, search_params) {
          var store = this.getStore();
          store.setBaseParam('number', query);
          store.setBaseParam('start', 0);
          store.setBaseParam('limit', 25);
          if (search_params) {
            for (var sp in search_params)
              store.setBaseParam(sp, search_params[sp]);
          }
          store.load();
        }
      },
      getAt: function(rowIndex) {
        return this.getStore().getAt(rowIndex);
      }
    }
    );
    Application.components.docsGrid.superclass.initComponent.call(this);
  }
});
