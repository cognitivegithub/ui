 /* Параметры:
 *   items - массив дополнительных полей (если требуется что-то, кроме текста для подписи)
 *
 */
Application.components.PromptForm = Ext.extend(Ext.form.FormPanel, {

  initComponent : function () {
    var component = this;
    function signForm(form, signField, success_fn) {
      var formValues = form.getForm().getValues();
      var signatureValue = 'a';//signData(formValues[signField], 1);
      if (!checkSignatureResult(signatureValue)) {
        return false;
      }

      var onSuccess = function (resp) {
          echoResponseMessage(resp);
          if (success_fn) {
              success_fn();
          } else if (resp.redirect_url) {
              redirect_to(resp.redirect_url);
          } else if (resp.result.redirect_url) {
              redirect_to(resp.result.redirect_url);
          }
      };
      if (component.useFormHandler) {
        form.getForm().findField('signature').setValue(signatureValue);
        form.getForm().submit({
          waitMsg: 'Отправляем данные',
          success: function(form, result){
            onSuccess(result);
          }
        });
      } else {
        formValues.signature = signatureValue;
        var params = {
          mask: true,
          wait_text: 'Осуществляем подпись...'
        };
        performRPCCall(form.api, [formValues], params, function(result){
          onSuccess(result);
        });
      }
      return true;
    }

    var items = [];
    if (undefined !== this.items) {
      if (Ext.isArray(this.items)) {
        items.push.apply(items, this.items);
      } else {
        items.push(this.items);
      }
    }
    items.push({
        xtype: 'textarea',
        id: 'signature_text',
        name: 'signature_text',
        hideLabel: true,
        anchor: '100%',
        autoScroll: true,
        readOnly: true
      }, {
        xtype: 'hidden',
        name: 'signature'
      }
    );

    Ext.apply(this, {
      width: 500,
      frame: true,
      items: [
        items
      ],
      buttons: [
      {
        text: 'Закрыть',
        handler: function() {          
          component.curWindow.close();
        },
        scope: this
      },
      {
        text: 'Подписать',
        scope: this,
        formBind : true,
        handler: function(){
          signForm(this, 'signature_text', function() {
            component.curWindow.close();
          });
        }
      }
      ]
    });
    
    Application.components.PromptForm.superclass.initComponent.call(this);
    
    this.form.api = {
        submit: component.api
    };
    this.form.waitMsgTarget = true;
        
  }
});
