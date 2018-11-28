
Application.components.procedureRestoreForm = Ext.extend(Ext.form.FormPanel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    component.lot_panel_id = Ext.id();

    var time_begin_auction_id = Ext.id(),
      date_begin_auction_id = Ext.id(),
      return_applic_id = Ext.id(),
      return_offer_id = Ext.id(),
      notify_id = Ext.id(),
      notify_customers_id = Ext.id(),
      notify_suppliers_id = Ext.id(),
      notify_title_id = Ext.id(),
      notify_text_id = Ext.id(),
      pause_reason_id = Ext.id();

    component.ids = initIds (['date_published_id','multistep_grid_id', 'date_fieldset_id']);
    
    this.addEvents('lotloaded', 'stepSelected', 'procedurechanged');

    component.lot_steps = [];
    
    component.selected_step_number = 0;

    component.stepGridStore = new Ext.data.JsonStore({
      autoDestroy: true,
      autoLoad: false,
      idProperty: 'id',
      autoSave: false,
      paramsAsHash: true,
      fields: ['id','order_number','step_id','date_start', 'date_end', 'time_start','time_end'],
      data: Application.models.Procedure.prepareStepsData(Application.models.Procedure.getType('2').steps, null, '2')
    });

    var beforeTradeSteps = ['registration', 'qual_registration', 'first_parts', 'correction', 'prequalification', 'applic_opened'];

    this.holidays = null;
    this.workdays = null;

    Ext.apply(this,
     {
      labelWidth: 150,
      frame: true,
      autoScroll: true,
      title: 'Возвращение лота в предыдущий статус',
      fileUpload: true,
      items : [
        {
          xtype: 'Application.components.lotDataPanel',
          id: component.lot_panel_id,
          shortInfo: false,
          frame: true,
          border: false
        }, {
          xtype: 'panel',
          title: 'Параметры восстановления',
          frame: true,
          style: 'margin-top: 10px;',
          border: false,
          layout: 'form',
          labelWidth: 400,
          cls: 'subpanel',
          items : [{
              xtype: 'hidden',
              name: 'lot_id',
              value: component.lot_id
            },
            {
              xtype: 'fieldset',
              title: 'Условия восстановления',
              style: 'margin: 5px;',
              items : [
                {
                  xtype: 'combo',
                  name: 'newstatus',
                  id: 'newstatus',
                  fieldLabel: 'Статус для восстановления',
                  displayField: 'name',
                  valueField: 'step_id',
                  hiddenName: 'status',
                  mode: 'local',
                  triggerAction: 'all',
                  editable: false,
                  forceSelection: true,
                  anchor: '100%',
                  listeners : {
                    select : function() {
                      var step = this.getValue();
                      this.processSelection(step);
                    },
                    valueFilled : function(step) {
                      this.processSelection(step);
                    }
                  },
                  processSelection : function (step) {
                    this.disableFields();
                    Ext.getCmp(notify_id).enable();
                    if(step!='pause') {
                      component.fireEvent('stepSelected', step);
                      Ext.getCmp(notify_text_id).enable();
                      if(step==LOT_STEP_REGISTRATION || step==LOT_STEP_QUAL_REGISTRATION) {
                        Ext.getCmp(return_applic_id).enable();
                      }
                      if(component.procedure_type &&
                          (component.procedure_type==PROCEDURE_TYPE_AUC_ASC
                            || component.procedure_type==PROCEDURE_TYPE_AUC_DESC)
                          && beforeTradeSteps.indexOf(step)
                        ) {
                        Ext.getCmp(return_offer_id).enable();
                      }
                    } else {
                      Ext.getCmp(pause_reason_id).enable();
                      Ext.getCmp(pause_reason_id).show();
                    }
                  },
                  disableFields : function() {
                    Ext.getCmp(return_applic_id).checked = false;
                    Ext.getCmp(return_applic_id).disable();
                    Ext.getCmp(return_offer_id).checked = false;
                    Ext.getCmp(return_offer_id).disable();
                    Ext.getCmp(notify_id).disable();
                    Ext.getCmp(notify_text_id).disable();
                    Ext.getCmp(pause_reason_id).disable();
                    Ext.getCmp(pause_reason_id).hide();
                  }
                },
                {
                  xtype: 'checkbox',
                  name: 'return_applics',
                  id: return_applic_id,
                  disabled: true,
                  checked: false,
                  fieldLabel: 'Вернуть поданные заявки участникам'
                },
                {
                  xtype: 'checkbox',
                  name: 'return_offers',
                  id: return_offer_id,
                  disabled: true,
                  checked: true,
                  fieldLabel: 'Продолжить торги с последнего ценового предложения'
                },
                {
                  xtype: 'checkbox',
                  name: 'notify',
                  id: notify_id,
                  checked: true,
                  disabled: true,
                  hidden: true,
                  fieldLabel: 'Уведомить заинтересованных организаторов и заявителей'
                },
                {
                  xtype: 'checkbox',
                  name: 'notify_customers',
                  id: notify_customers_id,
                  checked: true,
                  disabled: true,
                  fieldLabel: 'Уведомить заинтересованных организаторов'
                },
                {
                  xtype: 'checkbox',
                  name: 'notify_suppliers',
                  id: notify_suppliers_id,
                  checked: true,
                  disabled: true,
                  fieldLabel: 'Уведомить заинтересованных заявителей'
                },
                {
                  xtype: 'textfield',
                  name: 'notification_title',
                  id: notify_title_id,
                  disabled: true,
                  anchor: '100%',
                  fieldLabel: 'Тема уведомления'
                },
                {
                  xtype: 'textarea',
                  name: 'notification_text',
                  id: notify_text_id,
                  disabled: true,
                  anchor: '100%',
                  fieldLabel: 'Текст уведомления',
                  height: 70
                },
                {
                  xtype: 'textarea',
                  name: 'pause_reason',
                  id: pause_reason_id,
                  disabled: true,
                  anchor: '100%',
                  fieldLabel: 'Причина приостановки',
                  hidden: true,
                  height: 70
                }
              ]
            },

            {
              xtype: 'fieldset',
              title: 'Этапы проведения',
              style: 'margin: 5px;',
              id: this.ids.date_fieldset_id,
              items : [
                new Application.components.procedureMultistepGrid({
                  anchor: '100%',
                  frame: false,
                  editable: true,
                  autoScroll: true,
                  autoHeight: true,
                  disabled: true,
                  id: this.ids.multistep_grid_id,
                  steps_editable: true,
                  border: false,
                  loadMask: true,
                  parent: component,
                  baseDate: new Date(),
                  listeners: {
                    added: function() {
                      this.addEvents('procedurechanged');
                      this.relayEvents(component, ['procedurechanged', 'stepSelected']);
                    }
                  }
                })
              ]
            }
          ]
        }
      ],
      buttons: [
        {
          text: 'Восстановить',
          scope: this,
          formBind : true,
          handler: function(){
            var parameters = this.getValues();
            var steps = Application.models.Procedure.getType(component.procedure_type).steps,
                stepString='',
                preposition = ' не позднее ',
                dtfld = 'date_end',
                custom_steps = [],
                step_info,
                date_value,
                block_till_record = component.stepGridStore.getAt(component.stepGridStore.find('step_id', parameters.newstatus));

            if(!Ext.isEmpty(parameters.steps)) {
              custom_steps = parameters.steps;
            } else {
              custom_steps = steps;
            }

            //console.log(parameters);
            var statusName = Application.models.Procedure.getStep(parameters.newstatus).status_name.defaultName;
            if(Application.models.Procedure.getStep(parameters.newstatus).status_name[Application.models.Procedure.type_ids[component.procedure_type]]) {
              statusName = Application.models.Procedure.getStep(parameters.newstatus).status_name[Application.models.Procedure.type_ids[component.procedure_type]];
            }
            var signatureText = "Настоящим удостоверяю, что лот № "+component.lot.number+" процедуры "+component.procedure.registry_number+
              " возвращается в статус "+statusName+" в соответствии с нижеследующим:\n";
            var date_string, field_data, full_date_name, date_value,
              proctype = Application.models.Procedure.type_ids[component.procedure_type];
            switch(parameters.newstatus) {
              case 'pause':
                if(parameters.pause_reason) {
                  signatureText += "Причина приостановки: "+parameters.pause_reason+"\n";
                }
                break;
              case 'contract':
                break;
              case 'archive':
                break;
              default:
                stepString += '\nЭТАПЫ ПРОВЕДЕНИЯ ПРОЦЕДУРЫ\n';
                for(var i=0; i<custom_steps.length; i++) {
                  if(custom_steps[i].order_number<block_till_record.data.order_number) {
                    continue;
                  }

                  if(!Ext.isEmpty(custom_steps[i].date_start)) {
                    preposition = ' ';
                    dtfld = 'date_start';
                  }else{
                    dtfld = 'date_end';
                  }

                  if (custom_steps[i]['step_id'] == 'trade') {
                    dtfld = 'date_start';
                  } else {
                    dtfld = 'date_end';
                  }

                  step_info = Application.models.Procedure.getStep(custom_steps[i].step_id);

                  if(step_info.displayFormat!='d.m.Y') {
                    date_value = Ext.util.Format.localDateText(custom_steps[i][dtfld]);
                  } else {
                    date_value = Ext.util.Format.localDateOnlyRenderer(custom_steps[i][dtfld]);
                  }
                  if (date_value == ''){
                    Ext.Msg.alert('Ошибка', 'Не заполнены даты этапов проведения');
                    return;
                  }

                  parameters[step_info.pseudo] =custom_steps[i][dtfld];

                  stepString = Main.config.procedure_steps[custom_steps[i]['step_id']].full_name+preposition+date_value+'\n';
                  signatureText+=stepString;
                }
                parameters.steps = Ext.util.JSON.encode(custom_steps);
              break;
            }

            if(parameters.return_applics && parameters.return_applics=="On") {
              signatureText += "Возвращение заявок участникам\n";
            }

            if(parameters.return_offers && parameters.return_offers=="On") {
              signatureText += "Продолжить с последнего поданного предложения\n";
            }
//            if(!parameters.notify) {
//              signatureText += "Не уведомлять заинтересованных организаторов и заявителей\n";
//            } else {
//              signatureText += "Уведомить о смене статуса лота заинтересованных организаторов и заявителей\n";
//            }
            if(!parameters.notify_suppliers) {
              signatureText += "Не уведомлять заинтересованных заявителей\n";
            } else {
              signatureText += "Уведомить об изменениях в лоте заинтересованных заявителей\n";
            }
            if(!parameters.notify_customers) {
              signatureText += "Не уведомлять заинтересованных организаторов\n";
            } else {
              signatureText += "Уведомить об изменениях в лоте заинтересованных организаторов\n";
            }
//            if(!parameters.notify) {
//              signatureText += "Не уведомлять заинтересованных организаторов и заявителей\n";
//            } else {
//              signatureText += "Уведомить о смене статуса лота заинтересованных организаторов и заявителей\n";
//            }
            if(parameters.notification_title!=null && parameters.notification_title!='') {
              signatureText += "Тема уведомления: "+parameters.notification_title+"\n";
            }
            if(parameters.notification_text!=null && parameters.notification_text!='') {
              signatureText += "Текст уведомления: "+parameters.notification_text+"\n";
            }

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
              title: 'Восстановление лота',
              cmpType: 'Application.components.SignatureForm',
              parentCmp: this,
              cmpParams: {
                api: RPC.Lot.restore,
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
      },
      setValues: function(v) {
        if(!v) {
          return;
        }
        setComponentValues(this, v, true);
        return this;
      },
      listeners: {
        beforerender : function() {
          Ext.getCmp(component.lot_panel_id).relayEvents(component, ['lotloaded']);
          var steps, type;
        
          Ext.getBody().mask('Загружаем данные');
          RPC.Lot.load(component.lot_id, function(resp) {
            if (resp.success) {
              component.procedure = resp.procedure;
              component.lot = resp.procedure.lot;
              component.procedure_type = resp.procedure.procedure_type;
              var typesStore = Application.models.Procedure.getTypesStoreFromRPC();
              typesStore.load({callback: function() {
                  var record = typesStore.getById(component.procedure_type);
                  component.procedureDateSettings = record.data ;
                  component.fireEvent('lotloaded', resp.procedure);
                  Ext.getBody().unmask();
                  if(component.lot.steps && component.lot.steps.length) {
                    steps = component.lot.steps;
                  } else {
                    type = Application.models.Procedure.type_ids[''+component.procedure_type];
                    steps = Application.models.Procedure.getType(component.procedure_type).steps;
                  }
                  component.lot_steps = steps;
                  component.statusStore = Application.models.Procedure.createLotStepsStore(steps);
                  component.stepGridStore.loadData(Application.models.Procedure.prepareStepsData(steps, component.lot.status, component.procedure_type));
                  Ext.getCmp('newstatus').store=component.statusStore;
                  Ext.getCmp('newstatus').setValue(component.lot.lot_step);
                  Ext.getCmp('newstatus').fireEvent('valueFilled', component.lot.lot_step);
                  component.setValues(component.lot);
                }
              });
              // Автозаполняем дат проведения для ауков/редуков
//              if (component.procedure_type == Application.models.Procedure.type_ids.auction_down
//                  || component.procedure_type == Application.models.Procedure.type_ids.auction_up
 //             ) {
//                Ext.getCmp(date_begin_auction_id).setValue(component.lot.date_begin_auction);
//                var time_auc = Ext.util.Format.date(Date.parseDate(component.lot.date_begin_auction, 'c'), 'H:i');
//                Ext.getCmp(time_begin_auction_id).setValue(time_auc);
 //             }
              if (component.procedure_type == Application.models.Procedure.type_ids.quotation) {
                Ext.getCmp(date_end_first_parts_review_id).setDisabled(true);
              }
            } else {
              Ext.Msg.alert('Ошибка', resp.message);
              Ext.getBody().unmask();
            }
          });
        },
        lotloaded : function() {
          setComponentValues(this, component.lot, true);
        },
        stepSelected : function (step) {
          if(Application.models.Procedure.system_steps.indexOf(step)>=0) return;
          Ext.getCmp(this.ids.multistep_grid_id).enable();
        }
      }
    });
    Application.components.procedureRestoreForm.superclass.initComponent.call(this);
  }
});
