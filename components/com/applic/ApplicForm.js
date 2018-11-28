
Ext.define('Application.components.ApplicForm', {
  extend: 'Ext.TabPanel',
  module: 'com',
  initComponent: function() {
    var component = this;

    var applic_panel_id = Ext.id();
    var first_part_id = Ext.id();
    component.first_part_id = first_part_id; // alena 4449
    var second_part_id = Ext.id();
    var save_id = Ext.id();
    var sign_id = Ext.id();
    var update_id = Ext.id();
    var zip_button_id = Ext.id();
    var edit_button_id = Ext.id();
    component.lot_panel_id = Ext.id();

    this.addEvents('idchanged');
    this.addEvents('lotloaded');
    this.addEvents('applicloaded');
    this.addEvents('cmpready');

    component.applic=null;
    component.lot_data=null;
    component.procedure_data=null;

    var firstPartCnt = 'Application.components.ApplicFirstPartEditTab';
    var secondPartCnt = 'Application.components.ApplicSecondPartEditTab';

    Ext.apply(this, {
      activeTab: 0,
      enableTabScroll:false,
      border: false,
      id: applic_panel_id,
      defaults: {

      },
      autoHeight: true,
      frame: false,
      items: [
        {
          xtype: 'Application.components.lotDataPanel',
          id: component.lot_panel_id,
          shortInfo: false,
          frame: true,
          border: false
        },
        {
          xtype: firstPartCnt,
          parent: component,
          title: 'Заявка поставщика', // -- alena 3844
          closable: false,
          id: first_part_id,
          lot_data: component.lot_data,
          lot_id: component.lot_id,
          application_id: component.application_id,
          partNumber: 1,
          noneditable: component.noneditable
        },
        {
          xtype: secondPartCnt,
          parent: component,
          closable: false,
          id: second_part_id,
          lot_data: component.lot_data,
          partNumber: 2,
          noneditable: component.noneditable
        }
      ],
      listeners: {
        idchanged: function(id) {
          component.application_id = id;
        },
        lotloaded: function(lotData) {
          
          component.lot_data = lotData.lot;
          component.procedure_data = lotData;
          component.totalParts = lotData.application_stages||1;
          component.procedure_type = lotData.procedure_type;

          Ext.getCmp(first_part_id).parent = component;
          if(component.totalParts==2) {
            Ext.getCmp(second_part_id).parent = component;
          } else {
            Ext.getCmp(second_part_id).destroy();
          }

          if (component.application_id) {
            performRPCCall(RPC.Applic.loaddraft, [{application_id: component.application_id, filter: component.filter}], null,function(resp) {
              if (resp && resp.success) {
                var applic_data = resp.applic;
                if (applic_data.parts) {
                  if (applic_data.parts[0] && !applic_data.parts[0].phone) {
                    applic_data.parts[0].phone = 'не указано';
                  }
                  if (applic_data.parts[1] && !applic_data.parts[1].phone) {
                    applic_data.parts[1].phone = 'не указано';
                  }
                }

                component.fireEvent('applicloaded', applic_data);
              } else if (resp) {
                echoResponseMessage(resp);
              }
            });
          } else {
            if (Main.config.allow_customer_add_applic && component.procedure_data.organizer_contragent_id == Main.contragent.id) {

            } else {
              component.loadApplicBySupplier(lotData, Main.contragent.id);
            }
          }

          if (component.noneditable || isCustomer()) {  // -- alena 3844 или для заказчика
            Ext.getCmp(component.lot_panel_id).destroy();
          }
//          if (lotData.paper_form) {
//            Ext.getCmp(save_id).setDisabled(true);
//            Ext.getCmp(sign_id).setDisabled(true);
//          }
        },
        applicloaded: function(applic_data) {
          component.applic = applic_data;
          component.lot_id = applic_data.lot_id;
          component.procedure_id = applic_data.procedure_id;
          if(component.totalParts == 2) { // alena 3844 -->-- оптимизация условия
            if ((applic_data.supplier_id != Main.user.contragent_id && !applic_data.second_part_visible)/* {
            Ext.getCmp(second_part_id).destroy();
          }*/
           || (component.lot_data.status < 6 && isAdmin())/* {
            Ext.getCmp(second_part_id).destroy();
          }*/
           || (component.lot_data.status >= 6 && !component.applic.parts[1])/* {
            Ext.getCmp(second_part_id).destroy();
          }*/
           || (applic_data.supplier_id !== Main.user.contragent_id && component.lot_data.status >= 6 && component.applic.status == 2)) {
            Ext.getCmp(second_part_id).destroy();
            }// --<-- alena 3844
          }

          if(component.noneditable) {
            if((component.applic.parts[0]['application_docs'] && component.applic.parts[0].application_docs.length>0)
              ||(component.applic.parts[0].application_docs_other && component.applic.parts[0].application_docs_other.length>0)
              ||(component.applic.parts[1] && component.applic.parts[1].application_docs && component.applic.parts[1].application_docs.length>0)
              ||(component.applic.parts[1] && component.applic.parts[1].application_docs_other && component.applic.parts[1].application_docs_other.length>0)
              ) {
              Ext.getCmp(zip_button_id).show();
            }
          }
          if (component.mode=='view' && component.applic.lot.status==Application.models.Procedure.statuses.first_parts && component.applic.procedure.procedure_type==Application.models.Procedure.type_ids.auction_up_26) {
            Ext.getCmp(zip_button_id).hide();
          }
          component.fireEvent('idchanged', applic_data.id);
          component.fireEvent('cmpready');
        },
        cmpready: function() {
          if (Main.config.extended_applic_registration_quotation && ([3,4,6].indexOf(this.lot_data.status) >= 0)) {
            return;
          }
          if (!this.noneditable
              && [Application.models.Procedure.statuses.published, Application.models.Procedure.statuses.signed, Application.models.Procedure.statuses.correction].indexOf(this.lot_data.status)<0
              && isSupplier()) //--<-- alena 3844 только если вводит поставщик
          {
            if ( Main.config.allow_participant_docs_update
                 && [Application.models.Procedure.statuses.trade, Application.models.Procedure.statuses.second_parts].indexOf(this.lot_data.status)>=0
                 && this.applic && (this.applic.date_accepted||1==this.applic.status) && this.applic.actual
                 && this.applic.procedure && 2==this.applic.procedure.application_stages // && this.applic.procedure.stage>1
               )
            {
              // разрешаем добавлять файлы
              callComponents([first_part_id], function(c){c.disable();});
              this.activate(second_part_id);
              Ext.getCmp(second_part_id).setMode('updatefiles');
              callComponents([save_id, sign_id], function(c){c.hide()});
              Ext.getCmp(update_id).show();
              return;
            }

            Ext.Msg.alert('Предупреждение', 'Процедура не в статусе приема заявок, подача и изменение заявок невозможна');
            //component.noneditable = true;
            callComponents([save_id, sign_id, first_part_id, second_part_id], function(c){c.disable();});
          }
          // alena 3844 -->-- если заявки вводит заказчик, то не отображать блоки "Согласие...", "Характеристики...", "Иные документы..."
          if (isCustomer() && Main.config.allow_customer_add_applic) {
            var fp = Ext.getCmp(first_part_id);
            Ext.getCmp(fp.ids.app_units_display).hide();
            var dop = Ext.getCmp(fp.ids.docOtherPanelId).findParentByType('fieldset');
            if (!Main.config.applic_add_file_all) {
              dop.destroy();
            }
            Ext.getCmp('fieldset_application_text').hide();
          }// --<-- alena 3844
        }
      },

      getValues: function() {
        var values = {lot_id: component.lot_id};
        collectComponentValues(this, values, true);

        if (this.application_id) {
          values.id = this.application_id;
        }
        return values;
      }
    });
    Application.components.ApplicForm.superclass.initComponent.call(this);
    if (this.value) {
      autoSetValue(this);
    } else {
      this.on('beforerender', function(){
        Ext.getCmp(this.lot_panel_id).relayEvents(this, ['lotloaded']);
        Ext.getCmp(first_part_id).relayEvents(this, ['lotloaded','applicloaded']);
        Ext.getCmp(second_part_id).relayEvents(this, ['lotloaded','applicloaded']);

        if(!this.noneditable) {
          var backButton =   {
            text: 'Назад',
            handler: function() {
              redirect_to('po/applic/openapplics/lot/' + component.lot_id);
            },
            scope: this
          };
          var saveButton =   {
            text: 'Сохранить',
            id: save_id,
            handler: function() {
              component.performSave();
            },
            scope: this
          };
          var saveAndNextButton =   {
            text: 'Следующая заявка',
            handler: function() {
              component.performSave(function () {
                redirect_to(component.module+'/applic/create/lot/'+component.lot_id);
              });
            },
            scope: this
          };
          var signButton = {
            text: 'Подписать и направить',
            id: sign_id,
            handler: function() {
              component.performSave(function(){

                var warn_fatal=false, warn=[];
                component.eachPart(function(p){
                  var valid = p.validate?p.validate():true;
                  if (true!==valid && !valid.success) {
                    warn_fatal = warn_fatal||valid.fatal;
                    warn.push(valid.msg);
                  }
                });
                if (!component.application_id) {
                  warn.push('Почему-то отсутствует идентификатор заявки. Попробуйте еще раз.');
                  warn_fatal = true;
                }
                function doSave() {
                  redirect_to('com/applic/sign/procedure/'+component.procedure_id+'/lot/'+component.lot_id+'/application_id/'+component.application_id+'/totalParts/'+component.applic.parts.length);
                }
                if (warn.length) {
                  warn = warn.join('<br/>\n');
                  if (warn_fatal) {
                    Ext.Msg.alert('Ошибка', warn);
                    return;
                  } else {
                    Ext.Msg.confirm('Предупреждение', warn+'<br/>\nВы уверены что хотите подать заявку?', function(b){
                      if ('yes'==b) {
                        doSave();
                      }
                    });
                  }
                } else {
                  doSave();
                }
              });
            },
            scope: this
          };
          var updateButton = {
            text: 'Обновить информацию',
            id: update_id,
            hidden: true,
            handler: function() {
              component.performSave(null, 'updatefiles');
            }
          };

          if (Main.config.fluent_applic_enable) {
            this.addButton(backButton);
          }
          this.addButton(saveButton);
          if (Main.config.fluent_applic_enable) {
            this.addButton(saveAndNextButton);
          }
          if (isSupplier()) this.addButton(signButton); // alena 3844 кнопка "Подписать и направить" только для поставщика
          this.addButton(updateButton);

        } else {
          Ext.getCmp(component.lot_panel_id).hidden=true;
          var zipButton = {
            xtype: 'button',
            text: 'Скачать все файлы заявки в виде архива',
            id: zip_button_id,
            hidden: true,
            handler: function() {
              document.location.href='/applic/getzip/application_id/'+component.applic.id;
            }
          };
          this.addButton(zipButton);
          var closeButton = {
            xtype: 'button',
            text: 'Закрыть',
            handler: function() {
              //close();
              window.history.go(-1);
            }
          };
          this.addButton(closeButton);


        }
        
        var editButton = {
          xtype: 'button',
          text: 'Редактировать',
          id: edit_button_id,
          hidden: !isUozd(),
          handler: function() {
            redirect_to('po/applic/edit/application_id/'+component.applic.id  +'/lot/'+ component.lot_id);
          }
        }

        this.addButton(editButton);
        
        if(component.hide_edit_button){
          Ext.getCmp(edit_button_id).hide();
        }
        
        this.loadLotData(component.lot_id);

      }, this);
    }
  },
  eachPart: function(cb) {
    this.items.each(function(i){
      if (i.partNumber) {
        cb(i);
      }
    });
  },
  performSave: function(cb, mode) {
    var component = this;
    var form = Ext.getCmp(component.first_part_id).getForm(); // alena 4449
    form.cleanDestroyed();
    if (form.isValid()) {
    var values = this.getValues();
    values.lot_id = component.lot_id;
    values.procedure_id = component.procedure_id;
    values.application_id = component.application_id;
    if (mode) {
      values.mode = mode;
    }
      var action;
      if (component.module == 'com') {
        action = RPC.Applic.save;
      } else {
        action = window['RPC_' + component.module].Applic.save;
      }
    performRPCCall(action, [values], null, function(result){

      if (result.success) {
        if (result.applic) {
          component.applic = result.applic;
          component.application_id = result.applic.id;
          var title = 'Заявка сохранена успешно';
          var msg = result.message||result.msg;
          if (!msg) {
            msg = 'Документы и сведения направлены успешно';
          }
          Ext.MessageBox.alert(t(title), t(msg));
          setTimeout(function() {
            Ext.MessageBox.hide();
          }, 1500);
          if (result.redirect_url) {
            redirect_to(result.redirect_url);
          }
        } else if (result.application_id) {
          component.fireEvent('idchanged', result.application_id);
        }
        if (cb) {
          cb(result);
        }
      } else {
        echoResponseMessage(result);
      }
    });
    }else{
      showFormErrors(form);
    }
  },
  loadLotData : function(lot_id){
    var component = this;
    Ext.getBody().mask('Загружаем данные');
    RPC.Lot.load(lot_id, function(resp) {
      if(resp.success) {
        var lotData = resp.procedure;
        component.fireEvent('lotloaded', lotData);
        Ext.getBody().unmask();
      } else {
        echoResponseMessage(resp);
        Ext.getBody().unmask();
        redirect_to('com/procedure/index');
      }
    });
  },
  loadApplicBySupplier : function (lotData, supplier_id) {
    var component = this;
    var values = {};
    var lot_id = lotData.lot.id;
    values.supplier_id = supplier_id;
    values.lot_id = lot_id;
    performRPCCall(RPC.Applic.loaddraft, [values], null,function(resp) {
      if (resp && resp.success) {
        var applic_data = resp.applic;
        component.fireEvent('applicloaded', applic_data);
      } else {
        if (resp.message) {
            echoResponseMessage(resp);
        }
        component.fireEvent('cmpready');
      }
    });
  }
});
