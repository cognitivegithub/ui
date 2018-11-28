Ext.define('Application.components.LotExtendedApplicRegistrationPanel', {
  extend: 'Ext.form.FieldSet',
  frame : false,
  border : true,
  initComponent : function () {
    var component = this;

    this.lot_id = null;

    this.ids = {extended_applic_registration_id: Ext.id()};

    Ext.apply(this, {
      layout : 'form',
      labelWidth: 1,
      items: [{
        xtype: 'checkbox',
        id: this.ids.extended_applic_registration_id,
        boxLabel: 'Возможность расширенной подачи заявок'
      }],
      buttons: [{
        text: 'Применить',
        handler: function() {
          var selector = Ext.getCmp(component.ids.extended_applic_registration_id);
          performRPCCall(RPC.Lot.extendedApplicRegistration, [{lot_id: component.lot_id, extended_applic_registration: selector.getValue()}], {wait_delay: 0, wait_text: 'Применение статуса. Подождите...'}, function(result) {
            if (result.success) {
              Ext.Msg.alert('Успешно', 'Данные применены');
            }
          });
        }
      }]
    });
    Application.components.LotExtendedApplicRegistrationPanel.superclass.initComponent.call(this);
    this.on('applic_reviewlist_loaded', function(resp) {
      if (!Main.config.extended_applic_registration_quotation
            || resp.procedure.procedure_type != PROCEDURE_TYPE_QUOTATION_REQ) {
        component.setVisible(false);
        component.setDisabled(true);
      }
      var selector = Ext.getCmp(component.ids.extended_applic_registration_id);
      if (false === resp.lot.extended_applic_registration) {
        selector.setValue(false);
      } else {
        selector.setValue(true);
      }
      component.lot_id = resp.lot.id;
    });
  }
});
