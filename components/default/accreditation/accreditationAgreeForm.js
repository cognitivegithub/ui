Application.components.accreditationAgreeForm = Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;

    var agreementCheckboxesData = [
      {'full_name': 'Наименование организации:'},
      {'short_name': 'Краткое наименование:'},
      {'inn': 'ИНН:'},
      {'ogrn': 'ОГРН:'},
      {'legal_address': 'Юридический адрес:'}
    ];

    var agreementCheckboxes = [];
    for(i = 0; i < agreementCheckboxesData.length; i++) {
      var item = agreementCheckboxesData[i];
      for(var j in item) {
        if (item.hasOwnProperty(j)) {
          agreementCheckboxes.push({
            xtype: 'checkbox',
            id: 'checkbox' + i,
            name: j + '_valid',
            hideLabel: true,
            boxLabel: '<b>' +item[j]+'</b> ' + (this.application[j] ? this.application[j] : 'отсутствует'),
            listeners: {
              'check': function() {
                checkAllBoxes();
              }
            }
          });
        }
      }
    }

    var signComponent = new Application.components.SignatureForm({
      title: 'Подтверждение аккредитации',
      signatureText: component.confirmation,
      signatureTextHeight: '80',
      api: RPC.Accreditation.resolve,
      items: [
          agreementCheckboxes
        , {
          xtype: 'hidden',
          name: 'result',
          value: 'agree'
        }, {
          xtype: 'hidden',
          name: 'id',
          value: component.accId
        }, {
          xtype: 'hidden',
          name: 'type',
          value: component.accType
        }
      ]
      ,
      listeners: {
        afterrender: function() {
          checkAllBoxes();
        }
      }
    });

    function checkAllBoxes() {
      var flag = false;
      for (var i = 0; i < 5; i++) {
        var cmp = Ext.getCmp('checkbox' + i);
        if (Ext.isEmpty(cmp)) continue;
        if (!cmp.getValue()) flag = true;
      }
      signComponent.fireEvent('dataSelected', flag);
    }

    Ext.apply(this, {
      labelWidth: 200,
      frame: component.hide_frame==true ? false : true,
      items: [
        signComponent
      ]
    });
    
    Application.components.accreditationAgreeForm.superclass.initComponent.call(this);
  }
});
