
Application.components.NewContragentForm = Ext.extend(Ext.TabPanel, {
  frame :false,
  border : false,
  initComponent : function () {
    var component = this;
    var accred_type_fset_id = Ext.id();
    var customer_accred_id = Ext.id();
    var supplier_accred_id = Ext.id();
    var profile_form_id = Ext.id();
    var tabpanel_id = Ext.id();
    var has_supp_profile = false

    component.customer_profile_id = null;
    component.supplier_profile_id = null;

    if(component.cmptype=='customer') {
      component.customer_profile_id = component.profile_id;

    } else if(component.cmptype=='supplier') {
      component.supplier_profile_id = component.profile_id;
    }
    var companyForm = {
      xtype: 'Application.components.CompanyForm',
      cmpid: component.cmpid,
      id: profile_form_id,
      title: 'Основные сведения',
      act: component.act
    };

    function loadCompanyData() {
      performRPCCall(RPC.Company.load,[{id:component.cmpid}], null, function(resp){
        if (resp.success) {
          component.cmp_data = resp.data;
          if(component.cmp_data
            && component.cmp_data.customer_profile_id
            && component.cmp_data.customer_profile_id != null) {
            component.customer_profile_id = component.cmp_data.customer_profile_id
          }

          if (component.cmp_data
            && component.cmp_data.supplier_profile_id
            && component.cmp_data.supplier_profile_id != null) {
            component.supplier_profile_id = component.cmp_data.supplier_profile_id
          }
          Ext.getCmp(profile_form_id).setValues(resp.data);
          /*if(resp.data.legal) {
            Ext.getCmp('legal').setValues(resp.data.legal);
          }
          if(resp.data.postal) {
            Ext.getCmp('postal').setValues(resp.data.postal);
          }*/
          //Ext.getCmp('bank_data').setValues(resp.data.bank_data);

          // Дополнительные панели для закладки аккредитации заявителя
          var supplier_adv_panels = [];
          if (component.cmptype == 'supplier' && Main.config.supplier_okved) {
            supplier_adv_panels.push({
              xtype: 'Application.components.treeSelector',
              title: 'Классификатор ОКВЭД',
              addText: 'Добавить позицию',
              name: 'okved',
              keyName: 'code',
              emptyText: false,
              treeSearch: true,
              treeSearchHelp: 'Поиск по классификатору ОКВЭД',
              cls: 'spaced-panel',
              listeners: {
                afterrender: function(cmp_okved) {
                  cmp_okved.setValues(component.cmp_data.okved);
                }
              }
            });
          }
          if (component.cmptype == 'supplier' && Main.config.show_okpd2_and_okved2) {
            supplier_adv_panels.push({
              xtype: 'Application.components.treeSelector',
              title: 'Классификатор ОКВЭД2',
              addText: 'Добавить позицию',
              name: 'okved2',
              keyName: 'code',
              emptyText: false,
              treeSearch: true,
              treeSearchHelp: 'Поиск по классификатору ОКВЭД2',
              cls: 'spaced-panel',
              listeners: {
                afterrender: function(cmp_okved2) {
                  cmp_okved2.setValues(component.cmp_data.okved2);
                }
              }
            });
          }

          var customer_accred_fset ={
            xtype: 'Application.components.AccredApplicPanel',
            cmp_id: component.cmpid,
            id: customer_accred_id,
            cmptype: 'customer',
            profile_id: component.customer_profile_id,
            hidden: (component.cmptype&&component.cmptype=='supplier') ? true : false,
            accred_type: 'в качестве заказчика',
            act: component.act
          };

          var supplier_accred_fset =  {
            xtype: 'Application.components.AccredApplicPanel',
            cmp_id: component.cmpid,
            id: supplier_accred_id,
            profile_id: component.supplier_profile_id,
            hidden: (component.cmptype&&component.cmptype=='customer') ? true : false,
            cmptype: 'supplier',
            accred_type: 'в качестве заявителя',
            act: component.act,
            advanced_panels: supplier_adv_panels
          };

          if (component.profile_id != null && isAdmin() && Main.config.show_edit_extended) {
            if(component.cmptype=='customer' && Main.config.customer_accreditation_allowed) {
              component.add(customer_accred_fset);
            } else {
              if(component.cmptype=='supplier') {
                component.add(supplier_accred_fset);
                has_supp_profile = true;
              }
            }
          } else if (isAdmin() &&  Main.config.show_edit_extended) {
            if(Main.config.customer_accreditation_allowed) {
              component.add(customer_accred_fset);
            }
            component.add(supplier_accred_fset);
            has_supp_profile = true;
          }
          component.doLayout();
          if (component.active_tab) {
            if (component.active_tab == 'customer') {
              component.activate(customer_accred_id);
            } else if (component.active_tab == 'supplier') {
              component.activate(supplier_accred_id);
            }
          }

          if (has_supp_profile) {
            Ext.getCmp(profile_form_id).relayEvents(Ext.getCmp(supplier_accred_id), ['changeCompanyType']);
            //console.log('загрузился профиль организации')
            Ext.getCmp(profile_form_id).fireEvent('changeCompanyType', {newType: component.supplier_profile_id})
          }
        } else {
          echoResponseMessage(resp);
        }
      });
      return;
    }

    Ext.apply(this,
     {
      title: 'Профиль организации / физического лица',
      activeTab: 0,
      enableTabScroll:false,
      id: tabpanel_id,
      border: true,
      frame: true,
      items : [
        companyForm
      ],
      buttons: [
        {
          text: 'Закрыть',
          handler: function() {
            history.back(1);
          }
        },
      {
        text: 'Сохранить',
        scope: this,
        disabled: component.cmptype=='supplier' && Main.contragent.profile_locked,
        formBind : true,
        handler: function(){
          component.performSave(function(result){
            redirect_to(result.redirect_url);
          });
        }
      },
      {
        text: 'Подписать и направить',
        scope: this,
        disabled: component.cmptype=='supplier' && Main.contragent.profile_locked,
        formBind : true,
        hidden: !(isAdmin() && Main.config.show_edit_extended),
        handler: function(){
//          if (!isFormValid(component)) {
//            Ext.Msg.alert('Ошибка', 'Не все обязательные поля заполнены правильно');
//            return;
//          }
          var supplier_accred = Ext.getCmp(supplier_accred_id);
          var customer_accred = Ext.getCmp(customer_accred_id);
          var fl = false;
          if (supplier_accred) {
            var supplier_ch = Ext.getCmp(supplier_accred.cmptype_checkbox_id);
            fl = supplier_ch.checked;
          }
          if (fl === false && customer_accred) {
            var customer_ch = Ext.getCmp(customer_accred.cmptype_checkbox_id);
            fl = customer_ch.checked;
          }
          if (!fl) {
            Ext.Msg.alert('Предупреждение', 'Не указаны данные для аккредитации в качестве организатора и/или заявителя (доступны в соответствующих вкладках в заголовке данной формы)');
            return;
          }
          component.performSave(function(result){
            redirect_to(result.redirect_url);
          });
        }
      }
      ],
      listeners : {
        afterrender: function() {
          loadCompanyData();
        }
      },
      getValues : function() {
        var v = {};
        collectComponentValues(this, v, false);
        return v;
      },
      performSave: function(cb) {
        var component = this;
        var values = component.getValues();
        values.id = component.cmpid;
        values.act = component.act;
        values[component.cmptype] = 1;
        performRPCCall(RPC.Company.save, [values], null, function(result){
          if (result.success) {
            component.customer_profile_id=result.customer_profile_id;
            component.supplier_profile_id=result.supplier_profile_id;
            echoResponseMessage(result);

            if (cb) {
              cb(result);
            }
          } else {
            echoResponseMessage(result);
          }
        });
      }
    });
    Application.components.NewContragentForm.superclass.initComponent.call(this);
  }
});
