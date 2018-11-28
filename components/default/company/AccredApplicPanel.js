
Application.components.AccredApplicPanel = Ext.extend(Ext.Panel, {
  initComponent : function () {
    var component = this;
    var doc_panel_id = Ext.id();
    var categories_panel_id = Ext.id();
    var text_empty = Ext.id();
    var accred_panel_id = Ext.id();
    var profile_combo_id = Ext.id();
    var cats_win_id = Ext.id();
    this.cmptype_checkbox_id = Ext.id();

    this.addEvents(['changeCompanyType']);

    function loadFilesData() {
      RPC.Company.loadfiles(component.cmp_id, component.cmptype, component.profile_id, function(resp){
        if(resp.success) {
          var fdata = resp.data.accreditation_files;
          setComponentValues(Ext.getCmp(doc_panel_id), fdata, false);
        } else {
          echoResponseMessage(resp);
        }
      });
      return;
    }

    function loadAccredForm() {
      RPC.Company.formrequirements(component.cmptype,component.profile_id,component.cmp_id,component.act,
      function(resp) {
        var formCnt = Ext.getCmp(accred_panel_id);
        if(formCnt.items.length>0) {
          formCnt.items.each(function(i){i.destroy()});
        }

        var result = resp.requirements;
        var accreditation_textarea = {
          xtype: 'fieldset',
          title: 'Заявление на аккредитацию',
          layout: 'form',
          autoHeight: true,
          items: [
            {
              xtype: 'textarea',
              value: result.accreditation_text,
              anchor: '100%',
              height: 100,
              readOnly: true,
              hideLabel: true
            }
          ]
        };

        var account_textarea = {
          xtype: 'fieldset',
          title: 'Заявление на открытие счета',
          layout: 'form',
          autoHeight: true,
          items: [
            {
              xtype: 'textarea',
              value: result.deposit_application,
              anchor: '100%',
              height: 100,
              readOnly: true,
              hideLabel: true
            }
          ]
        };

        var editapplic_textarea = {
          xtype: 'fieldset',
          title: 'Заявление на изменение данных',
          layout: 'form',
          hidden: (component.act=='edit') ? false:true,
          autoHeight: true,
          items: [
            {
              xtype: 'textarea',
              value: result.editdata_application,
              anchor: '100%',
              height: 100,
              readOnly: true,
              hideLabel: true
            }
          ]
        };

        if(component.act=='edit') {
          formCnt.add(editapplic_textarea);
        } else {
          formCnt.add(accreditation_textarea);
          if (result.deposit_application) {
            formCnt.add(account_textarea);
          }
        }

        if (component.basic_group_value == 'customer' && component.act == 'apply') {
          var offer_text = result.customer_offer_text;
          var offerta_textarea = {
            xtype: 'fieldset',
            title: 'Оферта',
            layout: 'form',
            autoHeight: true,
            items: [
              {
                xtype: 'label',
                html: 'Подавая заявку вы соглашаетесь с текстом оферты<br /><br />'
              },
              {
                xtype: 'textarea',
                value: offer_text,
                anchor: '100%',
                height: 100,
                readOnly: true,
                name: 'offer_text',
                hideLabel: true
              }
            ]
          };
          formCnt.add(offerta_textarea);
        }
        var doc_panel = {
          xtype: 'fieldset',
          title: 'Документы',
          id: doc_panel_id,
          style: 'margin: 0px',
          items:[
            {
              xtype: 'Application.components.FilesPanelMU',
              cmptype: component.cmptype,
              contragent_id: component.cmp_id,
              file_panels: result.file_panels,
              uploadHandler: RPC.Company.addfile,
              deleteHandler: RPC.Company.removefile,
              required: true
            }
          ],
          listeners : {
            afterrender : function() {
              loadFilesData();
            }
          }
        };
        formCnt.add(doc_panel);
        if (component.cmptype == 'supplier' && Main.config.categories_table) {
          var categories_panel = {
            xtype: 'fieldset',
            title: 'Сферы деятельности',
            cls: 'spaced-panel',
            items: [
              {
                xtype: 'Application.components.CompanyCategoriesPanel',
                optype: 'company'
              }
            ]
          };
          formCnt.add(categories_panel);
        }

        if (component.advanced_panels) {
          for(var adv_cnt = 0; adv_cnt < component.advanced_panels.length; adv_cnt++) {
            formCnt.add(component.advanced_panels[adv_cnt]);
          }
        }

        formCnt.doLayout();
      });
    }

    Ext.apply(this,
      {
        layout : 'form',
        anchor: '100%',
        title: 'Аккредитация '+component.accred_type,
        bodyCssClass: 'subpanel-top-padding',
        defaults: {
          anchor: '100%',
          allowBlank: false,
          disabled: 'supplier'==component.cmptype && Main.contragent.profile_locked
        },
        autoHeight : true,
        frame: true,
        labelWidth: 200,
        items: [
        {
          xtype: 'panel',
          cls: 'warning-panel spaced-bottom',
          html: 'У вашей организации есть аккредитация в <a href="https://etp.roseltorg.ru/">системе для государственных заказчиков (СГЗ)</a>, аккредитация в качестве заявителя на данной площадке не требуется.',
          disabled: false,
          hidden: 'supplier'!=component.cmptype || !Main.contragent.profile_locked
        },
        {
          xtype: 'checkbox',
          name: component.cmptype,
          id: component.cmptype_checkbox_id,
          boxLabel: 'Получить аккредитацию '+component.accred_type,
          hideLabel: true,
          disabled: (('supplier'==component.cmptype && Main.contragent.profile_locked)||component.act=='edit') ? true : false,
          listeners : {
            check : function(c, checked) {
              if(checked)
                component.loadProfiles(component.cmptype);
              else {
                if(component.items.length>0) {
                  component.items.each(function(i){
                    if (i.id!=c.id && i.id!=accred_panel_id) {
                      i.destroy();
                    } else if (i.id==accred_panel_id) {
                      var formCnt = Ext.getCmp(accred_panel_id);
                      if(formCnt.items.length>0) {
                        formCnt.items.each(function(i){i.destroy()});
                      }
                    }
                  });
                }
              }
            }
          }
        },
        {
          xtype: 'panel',
          id: accred_panel_id,
          frame: false,
          border: false,
          items: [

          ]
        }
      ],
      listeners: {
        afterrender : function() {
          if(component.profile_id!=null) {
            var checked = true;
            Ext.getCmp(component.cmptype_checkbox_id).fireEvent('check', Ext.getCmp(component.cmptype_checkbox_id),checked);
            Ext.getCmp(component.cmptype_checkbox_id).checked = checked;
          }
        }
      },
      loadProfiles : function(basic_group) {
        RPC.Company.loadprofiles(basic_group, function(result) {
          var data_array = result.profiles, profileIdCmp = Ext.getCmp(profile_combo_id);
          if(profileIdCmp===undefined) {
            var profileTypesCombo = {
              xtype: 'combo',
              fieldLabel: 'Тип организации'+REQUIRED_FIELD,
              mode: 'local',
              store : new Ext.data.ArrayStore({
                  id: 0,
                  fields: [
                      'id',
                      'name'
                  ],
                  data: data_array
              }),
              editable: false,
              valueField: 'id',
              displayField: 'name',
              name : component.cmptype+'_profile_id_combo',
              hiddenName : component.cmptype+'_profile_id',
              id:profile_combo_id,
              value: component.profile_id,
              emptyText : 'Выберите тип организации',
              minChars : 5,
              hidden: (component.act=='edit') ? true : false,
              forceSelection : true,
              triggerAction: 'all',
              listeners: {
                select: function() {
                  var combo= this;
                  component.profile_id = combo.getValue();
                  if (component.cmptype == 'supplier') {
                    component.fireEvent('changeCompanyType', {newType: component.profile_id});
                  }
                  loadAccredForm();
                }
              }
            };
            component.insert(1,profileTypesCombo);
            component.doLayout();
            profileIdCmp = Ext.getCmp(profile_combo_id);
            if(component.profile_id!=null) {
              loadAccredForm();
            }
            if (component.act=='edit') {
              profileIdCmp.hide();
            }
          } else {
            component.profile_id=null;
            profileIdCmp.getStore().loadData(data_array);
          }
          if (component.cmptype == 'supplier') {
            //console.log('загрузился профиль поста')
            component.fireEvent('changeCompanyType', {newType: Ext.getCmp(profile_combo_id).getValue()});
          }
        });
      }
    });

    Application.components.AccredApplicPanel.superclass.initComponent.call(this);
  }
});
