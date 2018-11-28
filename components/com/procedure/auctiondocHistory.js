Ext.define('Application.components.auctiondocHistory', {
  extend: 'Ext.grid.Panel',
  editable: false,
  autoHeight: true,
  frame: true,
  border: false,
  procedure_id: null,
  loadMask: true,

  initComponent: function () {
    var component = this;
    this.store = new Ext.data.DirectStore({
      autoDestroy: false,
      autoSave: false,
      autoLoad: true,
      api: {
        read: RPC.Procedure.lotDocsList
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields: false}),
      idProperty: 'id',
      paramsAsHash: true,
      root: 'documents',
      baseParams: {
        procedure_id: component.procedure_id
      },
      fields: ['id', 'name', 'descr', 'uploadDate', 'actual', 'link', 'justification']
    });

    var comboStore = Application.models.Procedure.getDocTypesStoreFromRPC();
    comboStore.addListener('load', function(store) {
      if (!store.getAt(0).phantom) {
        var rec = new Ext.data.Record.create([{name: 'Все'}]);
        this.insert(0, new rec({name: 'Все'}));
      }
    });

    Ext.apply(this, {
      viewConfig: {
        forceFit: true
      },
      colModel: new Ext.grid.ColumnModel({
        defaults: {
          sortable: true
        },
        columns: [
//          {id: 'id', header: 'ID', width: 15, dataIndex: 'id'},
          {header: 'Наименование документа', dataIndex: 'name'},
          {header: 'Тип документа', dataIndex: 'descr'},
          {header: 'Дата загрузки', dataIndex: 'uploadDate', width: 50, renderer: function(value){ return parseDate(value).format('d.m.Y H:i')}},
          {header: 'Актуально', dataIndex: 'actual', width: 30, xtype: 'checkcolumn', editable: false},
          {header: 'Обоснование', dataIndex: 'justification', width: 30, xtype: 'checkcolumn', editable: false},
          {
            header: 'Операции', dataIndex: 'link', width: 20, xtype: 'textactioncolumn',
            items: [
              {
                icon: '/images/icons/silk/disk.png',
                tooltip: 'Скачать',
                handler: function (grid, index) {
                  performAjaxRPCCall(grid.getStore().getAt(index).data.link, {}, {download  : true, wait_disable: true});
                }
              }
            ]
          }
        ]
      }),
      bbar: new Ext.PagingToolbar({
        pageSize: 25,
        store: component.store,
        displayInfo: true,
        displayMsg: 'Файлы {0} - {1} из {2}',
        emptyMsg: "Список пуст"
      }),
      tbar: new Ext.Toolbar({
        items: ['Тип файла', {
          xtype: 'combo',
          store: comboStore,
          displayField: 'name',
          valueField: 'id',
          editable: false,
          triggerAction: 'all',
          anchor: '100%',
          width: 300,
          fieldLabel: 'Тип файла',
          listeners: {
            select: function (combo, record, index) {
              var value = this.getValue();
              component.store.setBaseParam('document_type', combo.getValue());
              component.store.reload();
            }
          }
        }
        ]
      })
    });
    Application.components.auctiondocHistory.superclass.initComponent.call(this);
  }
});