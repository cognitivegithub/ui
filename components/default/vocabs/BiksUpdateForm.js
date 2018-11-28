/**
 * Форма для загрузки классификаторва БИКов
 */
Ext.define('Application.components.VocabBiksUpdateForm', {
  extend        : 'Ext.form.Panel',
  frame         : true,
  border        : false,
  autoHeight    : true,

  bodyStyle     : 'padding: 10px 10px 0 10px;',

  method        : 'POST',
  fileUpload    : true,

  initComponent : function () {

    this.items = [
      {
        anchor  : '100%',
        xtype   : 'label',
        text    : 'Выберите файл c базой данных банков (архив формата arj, содержащий файл bnkseek.dbf, либо сам файл dbf).'
      }, {
        xtype         : 'Application.components.UploadFilePanel',
        fieldName     : 'path',
        anchor        : '100%',
        bodyStyle     : 'padding-top: 10px',
        hideLabel     : true,
        allowBlank    : false,
        monitorValid  : true,
        allowCancel   : false
      }
    ];

    this.buttons = [{
      text      : 'Импортировать файл',
      scope     : this,
      formBind  : true,

      handler   : function(button) {
        var fp = button.findParentByType(Application.components.VocabBiksUpdateForm);
        var form = fp.getForm();

        if ( form.isValid() ) {
          performSave(fp);
        }
      }
    }];

    Application.components.VocabBiksUpdateForm.superclass.initComponent.call(this);

    this.form.api = {
      submit  : RPC.Admin.vocabBiks
    };
    this.form.waitMsgTarget = true;

  } // initComponent


}); // Application.components.VocabBiksUpdateForm