
Ext.define('Application.components.AdminSendMail', {
  extend        : 'Ext.panel.Panel',
  frame         : true,
  border        : false,
  initComponent: function() {
    Ext.apply(this, {
      layout: 'form',
      labelWidth: 120,
      bodyStyle: 'padding: 10px 15px 0 15px',
      autoHeight: true,
      defaults: {
        anchor: '100%',
        allowBlank: false
      },
      items: [{
        xtype: 'textfield',
        name: 'dest',
        fieldLabel: 'E-Mail',
        vtype: 'email'
      }, {
        xtype: 'textfield',
        fieldLabel: 'Тема',
        name: 'subj',
        value: 'Test'
      }, {
        xtype: 'textarea',
        fieldLabel: 'Содержимое',
        height: 100,
        name: 'body',
        value: 'Проверка почтовой системы'
      }],
      buttons: [{
        text: 'Отправить письмо',
        scope: this,
        handler: function() {
          if (!isFormValid(this)) {
            return;
          }
          var values = {};
          collectComponentValues(this, values, true);
          var params = {
            wait_text: 'Отправляем...'
          };
          performRPCCall(RPC.Admin.sendmail, [values], params, echoResponseMessage);
        }
      }]
    });
    Application.components.AdminSendMail.superclass.initComponent.call(this);
  }
});
