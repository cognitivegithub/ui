
Ext.define('Application.components.NewApplicForm', {
  extend: 'Ext.TabPanel',
  initComponent: function() {
    var component = this;
    var applic_panel_id = Ext.id();

    this.addEvents('idchanged');
    this.addEvents('lotloaded');
    component.applic=null;

    Ext.apply(this, {
      activeTab: 0,
      enableTabScroll:false,
      border: false,
      defaults: {

      },
      autoHeight: true,
      frame: false,
      items: [

      ],
      listeners: {
        idchanged: function(id) {
          component.application_id = id;
        },
        lotloaded: function(lotData) {
          var applic_data = component.applic;
          var applicationStage = lotData.application_stages||1;

          if (!component.noneditable) {

            /*var procedurePanel = {
              title: 'Общие сведения о процедуре',
              xtype: 'Application.components.procedureViewPanel',
              procedure_id: component.procedure_id,
              tplData: lotData
            };*/
            var lotDataForTemplate = lotData.lot;
            lotDataForTemplate.procedure_registry_number = lotData.registry_number;
            lotDataForTemplate.currency_vocab = lotData.currency_vocab;
            lotDataForTemplate.paper_form = lotData.paper_form;
            var lotPanel = {
              xtype: 'Application.components.lotDataPanel',
              tpl: getLotDataTemplate(),
              frame: true,
              border: false,
              lot_data: lotDataForTemplate
            };
            //component.add(procedurePanel);
            component.add(lotPanel);
          }

          var partCnt = 'Application.components.ApplicPartForm';
          var activeTab = 1;
          if(component.noneditable) {
            partCnt = 'Application.components.ApplicPartView';
            activeTab = 0;
          }
          var firstPart = {
            xtype: partCnt,
            parent: component,
            closable: false,
            lot_data: lotData.lot,
            partNumber: 1,
            totalParts: applicationStage,
            procedure_type: lotData.procedure_type,
            appl_data: (applic_data!==null)?applic_data.parts[0]:false
          };

          component.add(firstPart);

          if (applicationStage==2) {
            var secondPart = {
              xtype: partCnt,
              parent: component,
              closable: false,
              lot_data: lotData.lot,
              partNumber: 2,
              totalParts: applicationStage,
              appl_data: (applic_data!==null)?applic_data.parts[1]:false
            };

            component.add(secondPart);
          }

          component.doLayout();
          component.setTitle('Заявка на участие в процедуре');
          component.show();
          component.setActiveTab(activeTab);
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
    Application.components.NewApplicForm.superclass.initComponent.call(this);
    if (this.value) {
      autoSetValue(this);
    } else {
      this.on('beforerender', function(){
        if(this.noneditable) {
          this.loadApplicData(this.application_id);
        } else {
          var saveButton =   {
            text: 'Сохранить',
            handler: function() {
              component.performSave();
            },
            scope: this
          };
          var signButton = {
            text: 'Подписать и направить',
            handler: function() {
              component.performSave(function(){
                if (component.application_id) {
                  redirect_to('com/applic/sign/procedure/'+component.procedure_id+'/lot/'+component.lot_id+'/application_id/'+component.application_id+'/totalParts/'+component.applic.parts.length);
                } else {
                  Ext.Msg.alert('Ошибка', 'Почему-то отсутствует идентификатор заявки. Попробуйте еще раз.');
                }

              });
            },
            scope: this
          };
          this.addButton(saveButton);
          this.addButton(signButton);
          this.loadLotData(this.lot_id);
        }
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
  performSave: function(cb) {
    var component = this;
    var values = this.getValues();
    values.lot_id = component.lot_id;
    values.procedure_id = component.procedure_id;
    values.application_id = component.application_id;
    performRPCCall(RPC.Applic.save, [values], null, function(result){
      if (result.success) {
        if (result.applic) {
          component.applic = result.applic;
          component.application_id = result.applic.id;
          echoResponseMessage(result);
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
  },
  loadLotData : function(lot_id){
    var component = this;
    RPC.Lot.load(lot_id, function(resp) {
      var lotData = resp.procedure;
      if (component.application_id) {
        performRPCCall(RPC.Applic.loaddraft, [{application_id: component.application_id}], null,function(resp) {
          if (resp && resp.success) {
            var applic_data = resp.applic;
            component.applic = applic_data;
            component.fireEvent('lotloaded', lotData);
          } else if (resp) {
            echoResponseMessage(resp);
          }
        });
      } else {
        component.loadApplicBySupplier(lotData, Main.contragent.id);

      }
    });
  },
  loadApplicData : function(application_id) {
    var component = this;
    performRPCCall(RPC.Applic.loaddraft, [{application_id: application_id}], null,function(resp) {
      if (resp && resp.success) {
        var applic_data = resp.applic;
        component.applic = applic_data;
        component.lot_id = applic_data.lot_id;
        component.procedure_id = applic_data.procedure_id;
        RPC.Lot.load(applic_data.lot_id, function(res) {
          component.fireEvent('lotloaded', res.procedure);
        });
      } else if (resp) {
        echoResponseMessage(resp);
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
        component.applic = applic_data;
        component.lot_id = applic_data.lot_id;
        component.procedure_id = applic_data.procedure_id;
      }
      component.fireEvent('lotloaded', lotData);
    });
  }
});
