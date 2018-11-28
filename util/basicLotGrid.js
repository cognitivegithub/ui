
Ext.define('Application.components.basicLotGrid', {
  extend: 'Ext.grid.GridPanel',
  initComponent: function() {
    var component = this;
    var procedure_id = component.procedure_id;
    var store = getLotStore(procedure_id);
   
    Ext.apply(this, {
      store: store,
      columns: [
      {
          header: 'Предмет договора',
          width: 200,
          dataIndex: 'subject'
      },{
          header: 'Нач.макс.цена',
          width: 70,
          dataIndex: 'start_price'
      },{
          header: 'Размер обеспечения',
          width: 70,
          dataIndex: 'guarantee_application'
      },{
          header: 'Заказчики',
          dataIndex: 'lot_customers',
          width: 300
      }, {
          header: 'Операции',
          xtype: 'textactioncolumn',
          items: [
          {
             tooltip: 'Подать заявку на участие',
             text: 'Подать заявку на участие',
             href: function(value, p, record) {
               return String.format('#com/applic/create/lot/{0}/procedure/'+procedure_id, record.get('id'));
             }
           }
          ]
      }]
    });
    Application.components.basicLotGrid.superclass.initComponent.call(this);
  }
});
