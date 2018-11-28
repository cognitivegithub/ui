Ext.define('Application.components.applicView', {
  extend: 'Application.components.TsnApplic',

  initComponent: function() {

    Application.components.applicView.superclass.initComponent.call(this);

    this.on('beforerender', function() {
      this.loadApplicationData(this.application_id);
    });

    this.on('applicloaded', function(applic) {
      this.add({
        xtype: 'grid',
        title: 'Поданные предложения',
        autoHeight: true,
        forceFit: true,
        store: this.getStore(applic.offers),
        colModel: new Ext.grid.ColumnModel({
          defaults: {
            menuDisabled: true,
            sortable: false
          },
          columns: [
            {header: 'Дата', dataIndex: 'date_added', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')},
            {header: 'Количество', dataIndex: 'quantity'},
            {header: 'Цена', dataIndex: 'price', renderer: Ext.util.Format.formatPrice},
            {header: 'Общая сумма', dataIndex: 'sum', renderer: function(value, metaData, record) {
              return Ext.util.Format.formatPrice(record.get('quantity') * record.get('price'))
            }}
          ]
        }),
        viewConfig: {
          forceFit: true
        }
      });

      this.doLayout();
    });
  },

  getStore: function(offers) {
    return new Ext.data.ArrayStore({
      idIndex: 2,
      fields: Ext.data.Record.create([
        {name: 'date_added', mapping: 'date_added'},
        {name: 'quantity', mapping: 'quantity'},
        {name: 'price', mapping: 'price'}
      ]),
      data: offers
    });
  }
});
