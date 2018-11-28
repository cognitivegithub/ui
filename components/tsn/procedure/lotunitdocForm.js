
Ext.define('Application.components.lotunitdocForm', {
  extend: 'Ext.form.FieldSet',
  autoHeight: true,
  initComponent: function() {
    var component = this;
    var files_id = Ext.id();
    
    Ext.apply(this, {
      bodyCssClass: 'subpanel',
      defaults: {
        border: false
      },
      items: [{
        html: 'Приложите к описанию товара любой документ на Ваше усмотрение. Это может быть лицензия, сертификат,'+
              ' технический паспорт, документы о приобретении Вами товара, таможенные документы и др.<br>'+
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
            //alert((component.procedure_id)?component.procedure_id : component.procform?component.procform.procedure_id:0);
            cmp.uploadParams.procedure_id = component.procedure_id?component.procedure_id : (component.procform ?(component.procform.procedure_id||0):0);
            cmp.uploadParams.type=component.type;
          },
          uploadcomplete: function(result, action) {
            if (result.success
                && result.procedure_id
                && component.procform
                && result.procedure_id!=component.procform.procedure_id)
            {
              component.procedure_id = result.procedure_id;
              component.procform.fireEvent('idchanged', result.procedure_id);
            }
          }
        }
      }]
    });
    Application.components.lotunitdocForm.superclass.initComponent.call(this);
  }
});
