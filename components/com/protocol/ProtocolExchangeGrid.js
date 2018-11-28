
 Ext.define('Application.components.ProtocolExchangeGrid', {
  extend:  'Ext.grid.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var store = new Ext.data.DirectStore(
  {
    directFn: RPC.Protocol.loadooslist,
    paramsAsHash: true,
    autoSave: true,
    root: 'data',
    idProperty: 'id',
    totalProperty: 'totalCount',
    fields: [
      'id', 'type_name', 'oos_publish_status', 'oos_registry_number','oos_publish_status_id','type_id'
    ],
    baseParams: {
      procedure_id : this.procedure_id
    },
    remoteSort: true
  });;

    Ext.apply(this,
    {
      store: store,
      columns: [
        {header: 'Тип протокола на площадке', width: 160, dataIndex: 'type_name', sortable: false},
        {header: 'Статус передачи в ЕИС', dataIndex: 'oos_publish_status', width: 80, sortable: false},
        {header: 'Текущий реестровый<br>номер в ЕИС', dataIndex: 'oos_registry_number', width: 80, sortable: false},
        {header: "Операции", dataIndex: 'extra', sortable: false, width: 30, xtype: 'textactioncolumn', actionsSeparator: ' ',
          items:[{
            tooltip: 'Передать на zakupki.gov.ru',
            icon: '/ico/form.png',
            scope: this,
            isHidden: function(v, m, r) {
              if(isAdmin()) return false;

              else {
                if(r.data.oos_publish_status_id<=0) {
                  return false;
                }
              }

              return true;
            },
            handler: function(grid, rowIndex){
              this.showExchangeForm(this.getStore().getAt(rowIndex), this);
            }
          }]
        }
      ],
      viewConfig: {
        forceFit: true
      },
      loadMask: true,
      listeners: {
        render: function() {
          var store = this.getStore();
          store.load();
        }
      }
    }
    );

    Application.components.ProtocolExchangeGrid.superclass.initComponent.call(this);
  },
  showExchangeForm : function(record, grid) {
    var winId = Ext.id(), frmId = Ext.id();
    var procedure_id = this.procedure_id;
    var eventWindow = new Ext.Window({
        closeAction: 'close',
        width: 800,
        height: 250,
        layout: 'fit',
        id: winId,
        title: 'Публикация протокола',
        items: [
          {
            xtype: 'Application.components.ProtocolOOSPublisForm',
            grid: grid,
            winId: winId,
            protocol_id: record.data.id,
            procedure_id: procedure_id,
            height: 229,
            labelWidth: 250
          }
        ]
      });
      eventWindow.show();
  }
});
