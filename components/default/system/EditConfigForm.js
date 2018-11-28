
Application.components.EditConfigForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var config_textarea_id = Ext.id();
    Ext.apply(this,
     {
      title: 'Редактирование файла конфигурации',
      frame: true,
      items : [
        {
          xtype: 'textarea',
          name: 'config_text',
          hideLabel: true,
          height: 600,
          anchor: '100%',
          id: config_textarea_id,
          listeners : {
            afterrender  : function() {
              var cmp = this;
              performRPCCall(RPC.Admin.loadconfig, [{}], null, function(resp) {
                if (resp.success) {
                  cmp.setValue(resp.config_text);
                } else {
                  Ext.Msg.alert('Ошибка', resp.message);
                }
              });
            }
          }
        }
      ],
      buttons: [
      {
        text: 'Сохранить',
        scope: this,
        formBind : true,
        handler: function(){
          var params = this.getForm().getValues();

          performRPCCall(RPC.Admin.saveconfig, [params], null, function(result) {
            if (result.success) {
              Ext.Msg.alert('Успешно', 'Файл сохранен успешно');
            } else {
              Ext.Msg.alert('Ошибка', result.message);
            }
          });
        }
      }]
    });
    Application.components.EditConfigForm.superclass.initComponent.call(this);
  }
});
