Application.components.uploadContractForm = Ext.extend(Ext.form.FormPanel, {
  border : false,
  hideTitle: false,
  frame: false,
  layout: 'form',
  labelWidth: 150,
  defaults: {
    anchor: '100%'
  },
  initComponent : function () {
    var component = this;
    var upload_field_id = Ext.id();
    this.addEvents('reload');
    this.items = this.items||[];
    this.items.push(
      new Ext.form.FileUploadField({
        buttonText: 'Обзор...',
        name: 'file',
        allowBlank: false,
        fieldLabel: 'Выберите файл',
        id: upload_field_id
      }),
      {
        html: ACCEPTED_FILES
      },
      {
        xtype: 'hidden',
        name: 'id',
        value: component.params.id
      }, {
        xtype: 'hidden',
        name: 'type_id',
        value: component.params.type_id
      }, {
        xtype: 'hidden',
        name: 'current_customer',
        value: component.params.currentCustomer
      }, {
        xtype: 'hidden',
        name: 'current_supplier',
        value: component.params.currentSupplier
      }
    );
    Ext.apply(this, {
      bodyCssClass: 'subpanel-top-padding',
      buttons: [{
        text: 'Загрузить',
        scope: this,
        formBind : true,
        handler: function() {
          var upload_field = Ext.getCmp(upload_field_id);
          if (!upload_field.getValue()) {
            Ext.Msg.alert('Ошибка', 'Не прикреплен файл');
          } else {
            performSave(component, null, 'reload');
          }
        }
      }, {
        text: 'Отмена',
        handler: function() {
          component.parentWin.win.close();
        }
      }],
      listeners: {
        reload: function() {
          component.componentParent.fireEvent('reload', component.filePanelId);
        }
      }
  });

  Application.components.uploadContractForm.superclass.initComponent.call(this);

  this.form.api = {
    submit: RPC.Contract.add
  };
  this.form.waitMsgTarget = true;
  }
});
