/**
 * Параметры компоненты:
 */

 Ext.define('Application.components.ProcedureSelectionGrid', {
  extend: 'Ext.grid.Panel',
  frame : false,
  border : true,
  initComponent : function () {
    var component = this;
    this.addEvents('load_invite_text');
    
    var dstore = new Ext.data.DirectStore({
      root: 'procedures',
      idProperty: 'id',
      totalProperty: 'totalCount',
      remoteSort: false,
      autoLoad: false,
      directFn: RPC.Procedure.procedureListForInvites,
      paramsAsHash: true,
      fields: ['id', 'registry_number', 'procedure_type', 'organizer_contragent_name', 'title']
    });

    var selectionModel = new Ext.grid.CheckboxSelectionModel({
      singleSelect: false,
      checkonly: true,
      listeners: {
        rowselect: function() {
          component.fireEvent('load_invite_text');
        },
        rowdeselect: function() {
          component.fireEvent('load_invite_text');
        }
      }
    });
    
    Ext.apply(this,
    {
      store: dstore,
      columns: [
        selectionModel,
        {header: "Номер процедуры", dataIndex: 'registry_number', width: 70},
        {header: 'Тип', dataIndex: 'procedure_type', width: 20,
           renderer: function(v){
             var t = Application.models.Procedure.getType(v);
             var images = {
               '1': '/ico/procedures/bidding_up_auctions.png',
               '2': '/ico/procedures/bidding_down_auctions.png',
               '3': '/ico/procedures/contests.png',
               '4': '/ico/procedures/rate_requests.png',
               '5': '/ico/chart.png',
               '6': '/ico/all.png'
             };
             var name = t?t.name:'';
             return '<img src="'+(images[''+v]?images[''+v]:'/ico/auction.png')+
                    '" ext:qtip="'+name+'" alt="'+name+'" />';
           }},
        {header: "Организатор", dataIndex: 'organizer_contragent_name', width: 60},
        {header: "Наименование", dataIndex: 'title', width: 200}
      ],
      viewConfig: {
        forceFit: true,
        getRowClass: function(record, rowIndex, p, store) {
          return record.data.date_accepted?'x-color-3':null;
        }
      },
      sm: selectionModel,
      border: false,
      loadMask: true,
      height: 300,
      autoScroll: true,
      iconCls: 'icon-grid',
      listeners: {
        render: function() {
          dstore.load({callback: function() {
            if (component.procedure_id) {
              var sm = component.getSelectionModel();
              dstore.each(function(record) {
                if (record['id'] == component.procedure_id) {
                  sm.selectRecords([record]);
                  component.fireEvent('load_invite_text');
                  return;
                }
              });
            }
          }});
        }
      }
    }
    );
    
    Application.components.ProcedureSelectionGrid.superclass.initComponent.call(this);    
  }
});
