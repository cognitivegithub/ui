Application.components.RepresentationRightsForm = Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    var okButton = Ext.id();
    var validForId = Ext.id();
    var withoutValidForId = Ext.id();
    var organizationId = Ext.id();
    var items = [{
        xtype:          'combo',
        fieldLabel:     'Введите часть наименования или ИНН организации',
        store :         getContragentStoreByName(),
        name:           'contragent_id',
        id:             organizationId,
        mode:           'remote',
        valueField:     'rowid',
        displayField:   'full_name',
        hiddenName :    'contragent_id',
        style:          'margin-bottom: 10px',
        minChars:       3,
        pageSize:       10,
        hideTrigger:    true,
        forceSelection: true,
        typeAhead:      true,
        triggerAction:  'all'
      }, {
        xtype: 'datefield',
        id: validForId,
        fieldLabel: 'Дата истечения срока действия права на организацию процедур от имени данной организации',
        name: 'valid_for',
        format: 'd.m.Y',
        disabled: true
      }, {
        xtype: 'checkbox',
        name: 'without_valid_for',
        boxLabel: 'Без срока действия',
        id: withoutValidForId,
        checked: true,
        listeners: {
          'check': function(cb, checked) {
            if (checked) {
              Ext.getCmp(validForId).disable();
            } else {
              Ext.getCmp(validForId).enable();
            }
          }
        }
    }];
    var buttons= [{
      text: 'Отправить на рассмотрение',
      id:    okButton,
      scope: this,
      handler: function(){
        if (!Ext.getCmp(organizationId).getValue()) {
          alert('Выберите организацию, права которой хотите представлять.');
          return false;
        }
        if (!Ext.getCmp(validForId).getValue() && (!Ext.getCmp(withoutValidForId).checked))  {
          alert('Заполните срок действия прав представительства.');
          return false;
        }
        performRPCCall(RPC.Company.representationText, [signComponent.form.getValues()], null, function(result){
          if (result && result.success) {
            Ext.getCmp(okButton).hide();
//            Ext.getCmp(fieldSetId).hide();
            for (var i=0; i < signComponent.form.items.items.length; i++) {
              signComponent.form.items.items[i].hide();
            }
            signComponent.fireEvent('showSignData', result.confirmation);
          } else {
            Ext.Msg.alert('Ошибка', result.message);
          }
        });
      }
    }, {
      text: 'Отменить',
      handler: function() {
        redirect_to('company/representedrequestslist');
      }
    }];

    var signComponent = new Application.components.SignatureForm({
      xtype: 'Application.components.SignatureForm',
      title: 'Выберите организацию, для которой хотите выступать организатором процедур',
      defaultLayout:'form',
      bodyStyle: 'padding-top: 10px',
      bodyCssClass: 'subpanel',
      labelWidth: 300,
      signatureTextName : 'signature_text',
      signatureTextHeight: 150,
      hideSignatureData: true,
      showFieldset: true,
      api: RPC.Company.saveRepresentationRequest,
      items: items,
      buttons: buttons
    });
    Ext.apply(this, {
      frame: false,
      defaults: {
        autoScroll: false
      },
      items: [
        signComponent
      ]
    });
    
    Application.components.RepresentationRightsForm.superclass.initComponent.call(this);
  }
});
