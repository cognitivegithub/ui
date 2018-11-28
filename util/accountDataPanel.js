Ext.define('Application.components.accountDataPanel',{
  extend: 'Ext.panel.Panel',
  frame: false,
  border: true,
  initComponent: function() {
    var component = this;

    Ext.apply(this, {
      border: false,
      height: 84,
      listeners: {
        beforerender: function() {
          component.relayEvents(Main.app, ['update_account_info']);
          component.relayEvents(Main.app, ['deposit_changed']);
          component.relayEvents(Main.app, ['available_sum_changed']);
        },
        update_account_info: function(sum) {
          component.show_acc_panel(sum);
        },
        deposit_changed: function(contragent) {
          component.show_acc_panel(contragent.available_sum);
        },
        available_sum_changed: function(sum) {
          component.show_acc_panel(sum);
        }
      },
      show_acc_panel: function(sum) {
        if ( !isGuest()) {
          var accreds = [];
          if (Main.config.hide_accreditation_text){
              var accreds_text = '';
          }
          else {
              var accreds_text = 'Аккредитации нет';
          }
          var avail_sum = '';
          var dop_class = '';
          var company_name = '';
          if (isCustomerAccred()) {
            accreds.push('заказчика');
          }
          if (isSupplierAccred()) {
            accreds.push('заявителя');
          }
          if (isExpert()) {
            accreds.push('эксперта');
          }
          if (accreds.length>0 && !Main.config.hide_accreditation_text) {
            accreds_text = 'Аккредитация в качестве: ' + accreds.join(', ');
          }
          if ( isAdmin() ) {
            accreds_text = '';
            company_name = Main.siteTitle;
            dop_class = ' two_rows';
          } else if (isCustomer() && !isSupplier()) {
            accreds_text = '<div class="uib-info">' + accreds_text + '</div>';
            dop_class = ' three_rows';
            if (Main.contragent.short_name) {
              company_name = Main.contragent.short_name;
            } else {
              company_name = Main.contragent.full_name;
            }

          } else {
            accreds_text = '<div class="uib-info">' + accreds_text + '</div>';
            avail_sum = '<div class="uib-info">Свободных средств: ' + Ext.util.Format.formatPrice(sum) + ' руб.</div>';
            if (Main.contragent.short_name) {
              company_name = Main.contragent.short_name;
            } else {
              company_name = Main.contragent.full_name;
            }
          }

          if (component.items.length > 0) {
            component.removeAll();
          }
          
          if(isSupplierAccred() && Main.config.banner_edocument_show) {
            component.insert(0, {
              cls: 'topFieldSet user-tariff-box',
              border: false,
              frame: false,
              style: 'float:left; margin-right: 7px; margin-top: 0px; font-size: 10px; line-height:12px;'+((null==Main.contragent.tariff_id) ?'background-color: #cc0000; color: #fff; border:1px solid #e1cabe;':'background-color: #f5fdde; border:1px solid #e1e9c9;'),
              items: [
                {
                  border: false,
                  cls: 'tariffTxt uib-u-name',
                  style: 'font-size: 11px; ',
                  html: '<div style="text-align:center;">Электронный документооборот</div>'
                },
                {
                  border: false,
                  cls: 'tariffTxt uib-info',
                  style: 'font-size: 9px; ',
                  html: '<div style="text-align:left; line-height: 1em;">Ваши документы по торгам<br/>выставляются в электронном виде</div>'
                },
                {
                  xtype: 'button',
                  width: '100%',
                  style: 'margin-top: 3px; width: 98%;',
                  disabled: false,
                  text: 'Перейти к документам',
                  handler: function() {document.location.href=Main.config.banner_edocument_url;}
                }]
            });
          }

          if(isSupplierAccred() && Main.config.service_redirect && null!=Main.contragent.tariff_id) {
            component.insert(1, {
              cls: 'topFieldSet user-tariff-box',
              border: false,
              frame: false,
              style: 'float:left; margin-right: 7px; margin-top: 0px; font-size: 10px; line-height:12px;'+((null==Main.contragent.tariff_id) ?'background-color: #cc0000; color: #fff; border:1px solid #e1cabe;':'background-color: #f5fdde; border:1px solid #e1e9c9;'),
              items: [
                {
                  border: false,
                  cls: 'tariffTxt uib-u-name',
                  style: 'font-size: 11px',
                  html: '<div style="text-align:center;">Тарифный план '+Main.contragent.tariff_name+'</div>'
                },
                {
                  border: false,
                  cls: 'tariffTxt uib-u-name',
                  html: '<div style="text-align:center; margin: 1px 0px 2px">'+((null==Main.contragent.tariff_id) ? 'Выберите тарифный план':('Дата истечения: '+Ext.util.Format.localDateOnlyRenderer(Main.contragent.tariff_validity_period)))+'<br/></div>'
                }, {
                  xtype: 'button',
                  width: '100%',
                  style: 'margin-top: 3px; width: 98%;',
                  disabled: true,
                  text: ((null==Main.contragent.tariff_id) ? 'Выбрать тарифный план' : 'Продлить действие тарифа'),
                  handler: function() {document.location.href='/sync/ordertariff';}
                }]
            });
          }
          component.insert(2, {
            border: false,
            style: 'float:left;',
            cls: 'topFieldSet user-info-box' + dop_class,
            frame: false,
            items:[{
              border: false,
              cls:'tariffTxt',
              html: '<div class="uib-u-name">' + Main.user.full_name + '</div>'
                + '<div class="uib-info">' + (Main.config.veb_custom ? Main.user.departmentName : company_name) + '</div>'
                + (Main.config.veb_custom ? ('<div class="uib-info">' + Main.user.roleNameMaxId + '</div>') : accreds_text)
                + avail_sum
            }]
          });
          component.doLayout();
        } else {
          component.removeAll();
          component.doLayout();
        }
      }
    });

    Application.components.accountDataPanel.superclass.initComponent.call(this);
  }
});
