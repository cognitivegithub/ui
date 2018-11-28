
Ext.define('Application.components.ProtocolOOSPublisForm', {
  extend: 'Ext.panel.Panel',
  frame: true,
  border: false,
  bodyCssClass: 'subpanel',
  initComponent: function() {
    var component = this;
    var oos_fieldset_id = Ext.id(),
        oos_type_combo_id = Ext.id(),
        date_happened_id = Ext.id(), place_happened_id = Ext.id();

    var oos_type_store =  new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: false,
      root: 'rows',
      idProperty: 'code',
      fields: ['code', 'name']
    });

    Ext.apply(this, {
      items: [{
        xtype: 'fieldset',
        title: 'Данные для осуществления публикации протокола на zakupki.gov.ru',
        cls: 'spaced-fieldset',
        id: oos_fieldset_id,
        labelWidth:270,
        defaults: {
          bodyStyle: 'padding: 0px'
        },
        items: [
          {
            xtype: 'Application.components.combo',
            name: 'oos_type_id',
            fieldLabel: 'Тип протокола по классификатору ЕИС',
            id: oos_type_combo_id,
            anchor: '100%',
            valueField: 'code',
            displayField: 'name',
            hiddenName: 'oos_type_id',
            emptyText: 'Для отправки протокола в ЕИС необходимо выбрать тип по классификатору ЕИС',
            triggerAction: 'all',
            mode: 'local',
            forceSelection: true,
            store: oos_type_store
          }, {
            xtype: 'datefield',
            name: 'date_happened',
            width: 120,
            id: date_happened_id,
            fieldLabel: 'Дата фактического рассмотрения заявок',
            format: 'd.m.Y',
            altFormats: 'c|d.m.Y H:i:s|d.m.Y H:i'
          }, {
            xtype: 'textfield',
            name: 'place_happened',
            width: 250,
            id: place_happened_id,
            fieldLabel: 'Место рассмотрения заявок'
          }
        ]
      }],
      buttons: [{
        text: 'Отменить',
        handler: function() {
          if(component.winId) {
            Ext.getCmp(component.winId).close();
          }
        }
      }, {
        text: 'Передать на zakupki.gov.ru',
        handler: function() {
          var me = component;
          var values = {protocol_id: component.protocol_id};
          collectComponentValues(component, values, true);
          performRPCCall(RPC.Protocol.oosqueue, [values], {wait_delay: 0, wait_text: 'Протокол ставится в очередь на публикацию...'}, function(result) {
            if(result.success) {
              echoResponseMessage(result);
              if(me.grid) {
                me.grid.getStore().reload();
              }
              if(me.winId) {
                Ext.getCmp(me.winId).close();
              }
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }],
      listeners : {
        beforerender : function() {
          performRPCCall(RPC.Protocol.load, [{protocol_id: component.protocol_id}], {wait_delay: 0, wait_text: 'Загружаются данные протоколов. Подождите...'}, function(result) {
            var oos_data = result.oos_types;

            if(oos_data) {
              oos_type_store.loadData({rows: oos_data});
            }

            var protocol = result.protocol_data;
            if(protocol.oos_type_id) {
              Ext.getCmp(oos_type_combo_id).setValue(protocol.oos_type_id);
            }
            if(protocol.date_happened) {
              Ext.getCmp(date_happened_id).setValue(protocol.date_happened);
            }
            if(protocol.place_happened) {
              Ext.getCmp(place_happened_id).setValue(protocol.place_happened);
            }
          });
        }
      }
    });

    Application.components.ProtocolOOSPublisForm.superclass.initComponent.call(this);
  }
});
