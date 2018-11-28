
Ext.define('Application.components.ApplicHistoryGridPanel', {
  extend: 'Ext.grid.GridPanel',
  initComponent: function() {
    var component = this;
    var application_id = component.application_id;
    var store = getStore('applhistory_'+application_id, {
    directFn      : RPC.Applic.history,
    paramsAsHash  : true,
    groupField    :'lot_id',
    remoteSort    : true,
    autoLoad      : true,
    baseParams: {
      application_id: application_id
    },
    reader        : new Ext.data.JsonReader({
      root          : 'entries',
      totalProperty : 'totalCount',

      fields        : [
        'field',
        'from',
        'to',
        {
          name        : 'date',
          type        : 'date',
          dateFormat  : 'c'
        },
        'user'
      ] // fields definition
    })
  });
   
    Ext.apply(this, {
      store: store,
      columns: [
      {
          header: 'Дата внесения изменений',
          width: 150,
          renderer: Ext.util.Format.dateRenderer('d.m.Y H:i'),
          dataIndex: 'date'
      },{
          header: 'Наименование параметра',
          width: 380,
          dataIndex: 'field'
      },{
          header: 'Старое значение',
          dataIndex: 'from',
          width: 200
      },{
          header: 'Новое значение',
          dataIndex: 'to',
          width: 200
      }],
      viewConfig: {
        forceFit: true
      }
    });
    Application.components.ApplicHistoryGridPanel.superclass.initComponent.call(this);
  }
});
