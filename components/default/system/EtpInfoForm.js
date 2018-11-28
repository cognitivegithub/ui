
Ext.define('Application.components.EtpInfoForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    function loadEtpInfo() {
      RPC.Admin.loadetpinfo(null, function(result) {
        if (result.success) {
          var etpinfo = result.data;
          component.getForm().setValues(etpinfo);
        } else {
          Ext.Msg.alert('Ошибка', 'Данные о площадке не удалось загрузить.');
        }
      });
    }

    Ext.apply(this, {
      autoHeight: true,
      layout : 'form',
      title: component.title,
      frame: true,
      bodyCssClass: 'subpanel-top-padding',
      defaults: {
        anchor: '100%',
        autoHeight: true,
        allowBlank: false,
        labelWidth: 200,
        xtype: 'fieldset',
        layout: 'form',
        defaults: {
          anchor: '100%',
          msgTarget: 'under',
          allowBlank: false
        }
      },
      monitorValid : true,
      items : [
      {
        title: 'Информация о торговой площадке',
        layout: 'form',
        defaults: {
          xtype: 'textfield',
          anchor: '100%'
        },
        items: [{
          fieldLabel: 'Полное наименование площадки',
          name: 'full_name'
        }, {
          fieldLabel: 'ИНН',
          name: 'inn'
        }, {
          fieldLabel: 'КПП',
          name: 'kpp'
        }, {
          fieldLabel: 'ОГРН',
          name: 'ogrn'
        }, {
          fieldLabel: 'Телефоны',
          name: 'phone'
        }, {
          fieldLabel: 'Юридический адрес',
          name: 'address_legal'
        }, {
          fieldLabel: 'Почтовый адрес',
          name: 'address_postal'
        }]
      }],
      buttons: [{
        text: 'Сохранить',
        scope: this,
        formBind : true,
        handler: function(){
          var parameters = this.getForm().getValues();

          performRPCCall(RPC.Admin.etpinfosave, [parameters], {wait_text: 'Сохранение'}, function(result) {
            if(result.success) {
              Ext.Msg.alert('Успешно', 'Данные о площадке успешно сохранены');
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }],
      listeners: {
        afterrender: function() {
          loadEtpInfo();
        }
      }
    });
    Application.components.EtpInfoForm.superclass.initComponent.call(this);
  }
});
