/**
 * Компонент рисует форму просмотра поданных заявок.
 * Параметры:
 * lot_id - идентификатор лота
 */
Ext.define('Application.components.ExpertViewForm', {
  extend: 'Ext.form.Panel',
  initComponent: function() {

    var component = this;

    var profile_panel_id = Ext.id();

    Ext.apply(this, {
      border: true,
      frame:true,
      width: 900,
      bodyStyle: 'padding: 10px 5px 0px 5px;',
      items: [{
        xtype: 'Application.components.keyValuePanel',
        id: profile_panel_id,
        style: 'margin-bottom: 0px;',
        fields: {
          expert_name:    'Наименование организации – эксперта',
          contact_fio:    'Контактное лицо',
          contact_phone:  'Телефон',
          contact_email:  'Адрес электронной почты',
          address:        'Адрес местонахождения'
        }
      }],
      buttons: [{
        text: 'Закрыть',
        handler: function() {
          redirect_to('user/expertslist');
        }
      }],
      listeners: {
        beforerender: function() {
          performRPCCall(RPC.User.expertload, [{id: component.expert_id}], {wait_delay: 0, wait_text: 'Загружаются данные эксперта. Подождите...'}, function(result) {
            if (result.success) {
              var profile_panel = Ext.getCmp(profile_panel_id);
              profile_panel.loadData(result.data);
            } else {
              echoResponseMessage(result);
              redirect_to('user/expertslist');
            }
          });
        }
      }
    });

    Application.components.ExpertViewForm.superclass.initComponent.call(this);
  }
});
