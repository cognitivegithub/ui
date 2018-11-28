
Application.components.ProcedureDocumentAddForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    component.lot_panel_id = Ext.id();
    this.file_panel_id = Ext.id();

    this.addEvents('dataload');

    this.deleteHandler = function(fileInfo) {
      performRPCCall(
        RPC.Protocol.deleteProtocol,
        [fileInfo],
        {wait_text: 'Файл удаляется. Подождите...'},
        function(result) {
          if (result.success) {
            component.reloadFilePanel();
            echoResponseMessage(result);
          } else {
            echoResponseMessage(result);
          }
      });
    };

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      title: 'Загрузка документа в состав протоколов',
      fileUpload: true,
      items : [
        {
          xtype: 'Application.components.procedureViewPanel',
          id: component.lot_panel_id,
          procedure_id: component.procedure_id,
          procedureAutoLoad : true,
          autoHeight: true,
          frame: false,
          border: false,
          style: 'padding-bottom: 5px',
          listeners     : {
            'dataload'  : function(procedure) {
              component.procedure = procedure;
              if (procedure.procedure_type == PROCEDURE_TYPE_TENDER) {
                delete (this.fields.step_is_exact);
              } 
              if (component.lot_id && procedure && procedure.lots) {
                var lots = procedure.lots;
                for (var l in lots) {
                  if (lots[l].id == component.lot_id) {
                    component.setTitle('Загрузка документа в состав протоколов лота №' +
                      lots[l].number + ' процедуры №' + procedure.registry_number);
                    component.lot_number = lots[l].number;
                    break;
                  }
                }
              }
              component.reloadFilePanel();
            }
          }
        }, {
          xtype: 'fieldset',
          title: 'Прочие документы в составе протоколов',
          style: 'margin: 5px 5px 0px 5px;',
          items: [
            {
              html: ACCEPTED_FILES + '.',
              cls: 'spaced-bottom-shallow'
            }, {
              xtype: 'Application.components.multiuploadPanel',
              uploadHandler: RPC.Procedure.documentAdd,
              id: component.file_panel_id,
              name: 'file',
              simultaneousUpload: true,
              autoUpload: true,
              withDescr: false,
              requiredDescr: false,
              requiredMark: true,
              listeners: {
                beforeupload: function(cmp) {
                  cmp.uploadParams.procedure_id = component.procedure_id;
                  cmp.uploadParams.lot_id = component.lot_id;
                },
                uploadcomplete: function() {
                  component.reloadFilePanel();
                }
              }
            }
          ]
        }

      ],
      buttons: [
        {
          text: 'Подписать и направить',
          scope: this,
          formBind : true,
          handler: function() {
            var tpl;

            var file_panel = Ext.getCmp(component.file_panel_id);
            var files_info = file_panel.getFilesInfo();
            if (!files_info || !files_info.length) {
              Ext.Msg.alert('Ошибка', 'Не прикреплен документ');
              return;
            }
            var files_text = '';
            for (var cnt = 0; cnt < files_info.length; cnt++) {
              if (files_info[cnt].actual == true) {
                continue;
              }

              files_text += files_info[cnt].name +
                ' (контрольная сумма ГОСТ Р 34.11-94  ' + files_info[cnt].hash +
                ', размер ' + files_info[cnt].size + ' байт);\n';
            }

            tpl = getProcedureDocumentAddTemplate();

            var signatureText = tpl.applyTemplate({
              id: component.procedure.id,
              registry_number: component.procedure.registry_number,
              user_fio: Main.user.full_name,
              lot_number: component.lot_number
            });
            signatureText += files_text;

            var winItems = [];
            winItems.push({
              xtype: 'hidden',
              name: 'lot_id',
              value: component.lot_id
            });
            winItems.push({
              xtype: 'hidden',
              name: 'procedure_id',
              value: component.procedure_id
            });

            var win = new Application.components.promptWindow({
              title: 'Загрузка документа в состав протоколов',
              cmpType: 'Application.components.SignatureForm',
              parentCmp: this,
              cmpParams: {
                api: RPC.Procedure.documentSign,
                signatureText : signatureText,
                signatureTextHeight: 250,
                useFormHandler: false,
                success_fn : function(resp) {
                  win.close();
                  echoResponseMessage(resp);
                  redirect_to('com/protocol/index/lot/' + component.lot_id);
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
      },
      reloadFilePanel : function() {
        var component = this;
        var params = {
          wait_delay: 0,
          wait_text: 'Загружаются файлы протоколов. Подождите...'
        };
        performRPCCall(RPC.Protocol.getProtocolsByLot, [{lot_id: component.lot_id}], params, function(result) {
          if (result.success) {
            var protocols = [];
            // @codingStandardsIgnoreStart
            if (result.protocols && result.protocols.length) {
              var someId = 50; // Решение для обхода чекстайлов после смены crlf на lf.
              for (var cnt = 0; cnt < result.protocols.length; cnt++) {
                if (result.protocols[cnt].html[0].type_id == someId
                  && (result.protocols[cnt].html[0].actual_draft == true)) {

                  if (result.protocols[cnt].html[0].actual == true) {
                    result.protocols[cnt].html[0].obsolete = true;
                    result.protocols[cnt].html[0].obsolete_text = 'загружен';
                  } else {
                    result.protocols[cnt].html[0].deleteHandler = component.deleteHandler;
                  }
                  protocols.push(result.protocols[cnt].html[0]);

                }
              }
            }
            // @codingStandardsIgnoreEnd
            Ext.getCmp(component.file_panel_id).setValues(protocols);
          } else {
            echoResponseMessage(result);
          }
        });
      }
    });
    Application.components.ProcedureDocumentAddForm.superclass.initComponent.call(this);
  }
});
