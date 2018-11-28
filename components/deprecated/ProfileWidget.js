/**
 * Виджет профиля организации
 *
 * Параметры:
 *   нет
 *
 * Евенты:
 *   нет
 */
Application.components.ProfileWidget = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var profilewidget_panel_id = Ext.id();
    var profile_buttonpanel_id = Ext.id();
    var component = this;

    var cmpDataTemplate = '<table class="tpltbl">'+
            '<tr><td>Наименование организации:</td><td>{full_name}</td></tr>'+
            '<tr><td>ИНН:</td><td>{inn}</td></tr>'+
            '<tr><td>КПП:</td><td>{kpp}</td></tr>'+
            '<tr><td>Дата истечения аккредитации</td><td>&nbsp</td></tr>'+
            '<tr><td style="text-align: right;">в качестве поставщика:</td><td>{valid_for_suppl}</td></tr>'+
            '<tr><td style="text-align: right;">в качестве заказчика:</td><td>{valid_for_cust}</td></tr>'+
            '</table>';
    var profile_data = Main.contragent;
    Ext.apply(this, {
      //height: 500,
      defaults: {
        border: false,
        autoHeight: false,
        defaults: {
          autoHeight: false,
          border: false
        }
      },
      frame: true,
      id: profilewidget_panel_id,
      title: 'Профиль организации',
      items: [
        {
          xtype: 'panel',
          hideTitle: true,
          frame: false,
          tpl: cmpDataTemplate,
          data: profile_data
        },
        {
          xtype: 'panel',
          border: false,
          frame: false,
          header: false,
          autoHeight: true,
          layout: 'anchor',
          id: profile_buttonpanel_id,
          defaults: {
            style: 'padding: 3px; margin: 0px auto'
          },
          layoutConfig: {
            anchor: '95%'
          },
          items: [

          ]
        }
      ],
      listeners: {
        afterrender: function() {
            var cust_appl= Main.contragent.customer_accreditations.length;
            var suppl_appl= Main.contragent.supplier_accreditations.length;
            var active_appl_suppl = Main.contragent.supplier_accreditations[0];
            var active_appl_cust = Main.contragent.customer_accreditations[0];

            var button_cnt = Ext.getCmp(profile_buttonpanel_id);
            
            if(cust_appl>0 || suppl_appl>0) {
              if(cust_appl>0) {
                if(active_appl_cust.status==STATUS_ADDED) {
                  button_cnt.add({
                    xtype: 'panel',
                    html: 'Ваша заявка на аккредитацию в качестве заказчика ожидает решения оператора'
                  });
                } else if(active_appl_cust.status==STATUS_ACCEPTED) {
                  button_cnt.add(createSimpleRedirectButton('Редактировать профиль заказчика','company/edit/group/customer/profile/'+active_appl_cust.profile_id+'/act/edit'));
                  button_cnt.add(createSimpleRedirectButton('Заявка на переаккредитацию заказчика','company/edit/group/customer/profile/'+active_appl_cust.profile_id+'/act/reapply'));
                }
              } else {
                button_cnt.add(createSimpleRedirectButton('Заявка на аккредитацию заказчика','company/edit/group/customer/act/apply'));
              }
              if(suppl_appl>0) {
                if(active_appl_suppl.status==STATUS_ADDED) {
                  button_cnt.add({
                    xtype: 'panel',
                    html: 'Ваша заявка на аккредитацию в качестве поставщика ожидает решения оператора'
                  });
                }
                else if(active_appl_suppl.status==STATUS_ACCEPTED) {
                  button_cnt.add(createSimpleRedirectButton('Редактировать профиль поставщика','company/edit/group/supplier/profile'+active_appl_suppl.profile_id+'/act/edit'));
                  button_cnt.add(createSimpleRedirectButton('Заявка на переаккредитацию поставщика','company/edit/group/supplier/profile/'+active_appl_suppl.profile_id+'/act/reapply'));
                }
              } else {
                button_cnt.add(createSimpleRedirectButton('Заявка на аккредитацию поставщика','company/edit/group/supplier/act/apply'));
              }
            } else {
              button_cnt.add(createSimpleRedirectButton('Заявка на аккредитацию поставщика','company/edit/group/supplier/act/apply'));
              button_cnt.add(createSimpleRedirectButton('Заявка на аккредитацию заказчика','company/edit/group/customer/act/apply'));
            }
            button_cnt.doLayout();
        }
      }
    });
    Application.components.ProfileWidget.superclass.initComponent.call(this);
  }
});
