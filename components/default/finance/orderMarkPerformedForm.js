Ext.define('Application.components.orderMarkPerformedForm', {
  extend: 'Ext.form.Panel',
  border : false,
  hideTitle: false,
  frame: true,
  layout: 'form',
  labelWidth: 150,
  defaults: {
    anchor: '100%'
  },
  bodyCssClass: 'subpanel-top-padding',
  initComponent : function () {
    var component = this;
    this.addEvents('applic_added');
    
    Ext.apply(this, {
    items: [
      new Ext.form.FileUploadField({
        buttonText: 'Обзор...',
        name: 'file',
        style: 'margin-top: 2px; margin-bottom: 2px;',
        allowBlank: false,
        fieldLabel: 'Файл'
      }), {
        xtype: 'panel',
        border: false,
        frame: false,
        hideLabel: true,
        style: 'margin: 5px 0; color: #15428B; font: bold 11px tahoma,arial,helvetica,sans-serif;',
        html: 'Загрузите файл с платежными поручениями, который отдан на исполнение в банк-клиент.'
    }],
    buttons: [{
      text: 'Загрузить',
      scope: this,
      handler: function() {
        performSave(this, null, 'applic_added');
      }
    }, {
      text: 'Отмена',
      handler: function() {
        component.close_fn();
      }
    }]
  });
  
  Application.components.orderMarkPerformedForm.superclass.initComponent.call(this);
  
  this.form.api = {
    submit: RPC.Finance.markPerformed
  };
  this.form.waitMsgTarget = true;
  }
});
