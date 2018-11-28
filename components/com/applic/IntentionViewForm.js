
Application.components.IntentionViewForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var procedure_info_panel_id = Ext.id();
    var store = createIntentionsStore('list');

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      fileUpload: true,
      bodyCssClass: 'subpanel-top-padding',
      items : [{
        xtype: 'fieldset',
        title: 'Общие сведения о процедуре',
        defaults: {bodyStyle: 'padding: 0px'},
        items: [{
          id: procedure_info_panel_id,
          hideTitle: true,
          border: false,
          cls: 'x-panel-mc',
          items: []
        }]
      }, {
        xtype: 'grid',
        store: store,
        height: 250,
        colModel: new Ext.grid.ColumnModel({
          defaults: {
            sortable: true
          },
          columns: [
            {header: 'Название организации', dataIndex: 'supplier_name'},
            {header: 'ИНН', dataIndex: 'supplier_inn', width: 50},
            {header: 'Дата и время подачи намерения', dataIndex: 'date_added', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i'), width: 60}
          ]
        }),
        viewConfig: {
          forceFit: true
        }
      }],
      buttons: [
        {
          text: 'Закрыть',
          handler: function() {
            history.back(1);
          }
        }
      ],
      listeners: {
        afterrender: function() {
          // Грузим данные о закупке
          performRPCCall(RPC.Lot.load, [{lot_id: component.lot_id}], {wait_text: 'Получение данных о закупке.'}, function(resp) {
            if (resp.success) {
              Ext.getCmp(procedure_info_panel_id).update(getIntentionViewTemplate().apply(resp.procedure));
            } else {
              Ext.Msg.alert('Ошибка', resp.message);
            }
          });

          // Грузим данные для таблицы
          store.setBaseParam('lot_id', component.lot_id);
          store.load();
        }
      }
    });
    Application.components.IntentionViewForm.superclass.initComponent.call(this);
  }
});
