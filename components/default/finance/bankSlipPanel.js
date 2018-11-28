
Ext.define('Application.components.bankSlipPanel', {
  extend: 'Ext.form.Panel',
  frame: true,
  fileUpload: true,
  bodyStyle: 'padding-top: 5px;',
  labelWidth: 300,
  title: "Загрузка выписки",
  initComponent: function() {
  var component = this;
  var bill_uploadpanel_id = Ext.id();
  this.addEvents('data_loaded');
  
  Ext.apply(this, {
    autoHeight: true,
    items: [
      {
        anchor      : '100%',
        html        : '<span style="font-size:12px"> Файл выписки системы банк-клиент в формате 1С : <br><br> </span>'
      },{
        xtype       : 'Application.components.UploadFilePanel',
        fieldname   : 'path',
        id          : bill_uploadpanel_id,
        width       : '100%',
        anchor      : '100%',
        buttonText  : 'Обзор...',
        hideLabel   : true,
        allowBlank  : false,
        allowCancel : false
      }
    ],
    buttons: [{
        text        : 'Загрузить',
        handler     : function() {
          var values = component.getForm().getValues();
          /*var path = values.path;
          if (path.slice(path.length-4, path.length) == '.txt') {*/
            performSave(component, null, 'data_loaded',true);
         /* } else {
            Ext.MessageBox.alert('Информация', 'Файл должен иметь расширение .txt');
          }*/
        }
      }
    ],
    listeners: {
      data_loaded   : function(resp) {
        var added_entries='';
        var not_added_entries='';
        if(resp.result.added!='') 
          added_entries = resp.result.added;
        if(resp.result.not_added!='')
          not_added_entries = resp.result.not_added;
        
        var win = new Ext.Window({
          title: 'Журнал записей',
          width: 730,
          height: 450,
          closeAction: 'hide',
          plain: true,
          items: [
          {
            xtype: 'panel',
            id: 'property_form',
            bodyStyle: 'background-color: #CAD8EA; padding-left:8px',
            border: false,
            defaults: {
                width: 700,
                border: false,
                hideLabel: true, 
                bodyStyle: 'background-color: #CAD8EA'
            },
            items: [
            {
              html: '<span style="font-size:12px"><br>Произведенные операции:<br></span>'
            },
            {
              xtype: 'textarea',
              id: 'added',
              name: 'added',
              value: added_entries,
              height: 156
            },
            {
              html: '<span style="font-size:12px"><br>Не произведенные операции:<br></span>'
            }, 
            {
              xtype: 'textarea',
              id: 'not_added',
              name: 'not_added',
              value: not_added_entries,
              height: 156
            }]
          }],
          buttons: [{
            text: 'Закрыть',
            handler: function(){
                win.hide();
            }
          }]
      });
      win.show();
      }
    }
  });
  Application.components.bankSlipPanel.superclass.initComponent.call(this);
  this.form.api = {
      submit: RPC.Finance.parseBankSlip
    };
    this.form.waitMsgTarget = true;
  }
});