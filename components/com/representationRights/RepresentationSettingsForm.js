Ext.define('Application.components.RepresentationSettingsForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
      var okButton = Ext.id();
      var checkBox = Ext.id();
      var id = Main.contragent.id;
      var params;
      var flag;
      var items = [{
              xtype : 'checkbox',
              name : 'show_applications',
              boxLabel : 'Отображать заявки на стадии рассмотрения подведомственным организациям',
              id : checkBox
      }];
      var buttons = [{
          text : 'Сохранить',
          id : okButton,
          scope: this,
          handler : function (){
              params = {represented_is_shown : Ext.getCmp(checkBox).checked};
              performRPCCall(RPC.Company.saveRepresentationSettings, [params], null, function(response){
              history.back();
          });
          }
      },
      {
          text : 'Отмена',
          handler : function () {
          history.back();
          }
      }];
    Ext.apply(this, {
        xtype: 'panel',
        title: 'Настройте отображение процедур',
        layout:'form',
        bodyStyle: 'padding: 10px 0 0 0',
        labelWidth:  150,
        signatureTextName : 'signature_text',
        signatureTextHeight: 100,
        hideSignatureData: true,
        showFieldset: true,
        items: items,
        buttons: buttons,
        frame: true,
        autoScroll: false,
        listeners: {
        beforerender: function() {
            performRPCCall(RPC.Company.load, [{id: id}], {wait_disable : true}, function (response){
                flag = response.data['represented_is_shown'];
                Ext.getCmp(checkBox).setValue(flag);
            });
        }
        }
    });
  Application.components.RepresentationSettingsForm.superclass.initComponent.call(this);
  }
  
});
