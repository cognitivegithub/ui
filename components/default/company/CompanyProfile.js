
Application.components.CompanyProfile = Ext.extend(Ext.Panel, {
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    this.ogrn_req = '';

    var uTpl = getCompanydataTemplate();
    var balanceTpl = getBalanceTemplate();
    var bankdataTpl = getBankshortdataTemplate();

    var cust_appl= component.cmpdata.customer_accreditations.length;
    var suppl_appl= component.cmpdata.supplier_accreditations.length;
    var active_appl_suppl = component.cmpdata.supplier_accreditations[0];
    var active_appl_cust = component.cmpdata.customer_accreditations[0];
    var balance_data = component.cmpdata.balance_data;
    var bank_data = component.cmpdata.bank_data;

    Ext.apply(this,
      {
        xtype: 'panel',
        border: false,
        frame: true,
        layout : 'form',
        title: 'Аккредитационные сведения',
        bodyCssClass: 'subpanel-top-padding',
        items: [
        {
          xtype: 'fieldset',
          tpl: uTpl,
          title: 'Основные данные профиля',
          data: component.cmpdata
        },
        {
          xtype: 'fieldset',
          tpl: bankdataTpl,
          title: 'Банковские реквизиты',
          data: bank_data,
          hidden: !bank_data
        },

        /*{
          xtype: 'fieldset',
          tpl: balanceTpl,
          title: 'Текущее состояние лицевого счета',
          data: balance_data,
          hidden: !balance_data
        },*/
        {
          xtype: 'fieldset',
          title: 'Полученные аккредитации',
          hidden: !Main.config.show_edit_extended,
          listeners: {
            beforerender : function() {
              var button_cnt = this;
              if(cust_appl>0 || suppl_appl>0) {
                if(cust_appl>0) {
                  if(active_appl_cust.status==STATUS_ADDED) {
                    button_cnt.add({
                      xtype: 'panel',
                      title: 'Аккредитация в качестве заказчика',
                      border: false,
                      style: 'margin: 5px; border-width: 1px;',
                      bodyStyle: 'padding: 10px;',
                      html: 'Заявка на аккредитацию в качестве заказчика ожидает решения оператора'
                    });
                  } else if(active_appl_cust.status==STATUS_ACCEPTED) {
                    button_cnt.add({
                      xtype: 'Application.components.accreditationPanel',
                      accred: active_appl_cust,
                      cmpData: component.cmpdata,
                      accredType: 'customer',
                      title: 'Аккредитация в качестве заказчика'
                    });
                  }
                }
                if(suppl_appl>0) {
                  if(active_appl_suppl.status==STATUS_ADDED) {
                    button_cnt.add({
                      xtype: 'panel',
                      title: 'Аккредитация в качестве заявителя',
                      border: false,
                      style: 'margin: 5px; border-width: 1px;',
                      bodyStyle: 'padding: 10px;',
                      html: 'Заявка на аккредитацию в качестве заявителя ожидает решения оператора'
                    });
                  }
                  else if(active_appl_suppl.status==STATUS_ACCEPTED) {
                    button_cnt.add({
                      xtype: 'Application.components.accreditationPanel',
                      accred: active_appl_suppl,
                      cmpData: component.cmpdata,
                      accredType: 'supplier',
                      title: 'Аккредитация в качестве заявителя'
                    });
                  }
                }
              } else {
                button_cnt.add({
                  xtype: 'fieldset',
                  style: 'margin: 5px',
                  html: 'У Вашей организации нет активных аккредитаций. Для работы в системе необходимо пройти процедуру аккредитации'
                });
              }
            }
          }
        }],
        listeners: {
          beforerender : function() {
            if(Main.user.contragent_id==component.cmpdata.id) {
              var isAvailable = true;

              if( ( (Main.contragent.supplier_accreditations && Main.contragent.supplier_accreditations.length>0)  ||
                   (Main.contragent.customer_accreditaions && Main.contragent.customer_accreditations.length>0 ) )
                 && Main.user.status<3) {
                isAvailable = false;
              }

              if (isAvailable && isAdmin() && Main.config.show_edit_extended) {
                if(cust_appl>0) {
                  if(active_appl_cust.status==STATUS_ACCEPTED) {
                    component.addButton(createSimpleRedirectButton('Редактировать профиль заказчика','company/edit/group/customer/profile/'+active_appl_cust.profile_id+'/act/edit'));
                    component.addButton(createSimpleRedirectButton('Переаккредитация заказчика','company/edit/group/customer/profile/'+active_appl_cust.profile_id+'/act/reapply'));
                  }
                } else {
                  component.addButton(createSimpleRedirectButton('Заявка на аккредитацию заказчика','company/edit/group/customer/act/apply'));
                }
                if(suppl_appl>0) {
                  if(active_appl_suppl.status==STATUS_ACCEPTED) {
                    component.addButton(createSimpleRedirectButton('Редактировать профиль заявителя','company/edit/group/supplier/profile/'+active_appl_suppl.profile_id+'/act/edit'));
                    component.addButton(createSimpleRedirectButton('Переаккредитация заявителя','company/edit/group/supplier/profile/'+active_appl_suppl.profile_id+'/act/reapply'));
                  }
                } else {
                  component.addButton(createSimpleRedirectButton('Заявка на аккредитацию заявителя','company/edit/group/supplier/act/apply'));
                }
              }
            }

            if (isAdmin() || isUserPerfomerOOZUnit() || isGendir() || isFR() || isContragentsDirectory()) {
              component.addButton(createSimpleRedirectButton('Редактировать профиль','company/edit/id/' + component.cmpdata.id));
            }
            component.addButton(createSimpleRedirectButton('Вернуться к списку','company/list'));
          }
        }
    });
    if (this.lotdata && this.datatime && this.cmpdata.changed_data) {
      var warn = {
        xtype: 'panel',
        cls: 'warning-panel spaced-bottom',
        html:
          '<div>Аккредитационные документы и сведения, актуальные на момент окончания подачи заявок по процедуре '+
            '<b>'+this.lotdata.registry_number+'</b>, лот&nbsp;<b>'+this.lotdata.number+'</b>, '+this.lotdata.title+
            ' ('+Ext.util.Format.localDateRenderer(parseDate(this.datatime))+')</div>'+
          '<div>Знаком <img src="/css/images/default/shared/warning.gif"/> отмечены данные, изменившиеся с указанного времени. Наведите курсор на знак, чтобы увидеть дату изменения.</div>'+
          '<div><a href="'+href_to('company/view/id/'+this.cmpdata.id)+'">Просмотреть текущие актуальные данные</a></div>'
      };
      this.items.unshift(warn);
      this.items.push(warn);
      function markDirty(values, dirty) {
        for (var i in values) {
          if (!values.hasOwnProperty(i) || !dirty[i]) {
            continue;
          }
          if (Ext.isObject(values[i]) || Ext.isArray(values[i])) {
            markDirty(values[i], dirty[i]);
          } else {
            values[i] = '<img src="/css/images/default/shared/warning.gif" '+
                        'ext:qtip="Данные изменились '+Ext.util.Format.localDateRenderer(parseDate(dirty[i]))+'"/>'+
                        values[i];
          }
        }
      }
      markDirty(this.cmpdata, this.cmpdata.changed_data);
      //delete this.cmpdata.changed_data;
    }
    Application.components.CompanyProfile.superclass.initComponent.call(this);
  }
});
