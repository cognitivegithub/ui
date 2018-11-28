
Ext.define('Application.components.HolidaysForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    function loadDate() {
      RPC.Admin.loadholiday({date_id: component.date_id}, function(result) {
        if (result.success) {
          component.getForm().setValues(result.data);
        } else {
          Ext.Msg.alert('Ошибка', 'Данные о дате не удалось загрузить.');
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
        labelWidth: 100,
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
        layout: 'form',
        items: [{
          xtype: 'hidden',
          name: 'id'
        }, {
          xtype: 'datefield',
          fieldLabel: 'Дата',
          name: 'date',
          format: 'd.m.Y'
        }, {
          xtype: 'combo',
          fieldLabel: 'Тип',
          mode: 'local',
          store : new Ext.data.ArrayStore({
            id: 0,
            fields: [
              'val',
              'name'
            ],
            data: [
              [true, 'рабочий'],
              [false, 'выходной']
            ]
          }),
          editable: false,
          valueField: 'val',
          displayField: 'name',
          hiddenName : 'is_workday',
          triggerAction: 'all'
        }]
      }],
      buttons: [{
        text: (component.date_id) ? 'Сохранить' : 'Добавить',
        scope: this,
        formBind : true,
        handler: function(){
          var parameters = this.getForm().getValues();
          performRPCCall(RPC.Admin.holidaysave, [parameters], {wait_text: 'Сохранение'}, function(result) {
            if(result.success) {
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
          if (component.date_id) {
            loadDate();
          }
        }
      }
    });
    Application.components.HolidaysForm.superclass.initComponent.call(this);
  }
});
