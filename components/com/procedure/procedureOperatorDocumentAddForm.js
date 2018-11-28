
Ext.define('Application.components.procedureOperatorDocumentAddForm', {
    extend : 'Ext.form.Panel',
    frame : false,
    border : false,
    initComponent : function () {
      var component = this;
      component.lot_panel_id = Ext.id();

      var notify_text_id = Ext.id(),
        filepanel_id = Ext.id();

      this.addEvents('dataload');

      Ext.apply(this,
        {
          labelWidth: 150,
          frame: true,
          autoScroll: true,
          title: 'Загрузка документа в извещение',
          fileUpload: true,
          items : [
            {
              xtype: 'Application.components.procedureViewPanel',
              id: component.lot_panel_id,
              procedure_id: component.procedure_id,
              procedureAutoLoad : true,
              title: 'Сведения о процедуре',
              autoHeight: true,
              frame: true,
              border: false,
              style: 'padding-bottom: 5px',
              listeners     : {
                'dataload'  : function(procedure) {
                  component.procedure = procedure;
                  if(component.procedure.operator_files && component.procedure.operator_files[component.lot_id]) {
                    Ext.getCmp(filepanel_id).setValues(component.procedure.operator_files[component.lot_id]);
                  }
                  if (component.lot_id) {
                    var lots = procedure.lots;
                    for(var l in lots) {
                      if (lots[l].id == component.lot_id) {
                        component.setTitle('Загрузка документа в извещение лота №' + lots[l].number + ' процедуры №' + procedure.registry_number + ' в электронной форме');
                        component.lot_number = lots[l].number;
                        var notify_text = Ext.getCmp(notify_text_id);
                        notify_text.setValue('На странице процедуры ' + procedure.registry_number + ' лота №' + lots[l].number + ' в разделе «Извещение» опубликован(ы) документ(ы)');
                        break;
                      }
                    }
                  }
                }
              }
            }, {
              xtype: 'fieldset',
              title: 'Сведения о прикрепляемых документах',
              style: 'margin: 5px;',
              items : [
                {
                  xtype: 'hidden',
                  name: 'procedure_id',
                  value: component.procedure_id
                },
                {
                  xtype: 'hidden',
                  name: 'lot_id',
                  value: component.lot_id
                },
                {
                  xtype: 'textarea',
                  name: 'notify_text',
                  id: notify_text_id,
                  anchor: '100%',
                  fieldLabel: 'Текст уведомления',
                  height: 70
                },
                {
                  xtype: 'fieldset',
                  title: 'Документы для загрузки',
                  items: [
                    {
                      html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                        ACCEPTED_FILES+'.',
                      cls: 'spaced-bottom-shallow'
                    },
                    {
                      id: filepanel_id,
                      xtype: 'Application.components.multiuploadPanel',
                      uploadHandler: RPC.Procedure.addFile,
                      deleteHandler: RPC.Procedure.removeFile,
                      name: 'file',
                      simultaneousUpload: true,
                      autoUpload: true,
                      requiredDescr: false,
                      requiredMark: true,
                      listeners: {
                        beforeupload: function(cmp) {
                          cmp.uploadParams.procedure_id = component.procedure_id;
                          cmp.uploadParams.lot_id = component.lot_id;
                          cmp.uploadParams.type=4;
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ],
          buttons: [
            {
              text: 'Подписать и направить',
              scope: this,
              formBind : true,
              handler: function(){
                var tpl;
                var filepanel = Ext.getCmp(filepanel_id);
                var files_info = filepanel.getFilesInfo();
                if (this.getForm().isValid() !== true || files_info.length == 0) {
                  Ext.Msg.alert('Ошибка', 'Заполнены не все поля');
                  return;
                }
                var files_text = '';
                for(var cnt = 0; cnt<files_info.length; cnt++ ) {
                  files_text += files_info[cnt].name +
                    ' (контрольная сумма ГОСТ Р 34.11-94  ' + files_info[cnt].hash +
                    ', размер ' + files_info[cnt].size + ' байт);\n';
                }

                var parameters = this.getValues();

                tpl = getProcedureOperatorDocumentAddTemplate();
                var data = {
                  id: component.procedure.id,
                  registry_number: component.procedure.registry_number,
                  date_cancelled: Ext.util.Format.localDateRenderer(new Date()).replace('&nbsp;', ' '),
                  user_fio: Main.user.full_name,
                  notify_text: parameters.notify_text,
                  files_text: files_text
                };
                if (component.lot_id) {
                  Ext.apply(data, {lot_number: component.lot_number});
                }
                var signatureText = tpl.applyTemplate(data);

                //console.log(parameters);

                var winItems = [];
                for(var paramName in parameters) {
                  if(parameters.hasOwnProperty(paramName)) {
                    winItems.push({
                      xtype: 'hidden',
                      name: paramName,
                      value: parameters[paramName]
                    });
                  }
                }

                var win = new Application.components.promptWindow({
                  title: 'Загрузка документа в извещение',
                  cmpType: 'Application.components.SignatureForm',
                  parentCmp: this,
                  cmpParams: {
                    api: RPC.Procedure.operatordocumentadd,
                    signatureText : signatureText,
                    signatureTextHeight: 250,
                    useFormHandler: false,
                    success_fn : function(resp) {
                      win.close();
                      echoResponseMessage(resp);
                      redirect_to('com/procedure/index');
                    },
                    items: winItems
                  }
                });
                win.show();
              }
            }
          ],
          getValues : function() {
            var values = {};
            collectComponentValues(this, values, false);
            return values;
          }
        });
      Application.components.procedureOperatorDocumentAddForm.superclass.initComponent.call(this);
    }
  });

