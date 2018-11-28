Ext.define('Application.components.auctiondocForm', {
  extend: 'Ext.Panel',
  autoHeight: true,
  procedure: null,
  initComponent: function() {
    var component = this;
    var files_id = Ext.id();
    var new_files_id = Ext.id();
    var items = [];
    if(component.module_type != 'po') {
      items.push({
        xtype: 'fieldset',
        style: 'margin-bottom: 10px; padding-top: 8px;',
        items: [{
            html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                  'Принимаются файлы размером до '+Ext.util.Format.humanizeSize(MAX_UPLOAD_SIZE)+'.'
          }, {
            name: this.name,
            xtype: 'Application.components.multiuploadPanel',
            uploadHandler: RPC.Procedure.addFile,
            deleteHandler: RPC.Procedure.removeFile,
            id: files_id,
            simultaneousUpload: true,
            autoUpload: true,
            listeners: {
              beforeupload: function(cmp) {
                cmp.uploadParams.procedure_id = component.procedure?(component.procedure.procedure_id||0):0;
                cmp.uploadParams.type=1;
              },
              uploadcomplete: function(result, action) {
                if (result.success
                    && result.procedure_id
                    && component.procedure
                    && result.procedure_id!=component.procedure.procedure_id)
                {
                  component.procedure.fireEvent('idchanged', result.procedure_id);
                }
              }
            }
          }
        ]
      });
    }
    if (component.module_type == 'po') {
      var procedureTypeCombo = this.procedure.procedureBasicForm.information_on_procurement.method_of_determining_provider;
        items.push ({
          ref: 'fileForm',
        xtype: 'fieldset',
        style: 'margin-bottom: 10px; padding-top: 8px;',
        items: [{
            html: 'Для добавления файлов документации загружайте их по одному с помощью формы ниже. Количество файлов не ограничено.'
        }, {
          ref: 'multiuploadPanel',
            name: this.name,
            xtype: 'Application.components.multiuploadPanel',
            uploadHandler: RPC.Procedure.addFile,
            //deleteHandler: RPC.Procedure.removeFile,
            docTypeStore: Application.models.Procedure.getDocTypesStoreByProcedureTypeIdFromRPC( procedureTypeCombo.getValue() ? procedureTypeCombo.getValue() : PROCEDURE_TYPE_AUC_DESC),
            comboDescr: true,
            id: new_files_id,
            simultaneousUpload: true,
            autoUpload: true,
            disabled: (component.isDisabled)?component.isDisabled:false,
            listeners: {
              beforeupload: function(cmp) {
                cmp.uploadParams.procedure_id = component.procedure?(component.procedure.procedure_id||0):0;
                cmp.uploadParams.lot_number = 1;
                cmp.uploadParams.type=3;
              },
              uploadcomplete: function(result, action) {
                if (result.success
                    && result.procedure_id
                    && component.procedure
                    && result.procedure_id!=component.procedure.procedure_id)
                {
                  component.procedure.fireEvent('idchanged', result.procedure_id);
                }
              }
            }
          }
        ]
      });

      procedureTypeCombo.addListener('change', function (combo, value) {
        if (this.fileForm && this.fileForm.multiuploadPanel.comboDescr) {
          this.fileForm.multiuploadPanel.updateByDocTypeStore(Application.models.Procedure.getDocTypesStoreByProcedureTypeIdFromRPC(procedureTypeCombo.getValue()))
        }
      }, this);
      procedureTypeCombo.addListener('select', function (combo, value) {
        if (this.fileForm && this.fileForm.multiuploadPanel.comboDescr) {
          this.fileForm.multiuploadPanel.updateByDocTypeStore(Application.models.Procedure.getDocTypesStoreByProcedureTypeIdFromRPC(procedureTypeCombo.getValue()))
        }
      }, this);
    }
    items.push({
        xtype: 'fieldset',
        hidden: !Main.config.lot_doc_deadline && !Main.config.lot_doc_providing_procedure
             && !Main.config.lot_doc_payment_for_copy && !Main.config.lot_doc_rights_duties
             && !Main.config.lot_doc_site_url,
        labelWidth: 500,
        defaults: {
          anchor: '100%'
        },
        items: [{
          fieldLabel: 'Срок предоставления документации',
          border: false,
          hidden: !Main.config.lot_doc_deadline
        }, {
          xtype: 'textarea',
          name: 'doc_deadline',
          hideLabel: true,
          hidden: !Main.config.lot_doc_deadline
        }, {
          fieldLabel: 'Порядок предоставления документации',
          border: false,
          hidden: !Main.config.lot_doc_providing_procedure
        }, {
          xtype: 'textarea',
          name: 'doc_providing_procedure',
          hideLabel: true,
          hidden: !Main.config.lot_doc_providing_procedure
        }, {
          fieldLabel: 'Плата за предоставление копии документации на бумажном носителе',
          border: false,
          hidden: !Main.config.lot_doc_payment_for_copy
        }, {
          xtype: 'textarea',
          name: 'doc_payment_for_copy',
          hideLabel: true,
          hidden: !Main.config.lot_doc_payment_for_copy
        }, {
          fieldLabel: 'Права и обязанности',
          border: false,
          hidden: !Main.config.lot_doc_rights_duties
        }, {
          xtype: 'textarea',
          name: 'doc_rights_duties',
          hideLabel: true,
          hidden: !Main.config.lot_doc_rights_duties
        }, {
          fieldLabel: 'Официальный сайт, на котором размещена документация',
          border: false,
          hidden: !Main.config.lot_doc_site_url
        }, {
          xtype: 'textfield',
          name: 'doc_site_url',
          hideLabel: true,
          hidden: !Main.config.lot_doc_site_url
        }]
      });
    if (component.procedure && component.procedure.procedure_id) {
      items.push(
        {
          xtype: 'button',
          text: 'История файлов',
          handler: function () {
            var win = new Ext.Window({
              title: 'История загрузки файлов',
              width: 700,
              autoHeight: true,
              layout: 'form',
              modal: true,
              items: [{
                xtype: 'Application.components.auctiondocHistory',
                procedure_id: component.procedure ? (component.procedure.procedure_id || 0) : 0
              }],
              buttons: [{
                text: 'Закрыть',
                handler: function () {
                  win.close();
                }
              }]
            });
            win.show();
          }
        }
      );
    }
    if (this.procedure.title == 'Заявка на закупку' || this.procedure.title == 'Извещение о проведении закупки') {
      items.push(
        {
          xtype: 'fieldset',
          title: 'Шаблоны документов',
          items: [
            {
              html: 'Перед загрузкой шаблонов документов необходимо сохранить введенные данные (кнопка "Сохранить")',
              style: {
                marginBottom: '10px'
              }
            },
            {
              xtype: 'button',
              text: 'Скачать Проект договора',
              icon: '/ico/report.png',
              pseudo: 'create_dogovor_report',
              scope: this,
              handler: function (button, eventObject) {
                var procedureData = this.procedure.loadedProcedure;
                if (!procedureData || !procedureData.lots || !procedureData.lots.length) {
                  return;
                }
                if (1 >= procedureData.lots.length) {
                  var lotIndex = 0;
                  var url = '/po/report/dogovor/lotId/' + procedureData.lots[lotIndex].id;
                  var display = {
                    download: true, wait_disable: true
                  };
                  var params = {};
                  performAjaxRPCCall(url, params, display);
                }
              }
            },
            {
              xtype: 'button',
              text: 'Скачать Информационная карта',
              icon: '/ico/report.png',
              pseudo: 'create_information_map',
              scope: this,
              handler: function (button, eventObject) {
                var procedureData = this.procedure.loadedProcedure;
                if (!procedureData) {
                  return;
                }
                window.open('/po/report/informationMap/procedureId/' + procedureData.id);
              }
            },
            {
              xtype: 'button',
              text: 'Скачать Заявку на участие в конкурсе',
              icon: '/ico/report.png',
              pseudo: 'create_applic_form_report',
              scope: this,
              hidden: function() {
                if (!component.procedure) {
                  return true;
                }
                return component.procedure.backUrl.indexOf('publish')==-1;
              }(),
              handler: function (button, eventObject) {
                var procedureData = this.procedure.loadedProcedure;
                if (!procedureData || !procedureData.lots || !procedureData.lots.length) {
                  return;
                }
                if (1 == procedureData.lots.length) {
                  var lotIndex = 0;
                  var url = '/po/report/applicform/lotId/' + procedureData.lots[lotIndex].id;
                  var display = {
                    download: true, wait_disable: true
                  };
                  var params = {};
                  performAjaxRPCCall(url, params, display);
                }
              }
            },
            {
              xtype: 'button',
              text: 'Скачать Закупочную документацию',
              icon: '/ico/report.png',
              pseudo: 'create_zakupdoc_report',
              scope: this,
              hidden: function() {
                if (!component.procedure) {
                  return true;
                }
                return component.procedure.backUrl.indexOf('publish')==-1;
              }(),
              handler: function (button, eventObject) {
                var procedureData = this.procedure.loadedProcedure;
                if (!procedureData || !procedureData.lots || !procedureData.lots.length) {
                  return;
                }
                if (1 == procedureData.lots.length) {
                  var lotIndex = 0;
                  var url = '/po/report/zakupdoc/id/' + procedureData.lots[lotIndex].id;
                  var display = {
                    download: true, wait_disable: true
                  };
                  var params = {};
                  performAjaxRPCCall(url, params, display);
                }
              }
            },
            {
              xtype: 'button',
              text: 'Скачать Архив для объединения в pdf',
              icon: '/ico/report.png',
              pseudo: 'create_pdf_zip',
              hidden: function() {
                if (!component.procedure) {
                  return true;
                }
                return component.procedure.backUrl.indexOf('publish')==-1;
              }(),
              scope: this,
              handler: function (button, eventObject) {
                var procedureData = this.procedure.loadedProcedure;
                if (!procedureData || !procedureData.lots || !procedureData.lots.length) {
                  return;
                }
                if (1 == procedureData.lots.length) {
                  var lotIndex = 0;
                  var url = '/po/report/testpdfmerging/lotId/' + procedureData.lots[lotIndex].id;
                  var display = {
                    download: true, wait_disable: true
                  };
                  var params = {};
                  performAjaxRPCCall(url, params, display);
                }
              }
            },
            {
              xtype: 'button',
              text: 'Скачать извещение',
              icon: '/ico/note.png',
              pseudo: 'create_notice_report',
              scope: this,
              hidden: function() {
                if (!component.procedure) {
                  return true;
                }
                return component.procedure.backUrl.indexOf('publish')==-1;
              }(),
              handler: function (button, eventObject) {
                var procedureData = this.procedure.loadedProcedure;
                if (!procedureData || !procedureData.lots || !procedureData.lots.length) {
                  return;
                }
                if (1 == procedureData.lots.length) {
                  var lotIndex = 0;
                  var url = '/po/report/noticedoc/id/' + procedureData.id;
                  var display = {
                    download: true, wait_disable: true
                  };
                  var params = {};
                  performAjaxRPCCall(url, params, display);
                }
              }
            }
          ]
        }
      );
    }

    Ext.apply(this, {
      bodyCssClass: 'subpanel-top-padding',
      items: items

    });
    Application.components.auctiondocForm.superclass.initComponent.call(this);
  }
});
