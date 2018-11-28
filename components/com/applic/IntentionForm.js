
Application.components.IntentionForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var procedure_info_panel_id = Ext.id();
    var intention_text = 'Настоящим сообщаем о своем намерении принять участие в выбранной закупочной процедуре. Подача данного запроса не обязывает нас принимать участие в закупке.';

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      fileUpload: true,
      items : [{
        xtype: 'fieldset',
        title: 'Общие сведения о процедуре',
        cls: 'spaced-fieldset',
        defaults: {bodyStyle: 'padding: 0px'},
        items: [{
          id: procedure_info_panel_id,
          hideTitle: true,
          border: false,
          cls: 'x-panel-mc',
          items: []
        }]
      }, {
        xtype: 'fieldset',
        title: 'Намерение',
        cls: 'spaced-fieldset',
        html: intention_text
      }],
      buttons: [
        {
          text: 'Подписать и направить',
          scope: this,
          formBind : true,
          handler: function(){
            redirect_to('com/applic/signintention/procedure/'+component.procedure_id+'/lot/'+component.lot_id);
          }
        }, {
          text: 'Отмена',
          handler: function() {
            history.back(1);
          }
        }
      ],
      listeners: {
        afterrender: function() {
          performRPCCall(RPC.Lot.load, [{lot_id: component.lot_id}], {wait_text: 'Получение данных о закупке.'}, function(resp) {
            if (resp.success) {
              Ext.getCmp(procedure_info_panel_id).update(getProcedureDataForIntentionTemplate().apply(resp.procedure));
            } else {
              Ext.Msg.alert('Ошибка', resp.message);
            }
          });
        }
      }
    });
    Application.components.IntentionForm.superclass.initComponent.call(this);
  }
});
