Application.components.accreditationDeclineForm =  Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    function makeText() {
      var noInfo = Ext.getCmp('noInfo');
      var nonvalidInfo = Ext.getCmp('nonvalidInfo');
      if (noInfo.getValue() || nonvalidInfo.getValue()) {
        if (noInfo.getValue()) var text = "Ваша заявка на аккредитацию отклонена на следующих основаниях: непредоставление документов и сведений, предусмотренных законом о размещении заказа путем проведения процедуры в электронной форме.\n";
        else if (nonvalidInfo.getValue()) text = "Ваша заявка на аккредитацию отклонена на следующих основаниях: предоставление документов, не соответствующих требованиям, установленным законодательством Российской Федерации.\n";
        var docs = [];
        for(var i = 0; i < component.requirements.length; i++) {
          if (Ext.getCmp('check_' + i).getValue()) docs.push(component.requirements[i]);
        }
        if (docs.length > 0) {
          text += "Список документов: \n"+docs.join(";\n");
        }
        Ext.get('basis').dom.value = text;
      }
    }

    var declineCheckboxes = [];
    for(var i = 0; i < component.requirements.length; i++) {
      var item = component.requirements[i];
      declineCheckboxes.push(
        {
          xtype: 'checkbox',
          id: 'check_' + i,
          name: 'docs[]',
          hideLabel: true,
          boxLabel: item,
          listeners: {
            check: function() {
              makeText();
            }
          }
        }
      );
    }

    var items = [{
        xtype: 'hidden',
        name: 'result',
        value: 'decline'
      }, {
        xtype: 'hidden',
        name: 'signature'
      }, {
        xtype: 'hidden',
        name: 'id',
        value: this.accId
      }, {
        xtype: 'hidden',
        name: 'type',
        value: this.accType
      }, {
        xtype: 'radio',
        id: 'noInfo',
        hideLabel: true,
        boxLabel: 'Непредоставление документов и сведений, предусмотренных законом о размещении заказа путем проведения процедуры в электронной форме',
        name: 'reason',
        inputValue: 1,
        listeners: {
          'check' : function () {
            makeText();
          }
        }
      }, {
        xtype: 'radio',
        id: 'nonvalidInfo',
        hideLabel: true,
        boxLabel: 'Предоставление документов, не соответствующих требованиям, установленным законодательством Российской Федерации',
        name: 'reason',
        inputValue: 2,
        listeners: {
          'check' : function () {
            makeText();
          }
        }
      }, {
        style: 'margin-top: 10px',
        xtype: 'fieldset',
        id: 'docs2',
        title: 'Документы',
        autoHeight: true,
        items: [declineCheckboxes]
      }];
      var declineComponent = {
        xtype: 'Application.components.SignatureForm',
        title: 'Основание принятия решения об отказе',
        signatureText: this.confirmation,
        signatureTextName : 'basis',
        signatureTextHeight: 150,
        isWriteable: true,
        api: RPC.Accreditation.resolve,
        items: items
      };
      Ext.apply(this, {
        labelWidth: 200,
        frame: component.hide_frame==true ? false : true,
        layout : 'form',
        items: [
          declineComponent
        ]
      });

    Application.components.accreditationDeclineForm.superclass.initComponent.call(this);
  }
});
