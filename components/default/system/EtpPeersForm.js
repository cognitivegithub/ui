
Ext.define('Application.components.EtpPeersForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    function loadEtpPeer() {
      RPC.Admin.loadetppeer({peer_id: component.peer_id}, function(result) {
        if (result.success) {
          var etppeer = result.data;
          component.getForm().setValues(etppeer);
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
        title: 'Информация о смежной системе',
        layout: 'form',
        defaults: {
          xtype: 'textfield',
          anchor: '100%'
        },
        items: [{
          name: 'id',
          hidden: true
        }, {
          fieldLabel: 'Наименование системы',
          name: 'name'
        }, {
          fieldLabel: 'Код',
          name: 'code'
        }, {
          fieldLabel: 'Точка доступа',
          name: 'endpoint'
        }, {
          xtype: 'combo',
          fieldLabel: 'Тип',
          mode: 'local',
          store : new Ext.data.ArrayStore({
              id: 0,
              fields: [
                  'id',
                  'name'
              ],
              data: [
                [0, 'отключена'],
                [1, 'master'],
                [2, 'slave']
              ]
          }),
          editable: false,
          valueField: 'id',
          displayField: 'name',
          hiddenName : 'type',
          triggerAction: 'all'
        }, {
          fieldLabel: 'Код авторизации',
          name: 'auth'
        }]
      }],
      buttons: [{
        text: (component.peer_id) ? 'Сохранить' : 'Добавить',
        scope: this,
        formBind : true,
        handler: function(){
          var parameters = this.getForm().getValues();

          performRPCCall(RPC.Admin.etppeersave, [parameters], {wait_text: 'Сохранение'}, function(result) {
            if(result.success) {
              Ext.Msg.alert('Успешно', 'Данные о смежной системе успешно сохранены');
              component.save_fn();
            } else {
              echoResponseMessage(result);
            }
          });
        }
      }, {
        text: 'Закрыть',
        handler: function() {
          component.close_fn();
        }
      }],
      listeners: {
        afterrender: function() {
          if (component.peer_id) {
            loadEtpPeer();
          }
        }
      }
    });
    Application.components.EtpPeersForm.superclass.initComponent.call(this);
  }
});
