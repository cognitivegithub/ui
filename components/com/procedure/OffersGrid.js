
 Ext.define('Application.components.OffersGrid', {
  extend:  'Ext.form.Panel',
  frame : true,
  border : false,
  initComponent : function () {
    var component = this;
    var store = createOffersLogStore(this.lot_id);
    var dataGridColumns = [
        {header: '№', width: 10, dataIndex: 'id', sortable: false},
        {header: 'Участник', width: 60, dataIndex: 'supplier', sortable: false},
        {header: 'Предложение', dataIndex: 'price', width: 40, sortable: false, renderer: Ext.util.Format.formatPrice},
        {header: 'Дата и время подачи', dataIndex: 'date_added', sortable: false, renderer: Ext.util.Format.dateRenderer('d.m.Y H:i:s.u')}
      ];
      var grid = new Ext.grid.GridPanel({
        store: store,
        clicksToEdit: 1,
        //cls: 'spaced-fieldset thinborder',
        cm: new Ext.grid.ColumnModel({
          columns: dataGridColumns
        }),
        viewConfig: {
          forceFit:true
        },
        autoHeight: false,
        //height: 100,
        anchor: '100% 100%',
        hideTitle: true,
        loadMask: true,
        listeners: {
        render: function() {
          var store = this.getStore();
          store.load();
        }
      }
    });
    
    Ext.apply(this,
    {
      store: store,
      items: [grid],
      buttons: [{
        text: 'Выгрузить список',
        handler: function() {
          var url = '/Offer/listApplicOffers';
          var params = {
            lot_id: component.lot_id,
            viewlist_action: 'download',
            format: 'htmljson'
          };
          var dparams = {
            handle_failure: true,
            download: true,
            wait_disable: true
          };
          performAjaxRPCCall(url, params, dparams, echoResponseMessage);
        }
      }]
    }
    );

    Application.components.OffersGrid.superclass.initComponent.call(this);
  }
});
