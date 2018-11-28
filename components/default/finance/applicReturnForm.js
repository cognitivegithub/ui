Application.components.applicReturnForm = Ext.extend(Ext.form.FieldSet, {
  border : true,
  frame: false,
  labelWidth: 350,
  defaults: {
    anchor: '100%'
  },
  initComponent : function () {
    var component = this;
    var money_field_id = Ext.id();
    this.addEvents('applic_added');
    
    Ext.apply(this, {
      bodyCssClass: 'subpanel-top-padding',
      cls: 'spaced-bottom',
      items: [
      {
        width: 130,
        xtype: 'textfield',
        name: 'sum',
        id: money_field_id,
        fieldLabel: 'Сумма возвращаемых средств (руб)',
        style: 'margin-top: 1px; margin-bottom: 5px',
        //enableKeyEvents: true,
        listeners: {
            render: function(obj) {Ext.util.Format.makePriceFormat(obj)}
        }
      }, {
        xtype: 'hidden',
        name: 'contragent_id',
        value: Main.contragent.id
      }, {
        xtype: 'panel',
        border: false,
        frame: false,
        hideLabel: true,
        style: 'margin: 5px 0; color: #15428B; font: bold 11px tahoma,arial,helvetica,sans-serif;',
        html: 'В случае отсутствия денежных средств на Вашем лицевом счету для обеспечения заявки на участие в процедуре, Ваша заявка на участие будет автоматически отменена.'
      }],
      buttons: [{
        xtype: 'button',
        text: 'Подписать и направить',
        handler: function() {
          component.performSave();
        },
        scope: this
      }],
      listeners: {
        applic_added: function() {
          Ext.getCmp(money_field_id).reset();
        }
      }
    });
  
    Application.components.applicReturnForm.superclass.initComponent.call(this);
  },
  performSave: function() {
    var values = {};
    collectComponentValues(this, values, true);
    values.full_name = Main.contragent.full_name;
    values.inn=Main.contragent.inn;
    values.account = Ext.util.Format.account(Main.contragent.id);
    var textToSignTpl = getApplyToReturnText();
    var textToSign = textToSignTpl.applyTemplate(values);
    
    var win = new Application.components.promptWindow({
      title: 'Заявка на возврат денежных средств',
      cmpType: 'Application.components.SignatureForm',
      parentCmp: this,
      cmpParams: {
        api: RPC.Finance.applyToReturn,
        signatureText : textToSign,
        signatureTextHeight: 250,
        useFormHandler: false,
        success_fn : function() {
          win.close();
          win.parentCmp.fireEvent('applic_added');
        },
        items: [
          {
            xtype: 'hidden',
            name: 'contragent_id',
            value: Main.contragent.id
          },
          {
            xtype: 'hidden',
            name: 'sum',
            value: values.sum
          }
        ]
      }
    });
    win.show();
  }
});
