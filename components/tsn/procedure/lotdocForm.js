
Ext.define('Application.components.lotdocForm', {
  extend: 'Ext.panel.Panel',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    var files_id = Ext.id();
        
    Ext.apply(this, {
      items: [
      {
        xtype: 'fieldset', 
        title: 'Проект договора и прочие сопроводительные документы',
        cls: 'spaced-fieldset',
        bodyCls: 'subpanel',
        defaults: {
          border: false
        },
        items: [
        {
          html: 'Приложите проект договора купли-продажи, по которому Вы будете реализовывать товар.<br>'+
                'Для размещения файлов загружайте их по одному с помощью формы ниже. '+
                'Принимаются файлы размером до '+Ext.util.Format.humanizeSize(MAX_UPLOAD_SIZE)+'.'
        }, {
          name: this.name,
          xtype: 'Application.components.multiuploadPanel',
          uploadHandler: RPC_tsn.Procedure.addFile,
          deleteHandler: RPC_tsn.Procedure.removeFile,
          id: files_id,
          simultaneousUpload: true,
          autoUpload: true,
          listeners: {
            beforeupload: function(cmp) {
              cmp.uploadParams.procedure_id = component.parent.procedure_id?(component.parent.procedure_id||0):0;
              cmp.uploadParams.type=undefined;
            },
            uploadcomplete: function(result, action) {
              if (result.success
                  && result.procedure_id
                  && component.parent
                  && result.procedure_id!=component.parent.procedure_id)
              {
                component.parent.fireEvent('idchanged', result.procedure_id);
              }
            }
          }
        }]
      }]
    });
    Application.components.lotdocForm.superclass.initComponent.call(this);
  }
});
