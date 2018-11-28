
Ext.define('Application.components.imgUploadForm', {
  extend: 'Ext.Panel',
  initComponent: function() {
    var component = this;
    var files_id = Ext.id();
    this.addEvents('uploadcomplete', 'idchaged');
    if(!component.procedure_id) {
      component.procedure_id = component.parent.procedure_id;
    }
    Ext.apply(this, {
      bodyCssClass: 'subpanel',
      items: [
      {
        xtype: 'fieldset',
        autoHeight: true,
        title: 'Добавить фото или изображение',
        defaults: {
          border: false
        },
        items:[
        {
          html: 'Приложите фото Вашего товара. Наличие фотографий значительно повышает шансы продать товар.<br> '+
                'Для размещения файлов загружайте их по одному с помощью формы ниже. '+
                'Принимаются файлы размером до '+Ext.util.Format.humanizeSize(PIC_UPLOAD_SIZE)+
                ' в следующих форматах '+PIC_ACCEPTED_FORMATS+'.'
        }, {
          //name: this.name,
          hideFileList: true,
          xtype: 'Application.components.multiuploadPanel',
          uploadHandler: RPC_tsn.Procedure.addFile,
          deleteHandler: RPC_tsn.Procedure.removeFile,
          id: files_id,
          simultaneousUpload: true,
          autoUpload: true,
          listeners: {
            beforeupload: function(cmp) {
              cmp.uploadParams.procedure_id = component.procedure_id||0;
              cmp.uploadParams.type=1;
            },
            uploadcomplete: function(result, action) {
              component.fireEvent('uploadcomplete', result);
            }
          }
        }]
      }],
      listeners : {
        idchanged: function(id) {
          this.procedure_id=id;
        }
      }
    });
    Application.components.imgUploadForm.superclass.initComponent.call(this);
  }
});
