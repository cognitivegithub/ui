
Application.components.procedureCancelForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    component.lot_panel_id = Ext.id();

    var notify_text_id = Ext.id(),
      deadline_cmp = Ext.id(), //<--2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
      deadline_ends_cmp = Ext.id(), //<--2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
      filepanel_id = Ext.id();

    this.addEvents('dataload');

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      title: 'Извещение об отказе от проведения закупки',
      fileUpload: true,
      items : [{
        //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
        id: deadline_ends_cmp,
        border: false,
        hidden: true,
        bodyStyle: 'font-size: 12px'
        }, {      
        //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
        id: deadline_cmp,
        border: false,
        hidden: true,
        bodyStyle: 'font-size: 12px'
        }, {
          xtype: 'Application.components.procedureViewPanel',
          id: component.lot_panel_id,
          procedure_id: component.procedure_id,
          procedureAutoLoad : true,
          autoHeight: true,
          frame: false,
          border: false,
          style: 'padding-bottom: 5px',
          fields: {
            'title'                       : 'Наименование процедуры:',
            'procedure_type_vocab'        : 'Форма торгов:',
            'date_published'              : 'Дата публикации:'
          },
          listeners     : {
            'dataload'  : function(procedure) {
              component.procedure = procedure;
              if(component.procedure.cancel_files) {
                Ext.getCmp(filepanel_id).setValues(component.procedure.cancel_files);
              }
              if (component.lot_id) {
                var lots = procedure.lots;
                for(var l in lots) {
                  if (lots[l].id == component.lot_id) {
                    component.setTitle('Извещение об отказе от проведения закупки №' + procedure.registry_number);
                    break;
                  }
                }
              }
              //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
              var date_may_canceled = parseDate(component.procedure.date_may_canceled),
                      now = new Date();
              if (date_may_canceled) {
                Ext.getCmp(deadline_ends_cmp).update('<div style="background-color: #C92100; padding: 10px; color: white"><b>Крайний срок отказа от проведения процедуры <u>истёк</u> '+
                                                      date_may_canceled.format('d.m.Y')+
                                                      '</b></div>');
                Ext.getCmp(deadline_ends_cmp).setVisible(now > date_may_canceled);
                Ext.getCmp(deadline_cmp).update('<div style="background-color: #99bbe8; padding: 10px"><b>Крайний срок отказа от проведения процедуры '+
                                                      date_may_canceled.format('d.m.Y')+
                                                      '.</b></div>');
                Ext.getCmp(deadline_cmp).setVisible(now <= date_may_canceled);
              }
            }
          }
        }, {
          xtype: 'fieldset',
          title: 'Сведения от отказе от проведения закупки',
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
              name: 'cancel_text',
              id: notify_text_id,
              anchor: '100%',
              fieldLabel: 'Основания для отказа',
              height: 70
            },
            {
              xtype: 'fieldset',
              title: 'Документы об отказе от проведения закупки',
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
                      if (component.lot_id) {
                        cmp.uploadParams.lot_id = component.lot_id;
                      } else {
                        cmp.uploadParams.lot_id = null;
                      }
                      cmp.uploadParams.type=2;
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
          text: 'Опубликовать',
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
            var parameters = this.getValues();

            tpl = getProcedureCancelTemplate();
            var data = {
              id: component.procedure.id,
              registry_number: component.procedure.registry_number,
              date_cancelled: Ext.util.Format.localDateRenderer(new Date()).replace('&nbsp;', ' '),
              user_fio: Main.user.full_name,
              cancel_basis: parameters.cancel_text
            };
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
              title: 'Отказ от проведения закупки',
              cmpType: 'Application.components.SignatureForm',
              parentCmp: this,
              cmpParams: {
                api: RPC.Procedure.cancel,
                signatureText : signatureText,
                signatureTextHeight: 250,
                useFormHandler: false,
                success_fn : function(resp) {
                  win.close();
                  echoResponseMessage(resp);
                  redirect_to('po/procedure/index');
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
    Application.components.procedureCancelForm.superclass.initComponent.call(this);
  }
});
