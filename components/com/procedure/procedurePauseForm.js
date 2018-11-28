
Application.components.ProcedurePauseForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      fileUpload: true,
      items : [
        {
          xtype: 'textarea',
          id: 'pause_reason',
          name: 'pause_reason',
          fieldLabel: 'Причина приостановки',
          anchor: '100%',
          height: 150,
          allowBlank: false,
          hideLabel: (component.action == 'resume'),
          readOnly: (component.action == 'resume')
        }, {
          xtype: 'datefield',
          name: 'date_pause_stop',
          format: 'd.m.Y',
          fieldLabel: 'Срок действия приостановки',
          hidden: (component.action == 'resume')
        }, {
          xtype: 'hidden',
          name: 'procedure_id',
          value: component.procedure_id
        }, {
          xtype: 'hidden',
          name: 'lot_id',
          value: component.lot_id
        }
      ],
      buttons: [
        {
          text: 'Подписать',
          scope: this,
          formBind : true,
          handler: function(){
            if (this.getForm().isValid() !== true) {
              Ext.Msg.alert('Ошибка', 'Заполнены не все поля');
            } else {
              var parameters = this.getForm().getValues();

              var signatureValue = getSignature(parameters.pause_reason);
              if (!signatureValue) {
                return false;
              }

              parameters.signature = signatureValue;

              performRPCCall(component.directFn, [parameters], {wait_text: 'Отправляем данные'}, function(result) {
                if (result.success) {
                  Ext.Msg.alert('Успешно', 'Данные отправлены', function() {
                    redirect_to('#com/procedure/index/type/auctions');
                  });
                } else {
                  Ext.Msg.alert('Ошибка', result.message);
                }
              });

            }
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
          if (component.action == 'resume') {
            performRPCCall(RPC.Procedure.resumesigntext, [{procedure_id: component.procedure_id, lot_id: component.lot_id}], {wait_text: 'Формирование текста для подписи'}, function(resp) {
              if (resp.success) {
                Ext.getCmp('pause_reason').setValue(resp.message);
              } else {
                Ext.Msg.alert('Ошибка', resp.message);
              }
            });
          }
        }
      }
    });
    Application.components.ProcedurePauseForm.superclass.initComponent.call(this);
  }
});
