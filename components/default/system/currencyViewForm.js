Ext.define('Application.components.currencyViewForm', {
  extend: 'Ext.form.FormPanel',
  data: [],
  frame: true,
  bodyStyle: 'padding: 5px',
  autoHeight: true,
  initComponent: function () {
    var component = this;
    this.ids = {
      usd_label: Ext.id(),
      eur_label: Ext.id(),
      gbp_label: Ext.id(),
      usd_date: Ext.id(),
      eur_date: Ext.id(),
      gbp_date: Ext.id()
    };
    var close_caption = 'Закрыть';
    Ext.apply(component, {
      listeners: {
        beforerender: function () {
          var usdDate = Ext.getCmp(component.ids.usd_date);
          var eurDate = Ext.getCmp(component.ids.eur_date);
          var gbpDate = Ext.getCmp(component.ids.gbp_date);
          usdDate.setValue(new Date());
          eurDate.setValue(new Date());
          gbpDate.setValue(new Date());
          component.setCurrencyByDate(usdDate);
          component.setCurrencyByDate(eurDate);
          component.setCurrencyByDate(gbpDate);
        }
      },
      labelWidth: 200,
      width: 400,
      items: [
        {
          xtype: 'container',
          layout: 'column',
          cls: 'curr-row',
          items:[
            {
              xtype: 'label',
              width: 100,
              html: 'Валюта'
            },
            {
              xtype: 'label',
              width: 120,
              html: 'Дата'
            },
            {
              xtype: 'label',
              width: 158,
              html: 'Курс к рублю'
            }
          ]
        },
        {
          xtype: 'container',
          layout: 'column',
          cls: 'curr-row',
          items:[        
            {
              xtype: 'label',
              width: 100,
              html: 'USD'
            },
            {
              xtype: 'datefield',
              id: component.ids.usd_date,
              maxValue : new Date(),
              width: 120,
              format: 'd.m.Y',
              currencyName: 'USD',
              currencyLabelId: component.ids.usd_label,
              listeners: {
                select: function (comp) {
                  component.setCurrencyByDate(comp);
                }
              }
            },
            {
              xtype: 'label',
              id: component.ids.usd_label,
              width: 158,
              html: '60'
            }
          ]
        },
        {
          xtype: 'container',
          layout: 'column',
          cls: 'curr-row',
          items:[
            {
              xtype: 'label',
              width: 100,
              html: 'EUR'
            },
            {
              xtype: 'datefield',
              id: component.ids.eur_date,
              maxValue : new Date(),
              width: 120,
              format: 'd.m.Y',
              currencyName: 'EUR',
              currencyLabelId: component.ids.eur_label,
              listeners: {
                select: function (comp) {
                  component.setCurrencyByDate(comp);
                }
              }
            },
            {
              xtype: 'label',
              id: component.ids.eur_label,
              width: 158,
              html: '60'
            }
          ]
        },
        {
          xtype: 'container',
          layout: 'column',
          cls: 'curr-row',
          items:[
            {
              xtype: 'label',
              width: 100,
              html: 'GBP'
            },
            {
              xtype: 'datefield',
              id: component.ids.gbp_date,
              maxValue : new Date(),
              width: 120,
              format: 'd.m.Y',
              currencyName: 'GBP',
              currencyLabelId: component.ids.gbp_label,
              listeners: {
                select: function (comp) {
                  component.setCurrencyByDate(comp);
                }
              }
            },
            {
              xtype: 'label',
              id: component.ids.gbp_label,
              width: 158,
              html: '60'
            }
          ]
        }
      ],
      buttons: [
        {
          xtype: 'button',
          text: close_caption,
          handler: function () {
            history.back(NO_MAGIC_NUMBER_ONE);
          }
        }
      ],
      setCurrencyByDate: function (obj) {
        var fixedDate = obj.getValue();
        fixedDate.setHours(NO_MAGIC_NUMBER_LAST_HOUR, NO_MAGIC_NUMBER_LAST_MINUTE, NO_MAGIC_NUMBER_LAST_SECOND);
        var params = {
          currency: obj.currencyName,
          date: fixedDate
        };
        RPC_po.Reference.loadCurrencyRatesByDate(params, function(result) {
          if (result.success) {
            Ext.getCmp(obj.currencyLabelId).setText(parseFloat(result.currency_rate).toFixed(NO_MAGIC_NUMBER_TWO));
          } else {
            Ext.Msg.alert('Ошибка', 'Не удалось получить курс за выбранный день и предыдущие дни.');
          }
        });
      }
    });
    Application.components.currencyViewForm.superclass.initComponent.call(this);
  }
});
